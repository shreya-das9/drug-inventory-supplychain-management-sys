import mongoose from "mongoose";

const AdminAllowedEmailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, "Please provide a valid email address"]
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE"
  },
  addedBy: {
    type: String,
    default: "SYSTEM"
  },
  reason: {
    type: String,
    default: "Admin authorization"
  }
}, { timestamps: true });

export default mongoose.model("AdminAllowedEmail", AdminAllowedEmailSchema);
