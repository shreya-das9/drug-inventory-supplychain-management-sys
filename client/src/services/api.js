
import axios from "axios";
import jwtDecode from "../utils/jwtDecode";

const rawApiBase = import.meta.env.VITE_API_BASE_URL || window?.__API_BASE__ || import.meta.env.VITE_API_URL;
// Default to the frontend's expected backend port for local development.
const API_BASE_URL = rawApiBase
  ? String(rawApiBase).replace(/\/+$/g, "").replace(/\/api$/i, "") + "/api"
  : "http://localhost:5000/api";

console.log("API BASE URL:", API_BASE_URL);

// Prefer IPv4 loopback first (127.0.0.1) to avoid IPv6 localhost resolution issues
const ipv4Variant = API_BASE_URL.replace(/^https?:\/\/localhost/i, (m) => m.replace(/localhost/i, '127.0.0.1'));
// Developer override: prefer the active backend port used in this workspace to avoid localhost port mismatches.
const DEV_BACKEND_OVERRIDE = null;
const API_BASE_URLS = Array.from(new Set([DEV_BACKEND_OVERRIDE, ipv4Variant, API_BASE_URL])).filter(Boolean);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        localStorage.clear();
        window.location.href = "/login";
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return config;
});

api.interceptors.response.use((response) => response, (error) => Promise.reject(error));

export { API_BASE_URL, API_BASE_URLS };
export default api;
