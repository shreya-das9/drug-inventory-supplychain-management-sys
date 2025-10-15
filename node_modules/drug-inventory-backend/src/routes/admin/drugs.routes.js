
import express from "express";
import { verifyToken, isWarehouseAdmin } from "../../middleware/auth.middleware.js";
import {
  getAllDrugs,
  getDrugById,
  addDrug,
  updateDrug,
  deleteDrug,
  bulkAddDrugs,
} from "../../controllers/admin/drugs.controller.js";
 
const router = express.Router();

router.get("/", verifyToken, isWarehouseAdmin, getAllDrugs);
// Temporarily comment out the middleware
//router.get("/", getAllDrugs); // removed verifyToken, isWarehouseAdmin
router.post("/", verifyToken, isWarehouseAdmin, addDrug);
router.post("/bulk", verifyToken, isWarehouseAdmin, bulkAddDrugs);
router.get("/:id", verifyToken, isWarehouseAdmin, getDrugById);
router.put("/:id", verifyToken, isWarehouseAdmin, updateDrug);
router.delete("/:id", verifyToken, isWarehouseAdmin, deleteDrug);

export default router;