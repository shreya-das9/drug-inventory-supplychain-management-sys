const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AddressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city:   { type: String, trim: true },
  state:  { type: String, trim: true },
  zipCode:{ type: String, trim: true },
  country:{ type: String, trim: true }
}, { _id: false });

const ROLES = ['ADMIN','WAREHOUSE','RETAILER','USER'];

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  lastName:  { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, select: false },
  role:      { type: String, enum: ROLES, default: 'USER', required: true },
  phone:     { type: String, trim: true },
  address:   { type: AddressSchema, default: {} },
  companyName:   { type: String, trim: true },
  licenseNumber: { type: String, trim: true },
  isActive:  { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

// Hash password if changed
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Remove sensitive fields in JSON
UserSchema.methods.toJSON = function() {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
module.exports.ROLES = ROLES;
