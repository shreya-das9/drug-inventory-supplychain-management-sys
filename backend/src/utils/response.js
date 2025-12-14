/**
 * Standard success response format
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {*} data - Response data
 */
export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
    data
  };

  return res.status(statusCode).json(response);
};

/**
 * Standard error response format
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {*} errors - Additional error details
 */
export const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors })
  };

  return res.status(statusCode).json(response);
};