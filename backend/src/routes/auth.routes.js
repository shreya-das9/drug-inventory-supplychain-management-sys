
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/UserModel.js";
import AdminAllowedEmail from "../models/AdminAllowedEmailModel.js";
import { getEmailTransporter } from "../services/email.service.js";

const router = express.Router();

// Check if email is authorized to be admin (from database)
const isAdminAllowedEmail = async (email) => {
  try {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const allowedEmail = await AdminAllowedEmail.findOne({
      email: normalizedEmail,
      status: "ACTIVE"
    });
    return !!allowedEmail;
  } catch (error) {
    console.error("Error checking admin email:", error.message);
    return false;
  }
};

// =======================
// Signup
// =======================
// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedRole = String(req.body.role || "USER").toUpperCase();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (normalizedRole === "ADMIN" && !(await isAdminAllowedEmail(normalizedEmail))) {
      return res.status(403).json({
        message: "This email is not authorized to create an admin account"
      });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create new user
    const user = new User({ name, email: normalizedEmail, password, role: normalizedRole });
    await user.save();
    console.info('[SIGNUP_USER_CREATED]', { userId: user._id, email: user.email, requestedRole: normalizedRole, savedRole: user.role });

    // 🔑 generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );
    console.info('[SIGNUP_JWT_GENERATED]', { userId: user._id, email: user.email, jwtRole: user.role });

    // send response with token + user info
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// Login
// =======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    console.info("[auth] Login request received", { path: req.originalUrl, ip: req.ip });
    console.info("[auth] email received for login", { email: normalizedEmail });

    const user = await User.findOne({ email: normalizedEmail });
    console.info("[auth] database lookup result", { email: normalizedEmail, found: !!user, userId: user?._id });
    if (!user) {
      console.warn("[auth] login failed - user not found", { email: normalizedEmail });
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role === "ADMIN" && !(await isAdminAllowedEmail(normalizedEmail))) {
      console.warn("[auth] admin login rejected - unauthorized admin email", { email: normalizedEmail });
      return res.status(403).json({
        message: "This admin email is not authorized"
      });
    }

    console.info("[auth] comparing password for user", { userId: user._id });
    const isMatch = await user.matchPassword(password);
    console.info("[auth] password comparison result", { userId: user._id, matched: !!isMatch });
    if (!isMatch) {
      console.warn("[auth] login failed - invalid credentials", { userId: user._id });
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Ensure JWT secret is available
    if (!process.env.JWT_SECRET) {
      console.error("[auth] Login error: JWT_SECRET is not set in environment");
      return res.status(500).json({ message: "Server misconfiguration: missing JWT secret" });
    }

    // Generate JWT (guarded to avoid throwing unexpected errors)
    let token;
    try {
      console.info('[LOGIN_USER_RETRIEVED]', { userId: user._id, email: user.email, userRole: user.role });
      token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
      );
      // Log success of token generation, but do not log full token value
      console.info("[auth] JWT generated", { userId: user._id, tokenPreview: token?.slice?.(0, 8), jwtRole: user.role });
    } catch (signErr) {
      console.error("[auth] Login error signing JWT:", signErr && signErr.stack ? signErr.stack : signErr);
      return res.status(500).json({ message: "Internal server error" });
    }

    console.info("[auth] sending login success response", { userId: user._id });
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error && error.stack ? error.stack : error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// =======================
// Forgot password
// =======================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const transporter = getEmailTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Password Reset - Drug Inventory",
      html: `<p>Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.json({ message: "Password reset link sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// =======================
// Reset password
// =======================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = newPassword; // pre("save") will hash it
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// =======================
// Verify reset token
// =======================
router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    res.json({ message: "Valid reset token", email: user.email });
  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// =======================
// Logout
// =======================
router.post("/logout", (req, res) => {
  try {
    // In JWT-based auth, logout is handled client-side by removing the token
    // This endpoint serves as a confirmation
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      console.log(`✅ User logged out successfully`);
    }
    
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
