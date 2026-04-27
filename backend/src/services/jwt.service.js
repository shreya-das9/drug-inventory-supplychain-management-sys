/**
 * JWT Service (STUB)
 * 
 * NOTE: JWT functionality is currently handled directly in:
 * - middleware/auth.middleware.js (token verification)
 * - routes/auth.routes.js (token generation)
 * 
 * This service can be implemented if you want to centralize all JWT logic
 * in one place. Currently not used.
 * 
 * If you want to implement this service:
 * 1. Move all JWT signing/verification logic here
 * 2. Update imports in auth.middleware.js and auth.routes.js
 * 3. Keep all business logic in middleware/routes for consistency
 */

import jwt from "jsonwebtoken";

/**
 * Generate JWT token (example implementation)
 * @param {Object} payload - Token payload
 * @param {Object} options - JWT options (expiresIn, etc.)
 * @returns {string} JWT token
 */
export const generateToken = (payload, options = {}) => {
  const defaultOptions = {
    expiresIn: "7d",
    ...options
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, defaultOptions);
};

/**
 * Verify JWT token (example implementation)
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default {
  generateToken,
  verifyToken,
  decodeToken
};
