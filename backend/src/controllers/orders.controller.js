import OrderModel from '../models/OrderModel.js';
import SupplierModel from '../models/SupplierModel.js';
import DrugModel from '../models/Drug.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Get all orders with filtering and pagination
const getAllOrders = async (req, res) => {
  try {
    const { status, supplier, search, page = 1, limit = 10, sortBy = '-createdAt' } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (supplier) {
      query.supplier = supplier;
    }
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { purchaseOrderNumber: { $regex: search, $options: 'i' } }
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
    
    const total = await OrderModel.countDocuments(query);
    
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
      createdBy: req.user._id
    };
    
    // Verify supplier exists and is approved
    const supplier = await SupplierModel.findById(orderData.supplier);
    if (!supplier) {
      return errorResponse(res, 404, 'Supplier not found');
    }
    if (supplier.status !== 'approved') {
      return errorResponse(res, 400, 'Can only create orders from approved suppliers');
    }
    
    // Verify all drugs exist
    for (const item of orderData.items) {
      const drug = await DrugModel.findById(item.drug);
      if (!drug) {
        return errorResponse(res, 404, `Drug with ID ${item.drug} not found`);
      }
    }
    
    const order = await OrderModel.create(orderData);
    
    // Populate the created order
    await order.populate([
      { path: 'supplier', select: 'name email contactPerson' },
      { path: 'items.drug', select: 'name genericName' }
    ]);
    
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
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, `Status must be one of: ${validStatuses.join(', ')}`);
    }
    
    const order = await OrderModel.findById(id);
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    // Update status
    order.status = status;
    
    if (status === 'approved') {
      order.approvedBy = req.user._id;
      order.approvedAt = new Date();
    }
    
    if (notes) {
      order.notes = notes;
    }
    
    await order.save();
    
    // Populate before sending response
    await order.populate([
      { path: 'supplier', select: 'name email' },
      { path: 'approvedBy', select: 'name email' }
    ]);
    
    return successResponse(res, 200, 'Order status updated successfully', order);
  } catch (error) {
    console.error('Update order status error:', error);
    return errorResponse(res, 500, 'Failed to update order status', error.message);
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
    if (['completed', 'cancelled'].includes(order.status)) {
      return errorResponse(res, 400, `Cannot cancel ${order.status} order`);
    }
    
    // Update order status
    order.status = 'cancelled';
    if (reason) {
      order.notes = reason;
    }
    
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
      totalValue: 0
    };
    
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.totalValue += stat.totalValue || 0;
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
  getOrderStats
};