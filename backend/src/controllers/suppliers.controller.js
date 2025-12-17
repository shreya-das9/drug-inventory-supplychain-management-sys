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
    const { name, email, phone, contactPerson, address, status } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !contactPerson) {
      return errorResponse(res, 400, 'Missing required fields: name, email, phone, contactPerson');
    }

    const supplierData = {
      name,
      email,
      phone,
      contactPerson,
      address,
      status: status || 'PENDING',
      createdBy: req.user._id
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

// Update supplier
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove protected fields
    delete updateData.createdBy;
    delete updateData.approvedBy;
    delete updateData.approvedAt;
    delete updateData._id;
    
    // Validate required fields if provided
    const allowedFields = ['name', 'email', 'phone', 'contactPerson', 'address'];
    Object.keys(updateData).forEach(key => {
      if (!allowedFields.includes(key)) {
        delete updateData[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, 400, 'No valid fields to update');
    }
    
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
    
    // Validate status
    if (!status || !['APPROVED', 'REJECTED', 'approved', 'rejected'].includes(status)) {
      return errorResponse(res, 400, 'Status must be either "APPROVED" or "REJECTED"');
    }
    
    // Require rejection reason when rejecting
    if (status.toUpperCase() === 'REJECTED' && !rejectionReason) {
      return errorResponse(res, 400, 'Rejection reason is required when rejecting a supplier');
    }
    
    const supplier = await SupplierModel.findById(id);
    
    if (!supplier) {
      return errorResponse(res, 404, 'Supplier not found');
    }
    
    // Check if already processed
    if (supplier.status !== 'PENDING') {
      return errorResponse(res, 400, `Supplier is already ${supplier.status}`);
    }
    
    // Update supplier status
    supplier.status = status.toUpperCase();
    supplier.approvedBy = req.user._id;
    supplier.approvedAt = new Date();
    
    if (status.toUpperCase() === 'REJECTED') {
      supplier.rejectionReason = rejectionReason;
    }
    
    await supplier.save();
    
    return successResponse(res, 200, `Supplier ${status.toUpperCase()} successfully`, supplier);
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
    
    await SupplierModel.findByIdAndDelete(id);
    
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
      const statusKey = stat._id.toLowerCase();
      if (statusKey in formattedStats) {
        formattedStats[statusKey] = stat.count;
      }
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
