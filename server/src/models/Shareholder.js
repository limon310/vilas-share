
import mongoose from "mongoose";

const shareholderSchema = new mongoose.Schema(
  {
    shareholderCode: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 25,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    nationalId: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
      select: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

shareholderSchema.index({ fullName: 1 });
shareholderSchema.index({ phone: 1 });

const Shareholder = mongoose.model("Shareholder", shareholderSchema);

export default Shareholder;
