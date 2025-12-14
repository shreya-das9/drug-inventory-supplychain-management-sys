import express from 'express';
const router = express.Router();

// Import middleware (FIXED PATHS)
import { verifyToken, isAdmin } from '../../middleware/auth.middleware.js';

// Import controller
import supplierController from '../../controllers/suppliers.controller.js';

// Apply authentication and admin role to all routes
router.use(verifyToken);
router.use(isAdmin);

// GET /api/admin/suppliers/stats - Get supplier statistics
router.get('/stats', supplierController.getSupplierStats);

// GET /api/admin/suppliers - Get all suppliers
router.get('/', supplierController.getAllSuppliers);


// GET /api/admin/suppliers/:id - Get single supplier
router.get('/:id', supplierController.getSupplierById);

// POST /api/admin/suppliers - Add new supplier
router.post('/', supplierController.addSupplier);

// PATCH /api/admin/suppliers/:id/approve - Approve/reject supplier
router.patch('/:id/approve', supplierController.approveSupplier);

// PUT /api/admin/suppliers/:id - Update supplier (← NEW ROUTE)
router.put('/:id', supplierController.updateSupplier);


// DELETE /api/admin/suppliers/:id - Delete supplier
router.delete('/:id', supplierController.deleteSupplier);

export default router;