// import express from "express";
// //import { fetchDrugData } from "../../external/openfda.service.js";
// import { verifyToken, isWarehouseAdmin } from "../../middlewares/auth.middleware.js";
// import {
//   getAllDrugs,
//   getDrugById,
//   addDrug,
//   updateDrug,
//   deleteDrug,
//   bulkAddDrugs,
//   getDrugQRCode,
// } from "../../controllers/admin/drugs.controller.js";
// //import { fetchDrugData } from "../services/fda.service.js";

// //import express from "express";
// import { lookupDrug } from "../controllers/drug.controller.js";
// //const router = express.Router();

// // 🔍 GET /api/admin/drugs/lookup?name=Paracetamol
// router.get("/lookup", lookupDrug);

// //export default router;


// const router = express.Router();

// router.get("/", verifyToken, isWarehouseAdmin, getAllDrugs);
// router.get("/:id", verifyToken, isWarehouseAdmin, getDrugById);
// router.post("/", verifyToken, isWarehouseAdmin, addDrug);
// router.put("/:id", verifyToken, isWarehouseAdmin, updateDrug);
// router.delete("/:id", verifyToken, isWarehouseAdmin, deleteDrug);
// router.post("/bulk", verifyToken, isWarehouseAdmin, bulkAddDrugs);
// router.get("/:id/qrcode", verifyToken, isWarehouseAdmin, getDrugQRCode);

// export default router;

// routes/admin/drugs.routes.js
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