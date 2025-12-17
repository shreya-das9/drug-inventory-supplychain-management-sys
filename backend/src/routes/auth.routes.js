
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/UserModel.js";
import { getEmailTransporter } from "../services/email.service.js";

const router = express.Router();

// =======================
// Signup
// =======================
// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create new user
    const user = new User({ name, email, password, role });
    await user.save();

    // 🔑 generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );

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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );

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
    console.error("Login error:", error);
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

    const user = await User.findOne({ email });
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
      to: email,
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
