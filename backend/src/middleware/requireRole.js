export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const role = String(req.user.role || "").toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((item) => String(item).toLowerCase());

    if (!normalizedAllowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    next();
  };
};

export default requireRole;