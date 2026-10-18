
import Project from "../models/Project.js";
import Shareholder from "../models/Shareholder.js";
import ShareAllocation from "../models/ShareAllocation.js";
import Payment from "../models/Payment.js";

function createServiceError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function createManualPayment({
  shareholderId,
  amount,
  paymentMethod,
  transactionReference = "",
  notes = "",
  paidAt,
  userId,
}) {
  // 1. Verify that the project exists and is active.
  const project = await Project.findOne({
    projectKey: "main",
  }).lean();

  if (!project) {
    throw createServiceError(
      "Project configuration has not been created.",
      404
    );
  }

  if (project.status !== "active") {
    throw createServiceError(
      "Payments require an active project.",
      409
    );
  }

  // 2. Only active shareholders can make payments.
  const shareholder = await Shareholder.findOne({
    _id: shareholderId,
    status: "active",
  }).select("_id fullName shareholderCode");

  if (!shareholder) {
    throw createServiceError(
      "Active shareholder not found.",
      404
    );
  }

  // 3. Calculate the shareholder's total allocated amount.
  const allocationResult = await ShareAllocation.aggregate([
    {
      $match: {
        shareholder: shareholder._id,
        project: project._id,
      },
    },
    {
      $group: {
        _id: null,
        totalAllocatedAmount: { $sum: "$totalAmount" },
      },
    },
  ]);

  const totalAllocatedAmount = Number(
    (allocationResult[0]?.totalAllocatedAmount || 0).toFixed(2)
  );

  if (totalAllocatedAmount <= 0) {
    throw createServiceError(
      "This shareholder has no allocated shares in the project.",
      409
    );
  }

  // 4. Count verified and pending payments to prevent
  // outstanding balances from being overcommitted.
  const paymentResult = await Payment.aggregate([
    {
      $match: {
        shareholder: shareholder._id,
        project: project._id,
        status: { $in: ["verified", "pending"] },
        paymentType: "manual",
      },
    },
    {
      $group: {
        _id: "$status",
        total: { $sum: "$amount" },
      },
    },
  ]);
  
  const paymentTotals = {
    verified: 0,
    pending: 0,
  };

  for (const item of paymentResult) {
    paymentTotals[item._id] = Number(item.total || 0);
  }

  const committedAmount = Number(
    (paymentTotals.verified + paymentTotals.pending).toFixed(2)
  );

  const outstandingAmount = Number(
    (totalAllocatedAmount - committedAmount).toFixed(2)
  );

  const normalizedAmount = Number(Number(amount).toFixed(2));

  if (normalizedAmount > outstandingAmount) {
    throw createServiceError(
      `Payment exceeds the outstanding balance of BDT ${Math.max(
        outstandingAmount,
        0
      ).toFixed(2)}.`,
      409
    );
  }

  // 5. Create a pending manual payment record.
  const payment = await Payment.create({
    shareholder: shareholder._id,
    project: project._id,
    amount: normalizedAmount,
    paymentMethod,
    paymentType: "manual",
    status: "pending",
    transactionReference,
    notes,
    ...(paidAt ? { paidAt } : {}),
    recordedBy: userId,
  });
  console.log("Payment totals:", paymentTotals);
  console.log("Total allocated:", totalAllocatedAmount);
  console.log("Outstanding:", outstandingAmount);

  return {
    payment,
    summary: {
      totalAllocatedAmount,
      verifiedAmount: Number(paymentTotals.verified.toFixed(2)),
      pendingAmount: Number(paymentTotals.pending.toFixed(2)),
      outstandingAmount,
    },
  };
}

export async function getPaymentHistory({
  page = 1,
  limit = 10,
  status = "all",
  search = "",
}) {
  const filter = {};

  if (status !== "all") {
    filter.status = status;
  }

  if (search) {
    const matchingShareholders = await Shareholder.find({
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { shareholderCode: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    filter.$or = [
      { transactionReference: { $regex: search, $options: "i" } },
      { gatewayTransactionId: { $regex: search, $options: "i" } },
      { shareholder: { $in: matchingShareholders.map((item) => item._id) } },
    ];
  }

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("shareholder", "fullName shareholderCode")
      .populate("project", "projectKey")
      .populate("recordedBy", "name email")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function reviewPayment({ paymentId, status, userId }) {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    const error = new Error("Payment not found.");
    error.status = 404;
    throw error;
  }

  if (payment.status !== "pending") {
    const error = new Error(
      `Only pending payments can be reviewed. Current status: ${payment.status}.`
    );
    error.status = 409;
    throw error;
  }

  if (!["verified", "rejected"].includes(status)) {
    const error = new Error("Invalid payment review status.");
    error.status = 400;
    throw error;
  }

  if (status === "verified") {
    payment.verifiedBy = userId;
    payment.verifiedAt = new Date();
  }

  payment.status = status;
  await payment.save();

  return payment;
}

