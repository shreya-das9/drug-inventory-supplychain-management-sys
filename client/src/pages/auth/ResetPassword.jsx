import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword, verifyResetToken } from "../../services/auth.api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setMessage("Invalid reset link");
        setCheckingToken(false);
        return;
      }

      try {
        await verifyResetToken(token);
        setTokenValid(true);
      } catch (error) {
        setMessage(error.response?.data?.message || "Invalid or expired reset link");
      } finally {
        setCheckingToken(false);
      }
    };

    checkToken();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (form.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await resetPassword({ token, newPassword: form.newPassword });
      setMessage("Password reset successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="auth-container">
        <h2>Verifying Reset Link...</h2>
        <p>Please wait while we verify your reset link.</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <h2>Invalid Reset Link</h2>
        <p style={{ color: "red" }}>{message}</p>
        <button 
          onClick={() => navigate("/login")}
          style={{ marginTop: "20px" }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      <p>Enter your new password below.</p>
      
      {message && (
        <p style={{ 
          color: message.includes("successfully") ? "green" : "red" 
        }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          name="newPassword"
          type="password"
          placeholder="New Password"
          value={form.newPassword}
          onChange={handleChange}
          required
          minLength="6"
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm New Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          minLength="6"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button 
          type="button" 
          onClick={() => navigate("/login")}
          style={{ 
            background: "none", 
            border: "none", 
            color: "#007bff", 
            textDecoration: "underline",
            cursor: "pointer"
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}