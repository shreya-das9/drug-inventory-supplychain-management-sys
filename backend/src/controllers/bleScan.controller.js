import { verifySecureScan } from '../services/ble.service.js';
import { sendBleAlertEmail } from '../services/email.service.js';
import { resolveWorkflowRecipientEmails, sendWorkflowEventNotification, sendWorkflowEventNotifications } from '../services/notification.service.js';
import Compliance from '../models/ComplianceModel.js';
import ShipmentModel from '../models/ShipmentModel.js';
import OrderModel from '../models/OrderModel.js';
import UserModel from '../models/UserModel.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createAuditEntry } from '../services/audit.service.js';

const PLATFORM_STAGE_TO_SHIPMENT_STATUS = {
  manufacturer: 'pending',
  distributor: 'processing',
  warehouse: 'shipped',
  pharmacy: 'in_transit',
  customer: 'delivered'
};

const TRANSIT_DELAY_CONFIG = {
  warehouse: { dispatched: 120 },
  distributor: { regional_warehouse_verified: 300 },
  pharmacy: { retailer_verified: 240 },
  customer: { delivered: 0 }
};

const CHECKPOINT_PROGRESSION = {
  manufacturer: {
    expectedCurrentCheckpoint: 'ble_allocated',
    nextCheckpoint: 'package_verified',
    nextStatus: 'processing',
    organization: 'warehouse'
  },
  distributor: {
    expectedCurrentCheckpoint: 'package_verified',
    nextCheckpoint: 'dispatched',
    nextStatus: 'processing',
    organization: 'warehouse'
  },
  warehouse: {
    expectedCurrentCheckpoint: 'dispatched',
    nextCheckpoint: 'regional_warehouse_verified',
    nextStatus: 'shipped',
    organization: 'warehouse'
  },
  pharmacy: {
    expectedCurrentCheckpoint: 'regional_warehouse_verified',
    nextCheckpoint: 'retailer_verified',
    nextStatus: 'in_transit',
    organization: 'retailer'
  },
  customer: {
    expectedCurrentCheckpoint: 'retailer_verified',
    nextCheckpoint: 'delivered',
    nextStatus: 'delivered',
    organization: 'retailer'
  }
};

const CHECKPOINT_TO_STAGE = {
  ble_allocated: 'manufacturer',
  package_verified: 'distributor',
  dispatched: 'warehouse',
  regional_warehouse_verified: 'pharmacy',
  retailer_verified: 'customer'
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

  const compliance = await Compliance.create(reportData);

  await createAuditEntry({
    eventType: 'compliance_event',
    shipment,
    order,
    blePackageId: shipment?.bleId || scanResult?.bleId || null,
    user: scannedBy || null,
    organization: shipment?.currentResponsibleOrganization || null,
    previousStatus: shipment?.status || null,
    newStatus: shipment?.status || null,
    description: `Compliance event created for ${scanResult?.verificationStatus || 'scan'}.`,
    metadata: {
      complianceId: compliance._id.toString(),
      reason: 'scan_alert',
      verificationStatus: scanResult?.verificationStatus || null
    }
  });

  try {
    const recipientEmails = await resolveWorkflowRecipientEmails({
      retailerUserId: order?.createdBy || order?.user || shipment?.createdBy || shipment?.order?.createdBy || shipment?.order?.user || null,
      retailerUser: order?.createdBy?.email || shipment?.createdBy?.email || shipment?.order?.createdBy?.email
        ? { email: order?.createdBy?.email || shipment?.createdBy?.email || shipment?.order?.createdBy?.email }
        : null,
      includeRetailer: false,
      includeWarehouse: false,
      includeAdmin: true,
      eventType: 'compliance_event',
    });

    if (recipientEmails.length) {
      await sendWorkflowEventNotifications({
        recipientEmails,
        eventType: 'compliance_event',
        orderNumber: order?.orderNumber || shipment?.order?.orderNumber || 'Compliance',
        shipmentNumber: shipment?.trackingNumber || shipment?.bleId || 'Shipment',
        medicine: order?.items?.[0]?.drug?.name || shipment?.items?.[0]?.drug?.name || 'BLE package',
        quantity: order?.items?.[0]?.quantity || shipment?.items?.[0]?.quantity || 0,
        totalAmount: order?.totalAmount || shipment?.totalAmount || 0,
        status: 'COMPLIANCE_ALERT',
        nextStep: 'Investigate the compliance event and assign follow-up actions.',
        details: compliance.title || 'Compliance alert detected during shipment processing.'
      });
    }
  } catch (notificationError) {
    console.warn('Compliance notification skipped:', notificationError.message);
  }

  return compliance;
};

const resolveShipmentAndOrder = async ({ bleId, shipmentId, orderId }) => {
  let shipment = null;
  let order = null;

  if (shipmentId) {
    shipment = await ShipmentModel.findById(shipmentId)
      .populate('createdBy', 'email name')
      .populate({ path: 'order', populate: { path: 'createdBy', select: 'email name' } });
  } else if (bleId) {
    shipment = await ShipmentModel.findOne({ bleId: String(bleId).toUpperCase().trim() })
      .populate('createdBy', 'email name')
      .populate({ path: 'order', populate: { path: 'createdBy', select: 'email name' } });
  }

  if (orderId) {
    order = await OrderModel.findById(orderId).populate('createdBy', 'email name');
  } else if (!order && shipment?.order) {
    if (typeof shipment.order === 'object' && shipment.order.createdBy) {
      order = shipment.order;
    } else {
      order = await OrderModel.findById(shipment.order).populate('createdBy', 'email name');
    }
  }

  return { shipment, order };
};

const createDelayCompliance = async ({ shipment, scanResult, scannedBy }) => {
  if (!shipment) return null;

  const existing = await Compliance.findOne({ relatedShipment: shipment._id, 'metadata.alertType': 'transit_delay' });
  if (existing) return existing;

  const report = await Compliance.create({
    title: `Transit Delay Alert for ${shipment.trackingNumber || shipment._id}`,
    type: 'incident',
    severity: 'high',
    status: 'in_review',
    description: `Shipment ${shipment.trackingNumber || shipment._id} missed the expected transit deadline for checkpoint ${shipment.nextExpectedCheckpoint || 'unknown'}.`,
    findings: ['Transit deadline missed', 'Shipment marked for review'],
    recommendations: ['Investigate shipment progress', 'Escalate to operations team'],
    relatedShipment: shipment._id,
    relatedScanlog: scanResult?.scanId || null,
    metadata: {
      alertType: 'transit_delay',
      currentCheckpoint: shipment.currentCheckpoint,
      expectedCheckpoint: shipment.nextExpectedCheckpoint,
      responsibleOrganization: shipment.currentResponsibleOrganization,
      delayDurationMinutes: shipment.delayDurationMinutes || 0,
      stage: scanResult?.stage || null
    },
    createdBy: scannedBy || null,
    updatedBy: scannedBy || null
  });

  await createAuditEntry({
    eventType: 'transit_delay_detected',
    shipment,
    order: shipment?.order || null,
    blePackageId: shipment?.bleId || null,
    user: scannedBy || null,
    organization: shipment?.currentResponsibleOrganization || null,
    previousStatus: shipment?.status || null,
    newStatus: 'under_review',
    description: `Transit delay detected for shipment ${shipment.trackingNumber || shipment._id}.`,
    metadata: { alertType: 'transit_delay', delayMinutes: shipment.delayDurationMinutes || 0 }
  });

  return report;
};

const createDeliveryCompliance = async ({ shipment, scanResult, order, scannedBy, reason }) => {
  if (!shipment) return null;

  const existing = await Compliance.findOne({ relatedShipment: shipment._id, 'metadata.alertType': 'delivery_verification_failed' });
  const payload = {
    title: `Final Delivery Verification Alert for ${shipment.trackingNumber || shipment._id}`,
    type: 'incident',
    severity: 'critical',
    status: 'open',
    description: reason || `Final delivery verification failed for shipment ${shipment.trackingNumber || shipment._id}.`,
    findings: ['Final BLE delivery verification failed', 'Shipment requires investigation'],
    recommendations: ['Inspect the shipment and BLE package', 'Escalate to retail operations'],
    relatedShipment: shipment._id,
    relatedOrder: order?._id || null,
    relatedScanlog: scanResult?.scanId || null,
    metadata: {
      alertType: 'delivery_verification_failed',
      verificationStatus: scanResult?.verificationStatus || 'FAILED',
      bleId: scanResult?.bleId || shipment.bleId || null,
      currentCheckpoint: shipment.currentCheckpoint,
      responsibleOrganization: shipment.currentResponsibleOrganization || 'retailer',
      stage: scanResult?.stage || null,
      retailer: scannedBy || null
    },
    createdBy: scannedBy || null,
    updatedBy: scannedBy || null
  };

  if (existing) {
    existing.set(payload);
    await existing.save();
    return existing;
  }

  return await Compliance.create(payload);
};

const completeFinalDelivery = async ({ shipment, order, scanResult, scannedBy }) => {
  if (!shipment) return null;

  if (shipment.bleId && String(shipment.bleId).toUpperCase().trim() !== String(scanResult.bleId).toUpperCase().trim()) {
    throw new Error('BLE package does not belong to this shipment.');
  }

  if (shipment.currentCheckpoint !== 'retailer_verified') {
    throw new Error('Shipment is not at the expected final checkpoint for delivery confirmation.');
  }

  if (['delivered', 'cancelled', 'investigation_required'].includes(shipment.status)) {
    throw new Error('Shipment is not eligible for final delivery confirmation.');
  }

  const now = new Date();
  const previousStatus = shipment.status;

  shipment.status = 'delivered';
  shipment.currentCheckpoint = 'delivered';
  shipment.currentResponsibleOrganization = shipment.currentResponsibleOrganization || 'retailer';
  shipment.actualDeliveryDate = now;
  shipment.lastScanAt = now;
  shipment.timeline = shipment.timeline || [];
  shipment.timeline.push({
    timestamp: now,
    checkpoint: 'delivered',
    operator: scannedBy || null,
    organization: shipment.currentResponsibleOrganization,
    status: 'delivered'
  });
  shipment.statusHistory = shipment.statusHistory || [];
  shipment.statusHistory.push({
    status: 'delivered',
    timestamp: now,
    updatedBy: scannedBy || null,
    notes: 'Final delivery confirmation completed successfully.'
  });

  if (order) {
    order.status = 'completed';
    order.deliveredAt = now;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: 'completed',
      timestamp: now,
      updatedBy: scannedBy || null,
      notes: 'Final delivery confirmation completed successfully.'
    });
    await order.save();
  }

  await shipment.save();

  await createAuditEntry({
    eventType: 'shipment_delivered',
    shipment,
    order,
    blePackageId: shipment.bleId || null,
    user: scannedBy || null,
    organization: shipment.currentResponsibleOrganization || 'retailer',
    previousStatus,
    newStatus: 'delivered',
    description: 'Shipment delivered successfully after final verification.',
    metadata: { completedAt: now.toISOString() }
  });

  try {
    const recipientEmails = await resolveWorkflowRecipientEmails({
      retailerUserId: order?.createdBy || order?.user || shipment?.createdBy || shipment?.order?.createdBy || shipment?.order?.user || null,
      retailerUser: order?.createdBy?.email || shipment?.createdBy?.email || shipment?.order?.createdBy?.email
        ? { email: order?.createdBy?.email || shipment?.createdBy?.email || shipment?.order?.createdBy?.email }
        : null,
      includeRetailer: true,
      includeWarehouse: true,
      includeAdmin: true,
      eventType: 'shipment_delivered',
    });

    if (recipientEmails.length) {
      await sendWorkflowEventNotifications({
        recipientEmails,
        eventType: 'shipment_delivered',
        orderNumber: order?.orderNumber || shipment?.order?.orderNumber || 'Delivery',
        shipmentNumber: shipment?.trackingNumber || shipment?.bleId || 'Shipment',
        medicine: order?.items?.[0]?.drug?.name || shipment?.items?.[0]?.drug?.name || 'BLE package',
        quantity: order?.items?.[0]?.quantity || shipment?.items?.[0]?.quantity || 0,
        totalAmount: order?.totalAmount || shipment?.totalAmount || 0,
        status: 'DELIVERED',
        nextStep: 'The shipment is now complete and the retailer can review the delivery confirmation.'
      });
    }
  } catch (notificationError) {
    console.warn('Delivery notification skipped:', notificationError.message);
  }

  return {
    success: true,
    shipment,
    order,
    completedAt: now
  };
};

const flagDeliveryVerificationFailure = async ({ shipment, order, scanResult, scannedBy, reason }) => {
  if (!shipment) return null;

  const previousStatus = shipment.status;
  shipment.status = 'investigation_required';
  shipment.currentResponsibleOrganization = shipment.currentResponsibleOrganization || 'retailer';
  shipment.statusHistory = shipment.statusHistory || [];
  shipment.statusHistory.push({
    status: 'investigation_required',
    timestamp: new Date(),
    updatedBy: scannedBy || null,
    notes: reason || 'Final delivery verification failed.'
  });
  shipment.timeline = shipment.timeline || [];
  shipment.timeline.push({
    timestamp: new Date(),
    checkpoint: shipment.currentCheckpoint || 'retailer_verified',
    operator: scannedBy || null,
    organization: shipment.currentResponsibleOrganization,
    status: 'investigation_required'
  });
  await shipment.save();

  await createDeliveryCompliance({ shipment, scanResult, order, scannedBy, reason });

  await createAuditEntry({
    eventType: 'investigation_required',
    shipment,
    order,
    blePackageId: shipment.bleId || null,
    user: scannedBy || null,
    organization: shipment.currentResponsibleOrganization || 'retailer',
    previousStatus,
    newStatus: 'investigation_required',
    description: reason || 'Final delivery verification failed.',
    metadata: { verificationStatus: scanResult?.verificationStatus || 'FAILED' }
  });

  try {
    const recipientEmails = await resolveWorkflowRecipientEmails({
      retailerUserId: order?.createdBy || order?.user || shipment?.createdBy || shipment?.order?.createdBy || shipment?.order?.user || null,
      retailerUser: order?.createdBy?.email || shipment?.createdBy?.email || shipment?.order?.createdBy?.email
        ? { email: order?.createdBy?.email || shipment?.createdBy?.email || shipment?.order?.createdBy?.email }
        : null,
      includeRetailer: true,
      includeWarehouse: true,
      includeAdmin: true,
      eventType: 'delivery_verification_failed',
    });

    if (recipientEmails.length) {
      await sendWorkflowEventNotifications({
        recipientEmails,
        eventType: 'delivery_verification_failed',
        orderNumber: order?.orderNumber || shipment?.order?.orderNumber || 'Delivery',
        shipmentNumber: shipment?.trackingNumber || shipment?.bleId || 'Shipment',
        medicine: order?.items?.[0]?.drug?.name || shipment?.items?.[0]?.drug?.name || 'BLE package',
        quantity: order?.items?.[0]?.quantity || shipment?.items?.[0]?.quantity || 0,
        totalAmount: order?.totalAmount || shipment?.totalAmount || 0,
        status: 'INVESTIGATION_REQUIRED',
        nextStep: 'Review the BLE verification failure and resolve the shipment issue.',
        details: reason || 'Final delivery verification failed.'
      });
    }
  } catch (notificationError) {
    console.warn('Delivery failure notification skipped:', notificationError.message);
  }

  return shipment;
};

const monitorTransitDelay = async ({ shipment, scanResult, scannedBy }) => {
  if (!shipment || !scanResult?.verified || shipment.status === 'delivered') return null;

  const expectedCheckpoint = shipment.nextExpectedCheckpoint || null;
  if (!expectedCheckpoint) return null;

  const deadline = shipment.expectedCheckpointDeadline ? new Date(shipment.expectedCheckpointDeadline) : null;
  if (!deadline) return null;

  const now = new Date();
  const delayMinutes = Math.max(0, Math.round((now - deadline) / (60 * 1000)));
  if (delayMinutes <= 0) return null;

  shipment.status = 'under_review';
  shipment.currentResponsibleOrganization = shipment.currentResponsibleOrganization || 'warehouse';
  shipment.delayDurationMinutes = delayMinutes;
  shipment.statusHistory = shipment.statusHistory || [];
  shipment.statusHistory.push({
    status: 'under_review',
    timestamp: now,
    updatedBy: scannedBy || null,
    notes: `Transit delay detected for checkpoint ${expectedCheckpoint}. Deadline missed by ${delayMinutes} minutes.`
  });

  await shipment.save();
  await createDelayCompliance({ shipment, scanResult, scannedBy });

  try {
    const recipientEmails = await resolveWorkflowRecipientEmails({
      retailerUserId: shipment?.createdBy || shipment?.order?.createdBy || shipment?.order?.user || null,
      retailerUser: shipment?.createdBy?.email || shipment?.order?.createdBy?.email
        ? { email: shipment?.createdBy?.email || shipment?.order?.createdBy?.email }
        : null,
      includeRetailer: true,
      includeWarehouse: false,
      includeAdmin: true,
      eventType: 'shipment_delayed',
    });

    if (recipientEmails.length) {
      await sendWorkflowEventNotifications({
        recipientEmails,
        eventType: 'shipment_delayed',
        orderNumber: shipment?.order?.orderNumber || 'Delay',
        shipmentNumber: shipment?.trackingNumber || shipment?.bleId || 'Shipment',
        medicine: shipment?.items?.[0]?.drug?.name || 'BLE package',
        quantity: shipment?.items?.[0]?.quantity || 0,
        totalAmount: shipment?.totalAmount || 0,
        status: 'DELAYED',
        nextStep: 'Inspect the shipment route and resolve the transit delay.',
        details: `Transit delay detected for checkpoint ${expectedCheckpoint}.`
      });
    }
  } catch (notificationError) {
    console.warn('Transit delay notification skipped:', notificationError.message);
  }

  return { delayMinutes, expectedCheckpoint, currentCheckpoint: shipment.currentCheckpoint };
};

const advanceShipmentCheckpoint = async ({ scanResult, shipment, scannedBy }) => {
  if (!shipment || !scanResult?.verified) return null;

  const progression = CHECKPOINT_PROGRESSION[scanResult.stage];
  if (!progression) return null;

  if (shipment.status === 'delivered' || shipment.currentCheckpoint === 'delivered') {
    throw new Error('Shipment delivery is already complete. No further scans are accepted.');
  }

  const currentCheckpoint = shipment.currentCheckpoint || (shipment.bleId ? 'ble_allocated' : 'warehouse_confirmed');
  if (currentCheckpoint !== progression.expectedCurrentCheckpoint) {
    if (shipment.nextExpectedCheckpoint && shipment.expectedCheckpointDeadline && shipment.currentCheckpoint === 'package_verified' && scanResult.stage === 'distributor') {
      return null;
    }
    throw new Error(`Invalid checkpoint transition for stage ${scanResult.stage}. Expected ${progression.expectedCurrentCheckpoint} but shipment is at ${currentCheckpoint}.`);
  }

  const nextStatus = progression.nextStatus;
  const nextCheckpoint = progression.nextCheckpoint;
  const organization = progression.organization;

  shipment.currentCheckpoint = nextCheckpoint;
  shipment.currentResponsibleOrganization = organization;
  shipment.lastScanAt = new Date();
  shipment.nextExpectedCheckpoint = null;
  shipment.expectedCheckpointDeadline = null;
  shipment.delayDurationMinutes = 0;
  if (shipment.status !== 'under_review') {
    shipment.status = ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled', 'quarantined'].includes(nextStatus)
      ? nextStatus
      : shipment.status;
  }

  if (nextStatus === 'delivered') {
    shipment.actualDeliveryDate = new Date();
  }

  shipment.timeline = shipment.timeline || [];
  shipment.timeline.push({
    timestamp: new Date(),
    checkpoint: nextCheckpoint,
    operator: scannedBy || null,
    organization,
    status: nextStatus
  });

  shipment.statusHistory = shipment.statusHistory || [];
  shipment.statusHistory.push({
    status: `checkpoint_${nextCheckpoint}`,
    timestamp: new Date(),
    updatedBy: scannedBy || null,
    notes: `Shipment advanced to ${nextCheckpoint} after successful ${scanResult.stage} scan.`
  });

  await shipment.save();

  await createAuditEntry({
    eventType: 'shipment_progression',
    shipment,
    order: shipment.order || null,
    blePackageId: shipment.bleId || null,
    user: scannedBy || null,
    organization,
    previousStatus: currentCheckpoint,
    newStatus: nextCheckpoint,
    description: `Shipment advanced to ${nextCheckpoint} after a verified scan.`,
    metadata: { checkpoint: nextCheckpoint, stage: scanResult.stage }
  });

  await createAuditEntry({
    eventType: 'checkpoint_scan',
    shipment,
    order: shipment.order || null,
    blePackageId: shipment.bleId || null,
    user: scannedBy || null,
    organization,
    previousStatus: currentCheckpoint,
    newStatus: nextCheckpoint,
    description: `Checkpoint scan accepted for ${scanResult.stage}.`,
    metadata: { stage: scanResult.stage, verified: scanResult.verified }
  });

  return {
    currentCheckpoint: nextCheckpoint,
    currentResponsibleOrganization: organization,
    status: shipment.status,
    timelineEntry: shipment.timeline[shipment.timeline.length - 1]
  };
};

const updateShipmentAndOrderStatus = async ({ scanResult, shipment, order, scannedBy }) => {
  const scanHistoryStatus = scanResult.verified ? 'scan_verified' : 'scan_failed';
  const scanNotes = scanResult.verified
    ? `Checkpoint scan verified at stage ${scanResult.stage || 'unknown'}.`
    : `Checkpoint scan failed with status ${scanResult.verificationStatus || 'UNKNOWN'}. Alerts: ${scanResult.alerts?.join(', ') || 'none'}`;

  if (shipment) {
    const nextStatus = scanResult.shipmentProgression?.status || (scanResult.stage ? PLATFORM_STAGE_TO_SHIPMENT_STATUS[scanResult.stage] : null);

    if (scanResult.finalDelivery?.success) {
      shipment.status = 'delivered';
    } else if (scanResult.verified && nextStatus && shipment.status !== 'under_review' && shipment.status !== 'investigation_required') {
      const normalizedStatus = nextStatus.toLowerCase();
      if (['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled', 'quarantined'].includes(normalizedStatus)) {
        shipment.status = normalizedStatus;
        if (normalizedStatus === 'delivered') {
          shipment.actualDeliveryDate = new Date();
        }
      }
    }

    shipment.statusHistory.push({
      status: scanHistoryStatus,
      timestamp: new Date(),
      updatedBy: scannedBy || null,
      notes: scanNotes
    });

    await shipment.save();
  }

  if (order) {
    let orderStatus = null;
    if (scanResult.finalDelivery?.success) {
      orderStatus = 'completed';
    } else if (scanResult.verified) {
      orderStatus = scanResult.stage === 'customer' ? 'delivered' : scanResult.stage === 'warehouse' ? 'shipped' : null;
    }

    if (orderStatus && ['pending', 'approved', 'processing', 'confirmed', 'shipped', 'delivered', 'completed'].includes(orderStatus)) {
      order.status = orderStatus;
      if (orderStatus === 'delivered') {
        order.deliveredAt = new Date();
      }
    }

    order.statusHistory.push({
      status: scanHistoryStatus,
      timestamp: new Date(),
      updatedBy: scannedBy || null,
      notes: scanResult.verified
        ? `BLE scan ingestion verified at stage ${scanResult.stage || 'unknown'}.` 
        : `BLE scan ingestion failed: ${scanResult.verificationStatus || 'UNKNOWN'}.`
    });

    await order.save();
  }
};

const sendRetailerScanNotification = async ({ scanResult, shipment, order }) => {
  const orderNumber = order?.orderNumber || shipment?.order?.orderNumber || shipment?.trackingNumber || 'Unknown';
  const item = order?.items?.[0] || shipment?.items?.[0] || {};
  const stageLabel = scanResult.stage ? scanResult.stage.toUpperCase() : 'UNKNOWN';
  const verificationLabel = scanResult.verificationStatus || 'UNKNOWN';
  const nextStep = scanResult.verified
    ? `BLE scan at ${stageLabel} verified. Shipment status updated.`
    : `BLE scan at ${stageLabel} detected an issue. Please inspect the shipment immediately.`;
  const eventType = scanResult.verified ? 'shipment_dispatched' : 'ble_security_alert';

  try {
    const recipientEmails = await resolveWorkflowRecipientEmails({
      retailerUserId: order?.createdBy || order?.user || shipment?.createdBy || shipment?.order?.createdBy || shipment?.order?.user || null,
      retailerUser: order?.createdBy?.email || shipment?.createdBy?.email || shipment?.order?.createdBy?.email
        ? { email: order?.createdBy?.email || shipment?.createdBy?.email || shipment?.order?.createdBy?.email }
        : null,
      eventType,
    });

    if (recipientEmails.length) {
      await sendWorkflowEventNotifications({
        recipientEmails,
        eventType,
        orderNumber,
        shipmentNumber: shipment?.trackingNumber || shipment?.bleId || orderNumber,
        medicine: item.drug?.name || 'BLE package',
        quantity: item.quantity || 0,
        totalAmount: order?.totalAmount || shipment?.totalAmount || 0,
        status: `BLE_SCAN_${verificationLabel}`,
        nextStep
      });
    }
  } catch (error) {
    console.warn('BLE scan notification skipped:', error.message);
  }
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

    const { shipment, order } = await resolveShipmentAndOrder({ bleId, shipmentId, orderId });

    const scanResult = await verifySecureScan({
      bleId,
      challenge,
      signature,
      stage,
      location,
      trafficCondition,
      delayReason,
      timestamp,
      scannedBy: req.user?._id || req.user?.id || null,
      shipmentContext: shipment
        ? {
            currentCheckpoint: shipment.currentCheckpoint,
            expectedStage: CHECKPOINT_TO_STAGE[shipment.currentCheckpoint] || null
          }
        : null
    });

    if (!scanResult.verified || (scanResult.alerts && scanResult.alerts.length > 0)) {
      if (req.body?.finalDelivery) {
        const scannedBy = req.user?._id || req.user?.id || null;
        const failedShipment = await flagDeliveryVerificationFailure({ shipment, order, scanResult, scannedBy, reason: scanResult.verificationStatus === 'FAILED' ? 'BLE verification failed.' : 'BLE verification is blocked.' });
        scanResult.finalDelivery = {
          success: false,
          shipment: failedShipment,
          error: scanResult.verificationStatus === 'FAILED' ? 'BLE verification failed.' : 'BLE verification is blocked.'
        };
      }

      await createComplianceFromScan({ scanResult, shipment, order, scannedBy: req.user?._id || req.user?.id || null });

      if (scanResult.alerts?.length) {
        try {
          await sendBleAlertEmail({ tracking: { batchId: bleId, deviceId: bleId, status: scanResult.verificationStatus, temperature: null, timestamp: new Date() } });
        } catch (emailError) {
          console.warn('BLE scan alert email skipped:', emailError.message);
        }
      }
    }

    if (scanResult.verified && !scanResult.alerts?.length) {
      const scannedBy = req.user?._id || req.user?.id || null;

      if (req.body?.finalDelivery) {
        try {
          const finalDeliveryResult = await completeFinalDelivery({ shipment, order, scanResult, scannedBy });
          scanResult.finalDelivery = finalDeliveryResult;
        } catch (deliveryError) {
          const failedShipment = await flagDeliveryVerificationFailure({ shipment, order, scanResult, scannedBy, reason: deliveryError.message });
          scanResult.finalDelivery = {
            success: false,
            shipment: failedShipment,
            error: deliveryError.message
          };
        }
      } else {
        const pendingDelay = shipment?.nextExpectedCheckpoint && shipment?.expectedCheckpointDeadline
          ? {
              shipment,
              scanResult,
              scannedBy
            }
          : null;

        if (pendingDelay) {
          const delayResult = await monitorTransitDelay(pendingDelay);
          if (delayResult) {
            scanResult.delayAlert = delayResult;
          }
        }

        const progressionResult = await advanceShipmentCheckpoint({
          scanResult,
          shipment,
          scannedBy
        });

        scanResult.shipmentProgression = progressionResult;

        if (shipment) {
          shipment.nextExpectedCheckpoint = progressionResult?.currentCheckpoint || null;
          shipment.expectedCheckpointDeadline = progressionResult?.currentCheckpoint
            ? new Date(Date.now() + (TRANSIT_DELAY_CONFIG[scanResult.stage]?.[progressionResult.currentCheckpoint] || 240) * 60 * 1000)
            : null;
          await shipment.save();
        }
      }
    }

    if (shipment) {
      await createAuditEntry({
        eventType: 'shipment_dispatched',
        shipment,
        order,
        blePackageId: shipment.bleId || null,
        user: req.user?._id || req.user?.id || null,
        organization: shipment.currentResponsibleOrganization || null,
        previousStatus: shipment.status,
        newStatus: shipment.status,
        description: 'Shipment scan workflow completed.',
        metadata: { verified: scanResult.verified, stage: scanResult.stage, finalDelivery: Boolean(req.body?.finalDelivery) }
      });
    }

    await updateShipmentAndOrderStatus({ scanResult, shipment, order, scannedBy: req.user?._id || req.user?.id || null });

    await sendRetailerScanNotification({ scanResult, shipment, order });

    return successResponse(res, scanResult.verified ? 200 : 202, 'BLE scan ingested', scanResult);
  } catch (error) {
    console.error('BLE scan ingestion error:', error);
    return errorResponse(res, 400, error.message);
  }
};
