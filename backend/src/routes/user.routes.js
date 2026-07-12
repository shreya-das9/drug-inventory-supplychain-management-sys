import express from "express";
import mongoose from "mongoose";
import User from "../models/UserModel.js";
import ShipmentModel from "../models/ShipmentModel.js";
import ComplianceModel from "../models/ComplianceModel.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { createRetailerOrderWorkflow } from "../services/retailerOrderWorkflow.service.js";
import OrderModel from "../models/OrderModel.js";
import InventoryModel from "../models/Inventory.js";
import DrugModel from "../models/Drug.js";

const router = express.Router();

router.use(verifyToken);

router.get("/me", async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select("-password -resetToken -resetTokenExpiry");
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, "Current user fetched successfully", user);
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch current user", error.message);
  }
});

router.patch("/me", async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const allowedFields = ["name", "email", "password"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    Object.assign(user, updates);
    await user.save();

    return successResponse(res, 200, "Profile updated successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to update profile", error.message);
  }
});

router.get("/", isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password -resetToken -resetTokenExpiry").sort({ createdAt: -1 });
    return successResponse(res, 200, "Users fetched successfully", users);
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch users", error.message);
  }
});

router.get("/roles", (req, res) => {
  return successResponse(res, 200, "Roles fetched successfully", ["ADMIN", "WAREHOUSE", "RETAILER", "USER"]);
});

router.post("/retailer/orders", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();
    console.info('[RETAILER_ENDPOINT_CALLED]', { endpoint: '/retailer/orders', userId: req.user?._id || req.user?.id, rawRole: req.user?.role, normalizedRole: role, roleCheck: role === "RETAILER" });

    if (role !== "RETAILER") {
      console.warn('[RETAILER_ROLE_CHECK_FAILED]', { endpoint: '/retailer/orders', userId: req.user?._id || req.user?.id, role, expected: 'RETAILER' });
      return errorResponse(res, 403, "Access denied. Retailer role required.");
    }
    console.info('[RETAILER_ROLE_CHECK_PASSED]', { endpoint: '/retailer/orders', userId: req.user?._id || req.user?.id, role });

    const { medicine, quantity, qty, totalAmount, purchaseOrderNumber } = req.body;
    const result = await createRetailerOrderWorkflow({
      user: req.user,
      medicine,
      quantity: quantity ?? qty,
      totalAmount,
      purchaseOrderNumber,
    });

    const statusCode = result.workflow.inventoryAvailable ? 201 : 202;
    return successResponse(res, statusCode, "Retailer order created successfully", result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, statusCode, error.message || "Failed to create retailer order");
  }
});

// Get retailer's orders
router.get("/retailer/orders", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();
    console.info('[RETAILER_ENDPOINT_CALLED]', { endpoint: '/retailer/orders', userId: req.user?._id || req.user?.id, rawRole: req.user?.role, normalizedRole: role, roleCheck: role === "RETAILER" });

    if (role !== "RETAILER") {
      console.warn('[RETAILER_ROLE_CHECK_FAILED]', { endpoint: '/retailer/orders', userId: req.user?._id || req.user?.id, role, expected: 'RETAILER' });
      return errorResponse(res, 403, "Access denied. Retailer role required.");
    }
    console.info('[RETAILER_ROLE_CHECK_PASSED]', { endpoint: '/retailer/orders', userId: req.user?._id || req.user?.id, role });

    const { page = 1, limit = 10, status = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const userId = req.user._id || req.user.id;
    const query = { user: userId };
    if (status) {
      query.status = status.toLowerCase();
    }

    const orders = await OrderModel.find(query)
      .populate("items.drug", "name genericName manufacturer")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await OrderModel.countDocuments(query);

    return successResponse(res, 200, "Retailer orders fetched successfully", {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get retailer orders error:", error);
    return errorResponse(res, 500, "Failed to fetch retailer orders", error.message);
  }
});

// Cancel retailer order
router.patch("/retailer/orders/:id/cancel", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();
    console.info('[RETAILER_ENDPOINT_CALLED]', { endpoint: '/retailer/orders/:id/cancel', userId: req.user?._id || req.user?.id, rawRole: req.user?.role, normalizedRole: role, roleCheck: role === "RETAILER" });

    if (role !== "RETAILER") {
      console.warn('[RETAILER_ROLE_CHECK_FAILED]', { endpoint: '/retailer/orders/:id/cancel', userId: req.user?._id || req.user?.id, role, expected: 'RETAILER' });
      return errorResponse(res, 403, "Access denied. Retailer role required.");
    }
    console.info('[RETAILER_ROLE_CHECK_PASSED]', { endpoint: '/retailer/orders/:id/cancel', userId: req.user?._id || req.user?.id, role });

    const { id } = req.params;
    const { reason } = req.body;

    const order = await OrderModel.findById(id);

    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    // Verify order belongs to retailer
    const userId = req.user._id || req.user.id;
    if (order.user.toString() !== String(userId)) {
      return errorResponse(res, 403, "You can only cancel your own orders");
    }

    // Check if order can be cancelled
    if (["completed", "cancelled", "delivered"].includes(order.status)) {
      return errorResponse(res, 400, `Cannot cancel ${order.status} order`);
    }

    // Update order status
    order.status = "cancelled";
    if (reason) {
      order.cancellationReason = reason;
      order.notes = reason;
    }

    // Add to status history
    order.statusHistory.push({
      status: "cancelled",
      timestamp: new Date(),
      updatedBy: req.user._id || req.user.id,
      notes: reason || "Order cancelled by retailer",
    });

    await order.save();

    return successResponse(res, 200, "Order cancelled successfully", order);
  } catch (error) {
    console.error("Cancel retailer order error:", error);
    return errorResponse(res, 500, "Failed to cancel order", error.message);
  }
});

// Delete retailer order (only pending/cancelled)
router.delete("/retailer/orders/:id", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();
    console.info('[RETAILER_ENDPOINT_CALLED]', { endpoint: '/retailer/orders/:id', userId: req.user?._id || req.user?.id, rawRole: req.user?.role, normalizedRole: role, roleCheck: role === "RETAILER" });

    if (role !== "RETAILER") {
      console.warn('[RETAILER_ROLE_CHECK_FAILED]', { endpoint: '/retailer/orders/:id', userId: req.user?._id || req.user?.id, role, expected: 'RETAILER' });
      return errorResponse(res, 403, "Access denied. Retailer role required.");
    }
    console.info('[RETAILER_ROLE_CHECK_PASSED]', { endpoint: '/retailer/orders/:id', userId: req.user?._id || req.user?.id, role });

    const { id } = req.params;

    const order = await OrderModel.findById(id);

    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    // Verify order belongs to retailer
    const userId = req.user._id || req.user.id;
    if (order.user.toString() !== String(userId)) {
      return errorResponse(res, 403, "You can only delete your own orders");
    }

    // Only allow deletion of pending or cancelled orders
    if (!["pending", "cancelled"].includes(order.status)) {
      return errorResponse(res, 400, `Can only delete pending or cancelled orders. Current status: ${order.status}`);
    }

    await order.deleteOne();

    return successResponse(res, 200, "Order deleted successfully");
  } catch (error) {
    console.error("Delete retailer order error:", error);
    return errorResponse(res, 500, "Failed to delete order", error.message);
  }
});

// Get retailer shipments
router.get("/retailer/shipments", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();
    console.info('[RETAILER_ENDPOINT_CALLED]', { endpoint: '/retailer/shipments', userId: req.user?._id || req.user?.id, rawRole: req.user?.role, normalizedRole: role, roleCheck: role === "RETAILER" });
    if (role !== "RETAILER") {
      console.warn('[RETAILER_ROLE_CHECK_FAILED]', { endpoint: '/retailer/shipments', userId: req.user?._id || req.user?.id, role, expected: 'RETAILER' });
      return errorResponse(res, 403, "Access denied. Retailer role required.");
    }
    console.info('[RETAILER_ROLE_CHECK_PASSED]', { endpoint: '/retailer/shipments', userId: req.user?._id || req.user?.id, role });

    const userId = req.user._id || req.user.id;
    const retailerOrders = await OrderModel.find({ user: userId }).select("_id");
    const orderIds = retailerOrders.map((order) => order._id);

    const shipments = await ShipmentModel.find({ order: { $in: orderIds } })
      .populate("order", "orderNumber user status")
      .populate("items.drug", "name genericName")
      .sort({ createdAt: -1 });

    return successResponse(res, 200, "Retailer shipments fetched successfully", { shipments });
  } catch (error) {
    console.error("Get retailer shipments error:", error);
    return errorResponse(res, 500, "Failed to fetch retailer shipments", error.message);
  }
});

// Get retailer shipment details
router.get("/retailer/shipments/:id", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();
    console.info('[RETAILER_ENDPOINT_CALLED]', { endpoint: '/retailer/shipments/:id', userId: req.user?._id || req.user?.id, rawRole: req.user?.role, normalizedRole: role, roleCheck: role === "RETAILER" });
    if (role !== "RETAILER") {
      console.warn('[RETAILER_ROLE_CHECK_FAILED]', { endpoint: '/retailer/shipments/:id', userId: req.user?._id || req.user?.id, role, expected: 'RETAILER' });
      return errorResponse(res, 403, "Access denied. Retailer role required.");
    }
    console.info('[RETAILER_ROLE_CHECK_PASSED]', { endpoint: '/retailer/shipments/:id', userId: req.user?._id || req.user?.id, role });

    const { id } = req.params;
    const shipment = await ShipmentModel.findById(id)
      .populate("order", "orderNumber user status")
      .populate("items.drug", "name genericName manufacturer")
      .populate("supplier", "name contactPerson email phone")
      .populate("timeline.operator", "name email role")
      .populate("statusHistory.updatedBy", "name email role");

    if (!shipment) {
      return errorResponse(res, 404, "Shipment not found");
    }

    const userId = req.user._id || req.user.id;
    if (!shipment.order || String(shipment.order.user) !== String(userId)) {
      return errorResponse(res, 403, "You can only view your own shipments.");
    }

    return successResponse(res, 200, "Shipment details fetched successfully", { shipment });
  } catch (error) {
    console.error("Get retailer shipment details error:", error);
    return errorResponse(res, 500, "Failed to fetch shipment details", error.message);
  }
});

router.post("/simulation/demo-flow", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();
    const allowedRoles = new Set(["RETAILER", "WAREHOUSE", "WAREHOUSE_ADMIN", "ADMIN"]);
    if (!allowedRoles.has(role)) {
      return errorResponse(res, 403, "Access denied. Retailer or warehouse/admin role required.");
    }

    const userId = req.user._id || req.user.id;
    const medicineName = req.body?.medicine || "Demo Antibiotic";
    const quantity = Number(req.body?.quantity ?? 24);
    const totalAmount = Number(req.body?.totalAmount ?? 1250);
    const purchaseOrderNumber = req.body?.purchaseOrderNumber || `SIM-${Date.now()}`;

    let drug = await DrugModel.findOne({ name: { $regex: new RegExp(`^${medicineName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } });
    if (!drug) {
      drug = await DrugModel.create({
        name: medicineName,
        batchNumber: `SIM-${Date.now()}`,
        price: totalAmount / Math.max(quantity, 1),
        description: "Auto-created for simulation demo flow",
        createdBy: userId,
      });
    }

    const existingInventory = await InventoryModel.findOne({ drug: drug._id });
    if (existingInventory) {
      existingInventory.quantity = Math.max(Number(existingInventory.quantity || 0) + Math.max(quantity, 24), quantity + 24);
      existingInventory.warehouseLocation = existingInventory.warehouseLocation || "Zone A";
      await existingInventory.save();
    } else {
      await InventoryModel.create({
        drug: drug._id,
        quantity: Math.max(60, quantity + 24),
        warehouseLocation: "Zone A",
        threshold: 10,
      });
    }

    const workflowResult = await createRetailerOrderWorkflow({
      user: req.user,
      medicine: medicineName,
      quantity,
      totalAmount,
      purchaseOrderNumber,
    });

    const order = await OrderModel.findById(workflowResult.order._id);
    if (!order) {
      throw new Error("Simulation order was not persisted");
    }

    const shipment = await ShipmentModel.create({
      trackingNumber: `SIM-${Date.now()}`,
      supplier: new mongoose.Types.ObjectId(),
      order: order._id,
      items: [{ drug: drug._id, quantity, unitPrice: totalAmount / Math.max(quantity, 1), batchNumber: drug.batchNumber, expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) }],
      totalAmount,
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "processing",
      currentCheckpoint: "warehouse_received",
      currentResponsibleOrganization: "warehouse",
      createdBy: userId,
      statusHistory: [{ status: "processing", timestamp: new Date(), updatedBy: userId, notes: "Demo flow created shipment" }],
    });

    await ComplianceModel.create({
      title: `Simulation review for ${order.orderNumber}`,
      description: "Demo workflow created a persisted order and shipment for frontend walkthroughs.",
      findings: ["Simulation mode enabled"],
      recommendations: ["Review order and shipment status in dashboards"],
      severity: "medium",
      status: "in_review",
      relatedOrder: order._id,
      relatedShipment: shipment._id,
      metadata: { source: "simulation-demo-flow" },
      createdBy: userId,
      updatedBy: userId,
    });

    return successResponse(res, 201, "Simulation demo flow created", { orderId: order._id, shipmentId: shipment._id });
  } catch (error) {
    console.error("Simulation demo flow error:", error);
    return errorResponse(res, 500, "Failed to create simulation demo flow", error.message);
  }
});

router.post("/simulation/reset", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();
    const allowedRoles = new Set(["RETAILER", "WAREHOUSE", "WAREHOUSE_ADMIN", "ADMIN"]);
    if (!allowedRoles.has(role)) {
      return errorResponse(res, 403, "Access denied. Retailer or warehouse/admin role required.");
    }

    const userId = req.user._id || req.user.id;
    const orders = await OrderModel.find({ user: userId, $or: [{ notes: /simulation/i }, { purchaseOrderNumber: /^SIM-/i }] });
    const orderIds = orders.map((order) => order._id);

    await Promise.all([
      ShipmentModel.deleteMany({ order: { $in: orderIds } }),
      ComplianceModel.deleteMany({ relatedOrder: { $in: orderIds } }),
      OrderModel.deleteMany({ _id: { $in: orderIds } }),
    ]);

    return successResponse(res, 200, "Simulation demo data reset", { deletedOrders: orderIds.length });
  } catch (error) {
    console.error("Simulation reset error:", error);
    return errorResponse(res, 500, "Failed to reset simulation demo data", error.message);
  }
});

// Confirm final delivery for a shipment
router.patch("/retailer/shipments/:id/confirm", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();
    console.info('[RETAILER_ENDPOINT_CALLED]', { endpoint: '/retailer/shipments/:id/confirm', userId: req.user?._id || req.user?.id, rawRole: req.user?.role, normalizedRole: role, roleCheck: role === "RETAILER" });
    if (role !== "RETAILER") {
      console.warn('[RETAILER_ROLE_CHECK_FAILED]', { endpoint: '/retailer/shipments/:id/confirm', userId: req.user?._id || req.user?.id, role, expected: 'RETAILER' });
      return errorResponse(res, 403, "Access denied. Retailer role required.");
    }
    console.info('[RETAILER_ROLE_CHECK_PASSED]', { endpoint: '/retailer/shipments/:id/confirm', userId: req.user?._id || req.user?.id, role });

    const { id } = req.params;
    const shipment = await ShipmentModel.findById(id).populate({ path: "order", select: "user orderNumber status" });

    if (!shipment) {
      return errorResponse(res, 404, "Shipment not found");
    }

    const userId = req.user._id || req.user.id;
    if (!shipment.order || String(shipment.order.user) !== String(userId)) {
      return errorResponse(res, 403, "You can only confirm deliveries for your own shipments.");
    }

    if (["delivered", "cancelled", "quarantined"].includes(shipment.status)) {
      return errorResponse(res, 400, `Cannot confirm a shipment that is already ${shipment.status}.`);
    }

    shipment.status = "delivered";
    shipment.actualDeliveryDate = new Date();
    shipment.statusHistory.push({
      status: "delivered",
      timestamp: new Date(),
      updatedBy: req.user._id || req.user.id,
      notes: "Retailer confirmed final delivery"
    });

    await shipment.save();

    if (shipment.order) {
      const order = await OrderModel.findById(shipment.order._id);
      if (order) {
        order.status = "delivered";
        order.deliveredAt = new Date();
        order.statusHistory.push({
          status: "delivered",
          timestamp: new Date(),
          updatedBy: req.user._id || req.user.id,
          notes: "Final delivery confirmed by retailer"
        });
        await order.save();
      }
    }

    return successResponse(res, 200, "Shipment confirmed as delivered", { shipment });
  } catch (error) {
    console.error("Confirm shipment delivery error:", error);
    return errorResponse(res, 500, "Failed to confirm delivery", error.message);
  }
});

// Quarantine a shipment and create a compliance report
router.patch("/retailer/shipments/:id/quarantine", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();
    console.info('[RETAILER_ENDPOINT_CALLED]', { endpoint: '/retailer/shipments/:id/quarantine', userId: req.user?._id || req.user?.id, rawRole: req.user?.role, normalizedRole: role, roleCheck: role === "RETAILER" });
    if (role !== "RETAILER") {
      console.warn('[RETAILER_ROLE_CHECK_FAILED]', { endpoint: '/retailer/shipments/:id/quarantine', userId: req.user?._id || req.user?.id, role, expected: 'RETAILER' });
      return errorResponse(res, 403, "Access denied. Retailer role required.");
    }
    console.info('[RETAILER_ROLE_CHECK_PASSED]', { endpoint: '/retailer/shipments/:id/quarantine', userId: req.user?._id || req.user?.id, role });

    const { id } = req.params;
    const { reason } = req.body;
    const shipment = await ShipmentModel.findById(id).populate({ path: "order", select: "user orderNumber status" });

    if (!shipment) {
      return errorResponse(res, 404, "Shipment not found");
    }

    const userId = req.user._id || req.user.id;
    if (!shipment.order || String(shipment.order.user) !== String(userId)) {
      return errorResponse(res, 403, "You can only quarantine your own shipments.");
    }

    if (["delivered", "cancelled", "quarantined"].includes(shipment.status)) {
      return errorResponse(res, 400, `Cannot quarantine a shipment that is already ${shipment.status}.`);
    }

    shipment.status = "quarantined";
    shipment.statusHistory.push({
      status: "quarantined",
      timestamp: new Date(),
      updatedBy: req.user._id || req.user.id,
      notes: reason || "Shipment quarantined by retailer"
    });

    await shipment.save();

    const report = await Compliance.create({
      title: `Retailer quarantined shipment ${shipment.trackingNumber}`,
      description: `Shipment quarantined by retailer${reason ? ` due to: ${reason}` : ""}.`,
      findings: [reason || "Retailer quarantine"],
      recommendations: [
        "Inspect the shipment immediately",
        "Review BLE scan history and shipment routing",
        "Contact warehouse and compliance teams"
      ],
      severity: "high",
      status: "open",
      relatedShipment: shipment._id,
      relatedOrder: shipment.order?._id || null,
      metadata: {
        quarantinedBy: req.user._id || null,
        reason: reason || null
      },
      createdBy: req.user._id || req.user.id,
      updatedBy: req.user._id || req.user.id
    });

    try {
      const recipientEmails = await resolveWorkflowRecipientEmails({
        shipment,
        order: shipment.order || null,
        orderId: shipment.order || shipment._id,
        includeRetailer: false,
        includeWarehouse: true,
        includeAdmin: true,
        eventType: 'shipment_quarantined'
      });

      if (recipientEmails.length) {
        await sendWorkflowEventNotifications({
          recipientEmails,
          eventType: 'shipment_quarantined',
          orderNumber: shipment.order?.orderNumber || shipment.trackingNumber,
          medicine: shipment.items?.[0]?.drug?.name || 'BLE package',
          quantity: shipment.items?.[0]?.quantity || 0,
          totalAmount: shipment.totalAmount || 0,
          status: 'QUARANTINED',
          nextStep: `Shipment ${shipment.trackingNumber} was quarantined by the retailer. Please investigate immediately.`
        });
      }
    } catch (notifyErr) {
      console.warn('Quarantine notification skipped:', notifyErr.message || notifyErr);
    }

    return successResponse(res, 200, "Shipment quarantined and compliance report created", { shipment, report });
  } catch (error) {
    console.error("Quarantine shipment error:", error);
    return errorResponse(res, 500, "Failed to quarantine shipment", error.message);
  }
});

export default router;