
import SSLCommerzPayment from "sslcommerz-lts";
import Payment from "../models/Payment.js";

const SUCCESS_STATUSES = new Set(["VALID", "VALIDATED"]);

function getGatewayClient() {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";

  if (!storeId || !storePassword) {
    throw new Error("SSLCommerz credentials are missing.");
  }

  if (isLive) {
    throw new Error(
      "Live payment validation is disabled during sandbox development."
    );
  }

  return new SSLCommerzPayment(storeId, storePassword, false);
}

export async function validateGatewayTransaction(valId) {
  if (!valId || typeof valId !== "string") {
    const error = new Error("Missing gateway validation ID.");
    error.statusCode = 400;
    throw error;
  }

  const sslcz = getGatewayClient();
  const result = await sslcz.validate({ val_id: valId });

  if (!SUCCESS_STATUSES.has(result?.status)) {
    return { valid: false, reason: "Gateway transaction is not valid." };
  }

  if (
    result.currency !== "BDT" ||
    !result.tran_id ||
    !result.amount
  ) {
    return { valid: false, reason: "Gateway transaction details are incomplete." };
  }

  const payment = await Payment.findOne({
    gatewayTransactionId: result.tran_id,
    paymentType: "gateway",
    paymentMethod: "sslcommerz",
  });

  if (!payment) {
    return { valid: false, reason: "Matching local payment was not found." };
  }

  const gatewayAmount = Number(result.amount);
  const localAmount = Number(payment.amount);

  if (
    !Number.isFinite(gatewayAmount) ||
    Math.round(gatewayAmount * 100) !== Math.round(localAmount * 100)
  ) {
    return { valid: false, reason: "Payment amount does not match." };
  }

  if (payment.status === "verified") {
    return { valid: true, alreadyProcessed: true };
  }

  if (payment.status !== "pending") {
    return { valid: false, reason: "Payment is no longer pending." };
  }

  // High-risk transactions must be reviewed before acceptance.
  if (String(result.risk_level) === "1") {
    return {
      valid: false,
      reason: "Gateway marked this transaction as high risk.",
    };
  }

  const updatedPayment = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      status: "pending",
      gatewayTransactionId: result.tran_id,
    },
    {
      $set: {
        status: "verified",
        gatewayValidationId: result.val_id,
        gatewayBankTransactionId: result.bank_tran_id || null,
        verifiedAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedPayment) {
    const latest = await Payment.findById(payment._id);

    return {
      valid: latest?.status === "verified",
      alreadyProcessed: latest?.status === "verified",
    };
  }

  return { valid: true, alreadyProcessed: false };
}
