import OrderModel from '../models/OrderModel.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    console.log('getAllOrders called with query:', req.query);
    const { 
      status, 
      paymentStatus,
      page = 1, 
      limit = 10,
      sortBy = '-createdAt'
    } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    console.log('Executing query:', query);
    const orders = await OrderModel.find(query)
      .populate('user', 'name email phone')
      .populate('supplier', 'name email phone')
      .populate('items.drug', 'name genericName manufacturer')
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');
    
    console.log(`Found ${orders.length} orders`);
    const total = await OrderModel.countDocuments(query);
    console.log(`Total orders in DB: ${total}`);
    
    return successResponse(res, 200, 'Orders fetched successfully', {
      orders,
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
      .populate('user')
      .populate('supplier')
      .populate('items.drug');
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    return successResponse(res, 200, 'Order fetched successfully', order);
  } catch (error) {
    console.error('Get order error:', error);
    return errorResponse(res, 500, 'Failed to fetch order', error.message);
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'approved', 'processing', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status.toLowerCase())) {
      return errorResponse(res, 400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const order = await OrderModel.findById(id);
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    // Prevent status change if already delivered or cancelled
    if (['completed', 'cancelled'].includes(order.status)) {
      return errorResponse(res, 400, `Cannot modify ${order.status} order`);
    }
    
    const oldStatus = order.status;
    order.status = status.toLowerCase();
    await order.save();
    
    return successResponse(res, 200, `Order status updated from ${oldStatus} to ${status}`, order);
  } catch (error) {
    console.error('Update order status error:', error);
    return errorResponse(res, 500, 'Failed to update order status', error.message);
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
    
    if (order.status === 'completed') {
      return errorResponse(res, 400, 'Cannot cancel completed orders');
    }
    
    if (order.status === 'cancelled') {
      return errorResponse(res, 400, 'Order is already cancelled');
    }
    
    order.status = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by admin';
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
    console.log('getOrderStats called');
    
    const stats = await OrderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    console.log('Stats aggregation result:', stats);
    
    const totalOrders = await OrderModel.countDocuments();
    console.log('Total orders in DB:', totalOrders);
    
    const totalValue = await OrderModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const formattedStats = {
      total: totalOrders,
      totalValue: totalValue[0]?.total || 0,
      pending: 0,
      approved: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    };
    
    stats.forEach(stat => {
      const statusKey = stat._id.toLowerCase();
      if (statusKey in formattedStats) {
        formattedStats[statusKey] = stat.count;
      }
    });
    
    console.log('Formatted stats:', formattedStats);
    return successResponse(res, 200, 'Order statistics fetched', formattedStats);
  } catch (error) {
    console.error('Get order stats error:', error);
    return errorResponse(res, 500, 'Failed to fetch statistics', error.message);
  }
};

export default {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
};
