// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { login } from "../../services/auth.api";

// export default function Login() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const { data } = await login(form);
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("role", data.user.role);

//       if (data.user.role === "ADMIN") navigate("/admin/dashboard");
//       else if (data.user.role === "WAREHOUSE") navigate("/warehouse/dashboard");
//       else if (data.user.role === "RETAILER") navigate("/retailer/home");
//       else navigate("/user/home");
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h2>Login</h2>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <input 
//           name="email" 
//           type="email" 
//           placeholder="Email"
//           value={form.email} 
//           onChange={handleChange} 
//           required 
//         />
//         <input 
//           name="password" 
//           type="password" 
//           placeholder="Password"
//           value={form.password} 
//           onChange={handleChange} 
//           required 
//         />
//         <button type="submit">Login</button>
//       </form>
      
//       <div style={{ marginTop: "15px", textAlign: "center" }}>
//         <button 
//           type="button" 
//           onClick={() => navigate('/forgot-password')}
//           style={{ 
//             background: "none", 
//             border: "none", 
//             color: "#007bff", 
//             textDecoration: "underline",
//             cursor: "pointer",
//             fontSize: "14px"
//           }}
//         >
//           Forgot Password?
//         </button>
//       </div>
//     </div>
//   );
//  }






// updated
import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Activity,
  ArrowRight,
  Globe,
  MessageSquare,
  Package,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { login } from "../../services/auth.api";

import logo from "../../assets/logo.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await login(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      if (data.user.role === "ADMIN") navigate("/admin/dashboard");
      else if (data.user.role === "WAREHOUSE") navigate("/warehouse/dashboard");
      else if (data.user.role === "RETAILER") navigate("/retailer/home");
      else navigate("/user/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Typing animation for dynamic text
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const dynamicTexts = [
    "Secure Healthcare Access",
    "Real-time Medicine Tracking",
    "Advanced Supply Chain",
    "Professional Healthcare Network",
  ];

  useEffect(() => {
    const text = dynamicTexts[textIndex];
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        setCurrentText(text.substring(0, charIndex + 1));
        charIndex++;
      } else {
        setTimeout(() => {
          setTextIndex((prev) => (prev + 1) % dynamicTexts.length);
          setCurrentText("");
        }, 2000);
        clearInterval(typeInterval);
      }
    }, 100);
    return () => clearInterval(typeInterval);
  }, [textIndex]);

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-black flex items-center justify-center">
      {/* Background Glow Effects */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"></div>

      {/* Logo fixed top-left */}
      <div className="absolute top-6 left-10 z-20">
        <motion.img
          src={logo}
          alt="MediChain Logo"
          className="w-48 h-auto"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center px-6">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-10 mt-10"
        >
          {/* Dynamic Typing Text */}
          <div className="h-16 flex items-center">
            <h2 className="text-3xl md:text-4xl font-light text-white/90 flex items-center">
              {currentText}
              <span className="ml-2 inline-block w-3 h-3 bg-emerald-400 rounded-full animate-ping"></span>
            </h2>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-white/10 border border-emerald-500/30 rounded-md flex items-center gap-2 backdrop-blur-md hover:scale-105 hover:border-emerald-400/60 transition">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-white/90 text-sm font-medium">
                Enterprise Security
              </span>
            </div>
            <div className="px-4 py-2 bg-white/10 border border-blue-500/30 rounded-md flex items-center gap-2 backdrop-blur-md hover:scale-105 hover:border-blue-400/60 transition">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-white/90 text-sm font-medium">
                Real-time Monitoring
              </span>
            </div>
            <div className="px-4 py-2 bg-white/10 border border-purple-500/30 rounded-md flex items-center gap-2 backdrop-blur-md hover:scale-105 hover:border-purple-400/60 transition">
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-white/90 text-sm font-medium">
                Global Network
              </span>
            </div>
          </div>

          {/* Advice Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 p-6 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl shadow-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Expert Advice from Top Suppliers
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-white/80 text-sm">
                  Always verify supplier certifications before purchase.
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition">
                <Package className="w-5 h-5 text-orange-400" />
                <span className="text-white/80 text-sm">
                  Track medicine batches for full transparency.
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition">
                <Globe className="w-5 h-5 text-purple-400" />
                <span className="text-white/80 text-sm">
                  Opt for global suppliers with strong compliance history.
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-white/80 text-sm">
                  Ensure real-time monitoring to prevent shortages.
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.4)] hover:shadow-[0_0_60px_rgba(0,0,0,0.6)] transition">
            {/* Form Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                Welcome Back
              </h2>
              <p className="text-white/60 text-sm">
                Enter your credentials to continue
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            <form
              className="space-y-4"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              {/* Email */}
              <motion.div
                className="relative group"
                whileFocus={{ scale: 1.02 }}
              >
                <Mail className="absolute left-4 top-3 text-emerald-400 w-5 h-5 group-focus-within:text-emerald-300" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="new-email"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  required
                />
              </motion.div>

              {/* Password */}
              <motion.div
                className="relative group"
                whileFocus={{ scale: 1.02 }}
              >
                <Lock className="absolute left-4 top-3 text-purple-400 w-5 h-5 group-focus-within:text-purple-300" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </motion.div>

              {/* Forgot Password */}
              <div className="text-right">
                <motion.button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-blue-400 text-sm hover:text-blue-300"
                  whileHover={{ scale: 1.05 }}
                >
                  Forgot Password?
                </motion.button>
              </div>

              {/* Sign In */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 py-3 rounded-xl font-bold text-white relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </div>
              </motion.button>

              {/* Sign Up */}
              <div className="text-center mt-6">
                <p className="text-white/60 text-sm mb-3">
                  Don't have an account?
                </p>
                <motion.button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-blue-400 font-semibold hover:text-blue-300 flex items-center justify-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                >
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}





