// backend/src/routes/admin/index.js
// 
// COPY AND PASTE THIS ENTIRE FILE OR JUST ADD THE TWO MARKED LINES
//

import express from 'express';
import dashboardRoutes from './dashboard.routes.js';
import drugsRoutes from './drugs.routes.js';
import inventoryRoutes from './inventory.routes.js';
import ordersRoutes from './orders.routes.js';
import shipmentsRoutes from './shipments.routes.js';
import suppliersRoutes from './suppliers.routes.js';  // ← ADD THIS LINE

const router = express.Router();

router.use('/dashboard', dashboardRoutes);
router.use('/drugs', drugsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/orders', ordersRoutes);
router.use('/shipments', shipmentsRoutes);
router.use('/suppliers', suppliersRoutes);  // ← ADD THIS LINE

export default router;
