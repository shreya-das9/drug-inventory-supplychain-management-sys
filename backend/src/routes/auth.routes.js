// backend/src/routes/auth.routes.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getEmailTransporter } from "../services/email.service.js";
const router = express.Router();

// ===================================
// Forgot password route
// ===================================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    // TODO: Uncomment when User model is ready
    // const user = await User.findOne({ email });
    // if (!user) {
    //   return res.json({
    //     message: "If an account with that email exists, a password reset link has been sent.",
    //   });
    // }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // TODO: Save reset token to user in DB
    // await User.updateOne({ email }, { resetToken, resetTokenExpiry });

    console.log("Reset token generated for", email, ":", resetToken);

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // Get the email transporter
    const transporter = getEmailTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - Drug Inventory",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===================================
// Reset password route
// ===================================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasNonalphas = /\W/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasNonalphas) {
      return res.status(400).json({
        message: "Password must contain uppercase, lowercase, number, and special character",
      });
    }

    // TODO: Uncomment when User model is ready
    // const user = await User.findOne({
    //   resetToken: token,
    //   resetTokenExpiry: { $gt: new Date() }
    // });

    // if (!user) {
    //   return res.status(400).json({ message: "Invalid or expired reset token" });
    // }

    console.log("Password reset attempted with token:", token);

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // TODO: Save updated password & clear token in DB
    // await User.updateOne(
    //   { _id: user._id },
    //   { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
    // );

    console.log("Password would be updated with hash:", hashedPassword);

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Auth routes are working",
    timestamp: new Date().toISOString(),
  });
});

// Test route
router.get("/test", (req, res) => {
  res.json({
    message: "Router is working correctly!",
    route: "/api/auth/test",
  });
});
// ===================================
// Verify reset token route
// ===================================
router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }

    // TODO: Uncomment when User model is ready
    // const user = await User.findOne({
    //   resetToken: token,
    //   resetTokenExpiry: { $gt: new Date() }
    // });

    // if (!user) {
    //   return res.status(400).json({ message: "Invalid or expired reset token" });
    // }

    console.log("Token verification attempted for token:", token);

    // For now, simulate a valid token response
    res.json({
      message: "Reset token is valid",
      // email: user.email // Uncomment when User model is ready
    });

  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

 export default router;
