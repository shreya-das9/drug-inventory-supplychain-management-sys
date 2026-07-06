import express from 'express';
const router = express.Router();

// Import middleware (FIXED PATHS)
import { verifyToken, isWarehouseAdmin } from '../../middleware/auth.middleware.js';

// Import controller
import shipmentController from '../../controllers/shipments.controller.js';

// Apply authentication and warehouse admin role to all routes
router.use(verifyToken);
router.use(isWarehouseAdmin);

// GET /api/admin/shipments/stats - Get shipment statistics
router.get('/stats', shipmentController.getShipmentStats);

// GET /api/admin/shipments - Get all shipments
router.get('/', shipmentController.getAllShipments);

// GET /api/admin/shipments/:id - Get single shipment
router.get('/:id', shipmentController.getShipmentById);

// POST /api/admin/shipments - Create new shipment
router.post('/', shipmentController.createShipment);

// PUT /api/admin/shipments/:id - Update shipment (alias to updateShipmentStatus)
router.put('/:id', shipmentController.updateShipmentStatus);

// PATCH /api/admin/shipments/:id/status - Update shipment status
router.patch('/:id/status', shipmentController.updateShipmentStatus);

// DELETE /api/admin/shipments/:id - Delete shipment
router.delete('/:id', shipmentController.deleteShipment);

export default router;