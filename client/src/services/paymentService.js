
import { apiRequest } from "./api";

const getToken = () => localStorage.getItem("vilasshare-token");

export function getPayments({
  page = 1,
  limit = 10,
  status = "all",
  search = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status,
    search,
  });

  return apiRequest(`/payments?${params.toString()}`, {
    token: getToken(),
  });
}

export function createManualPayment(payload) {
  return apiRequest("/payments", {
    method: "POST",
    token: getToken(),
    body: payload,
  });
}

export function reviewPayment(paymentId, status) {
  return apiRequest(`/payments/${paymentId}/review`, {
    method: "PATCH",
    token: getToken(),
    body: { status },
  });
}

export function getPaymentSummary() {
  return apiRequest("/payments/summary", {
    token: getToken(),
  });
}

export function searchPaymentShareholders(search = "") {
  const params = new URLSearchParams({ search });

  return apiRequest(`/payments/shareholders?${params.toString()}`, {
    token: getToken(),
  });
}

export function getGatewayPaymentStatus(paymentId) {
  return apiRequest(
    `/payments/gateway/${paymentId}/status`,
    { token: getToken() }
  );
}

export function initiateGatewayPayment(payload) {
  return apiRequest("/payments/gateway/initiate", {
    method: "POST",
    token: getToken(),
    body: payload,
  });
}
