import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Shield, CheckCircle } from "lucide-react";
import axios from "axios";

export default function Logout() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [message, setMessage] = useState("Logging out...");

  useEffect(() => {
    const performLogout = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Call logout API
        await axios.post(
          "http://localhost:5000/api/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Clear all authentication data
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        sessionStorage.clear();

        setIsLoggingOut(false);
        setMessage("Logged out successfully!");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        console.error("Logout error:", error);
        setIsLoggingOut(false);
        setMessage("Logged out successfully!");

        // Clear data even if API call fails
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        sessionStorage.clear();

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Logo/Icon Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: isLoggingOut ? 360 : 0 }}
              transition={{ duration: 2, repeat: isLoggingOut ? Infinity : 0 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4"
            >
              {isLoggingOut ? (
                <LogOut className="w-8 h-8 text-purple-400" />
              ) : (
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {isLoggingOut ? "Logging Out" : "Logged Out"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-center"
            >
              {message}
            </motion.p>
          </div>

          {/* Status Message */}
          {!isLoggingOut && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center mb-6"
            >
              <p className="text-emerald-300 text-sm font-medium">
                You have been successfully logged out. Redirecting to login page...
              </p>
            </motion.div>
          )}

          {/* Loading animation */}
          {isLoggingOut && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-2 mb-6"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ delay: i * 0.1, duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                ></motion.div>
              ))}
            </motion.div>
          )}

          {/* Info text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-gray-400 text-xs text-center"
          >
            <Shield className="w-4 h-4" />
            <span>Your session has been securely ended</span>
          </motion.div>
        </div>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-gray-500 text-sm mt-6"
        >
          See you again soon!
        </motion.p>
      </motion.div>
    </div>
  );
}
