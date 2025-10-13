// import express from "express";
// import { verifyToken, isWarehouseAdmin } from "../../middlewares/auth.middleware.js";
// import {
//   getAllInventory,
//   getInventoryById,
//   getInventoryByDrug,
//   addInventory,
//   updateInventory,
//   deleteInventory,
//   transferStock,
//   adjustStock,
//   getStockMovements,
// } from "../../controllers/admin/inventory.controller.js";

// const router = express.Router();

// router.get("/", verifyToken, isWarehouseAdmin, getAllInventory);
// router.get("/:id", verifyToken, isWarehouseAdmin, getInventoryById);
// router.get("/drug/:drugId", verifyToken, isWarehouseAdmin, getInventoryByDrug);
// router.post("/", verifyToken, isWarehouseAdmin, addInventory);
// router.put("/:id", verifyToken, isWarehouseAdmin, updateInventory);
// router.delete("/:id", verifyToken, isWarehouseAdmin, deleteInventory);
// router.post("/transfer", verifyToken, isWarehouseAdmin, transferStock);
// router.patch("/:id/adjust", verifyToken, isWarehouseAdmin, adjustStock);
// router.get("/:id/movements", verifyToken, isWarehouseAdmin, getStockMovements);

// export default router;
// routes/admin/inventory.routes.js
import express from "express";
import { verifyToken, isWarehouseAdmin } from "../../middleware/auth.middleware.js";
import {
  getAllInventory,
  getInventoryById,
  getInventoryByDrug,
  addInventory,
  updateInventory,
  deleteInventory,
  transferStock,
  adjustStock,
  getStockMovements,
} from "../../controllers/admin/inventory.controller.js";

const router = express.Router();

router.get("/", verifyToken, isWarehouseAdmin, getAllInventory);
router.post("/", verifyToken, isWarehouseAdmin, addInventory);
router.get("/:id", verifyToken, isWarehouseAdmin, getInventoryById);
router.get("/drug/:drugId", verifyToken, isWarehouseAdmin, getInventoryByDrug);
router.put("/:id", verifyToken, isWarehouseAdmin, updateInventory);
router.delete("/:id", verifyToken, isWarehouseAdmin, deleteInventory);
router.patch("/:id/adjust", verifyToken, isWarehouseAdmin, adjustStock);
router.post("/transfer", verifyToken, isWarehouseAdmin, transferStock);
router.get("/:id/movements", verifyToken, isWarehouseAdmin, getStockMovements);

export default router;