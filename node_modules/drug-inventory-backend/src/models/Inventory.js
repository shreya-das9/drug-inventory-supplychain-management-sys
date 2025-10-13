import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
  drug: { type: mongoose.Schema.Types.ObjectId, ref: "Drug", required: true, index: true },
  batchNo: String,
  warehouseLocation: String,
  quantity: { type: Number, default: 0 },
  threshold: { type: Number, default: 10 }, // low-stock threshold
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);
