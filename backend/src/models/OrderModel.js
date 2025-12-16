import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  purchaseOrderNumber: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'completed', 'cancelled', 'confirmed', 'shipped', 'delivered'],
    default: 'pending',
    lowercase: true  // Automatically converts to lowercase
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    lowercase: true  // Automatically converts to lowercase
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'net_banking'],
    default: 'cash',
    lowercase: true  // Automatically converts to lowercase
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' },
    phone: String
  },
  deliveredAt: Date,
  cancellationReason: String,
  statusHistory: [{
    status: {
      type: String,
      lowercase: true
    },
    timestamp: { type: Date, default: Date.now },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// Calculate item subtotals before saving
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.items.forEach(item => {
      if (item.quantity && item.price) {
        item.subtotal = item.quantity * item.price;
      }
    });
  }
  next();
});

// Normalize status fields to lowercase before validation
orderSchema.pre('validate', function(next) {
  if (this.status && typeof this.status === 'string') {
    this.status = this.status.toLowerCase().trim();
  }
  if (this.paymentStatus && typeof this.paymentStatus === 'string') {
    this.paymentStatus = this.paymentStatus.toLowerCase().trim();
  }
  if (this.paymentMethod && typeof this.paymentMethod === 'string') {
    this.paymentMethod = this.paymentMethod.toLowerCase().trim();
  }
  next();
});

// Indexes for faster queries
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ supplier: 1 });
orderSchema.index({ createdBy: 1 });

export default mongoose.model('Order', orderSchema);