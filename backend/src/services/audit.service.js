import AuditModel from '../models/AuditModel.js';

const normalizeObjectId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value?.toString) return value.toString();
  return null;
};

export const createAuditEntry = async ({
  eventType,
  shipment,
  order,
  blePackageId = null,
  user,
  organization = null,
  previousStatus = null,
  newStatus = null,
  description = '',
  metadata = {}
}) => {
  if (!eventType) return null;

  const shipmentId = shipment?._id ? shipment._id.toString() : normalizeObjectId(shipment);
  const orderId = order?._id ? order._id.toString() : normalizeObjectId(order);

  return AuditModel.create({
    eventType,
    shipmentId,
    orderId,
    blePackageId: blePackageId || shipment?.bleId || order?.bleId || null,
    user: user?._id || user?.id || user || null,
    organization,
    previousStatus,
    newStatus,
    timestamp: new Date(),
    description,
    metadata
  });
};
