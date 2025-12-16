const { errorResponse } = require('../utils/response');

// Supplier validation schemas
const validateSupplier = (req, res, next) => {
  const { name, email, phone, address, contactPerson } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Supplier name must be at least 2 characters');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    errors.push('Valid 10-digit phone number is required');
  }

  if (!contactPerson || contactPerson.trim().length < 2) {
    errors.push('Contact person name is required');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  next();
};

// Shipment validation
const validateShipment = (req, res, next) => {
  const { supplier, items, expectedDeliveryDate, shippingMethod } = req.body;
  const errors = [];

  if (!supplier || !supplier.match(/^[0-9a-fA-F]{24}$/)) {
    errors.push('Valid supplier ID is required');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('At least one item is required');
  } else {
    items.forEach((item, index) => {
      if (!item.drug || !item.drug.match(/^[0-9a-fA-F]{24}$/)) {
        errors.push(`Item ${index + 1}: Valid drug ID is required`);
      }
      if (!item.quantity || item.quantity < 1) {
        errors.push(`Item ${index + 1}: Quantity must be at least 1`);
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        errors.push(`Item ${index + 1}: Valid unit price is required`);
      }
    });
  }

  if (!expectedDeliveryDate) {
    errors.push('Expected delivery date is required');
  } else {
    const deliveryDate = new Date(expectedDeliveryDate);
    if (isNaN(deliveryDate.getTime())) {
      errors.push('Invalid delivery date format');
    } else if (deliveryDate < new Date()) {
      errors.push('Delivery date cannot be in the past');
    }
  }

  const validShippingMethods = ['air', 'ground', 'express', 'standard'];
  if (shippingMethod && !validShippingMethods.includes(shippingMethod)) {
    errors.push(`Shipping method must be one of: ${validShippingMethods.join(', ')}`);
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  next();
};

// Order status validation
const validateOrderStatus = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!status) {
    return errorResponse(res, 400, 'Status is required');
  }

  if (!validStatuses.includes(status)) {
    return errorResponse(res, 400, `Status must be one of: ${validStatuses.join(', ')}`);
  }

  next();
};

// Shipment status validation
const validateShipmentStatus = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled'];

  if (!status) {
    return errorResponse(res, 400, 'Status is required');
  }

  if (!validStatuses.includes(status)) {
    return errorResponse(res, 400, `Status must be one of: ${validStatuses.join(', ')}`);
  }

  next();
};

// Supplier approval validation
const validateSupplierApproval = (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return errorResponse(res, 400, 'Status is required');
  }

  if (!['approved', 'rejected'].includes(status)) {
    return errorResponse(res, 400, 'Status must be either "approved" or "rejected"');
  }

  if (status === 'rejected' && !req.body.rejectionReason) {
    return errorResponse(res, 400, 'Rejection reason is required when rejecting a supplier');
  }

  next();
};

// MongoDB ObjectId validation
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return errorResponse(res, 400, `Invalid ${paramName} format`);
    }
    
    next();
  };
};

// Pagination validation
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return errorResponse(res, 400, 'Page must be a positive number');
  }

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return errorResponse(res, 400, 'Limit must be between 1 and 100');
  }

  next();
};

module.exports = {
  validateSupplier,
  validateShipment,
  validateOrderStatus,
  validateShipmentStatus,
  validateSupplierApproval,
  validateObjectId,
  validatePagination
};