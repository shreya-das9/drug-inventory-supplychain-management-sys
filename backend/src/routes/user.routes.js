import express from "express";
import User from "../models/UserModel.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { createRetailerOrderWorkflow } from "../services/retailerOrderWorkflow.service.js";
import OrderModel from "../models/OrderModel.js";

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

router.post("/retailer/orders", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();

    if (role !== "RETAILER") {
      return errorResponse(res, 403, "Access denied. Retailer role required.");
    }

    const { medicine, quantity, qty, totalAmount, purchaseOrderNumber } = req.body;
    const result = await createRetailerOrderWorkflow({
      user: req.user,
      medicine,
      quantity: quantity ?? qty,
      totalAmount,
      purchaseOrderNumber,
    });

    const statusCode = result.workflow.inventoryAvailable ? 201 : 202;
    return successResponse(res, statusCode, "Retailer order created successfully", result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, statusCode, error.message || "Failed to create retailer order");
  }
});

// Get retailer's orders
router.get("/retailer/orders", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();

    if (role !== "RETAILER") {
      return errorResponse(res, 403, "Access denied. Retailer role required.");
    }

    const { page = 1, limit = 10, status = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { user: req.user._id || req.user.id };
    if (status) {
      query.status = status.toLowerCase();
    }

    const orders = await OrderModel.find(query)
      .populate("items.drug", "name genericName manufacturer")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await OrderModel.countDocuments(query);

    return successResponse(res, 200, "Retailer orders fetched successfully", {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get retailer orders error:", error);
    return errorResponse(res, 500, "Failed to fetch retailer orders", error.message);
  }
});

// Cancel retailer order
router.patch("/retailer/orders/:id/cancel", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();

    if (role !== "RETAILER") {
      return errorResponse(res, 403, "Access denied. Retailer role required.");
    }

    const { id } = req.params;
    const { reason } = req.body;

    const order = await OrderModel.findById(id);

    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    // Verify order belongs to retailer
    if (order.user.toString() !== req.user._id.toString() && order.user.toString() !== req.user.id.toString()) {
      return errorResponse(res, 403, "You can only cancel your own orders");
    }

    // Check if order can be cancelled
    if (["completed", "cancelled", "delivered"].includes(order.status)) {
      return errorResponse(res, 400, `Cannot cancel ${order.status} order`);
    }

    // Update order status
    order.status = "cancelled";
    if (reason) {
      order.cancellationReason = reason;
      order.notes = reason;
    }

    // Add to status history
    order.statusHistory.push({
      status: "cancelled",
      timestamp: new Date(),
      updatedBy: req.user._id || req.user.id,
      notes: reason || "Order cancelled by retailer",
    });

    await order.save();

    return successResponse(res, 200, "Order cancelled successfully", order);
  } catch (error) {
    console.error("Cancel retailer order error:", error);
    return errorResponse(res, 500, "Failed to cancel order", error.message);
  }
});

// Delete retailer order (only pending/cancelled)
router.delete("/retailer/orders/:id", async (req, res) => {
  try {
    const role = String(req.user?.role || "").toUpperCase();

    if (role !== "RETAILER") {
      return errorResponse(res, 403, "Access denied. Retailer role required.");
    }

    const { id } = req.params;

    const order = await OrderModel.findById(id);

    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    // Verify order belongs to retailer
    if (order.user.toString() !== req.user._id.toString() && order.user.toString() !== req.user.id.toString()) {
      return errorResponse(res, 403, "You can only delete your own orders");
    }

    // Only allow deletion of pending or cancelled orders
    if (!["pending", "cancelled"].includes(order.status)) {
      return errorResponse(res, 400, `Can only delete pending or cancelled orders. Current status: ${order.status}`);
    }

    await order.deleteOne();

    return successResponse(res, 200, "Order deleted successfully");
  } catch (error) {
    console.error("Delete retailer order error:", error);
    return errorResponse(res, 500, "Failed to delete order", error.message);
  }
});

export default router;