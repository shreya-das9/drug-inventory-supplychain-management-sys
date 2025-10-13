// backend/models/Supplier.js
import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  contactPerson: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ["APPROVED", "PENDING", "REJECTED"], 
    default: "APPROVED" 
  }
}, { timestamps: true });

export default mongoose.models.Supplier || mongoose.model("Supplier", SupplierSchema);