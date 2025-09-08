import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/auth.api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setMessage("");
    setIsSuccess(false);
    
    // Validation
    if (!email) {
      setMessage("Email is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setMessage("Please provide a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword({ email });
      
      setMessage(response.data.message || "If an account with that email exists, a password reset link has been sent.");
      setIsSuccess(true);
      setEmail(""); // Clear email field after successful submission
      
    } catch (error) {
      console.error("Forgot password error:", error);
      
      // Handle different error scenarios
      if (error.response) {
        setMessage(error.response.data.message || "Failed to send reset email");
      } else if (error.request) {
        setMessage("Network error. Please check your connection and try again.");
      } else {
        setMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2>Forgot Password</h2>
        <p style={{ color: "#666", fontSize: "14px", margin: "10px 0" }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div 
          style={{ 
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "20px",
            backgroundColor: isSuccess ? "#d4edda" : "#f8d7da",
            color: isSuccess ? "#155724" : "#721c24",
            border: `1px solid ${isSuccess ? "#c3e6cb" : "#f5c6cb"}`,
            fontSize: "14px",
            lineHeight: "1.4"
          }}
        >
          {message}
        </div>
      )}

      {/* Show form unless it's a successful submission */}
      {!isSuccess && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s"
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ 
                  marginRight: "8px",
                  width: "16px",
                  height: "16px",
                  border: "2px solid #ffffff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></span>
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      )}

      {/* Back to Login Button */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button 
          type="button" 
          onClick={handleBackToLogin}
          style={{ 
            background: "none", 
            border: "none", 
            color: "#007bff", 
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "14px",
            padding: "5px"
          }}
        >
          ← Back to Login
        </button>
      </div>

      {/* Success state: Show additional helpful information */}
      {isSuccess && (
        <div style={{ 
          marginTop: "20px", 
          padding: "15px", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "4px",
          fontSize: "14px",
          color: "#6c757d"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#495057" }}>What's next?</h4>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            <li>Check your email inbox (and spam folder)</li>
            <li>Click the reset link in the email</li>
            <li>The link will expire in 1 hour for security</li>
            <li>If you don't receive the email, you can try again</li>
          </ul>
        </div>
      )}

      {/* CSS for loading spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}