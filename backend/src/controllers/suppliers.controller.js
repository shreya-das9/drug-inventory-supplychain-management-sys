// backend/src/controllers/suppliers.controller.js
import Supplier from '../models/SupplierModel.js';
import { validateArray, validateRequired } from '../utils/validation.js';

// Get all suppliers with filters
export const getSuppliers = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }
    
    const suppliers = await Supplier.find(query)
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    // Validate suppliers data before returning
    const validatedSuppliers = validateArray(
      suppliers,
      ['_id', 'name', 'status'],
      {},
      'Suppliers'
    );
    
    res.json(validatedSuppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single supplier
export const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('approvedBy', 'name email');
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create supplier
export const createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, status } = req.body;
    
    const existingSupplier = await Supplier.findOne({ name });
    if (existingSupplier) {
      return res.status(400).json({ message: 'Supplier with this name already exists' });
    }
    
    const supplier = await Supplier.create({
      name,
      contactPerson,
      email,
      phone,
      address,
      status: status || 'PENDING'
    });
    
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body;
    
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    if (name && name !== supplier.name) {
      const existingSupplier = await Supplier.findOne({ name });
      if (existingSupplier) {
        return res.status(400).json({ message: 'Supplier with this name already exists' });
      }
    }
    
    if (name) supplier.name = name;
    if (contactPerson !== undefined) supplier.contactPerson = contactPerson;
    if (email !== undefined) supplier.email = email;
    if (phone !== undefined) supplier.phone = phone;
    if (address !== undefined) supplier.address = address;
    
    await supplier.save();
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update supplier status
export const updateSupplierStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const validStatuses = ['APPROVED', 'PENDING', 'REJECTED', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    supplier.status = status;
    
    if (status === 'APPROVED') {
      supplier.approvedBy = req.user?._id || null;
      supplier.approvedAt = new Date();
      supplier.rejectionReason = null;
    }
    
    if (status === 'REJECTED') {
      if (!rejectionReason || rejectionReason.trim() === '') {
        return res.status(400).json({ message: 'Rejection reason is required' });
      }
      supplier.rejectionReason = rejectionReason;
      supplier.approvedBy = null;
      supplier.approvedAt = null;
    }
    
    if (status === 'PENDING') {
      supplier.approvedBy = null;
      supplier.approvedAt = null;
      supplier.rejectionReason = null;
    }
    
    await supplier.save();
    await supplier.populate('approvedBy', 'name email');
    
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    await supplier.deleteOne();
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get statistics
export const getSupplierStats = async (req, res) => {
  try {
    const stats = await Supplier.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Supplier.countDocuments();
    
    const formattedStats = {
      total,
      approved: 0,
      pending: 0,
      rejected: 0,
      suspended: 0
    };
    
    stats.forEach(stat => {
      const status = stat._id.toLowerCase();
      formattedStats[status] = stat.count;
    });
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const lastWeekTotal = await Supplier.countDocuments({
      createdAt: { $lte: oneWeekAgo }
    });
    
    const lastWeekStats = await Supplier.aggregate([
      { $match: { createdAt: { $lte: oneWeekAgo } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const previousWeek = {
      total: lastWeekTotal,
      approved: 0,
      pending: 0,
      rejected: 0,
      suspended: 0
    };
    
    lastWeekStats.forEach(stat => {
      const status = stat._id.toLowerCase();
      previousWeek[status] = stat.count;
    });
    
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    
    const changes = {
      approved: calculateChange(formattedStats.approved, previousWeek.approved),
      pending: calculateChange(formattedStats.pending, previousWeek.pending),
      rejected: calculateChange(formattedStats.rejected, previousWeek.rejected),
      suspended: calculateChange(formattedStats.suspended, previousWeek.suspended),
      total: calculateChange(formattedStats.total, previousWeek.total)
    };
    
    res.json({
      current: formattedStats,
      previousWeek,
      changes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export to CSV
export const exportSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find()
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    const headers = [
      'Name', 'Contact Person', 'Email', 'Phone', 'Address',
      'Status', 'Rejection Reason', 'Approved By', 'Approved At',
      'Created At', 'Updated At'
    ];
    
    const rows = suppliers.map(s => [
      s.name,
      s.contactPerson || '',
      s.email || '',
      s.phone || '',
      s.address || '',
      s.status,
      s.rejectionReason || '',
      s.approvedBy ? s.approvedBy.name : '',
      s.approvedAt ? new Date(s.approvedAt).toLocaleDateString() : '',
      new Date(s.createdAt).toLocaleDateString(),
      new Date(s.updatedAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=suppliers_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  updateSupplierStatus,
  deleteSupplier,
  getSupplierStats,
  exportSuppliers,
  getAllSuppliers: getSuppliers,
  getSupplierById: getSupplier,
  addSupplier: createSupplier,
  approveSupplier: updateSupplierStatus
};
