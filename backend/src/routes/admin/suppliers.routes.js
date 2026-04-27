// backend/src/routes/admin/suppliers.routes.js
import express from 'express';
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  updateSupplierStatus,
  deleteSupplier,
  getSupplierStats,
  exportSuppliers
} from '../../controllers/suppliers.controller.js';

const router = express.Router();

// IMPORTANT: These routes must come BEFORE /:id routes
router.get('/stats', getSupplierStats);
router.get('/export', exportSuppliers);

// Main CRUD routes
router.route('/')
  .get(getSuppliers)
  .post(createSupplier);

router.route('/:id')
  .get(getSupplier)
  .put(updateSupplier)
  .delete(deleteSupplier);

// Status update route
router.patch('/:id/status', updateSupplierStatus);

export default router;
