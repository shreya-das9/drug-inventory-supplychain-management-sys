import axios from "axios";
import { API_BASE_URLS } from "./api";

const buildUrl = (base, path) => {
  const trimmedBase = String(base || "").replace(/\/+$/g, "");
  const trimmedPath = String(path || "").replace(/^\/+/, "");
  const normalizedPath = trimmedPath.replace(/^api\//i, "");
  return trimmedBase.endsWith("/api")
    ? `${trimmedBase}/${normalizedPath}`
    : `${trimmedBase}/api/${normalizedPath}`;
};

const requestWithFallback = async (method, path, data = null) => {
  let lastError = null;

  for (const baseURL of Array.isArray(API_BASE_URLS) ? API_BASE_URLS : []) {
    const url = buildUrl(baseURL, path);
    try {
      console.log('[DIAG][auth.api] attempting', method.toUpperCase(), url, 'payload keys:', data ? Object.keys(data).filter(k => k !== 'password') : []);
    } catch (e) {}
    try {
      return await axios({
        method,
        url,
        data,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const message = String(error.response?.data?.message || "").toLowerCase();
      const shouldRetry =
        !status ||
        status === 404 ||
        status >= 502 ||
        (status === 500 && message.includes("route"));
      if (!shouldRetry) {
        throw error;
      }
    }
  }

  throw lastError || new Error("API request failed");
};

export const signup = (data) => requestWithFallback("post", "/auth/signup", data);
export const login = (data) => requestWithFallback("post", "/auth/login", data);
export const forgotPassword = (data) => requestWithFallback("post", "/auth/forgot-password", data);
export const resetPassword = (data) => requestWithFallback("post", "/auth/reset-password", data);
export const verifyResetToken = (token) => requestWithFallback("get", `/auth/verify-reset-token/${token}`);
