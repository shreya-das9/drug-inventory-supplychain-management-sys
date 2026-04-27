/**
 * Validation Utility
 * Provides helpers for validating API responses and data integrity
 */

/**
 * Validate required fields in an object
 * @param {Object} obj - Object to validate
 * @param {Array<string>} requiredFields - List of required field names
 * @param {string} context - Context for error messages (e.g., "Drug data")
 * @returns {Object} The validated object
 * @throws {Error} If required fields are missing
 */
export const validateRequired = (obj, requiredFields, context = "Data") => {
  if (!obj) {
    throw new Error(`${context}: Object is null or undefined`);
  }

  const missing = requiredFields.filter(field => {
    const value = obj[field];
    return value === null || value === undefined || value === "";
  });

  if (missing.length > 0) {
    throw new Error(`${context}: Missing required fields: ${missing.join(", ")}`);
  }

  return obj;
};

/**
 * Validate field types in an object
 * @param {Object} obj - Object to validate
 * @param {Object} schema - Schema defining expected types { fieldName: "type" }
 * @param {string} context - Context for error messages
 * @returns {Object} The validated object
 * @throws {Error} If field types don't match
 */
export const validateTypes = (obj, schema, context = "Data") => {
  if (!obj) {
    throw new Error(`${context}: Object is null or undefined`);
  }

  const errors = [];

  for (const [field, expectedType] of Object.entries(schema)) {
    const value = obj[field];
    
    if (value !== null && value !== undefined && value !== "") {
      const actualType = Array.isArray(value) ? "array" : typeof value;
      
      if (expectedType === "date") {
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          errors.push(`${field}: Expected date, got ${actualType}`);
        }
      } else if (expectedType === "array") {
        if (!Array.isArray(value)) {
          errors.push(`${field}: Expected array, got ${actualType}`);
        }
      } else if (expectedType === "number") {
        if (typeof value !== "number" && isNaN(Number(value))) {
          errors.push(`${field}: Expected number, got ${actualType}`);
        }
      } else if (actualType !== expectedType) {
        errors.push(`${field}: Expected ${expectedType}, got ${actualType}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`${context}: ${errors.join("; ")}`);
  }

  return obj;
};

/**
 * Validate an array of objects with schema
 * @param {Array} items - Array of items to validate
 * @param {Array<string>} requiredFields - Required fields for each item
 * @param {Object} schema - Type schema for validation
 * @param {string} context - Context for error messages
 * @returns {Array} Validated array (filters out invalid items, logs errors)
 */
export const validateArray = (items, requiredFields = [], schema = {}, context = "Items") => {
  if (!Array.isArray(items)) {
    console.warn(`${context}: Expected array, got ${typeof items}`);
    return [];
  }

  const validated = [];
  const errors = [];

  items.forEach((item, index) => {
    try {
      if (requiredFields.length > 0) {
        validateRequired(item, requiredFields, `${context}[${index}]`);
      }
      if (Object.keys(schema).length > 0) {
        validateTypes(item, schema, `${context}[${index}]`);
      }
      validated.push(item);
    } catch (error) {
      errors.push(`Index ${index}: ${error.message}`);
    }
  });

  if (errors.length > 0) {
    console.warn(`${context} validation warnings:`, errors);
  }

  return validated;
};

/**
 * Sanitize response object to ensure all required fields exist
 * @param {Object} data - Data to sanitize
 * @param {Array<string>} requiredFields - Fields that must be present
 * @param {Object} defaults - Default values for missing fields
 * @returns {Object} Sanitized object with all required fields
 */
export const sanitizeResponse = (data, requiredFields = [], defaults = {}) => {
  if (!data) {
    data = {};
  }

  const sanitized = { ...data };

  // Ensure all required fields exist
  requiredFields.forEach(field => {
    if (!(field in sanitized)) {
      sanitized[field] = defaults[field] !== undefined ? defaults[field] : null;
    }
  });

  return sanitized;
};

/**
 * Validate drug data from database
 * @param {Object} drug - Drug object
 * @returns {Object} Validated drug object
 */
export const validateDrugData = (drug) => {
  const schema = {
    _id: "string",
    name: "string",
    batchNumber: "string",
    category: "string",
    manufacturer: "string",
    price: "number",
    expiryDate: "date",
    description: "string"
  };

  const requiredFields = ["_id", "name", "batchNumber"];
  const defaults = {
    category: "Uncategorized",
    manufacturer: "Unknown",
    price: 0,
    description: ""
  };

  validateRequired(drug, requiredFields, "Drug");
  validateTypes(drug, schema, "Drug");
  return sanitizeResponse(drug, [...requiredFields, "category", "manufacturer", "price", "description"], defaults);
};

/**
 * Validate inventory data from database
 * @param {Object} inventory - Inventory object
 * @returns {Object} Validated inventory object
 */
export const validateInventoryData = (inventory) => {
  const schema = {
    _id: "string",
    quantity: "number",
    threshold: "number",
    warehouseLocation: "string",
    batchNo: "string"
  };

  const requiredFields = ["_id", "quantity", "warehouseLocation"];
  const defaults = {
    threshold: 10,
    batchNo: "N/A"
  };

  validateRequired(inventory, requiredFields, "Inventory");
  validateTypes(inventory, schema, "Inventory");
  return sanitizeResponse(inventory, [...requiredFields, "threshold", "batchNo"], defaults);
};

/**
 * Validate order data from database
 * @param {Object} order - Order object
 * @returns {Object} Validated order object
 */
export const validateOrderData = (order) => {
  const schema = {
    _id: "string",
    orderNumber: "string",
    status: "string",
    totalAmount: "number",
    items: "array",
    createdAt: "date"
  };

  const requiredFields = ["_id", "orderNumber", "status"];
  const defaults = {
    totalAmount: 0,
    items: [],
    status: "PENDING"
  };

  validateRequired(order, requiredFields, "Order");
  validateTypes(order, schema, "Order");
  return sanitizeResponse(order, [...requiredFields, "totalAmount", "items"], defaults);
};

/**
 * Validate shipment data from database
 * @param {Object} shipment - Shipment object
 * @returns {Object} Validated shipment object
 */
export const validateShipmentData = (shipment) => {
  const schema = {
    _id: "string",
    shipmentId: "string",
    status: "string",
    destination: "string",
    createdAt: "date"
  };

  const requiredFields = ["_id", "shipmentId", "status", "destination"];
  const defaults = {
    status: "PENDING"
  };

  validateRequired(shipment, requiredFields, "Shipment");
  validateTypes(shipment, schema, "Shipment");
  return sanitizeResponse(shipment, [...requiredFields, "status"], defaults);
};

/**
 * Validate expiry alert data
 * @param {Object} alert - Expiry alert object
 * @returns {Object} Validated alert object
 */
export const validateExpiryAlert = (alert) => {
  const schema = {
    name: "string",
    batchNumber: "string",
    expiryDate: "date"
  };

  const requiredFields = ["name"];
  const defaults = {
    batchNumber: "N/A",
    expiryDate: null
  };

  validateRequired(alert, requiredFields, "Expiry Alert");
  // Only validate types if fields are present
  const fieldsToValidate = Object.keys(schema).filter(key => alert[key] !== undefined && alert[key] !== null);
  const typeSchema = fieldsToValidate.reduce((acc, key) => {
    acc[key] = schema[key];
    return acc;
  }, {});
  
  if (Object.keys(typeSchema).length > 0) {
    validateTypes(alert, typeSchema, "Expiry Alert");
  }
  
  return sanitizeResponse(alert, requiredFields, defaults);
};

/**
 * Validate low stock alert data
 * @param {Object} alert - Low stock alert object
 * @returns {Object} Validated alert object
 */
export const validateLowStockAlert = (alert) => {
  const schema = {
    _id: "string",
    quantity: "number",
    threshold: "number",
    warehouseLocation: "string"
  };

  const requiredFields = ["_id", "quantity"];
  const defaults = {
    threshold: 10,
    warehouseLocation: "Unknown",
    drugName: "Unknown Drug"
  };

  validateRequired(alert, requiredFields, "Low Stock Alert");
  validateTypes(alert, schema, "Low Stock Alert");
  return sanitizeResponse(alert, requiredFields, defaults);
};

export default {
  validateRequired,
  validateTypes,
  validateArray,
  sanitizeResponse,
  validateDrugData,
  validateInventoryData,
  validateOrderData,
  validateShipmentData,
  validateExpiryAlert,
  validateLowStockAlert
};
