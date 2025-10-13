import express from "express";
import dashboardRoutes from "./dashboard.routes.js";
import drugsRoutes from "./drugs.routes.js";
import inventoryRoutes from "./inventory.routes.js";
// import suppliersRoutes from "./suppliers.routes.js";
// import ordersRoutes from "./orders.routes.js";
// import shipmentsRoutes from "./shipments.routes.js";
// import scanlogsRoutes from "./scanlogs.routes.js";
// import reportsRoutes from "./reports.routes.js";

const router = express.Router();

router.use("/dashboard", dashboardRoutes);
router.use("/drugs", drugsRoutes);
router.use("/inventory", inventoryRoutes);
// router.use("/suppliers", suppliersRoutes);
// router.use("/orders", ordersRoutes);
// router.use("/shipments", shipmentsRoutes);
// router.use("/scanlogs", scanlogsRoutes);
// router.use("/reports", reportsRoutes);

export default router;
