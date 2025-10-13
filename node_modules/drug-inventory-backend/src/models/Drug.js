import mongoose from "mongoose";

const DrugSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  category: { type: String, default: "" },
  manufacturer: { type: String, default: "" },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  batchNumber: { type: String, required: true, index: true },
  price: { type: Number, default: 0 },
  expiryDate: { type: Date },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.models.Drug || mongoose.model("Drug", DrugSchema);
