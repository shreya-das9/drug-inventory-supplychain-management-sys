import express from 'express';
import { verifyToken, isWarehouseAdmin } from '../middleware/auth.middleware.js';
import { allocateBleToShipment } from '../controllers/bleAllocation.controller.js';

const router = express.Router();

router.use(verifyToken, isWarehouseAdmin);
router.post('/allocate', allocateBleToShipment);

export default router;
