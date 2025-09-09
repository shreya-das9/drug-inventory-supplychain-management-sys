// // backend/src/routes/auth.routes.js
// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";
// import { getEmailTransporter } from "../services/email.service.js";
// const router = express.Router();

// // ===================================
// // Forgot password route
// // ===================================
// router.post("/forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: "Please provide a valid email address" });
//     }

//     // TODO: Uncomment when User model is ready
//     // const user = await User.findOne({ email });
//     // if (!user) {
//     //   return res.json({
//     //     message: "If an account with that email exists, a password reset link has been sent.",
//     //   });
//     // }

//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

//     // TODO: Save reset token to user in DB
//     // await User.updateOne({ email }, { resetToken, resetTokenExpiry });

//     console.log("Reset token generated for", email, ":", resetToken);

//     // Create reset URL
//     const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

//     // Get the email transporter
//     const transporter = getEmailTransporter();

//     const mailOptions = {
//       from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
//       to: email,
//       subject: "Password Reset Request - Drug Inventory",
//       html: `
//         <p>Hello,</p>
//         <p>You requested a password reset. Click below to reset your password:</p>
//         <a href="${resetUrl}">Reset Password</a>
//         <p>This link will expire in 1 hour.</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);

//     res.json({
//       message: "If an account with that email exists, a password reset link has been sent.",
//     });
//   } catch (error) {
//     console.error("Forgot password error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // ===================================
// // Reset password route
// // ===================================
// router.post("/reset-password", async (req, res) => {
//   try {
//     const { token, newPassword } = req.body;

//     if (!token || !newPassword) {
//       return res.status(400).json({ message: "Token and new password are required" });
//     }

//     if (newPassword.length < 8) {
//       return res.status(400).json({ message: "Password must be at least 8 characters long" });
//     }

//     const hasUpperCase = /[A-Z]/.test(newPassword);
//     const hasLowerCase = /[a-z]/.test(newPassword);
//     const hasNumbers = /\d/.test(newPassword);
//     const hasNonalphas = /\W/.test(newPassword);

//     if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasNonalphas) {
//       return res.status(400).json({
//         message: "Password must contain uppercase, lowercase, number, and special character",
//       });
//     }

//     // TODO: Uncomment when User model is ready
//     // const user = await User.findOne({
//     //   resetToken: token,
//     //   resetTokenExpiry: { $gt: new Date() }
//     // });

//     // if (!user) {
//     //   return res.status(400).json({ message: "Invalid or expired reset token" });
//     // }

//     console.log("Password reset attempted with token:", token);

//     const hashedPassword = await bcrypt.hash(newPassword, 12);

//     // TODO: Save updated password & clear token in DB
//     // await User.updateOne(
//     //   { _id: user._id },
//     //   { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
//     // );

//     console.log("Password would be updated with hash:", hashedPassword);

//     res.json({ message: "Password has been reset successfully" });
//   } catch (error) {
//     console.error("Reset password error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Health check
// router.get("/health", (req, res) => {
//   res.json({
//     status: "OK",
//     message: "Auth routes are working",
//     timestamp: new Date().toISOString(),
//   });
// });

// // Test route
// router.get("/test", (req, res) => {
//   res.json({
//     message: "Router is working correctly!",
//     route: "/api/auth/test",
//   });
// });
// // ===================================
// // Verify reset token route
// // ===================================
// router.get("/verify-reset-token/:token", async (req, res) => {
//   try {
//     const { token } = req.params;

//     if (!token) {
//       return res.status(400).json({ message: "Reset token is required" });
//     }

//     // TODO: Uncomment when User model is ready
//     // const user = await User.findOne({
//     //   resetToken: token,
//     //   resetTokenExpiry: { $gt: new Date() }
//     // });

//     // if (!user) {
//     //   return res.status(400).json({ message: "Invalid or expired reset token" });
//     // }

//     console.log("Token verification attempted for token:", token);

//     // For now, simulate a valid token response
//     res.json({
//       message: "Reset token is valid",
//       // email: user.email // Uncomment when User model is ready
//     });

//   } catch (error) {
//     console.error("Verify reset token error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

//  export default router;
// backend/src/routes/auth.routes.js
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

export default router;
