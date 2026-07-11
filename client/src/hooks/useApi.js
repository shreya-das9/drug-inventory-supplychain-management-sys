// hooks/useApi.js
import axios from "axios";
import { useState, useCallback } from "react";
import { API_BASE_URLS } from "../services/api";

// Build candidate base hosts from the centralized API_BASE_URLS exported
// by client/src/services/api.js. This keeps probing consistent with the
// axios instance used elsewhere and avoids hitting the frontend dev
// server accidentally.
const API_BASE_CANDIDATES = (Array.isArray(API_BASE_URLS) ? API_BASE_URLS : [])
  .map((u) => String(u || "").replace(/\/+$/g, ""))
  .filter(Boolean);

const buildApiUrl = (baseURL, path) => {
  const normalizedBase = String(baseURL || "").replace(/\/+$/g, "");
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  const trimmedPath = normalizedPath.replace(/^api\//i, "");
  return normalizedBase.endsWith("/api")
    ? `${normalizedBase}/${trimmedPath}`
    : `${normalizedBase}/api/${trimmedPath}`;
};

// Enable temporary diagnostics to help debug missing shipments in browsers
// Set to false after verification
const DIAG_API = true;

export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (method, url, data = null) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      let lastError = null;

      for (const baseURL of API_BASE_CANDIDATES) {
        const attemptUrl = buildApiUrl(baseURL, url);
        const start = Date.now();
        if (DIAG_API) console.log(`[DIAG][useApi] Request start: ${method} ${attemptUrl}`);
        try {
          if (DIAG_API) console.log(`[DIAG][useApi] Attempting ${method} -> ${attemptUrl}`);
          const res = await axios({
            method,
            url: attemptUrl,
            data,
            headers,
            timeout: 5000,
          });

          const duration = Date.now() - start;
          if (DIAG_API) {
            const snippet = (() => {
              try {
                const b = res.data;
                if (!b) return null;
                if (Array.isArray(b)) return `array(${b.length})`;
                if (typeof b === 'object') return Object.keys(b).slice(0,5).reduce((acc,k)=>{acc[k]=b[k]; return acc},{})
                return String(b).slice(0,200);
              } catch(e){ return '<unable to snapshot body>' }
            })();
            console.log(`[DIAG][useApi] Response: ${method} ${attemptUrl} -> ${res.status} (${duration}ms)`, snippet);
          }

          const body = res.data;
          if (DIAG_API) console.log(`[DIAG][useApi] Success ${attemptUrl} -> ${res.status}`);
          const normalizedResponse = {
            _raw: res,
            _resolvedBase: baseURL,
            data: body?.data !== undefined ? body.data : body,
            success: body?.success ?? true,
            message: body?.message || "",
            ...(body && typeof body === "object" && !Array.isArray(body) ? body : {}),
            ...(body?.data && typeof body.data === "object" && !Array.isArray(body.data) ? body.data : {}),
          };

          return normalizedResponse;
        } catch (error) {
          const duration = Date.now() - start;
          lastError = error;
          if (DIAG_API) console.warn(`[DIAG][useApi] Error: ${method} ${attemptUrl} (${duration}ms)`, error?.response?.status || error.message);
          const status = error.response?.status;
          const message = String(error.response?.data?.message || "").toLowerCase();

          const shouldRetryWithNextBase =
            !status ||
            status === 404 ||
            status >= 502 ||
            (status === 500 && message.includes("route"));

          if (!shouldRetryWithNextBase) {
            throw error;
          }
        }
      }

      throw lastError || new Error("API request failed");
    } catch (error) {
      console.error("API request error:", error);

      if (error.response?.status === 401) {
        console.warn("Authentication failed (401) - clearing invalid token and redirecting");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading };
};
