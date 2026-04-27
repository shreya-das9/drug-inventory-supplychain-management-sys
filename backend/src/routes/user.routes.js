import express from "express";
import User from "../models/UserModel.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

router.use(verifyToken);

router.get("/me", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -resetToken -resetTokenExpiry");
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, "Current user fetched successfully", user);
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch current user", error.message);
  }
});

router.patch("/me", async (req, res) => {
  try {
    const allowedFields = ["name", "email", "password"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    Object.assign(user, updates);
    await user.save();

    return successResponse(res, 200, "Profile updated successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to update profile", error.message);
  }
});

router.get("/", isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password -resetToken -resetTokenExpiry").sort({ createdAt: -1 });
    return successResponse(res, 200, "Users fetched successfully", users);
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch users", error.message);
  }
});

router.get("/roles", (req, res) => {
  return successResponse(res, 200, "Roles fetched successfully", ["ADMIN", "WAREHOUSE", "RETAILER", "USER"]);
});

export default router;