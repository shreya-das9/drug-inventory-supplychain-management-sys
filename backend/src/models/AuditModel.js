import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  auditId: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    trim: true
  },
  shipmentId: {
    type: String,
    default: null
  },
  orderId: {
    type: String,
    default: null
  },
  blePackageId: {
    type: String,
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  organization: {
    type: String,
    default: null
  },
  previousStatus: {
    type: String,
    default: null
  },
  newStatus: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

auditSchema.pre('save', function(next) {
  if (this.isNew && !this.auditId) {
    this.auditId = `AUD${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

auditSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'findOneAndDelete'], function(next) {
  next(new Error('Audit records are immutable and cannot be modified or deleted.'));
});

export default mongoose.models.Audit || mongoose.model('Audit', auditSchema);
