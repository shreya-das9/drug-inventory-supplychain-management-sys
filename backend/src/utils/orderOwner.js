export const preserveOrderOwnerIdentity = (order, actorUser = null) => {
  if (!order || typeof order !== 'object') {
    return order;
  }

  const existingOwnerId = order.user?._id || order.user || order.createdBy?._id || order.createdBy || null;
  const existingOwnerEmail = order.userEmail || order.createdByEmail || null;
  const actorId = actorUser?._id || actorUser?.id || null;

  if (existingOwnerId) {
    if (!order.user) {
      order.user = existingOwnerId;
    }
    if (!order.createdBy) {
      order.createdBy = existingOwnerId;
    }
  }

  if (existingOwnerEmail) {
    if (!order.userEmail) {
      order.userEmail = existingOwnerEmail;
    }
    if (!order.createdByEmail) {
      order.createdByEmail = existingOwnerEmail;
    }
  }

  if (!existingOwnerId && actorId) {
    order.user = order.user || actorId;
    order.createdBy = order.createdBy || actorId;
  }

  if (!existingOwnerEmail && actorUser?.email) {
    const actorEmail = String(actorUser.email).toLowerCase().trim();
    if (actorEmail) {
      order.userEmail = order.userEmail || actorEmail;
      order.createdByEmail = order.createdByEmail || actorEmail;
    }
  }

  return order;
};
