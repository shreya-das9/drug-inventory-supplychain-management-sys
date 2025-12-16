import express from 'express';
const router = express.Router();

// Import middleware (FIXED: removed requireRole import, using correct function names)
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";

// Import controllers
import supplierController from '../controllers/suppliers.controller.js';
import shipmentController from '../controllers/shipments.controller.js';
import orderController from '../controllers/orders.controller.js';

// Apply authentication and admin role check to all routes (FIXED: using correct function names)
router.use(verifyToken);
router.use(isAdmin);

// ==================== SUPPLIER ROUTES ====================

// Get supplier statistics (MUST come before /:id route)
// GET /api/admin/suppliers/stats
router.get('/suppliers/stats', supplierController.getSupplierStats);

// Get all suppliers with filters
// GET /api/admin/suppliers?status=approved&search=pharma&page=1&limit=10
router.get('/suppliers', supplierController.getAllSuppliers);

// Get single supplier by ID
// GET /api/admin/suppliers/:id
router.get('/suppliers/:id', supplierController.getSupplierById);

// Add new supplier
// POST /api/admin/suppliers
router.post('/suppliers', supplierController.addSupplier);

// Approve or reject supplier
// PATCH /api/admin/suppliers/:id/approve
// Body: { "status": "approved" } or { "status": "rejected", "rejectionReason": "..." }
router.patch('/suppliers/:id/approve', supplierController.approveSupplier);

// Delete supplier
// DELETE /api/admin/suppliers/:id
router.delete('/suppliers/:id', supplierController.deleteSupplier);

// ==================== SHIPMENT ROUTES ====================

// Get shipment statistics (MUST come before /:id route)
// GET /api/admin/shipments/stats
router.get('/shipments/stats', shipmentController.getShipmentStats);

// Get all shipments with filters
// GET /api/admin/shipments?status=shipped&supplier=123&startDate=2024-01-01&page=1
router.get('/shipments', shipmentController.getAllShipments);

// Get single shipment by ID
// GET /api/admin/shipments/:id
router.get('/shipments/:id', shipmentController.getShipmentById);

// Create new shipment
// POST /api/admin/shipments
router.post('/shipments', shipmentController.createShipment);

// Update shipment status
// PATCH /api/admin/shipments/:id/status
// Body: { "status": "shipped", "notes": "Package dispatched" }
router.patch('/shipments/:id/status', shipmentController.updateShipmentStatus);

// Delete shipment
// DELETE /api/admin/shipments/:id
router.delete('/shipments/:id', shipmentController.deleteShipment);

// ==================== ORDER ROUTES (Admin View) ====================

// Get order statistics (MUST come before /:id route)
// GET /api/admin/orders/stats?startDate=2024-01-01&endDate=2024-12-31
router.get('/orders/stats', orderController.getOrderStats);

// Get all orders with filters
// GET /api/admin/orders?status=pending&userId=123&startDate=2024-01-01&page=1
router.get('/orders', orderController.getAllOrders);

// Get single order by ID
// GET /api/admin/orders/:id
router.get('/orders/:id', orderController.getOrderById);

// Update order status
// PATCH /api/admin/orders/:id/status
// Body: { "status": "confirmed", "notes": "Order confirmed and being processed" }
router.patch('/orders/:id/status', orderController.updateOrderStatus);

// Cancel order (FIXED: changed from deleteOrder to cancelOrder)
// PATCH /api/admin/orders/:id/cancel
// Body: { "reason": "Out of stock" }
router.patch('/orders/:id/cancel', orderController.cancelOrder);

export default router;