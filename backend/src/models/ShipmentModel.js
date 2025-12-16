import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  items: [{
    drug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drug',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    batchNumber: String,
    expiryDate: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  origin: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  destination: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  expectedDeliveryDate: {
    type: Date,
    required: [true, 'Expected delivery date is required']
  },
  actualDeliveryDate: Date,
  shippingMethod: {
    type: String,
    enum: ['air', 'ground', 'express', 'standard'],
    default: 'standard'
  },
  carrier: {
    name: String,
    contactNumber: String
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    maxlength: 500
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  documents: [{
    documentType: {
      type: String,
      enum: ['invoice', 'packing_list', 'certificate', 'other']
    },
    documentUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate tracking number before saving
shipmentSchema.pre('save', function(next) {
  if (this.isNew && !this.trackingNumber) {
    this.trackingNumber = `SHP${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// Indexes for faster queries (trackingNumber index removed - already created by unique: true)
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ supplier: 1 });

export default mongoose.model('Shipment', shipmentSchema);