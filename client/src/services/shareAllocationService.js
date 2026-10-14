
import { apiRequest } from "./api";

export async function getShareholders() {
  return apiRequest("/shareholders?limit=100&page=1");
}

export async function getProject() {
  return apiRequest("/project");
}

export async function getShareAllocations(page = 1, limit = 10) {
  return apiRequest(
    `/share-allocations?page=${page}&limit=${limit}`
  );
}

export async function createShareAllocation({
  shareholderId,
  quantity,
}) {
  return apiRequest("/share-allocations", {
    method: "POST",
    body: {
      shareholderId,
      quantity: Number(quantity),
    },
    token: localStorage.getItem("vilasshare-token"),
  });
}
