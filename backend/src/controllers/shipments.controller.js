import ShipmentModel from '../models/ShipmentModel.js';
import SupplierModel from '../models/SupplierModel.js';
import Drug from '../models/Drug.js';

// Get all shipments
const getAllShipments = async (req, res) => {
  try {
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
    
    const shipments = await ShipmentModel.find(query)
      .populate('supplier', 'name email phone contactPerson')
      .populate('items.drug', 'name genericName manufacturer')
      .populate('createdBy', 'name email')
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');
    
    const total = await ShipmentModel.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      message: 'Shipments fetched successfully',
      count: shipments.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      data: shipments
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch shipments',
      error: error.message
    });
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
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Shipment fetched successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Get shipment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch shipment',
      error: error.message
    });
  }
};

// Create new shipment
const createShipment = async (req, res) => {
  try {
    const { supplier, items, expectedDeliveryDate, shippingMethod } = req.body;
    
    // Verify supplier exists and is approved
    const supplierDoc = await SupplierModel.findById(supplier);
    if (!supplierDoc) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    if (supplierDoc.status.toLowerCase() !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Can only create shipments with approved suppliers'
      });
    }
    
    // Verify all drugs exist
    const drugIds = items.map(item => item.drug);
    const drugs = await Drug.find({ _id: { $in: drugIds } });
    
    if (drugs.length !== drugIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more drugs not found'
      });
    }
    
    // Calculate total amount
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.quantity * item.unitPrice;
    });
    
    // Create shipment
    const shipmentData = {
      ...req.body,
      totalAmount,
      createdBy: req.user.id || req.user._id,
      statusHistory: [{
        status: 'pending',
        updatedBy: req.user.id || req.user._id,
        notes: 'Shipment created',
        timestamp: new Date()
      }]
    };
    
    const shipment = await ShipmentModel.create(shipmentData);
    
    // Update supplier's total orders
    supplierDoc.totalOrders = (supplierDoc.totalOrders || 0) + 1;
    await supplierDoc.save();
    
    return res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create shipment',
      error: error.message
    });
  }
};

// Update shipment status
const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const shipment = await ShipmentModel.findById(id);
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    // Check if shipment is already in final state
    if (['delivered', 'cancelled'].includes(shipment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot modify ${shipment.status} shipment`
      });
    }
    
    // ✅ ADD STATUS TRANSITION VALIDATION
    const validTransitions = {
      'pending': ['processing', 'shipped', 'cancelled'],
      'processing': ['shipped', 'in_transit', 'cancelled'],
      'shipped': ['in_transit', 'delivered', 'cancelled'],
      'in_transit': ['delivered', 'cancelled'],
      'delivered': [],  // Final state
      'cancelled': []   // Final state
    };
    
    const currentStatus = shipment.status.toLowerCase();
    const newStatus = status.toLowerCase();
    
    // Check if transition is valid
    if (!validTransitions[currentStatus].includes(newStatus)) {
      let errorMessage = `Cannot change status from ${currentStatus.toUpperCase()} to ${newStatus.toUpperCase()}.`;
      
      // Provide helpful error messages
      if (currentStatus === 'pending' && newStatus === 'delivered') {
        errorMessage += ' Must go through SHIPPED first.';
      } else if (currentStatus === 'pending' && newStatus === 'in_transit') {
        errorMessage += ' Must go through PROCESSING or SHIPPED first.';
      } else if (currentStatus === 'processing' && newStatus === 'delivered') {
        errorMessage += ' Must go through SHIPPED or IN_TRANSIT first.';
      } else if (currentStatus === 'shipped' && newStatus === 'pending') {
        errorMessage += ' Cannot go backwards to PENDING.';
      } else {
        errorMessage += ` Valid transitions from ${currentStatus.toUpperCase()} are: ${validTransitions[currentStatus].map(s => s.toUpperCase()).join(', ')}.`;
      }
      
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    
    const oldStatus = shipment.status;
    shipment.status = status.toLowerCase();
    
    if (status.toLowerCase() === 'delivered') {
      shipment.actualDeliveryDate = new Date();
    }
    
    shipment.statusHistory.push({
      status,
      updatedBy: req.user.id || req.user._id,
      notes: notes || `Status changed from ${oldStatus} to ${status}`,
      timestamp: new Date()
    });
    
    await shipment.save();
    
    return res.status(200).json({
      success: true,
      message: 'Shipment status updated successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Update shipment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update shipment status',
      error: error.message
    });
  }
};

// Delete shipment
const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const shipment = await ShipmentModel.findById(id);
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    if (shipment.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete delivered shipments. Cancel instead.'
      });
    }
    
    await shipment.deleteOne();
    
    return res.status(200).json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete shipment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete shipment',
      error: error.message
    });
  }
};

// Get shipment statistics
const getShipmentStats = async (req, res) => {
  try {
    const stats = await ShipmentModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const totalShipments = await ShipmentModel.countDocuments();
    const totalValue = await ShipmentModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const delayedCount = await ShipmentModel.countDocuments({
      status: { $nin: ['delivered', 'cancelled'] },
      expectedDeliveryDate: { $lt: new Date() }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Shipment statistics fetched',
      data: {
        totalShipments,
        totalValue: totalValue[0]?.total || 0,
        delayedShipments: delayedCount,
        byStatus: stats
      }
    });
  } catch (error) {
    console.error('Get shipment stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

export default {
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipmentStatus,
  deleteShipment,
  getShipmentStats
};