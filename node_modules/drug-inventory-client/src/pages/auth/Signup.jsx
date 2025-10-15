


import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Building2,
  Shield,
  Truck,
  Store,
  Eye,
  EyeOff,
  Pill,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { signup } from "../../services/auth.api";

import logo from "../../assets/logo.png";
import doctorImg from "../../assets/doctorimage.jpg";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [entrancePlayed, setEntrancePlayed] = useState(false);

  useEffect(() => setEntrancePlayed(true), []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await signup(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      if (data.user.role === "ADMIN") navigate("/admin/dashboard");
      else if (data.user.role === "WAREHOUSE") navigate("/warehouse/dashboard");
      else if (data.user.role === "RETAILER") navigate("/retailer/home");
      else navigate("/user/home");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return "";
    if (password.length < 6) return "Weak";
    if (/[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8)
      return "Strong";
    return "Medium";
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-5 h-5" />;
      case "WAREHOUSE":
        return <Truck className="w-5 h-5" />;
      case "RETAILER":
        return <Store className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case "ADMIN":
        return "Complete system control & analytics";
      case "WAREHOUSE":
        return "Inventory management & logistics";
      case "RETAILER":
        return "Point-of-sale & customer management";
      default:
        return "Patient access & prescription tracking";
    }
  };

  const [counterValues, setCounterValues] = useState({
    hospitals: 0,
    medicines: 0,
    transparency: 0,
  });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    const timer = setTimeout(() => {
      setHasAnimated(true);
      let hospitalsCount = 0;
      let medicinesCount = 0;
      let transparencyCount = 0;
      const interval = setInterval(() => {
        if (hospitalsCount < 500) hospitalsCount += 8;
        if (medicinesCount < 2000) medicinesCount += 32;
        if (transparencyCount < 99) transparencyCount += 2;
        setCounterValues({
          hospitals: Math.min(hospitalsCount, 500),
          medicines: Math.min(medicinesCount, 2000),
          transparency: Math.min(transparencyCount, 99),
        });
        if (
          hospitalsCount >= 500 &&
          medicinesCount >= 2000 &&
          transparencyCount >= 99
        ) {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, [hasAnimated]);

  const Counter = ({ value, label }) => (
    <div className="text-center">
      <p className="text-2xl md:text-3xl font-bold text-blue-400">
        {value.toLocaleString()}
      </p>
      <p className="text-xs md:text-sm text-white/70">{label}</p>
    </div>
  );

  const [progressAnimated, setProgressAnimated] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setProgressAnimated(true), 500);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen flex overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-black">
      {/* Logo - Positioned at top left */}
      <div className="absolute top-1 left-1 z-50">
        <img
          src={logo}
          alt="MediChain Logo"
          className="w-36 md:w-40 h-auto object-contain drop-shadow-lg"
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 h-full">
        {/* Left Panel */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-black/50 p-6 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl"
          >
            <h2 className="text-2xl font-bold text-white text-center">
              Create Account
            </h2>
            <p className="text-white/60 text-sm mb-4 text-center">
              Join the Network
            </p>

            {error && (
              <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form className="space-y-3" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="relative">
                <User className="absolute left-3 top-3 text-blue-400 w-5 h-5" />
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-emerald-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-purple-400 w-5 h-5" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-1 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/60"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Strength: {getPasswordStrength(form.password)}
              </p>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-pink-400 w-5 h-5" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-1 focus:ring-pink-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-white/60"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Role */}
              <div>
                <label className="text-sm font-semibold text-white/90 mb-1 flex items-center gap-2">
  <Building2 className="w-4 h-4 text-orange-400" /> Account Type
</label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white cursor-pointer focus:ring-1 focus:ring-orange-500"
                >
                  <option value="USER" className="bg-gray-900">
                    User
                  </option>
                  <option value="WAREHOUSE" className="bg-gray-900">
                    Warehouse
                  </option>
                  <option value="ADMIN" className="bg-gray-900">
                    Admin
                  </option>
                  <option value="RETAILER" className="bg-gray-900">
                    Retailer
                  </option>
                </select>
                <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/8 flex gap-3 items-center">
                  <div className="p-2 bg-blue-600 rounded-md">
                    {getRoleIcon(form.role)}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-xs uppercase">
                      {form.role}
                    </div>
                    <div className="text-white/70 text-xs">
                      {getRoleDescription(form.role)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-2 rounded-lg font-bold text-white shadow-lg hover:shadow-xl transition disabled:opacity-50"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95, rotate: -1 }}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </motion.button>

              <p className="text-center text-sm text-white/60">
                Already have an account?{" "}
                <motion.button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-400 font-bold hover:underline"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92, rotate: 1 }}
                >
                  Sign in
                </motion.button>
              </p>
            </form>
          </motion.div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 h-full relative flex flex-col items-center justify-center overflow-hidden">
          <img
            src={doctorImg}
            alt="Medicine"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative z-10 text-center px-6 max-w-lg space-y-5">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={entrancePlayed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-extrabold text-white"
            >
              Smarter Drug Supply Chains
            </motion.h2>

            <p className="text-white/80">
              Hospitals, warehouses, and retailers working together to prevent
              shortages, fight counterfeits, and ensure medicines reach patients
              on time.
            </p>

            <div className="flex gap-8 justify-center">
              <Counter
                value={counterValues.hospitals}
                label="Hospitals Connected"
              />
              <Counter
                value={counterValues.medicines}
                label="Medicines Tracked"
              />
              <Counter
                value={counterValues.transparency}
                label="Transparency (%)"
              />
            </div>

            <div className="w-full max-w-md">
              <p className="text-sm text-white/80 mb-2 flex items-center gap-2 justify-center">
                <Activity className="w-4 h-4 text-green-400" />
                Live Transparency Progress
              </p>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full"
                  style={{
                    width: progressAnimated ? "99%" : "0%",
                    transition: "width 5s ease-out",
                  }}
                />
              </div>
            </div>

            <blockquote className="bg-white/8 p-3 rounded-lg italic text-sm">
              "Ensuring every medicine reaches the right hands safely."
            </blockquote>

            <div className="flex gap-6 justify-center items-center text-xs text-white/70">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-400" /> ISO Certified
              </div>
              <div className="flex items-center gap-1">
                <Pill className="w-4 h-4 text-blue-400" /> HIPAA Compliant
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-yellow-400" /> Govt. Approved
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




























