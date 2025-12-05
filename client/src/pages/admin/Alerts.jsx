// import { useEffect, useState } from "react";
// import { useApi } from "../../hooks/useApi";

// export default function Alerts() {
//   const { request } = useApi();
//   const [alerts, setAlerts] = useState({
//     expiryAlerts: [],
//     lowStockAlerts: [],
//   });
//   const [filter, setFilter] = useState("all");

//   useEffect(() => {
//     fetchAlerts();
//     const interval = setInterval(fetchAlerts, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchAlerts = async () => {
//     try {
//       const res = await request("GET", "/api/admin/dashboard/alerts");
//       setAlerts(res.data);
//     } catch (err) {
//       console.error("Error fetching alerts:", err);
//     }
//   };

//   const getFilteredAlerts = () => {
//     if (filter === "expiry") return { expiryAlerts: alerts.expiryAlerts, lowStockAlerts: [] };
//     if (filter === "lowStock") return { expiryAlerts: [], lowStockAlerts: alerts.lowStockAlerts };
//     return alerts;
//   };

//   const filteredAlerts = getFilteredAlerts();
//   const totalAlerts = alerts.expiryAlerts.length + alerts.lowStockAlerts.length;

//   return (
//     <div className="space-y-6">
//       {/* Header Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-6 shadow-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm opacity-90">Expiring Soon</p>
//               <p className="text-4xl font-bold mt-2">{alerts.expiryAlerts.length}</p>
//             </div>
//             <span className="text-5xl opacity-50">⏰</span>
//           </div>
//         </div>
//         <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm opacity-90">Low Stock</p>
//               <p className="text-4xl font-bold mt-2">{alerts.lowStockAlerts.length}</p>
//             </div>
//             <span className="text-5xl opacity-50">📉</span>
//           </div>
//         </div>
//         <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm opacity-90">Total Alerts</p>
//               <p className="text-4xl font-bold mt-2">{totalAlerts}</p>
//             </div>
//             <span className="text-5xl opacity-50">🔔</span>
//           </div>
//         </div>
//       </div>

//       {/* Filter Buttons */}
//       <div className="flex gap-3">
//         <button
//           onClick={() => setFilter("all")}
//           className={`px-6 py-2 rounded-lg font-medium transition ${
//             filter === "all"
//               ? "bg-blue-600 text-white"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//         >
//           All Alerts
//         </button>
//         <button
//           onClick={() => setFilter("expiry")}
//           className={`px-6 py-2 rounded-lg font-medium transition ${
//             filter === "expiry"
//               ? "bg-red-600 text-white"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//         >
//           Expiry Alerts
//         </button>
//         <button
//           onClick={() => setFilter("lowStock")}
//           className={`px-6 py-2 rounded-lg font-medium transition ${
//             filter === "lowStock"
//               ? "bg-orange-600 text-white"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//         >
//           Low Stock Alerts
//         </button>
//       </div>

//       {/* Alerts List */}
//       <div className="space-y-6">
//         {/* Expiry Alerts */}
//         {filteredAlerts.expiryAlerts.length > 0 && (
//           <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
//             <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
//               <h3 className="text-lg font-bold text-white flex items-center gap-2">
//                 ⏰ Drugs Expiring Soon ({filteredAlerts.expiryAlerts.length})
//               </h3>
//             </div>
//             <div className="p-6">
//               <div className="space-y-4">
//                 {filteredAlerts.expiryAlerts.map((drug, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-red-500 rounded-md hover:shadow-md transition"
//                   >
//                     <div className="flex-1">
//                       <p className="font-semibold text-red-900 text-lg">{drug.name}</p>
//                       <div className="mt-2 space-y-1">
//                         <p className="text-sm text-red-700">
//                           <span className="font-medium">Batch:</span>{" "}
//                           <span className="font-mono">{drug.batchNo}</span>
//                         </p>
//                         <p className="text-sm text-red-700">
//                           <span className="font-medium">Expiry Date:</span>{" "}
//                           {new Date(drug.expiryDate).toLocaleDateString()}
//                         </p>
//                         <p className="text-sm text-red-700">
//                           <span className="font-medium">Days Remaining:</span>{" "}
//                           {Math.ceil(
//                             (new Date(drug.expiryDate) - new Date()) /
//                               (1000 * 60 * 60 * 24)
//                           )}{" "}
//                           days
//                         </p>
//                       </div>
//                     </div>
//                     <div className="ml-4">
//                       <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium">
//                         Urgent
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Low Stock Alerts */}
//         {filteredAlerts.lowStockAlerts.length > 0 && (
//           <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
//             <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
//               <h3 className="text-lg font-bold text-white flex items-center gap-2">
//                 📉 Low Stock Items ({filteredAlerts.lowStockAlerts.length})
//               </h3>
//             </div>
//             <div className="p-6">
//               <div className="space-y-4">
//                 {filteredAlerts.lowStockAlerts.map((item, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-4 bg-orange-50 border-l-4 border-orange-500 rounded-md hover:shadow-md transition"
//                   >
//                     <div className="flex-1">
//                       <p className="font-semibold text-orange-900 text-lg">
//                         {item.drugId?.name || "Unknown Drug"}
//                       </p>
//                       <div className="mt-2 space-y-1">
//                         <p className="text-sm text-orange-700">
//                           <span className="font-medium">Current Stock:</span>{" "}
//                           <span className="font-bold text-lg">{item.quantity}</span> units
//                         </p>
//                         <p className="text-sm text-orange-700">
//                           <span className="font-medium">Threshold:</span>{" "}
//                           <span className="font-bold">{item.threshold}</span> units
//                         </p>
//                         <p className="text-sm text-orange-700">
//                           <span className="font-medium">Location:</span>{" "}
//                           {item.warehouseLocation || "N/A"}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="ml-4">
//                       <span className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium">
//                         Reorder
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* No Alerts */}
//         {filteredAlerts.expiryAlerts.length === 0 &&
//           filteredAlerts.lowStockAlerts.length === 0 && (
//             <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
//               <div className="text-6xl mb-4">✅</div>
//               <h3 className="text-2xl font-bold text-gray-800 mb-2">
//                 No Alerts
//               </h3>
//               <p className="text-gray-600">
//                 {filter === "all"
//                   ? "All inventory levels are good and no drugs are expiring soon."
//                   : filter === "expiry"
//                   ? "No drugs are expiring soon."
//                   : "All inventory levels are above threshold."}
//               </p>
//             </div>
//           )}
//       </div>
//     </div>
//   );
// }



// tiyasa's section

// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useApi } from "../../hooks/useApi";
// import { 
//   AlertTriangle, 
//   BellRing, 
//   Clock, 
//   PackageX, 
//   RefreshCcw,
//   Filter,
//   TrendingUp,
//   TrendingDown,
//   Info,
//   FileDown,
//   Shield,
//   Zap
// } from "lucide-react";

// export default function Alerts() {
//   const { request } = useApi();
//   const [alerts, setAlerts] = useState({ expiryAlerts: [], lowStockAlerts: [] });
//   const [filter, setFilter] = useState("all");
//   const [showFilter, setShowFilter] = useState(false);
//   const [animatedStats, setAnimatedStats] = useState({ expiry: 0, stock: 0, total: 0 });

//   useEffect(() => {
//     fetchAlerts();
//     const interval = setInterval(fetchAlerts, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchAlerts = async () => {
//     try {
//       const res = await request("GET", "/api/admin/dashboard/alerts");
//       setAlerts(res.data);
//     } catch (err) {
//       console.error("Error fetching alerts:", err);
//     }
//   };

//   const getFilteredAlerts = () => {
//     if (filter === "expiry") return { expiryAlerts: alerts.expiryAlerts, lowStockAlerts: [] };
//     if (filter === "lowStock") return { expiryAlerts: [], lowStockAlerts: alerts.lowStockAlerts };
//     return alerts;
//   };

//   const filteredAlerts = getFilteredAlerts();
//   const totalAlerts = alerts.expiryAlerts.length + alerts.lowStockAlerts.length;

//   // Animate stats on load
//   useEffect(() => {
//     const duration = 1500;
//     const start = performance.now();
//     const step = (time) => {
//       const progress = Math.min((time - start) / duration, 1);
//       setAnimatedStats({
//         expiry: Math.floor(progress * alerts.expiryAlerts.length),
//         stock: Math.floor(progress * alerts.lowStockAlerts.length),
//         total: Math.floor(progress * totalAlerts),
//       });
//       if (progress < 1) requestAnimationFrame(step);
//     };
//     requestAnimationFrame(step);
//   }, [alerts.expiryAlerts.length, alerts.lowStockAlerts.length, totalAlerts]);

//   // Export CSV
//   const exportCSV = () => {
//     const csvRows = [
//       ["Type", "Drug", "Details", "Status", "Days/Quantity"],
//     ];
    
//     filteredAlerts.expiryAlerts.forEach((drug) => {
//       const days = Math.ceil((new Date(drug.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
//       csvRows.push([
//         "Expiry Alert",
//         `"${(drug.name || "").replace(/"/g, '""')}"`,
//         `Batch: ${drug.batchNo}`,
//         "Expiring Soon",
//         `${days} days`
//       ]);
//     });

//     filteredAlerts.lowStockAlerts.forEach((item) => {
//       csvRows.push([
//         "Low Stock Alert",
//         `"${(item.drugId?.name || "Unknown").replace(/"/g, '""')}"`,
//         `Location: ${item.warehouseLocation || "N/A"}`,
//         "Reorder Needed",
//         `${item.quantity} units`
//       ]);
//     });

//     const csv = csvRows.map((r) => r.join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "alerts.csv";
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   // Inject animation styles
//   useEffect(() => {
//     const id = "alerts-enhance-styles";
//     if (document.getElementById(id)) return;
//     const style = document.createElement("style");
//     style.id = id;
//     style.innerHTML = `
//       @keyframes pulse-slow { 0%,100%{ transform: scale(1); opacity:1 } 50%{ transform: scale(1.02); opacity:0.95 }}
//       .animate-pulse-slow { animation: pulse-slow 12s ease-in-out infinite; }
//       @keyframes ping-slow { 0%,100%{ transform: scale(1); opacity:1 } 50%{ transform: scale(1.8); opacity:0.35 }}
//       .animate-ping-slow { animation: ping-slow 2s infinite; }
//       .glow-strong { box-shadow: 0 8px 30px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.02);} 
//       .sparkline { opacity:0.95 }
//     `;
//     document.head.appendChild(style);
//     return () => style.remove();
//   }, []);

//   return (
//     <motion.div
//       className="p-8 text-white min-h-screen relative overflow-hidden bg-gradient-to-b from-[#030617] via-[#0a1128] to-[#02040a]"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//     >
//       {/* Ambient moving blobs */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <motion.div className="absolute -left-32 top-10 w-96 h-96 rounded-full blur-3xl bg-red-600/20 animate-pulse-slow" />
//         <motion.div className="absolute right-10 top-40 w-80 h-80 rounded-full blur-3xl bg-orange-400/18 animate-pulse-slow" />
//       </div>

//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-4 relative">
//         <div>
//           <motion.h1
//             className="text-5xl font-extrabold bg-gradient-to-r from-red-300 via-orange-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]"
//             initial={{ y: -10 }}
//             animate={{ y: 0 }}
//           >
//             🚨 Alerts & Notifications
//           </motion.h1>

//           <div className="mt-2 text-sm text-gray-300 flex items-center gap-4">
//             <span className="flex items-center gap-2">
//               <Info size={14} />
//               <span className="opacity-80">Real-time monitoring • Proactive alerts •</span>
//             </span>
//             <span className="opacity-80">Stay ahead of inventory issues before they impact operations</span>
//           </div>
//         </div>

//         <div className="flex gap-4 items-center">
//           <motion.button
//             onClick={fetchAlerts}
//             whileTap={{ scale: 0.95 }}
//             className="px-4 py-2 bg-gray-900/60 border border-gray-700/60 rounded-xl flex items-center gap-2 hover:shadow-lg"
//           >
//             <RefreshCcw size={18} /> Refresh
//           </motion.button>

//           <motion.button
//             onClick={() => setShowFilter(!showFilter)}
//             whileTap={{ scale: 0.95 }}
//             className="px-4 py-2 bg-gray-900/60 border border-gray-700/60 rounded-xl flex items-center gap-2 hover:shadow-lg"
//           >
//             <Filter size={18} /> {filter !== "all" ? (filter === "expiry" ? "Expiry" : "Low Stock") : "Filter"}
//           </motion.button>

//           <AnimatePresence>
//             {showFilter && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className="absolute right-0 top-16 mt-2 w-44 bg-gray-900/90 border border-gray-700 rounded-xl shadow-lg z-20"
//               >
//                 {[
//                   { key: 'all', label: 'All Alerts' },
//                   { key: 'expiry', label: 'Expiry Alerts' },
//                   { key: 'lowStock', label: 'Low Stock' }
//                 ].map((option) => (
//                   <button
//                     key={option.key}
//                     onClick={() => {
//                       setFilter(option.key);
//                       setShowFilter(false);
//                     }}
//                     className={`w-full text-left px-4 py-2 rounded-lg ${filter === option.key ? 'bg-red-800 text-red-200' : 'hover:bg-gray-800 text-gray-300'}`}
//                   >
//                     {option.label}
//                   </button>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <motion.button
//             onClick={exportCSV}
//             whileTap={{ scale: 0.95 }}
//             className="px-4 py-2 bg-gray-900/60 border border-gray-700/60 rounded-xl flex items-center gap-2 hover:shadow-lg"
//           >
//             <FileDown size={18} /> Export
//           </motion.button>
//         </div>
//       </div>

//       {/* BUSINESS KPI BAR */}
//       <div className="flex flex-wrap gap-6 mb-6 text-sm text-gray-300 items-center">
//         <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gray-900/50 border border-gray-700/50 shadow-sm">
//           <div className="text-xs">⚡ Alert Response Time</div>
//           <div className="ml-2 font-semibold text-green-300">&lt; 5 min</div>
//         </div>

//         <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gray-900/50 border border-gray-700/50 shadow-sm">
//           <div className="text-xs">🎯 Resolution Rate</div>
//           <div className="ml-2 font-semibold text-blue-300">{Math.floor(Math.random() * 10 + 85)}%</div>
//         </div>

//         <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gray-900/50 border border-gray-700/50 shadow-sm">
//           <div className="text-xs">🛡️ System Health</div>
//           <div className="ml-2 font-semibold text-emerald-300">Optimal</div>
//         </div>

//         <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
//           <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400 animate-ping-slow"></span> Live</div>
//           <div className="flex items-center gap-2">Updated: {new Date().toLocaleString()}</div>
//         </div>
//       </div>

//       {/* HEADER STATS - 3 CARDS (keeping your original design but enhanced) */}
//       <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         {[
//           {
//             title: "Expiring Soon",
//             count: animatedStats.expiry,
//             icon: <Clock className="w-10 h-10 text-red-300 animate-pulse" />,
//             gradient: "from-red-600/80 to-red-900/80",
//             border: "border-red-500/30",
//             trend: { up: false, pct: 12 }
//           },
//           {
//             title: "Low Stock",
//             count: animatedStats.stock,
//             icon: <PackageX className="w-10 h-10 text-yellow-200 animate-pulse" />,
//             gradient: "from-orange-500/80 to-yellow-700/80",
//             border: "border-orange-400/30",
//             trend: { up: false, pct: 8 }
//           },
//           {
//             title: "Total Alerts",
//             count: animatedStats.total,
//             icon: <BellRing className="w-10 h-10 text-indigo-200 animate-pulse" />,
//             gradient: "from-violet-600/80 to-indigo-800/80",
//             border: "border-violet-500/30",
//             trend: { up: true, pct: 5 }
//           },
//         ].map((card, i) => (
//           <motion.div
//             key={i}
//             whileHover={{ scale: 1.05 }}
//             className={`relative overflow-hidden rounded-2xl p-6 shadow-lg bg-gradient-to-br ${card.gradient} backdrop-blur-2xl border ${card.border} transition-transform duration-300`}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm opacity-80">{card.title}</p>
//                 <div className="flex items-center gap-3 mt-2">
//                   <p className="text-4xl font-extrabold tracking-tight">{card.count}</p>
//                   <div className={`flex items-center gap-1 text-xs font-semibold ${card.trend.up ? 'text-green-300' : 'text-red-300'}`}>
//                     {card.trend.up ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
//                     <span>{card.trend.up ? `+${card.trend.pct}%` : `-${card.trend.pct}%`}</span>
//                   </div>
//                 </div>
//               </div>
//               {card.icon}
//             </div>
//             <motion.div
//               className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent"
//               animate={{ x: ["0%", "100%"] }}
//               transition={{ repeat: Infinity, duration: 2 }}
//             />
//           </motion.div>
//         ))}
//       </div>

//       {/* Filter Buttons (keeping your original but enhanced) */}
//       <div className="relative z-10 flex flex-wrap gap-4 justify-center mb-8">
//         {[
//           { key: "all", label: "All Alerts", color: "blue" },
//           { key: "expiry", label: "Expiry Alerts", color: "red" },
//           { key: "lowStock", label: "Low Stock Alerts", color: "orange" },
//         ].map(({ key, label, color }) => (
//           <motion.button
//             key={key}
//             onClick={() => setFilter(key)}
//             whileTap={{ scale: 0.95 }}
//             className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg border text-sm uppercase tracking-wide ${
//               filter === key
//                 ? `${color === 'blue' ? 'bg-indigo-600 border-indigo-400' : color === 'red' ? 'bg-red-600 border-red-400' : 'bg-orange-600 border-orange-400'} text-white shadow-lg`
//                 : "bg-white/10 text-gray-300 hover:bg-white/20 border-gray-700"
//             }`}
//           >
//             {label}
//           </motion.button>
//         ))}
//       </div>

//       {/* ALERTS SECTIONS */}
//       <AnimatePresence>
//         {filteredAlerts.expiryAlerts.length > 0 && (
//           <AlertSection
//             title="🕐 Drugs Expiring Soon"
//             color="red"
//             icon={Clock}
//             alerts={filteredAlerts.expiryAlerts.map((drug) => ({
//               id: drug.batchNo,
//               name: drug.name,
//               subtitle: `Batch: ${drug.batchNo}`,
//               detail1: `Expiry Date: ${new Date(drug.expiryDate).toLocaleDateString()}`,
//               detail2: `Days Remaining: ${Math.ceil((new Date(drug.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days`,
//               tag: "Urgent",
//               priority: "high"
//             }))}
//           />
//         )}

//         {filteredAlerts.lowStockAlerts.length > 0 && (
//           <AlertSection
//             title="📦 Low Stock Items"
//             color="orange"
//             icon={AlertTriangle}
//             alerts={filteredAlerts.lowStockAlerts.map((item, i) => ({
//               id: item.drugId?._id || i,
//               name: item.drugId?.name || "Unknown Drug",
//               subtitle: `Stock: ${item.quantity} units`,
//               detail1: `Threshold: ${item.threshold} units`,
//               detail2: `Location: ${item.warehouseLocation || "N/A"}`,
//               tag: "Reorder",
//               priority: "medium"
//             }))}
//           />
//         )}

//         {filteredAlerts.expiryAlerts.length === 0 && filteredAlerts.lowStockAlerts.length === 0 && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/60 rounded-2xl shadow-lg p-16 text-center backdrop-blur-xl"
//           >
//             <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl blur-2xl" />
//             <div className="relative">
//               <motion.div
//                 className="text-6xl mb-4"
//                 animate={{ scale: [1, 1.1, 1] }}
//                 transition={{ repeat: Infinity, duration: 2 }}
//               >
//                 ✅
//               </motion.div>
//               <h3 className="text-3xl font-extrabold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent mb-3">
//                 All Clear!
//               </h3>
//               <p className="text-gray-400 text-lg">
//                 {filter === "all"
//                   ? "All inventory levels are stable."
//                   : filter === "expiry"
//                   ? "No drugs are nearing expiry."
//                   : "All items are above reorder threshold."}
//               </p>
//               <div className="mt-6 flex items-center justify-center gap-3">
//                 <Shield className="text-green-400" size={20} />
//                 <span className="text-sm text-gray-400">System monitored • Auto-refresh enabled</span>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="mt-10 text-center text-xs text-gray-500">© 2025 MedTrack Analytics • Designed with 💙 for smarter pharma management</div>
//     </motion.div>
//   );
// }

// /* ---------------------------- ALERT SECTION ---------------------------- */
// const AlertSection = ({ title, color, icon: Icon, alerts }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 30 }}
//     animate={{ opacity: 1, y: 0 }}
//     exit={{ opacity: 0, y: -30 }}
//     transition={{ duration: 0.4 }}
//     className={`relative z-10 rounded-2xl overflow-hidden border ${
//       color === 'red' ? 'border-red-500/30' : 'border-orange-500/30'
//     } shadow-lg bg-white/5 backdrop-blur-2xl mb-8`}
//   >
//     <div className={`bg-gradient-to-r ${
//       color === 'red' ? 'from-red-600 to-red-800' : 'from-orange-600 to-orange-800'
//     } px-6 py-4 flex items-center gap-3`}>
//       <Icon className="text-white" />
//       <h3 className="text-xl font-bold tracking-wide">{title}</h3>
//       <motion.div
//         className="ml-auto w-2 h-2 bg-white rounded-full"
//         animate={{ opacity: [0, 1, 0] }}
//         transition={{ repeat: Infinity, duration: 2 }}
//       />
//     </div>

//     <div className="p-6 space-y-4">
//       <AnimatePresence>
//         {alerts.map((a, i) => (
//           <motion.div
//             key={i}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ delay: i * 0.05 }}
//             whileHover={{ scale: 1.02 }}
//             className={`flex items-center justify-between p-5 bg-gradient-to-r ${
//               color === 'red' 
//                 ? 'from-red-900/40 to-red-700/40 border-red-500/30' 
//                 : 'from-orange-900/40 to-orange-700/40 border-orange-500/30'
//             } border rounded-xl hover:shadow-[0_0_15px_var(--tw-shadow-color)] transition`}
//             style={{ "--tw-shadow-color": color === 'red' ? 'rgba(239,68,68,0.5)' : 'rgba(249,115,22,0.5)' }}
//           >
//             <div className="flex-1">
//               <div className="flex items-center gap-2 mb-2">
//                 <p className={`font-semibold text-lg ${
//                   color === 'red' ? 'text-red-100' : 'text-orange-100'
//                 }`}>{a.name}</p>
//                 {a.priority === 'high' && <Zap className="text-yellow-300" size={16} />}
//               </div>
//               <div className={`mt-2 text-sm space-y-1 ${
//                 color === 'red' ? 'text-red-200' : 'text-orange-200'
//               }`}>
//                 <p>{a.subtitle}</p>
//                 <p>{a.detail1}</p>
//                 <p>{a.detail2}</p>
//               </div>
//             </div>
//             <span className={`px-4 py-2 ${
//               color === 'red' ? 'bg-red-600' : 'bg-orange-600'
//             } text-white rounded-lg font-medium shadow-md`}>
//               {a.tag}
//             </span>
//           </motion.div>
//         ))}
//       </AnimatePresence>
//     </div>
//   </motion.div>
// );






import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../../hooks/useApi";
import {
  Clock,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  Bell,
  Activity,
  BarChart3,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";

export default function Alerts() {
  const { request } = useApi();
  const [alerts, setAlerts] = useState({ expiryAlerts: [], lowStockAlerts: [] });
  const [filter, setFilter] = useState("all");
  const [openSections, setOpenSections] = useState({ expiry: true, lowStock: true });
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showNotification, setShowNotification] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [showCalendar, setShowCalendar] = useState(true);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  // Fetch alerts
  const fetchAlerts = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const res = await request("GET", "/api/admin/dashboard/alerts");
      const alertData = res.data || { expiryAlerts: [], lowStockAlerts: [] };
      console.log("Fetched alerts:", alertData); // Debug log
      setAlerts(alertData);
      setLastUpdate(new Date());
      if (showRefresh) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      if (showRefresh) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced 3D mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 25;
      const y = (e.clientY / window.innerHeight - 0.5) * 25;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Enhanced styles with more animations
  useEffect(() => {
    const id = "alerts-enhance-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @keyframes pulse-slow { 0%,100%{ transform: scale(1); opacity:1 } 50%{ transform: scale(1.02); opacity:0.95 }}
      .animate-pulse-slow { animation: pulse-slow 12s ease-in-out infinite; }
      @keyframes ping-slow { 0%,100%{ transform: scale(1); opacity:1 } 50%{ transform: scale(1.6); opacity:0.35 }}
      .animate-ping-slow { animation: ping-slow 2s infinite; }
      @keyframes float { 0%,100%{ transform: translateY(0px) rotate(0deg) } 50%{ transform: translateY(-15px) rotate(2deg) }}
      .animate-float { animation: float 6s ease-in-out infinite; }
      @keyframes shimmer { 0%{ background-position: -1000px 0 } 100%{ background-position: 1000px 0 }}
      .shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent); background-size: 1000px 100%; animation: shimmer 3s infinite; }
      @keyframes glow-pulse { 0%,100%{ box-shadow: 0 0 20px rgba(99,102,241,0.3), 0 0 40px rgba(79,209,197,0.2) } 50%{ box-shadow: 0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(79,209,197,0.4) }}
      .glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; }}
      .slide-in { animation: slideIn 0.5s ease-out; }
      @keyframes ripple { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(4); opacity: 0; }}
      .ripple { animation: ripple 0.6s ease-out; }
      @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); }}
      .scanline::before { content: ''; position: absolute; inset: 0; background: linear-gradient(transparent, rgba(99,102,241,0.1), transparent); animation: scanline 3s linear infinite; pointer-events: none; }
      @keyframes gradient-shift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; }}
      .gradient-shift { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
      .glow-strong { box-shadow: 0 8px 30px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.02);} 
      .tilt-3d { transform-style: preserve-3d; perspective: 1000px; }
      .card-3d { transform-style: preserve-3d; transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
      .card-3d:hover { transform: rotateX(5deg) rotateY(5deg) translateZ(20px) scale(1.02); }
      .glass-morph { background: rgba(255,255,255,0.03); backdrop-filter: blur(12px) saturate(150%); border: 1px solid rgba(255,255,255,0.08); }
      .neon-border { border: 1px solid rgba(99,102,241,0.4); box-shadow: 0 0 10px rgba(99,102,241,0.3), inset 0 0 10px rgba(99,102,241,0.1); }
      @keyframes particle-float { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.7; } 50% { transform: translate(10px, -10px) scale(1.1); opacity: 1; }}
      .particle { animation: particle-float 4s ease-in-out infinite; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const toggleSection = (k) => setOpenSections((p) => ({ ...p, [k]: !p[k] }));

  const expiryCount = alerts.expiryAlerts?.length || 0;
  const lowStockCount = alerts.lowStockAlerts?.length || 0;
  const totalAlerts = expiryCount + lowStockCount;
  const criticalCount = alerts.expiryAlerts?.filter(a => {
    const days = daysRemaining(a.expiryDate);
    return days !== null && days > 0 && days < 7;
  }).length || 0;

  const filteredExpiry = (alerts.expiryAlerts || [])
    .filter((a) => {
      if (!search || search.trim() === "") return true;
      
      // Get all possible fields to search
      const searchableText = [
        a.name,
        a.drugName,
        a.batchNo,
        a.batch,
        a.warehouseLocation,
        a.location
      ]
        .filter(Boolean) // Remove null/undefined
        .map(field => String(field).toLowerCase())
        .join(" ");
      
      const searchLower = search.toLowerCase().trim();
      console.log("Searching expiry:", searchLower, "in", searchableText); // Debug
      return searchableText.includes(searchLower);
    });
    
  const filteredLowStock = (alerts.lowStockAlerts || [])
    .filter((a) => {
      if (!search || search.trim() === "") return true;
      
      // Get all possible fields to search
      const searchableText = [
        a.drugId?.name,
        a.name,
        a.drugName,
        a.batchNo,
        a.batch,
        a.warehouseLocation,
        a.location
      ]
        .filter(Boolean) // Remove null/undefined
        .map(field => String(field).toLowerCase())
        .join(" ");
      
      const searchLower = search.toLowerCase().trim();
      console.log("Searching lowStock:", searchLower, "in", searchableText); // Debug
      return searchableText.includes(searchLower);
    });
    
  console.log("Filter results - Expiry:", filteredExpiry.length, "LowStock:", filteredLowStock.length); // Debug

  const showExpiry = filter === "all" || filter === "expiry";
  const showLow = filter === "all" || filter === "lowStock";

  const daysRemaining = (expiryDate) => {
    try {
      const diff = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
      return Math.ceil(diff);
    } catch {
      return null;
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatCalendarDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getAlertDatesForMonth = () => {
    const expiryDates = {};
    const lowStockDates = {};

    // Collect expiry dates
    alerts.expiryAlerts?.forEach(alert => {
      if (alert.expiryDate) {
        const dateStr = alert.expiryDate.split('T')[0];
        const days = daysRemaining(alert.expiryDate);
        const isCritical = days !== null && days > 0 && days < 7;
        if (!expiryDates[dateStr]) {
          expiryDates[dateStr] = { count: 0, critical: false, items: [] };
        }
        expiryDates[dateStr].count++;
        expiryDates[dateStr].items.push(alert.name);
        if (isCritical) expiryDates[dateStr].critical = true;
      }
    });

    // For low stock, we'll mark today's date
    if (alerts.lowStockAlerts?.length > 0) {
      const today = formatCalendarDate(new Date());
      lowStockDates[today] = {
        count: alerts.lowStockAlerts.length,
        items: alerts.lowStockAlerts.map(a => a.drugId?.name || a.name || 'Unknown')
      };
    }

    return { expiryDates, lowStockDates };
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentCalendarMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentCalendarMonth(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentCalendarMonth);
    const firstDay = getFirstDayOfMonth(currentCalendarMonth);
    const { expiryDates, lowStockDates } = getAlertDatesForMonth();
    const today = formatCalendarDate(new Date());
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatCalendarDate(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), day));
      const hasExpiry = expiryDates[dateStr];
      const hasLowStock = lowStockDates[dateStr];
      const isToday = dateStr === today;
      
      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: (hasExpiry || hasLowStock) ? 1.1 : 1.05, z: 10 }}
          className={`relative h-16 p-2 rounded-lg border transition-all cursor-pointer group ${
            isToday ? 'border-cyan-400 bg-cyan-900/30' :
            hasExpiry?.critical ? 'border-red-500/50 bg-red-900/20' :
            hasExpiry ? 'border-orange-500/50 bg-orange-900/20' :
            hasLowStock ? 'border-violet-500/50 bg-violet-900/20' :
            'border-gray-700/30 bg-gray-900/20'
          }`}
        >
          <div className={`text-sm font-semibold ${
            isToday ? 'text-cyan-300' :
            hasExpiry?.critical ? 'text-red-300' :
            hasExpiry ? 'text-orange-300' :
            hasLowStock ? 'text-violet-300' :
            'text-gray-400'
          }`}>
            {day}
          </div>
          
          {/* Indicators */}
          <div className="absolute bottom-1 right-1 flex gap-1">
            {hasExpiry && (
              <motion.div
                animate={{ scale: hasExpiry.critical ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`w-2 h-2 rounded-full ${hasExpiry.critical ? 'bg-red-500' : 'bg-orange-500'}`}
                title={`${hasExpiry.count} expiring`}
              />
            )}
            {hasLowStock && (
              <div
                className="w-2 h-2 rounded-full bg-violet-500"
                title={`${hasLowStock.count} low stock`}
              />
            )}
          </div>

          {/* Tooltip on hover */}
          {(hasExpiry || hasLowStock) && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs whitespace-nowrap shadow-xl">
                {hasExpiry && (
                  <div className="mb-2">
                    <div className={`font-bold ${hasExpiry.critical ? 'text-red-400' : 'text-orange-400'} mb-1`}>
                      🚨 {hasExpiry.count} Expiring
                    </div>
                    {hasExpiry.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="text-gray-300">• {item}</div>
                    ))}
                    {hasExpiry.items.length > 3 && (
                      <div className="text-gray-500">+{hasExpiry.items.length - 3} more</div>
                    )}
                  </div>
                )}
                {hasLowStock && (
                  <div>
                    <div className="font-bold text-violet-400 mb-1">
                      📉 {hasLowStock.count} Low Stock
                    </div>
                    {hasLowStock.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="text-gray-300">• {item}</div>
                    ))}
                    {hasLowStock.items.length > 3 && (
                      <div className="text-gray-500">+{hasLowStock.items.length - 3} more</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      );
    }
    
    return days;
  };

  return (
    <motion.div
      className="min-h-screen p-8 text-white bg-gradient-to-b from-[#030617] via-[#0a1128] to-[#02040a] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Enhanced ambient background with particles */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Main gradient blobs */}
        <motion.div 
          className="absolute -left-32 top-10 w-96 h-96 rounded-full blur-3xl bg-indigo-600/20 animate-pulse-slow" 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 90, 0] }} 
          transition={{ repeat: Infinity, duration: 15 }}
          style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
        />
        <motion.div 
          className="absolute right-10 top-40 w-80 h-80 rounded-full blur-3xl bg-cyan-400/18 animate-pulse-slow" 
          animate={{ scale: [1, 1.03, 1], rotate: [0, -90, 0] }} 
          transition={{ repeat: Infinity, duration: 12 }}
          style={{ transform: `translate(${-mousePos.x * 0.3}px, ${-mousePos.y * 0.3}px)` }}
        />
        <motion.div 
          className="absolute left-1/2 bottom-20 w-72 h-72 rounded-full blur-3xl bg-violet-500/15" 
          animate={{ scale: [1, 1.04, 1], rotate: [0, 45, 0] }} 
          transition={{ repeat: Infinity, duration: 10 }}
          style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}
        />
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-400/30 particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Success notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed top-8 right-8 z-50 px-6 py-3 rounded-xl glass-morph neon-border flex items-center gap-3"
          >
            <Zap className="text-green-400" size={20} />
            <span className="text-green-300 font-medium">Alerts refreshed successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with enhanced elements */}
      <div className="flex justify-between items-center mb-6 relative">
        <div>
          <motion.h1
            className="text-5xl font-extrabold bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(99,102,241,0.8)] animate-float gradient-shift"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            🔔 Alert
          </motion.h1>

          <motion.div 
            className="mt-3 text-sm text-gray-300 flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="flex items-center gap-2 glass-morph px-3 py-1 rounded-full">
              <Activity size={14} className="text-green-400 animate-pulse" />
              <span className="text-green-300 font-semibold">Live Monitoring</span>
            </span>
            <span className="opacity-70">Real-time alerts • Predictive analytics • Smart notifications</span>
          </motion.div>
        </div>

        <div className="flex gap-3 items-center">
          {/* Refresh button */}
          <motion.button
            onClick={() => fetchAlerts(true)}
            disabled={isRefreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl glass-morph neon-border hover:bg-indigo-600/20 transition-colors relative overflow-hidden group"
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 0.5, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw size={20} className="text-cyan-300" />
            </motion.div>
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
          </motion.button>

          {/* Download report button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl glass-morph neon-border hover:bg-violet-600/20 transition-colors flex items-center gap-2 relative overflow-hidden group"
          >
            <Download size={18} className="text-violet-300" />
            <span className="text-sm font-medium text-violet-200">Export</span>
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
          </motion.button>
        </div>
      </div>

      {/* Enhanced KPI row with real-time indicators */}
      <div className="flex flex-wrap gap-4 mb-8">
        <motion.div 
          className="glass-morph px-4 py-2 rounded-xl flex items-center gap-3 neon-border"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute" />
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          </div>
          <span className="text-xs text-gray-400">Status:</span>
          <span className="text-sm font-semibold text-green-300">Active</span>
        </motion.div>

        <motion.div 
          className="glass-morph px-4 py-2 rounded-xl flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <Clock size={14} className="text-cyan-400" />
          <span className="text-xs text-gray-400">Last Update:</span>
          <span className="text-sm font-semibold text-cyan-300">
            {lastUpdate.toLocaleTimeString()}
          </span>
        </motion.div>

        <motion.div 
          className="glass-morph px-4 py-2 rounded-xl flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <BarChart3 size={14} className="text-violet-400" />
          <span className="text-xs text-gray-400">Priority:</span>
          <span className="text-sm font-semibold text-red-300">{criticalCount} Critical</span>
        </motion.div>

        <motion.div 
          className="ml-auto glass-morph px-4 py-2 rounded-xl flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <Bell size={14} className="text-indigo-400 animate-pulse" />
          <span className="text-sm font-medium text-indigo-200">
            {totalAlerts} Active Alerts
          </span>
        </motion.div>
      </div>

      {/* Enhanced stat cards with advanced 3D effects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            id: "expiry",
            label: "Expiring Soon",
            value: expiryCount,
            icon: <Clock />,
            gradient: "from-cyan-600/40 via-blue-600/40 to-indigo-700/40",
            accentColor: "cyan",
            trend: "+12%",
          },
          {
            id: "low",
            label: "Low Stock",
            value: lowStockCount,
            icon: <AlertTriangle />,
            gradient: "from-indigo-600/40 via-violet-600/40 to-purple-700/40",
            accentColor: "violet",
            trend: "+8%",
          },
          {
            id: "critical",
            label: "Critical",
            value: criticalCount,
            icon: <Zap />,
            gradient: "from-red-600/40 via-orange-600/40 to-yellow-700/40",
            accentColor: "red",
            trend: "+5%",
          },
          {
            id: "total",
            label: "Total Alerts",
            value: totalAlerts,
            icon: <Package />,
            gradient: "from-blue-600/40 via-cyan-600/40 to-teal-700/40",
            accentColor: "blue",
            trend: "+15%",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring" }}
            whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
            onHoverStart={() => setActiveCard(stat.id)}
            onHoverEnd={() => setActiveCard(null)}
            className={`relative overflow-hidden group p-6 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-2xl card-3d border border-white/5`}
            style={{ 
              transformStyle: 'preserve-3d',
              transform: `perspective(1000px) rotateX(${mousePos.y * 0.015}deg) rotateY(${mousePos.x * 0.015}deg)`
            }}
          >
            {/* Scanline effect */}
            <div className="scanline absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity shimmer" />
            
            {/* Glow orb */}
            <motion.div 
              className={`absolute -top-10 -right-10 w-40 h-40 bg-${stat.accentColor}-500/30 rounded-full blur-3xl`}
              animate={{ 
                scale: activeCard === stat.id ? [1, 1.2, 1] : 1,
                opacity: activeCard === stat.id ? [0.3, 0.6, 0.3] : 0.3 
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Status indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <motion.div 
                className={`w-2 h-2 bg-${stat.accentColor}-400 rounded-full`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className={`w-2 h-2 bg-${stat.accentColor}-400 rounded-full animate-ping`} />
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="text-base font-semibold text-white/90">{stat.label}</h3>
              <motion.div 
                className="text-3xl opacity-60"
                animate={{ 
                  rotate: activeCard === stat.id ? [0, 5, -5, 0] : 0,
                  scale: activeCard === stat.id ? [1, 1.1, 1] : 1
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {stat.icon}
              </motion.div>
            </div>

            <div className="relative z-10">
              <motion.div
                className="text-5xl font-bold text-white mb-2"
                animate={{ 
                  textShadow: activeCard === stat.id ? [
                    "0 0 20px rgba(125, 211, 252, 0.5)",
                    "0 0 40px rgba(125, 211, 252, 0.8)",
                    "0 0 20px rgba(125, 211, 252, 0.5)"
                  ] : "0 0 10px rgba(125, 211, 252, 0.3)"
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {stat.value}
              </motion.div>

              <motion.div 
                className="flex items-center gap-2 text-sm font-semibold text-green-300"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <motion.div
                  animate={{ y: [-1, 1, -1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <TrendingUp size={16} />
                </motion.div>
                <span>{stat.trend} vs last week</span>
              </motion.div>

              {/* Mini sparkline */}
              <svg className="mt-3 w-full h-8" viewBox="0 0 100 20" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`grad-${stat.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M0,15 Q10,12 20,13 T40,10 T60,8 T80,9 T100,6"
                  fill={`url(#grad-${stat.id})`}
                  stroke="#06b6d4"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 2, delay: i * 0.1 }}
                />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Calendar */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <motion.div
              className="rounded-2xl glass-morph border border-indigo-700/30 p-6 relative overflow-hidden"
              whileHover={{ borderColor: "rgba(99, 102, 241, 0.5)" }}
            >
              {/* Background decoration */}
              <motion.div
                className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity }}
              />

              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="text-3xl"
                  >
                    📅
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Alert Calendar</h3>
                    <p className="text-sm text-gray-400 mt-1">Visual timeline of expiring items & low stock</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCalendar(false)}
                  className="p-2 rounded-lg glass-morph border border-gray-700 hover:border-red-500/50 transition-colors text-gray-400 hover:text-red-400"
                >
                  <span className="text-xl">×</span>
                </motion.button>
              </div>

              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-6 relative z-10">
                <motion.button
                  whileHover={{ scale: 1.1, x: -3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-lg glass-morph border border-gray-700 hover:border-cyan-500/50 transition-colors"
                >
                  <ChevronDown className="rotate-90 text-cyan-300" size={20} />
                </motion.button>

                <motion.div
                  key={currentCalendarMonth.toISOString()}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-white">
                    {currentCalendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {new Date(2024, 10).getTime() <= currentCalendarMonth.getTime() && 
                     currentCalendarMonth.getTime() <= new Date(2026, 11).getTime() 
                      ? 'Viewing alert timeline' 
                      : 'Outside alert range'}
                  </div>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.1, x: 3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-lg glass-morph border border-gray-700 hover:border-cyan-500/50 transition-colors"
                >
                  <ChevronDown className="-rotate-90 text-cyan-300" size={20} />
                </motion.button>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 justify-center relative z-10">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-morph border border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span className="text-xs text-gray-300">Today</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-morph border border-gray-700">
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-xs text-gray-300">Critical Expiry</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-morph border border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-xs text-gray-300">Expiring Soon</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-morph border border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <span className="text-xs text-gray-300">Low Stock</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="relative z-10">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-500 uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                  {renderCalendar()}
                </div>
              </div>

              {/* Quick stats below calendar */}
              <motion.div 
                className="mt-6 grid grid-cols-3 gap-4 relative z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="glass-morph p-4 rounded-xl border border-red-700/30 text-center">
                  <div className="text-2xl font-bold text-red-300">{criticalCount}</div>
                  <div className="text-xs text-gray-400 mt-1">Critical (7 days)</div>
                </div>
                <div className="glass-morph p-4 rounded-xl border border-orange-700/30 text-center">
                  <div className="text-2xl font-bold text-orange-300">
                    {alerts.expiryAlerts?.filter(a => {
                      const days = daysRemaining(a.expiryDate);
                      return days !== null && days >= 7 && days < 30;
                    }).length || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Expiring (30 days)</div>
                </div>
                <div className="glass-morph p-4 rounded-xl border border-violet-700/30 text-center">
                  <div className="text-2xl font-bold text-violet-300">{lowStockCount}</div>
                  <div className="text-xs text-gray-400 mt-1">Low Stock Items</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle calendar button when hidden */}
      {!showCalendar && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCalendar(true)}
          className="mb-8 px-6 py-3 rounded-xl glass-morph neon-border hover:bg-indigo-600/20 transition-colors flex items-center gap-3 mx-auto"
        >
          <span className="text-2xl">📅</span>
          <span className="text-white font-medium">Show Alert Calendar</span>
        </motion.button>
      )}

      {/* Enhanced search and filters */}
      <motion.div 
        className="flex items-center gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="🔍 Search alerts by drug name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3 bg-gray-900/60 border border-gray-700/60 rounded-xl text-gray-200 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all glass-morph"
          />
          {search && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-xs text-cyan-400 font-medium">
                {filteredExpiry.length + filteredLowStock.length} results
              </span>
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ×
              </motion.button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {[
            { key: "all", label: "All", icon: <Package size={16} /> },
            { key: "expiry", label: "Expiry", icon: <Clock size={16} /> },
            { key: "lowStock", label: "Low Stock", icon: <AlertTriangle size={16} /> },
          ].map((btn) => (
            <motion.button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-3 rounded-xl font-medium border transition-all flex items-center gap-2 ${
                filter === btn.key
                  ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg neon-border"
                  : "glass-morph border-gray-700 text-gray-300 hover:border-cyan-500/50"
              }`}
            >
              {btn.icon}
              {btn.label}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-xl glass-morph border border-gray-700 hover:border-indigo-500/50 transition-colors"
        >
          <Filter size={20} className="text-indigo-300" />
        </motion.button>
      </motion.div>

      {/* Alert sections */}
      <div className="space-y-6">
        <AnimatePresence>
          {showExpiry && (
            <motion.div
              key="expirySection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-cyan-700/30 glass-morph overflow-hidden relative"
            >
              {/* Section header */}
              <motion.div
                onClick={() => toggleSection("expiry")}
                className="flex justify-between items-center cursor-pointer bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-indigo-900/30 px-6 py-5 relative overflow-hidden group"
                whileHover={{ backgroundColor: "rgba(6, 182, 212, 0.1)" }}
              >
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
                <div className="flex items-center gap-4 relative z-10">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Clock className="text-cyan-300" size={24} />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-cyan-100">Expiry Alerts</h3>
                    <p className="text-sm text-cyan-300/70 mt-0.5">{filteredExpiry.length} items requiring attention</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm font-medium">
                    {filteredExpiry.length}
                  </div>
                  <motion.div
                    animate={{ rotate: openSections.expiry ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="text-cyan-300" />
                  </motion.div>
                </div>
              </motion.div>

              <AnimatePresence>
                {openSections.expiry && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {filteredExpiry.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-block p-8 rounded-full glass-morph mb-4"
                        >
                          <Clock size={48} className="text-gray-500" />
                        </motion.div>
                        <p className="text-gray-400 text-lg">No expiry alerts at this time</p>
                        <p className="text-gray-500 text-sm mt-2">All items are within safe expiry windows</p>
                      </div>
                    ) : (
                      filteredExpiry.map((drug, idx) => {
                        const days = daysRemaining(drug.expiryDate);
                        const expSoon = days !== null && days > 0 && days < 30;
                        const critical = days !== null && days > 0 && days < 7;
                        const urgencyPercent = days ? Math.max(0, Math.min(100, (days / 90) * 100)) : 50;
                        
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, type: "spring" }}
                            whileHover={{ scale: 1.03, rotateX: 3, z: 30 }}
                            className={`p-5 rounded-xl bg-gradient-to-br from-cyan-900/20 to-blue-900/15 border ${
                              critical ? 'border-red-500/40 glow-pulse' : 'border-cyan-700/30'
                            } shadow-xl card-3d relative overflow-hidden group`}
                          >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            
                            {/* Animated background glow */}
                            <motion.div
                              className={`absolute inset-0 bg-gradient-to-br ${
                                critical ? 'from-red-600/10 to-orange-600/10' : 'from-cyan-600/5 to-blue-600/5'
                              } opacity-0 group-hover:opacity-100 transition-opacity`}
                              animate={{ opacity: critical ? [0.1, 0.3, 0.1] : 0 }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            
                            {/* Critical alert indicator */}
                            {critical && (
                              <div className="absolute top-3 left-3 z-20">
                                <motion.div 
                                  className="relative w-3 h-3"
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ repeat: Infinity, duration: 1 }}
                                >
                                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
                                  <div className="absolute inset-0 bg-red-400 rounded-full" />
                                </motion.div>
                              </div>
                            )}

                            <div className="flex justify-between items-start relative z-10">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <motion.div 
                                    className="text-xl font-bold text-cyan-100"
                                    whileHover={{ scale: 1.05, color: "#7dd3fc" }}
                                  >
                                    {drug.name}
                                  </motion.div>
                                  {expSoon && (
                                    <motion.div 
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        critical 
                                          ? 'bg-red-600/30 text-red-200 border border-red-500/50' 
                                          : 'bg-orange-600/30 text-orange-200 border border-orange-500/50'
                                      }`}
                                      animate={{ 
                                        opacity: critical ? [1, 0.6, 1] : 1,
                                        scale: critical ? [1, 1.05, 1] : 1
                                      }}
                                      transition={{ repeat: critical ? Infinity : 0, duration: 1.5 }}
                                    >
                                      {critical ? '🚨 CRITICAL' : '⚠️ Expiring Soon'}
                                    </motion.div>
                                  )}
                                </div>

                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-cyan-300/80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    <strong>Batch:</strong> 
                                    <span className="text-cyan-200">{drug.batchNo || drug.batch}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-cyan-300/80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    <strong>Expiry:</strong>
                                    <span className="text-cyan-200">
                                      {drug.expiryDate ? new Date(drug.expiryDate).toLocaleDateString() : "N/A"}
                                    </span>
                                  </div>
                                  <motion.div 
                                    className="flex items-center gap-2"
                                    animate={{ 
                                      color: critical ? ['#fca5a5', '#ef4444', '#fca5a5'] : ['#67e8f9']
                                    }}
                                    transition={{ repeat: critical ? Infinity : 0, duration: 2 }}
                                  >
                                    <div className={`w-1.5 h-1.5 rounded-full ${critical ? 'bg-red-400' : 'bg-cyan-400'}`} />
                                    <strong>Days Left:</strong>
                                    <span className={`font-bold ${critical ? 'text-red-300' : 'text-cyan-200'}`}>
                                      {days === null ? "N/A" : `${days} days`}
                                    </span>
                                  </motion.div>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-4 relative">
                                  <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                                    <motion.div 
                                      className={`h-full ${
                                        critical ? 'bg-gradient-to-r from-red-500 to-orange-500' : 
                                        'bg-gradient-to-r from-cyan-500 to-blue-500'
                                      }`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${urgencyPercent}%` }}
                                      transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                  </div>
                                  <div className="flex justify-between mt-1 text-xs text-gray-400">
                                    <span>Urgency</span>
                                    <span>{Math.round(urgencyPercent)}%</span>
                                  </div>
                                </div>
                              </div>

                              <div className="ml-6 flex flex-col items-end gap-3">
                                <div className="text-center">
                                  <div className="text-xs text-gray-400 mb-1">Location</div>
                                  <motion.div 
                                    className="px-3 py-1 rounded-lg glass-morph border border-cyan-500/30 text-sm font-medium text-cyan-200"
                                    whileHover={{ scale: 1.05, borderColor: 'rgba(6, 182, 212, 0.6)' }}
                                  >
                                    {drug.warehouseLocation || "—"}
                                  </motion.div>
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.08, boxShadow: '0 0 25px rgba(79, 209, 197, 0.6)' }}
                                  whileTap={{ scale: 0.95 }}
                                  className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-medium cursor-pointer shadow-lg relative overflow-hidden group"
                                >
                                  <span className="relative z-10">View Details</span>
                                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* LOW STOCK ALERTS */}
          {showLow && (
            <motion.div
              key="lowSection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-violet-700/30 glass-morph overflow-hidden relative"
            >
              <motion.div
                onClick={() => toggleSection("lowStock")}
                className="flex justify-between items-center cursor-pointer bg-gradient-to-r from-violet-900/30 via-indigo-900/30 to-purple-900/30 px-6 py-5 relative overflow-hidden group"
                whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
              >
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
                <div className="flex items-center gap-4 relative z-10">
                  <motion.div
                    animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <AlertTriangle className="text-violet-300" size={24} />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-violet-100">Low Stock Alerts</h3>
                    <p className="text-sm text-violet-300/70 mt-0.5">{filteredLowStock.length} items below threshold</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium">
                    {filteredLowStock.length}
                  </div>
                  <motion.div
                    animate={{ rotate: openSections.lowStock ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="text-violet-300" />
                  </motion.div>
                </div>
              </motion.div>

              <AnimatePresence>
                {openSections.lowStock && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {filteredLowStock.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-block p-8 rounded-full glass-morph mb-4"
                        >
                          <Package size={48} className="text-gray-500" />
                        </motion.div>
                        <p className="text-gray-400 text-lg">No low stock alerts</p>
                        <p className="text-gray-500 text-sm mt-2">All inventory levels are healthy</p>
                      </div>
                    ) : (
                      filteredLowStock.map((item, idx) => {
                        const isCritical = item.quantity < item.threshold * 0.5;
                        const stockPercent = Math.max(0, Math.min(100, (item.quantity / item.threshold) * 100));
                        
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, type: "spring" }}
                            whileHover={{ scale: 1.03, rotateX: 3, z: 30 }}
                            className={`p-5 rounded-xl bg-gradient-to-br from-violet-900/20 to-indigo-900/15 border ${
                              isCritical ? 'border-orange-500/40 glow-pulse' : 'border-violet-700/30'
                            } shadow-xl card-3d relative overflow-hidden group`}
                          >
                            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            
                            <motion.div
                              className={`absolute inset-0 bg-gradient-to-br ${
                                isCritical ? 'from-orange-600/10 to-red-600/10' : 'from-violet-600/5 to-indigo-600/5'
                              } opacity-0 group-hover:opacity-100 transition-opacity`}
                              animate={{ opacity: isCritical ? [0.1, 0.3, 0.1] : 0 }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            
                            {isCritical && (
                              <div className="absolute top-3 left-3 z-20">
                                <motion.div 
                                  className="relative w-3 h-3"
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ repeat: Infinity, duration: 1 }}
                                >
                                  <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping" />
                                  <div className="absolute inset-0 bg-orange-400 rounded-full" />
                                </motion.div>
                              </div>
                            )}

                            <div className="flex justify-between items-start relative z-10">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <motion.div 
                                    className="text-xl font-bold text-violet-100"
                                    whileHover={{ scale: 1.05, color: "#c4b5fd" }}
                                  >
                                    {item.drugId?.name || item.name || "Unknown"}
                                  </motion.div>
                                  <motion.div 
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      isCritical 
                                        ? 'bg-orange-600/30 text-orange-200 border border-orange-500/50' 
                                        : 'bg-violet-600/30 text-violet-200 border border-violet-500/50'
                                    }`}
                                    animate={{ 
                                      opacity: isCritical ? [1, 0.6, 1] : 1,
                                      scale: isCritical ? [1, 1.05, 1] : 1
                                    }}
                                    transition={{ repeat: isCritical ? Infinity : 0, duration: 1.5 }}
                                  >
                                    {isCritical ? '⚠️ CRITICAL' : '📊 Low'}
                                  </motion.div>
                                </div>

                                <div className="space-y-2 text-sm">
                                  <motion.div 
                                    className="flex items-center gap-2"
                                    animate={{ 
                                      color: isCritical ? ['#fbbf24', '#f59e0b', '#fbbf24'] : ['#c4b5fd']
                                    }}
                                    transition={{ repeat: isCritical ? Infinity : 0, duration: 2 }}
                                  >
                                    <div className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-orange-400' : 'bg-violet-400'}`} />
                                    <strong>Stock:</strong>
                                    <span className={`font-bold ${isCritical ? 'text-orange-300' : 'text-violet-200'}`}>
                                      {item.quantity} units
                                    </span>
                                  </motion.div>
                                  <div className="flex items-center gap-2 text-violet-300/80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    <strong>Threshold:</strong>
                                    <span className="text-violet-200">{item.threshold} units</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-violet-300/80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    <strong>Location:</strong>
                                    <span className="text-violet-200">{item.warehouseLocation || "N/A"}</span>
                                  </div>
                                </div>

                                <div className="mt-4 relative">
                                  <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                                    <motion.div 
                                      className={`h-full ${
                                        isCritical ? 'bg-gradient-to-r from-orange-500 to-red-500' : 
                                        'bg-gradient-to-r from-violet-500 to-indigo-500'
                                      }`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${stockPercent}%` }}
                                      transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                  </div>
                                  <div className="flex justify-between mt-1 text-xs text-gray-400">
                                    <span>Stock Level</span>
                                    <span>{Math.round(stockPercent)}%</span>
                                  </div>
                                </div>
                              </div>

                              <div className="ml-6 flex flex-col items-end gap-3">
                                <div className="text-center">
                                  <div className="text-xs text-gray-400 mb-1">Batch</div>
                                  <motion.div 
                                    className="px-3 py-1 rounded-lg glass-morph border border-violet-500/30 text-sm font-medium text-violet-200"
                                    whileHover={{ scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.6)' }}
                                  >
                                    {item.batchNo || "—"}
                                  </motion.div>
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.08, boxShadow: '0 0 25px rgba(139, 92, 246, 0.6)' }}
                                  whileTap={{ scale: 0.95 }}
                                  className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-sm font-medium cursor-pointer shadow-lg relative overflow-hidden group"
                                >
                                  <span className="relative z-10">Reorder Now</span>
                                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced footer */}
      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="glass-morph inline-block px-6 py-3 rounded-full border border-gray-700/50">
          <p className="text-xs text-gray-400">
            © 2025 MedTrack Analytics • 
            <span className="text-indigo-400 mx-2">Powered by AI</span> • 
            Designed with <span className="text-red-400">❤️</span> for smarter pharma management
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
        

        
      




