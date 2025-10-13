// components/ProtectedRoute.jsx

// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // ❌ Change from "authToken" to "token" to match Login.jsx
  const token = localStorage.getItem("token"); 
  const user = localStorage.getItem("user");
  
  // If no token or user data, redirect to login
  if (!token || !user) {
    console.log("No authentication found, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  try {
    // Validate that user data is valid JSON
    JSON.parse(user);
  } catch (error) {
    console.error("Invalid user data, clearing and redirecting");
    // ❌ Change to remove "token"
    localStorage.removeItem("token"); 
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
  
  // User is authenticated, render the protected component
  return children;
}