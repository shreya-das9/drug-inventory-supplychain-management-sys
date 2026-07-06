import BLERegistry from '../models/BLERegistryModel.js';
import ShipmentModel from '../models/ShipmentModel.js';
import OrderModel from '../models/OrderModel.js';
import User from '../models/UserModel.js';
import { sendOrderWorkflowNotification } from '../services/notification.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const allocateBleToShipment = async (req, res) => {
  try {
    const { shipmentId, orderId } = req.body || {};

    if (!shipmentId && !orderId) {
      return errorResponse(res, 400, 'shipmentId or orderId is required');
    }

    let shipment = shipmentId
      ? await ShipmentModel.findById(shipmentId)
      : await ShipmentModel.findOne({ order: orderId });

    const order = orderId ? await OrderModel.findById(orderId) : null;
    if (!shipment && orderId && !order) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (!shipment && order) {
      shipment = await ShipmentModel.create({
        order: order._id,
        supplier: order.supplier,
        items: order.items.map((item) => ({
          drug: item.drug,
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

    if (shipment.bleId) {
      return errorResponse(res, 400, 'Shipment already has a BLE package assigned');
    }

    const bleRegistry = await BLERegistry.findOne({ status: 'UNUSED' });
    if (!bleRegistry) {
      return errorResponse(res, 409, 'No unused BLE packages available');
    }

    bleRegistry.status = 'ACTIVE';
    bleRegistry.issuedBy = req.user?._id || req.user?.id || null;
    await bleRegistry.save();

    shipment.bleId = bleRegistry.bleId;
    shipment.statusHistory.push({
      status: 'ble_assigned',
      updatedBy: req.user?._id || req.user?.id || null,
      notes: `BLE ${bleRegistry.bleId} assigned to shipment`,
      timestamp: new Date()
    });
    await shipment.save();

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
        nextStep: `BLE package ${bleRegistry.bleId} assigned to shipment ${shipment.trackingNumber}`
      }));
    await Promise.allSettled(notificationTasks);

    return successResponse(res, 200, 'BLE package allocated to shipment', {
      bleId: bleRegistry.bleId,
      shipmentId: shipment._id,
      trackingNumber: shipment.trackingNumber
    });
  } catch (error) {
    console.error('BLE allocation error:', error);
    return errorResponse(res, 500, 'Failed to allocate BLE package', error.message);
  }
};
