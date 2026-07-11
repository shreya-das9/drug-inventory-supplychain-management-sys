import BLERegistry from '../models/BLERegistryModel.js';
import ShipmentModel from '../models/ShipmentModel.js';
import OrderModel from '../models/OrderModel.js';
import Drug from '../models/Drug.js'; // ensure Drug schema is registered for populate()
import SupplierModel from '../models/SupplierModel.js';
import User from '../models/UserModel.js';
import { sendOrderWorkflowNotification } from '../services/notification.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createAuditEntry } from '../services/audit.service.js';

// Helper to mask BLE id for UI-safe responses (show only last 4 chars)
const maskBleId = (bleId) => {
  if (!bleId || typeof bleId !== 'string') return null;
  const len = bleId.length;
  if (len <= 6) return `***${bleId.slice(-3)}`;
  return `****${bleId.slice(-4)}`;
};

export const allocateBleToShipment = async (req, res) => {
  try {
    const { shipmentId, orderId } = req.body || {};

    if (!shipmentId && !orderId) {
      return errorResponse(res, 400, 'shipmentId or orderId is required');
    }

    let shipment = shipmentId
      ? await ShipmentModel.findById(shipmentId)
      : await ShipmentModel.findOne({ order: orderId });

    const order = orderId
      ? await OrderModel.findById(orderId).populate({ path: 'items.drug', select: 'supplier' })
      : null;
    if (!shipment && orderId && !order) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (!shipment && order) {
      // If the order does not have an explicit supplier, infer it from the ordered drugs.
      await order.populate({ path: 'items.drug', select: 'supplier' });

      const supplierCandidates = order.items
        .map((item) => item.drug?.supplier)
        .filter((supplierId) => supplierId)
        .map((supplierId) => String(supplierId));

      const uniqueSupplierIds = [...new Set(supplierCandidates)];
      const resolvedSupplier = order.supplier || (uniqueSupplierIds.length === 1 ? uniqueSupplierIds[0] : null);

      if (!resolvedSupplier) {
        return errorResponse(
          res,
          400,
          'Supplier information is required to create a shipment from a confirmed order. Please ensure the order is linked to a supplier or all items belong to the same supplier.'
        );
      }

      const supplierDoc = await SupplierModel.findById(resolvedSupplier);
      if (!supplierDoc) {
        return errorResponse(res, 404, 'Resolved supplier not found for order allocation');
      }

      shipment = await ShipmentModel.create({
        order: order._id,
        supplier: supplierDoc._id,
        items: order.items.map((item) => ({
          drug: item.drug._id || item.drug,
          quantity: item.quantity,
          unitPrice: item.price,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate
        })),
        totalAmount: order.totalAmount,
        expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        shippingMethod: 'ground',
        destination: order.shippingAddress || {},
        statusHistory: [{
          status: 'created',
          updatedBy: req.user?._id || req.user?.id || null,
          notes: 'Shipment created from order allocation',
          timestamp: new Date()
        }],
        createdBy: req.user?._id || req.user?.id || null
      });
    }

    if (!shipment) {
      return errorResponse(res, 404, 'Shipment not found');
    }

    // Prevent duplicate allocation for the same shipment
    if (shipment.bleId) {
      return errorResponse(res, 400, 'Shipment already has a BLE package assigned');
    }

    // Only allow allocation to confirmed shipments:
    // If the shipment is linked to an order, that order must be `confirmed`.
    if (shipment.order) {
      const linkedOrder = await OrderModel.findById(shipment.order).select('status');
      if (!linkedOrder) return errorResponse(res, 404, 'Linked order not found');
      if ((linkedOrder.status || '').toLowerCase() !== 'confirmed') {
        return errorResponse(res, 400, 'BLE can only be allocated to confirmed orders/shipments');
      }
    }

    // Atomically find one UNUSED BLE and mark it ACTIVE to avoid race conditions
    const bleRegistry = await BLERegistry.findOneAndUpdate(
      { status: 'UNUSED' },
      { $set: { status: 'ACTIVE', issuedBy: req.user?._id || req.user?.id || null, lastKnownStage: 'warehouse' } },
      { new: true }
    );

    if (!bleRegistry) {
      return errorResponse(res, 409, 'No unused BLE packages available');
    }

    // Persist BLE assignment on shipment (and order if linked)
    shipment.bleId = bleRegistry.bleId;
    shipment.statusHistory.push({
      status: 'ble_assigned',
      updatedBy: req.user?._id || req.user?.id || null,
      notes: `BLE ${maskBleId(bleRegistry.bleId)} assigned to shipment`,
      timestamp: new Date()
    });
    await shipment.save();

    await createAuditEntry({
      eventType: 'ble_package_allocated',
      shipment,
      order,
      blePackageId: bleRegistry.bleId,
      user: req.user?._id || req.user?.id || null,
      organization: 'warehouse',
      previousStatus: shipment.status,
      newStatus: shipment.status,
      description: 'BLE package allocated to shipment.',
      metadata: { bleId: bleRegistry.bleId, maskedBleId: maskBleId(bleRegistry.bleId) }
    });

    if (order) {
      order.bleId = bleRegistry.bleId;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({ status: 'ble_assigned', timestamp: new Date(), updatedBy: req.user?._id || req.user?.id || null, notes: `BLE assigned to order` });
      await order.save();
    }

    const admins = await User.find({ role: { $in: ['ADMIN'] } }).select('email name');
    const notificationTasks = admins
      .filter((admin) => admin.email)
      .map((admin) => sendOrderWorkflowNotification({
        recipientEmail: admin.email,
        orderNumber: shipment.order?.orderNumber || shipment.trackingNumber || 'Unknown',
        medicine: shipment.items?.[0]?.drug?.name || 'Shipment items',
        quantity: shipment.items?.[0]?.quantity || 0,
        totalAmount: shipment.totalAmount || 0,
        status: 'BLE_ASSIGNED',
        nextStep: `BLE package ${maskBleId(bleRegistry.bleId)} assigned to shipment ${shipment.trackingNumber}`
      }));
    await Promise.allSettled(notificationTasks);

    // Return masked BLE id to keep raw BLE identifiers hidden by default
    const resp = {
      maskedBleId: maskBleId(bleRegistry.bleId),
      shipmentId: shipment._id,
      trackingNumber: shipment.trackingNumber
    };

    // If the requester is a warehouse/admin user, include the actual BLE id
    const userRole = (req.user?.role || '').toString().toLowerCase();
    if (userRole === 'warehouse_admin' || userRole === 'admin' || userRole === 'warehouse') {
      resp.bleId = bleRegistry.bleId;
    }

    return successResponse(res, 200, 'BLE package allocated to shipment', resp);
  } catch (error) {
    console.error('BLE allocation error:', error);
    return errorResponse(res, 500, 'Failed to allocate BLE package', error.message);
  }
};
