import mongoose from "mongoose";

const BLERegistrySchema = new mongoose.Schema(
  {
    bleId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    secretKey: {
      type: String,
      required: true,
      select: false
    },
    status: {
      type: String,
      enum: ["UNUSED", "ACTIVE", "REVOKED"],
      default: "UNUSED"
    },
    tamperStatus: {
      type: String,
      enum: ["INTACT", "BREACHED"],
      default: "INTACT"
    },
    metadata: {
      manufacturer: { type: String, default: "" },
      product: { type: String, default: "" },
      notes: { type: String, default: "" }
    },
    lastKnownStage: {
      type: String,
      enum: ["manufacturer", "distributor", "warehouse", "pharmacy", "customer", null],
      default: null
    },
    lastKnownLocation: {
      city: { type: String, default: "" },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    lastScanAt: {
      type: Date,
      default: null
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.models.BLERegistry || mongoose.model("BLERegistry", BLERegistrySchema);
