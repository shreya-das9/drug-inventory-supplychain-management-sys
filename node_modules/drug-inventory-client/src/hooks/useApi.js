// hooks/useApi.js
import axios from "axios";
import { useState } from "react";

export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const request = async (method, url, data = null) => {
    try {
      setLoading(true);

      const baseURL = "http://localhost:5000";
      
      // ❌ STEP 1: Get token using the key "token"
      const token = localStorage.getItem("token"); 
      
      // STEP 2: Build headers, including the Authorization header
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`; 
      }

      const res = await axios({
        method,
        url: `${baseURL}${url}`,
        data,
        headers, // Attach the headers
      });

      return res.data;
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