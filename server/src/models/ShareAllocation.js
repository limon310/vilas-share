import mongoose from "mongoose";

const shareAllocationSchema = new mongoose.Schema(
  {
    shareholder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shareholder",
      required: true,
      immutable: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      immutable: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Share quantity must be a whole number.",
      },
    },
    pricePerShare: {
      type: Number,
      required: true,
      min: 0.01,
      immutable: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

shareAllocationSchema.index({ project: 1, createdAt: -1 });
shareAllocationSchema.index({ shareholder: 1, project: 1 });

const ShareAllocation = mongoose.model(
  "ShareAllocation",
  shareAllocationSchema
);

export default ShareAllocation;