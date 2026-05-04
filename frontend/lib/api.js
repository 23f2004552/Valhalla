/**
 * API helper — native fetch wrapper
 * Replaces Axios with zero dependencies
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

class ApiError extends Error {
  constructor(message, status, userMessage) {
    super(message);
    this.status = status;
    this.userMessage = userMessage;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  };

  let res;
  try {
    res = await fetch(url, config);
  } catch (err) {
    throw new ApiError(
      err.message,
      0,
      "Unable to connect. Please check your connection."
    );
  }

  if (!res.ok) {
    let userMessage = "Something went wrong. Please try again.";
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After") || 5;
      userMessage = `Please wait ${retryAfter} seconds before trying again.`;
    } else if (res.status === 402) {
      userMessage = "Payment could not be processed. Please try again.";
    } else if (res.status >= 500) {
      userMessage = "Our kitchen is temporarily unavailable. Please try again shortly.";
    }
    throw new ApiError(`HTTP ${res.status}`, res.status, userMessage);
  }

  // Return parsed JSON, or null for 204
  if (res.status === 204) return null;
  return res.json();
}

const api = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, data, options) =>
    request(endpoint, { method: "POST", body: JSON.stringify(data), ...options }),
  put: (endpoint, data, options) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(data), ...options }),
  delete: (endpoint, options) =>
    request(endpoint, { method: "DELETE", ...options }),
};

export default api;
