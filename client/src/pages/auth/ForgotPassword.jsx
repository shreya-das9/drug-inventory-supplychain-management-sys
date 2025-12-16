import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, CheckCircle, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email
      });

      // Set success to true if request was successful (status 200-299)
      // Check for response.data.success OR just a successful response
      if (response.status >= 200 && response.status < 300) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a2642 100%)" }}
    >
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-700/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-700/20 rounded-full blur-3xl animate-pulse" 
        style={{ animationDelay: "1s" }} 
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.3)]">
          
          {/* Logo */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(59,130,246,0.3)",
                    "0 0 60px rgba(139,92,246,0.5)",
                    "0 0 20px rgba(59,130,246,0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1"
              >
                <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                  <img src={logo} alt="MediChain" className="w-20 h-20 object-contain" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {!success ? (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Forgot Password
                </h1>
                <p className="text-white/60 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full bg-white/5 text-white placeholder-white/30 pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.4)]"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
              <p className="text-white/60 mb-2">
                We've sent a password reset link to
              </p>
              <p className="text-blue-400 font-semibold mb-6">{email}</p>
              <p className="text-white/50 text-sm">
                Click the link in the email to reset your password. If you don't see it, check your spam folder.
              </p>
            </motion.div>
          )}

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <button
              onClick={() => navigate("/login")}
              className="w-full flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors py-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/40 text-sm mt-6"
        >
          © 2025 MediChain. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}