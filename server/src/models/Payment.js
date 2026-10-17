
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    shareholder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shareholder",
      required: true,
      immutable: true,
      index: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      immutable: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Payment amount must be greater than zero."],
      validate: {
        validator: Number.isFinite,
        message: "Payment amount must be a valid number.",
      },
    },

    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "bank_transfer",
        "bkash",
        "nagad",
        "sslcommerz",
      ],
      required: true,
    },

    paymentType: {
      type: String,
      enum: ["manual", "gateway"],
      required: true,
      default: "manual",
    },

    status: {
      type: String,
      enum: ["pending", "verified", "failed", "rejected"],
      default: "pending",
      required: true,
      index: true,
    },

    transactionReference: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    gatewayTransactionId: {
      type: String,
      trim: true,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ shareholder: 1, createdAt: -1 });
paymentSchema.index({ project: 1, status: 1, createdAt: -1 });

// Gateway transaction IDs must be unique when present.
paymentSchema.index(
  { gatewayTransactionId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      gatewayTransactionId: { $type: "string" },
    },
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
