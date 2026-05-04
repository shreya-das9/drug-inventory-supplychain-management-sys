import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["ADMIN", "WAREHOUSE", "RETAILER", "USER"],
    default: "USER"
  },
  // Reset password fields
  resetToken: { type: String },
  resetTokenExpiry: { type: Date }
}, { timestamps: true });

UserSchema.pre("validate", function (next) {
  if (this.email) {
    this.email = String(this.email).trim().toLowerCase();
  }
  
  // Admin email authorization is now checked in auth.routes.js
  // Using database instead of environment variables
  return next();
});

// Encrypt password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

 export default mongoose.model("User", UserSchema);
