
import { validateGatewayTransaction } from "../services/sslcommerz.service.js";

function getFrontendUrl() {
  return process.env.CLIENT_URL || "http://localhost:5173";
}

export async function gatewaySuccess(req, res) {
  try {
    const valId = req.body?.val_id || req.query?.val_id;

    const result = await validateGatewayTransaction(valId);

    if (!result.valid) {
      return res.redirect(
        `${getFrontendUrl()}/payment-result?status=pending`
      );
    }

    return res.redirect(
      `${getFrontendUrl()}/payment-result?status=success`
    );
  } catch (error) {
    console.error("SSLCommerz success validation failed:", error.message);

    return res.redirect(
      `${getFrontendUrl()}/payment-result?status=pending`
    );
  }
}

export async function gatewayFail(req, res) {
  // Callback data alone is not trusted as proof of final failure.
  return res.redirect(
    `${getFrontendUrl()}/payment-result?status=failed`
  );
}

export async function gatewayCancel(req, res) {
  return res.redirect(
    `${getFrontendUrl()}/payment-result?status=cancelled`
  );
}

export async function gatewayIpn(req, res) {
  try {
    const valId = req.body?.val_id;

    if (!valId) {
      return res.status(400).send("Missing validation ID");
    }

    const result = await validateGatewayTransaction(valId);

    if (!result.valid) {
      return res.status(400).send("Transaction not verified");
    }

    return res.status(200).send("IPN processed");
  } catch (error) {
    console.error("SSLCommerz IPN processing failed:", error.message);

    // A non-2xx response allows the gateway to retry if supported.
    return res.status(500).send("IPN processing failed");
  }
}
