// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { signup } from "../../services/auth.api";

// export default function Signup() {
//   const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const { data } = await signup(form);
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("role", data.user.role);

//       if (data.user.role === "ADMIN") navigate("/admin/dashboard");
//       else if (data.user.role === "WAREHOUSE") navigate("/warehouse/dashboard");
//       else if (data.user.role === "RETAILER") navigate("/retailer/home");
//       else navigate("/user/home");
//     } catch (err) {
//       setError(err.response?.data?.message || "Signup failed");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h2>Signup</h2>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <input name="name" type="text" placeholder="Name"
//           value={form.name} onChange={handleChange} required />
//         <input name="email" type="email" placeholder="Email"
//           value={form.email} onChange={handleChange} required />
//         <input name="password" type="password" placeholder="Password"
//           value={form.password} onChange={handleChange} required />
//         <select name="role" value={form.role} onChange={handleChange}>
//           <option value="USER">User</option>
//           <option value="WAREHOUSE">Warehouse</option>
//           <option value="ADMIN">Admin</option>
//           <option value="RETAILER">Retailer</option>
//         </select>
//         <button type="submit">Signup</button>
//       </form>
//     </div>
//   );
// }










//new signup page

// import { useState } from "react";
// import { User, Mail, Lock, Building2, Pill, Shield, Truck, Store } from "lucide-react";
//   import { useNavigate } from "react-router-dom";
//   import { signup } from "../../services/auth.api";

// export default function Signup() {
//   const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
//   const [error, setError] = useState("");
  
//   // Note: You'll need to uncomment these imports in your actual project:

//   const navigate = useNavigate();

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // In your actual project, uncomment this:
//       const { data } = await signup(form);
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("role", data.user.role);

//       if (data.user.role === "ADMIN") navigate("/admin/dashboard");
//       else if (data.user.role === "WAREHOUSE") navigate("/warehouse/dashboard");
//       else if (data.user.role === "RETAILER") navigate("/retailer/home");
//       else navigate("/user/home");
      
//       // For demo purposes:
//       alert(`Signup successful for ${form.name} as ${form.role}`);
//       console.log("Form data:", form);
//     } catch (err) {
//       setError(err.response?.data?.message || "Signup failed");
//     }
//   };

//   const getRoleIcon = (role) => {
//     switch (role) {
//       case "ADMIN": return <Shield className="w-4 h-4" />;
//       case "WAREHOUSE": return <Truck className="w-4 h-4" />;
//       case "RETAILER": return <Store className="w-4 h-4" />;
//       default: return <User className="w-4 h-4" />;
//     }
//   };

//   const getRoleDescription = (role) => {
//     switch (role) {
//       case "ADMIN": return "System Administrator - Full access control";
//       case "WAREHOUSE": return "Warehouse Manager - Inventory & distribution";
//       case "RETAILER": return "Pharmacy/Retailer - Sales & customer service";
//       default: return "End User - Basic system access";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
//       {/* Background decorative elements */}
//       <div className="absolute top-20 left-20 w-32 h-32 bg-blue-100 rounded-full opacity-20 blur-xl"></div>
//       <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-100 rounded-full opacity-20 blur-xl"></div>
      
//       <div className="relative w-full max-w-md">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl mb-4 shadow-lg">
//             <Pill className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Our Network</h1>
//           <p className="text-gray-600">Create your account for the Drug Supply Chain Management System</p>
//         </div>

//         {/* Main Card */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
//               <div className="flex items-center">
//                 <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
//                 <p className="text-red-700 text-sm font-medium">{error}</p>
//               </div>
//             </div>
//           )}

//           <div>
//             {/* Name Field */}
//             <div className="mb-6">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 <div className="flex items-center gap-2">
//                   <User className="w-4 h-4" />
//                   Full Name
//                 </div>
//               </label>
//               <input
//                 name="name"
//                 type="text"
//                 placeholder="Enter your full name"
//                 value={form.name}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
//               />
//             </div>

//             {/* Email Field */}
//             <div className="mb-6">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 <div className="flex items-center gap-2">
//                   <Mail className="w-4 h-4" />
//                   Email Address
//                 </div>
//               </label>
//               <input
//                 name="email"
//                 type="email"
//                 placeholder="Enter your email address"
//                 value={form.email}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
//               />
//             </div>

//             {/* Password Field */}
//             <div className="mb-6">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 <div className="flex items-center gap-2">
//                   <Lock className="w-4 h-4" />
//                   Password
//                 </div>
//               </label>
//               <input
//                 name="password"
//                 type="password"
//                 placeholder="Create a strong password"
//                 value={form.password}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
//               />
//             </div>

//             {/* Role Selection */}
//             <div className="mb-6">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 <div className="flex items-center gap-2">
//                   <Building2 className="w-4 h-4" />
//                   Account Type
//                 </div>
//               </label>
//               <div className="relative">
//                 <select
//                   name="role"
//                   value={form.role}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
//                 >
//                   <option value="USER">User</option>
//                   <option value="WAREHOUSE">Warehouse</option>
//                   <option value="ADMIN">Admin</option>
//                   <option value="RETAILER">Retailer</option>
//                 </select>
//                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
//                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
//                   </svg>
//                 </div>
//               </div>
              
//               {/* Role Description */}
//               <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
//                 <div className="flex items-center gap-2 text-sm text-gray-600">
//                   {getRoleIcon(form.role)}
//                   <span className="font-medium">{getRoleDescription(form.role)}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <button
//               onClick={handleSubmit}
//               className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-green-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
//             >
//               Create Account
//             </button>
//           </div>

//           {/* Footer */}
//           <div className="mt-8 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{" "}
//               <button className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
//                 Sign in here
//               </button>
//             </p>
//           </div>
//         </div>

//         {/* Security Notice */}
//         <div className="mt-6 text-center">
//           <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/20 text-sm text-gray-600">
//             <Shield className="w-4 h-4 text-green-600" />
//             <span>Secure & HIPAA Compliant</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


//another

// import { useState } from "react";
// import { User, Mail, Lock, Building2, Pill, Shield, Truck, Store, Sparkles, Activity, Zap } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { signup } from "../../services/auth.api";

// export default function Signup() {
//   const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
  
//   const navigate = useNavigate();

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     try {
//       const { data } = await signup(form);
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("role", data.user.role);

//       if (data.user.role === "ADMIN") navigate("/admin/dashboard");
//       else if (data.user.role === "WAREHOUSE") navigate("/warehouse/dashboard");
//       else if (data.user.role === "RETAILER") navigate("/retailer/home");
//       else navigate("/user/home");
//     } catch (err) {
//       setError(err.response?.data?.message || "Signup failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getRoleIcon = (role) => {
//     switch (role) {
//       case "ADMIN": return <Shield className="w-5 h-5" />;
//       case "WAREHOUSE": return <Truck className="w-5 h-5" />;
//       case "RETAILER": return <Store className="w-5 h-5" />;
//       default: return <User className="w-5 h-5" />;
//     }
//   };

//   const getRoleDescription = (role) => {
//     switch (role) {
//       case "ADMIN": return "Complete system control & analytics";
//       case "WAREHOUSE": return "Inventory management & logistics";
//       case "RETAILER": return "Point-of-sale & customer management";
//       default: return "Patient access & prescription tracking";
//     }
//   };

//   const getRoleColor = (role) => {
//     switch (role) {
//       case "ADMIN": return "from-purple-500 to-pink-500";
//       case "WAREHOUSE": return "from-orange-500 to-red-500";
//       case "RETAILER": return "from-green-500 to-emerald-500";
//       default: return "from-blue-500 to-cyan-500";
//     }
//   };

//   return (
//     <div className="min-h-screen relative overflow-hidden bg-black">
//       {/* Animated Background */}
//       <div className="absolute inset-0">
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-emerald-900/20"></div>
        
//         {/* Floating orbs */}
//         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
//         <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-400/30 to-orange-400/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
//         {/* Grid pattern */}
//         <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
//         {/* Animated particles */}
//         <div className="absolute inset-0">
//           {[...Array(50)].map((_, i) => (
//             <div
//               key={i}
//               className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-twinkle"
//               style={{
//                 left: `${Math.random() * 100}%`,
//                 top: `${Math.random() * 100}%`,
//                 animationDelay: `${Math.random() * 5}s`,
//                 animationDuration: `${2 + Math.random() * 3}s`
//               }}
//             ></div>
//           ))}
//         </div>
//       </div>
      
//       <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
//         <div className="w-full max-w-md">
//           {/* Header */}
//           <div className="text-center mb-10">
//             <div className="relative inline-block mb-6">
//               <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-3xl blur-lg opacity-75 animate-pulse"></div>
//               <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 p-4 rounded-3xl shadow-2xl">
//                 <Pill className="w-10 h-10 text-white animate-bounce" />
//               </div>
//               <div className="absolute -top-2 -right-2">
//                 <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
//               </div>
//             </div>
//             <h1 className="text-5xl font-black bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent mb-4 tracking-tight">
//               MedChain
//             </h1>
//             <p className="text-gray-300 text-lg font-medium">
//               Next-gen pharmaceutical supply chain
//             </p>
//             <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-400">
//               <div className="flex items-center gap-1">
//                 <Activity className="w-4 h-4 text-green-400 animate-pulse" />
//                 <span>Live Network</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <Shield className="w-4 h-4 text-blue-400" />
//                 <span>Blockchain Secured</span>
//               </div>
//             </div>
//           </div>

//           {/* Main Card */}
//           <div className="relative group">
//             {/* Card glow effect */}
//             <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            
//             <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
//               {/* Glassmorphism overlay */}
//               <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent rounded-3xl"></div>
              
//               <div className="relative z-10">
//                 {error && (
//                   <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm">
//                     <div className="flex items-center gap-3">
//                       <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
//                       <p className="text-red-300 text-sm font-medium">{error}</p>
//                     </div>
//                   </div>
//                 )}

//                 <div className="space-y-6">
//                   {/* Name Field */}
//                   <div className="group">
//                     <label className="block text-sm font-bold text-white/90 mb-3 items-center gap-2">
//                       <User className="w-4 h-4 text-blue-400" />
//                       Full Name
//                     </label>
//                     <div className="relative">
//                       <input
//                         name="name"
//                         type="text"
//                         placeholder="Enter your full name"
//                         value={form.name}
//                         onChange={handleChange}
//                         required
//                         className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder-white/40 text-white backdrop-blur-sm group-hover:bg-white/10"
//                       />
//                       <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
//                     </div>
//                   </div>

//                   {/* Email Field */}
//                   <div className="group">
//                     <label className="block text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
//                       <Mail className="w-4 h-4 text-emerald-400" />
//                       Email Address
//                     </label>
//                     <div className="relative">
//                       <input
//                         name="email"
//                         type="email"
//                         placeholder="Enter your email address"
//                         value={form.email}
//                         onChange={handleChange}
//                         required
//                         className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 placeholder-white/40 text-white backdrop-blur-sm group-hover:bg-white/10"
//                       />
//                       <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
//                     </div>
//                   </div>

//                   {/* Password Field */}
//                   <div className="group">
//                     <label className="block text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
//                       <Lock className="w-4 h-4 text-purple-400" />
//                       Password
//                     </label>
//                     <div className="relative">
//                       <input
//                         name="password"
//                         type="password"
//                         placeholder="Create a strong password"
//                         value={form.password}
//                         onChange={handleChange}
//                         required
//                         className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 placeholder-white/40 text-white backdrop-blur-sm group-hover:bg-white/10"
//                       />
//                       <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
//                     </div>
//                   </div>

//                   {/* Role Selection */}
//                   <div className="group">
//                     <label className="block text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
//                       <Building2 className="w-4 h-4 text-orange-400" />
//                       Account Type
//                     </label>
//                     <div className="relative">
//                       <select
//                         name="role"
//                         value={form.role}
//                         onChange={handleChange}
//                         className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 text-white backdrop-blur-sm appearance-none cursor-pointer group-hover:bg-white/10"
//                       >
//                         <option value="USER" className="bg-gray-900 text-white">User</option>
//                         <option value="WAREHOUSE" className="bg-gray-900 text-white">Warehouse</option>
//                         <option value="ADMIN" className="bg-gray-900 text-white">Admin</option>
//                         <option value="RETAILER" className="bg-gray-900 text-white">Retailer</option>
//                       </select>
//                       <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
//                         <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
//                         </svg>
//                       </div>
//                       <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
//                     </div>
                    
//                     {/* Enhanced Role Description */}
//                     <div className="mt-4 relative">
//                       <div className={`p-4 bg-gradient-to-r ${getRoleColor(form.role)} rounded-2xl bg-opacity-10 border border-white/10 backdrop-blur-sm`}>
//                         <div className="flex items-center gap-3">
//                           <div className={`p-2 bg-gradient-to-r ${getRoleColor(form.role)} rounded-xl`}>
//                             {getRoleIcon(form.role)}
//                           </div>
//                           <div>
//                             <div className="font-bold text-white text-sm uppercase tracking-wider">{form.role}</div>
//                             <div className="text-white/70 text-xs font-medium">{getRoleDescription(form.role)}</div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Submit Button */}
//                   <div className="pt-4">
//                     <button
//                       onClick={handleSubmit}
//                       disabled={isLoading}
//                       className="w-full relative group bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-blue-500/25 focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
//                     >
//                       {/* Button shine effect */}
//                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
//                       <div className="relative flex items-center justify-center gap-2">
//                         {isLoading ? (
//                           <>
//                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                             <span>Creating Account...</span>
//                           </>
//                         ) : (
//                           <>
//                             <Zap className="w-5 h-5" />
//                             <span>Join the Network</span>
//                           </>
//                         )}
//                       </div>
//                     </button>
//                   </div>
//                 </div>

//                 {/* Footer */}
//                 <div className="mt-8 text-center">
//                   <p className="text-white/60 text-sm">
//                     Already have an account?{" "}
//                     <button className="text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text font-bold hover:from-blue-300 hover:to-emerald-300 transition-all duration-300">
//                       Sign in here
//                     </button>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Security Badges */}
//           <div className="mt-8 flex items-center justify-center gap-6">
//             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
//               <Shield className="w-4 h-4 text-green-400" />
//               <span className="text-xs text-white/80 font-medium">256-bit SSL</span>
//             </div>
//             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
//               <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
//               <span className="text-xs text-white/80 font-medium">HIPAA Compliant</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         .bg-grid-pattern {
//           background-image: 
//             linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
//             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
//           background-size: 50px 50px;
//         }
        
//         @keyframes twinkle {
//           0%, 100% { opacity: 0; transform: scale(0.5); }
//           50% { opacity: 1; transform: scale(1); }
//         }
        
//         .animate-twinkle {
//           animation: twinkle linear infinite;
//         }
//       `}</style>
//     </div>
//   );
// }


//ANOTHER PROLLY THE BEST ONE
import { useState } from "react";
import { User, Mail, Lock, Building2, Pill, Shield, Truck, Store, Sparkles, Activity, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../services/auth.api";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN": return <Shield className="w-4 h-4" />;
      case "WAREHOUSE": return <Truck className="w-4 h-4" />;
      case "RETAILER": return <Store className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case "ADMIN": return "Complete system control & analytics";
      case "WAREHOUSE": return "Inventory management & logistics";
      case "RETAILER": return "Point-of-sale & customer management";
      default: return "Patient access & prescription tracking";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN": return "from-purple-500 to-pink-500";
      case "WAREHOUSE": return "from-orange-500 to-red-500";
      case "RETAILER": return "from-green-500 to-emerald-500";
      default: return "from-blue-500 to-cyan-500";
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-emerald-900/20"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-400/30 to-orange-400/30 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Animated particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>
      
      <div className="relative z-10 h-full flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-4">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 p-3 rounded-2xl shadow-2xl">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-spin" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
              MedChain
            </h1>
            <p className="text-gray-300 text-sm mb-3">Next-gen pharmaceutical supply chain</p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-green-400 animate-pulse" />
                <span>Live Network</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-400" />
                <span>Blockchain Secured</span>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder-white/40"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-white placeholder-white/40"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-white placeholder-white/40"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-400" />
                  Account Type
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-white appearance-none cursor-pointer"
                >
                  <option value="USER" className="bg-gray-900">User</option>
                  <option value="WAREHOUSE" className="bg-gray-900">Warehouse</option>
                  <option value="ADMIN" className="bg-gray-900">Admin</option>
                  <option value="RETAILER" className="bg-gray-900">Retailer</option>
                </select>
                
                {/* Role Description */}
                <div className="mt-3 p-3 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 bg-gradient-to-r ${getRoleColor(form.role)} rounded-lg`}>
                      {getRoleIcon(form.role)}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-xs uppercase">{form.role}</div>
                      <div className="text-white/70 text-xs">{getRoleDescription(form.role)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-xl hover:shadow-blue-500/25 focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Join the Network</span>
                  </div>
                )}
              </button>
            </div>

            {/* Login Link - Moved here at bottom of form */}
            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                Already have an account?{" "}
                <button className="text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text font-bold hover:from-blue-300 hover:to-emerald-300 transition-all">
                  Login here
                </button>
              </p>
            </div>
          </div>

          {/* Security Badges */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <Shield className="w-3 h-3 text-green-400" />
              <span className="text-xs text-white/80">SSL Secured</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
              <span className="text-xs text-white/80">HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


