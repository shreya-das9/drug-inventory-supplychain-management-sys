import { verifySecureScan } from '../services/ble.service.js';
import { sendBleAlertEmail } from '../services/email.service.js';
import { sendOrderWorkflowNotification } from '../services/notification.service.js';
import Compliance from '../models/ComplianceModel.js';
import ShipmentModel from '../models/ShipmentModel.js';
import OrderModel from '../models/OrderModel.js';
import { successResponse, errorResponse } from '../utils/response.js';

const PLATFORM_STAGE_TO_SHIPMENT_STATUS = {
  manufacturer: 'pending',
  distributor: 'processing',
  warehouse: 'shipped',
  pharmacy: 'in_transit',
  customer: 'delivered'
};

const createComplianceFromScan = async ({ scanResult, shipment, order, scannedBy }) => {
  const reportData = {
    title: `BLE Scan Alert for ${scanResult.bleId}`,
    description: `The BLE scan generated alerts: ${scanResult.alerts.join(', ')}`,
    findings: scanResult.alerts,
    recommendations: [
      'Inspect the package immediately',
      'Review BLE details and shipment route',
      'Notify operations and quality teams'
    ],
    severity: scanResult.verificationStatus === 'BLOCKED' ? 'critical' : 'high',
    status: 'open',
    relatedShipment: shipment?._id || null,
    relatedOrder: order?._id || null,
    relatedScanlog: scanResult.scanId || null,
    metadata: {
      stage: scanResult.stage || scanResult.flow?.details || null,
      transitDelay: scanResult.transitDelay?.details || null,
      geoTemporal: scanResult.geoTemporal?.details || null,
      verificationStatus: scanResult.verificationStatus
    },
    createdBy: scannedBy || null,
    updatedBy: scannedBy || null
  };

  return await Compliance.create(reportData);
};

const updateShipmentAndOrderStatus = async ({ scanResult, shipment, order }) => {
  const nextStatus = scanResult.stage ? PLATFORM_STAGE_TO_SHIPMENT_STATUS[scanResult.stage] : null;

  if (shipment && scanResult.verified && nextStatus) {
    const normalizedStatus = nextStatus.toLowerCase();
    if (['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled'].includes(normalizedStatus)) {
      shipment.status = normalizedStatus;
      if (normalizedStatus === 'delivered') {
        shipment.actualDeliveryDate = new Date();
      }
      shipment.statusHistory.push({
        status: normalizedStatus,
        timestamp: new Date(),
        updatedBy: null,
        notes: `Updated via BLE scan (${scanResult.verificationStatus})`
      });
      await shipment.save();
    }
  }

  if (order && scanResult.verified) {
    const orderStatus = scanResult.stage === 'customer' ? 'delivered' : scanResult.stage === 'warehouse' ? 'shipped' : null;
    if (orderStatus && ['pending', 'approved', 'processing', 'confirmed', 'shipped', 'delivered'].includes(orderStatus)) {
      order.status = orderStatus;
      if (orderStatus === 'delivered') {
        order.deliveredAt = new Date();
      }
      order.statusHistory.push({
        status: orderStatus,
        timestamp: new Date(),
        updatedBy: null,
        notes: `Updated by BLE scan ingestion`
      });
      await order.save();
    }
  }
};

const sendRetailerScanNotification = async ({ scanResult, shipment, order }) => {
  const recipientEmail = order?.createdBy?.email || shipment?.createdBy?.email || shipment?.order?.createdBy?.email || process.env.BLE_ALERT_EMAIL || process.env.EMAIL_USER;
  if (!recipientEmail) return;

  const orderNumber = order?.orderNumber || shipment?.order?.orderNumber || shipment?.trackingNumber || 'Unknown';
  const item = order?.items?.[0] || shipment?.items?.[0] || {};
  const stageLabel = scanResult.stage ? scanResult.stage.toUpperCase() : 'UNKNOWN';
  const verificationLabel = scanResult.verificationStatus || 'UNKNOWN';
  const nextStep = scanResult.verified
    ? `BLE scan at ${stageLabel} verified. Shipment status updated.`
    : `BLE scan at ${stageLabel} detected an issue. Please inspect the shipment immediately.`;

  await sendOrderWorkflowNotification({
    recipientEmail,
    orderNumber,
    medicine: item.drug?.name || 'BLE package',
    quantity: item.quantity || 0,
    totalAmount: order?.totalAmount || shipment?.totalAmount || 0,
    status: `BLE_SCAN_${verificationLabel}`,
    nextStep
  });
};

export const ingestBleScan = async (req, res) => {
  try {
    const {
      bleId,
      challenge,
      signature,
      stage,
      location = {},
      trafficCondition,
      delayReason,
      timestamp,
      shipmentId,
      orderId
    } = req.body || {};

    const scanResult = await verifySecureScan({
      bleId,
      challenge,
      signature,
      stage,
      location,
      trafficCondition,
      delayReason,
      timestamp,
      scannedBy: req.user?._id || req.user?.id || null
    });

    const shipment = shipmentId
      ? await ShipmentModel.findById(shipmentId)
          .populate('createdBy', 'email name')
          .populate({ path: 'order', populate: { path: 'createdBy', select: 'email name' } })
      : null;
    const order = orderId ? await OrderModel.findById(orderId).populate('createdBy', 'email name') : null;

    if (!scanResult.verified || (scanResult.alerts && scanResult.alerts.length > 0)) {
      await createComplianceFromScan({ scanResult, shipment, order, scannedBy: req.user?._id || req.user?.id || null });

      if (scanResult.alerts?.length) {
        await sendBleAlertEmail({ tracking: { batchId: bleId, deviceId: bleId, status: scanResult.verificationStatus, temperature: null, timestamp: new Date() } });
      }
    }

    if (scanResult.verified) {
      await updateShipmentAndOrderStatus({ scanResult, shipment, order });
    }

    await sendRetailerScanNotification({ scanResult, shipment, order });

    return successResponse(res, scanResult.verified ? 200 : 202, 'BLE scan ingested', scanResult);
  } catch (error) {
    console.error('BLE scan ingestion error:', error);
    return errorResponse(res, 400, error.message);
  }
};
