import OrderModel from '../models/OrderModel.js';
import SupplierModel from '../models/SupplierModel.js';
import DrugModel from '../models/Drug.js';
import UserModel from '../models/UserModel.js';
import { resolveWorkflowRecipientEmails, sendWorkflowEventNotifications } from '../services/notification.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { validateArray, validateRequired } from '../utils/validation.js';
import { createAuditEntry } from '../services/audit.service.js';
import { preserveOrderOwnerIdentity } from '../utils/orderOwner.js';

// Get all orders with filtering and pagination
const getAllOrders = async (req, res) => {
  try {
    const { status, supplier, search, page = 1, limit = 10, sortBy = '-createdAt' } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status.toLowerCase();
    }
    
    if (supplier) {
      query.supplier = supplier;
    }
    
    if (search) {
      const matchingSuppliers = await SupplierModel.find(
        { name: { $regex: search, $options: 'i' } },
        '_id'
      );
      const supplierIds = matchingSuppliers.map((supplierDoc) => supplierDoc._id);

      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { purchaseOrderNumber: { $regex: search, $options: 'i' } },
        { supplier: { $in: supplierIds } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const orders = await OrderModel.find(query)
      .populate('supplier', 'name email contactPerson')
      .populate('approvedBy', 'name email')
      .populate('items.drug', 'name genericName')
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');
    
    // Validate orders data before returning
    const validatedOrders = validateArray(
      orders,
      ['_id', 'status'],
      {},
      'Orders'
    );
    
    const total = await OrderModel.countDocuments(query);
    
    return successResponse(res, 200, 'Orders fetched successfully', {
      orders: validatedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return errorResponse(res, 500, 'Failed to fetch orders', error.message);
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await OrderModel.findById(id)
      .populate('supplier', 'name email contactPerson phone address')
      .populate('approvedBy', 'name email')
      .populate('items.drug', 'name genericName manufacturer')
      .populate('createdBy', 'name email');
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    return successResponse(res, 200, 'Order fetched successfully', order);
  } catch (error) {
    console.error('Get order error:', error);
    return errorResponse(res, 500, 'Failed to fetch order', error.message);
  }
};

// Create new order
const createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      user: req.user?._id || req.user?.id || null,
      createdBy: req.user?._id || req.user?.id || null,
    };
    // Persist creator's email for strict owner resolution
    if (req.user && req.user.email) {
      orderData.userEmail = String(req.user.email).toLowerCase().trim();
      orderData.createdByEmail = String(req.user.email).toLowerCase().trim();
    }
    
    // Normalize status to lowercase if provided
    if (orderData.status) {
      orderData.status = orderData.status.toLowerCase();
    }
    
    // Verify supplier exists and is approved (if supplier is provided)
    if (orderData.supplier) {
      const supplier = await SupplierModel.findById(orderData.supplier);
      if (!supplier) {
        return errorResponse(res, 404, 'Supplier not found');
      }
      if (supplier.status !== 'approved') {
        return errorResponse(res, 400, 'Can only create orders from approved suppliers');
      }
    }
    
    // Verify all drugs exist
    for (const item of orderData.items) {
      const drug = await DrugModel.findById(item.drug);
      if (!drug) {
        return errorResponse(res, 404, `Drug with ID ${item.drug} not found`);
      }
    }
    
    const order = await OrderModel.create(orderData);
    await createAuditEntry({
      eventType: 'order_created',
      order,
      user: req.user?._id || req.user?.id || null,
      organization: req.user?.organization || null,
      previousStatus: null,
      newStatus: order.status,
      description: 'Order created successfully.',
      metadata: { orderNumber: order.orderNumber }
    });
    
    // Populate the created order
    await order.populate([
      { path: 'supplier', select: 'name email contactPerson' },
      { path: 'items.drug', select: 'name genericName' }
    ]);

    try {
      const recipientEmails = await resolveWorkflowRecipientEmails({
        retailerUserId: order.user || order.createdBy || null,
        retailerUser: null,
        order,
        orderId: order._id,
        warehouseUserId: req.user?._id || req.user?.id || null,
        includeRetailer: false,
        includeWarehouse: true,
        includeAdmin: false,
        eventType: 'order_created',
      });

      if (recipientEmails.length) {
        await sendWorkflowEventNotifications({
          recipientEmails,
          eventType: 'order_created',
          orderNumber: order.orderNumber,
          medicine: order.items?.[0]?.drug?.name || 'Item',
          quantity: order.items?.[0]?.quantity || 0,
          totalAmount: order.totalAmount || 0,
          status: 'CREATED',
          nextStep: 'Warehouse will review and process the order.'
        });
      }
    } catch (notificationError) {
      console.warn('Order creation notification skipped:', notificationError.message);
    }
    
    return successResponse(res, 201, 'Order created successfully', order);
  } catch (error) {
    console.error('Create order error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return errorResponse(res, 400, 'Validation failed', messages);
    }
    
    return errorResponse(res, 500, 'Failed to create order', error.message);
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status, notes } = req.body;
    
    // Normalize status to lowercase
    if (status) {
      status = status.toLowerCase().trim();
    }
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'processing', 'completed', 'cancelled', 'confirmed', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, `Status must be one of: ${validStatuses.join(', ')}`);
    }
    
    const order = await OrderModel.findById(id);
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    const previousStatus = order.status;

    preserveOrderOwnerIdentity(order, req.user);

    const persistedOwnerEmail = String(order.userEmail || order.createdByEmail || '').trim().toLowerCase();
    if (!persistedOwnerEmail && req.user?.email) {
      order.userEmail = String(req.user.email).toLowerCase().trim();
      order.createdByEmail = String(req.user.email).toLowerCase().trim();
    } else if (persistedOwnerEmail) {
      order.userEmail = order.userEmail || persistedOwnerEmail;
      order.createdByEmail = order.createdByEmail || persistedOwnerEmail;
    }

    // Update status
    order.status = status;
    
    if (status === 'approved') {
      order.approvedBy = req.user._id;
      order.approvedAt = new Date();
    }
    
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }
    
    if (status === 'cancelled' && notes) {
      order.cancellationReason = notes;
    }
    
    if (notes) {
      order.notes = notes;
    }
    
    // Add to status history
    order.statusHistory.push({
      status: status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      notes: notes || ''
    });
    
    await order.save();

    if (status === 'confirmed') {
      await createAuditEntry({
        eventType: 'order_confirmed',
        order,
        user: req.user?._id || req.user?.id || null,
        organization: req.user?.organization || null,
        previousStatus,
        newStatus: status,
        description: 'Order confirmed for shipment workflow.',
        metadata: { notes }
      });
    } else if (status === 'cancelled' || status === 'rejected') {
      await createAuditEntry({
        eventType: 'order_rejected',
        order,
        user: req.user?._id || req.user?.id || null,
        organization: req.user?.organization || null,
        previousStatus,
        newStatus: status,
        description: 'Order rejected or cancelled.',
        metadata: { notes }
      });
    }
    
    // Populate before sending response
    await order.populate([
      { path: 'supplier', select: 'name email' },
      { path: 'approvedBy', select: 'name email' }
    ]);

    // Send email notifications for key status changes
    try {
      const eventTypeMap = {
        approved: 'order_approved',
        confirmed: 'order_confirmed',
        shipped: 'shipment_dispatched',
        delivered: 'shipment_delivered',
        rejected: 'order_rejected',
        cancelled: 'order_rejected'
      };

      const effectiveEventType = eventTypeMap[status];
      console.info('[ORDER_APPROVED]', { orderId: order._id?.toString(), status, effectiveEventType });

      if (effectiveEventType) {
        console.info('[EVENT_CREATED]', { eventType: effectiveEventType });

        // Ensure the order includes retailer owner references for recipient resolution
        await order.populate([ 
          { path: 'user', select: 'email name role' },
          { path: 'createdBy', select: 'email name role' }
        ]);

        const retailerUserId = order.user?._id || order.user || order.createdBy?._id || order.createdBy || null;
        const retailerUser = retailerUserId
          ? await UserModel.findById(retailerUserId).select('email name role')
          : null;

        console.info('[ORDER_OWNER]', { orderId: order._id?.toString(), ownerId: retailerUser?._id || retailerUserId, ownerEmail: retailerUser?.email || order.userEmail || order.createdByEmail || null });

        const recipientEmails = await resolveWorkflowRecipientEmails({
          retailerUserId,
          retailerUser,
          order,
          orderId: order._id,
          warehouseUserId: req.user?._id || req.user?.id || null,
          includeRetailer: ['order_approved', 'order_confirmed', 'order_rejected', 'shipment_dispatched'].includes(effectiveEventType),
          includeWarehouse: effectiveEventType === 'shipment_delivered',
          includeAdmin: effectiveEventType === 'shipment_delivered',
          eventType: effectiveEventType,
        });

        // Log chosen recipients explicitly
        recipientEmails.forEach((r) => console.info('[EMAIL_RECIPIENT]', { eventType: effectiveEventType, recipient: r }));

        if (recipientEmails.length) {
          const item = order.items?.[0] || {};
          await sendWorkflowEventNotifications({
            recipientEmails,
            eventType: effectiveEventType,
            orderNumber: order.orderNumber,
            medicine: item.drug?.name || item.drug || 'Item',
            quantity: item.quantity || 0,
            totalAmount: order.totalAmount || 0,
            status: status.toUpperCase(),
            nextStep: status === 'approved'
              ? 'The order has been approved and will move to fulfillment.'
              : status === 'confirmed'
                ? 'Warehouse will prepare and dispatch the order.'
                : status === 'shipped'
                  ? 'Order is on the way.'
                  : status === 'delivered'
                    ? 'Order has been delivered.'
                    : 'Please review the latest order update.'
          });
        } else {
          console.warn('[RECIPIENT_RESOLVED]', {
            eventType: effectiveEventType,
            orderId: order._id?.toString(),
            recipientEmails
          });
        }
      }
    } catch (e) {
      console.error('Notification error:', e);
    }
    
    return successResponse(res, 200, 'Order status updated successfully', order);
  } catch (error) {
    console.error('Update order status error:', error);
    return errorResponse(res, 500, 'Failed to update order status', error.message);
  }
};

// Escalate an order to admin (called by warehouse UI)
const escalateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await OrderModel.findById(id).populate([ { path: 'items.drug', select: 'name' }, { path: 'createdBy', select: 'name email' } ]);
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    order.escalatedToAdmin = true;
    order.statusHistory.push({ status: 'escalated', timestamp: new Date(), updatedBy: req.user._id, notes: reason || 'Escalated by warehouse' });
    await order.save();

    // Notify admins via centralized recipient resolver
    try {
      const item = order.items?.[0] || {};
      const recipientEmails = await resolveWorkflowRecipientEmails({
        order,
        orderId: order._id,
        includeRetailer: false,
        includeWarehouse: false,
        includeAdmin: true,
        eventType: 'order_escalated'
      });

      if (recipientEmails.length) {
        await sendWorkflowEventNotifications({
          recipientEmails,
          eventType: 'order_escalated',
          orderNumber: order.orderNumber,
          medicine: item.drug?.name || 'Item',
          quantity: item.quantity || 0,
          totalAmount: order.totalAmount || 0,
          status: 'ESCALATED',
          nextStep: 'Please review and advise on shortage/exception.'
        });
      }
    } catch (notifyErr) {
      console.warn('Order escalation notification skipped:', notifyErr.message || notifyErr);
    }

    return successResponse(res, 200, 'Order escalated to admin', order);
  } catch (error) {
    console.error('Escalate order error:', error);
    return errorResponse(res, 500, 'Failed to escalate order', error.message);
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await OrderModel.findById(id);
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    // Only allow deletion of pending or cancelled orders
    if (!['pending', 'cancelled'].includes(order.status)) {
      return errorResponse(res, 400, 'Can only delete pending or cancelled orders');
    }
    
    await order.deleteOne();
    
    return successResponse(res, 200, 'Order deleted successfully');
  } catch (error) {
    console.error('Delete order error:', error);
    return errorResponse(res, 500, 'Failed to delete order', error.message);
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const order = await OrderModel.findById(id);
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    // Check if order can be cancelled
    if (['completed', 'cancelled', 'delivered'].includes(order.status)) {
      return errorResponse(res, 400, `Cannot cancel ${order.status} order`);
    }
    
    // Update order status
    order.status = 'cancelled';
    if (reason) {
      order.cancellationReason = reason;
      order.notes = reason;
    }
    
    // Add to status history
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      updatedBy: req.user._id,
      notes: reason || 'Order cancelled'
    });
    
    await order.save();
    
    return successResponse(res, 200, 'Order cancelled successfully', order);
  } catch (error) {
    console.error('Cancel order error:', error);
    return errorResponse(res, 500, 'Failed to cancel order', error.message);
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const stats = await OrderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const formattedStats = {
      total: await OrderModel.countDocuments(),
      pending: 0,
      approved: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      totalValue: 0
    };
    
    stats.forEach(stat => {
      if (stat._id) {
        formattedStats[stat._id] = stat.count;
        formattedStats.totalValue += stat.totalValue || 0;
      }
    });
    
    return successResponse(res, 200, 'Order statistics fetched', formattedStats);
  } catch (error) {
    console.error('Get order stats error:', error);
    return errorResponse(res, 500, 'Failed to fetch statistics', error.message);
  }
};

export default {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
  getOrderStats,
  escalateOrder
};