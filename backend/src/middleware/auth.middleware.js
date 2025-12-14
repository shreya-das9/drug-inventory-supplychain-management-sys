// middleware/auth.middleware.js
import jwt from "jsonwebtoken";

// 🔐 Verify JWT Token
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// 🏭 Warehouse Admin / Admin Access
export const isWarehouseAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Case-insensitive role check
  const userRole = req.user.role?.toLowerCase();

  if (
    userRole !== "warehouse_admin" &&
    userRole !== "admin" &&
    userRole !== "warehouse"
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Warehouse admin role required.",
    });
  }

  next();
};

// 👑 Admin-Only Access
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const userRole = req.user.role?.toLowerCase();

  if (userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }

  next();
};
