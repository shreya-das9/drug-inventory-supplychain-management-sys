/**
 * Auth Service (STUB)
 * 
 * NOTE: Authentication functionality is currently handled directly in:
 * - routes/auth.routes.js (signup, login, password reset)
 * - middleware/auth.middleware.js (token verification)
 * 
 * This service can be implemented if you want to centralize all auth logic
 * in one place. Currently not used.
 * 
 * If you want to implement this service:
 * 1. Move signup/login/password reset logic here from auth.routes.js
 * 2. Keep route handlers lightweight (just call service methods)
 * 3. All business logic stays in the service
 * 
 * Current pattern (route-based):
 * router.post("/login", (req, res) => { auth logic here })
 * 
 * Recommended pattern (service-based):
 * router.post("/login", (req, res) => { await authService.login(req.body) })
 */

import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Login user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Object} User object and JWT token
 */
export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

/**
 * Register new user
 * @param {Object} userData - User data for registration
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.role - User role
 * @returns {Object} Newly created user
 */
export const register = async ({ name, email, password, role = "USER" }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const user = new User({ name, email, password, role });
  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

/**
 * Request password reset
 * @param {string} email - User email
 */
export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  // Generate reset token (implementation depends on your requirements)
  // Could use JWT or random token
  // Store in database with expiration
};

/**
 * Reset password with token
 * @param {string} resetToken - Password reset token
 * @param {string} newPassword - New password
 */
export const resetPassword = async (resetToken, newPassword) => {
  // Verify reset token
  // Update user password
  // Invalidate token
};

export default {
  login,
  register,
  requestPasswordReset,
  resetPassword
};
