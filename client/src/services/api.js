
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest(
  endpoint,
  { method = "GET", body, token, headers = {} } = {}
) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
