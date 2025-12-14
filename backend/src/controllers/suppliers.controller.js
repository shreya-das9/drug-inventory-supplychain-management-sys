import SupplierModel from '../models/SupplierModel.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Get all suppliers with filtering and pagination
const getAllSuppliers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10, sortBy = '-createdAt' } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const suppliers = await SupplierModel.find(query)
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');
    
    const total = await SupplierModel.countDocuments(query);
    
    return successResponse(res, 200, 'Suppliers fetched successfully', {
      suppliers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    return errorResponse(res, 500, 'Failed to fetch suppliers', error.message);
  }
};

// Get single supplier by ID
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supplier = await SupplierModel.findById(id);
    
    if (!supplier) {
      return errorResponse(res, 404, 'Supplier not found');
    }
    
    return successResponse(res, 200, 'Supplier fetched successfully', supplier);
  } catch (error) {
    console.error('Get supplier error:', error);
    return errorResponse(res, 500, 'Failed to fetch supplier', error.message);
  }
};

// Add new supplier
const addSupplier = async (req, res) => {
  try {
    const supplierData = {
      ...req.body,
      createdBy: req.user._id // From auth middleware
    };
    
    const supplier = await SupplierModel.create(supplierData);
    
    return successResponse(res, 201, 'Supplier added successfully', supplier);
  } catch (error) {
    console.error('Add supplier error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return errorResponse(res, 400, `Supplier with this ${field} already exists`);
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return errorResponse(res, 400, 'Validation failed', messages);
    }
    
    return errorResponse(res, 500, 'Failed to add supplier', error.message);
  }
};

// Update supplier - ADD THIS ENTIRE FUNCTION HERE
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    delete updateData.createdBy;
    delete updateData.approvedBy;
    delete updateData.approvedAt;
    
    const supplier = await SupplierModel.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!supplier) {
      return errorResponse(res, 404, 'Supplier not found');
    }
    
    return successResponse(res, 200, 'Supplier updated successfully', supplier);
  } catch (error) {
    console.error('Update supplier error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return errorResponse(res, 400, `Supplier with this ${field} already exists`);
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return errorResponse(res, 400, 'Validation failed', messages);
    }
    
    return errorResponse(res, 500, 'Failed to update supplier', error.message);
  }
};

// Approve or reject supplier
const approveSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    // Validate status (case-insensitive)
    if (!['approved', 'rejected'].includes(status.toLowerCase())) {
      return errorResponse(res, 400, 'Status must be either "approved" or "rejected"');
    }
    
    // Require rejection reason when rejecting
    if (status.toLowerCase() === 'rejected' && !rejectionReason) {
      return errorResponse(res, 400, 'Rejection reason is required when rejecting a supplier');
    }
    
    const supplier = await SupplierModel.findById(id);
    
    if (!supplier) {
      return errorResponse(res, 404, 'Supplier not found');
    }
    
    // Check if already processed (case-insensitive)
    if (supplier.status.toLowerCase() !== 'pending') {
      return errorResponse(res, 400, `Supplier is already ${supplier.status.toLowerCase()}`);
    }
    
    // Update supplier status (convert to uppercase to match your database)
    supplier.status = status.toUpperCase();
    supplier.approvedBy = req.user._id;
    supplier.approvedAt = new Date();
    
    if (status.toLowerCase() === 'rejected') {
      supplier.rejectionReason = rejectionReason;
    }
    
    await supplier.save();
    
    return successResponse(res, 200, `Supplier ${status.toLowerCase()} successfully`, supplier);
  } catch (error) {
    console.error('Approve supplier error:', error);
    return errorResponse(res, 500, 'Failed to update supplier status', error.message);
  }
};
    

// Delete supplier
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supplier = await SupplierModel.findById(id);
    
    if (!supplier) {
      return errorResponse(res, 404, 'Supplier not found');
    }
    
    // Check if supplier has active orders/shipments
    // You can add this check when shipment model is ready
    // const activeShipments = await ShipmentModel.countDocuments({ 
    //   supplier: id, 
    //   status: { $in: ['pending', 'processing', 'shipped'] } 
    // });
    // if (activeShipments > 0) {
    //   return errorResponse(res, 400, 'Cannot delete supplier with active shipments');
    // }
    
    await supplier.deleteOne();
    
    return successResponse(res, 200, 'Supplier deleted successfully');
  } catch (error) {
    console.error('Delete supplier error:', error);
    return errorResponse(res, 500, 'Failed to delete supplier', error.message);
  }
};

// Get supplier statistics
const getSupplierStats = async (req, res) => {
  try {
    const stats = await SupplierModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const formattedStats = {
      total: await SupplierModel.countDocuments(),
      pending: 0,
      approved: 0,
      rejected: 0,
      suspended: 0
    };
    
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });
    
    return successResponse(res, 200, 'Supplier statistics fetched', formattedStats);
  } catch (error) {
    console.error('Get supplier stats error:', error);
    return errorResponse(res, 500, 'Failed to fetch statistics', error.message);
  }
};

export default {
  getAllSuppliers,
  getSupplierById,
  addSupplier,
  updateSupplier,
  approveSupplier,
  deleteSupplier,
  getSupplierStats
};