import mongoose from "mongoose";

const ComplianceSchema = new mongoose.Schema(
  {
    reportNumber: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["inspection", "audit", "incident", "recall", "other"],
      default: "inspection"
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low"
    },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "closed"],
      default: "open"
    },
    description: { type: String, required: true },
    findings: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    actionTaken: { type: String, default: "" },
    inspectionDate: { type: Date, default: Date.now },
    nextReviewDate: { type: Date, default: null },
    relatedDrug: { type: mongoose.Schema.Types.ObjectId, ref: "Drug", default: null },
    relatedInventory: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", default: null },
    relatedShipment: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment", default: null },
    relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    relatedScanlog: { type: mongoose.Schema.Types.ObjectId, ref: "Scanlog", default: null },
    location: {
      site: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" }
    },
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  {
    timestamps: true,
    collection: "compliance"
  }
);

ComplianceSchema.pre("save", function (next) {
  if (this.isNew && !this.reportNumber) {
    this.reportNumber = `CMP${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  next();
});

export default mongoose.models.Compliance || mongoose.model("Compliance", ComplianceSchema);