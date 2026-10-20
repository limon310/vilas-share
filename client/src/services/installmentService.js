
import { apiRequest } from "./api";

export function getInstallments({
  page = 1,
  limit = 10,
  shareholderId,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (shareholderId) {
    params.set("shareholderId", shareholderId);
  }

  const token = localStorage.getItem("vilasshare-token");

  return apiRequest(`/installments?${params.toString()}`, {
    token,
  });
}

export function createInstallment(installmentData) {
  const token = localStorage.getItem("vilasshare-token");

  return apiRequest("/installments", {
    method: "POST",
    body: installmentData,
    token,
  });
}
