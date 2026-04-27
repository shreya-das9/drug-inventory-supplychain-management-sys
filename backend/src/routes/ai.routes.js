import express from "express";
import { verifyToken, isWarehouseAdmin, isAdmin } from "../middleware/auth.middleware.js";
import {
  getAiSummary,
  predictInventory,
  detectFraudSignals,
  evaluateSupplyChain
} from "../controllers/ai.controller.js";

const router = express.Router();

router.use(verifyToken);

router.get("/summary", isWarehouseAdmin, getAiSummary);
router.get("/inventory-prediction", isWarehouseAdmin, predictInventory);
router.get("/fraud-signals", isAdmin, detectFraudSignals);
router.get("/supply-chain", isWarehouseAdmin, evaluateSupplyChain);

export default router;