
import SSLCommerzPayment from "sslcommerz-lts";

const storeId = process.env.SSLCOMMERZ_STORE_ID;
const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;

export function getSSLCommerzClient() {
  if (!storeId || !storePassword) {
    const error = new Error(
      "SSLCommerz sandbox credentials are not configured."
    );
    error.statusCode = 500;
    throw error;
  }

  const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";

  if (isLive) {
    throw new Error(
      "Live payments are disabled during sandbox development."
    );
  }

  return new SSLCommerzPayment(
    storeId,
    storePassword,
    false
  );
}
