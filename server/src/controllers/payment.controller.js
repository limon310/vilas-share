
import { createPaymentSchema } from "../validators/payment.validator.js";
import { createManualPayment } from "../services/payment.service.js";

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
