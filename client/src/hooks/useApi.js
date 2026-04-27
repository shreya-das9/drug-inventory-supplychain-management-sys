// hooks/useApi.js
import axios from "axios";
import { useState } from "react";

const API_BASE_CANDIDATES = [
	import.meta.env.VITE_API_BASE_URL,
	"http://localhost:5000",
	"http://localhost:5001",
	"http://localhost:5002"
].filter(Boolean);

export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const request = async (method, url, data = null) => {
    try {
      setLoading(true);
      
      // ❌ STEP 1: Get token using the key "token"
      const token = localStorage.getItem("token"); 
      
      // STEP 2: Build headers, including the Authorization header
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`; 
      }

			let lastError = null;

			for (const baseURL of API_BASE_CANDIDATES) {
				try {
					const res = await axios({
						method,
						url: `${baseURL}${url}`,
						data,
						headers,
					});

					return res.data;
				} catch (error) {
					lastError = error;

					const status = error?.response?.status;
					const message = String(error?.response?.data?.message || "").toLowerCase();

					const shouldRetryWithNextBase =
						!status ||
						(status === 404 && message.includes("route"));

					if (!shouldRetryWithNextBase) {
						throw error;
					}
				}
			}

			throw lastError || new Error("API request failed");
    } catch (error) {
      console.error("API request error:", error);
      
      // STEP 3: Handle 401 errors
      if (error.response?.status === 401) {
        console.warn("Authentication failed (401) - clearing invalid token and redirecting");
        // ❌ Remove the token using the key "token"
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
  };

  return { request, loading };
};