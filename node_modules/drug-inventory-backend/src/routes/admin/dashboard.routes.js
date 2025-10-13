// import express from "express";
// import { verifyToken, isWarehouseAdmin } from "../../middlewares/auth.middleware.js";
// import { getStats, getAlerts, resolveAlert } from "../../controllers/admin/dashboard.controller.js";

// const router = express.Router();

// router.get("/stats", verifyToken, isWarehouseAdmin, getStats);
// router.get("/alerts", verifyToken, isWarehouseAdmin, getAlerts);
// router.post("/alerts/:id/resolve", verifyToken, isWarehouseAdmin, resolveAlert);

// export default router;
// routes/admin/dashboard.routes.js
import express from "express";
import { verifyToken, isWarehouseAdmin } from "../../middleware/auth.middleware.js";
import { getStats, getAlerts, resolveAlert } from "../../controllers/admin/dashboard.controller.js";

const router = express.Router();

router.get("/stats", verifyToken, isWarehouseAdmin, getStats);
router.get("/alerts", verifyToken, isWarehouseAdmin, getAlerts);
router.post("/alerts/:id/resolve", verifyToken, isWarehouseAdmin, resolveAlert);

export default router;