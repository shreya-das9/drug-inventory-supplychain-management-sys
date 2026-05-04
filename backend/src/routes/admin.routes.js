import express from 'express';
const router = express.Router();

// Import middleware (FIXED: removed requireRole import, using correct function names)
import { verifyToken, isAdmin, isWarehouseAdmin } from "../middleware/auth.middleware.js";

// Import models
import AdminAllowedEmail from '../models/AdminAllowedEmailModel.js';

// Import controllers
import supplierController from '../controllers/suppliers.controller.js';
import shipmentController from '../controllers/shipments.controller.js';
import orderController from '../controllers/orders.controller.js';
import dashboardRoutes from './admin/dashboard.routes.js';

// Apply authentication to all routes
router.use(verifyToken);

// ==================== DASHBOARD ROUTES ====================
// Dashboard routes available for both admins and warehouse admins
// (mounted before isAdmin middleware so warehouse admins can access)
router.use('/dashboard', dashboardRoutes);

// Apply admin role check to remaining routes
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

// ==================== ADMIN EMAIL MANAGEMENT ROUTES ====================

// Get all authorized admin emails
// GET /api/admin/admin-emails
router.get('/admin-emails', async (req, res) => {
  try {
    const adminEmails = await AdminAllowedEmail.find()
      .select('-_id email status createdAt updatedAt reason')
      .lean();
    res.json({
      message: 'Admin emails retrieved',
      data: adminEmails,
      count: adminEmails.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving admin emails', error: error.message });
  }
});

// Add new authorized admin email
// POST /api/admin/admin-emails
// Body: { "email": "new.admin@example.com", "reason": "..." }
router.post('/admin-emails', async (req, res) => {
  try {
    const { email, reason } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const normalizedEmail = String(email).trim().toLowerCase();
    
    // Check if already exists
    const existing = await AdminAllowedEmail.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'Email already authorized' });
    }
    
    const adminEmail = await AdminAllowedEmail.create({
      email: normalizedEmail,
      status: 'ACTIVE',
      addedBy: req.user?.email || 'ADMIN',
      reason: reason || 'Manually added'
    });
    
    res.status(201).json({
      message: 'Admin email added successfully',
      data: adminEmail
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding admin email', error: error.message });
  }
});

// Remove authorized admin email
// DELETE /api/admin/admin-emails/:email
router.delete('/admin-emails/:email', async (req, res) => {
  try {
    const email = String(req.params.email).trim().toLowerCase();
    
    const result = await AdminAllowedEmail.deleteOne({ email });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Admin email not found' });
    }
    
    res.json({ message: 'Admin email removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing admin email', error: error.message });
  }
});

// Update admin email status
// PATCH /api/admin/admin-emails/:email
// Body: { "status": "ACTIVE" or "INACTIVE" }
router.patch('/admin-emails/:email', async (req, res) => {
  try {
    const email = String(req.params.email).trim().toLowerCase();
    const { status } = req.body;
    
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be ACTIVE or INACTIVE' });
    }
    
    const adminEmail = await AdminAllowedEmail.findOneAndUpdate(
      { email },
      { status },
      { new: true }
    );
    
    if (!adminEmail) {
      return res.status(404).json({ message: 'Admin email not found' });
    }
    
    res.json({
      message: 'Admin email status updated',
      data: adminEmail
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin email', error: error.message });
  }
});

export default router;