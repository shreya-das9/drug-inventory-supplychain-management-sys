import express from "express";
import { verifyToken, isWarehouseAdmin, isAdmin } from "../middleware/auth.middleware.js";
import {
  listReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getComplianceStats
} from "../controllers/compliance.controller.js";

const router = express.Router();

router.use(verifyToken);

router.get("/stats", isWarehouseAdmin, getComplianceStats);
router.get("/", isWarehouseAdmin, listReports);
router.get("/:id", isWarehouseAdmin, getReportById);
router.post("/", isWarehouseAdmin, createReport);
router.put("/:id", isWarehouseAdmin, updateReport);
router.delete("/:id", isAdmin, deleteReport);

export default router;