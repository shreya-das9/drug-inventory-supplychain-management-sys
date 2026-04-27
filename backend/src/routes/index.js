import express from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import bleRoutes from "./ble.routes.js";
import userRoutes from "./user.routes.js";
import aiRoutes from "./ai.routes.js";
import complianceRoutes from "./compliance.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/ble", bleRoutes);
router.use("/users", userRoutes);
router.use("/ai", aiRoutes);
router.use("/compliance", complianceRoutes);

export default router;
