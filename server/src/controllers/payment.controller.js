
import { createPaymentSchema } from "../validators/payment.validator.js";
// import { createManualPayment } from "../services/payment.service.js";
import {
  createManualPayment,
  getPaymentHistory,
  reviewPayment,
  getPaymentSummary,
  searchPaymentShareholders,
  initiateGatewayPayment,
  getGatewayPaymentStatus,
  getShareholderPaymentLedger,
} from "../services/payment.service.js";

import {
  initiateGatewayPaymentSchema,
} from "../validators/payment.validator.js";

export async function postManualPayment(req, res, next) {
  try {
    const result = createPaymentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment information.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const payment = await createManualPayment({
      shareholderId: result.data.shareholderId,
      amount: result.data.amount,
      paymentMethod: result.data.paymentMethod,
      transactionReference: result.data.transactionReference,
      notes: result.data.notes,
      paidAt: result.data.paidAt,
      userId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Manual payment recorded and awaiting verification.",
      data: payment.payment,
      summary: payment.summary,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPayments(req, res, next) {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const status = String(req.query.status ?? "all");
    const search = String(req.query.search ?? "").trim();

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    if (!["all", "pending", "verified", "rejected", "failed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status filter.",
      });
    }

    if (search.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search must not exceed 100 characters.",
      });
    }

    const result = await getPaymentHistory({
      page,
      limit,
      status,
      search,
    });

    return res.status(200).json({
      success: true,
      data: result.payments,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function reviewPaymentStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be verified or rejected.",
      });
    }

    const payment = await reviewPayment({
      paymentId: req.params.paymentId,
      status,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: `Payment ${status} successfully.`,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPaymentSummaryController(req, res, next) {
  try {
    const summary = await getPaymentSummary();

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

export async function searchPaymentShareholdersController(req, res, next) {
  try {
    const search = String(req.query.search ?? "").trim();

    if (search.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search must not exceed 100 characters.",
      });
    }

    const shareholders = await searchPaymentShareholders(search);

    return res.status(200).json({
      success: true,
      data: shareholders,
    });
  } catch (error) {
    next(error);
  }
}

export async function initiateGatewayPaymentController(
  req,
  res,
  next
) {
  try {
    const parsed = initiateGatewayPaymentSchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid gateway payment details.",
        errors: parsed.error.flatten(),
      });
    }

    const result = await initiateGatewayPayment({
      ...parsed.data,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Gateway session created.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getGatewayPaymentStatusController(req, res, next) {
  try {
    const payment = await getGatewayPaymentStatus(
      req.params.paymentId
    );

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}

export async function getShareholderPaymentLedgerController(
  req,
  res,
  next
) {
  try {
    const ledger = await getShareholderPaymentLedger(
      req.params.shareholderId
    );

    return res.status(200).json({
      success: true,
      data: ledger,
    });
  } catch (error) {
    next(error);
  }
}



