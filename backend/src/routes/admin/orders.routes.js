import express from 'express';
const router = express.Router();

// Import middleware (FIXED PATHS)
import { verifyToken, isWarehouseAdmin } from '../../middleware/auth.middleware.js';

// Import controller
import orderController from '../../controllers/orders.controller.js';

// Apply authentication and warehouse admin role to all routes
router.use(verifyToken);
router.use(isWarehouseAdmin);

// GET /api/admin/orders/stats - Get order statistics
router.get('/stats', orderController.getOrderStats);

// GET /api/admin/orders - Get all orders
router.get('/', orderController.getAllOrders);

// GET /api/admin/orders/:id - Get single order
router.get('/:id', orderController.getOrderById);

// PATCH /api/admin/orders/:id/status - Update order status
router.patch('/:id/status', orderController.updateOrderStatus);

// PATCH /api/admin/orders/:id/cancel - Cancel order
router.patch('/:id/cancel', orderController.cancelOrder);

export default router;