
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
  // console.log("Payment aggregation result:", paymentResult);

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
