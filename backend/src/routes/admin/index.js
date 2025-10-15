import express from "express";
import dashboardRoutes from "./dashboard.routes.js";
import drugsRoutes from "./drugs.routes.js";
import inventoryRoutes from "./inventory.routes.js";


const router = express.Router();

router.use("/dashboard", dashboardRoutes);
router.use("/drugs", drugsRoutes);
router.use("/inventory", inventoryRoutes);


export default router;
