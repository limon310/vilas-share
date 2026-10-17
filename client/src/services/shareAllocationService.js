
import { apiRequest } from "./api";

const getToken = () => localStorage.getItem("vilasshare-token");

export async function getShareholders() {
  return apiRequest("/shareholders?limit=100&page=1", {
    token: getToken(),
  });
}

export async function getProject() {
  return apiRequest("/project", {
    token: getToken(),
  });
}

export async function getShareAllocations(page = 1, limit = 10) {
  return apiRequest(
    `/share-allocations?page=${page}&limit=${limit}`,
    {
      token: getToken(),
    }
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
    token: getToken(),
  });
}
