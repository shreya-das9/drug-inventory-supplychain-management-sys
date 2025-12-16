
// import { useState } from "react";
// import { useLocation, useNavigate, Outlet } from "react-router-dom";
// import { motion } from "framer-motion";

// export default function AdminLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const menuItems = [
//     { id: "dashboard", label: "Dashboard", icon: "📊", path: "/admin/dashboard" },
//     { id: "drugs", label: "Drugs", icon: "💊", path: "/admin/drugs" },
//     { id: "inventory", label: "Inventory", icon: "📦", path: "/admin/inventory" },
//     { id: "alerts", label: "Alerts", icon: "🔔", path: "/admin/alerts" },
//   ];

//   const getActivePage = () => {
//     if (location.pathname.includes("drugs")) return "drugs";
//     if (location.pathname.includes("inventory")) return "inventory";
//     if (location.pathname.includes("alerts")) return "alerts";
//     return "dashboard";
//   };

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       {/* Sidebar */}
//       <motion.div
//         animate={{ width: sidebarOpen ? 260 : 80 }}
//         className="bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col justify-between transition-all duration-300"
//       >
//         {/* Logo */}
//         <div>
//           <div className="p-6 border-b border-blue-600 flex items-center gap-3">
//             <div className="text-3xl">📦</div>
//             {sidebarOpen && (
//               <div>
//                 <h1 className="font-bold text-lg">MedStock</h1>
//                 <p className="text-xs text-blue-200">Warehouse Admin</p>
//               </div>
//             )}
//           </div>

//           {/* Menu */}
//           <nav className="p-4 space-y-2">
//             {menuItems.map((item) => (
//               <button
//                 key={item.id}
//                 onClick={() => navigate(item.path)}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
//                   getActivePage() === item.id
//                     ? "bg-white text-blue-800 font-semibold shadow-md"
//                     : "text-blue-100 hover:bg-blue-600"
//                 }`}
//               >
//                 <span className="text-xl">{item.icon}</span>
//                 {sidebarOpen && <span>{item.label}</span>}
//               </button>
//             ))}
//           </nav>
//         </div>

//         {/* Toggle Button */}
//         <div className="p-4 border-t border-blue-600">
//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
//           >
//             {sidebarOpen ? "<<" : ">>"}
//           </button>
//         </div>
//       </motion.div>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col">
//         {/* Header */}
//         <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
//           <h2 className="text-2xl font-bold text-gray-800">
//             {menuItems.find((item) => item.id === getActivePage())?.label}
//           </h2>
//           <div className="flex items-center gap-4">
//             <button className="text-gray-600 hover:text-gray-900 text-xl">🔔</button>
//             <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
//               A
//             </button>
//           </div>
//         </header>

//         {/* Page Content */}
//         <div className="p-8 overflow-auto flex-1">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import { useLocation, useNavigate, Outlet } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Bell,
//   Package,
//   Pill,
//   Boxes,
//   AlertTriangle,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import logo from "../../assets/logo.png";

// export default function AdminLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const menuItems = [
//     { id: "dashboard", label: "Dashboard", icon: <Package className="w-5 h-5" />, path: "/admin/dashboard" },
//     { id: "drugs", label: "Drugs", icon: <Pill className="w-5 h-5" />, path: "/admin/drugs" },
//     { id: "inventory", label: "Inventory", icon: <Boxes className="w-5 h-5" />, path: "/admin/inventory" },
//     { id: "alerts", label: "Alerts", icon: <AlertTriangle className="w-5 h-5" />, path: "/admin/alerts" },
//   ];

//   const getActivePage = () => {
//     if (location.pathname.includes("drugs")) return "drugs";
//     if (location.pathname.includes("inventory")) return "inventory";
//     if (location.pathname.includes("alerts")) return "alerts";
//     return "dashboard";
//   };

//   return (
//     <div className="flex h-screen overflow-hidden bg-gradient-to-br from-black via-[#020817] to-[#0a0328] text-white">
//       {/* Background Glow */}
//       <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-700/30 rounded-full blur-3xl"></div>
//       <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-700/30 rounded-full blur-3xl"></div>

//       {/* Sidebar */}
//       <motion.aside
//         animate={{ width: sidebarOpen ? 260 : 90 }}
//         transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
//         className="relative z-20 bg-gradient-to-b from-[#0a0f2c]/90 to-[#141b41]/90 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between shadow-[0_0_25px_rgba(0,0,0,0.6)]"
//       >
//         {/* Logo */}
//         <div className="p-5 border-b border-white/10 flex items-center gap-3">
//           <motion.img
//             src={logo}
//             alt="MedChain Logo"
//             className="w-10 h-10 drop-shadow-[0_0_20px_#3b82f6]"
//             whileHover={{ scale: 1.1, rotate: 5 }}
//           />
//           {sidebarOpen && (
//             <motion.div
//               initial={{ opacity: 0, x: -10 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.4 }}
//             >
//               <h1 className="font-bold text-lg tracking-wide text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">
//                 MediChain
//               </h1>
//               <p className="text-xs text-white/50">Admin Panel</p>
//             </motion.div>
//           )}
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 p-4 space-y-2">
//           {menuItems.map((item, index) => {
//             const isActive = getActivePage() === item.id;
//             return (
//               <motion.button
//                 key={item.id}
//                 onClick={() => navigate(item.path)}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.97 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
//                   isActive
//                     ? "bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700 text-white shadow-[0_0_15px_rgba(124,58,237,0.6)]"
//                     : "text-white/70 hover:text-white hover:bg-white/10"
//                 }`}
//               >
//                 {item.icon}
//                 {sidebarOpen && (
//                   <motion.span
//                     initial={{ opacity: 0, x: -8 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: index * 0.05 }}
//                     className="font-medium text-sm tracking-wide"
//                   >
//                     {item.label}
//                   </motion.span>
//                 )}
//               </motion.button>
//             );
//           })}
//         </nav>

//         {/* Sidebar Toggle */}
//         <div className="p-4 border-t border-white/10">
//           <motion.button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.95 }}
//             className="w-full bg-gradient-to-r from-blue-800 to-purple-800 hover:from-blue-700 hover:to-purple-700 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white shadow-[0_0_10px_rgba(124,58,237,0.5)]"
//           >
//             {sidebarOpen ? (
//               <ChevronLeft className="w-4 h-4" />
//             ) : (
//               <ChevronRight className="w-4 h-4" />
//             )}
//           </motion.button>
//         </div>
//       </motion.aside>

//       {/* Main Section */}
//       <div className="flex-1 flex flex-col relative z-10">
//         {/* Header */}
//         <header className="backdrop-blur-2xl bg-gradient-to-r from-[#0f172a]/80 to-[#1e1b4b]/80 border-b border-white/10 px-8 py-4 flex justify-between items-center shadow-[0_0_30px_rgba(0,0,0,0.6)]">
//           <motion.h2
//             key={getActivePage()}
//             initial={{ opacity: 0, y: -8 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="text-xl font-semibold tracking-wide text-white drop-shadow-[0_0_10px_#7c3aed]"
//           >
//             {menuItems.find((item) => item.id === getActivePage())?.label}
//           </motion.h2>

//           <div className="flex items-center gap-4">
//             <motion.button
//               whileHover={{ scale: 1.2, rotate: 15 }}
//               className="p-2 bg-white/10 rounded-full hover:bg-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
//             >
//               <Bell className="w-5 h-5 text-white/80" />
//             </motion.button>
//             <motion.div
//               whileHover={{ scale: 1.1 }}
//               className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center font-bold shadow-[0_0_20px_rgba(124,58,237,0.6)]"
//             >
//               A
//             </motion.div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <motion.main
//           key={location.pathname}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//           className="flex-1 overflow-auto p-8 bg-gradient-to-br from-[#0a0f2c]/90 via-[#141b41]/90 to-[#0f172a]/90 backdrop-blur-xl"
//         >
//           <Outlet />
//         </motion.main>
//       </div>
//     </div>
//   );
// }




// import { useState } from "react";
// import { useLocation, useNavigate, Outlet } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Bell,
//   Package,
//   Pill,
//   Boxes,
//   AlertTriangle,
//   ChevronLeft,
//   ChevronRight,
//   HelpCircle,
//   X,
// } from "lucide-react";
// import logo from "../../assets/logo.png";

// export default function AdminLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [showSupport, setShowSupport] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const menuItems = [
//     { id: "dashboard", label: "Dashboard", icon: <Package className="w-5 h-5" />, path: "/admin/dashboard" },
//     { id: "drugs", label: "Drugs", icon: <Pill className="w-5 h-5" />, path: "/admin/drugs" },
//     { id: "inventory", label: "Inventory", icon: <Boxes className="w-5 h-5" />, path: "/admin/inventory" },
//     { id: "alerts", label: "Alerts", icon: <AlertTriangle className="w-5 h-5" />, path: "/admin/alerts" },
//   ];

//   const getActivePage = () => {
//     if (location.pathname.includes("drugs")) return "drugs";
//     if (location.pathname.includes("inventory")) return "inventory";
//     if (location.pathname.includes("alerts")) return "alerts";
//     return "dashboard";
//   };

//   return (
//     <div
//       className="flex h-screen overflow-hidden text-white"
//       style={{
//         background: "linear-gradient(135deg, #0d1b2a 0%, #1a2642 100%)",
//       }}
//     >
//       {/* Background Glow */}
//       <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#1a4d5c]/20 rounded-full blur-3xl"></div>
//       <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#2d5a6e]/20 rounded-full blur-3xl"></div>

//       {/* Sidebar */}
//       <motion.aside
//         animate={{ width: sidebarOpen ? 260 : 90 }}
//         transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
//         className="relative z-20 bg-gradient-to-b from-[#0d1b2a]/95 to-[#1a2642]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between shadow-[0_0_25px_rgba(0,0,0,0.6)]"
//       >
        
//        {/* Logo */}
// <div className="p-3 border-b border-white/10 flex flex-col items-center">
//   <div className="w-full flex justify-center mb-1">
//     <img
//       src={logo}
//       alt="MediChain Logo"
//       className="w-36 h-auto object-contain drop-shadow-[0_0_30px_#5b7cff]"
//     />
//   </div>
//   <p className="text-[10px] font-medium text-white/60 tracking-wider uppercase">Admin Panel</p>
// </div>



        



//       {/* Navigation */}
//         <nav className="flex-1 p-4 space-y-2">
//           {menuItems.map((item, index) => {
//             const isActive = getActivePage() === item.id;
//             return (
//               <motion.button
//                 key={item.id}
//                 onClick={() => navigate(item.path)}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.97 }}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
//                   isActive
//                     ? "bg-gradient-to-r from-[#5b7cff] to-[#7c3aed] text-white shadow-[0_0_15px_rgba(91,124,255,0.5)]"
//                     : "text-white/70 hover:text-white hover:bg-[#1a4d5c]/40"
//                 }`}
//               >
//                 {item.icon}
//                 {sidebarOpen && (
//                   <motion.span
//                     initial={{ opacity: 0, x: -8 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: index * 0.05 }}
//                     className="font-medium text-sm tracking-wide"
//                   >
//                     {item.label}
//                   </motion.span>
//                 )}
//               </motion.button>
//             );
//           })}
//         </nav>

//         {/* Support & Help */}
//         <div className="px-4 pb-3 border-t border-white/10 space-y-3">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             onClick={() => setShowSupport(true)}
//             className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1a4d5c] to-[#2d5a6e] py-2 rounded-xl text-white/90 hover:text-white hover:from-[#1a4d5c]/80 hover:to-[#2d5a6e]/80 shadow-[0_0_10px_rgba(26,77,92,0.6)]"
//           >
//             <HelpCircle className="w-4 h-4" />
//             {sidebarOpen && <span className="text-sm font-semibold">Support & Help</span>}
//           </motion.button>

//           {/* Sidebar Toggle */}
//           <motion.button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.95 }}
//             className="w-full bg-gradient-to-r from-[#5b7cff] to-[#7c3aed] hover:from-[#6a83ff] hover:to-[#8b5eff] py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white shadow-[0_0_10px_rgba(91,124,255,0.5)]"
//           >
//             {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
//           </motion.button>
//         </div>
//       </motion.aside>

//       {/* Main Section */}
//       <div className="flex-1 flex flex-col relative z-10">
//         {/* Header */}
//         <header className="backdrop-blur-2xl bg-gradient-to-r from-[#0d1b2a]/80 to-[#1a2642]/80 border-b border-white/10 px-8 py-4 flex justify-between items-center shadow-[0_0_30px_rgba(0,0,0,0.6)]">
//           <motion.h2
//             key={getActivePage()}
//             initial={{ opacity: 0, y: -8 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="text-xl font-semibold tracking-wide text-white drop-shadow-[0_0_10px_#5b7cff]"
//           >
//             {menuItems.find((item) => item.id === getActivePage())?.label}
//           </motion.h2>

//           <div className="flex items-center gap-4">
//             <motion.button
//               whileHover={{ scale: 1.2, rotate: 15 }}
//               className="p-2 bg-[#1a4d5c]/40 rounded-full hover:bg-[#1a4d5c]/60 shadow-[0_0_10px_rgba(91,124,255,0.3)]"
//             >
//               <Bell className="w-5 h-5 text-white/80" />
//             </motion.button>
//             <motion.div
//               whileHover={{ scale: 1.1 }}
//               className="w-10 h-10 bg-gradient-to-r from-[#5b7cff] to-[#7c3aed] rounded-full flex items-center justify-center font-bold shadow-[0_0_20px_rgba(91,124,255,0.5)]"
//             >
//               A
//             </motion.div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <motion.main
//           key={location.pathname}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//           className="flex-1 overflow-auto p-8 bg-[rgba(13,27,42,0.8)] backdrop-blur-xl"
//         >
//           <Outlet />
//         </motion.main>
//       </div>

//       {/* Support Modal */}
//       <AnimatePresence>
//         {showSupport && (
//           <motion.div
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.8, opacity: 0 }}
//               transition={{ type: "spring", stiffness: 120 }}
//               className="bg-[rgba(30,41,59,0.8)] p-8 rounded-2xl shadow-[0_0_25px_rgba(91,124,255,0.4)] w-[400px] text-center"
//             >
//               <h3 className="text-lg font-semibold text-white mb-2">Support & Help</h3>
//               <p className="text-sm text-[#94a3b8] mb-6">
//                 For any assistance, reach out to our team at{" "}
//                 <span className="text-[#5b7cff] font-medium">support@medichain.com</span> or call{" "}
//                 <span className="text-[#5b7cff] font-medium">+91 98765 43210</span>.
//               </p>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 onClick={() => setShowSupport(false)}
//                 className="px-5 py-2 bg-gradient-to-r from-[#5b7cff] to-[#7c3aed] rounded-lg text-sm font-semibold shadow-[0_0_10px_rgba(91,124,255,0.4)]"
//               >
//                 Close
//               </motion.button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


// claude 

import { useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Package,
  Pill,
  Boxes,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Settings,
  X,
  Users,
  Truck,
  FileText,
} from "lucide-react";
import logo from "../../assets/logo.png";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Package className="w-5 h-5" />, path: "/admin/dashboard" },
    { id: "drugs", label: "Drugs", icon: <Pill className="w-5 h-5" />, path: "/admin/drugs" },
    { id: "inventory", label: "Inventory", icon: <Boxes className="w-5 h-5" />, path: "/admin/inventory" },
    { id: "suppliers", label: "Suppliers", icon: <Users className="w-5 h-5" />, path: "/admin/suppliers" },
    { id: "shipments", label: "Shipments", icon: <Truck className="w-5 h-5" />, path: "/admin/shipments" },
    { id: "orders", label: "Orders", icon: <FileText className="w-5 h-5" />, path: "/admin/orders" },
    { id: "alerts", label: "Alerts", icon: <AlertTriangle className="w-5 h-5" />, path: "/admin/alerts" },
  ];

  const faqs = [
    { question: "How do I reset my password?", answer: "Click on Profile → Settings → Reset Password." },
    { question: "How to contact support?", answer: "You can email support@medichain.com or call +91 98765 43210." },
    { question: "How to add new drugs to inventory?", answer: "Go to Inventory → Add New Drug and fill in details." },
  ];

  const getActivePage = () => {
    if (location.pathname.includes("drugs")) return "drugs";
    if (location.pathname.includes("inventory")) return "inventory";
    if (location.pathname.includes("suppliers")) return "suppliers";
    if (location.pathname.includes("shipments")) return "shipments";
    if (location.pathname.includes("orders")) return "orders";
    if (location.pathname.includes("alerts")) return "alerts";
    return "dashboard";
  };

  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden text-white fixed inset-0"
      style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a2642 100%)" }}
    >
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 90 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="relative z-20 bg-gradient-to-b from-[#0d1b2a]/95 to-[#1a2642]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between shadow-[0_0_25px_rgba(0,0,0,0.6)]"
      >
        {/* Logo */}
        <div className="p-3 border-b border-white/10 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#5b7cff]/50 to-transparent" />
          <div className="w-full flex justify-center mb-1">
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              src={logo}
              alt="MediChain Logo"
              className="w-36 h-auto object-contain drop-shadow-[0_0_30px_#5b7cff]"
            />
          </div>
          <p className="text-[10px] font-medium text-white/60 tracking-wider uppercase">
            Admin Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {menuItems.map((item, index) => {
            const isActive = getActivePage() === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                  isActive
                    ? "bg-gradient-to-r from-[#5b7cff] to-[#7c3aed] text-white shadow-[0_0_15px_rgba(91,124,255,0.5)]"
                    : "text-white/70 hover:text-white hover:bg-[#1a4d5c]/40"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {item.icon}
                {sidebarOpen && (
                  <motion.span className="font-medium text-sm tracking-wide">
                    {item.label}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Support & Collapse */}
        <div className="px-4 pb-3 pt-3 border-t border-white/10 space-y-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowSupport(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1a4d5c] to-[#2d5a6e] py-2.5 rounded-xl text-white/90 hover:text-white hover:from-[#1a4d5c]/80 hover:to-[#2d5a6e]/80 shadow-[0_0_10px_rgba(26,77,92,0.6)] transition-all duration-300"
          >
            <HelpCircle className="w-4 h-4" />
            {sidebarOpen && <span className="text-xs font-semibold">Support & Help</span>}
          </motion.button>

          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-[#5b7cff] to-[#7c3aed] hover:from-[#6a83ff] hover:to-[#8b5eff] py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-white shadow-[0_0_10px_rgba(91,124,255,0.5)] transition-all duration-300"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Section */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="backdrop-blur-2xl bg-gradient-to-r from-[#0d1b2a]/90 to-[#1a2642]/90 border-b border-white/10 px-8 py-4 flex justify-between items-center shadow-[0_0_30px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-4 w-full">
            <motion.h2
              key={getActivePage()}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold tracking-wide text-white drop-shadow-[0_0_10px_#5b7cff]"
            >
              {menuItems.find((item) => item.id === getActivePage())?.label}
            </motion.h2>

            {/* Search Bar */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search here..."
              className="ml-6 flex-1 bg-[#1a4d5c]/40 placeholder-white/50 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b7cff] transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-[#1a4d5c]/40 rounded-xl hover:bg-[#1a4d5c]/60 shadow-[0_0_10px_rgba(91,124,255,0.3)] transition-all duration-300"
            >
              <Settings className="w-5 h-5 text-white/80" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-[#1a4d5c]/40 rounded-xl hover:bg-[#1a4d5c]/60 shadow-[0_0_10px_rgba(91,124,255,0.3)] relative transition-all duration-300"
            >
              <Bell className="w-5 h-5 text-white/80" />
            </motion.button>

            {/* A Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(!showProfile)}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#5b7cff] to-[#7c3aed] flex items-center justify-center text-white font-bold text-lg shadow-[0_0_10px_rgba(91,124,255,0.5)]"
            >
              A
            </motion.button>
          </div>
        </header>

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 overflow-auto p-8 bg-[rgba(13,27,42,0.4)] backdrop-blur-xl"
        >
          <Outlet context={{ searchQuery }} />
        </motion.main>
      </div>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupport && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSupport(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 120 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#1a2642]/95 to-[#0d1b2a]/95 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(91,124,255,0.3)] w-[450px] max-h-[80vh] overflow-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-[#5b7cff]" />
                  Support & Help
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSupport(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </motion.button>
              </div>

              <p className="text-sm text-white/70 mb-6 leading-relaxed">
                Need assistance? Our support team is here to help you 24/7.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#5b7cff] to-[#7c3aed] rounded-lg flex items-center justify-center">
                    📧
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Email</p>
                    <p className="text-sm text-[#5b7cff] font-medium">
                      support@medichain.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#5b7cff] to-[#7c3aed] rounded-lg flex items-center justify-center">
                    📞
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Phone</p>
                    <p className="text-sm text-[#5b7cff] font-medium">
                      +91 98765 43210
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-2 mb-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl border border-white/10"
                  >
                    <button
                      className="w-full text-left px-4 py-2 flex justify-between items-center text-white/80 hover:text-white"
                      onClick={() =>
                        setOpenFaqIndex(openFaqIndex === index ? null : index)
                      }
                    >
                      {faq.question}
                      <span>{openFaqIndex === index ? "-" : "+"}</span>
                    </button>
                    {openFaqIndex === index && (
                      <div className="px-4 py-2 text-white/60 text-sm border-t border-white/10">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSupport(false)}
                className="w-full px-5 py-3 bg-gradient-to-r from-[#5b7cff] to-[#7c3aed] rounded-xl text-sm font-semibold shadow-[0_0_15px_rgba(91,124,255,0.4)] hover:shadow-[0_0_25px_rgba(91,124,255,0.6)] transition-all duration-300"
              >
                Got it, thanks!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
 }