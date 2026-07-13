import Drug from "../models/Drug.js";
import Inventory from "../models/Inventory.js";
import Order from "../models/OrderModel.js";
import User from "../models/UserModel.js";
import {
  resolveWorkflowRecipientEmails,
  sendWorkflowEventNotifications,
} from "./notification.service.js";

const escapeRegExp = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toTitleCase = (value) => String(value || "").charAt(0).toUpperCase() + String(value || "").slice(1);

const toClientOrder = (order) => ({
  _id: order._id,
  orderNumber: order.orderNumber,
  purchaseOrderNumber: order.purchaseOrderNumber,
  status: toTitleCase(order.status),
  totalAmount: order.totalAmount,
  date: order.createdAt,
});

export const createRetailerOrderWorkflow = async ({ user, medicine, quantity, totalAmount, purchaseOrderNumber }) => {
  const trimmedMedicine = String(medicine || "").trim();
  console.info('[SIMULATION_START]', { user: user?._id || user?.id, medicine, quantity, purchaseOrderNumber });
  const requestedQuantity = Number(quantity);

  if (!trimmedMedicine) {
    const error = new Error("Medicine name is required");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(requestedQuantity) || requestedQuantity < 1) {
    const error = new Error("Quantity must be at least 1");
    error.statusCode = 400;
    throw error;
  }

  let drug = await Drug.findOne({ name: { $regex: new RegExp(`^${escapeRegExp(trimmedMedicine)}$`, "i") } }).select("name batchNumber price description supplier");

  if (!drug) {
    drug = await Drug.create({
      name: trimmedMedicine,
      batchNumber: `REQ-${Date.now()}`,
      price: Number(totalAmount) > 0 ? Number(totalAmount) / requestedQuantity : 0,
      description: "Auto-created from retailer order request",
      createdBy: user._id,
    });
  }

  const inventory = await Inventory.findOne({ drug: drug._id }).populate("drug", "name batchNumber");
  const availableQuantity = Number(inventory?.quantity || 0);
  const inventoryAvailable = availableQuantity >= requestedQuantity;
  const unitPrice = Number(drug.price || 0);
  const computedTotal = Number.isFinite(Number(totalAmount)) && Number(totalAmount) > 0
    ? Number(totalAmount)
    : unitPrice * requestedQuantity;

  const orderStatus = inventoryAvailable ? "confirmed" : "pending";
  const workflowStatus = inventoryAvailable ? "CONFIRMED" : "SHORTAGE";
  const nextStep = inventoryAvailable
    ? "Warehouse checks inventory, allocates BLE package, and prepares dispatch."
    : "Notify retailer and admin of stock shortage.";

  const retailerUser = await User.findById(user?._id || user?.id).select("email name role");
  const retailerEmail = retailerUser?.email ? String(retailerUser.email).toLowerCase().trim() : (user?.email ? String(user.email).toLowerCase().trim() : null);

  if (!retailerEmail) {
    console.warn('[RETAILER_EMAIL_MISSING]', { userId: user?._id || user?.id, role: user?.role });
  }

  const order = await Order.create({
    user: user._id || user?.id,
    createdBy: user._id || user?.id,
    userEmail: retailerEmail,
    createdByEmail: retailerEmail,
    supplier: drug.supplier || null,
    orderNumber: purchaseOrderNumber?.startsWith("SIM-") ? purchaseOrderNumber : undefined,
    purchaseOrderNumber: purchaseOrderNumber || `PO-${Date.now()}`,
    items: [{
      drug: drug._id,
      quantity: requestedQuantity,
      price: unitPrice,
      subtotal: unitPrice * requestedQuantity,
    }],
    totalAmount: computedTotal,
    status: orderStatus,
    notes: inventoryAvailable
      ? "Retailer order received and queued for warehouse processing"
      : "Retailer order received but inventory is insufficient",
    statusHistory: [{
      status: orderStatus,
      timestamp: new Date(),
      updatedBy: user._id || user?.id,
      notes: inventoryAvailable
        ? "Retailer order created; warehouse notified"
        : "Retailer order created; stock shortage flagged",
    }],
  });

  console.info('[ORDER_CREATED]', { orderId: order._id, orderNumber: order.orderNumber || order.purchaseOrderNumber });
  console.info('[AUTHENTICATED_RETAILER]', { email: retailerUser?.email || user?.email || null, userId: retailerUser?._id || user?._id || null });
  await order.populate([
    { path: "items.drug", select: "name genericName manufacturer" },
    { path: "createdBy", select: "name email role" },
  ]);

  // Resolve recipients synchronously, trigger notifications asynchronously so the API response is not blocked
  const recipientEmails = await resolveWorkflowRecipientEmails({
    retailerUserId: retailerUser?._id || null,
    retailerUser: retailerUser || null,
    order,
    orderId: order._id,
    warehouseUserId: null,
    includeRetailer: false,
    includeWarehouse: true,
    includeAdmin: false,
    eventType: "order_created",
  });

  if (recipientEmails.length) {
    console.info('[NOTIFICATION_TRIGGERED]', { eventType: 'order_created', recipientEmails });
    // fire-and-forget: do not await email delivery to respond to the client promptly
    const notificationPromise = Promise.resolve().then(async () => {
      console.info('[EMAIL_ENTRY]', { eventType: 'order_created', recipientEmails });
      await sendWorkflowEventNotifications({
        recipientEmails,
        eventType: "order_created",
        orderNumber: order.orderNumber || order.purchaseOrderNumber,
        medicine: trimmedMedicine,
        quantity: requestedQuantity,
        totalAmount: computedTotal,
        status: workflowStatus,
        nextStep,
      });
    });

    notificationPromise.catch((err) => {
      console.error('[NOTIFICATION_ERROR]', err.stack || err);
      // Do not rethrow — fire-and-forget should not crash the request flow.
    });
  }

  console.info('[SIMULATION_RESPONSE_SENT]', { orderId: order._id });

  return {
    order: toClientOrder(order),
    workflow: {
      inventoryAvailable,
      workflowStatus,
      availableQuantity,
      requestedQuantity,
      nextStep,
    },
  };
};
