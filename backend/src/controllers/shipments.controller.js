import ShipmentModel from '../models/ShipmentModel.js';
import SupplierModel from '../models/SupplierModel.js';
import Drug from '../models/Drug.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Get all shipments
const getAllShipments = async (req, res) => {
  try {
    console.log('getAllShipments called with query:', req.query);
    const { 
      status, 
      supplier, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10,
      sortBy = '-createdAt'
    } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (supplier) query.supplier = supplier;
    
    if (startDate || endDate) {
      query.expectedDeliveryDate = {};
      if (startDate) query.expectedDeliveryDate.$gte = new Date(startDate);
      if (endDate) query.expectedDeliveryDate.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    console.log('Executing query:', query);
    const shipments = await ShipmentModel.find(query)
      .populate('supplier', 'name email phone contactPerson')
      .populate('items.drug', 'name genericName manufacturer')
      .populate('createdBy', 'name email')
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');
    
    console.log(`Found ${shipments.length} shipments`);
    const total = await ShipmentModel.countDocuments(query);
    console.log(`Total shipments in DB: ${total}`);
    
    return successResponse(res, 200, 'Shipments fetched successfully', {
      shipments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    return errorResponse(res, 500, 'Failed to fetch shipments', error.message);
  }
};

// Get single shipment by ID
const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const shipment = await ShipmentModel.findById(id)
      .populate('supplier')
      .populate('items.drug')
      .populate('createdBy', 'name email')
      .populate('statusHistory.updatedBy', 'name email');
    
    if (!shipment) {
      return errorResponse(res, 404, 'Shipment not found');
    }
    
    return successResponse(res, 200, 'Shipment fetched successfully', shipment);
  } catch (error) {
    console.error('Get shipment error:', error);
    return errorResponse(res, 500, 'Failed to fetch shipment', error.message);
  }
};

// Create new shipment
const createShipment = async (req, res) => {
  try {
    const { supplier, items, expectedDeliveryDate, origin, destination } = req.body;
    
    // Validate required fields
    if (!supplier) {
      return errorResponse(res, 400, 'Supplier ID is required');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 400, 'Items array is required with at least one item');
    }
    
    // Verify supplier exists
    const supplierDoc = await SupplierModel.findById(supplier);
    if (!supplierDoc) {
      return errorResponse(res, 404, 'Supplier not found');
    }
    
    // Calculate total amount and validate items
    let totalAmount = 0;
    const validatedItems = [];
    
    for (const item of items) {
      if (!item.drug || !item.quantity) {
        return errorResponse(res, 400, 'Each item must have drug ID and quantity');
      }
      
      const drug = await Drug.findById(item.drug);
      if (!drug) {
        return errorResponse(res, 404, `Drug ${item.drug} not found`);
      }
      
      const quantity = parseInt(item.quantity);
      const unitPrice = parseInt(item.unitPrice || item.price) || 100;
      
      validatedItems.push({
        drug: item.drug,
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice
      });
      
      totalAmount += quantity * unitPrice;
    }
    
    // Generate tracking number
    const trackingNumber = `TRK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create shipment
    const shipmentData = {
      trackingNumber,
      supplier,
      items: validatedItems,
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      origin: origin || { city: 'Mumbai', state: 'Maharashtra', address: 'Origin Warehouse' },
      destination: destination || { city: 'Delhi', state: 'Delhi', address: 'Destination Warehouse' },
      totalAmount,
      status: 'pending',
      createdBy: req.user._id,
      statusHistory: [{
        status: 'pending',
        updatedBy: req.user._id,
        notes: 'Shipment created',
        timestamp: new Date()
      }]
    };
    
    const shipment = await ShipmentModel.create(shipmentData);
    
    // Populate before returning
    const populated = await ShipmentModel.findById(shipment._id)
      .populate('supplier', 'name email phone')
      .populate('items.drug', 'name genericName');
    
    return successResponse(res, 201, 'Shipment created successfully', populated);
  } catch (error) {
    console.error('Create shipment error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return errorResponse(res, 400, 'Validation failed', messages);
    }
    
    return errorResponse(res, 500, 'Failed to create shipment', error.message);
  }
};

// Update shipment
const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove protected fields
    delete updateData.createdBy;
    delete updateData.statusHistory;
    delete updateData._id;
    delete updateData.trackingNumber;
    delete updateData.status;
    
    const allowedFields = ['expectedDeliveryDate', 'origin', 'destination'];
    Object.keys(updateData).forEach(key => {
      if (!allowedFields.includes(key)) {
        delete updateData[key];
      }
    });
    
    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, 400, 'No valid fields to update');
    }
    
    // Format dates if present
    if (updateData.expectedDeliveryDate) {
      updateData.expectedDeliveryDate = new Date(updateData.expectedDeliveryDate);
    }
    
    const shipment = await ShipmentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('supplier', 'name email phone').populate('items.drug', 'name genericName');
    
    if (!shipment) {
      return errorResponse(res, 404, 'Shipment not found');
    }
    
    return successResponse(res, 200, 'Shipment updated successfully', shipment);
  } catch (error) {
    console.error('Update shipment error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return errorResponse(res, 400, 'Validation failed', messages);
    }
    
    return errorResponse(res, 500, 'Failed to update shipment', error.message);
  }
};

// Update shipment status
const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status.toLowerCase())) {
      return errorResponse(res, 400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const shipment = await ShipmentModel.findById(id);
    
    if (!shipment) {
      return errorResponse(res, 404, 'Shipment not found');
    }
    
    // Check if shipment is already in final state
    if (['delivered', 'cancelled'].includes(shipment.status)) {
      return errorResponse(res, 400, `Cannot modify ${shipment.status} shipment`);
    }
    
    // Status transition validation
    const validTransitions = {
      'pending': ['processing', 'shipped', 'in_transit', 'delivered', 'cancelled'],
      'processing': ['shipped', 'in_transit', 'delivered', 'cancelled'],
      'shipped': ['in_transit', 'delivered', 'cancelled'],
      'in_transit': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };
    
    const currentStatus = shipment.status.toLowerCase();
    const newStatus = status.toLowerCase();
    
    if (!validTransitions[currentStatus].includes(newStatus)) {
      return errorResponse(res, 400, `Cannot change status from ${currentStatus} to ${newStatus}. Valid transitions: ${validTransitions[currentStatus].join(', ')}`);
    }
    
    const oldStatus = shipment.status;
    shipment.status = newStatus;
    
    if (newStatus === 'delivered') {
      shipment.actualDeliveryDate = new Date();
    }
    
    shipment.statusHistory.push({
      status: newStatus,
      updatedBy: req.user._id,
      notes: notes || `Status changed from ${oldStatus} to ${newStatus}`,
      timestamp: new Date()
    });
    
    await shipment.save();
    
    return successResponse(res, 200, 'Shipment status updated successfully', shipment);
  } catch (error) {
    console.error('Update shipment status error:', error);
    return errorResponse(res, 500, 'Failed to update shipment status', error.message);
  }
};

// Delete shipment
const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const shipment = await ShipmentModel.findById(id);
    
    if (!shipment) {
      return errorResponse(res, 404, 'Shipment not found');
    }
    
    if (shipment.status === 'delivered') {
      return errorResponse(res, 400, 'Cannot delete delivered shipments. Cancel instead.');
    }
    
    await ShipmentModel.findByIdAndDelete(id);
    
    return successResponse(res, 200, 'Shipment deleted successfully');
  } catch (error) {
    console.error('Delete shipment error:', error);
    return errorResponse(res, 500, 'Failed to delete shipment', error.message);
  }
};

// Get shipment statistics
const getShipmentStats = async (req, res) => {
  try {
    console.log('getShipmentStats called');
    const stats = await ShipmentModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    console.log('Stats aggregation result:', stats);
    const totalShipments = await ShipmentModel.countDocuments();
    console.log('Total shipments in DB:', totalShipments);
    
    const totalValue = await ShipmentModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const delayedCount = await ShipmentModel.countDocuments({
      status: { $nin: ['delivered', 'cancelled'] },
      expectedDeliveryDate: { $lt: new Date() }
    });
    
    const formattedStats = {
      total: totalShipments,
      totalValue: totalValue[0]?.total || 0,
      delayed: delayedCount,
      pending: 0,
      processing: 0,
      shipped: 0,
      inTransit: 0,
      delivered: 0,
      cancelled: 0
    };
    
    stats.forEach(stat => {
      const statusKey = stat._id.toLowerCase();
      if (statusKey === 'in_transit') {
        formattedStats.inTransit = stat.count;
      } else if (statusKey in formattedStats) {
        formattedStats[statusKey] = stat.count;
      }
    });
    
    console.log('Formatted stats:', formattedStats);
    return successResponse(res, 200, 'Shipment statistics fetched', formattedStats);
  } catch (error) {
    console.error('Get shipment stats error:', error);
    return errorResponse(res, 500, 'Failed to fetch statistics', error.message);
  }
};

export default {
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipmentStatus,
  updateShipment,
  deleteShipment,
  getShipmentStats
};
