import axios from "axios";
import { jwtDecode } from "jwt-decode";

const rawApiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
const API_BASE_URL = rawApiBase
  ? rawApiBase.replace(/\/+$/, "") + "/api"
  : "http://localhost:5000/api";

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

export { API_BASE_URL };
export default api;
