import mongoose from "mongoose";

const ScanlogSchema = new mongoose.Schema(
	{
		bleId: {
			type: String,
			required: true,
			uppercase: true,
			trim: true,
			index: true
		},
		stage: {
			type: String,
			enum: ["manufacturer", "distributor", "warehouse", "pharmacy", "customer", null],
			default: null
		},
		challenge: {
			type: String,
			default: ""
		},
		signature: {
			type: String,
			default: ""
		},
		verificationStatus: {
			type: String,
			enum: ["VERIFIED", "BLOCKED", "FAILED"],
			required: true
		},
		alertCodes: {
			type: [String],
			default: []
		},
		location: {
			city: { type: String, default: "" },
			lat: { type: Number, default: null },
			lng: { type: Number, default: null }
		},
		scannedAt: {
			type: Date,
			default: Date.now,
			index: true
		},
		scannedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null
		},
		details: {
			type: mongoose.Schema.Types.Mixed,
			default: {}
		}
	},
	{ timestamps: true }
);

ScanlogSchema.index({ bleId: 1, scannedAt: -1 });

export default mongoose.models.Scanlog || mongoose.model("Scanlog", ScanlogSchema);
