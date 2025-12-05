//SHREYA'S CODE.
// import { useEffect, useState } from "react";
// import { useApi } from "../../hooks/useApi";

// export default function Dashboard() {
//   const { request, loading } = useApi();
//   const [stats, setStats] = useState({
//     totalDrugs: 0,
//     suppliers: 0,
//     activeShipments: 0,
//     lowStockItems: 0,
//   });
//   const [alerts, setAlerts] = useState({
//     expiryAlerts: [],
//     lowStockAlerts: [],
//   });

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const [statsRes, alertsRes] = await Promise.all([
//         request("GET", "/api/admin/dashboard/stats"),
//         request("GET", "/api/admin/dashboard/alerts"),
//       ]);
//       if (statsRes?.data) setStats(statsRes.data);
//       if (alertsRes?.data) setAlerts(alertsRes.data);
//     } catch (err) {
//       console.error("Error fetching dashboard data:", err);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-96">
//         <p className="text-gray-500">Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Stats Cards */}
//       <div className="grid grid-cols-4 gap-6">
//         {[
//           { label: "Total Drugs", value: stats.totalDrugs, icon: "📦", color: "blue" },
//           { label: "Suppliers", value: stats.suppliers, icon: "👥", color: "green" },
//           { label: "Active Shipments", value: stats.activeShipments, icon: "🚚", color: "purple" },
//           { label: "Low Stock Items", value: stats.lowStockItems, icon: "⚠️", color: "red" },
//         ].map((card, idx) => (
//           <div
//             key={idx}
//             className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <div
//                 className={`w-14 h-14 bg-${card.color}-100 rounded-xl flex items-center justify-center text-3xl`}
//               >
//                 {card.icon}
//               </div>
//             </div>
//             <p className="text-4xl font-bold text-gray-800">{card.value}</p>
//             <p className="text-gray-500 mt-2">{card.label}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


// tissue

// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { useApi } from "../../hooks/useApi";
// import { 
//   Package, Users, Truck, AlertTriangle, TrendingUp, TrendingDown, ArrowRight,
//   Eye, FileText, ExternalLink
// } from "lucide-react";

// export default function Dashboard() {
//   const { request, loading } = useApi();

//   const [stats, setStats] = useState({
//     totalDrugs: 98,
//     suppliers: 24,
//     activeShipments: 12,
//     lowStockItems: 5,
//   });

//   const [chartPeriod, setChartPeriod] = useState("year");

//   const categoryData = [
//     { name: "Antibiotics", value: 35, color: "#5b7cff" },
//     { name: "Pain Relief", value: 25, color: "#7c3aed" },
//     { name: "Vitamins", value: 20, color: "#ec4899" },
//     { name: "Others", value: 20, color: "#f59e0b" },
//   ];

//   const recentOrders = [
//     { id: "#ORD121", medicine: "Metformin", price: "$10.50", status: "Delivered" },
//     { id: "#ORD122", medicine: "Omeprazole", price: "$15.05", status: "Delivered" },
//     { id: "#ORD123", medicine: "Lisinopril", price: "$8.75", status: "Pending" },
//     { id: "#ORD124", medicine: "Atorvastatin", price: "$12.30", status: "In Transit" },
//   ];

//   useEffect(() => {
//     // Safe API fetch
//     const fetchData = async () => {
//       try {
//         const [statsRes, alertsRes] = await Promise.all([
//           request("GET", "/api/admin/dashboard/stats"),
//           request("GET", "/api/admin/dashboard/alerts"),
//         ]);
//         if (statsRes?.data) setStats(statsRes.data);
//       } catch (err) {
//         console.error("Error fetching dashboard data:", err);
//       }
//     };
//     fetchData();
//   }, [request]);

//   const statCards = [
//     {
//       label: "Total Drugs",
//       value: stats.totalDrugs,
//       icon: <Package size={24} />,
//       color: "#5b7cff",
//       trend: "+10%",
//       trendUp: true,
//       action: () => alert("Navigate to Drugs page"),
//     },
//     {
//       label: "Suppliers",
//       value: stats.suppliers,
//       icon: <Users size={24} />,
//       color: "#1a4d5c",
//       trend: "+5%",
//       trendUp: true,
//       action: () => alert("Navigate to Suppliers page"),
//     },
//     {
//       label: "Active Shipments",
//       value: stats.activeShipments,
//       icon: <Truck size={24} />,
//       color: "#7c3aed",
//       trend: "+15%",
//       trendUp: true,
//       action: () => alert("Navigate to Shipments page"),
//     },
//     {
//       label: "Low Stock Items",
//       value: stats.lowStockItems,
//       icon: <AlertTriangle size={24} />,
//       color: "#ef4444",
//       trend: "-8%",
//       trendUp: false,
//       action: () => alert("Navigate to Alerts page"),
//     },
//   ];

//   const getSalesData = () => {
//     if (chartPeriod === "year") {
//       return [
//         { month: "Jan", value: 450 },
//         { month: "Feb", value: 320 },
//         { month: "Mar", value: 750 },
//         { month: "Apr", value: 200 },
//         { month: "May", value: 350 },
//         { month: "Jun", value: 180 },
//       ];
//     } else if (chartPeriod === "month") {
//       return [
//         { month: "Week 1", value: 120 },
//         { month: "Week 2", value: 180 },
//         { month: "Week 3", value: 220 },
//         { month: "Week 4", value: 160 },
//       ];
//     } else {
//       return [
//         { month: "Mon", value: 45 },
//         { month: "Tue", value: 62 },
//         { month: "Wed", value: 55 },
//         { month: "Thu", value: 70 },
//         { month: "Fri", value: 80 },
//       ];
//     }
//   };

//   const salesData = getSalesData();
//   const maxValue = Math.max(...salesData.map((d) => d.value));

//   return (
//     <div className="w-full text-white p-5">
//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
//         {statCards.map((card, idx) => (
//           <motion.div
//             key={idx}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: idx * 0.1 }}
//             onClick={card.action}
//             className="rounded-2xl p-5 shadow-xl backdrop-blur-lg border border-white/10 cursor-pointer"
//             style={{ background: "rgba(30,41,59,0.6)" }}
//           >
//             <div className="flex items-center justify-between mb-3">
//               <div className="p-3 rounded-xl" style={{ backgroundColor: `${card.color}20` }}>
//                 <span style={{ color: card.color }}>{card.icon}</span>
//               </div>
//               <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${card.trendUp ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
//                 {card.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
//                 {card.trend}
//               </div>
//             </div>
//             <h2 className="text-3xl font-bold mb-1">{card.value}</h2>
//             <p className="text-gray-400 text-sm">{card.label}</p>
//           </motion.div>
//         ))}
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         {/* Bar Chart */}
//         <motion.div className="rounded-2xl shadow-xl p-5 backdrop-blur-xl border border-white/10" style={{ background: "rgba(30,41,59,0.6)" }}>
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h2 className="text-lg font-bold text-white">Sales Analytics</h2>
//               <p className="text-xs text-gray-400 mt-1">{chartPeriod === "year" ? "Monthly" : chartPeriod === "month" ? "Weekly" : "Daily"} overview</p>
//             </div>
//             <select value={chartPeriod} onChange={(e) => setChartPeriod(e.target.value)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none cursor-pointer">
//               <option value="year">This Year</option>
//               <option value="month">This Month</option>
//               <option value="week">This Week</option>
//             </select>
//           </div>

//           <div className="flex items-end justify-between h-48 gap-2">
//             {salesData.map((data, idx) => {
//               const heightPercent = (data.value / maxValue) * 100;
//               const colors = ["#5b7cff","#7c3aed","#8b5cf6","#ec4899","#f43f5e","#f59e0b"];
//               return (
//                 <motion.div
//                   key={idx}
//                   initial={{ height: 0 }}
//                   animate={{ height: `${heightPercent}%` }}
//                   transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
//                   className="flex-1 rounded-t-lg relative group cursor-pointer"
//                   style={{ background: colors[idx % colors.length], minHeight: "30px" }}
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-2 py-1 rounded text-[10px] whitespace-nowrap font-semibold border border-white/10">
//                     ${data.value}
//                   </div>
//                   <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-medium">
//                     {data.month}
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </motion.div>

//         {/* Pie Chart */}
//         <motion.div className="rounded-2xl shadow-xl p-5 backdrop-blur-xl border border-white/10" style={{ background: "rgba(30,41,59,0.6)" }}>
//           <h2 className="text-lg font-bold text-white mb-4">Drug Categories</h2>
//           <div className="flex items-center justify-center mb-4">
//             <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
//               {(() => {
//                 let currentAngle = 0;
//                 return categoryData.map((item, idx) => {
//                   const angle = (item.value / 100) * 360;
//                   const startAngle = currentAngle;
//                   const endAngle = currentAngle + angle;
//                   currentAngle = endAngle;

//                   const x1 = 50 + 40 * Math.cos((Math.PI * startAngle) / 180);
//                   const y1 = 50 + 40 * Math.sin((Math.PI * startAngle) / 180);
//                   const x2 = 50 + 40 * Math.cos((Math.PI * endAngle) / 180);
//                   const y2 = 50 + 40 * Math.sin((Math.PI * endAngle) / 180);

//                   const largeArc = angle > 180 ? 1 : 0;

//                   return (
//                     <motion.path
//                       key={idx}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ delay: idx * 0.1 }}
//                       d={`M50 50 L${x1} ${y1} A40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
//                       fill={item.color}
//                     />
//                   );
//                 });
//               })()}
//               <circle cx="50" cy="50" r="25" fill="rgba(13,27,42,0.9)" />
//             </svg>
//           </div>
//         </motion.div>
//       </div>

//       {/* Recent Orders */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <motion.div className="lg:col-span-2 rounded-2xl shadow-xl p-5 backdrop-blur-xl border border-white/10" style={{ background: "rgba(30,41,59,0.6)" }}>
//           <h2 className="text-lg font-bold text-white mb-4">Latest Orders</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-white/10">
//                   <th className="text-left text-xs text-gray-400 pb-3">Order ID</th>
//                   <th className="text-left text-xs text-gray-400 pb-3">Medicine</th>
//                   <th className="text-left text-xs text-gray-400 pb-3">Price</th>
//                   <th className="text-left text-xs text-gray-400 pb-3">Status</th>
//                   <th className="text-left text-xs text-gray-400 pb-3">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {recentOrders.map((order, idx) => (
//                   <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
//                     <td className="py-3 text-sm text-white">{order.id}</td>
//                     <td className="py-3 text-sm text-white">{order.medicine}</td>
//                     <td className="py-3 text-sm text-white font-semibold">{order.price}</td>
//                     <td className="py-3">
//                       <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${order.status==="Delivered"?"bg-green-500/20 text-green-400":order.status==="Pending"?"bg-yellow-500/20 text-yellow-400":"bg-blue-500/20 text-blue-400"}`}>
//                         {order.status}
//                       </span>
//                     </td>
//                     <td className="py-3 flex gap-2">
//                       <button onClick={()=>alert(`View ${order.id}`)} className="p-1.5 hover:bg-white/10 rounded-lg"><Eye size={14} className="text-gray-400"/></button>
//                       <button onClick={()=>alert(`Invoice ${order.id}`)} className="p-1.5 hover:bg-white/10 rounded-lg"><FileText size={14} className="text-gray-400"/></button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }



// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { useApi } from "../../hooks/useApi";
// import { 
//   Package, Users, Truck, AlertTriangle, TrendingUp, TrendingDown, ExternalLink 
// } from "lucide-react";

// export default function Dashboard() {
//   const { request } = useApi();

//   const [stats, setStats] = useState({
//     totalDrugs: 98,
//     suppliers: 24,
//     activeShipments: 12,
//     lowStockItems: 5,
//   });

//   const [chartPeriod, setChartPeriod] = useState("year");

//   const categoryData = [
//     { name: "Antibiotics", value: 35, color: "#5b7cff" },
//     { name: "Pain Relief", value: 25, color: "#7c3aed" },
//     { name: "Vitamins", value: 20, color: "#ec4899" },
//     { name: "Others", value: 20, color: "#f59e0b" },
//   ];

//   const recentOrders = [
//     { id: "#ORD121", medicine: "Metformin", price: "$10.50", status: "Delivered" },
//     { id: "#ORD122", medicine: "Omeprazole", price: "$15.05", status: "Delivered" },
//     { id: "#ORD123", medicine: "Lisinopril", price: "$8.75", status: "Pending" },
//     { id: "#ORD124", medicine: "Atorvastatin", price: "$12.30", status: "In Transit" },
//   ];

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [statsRes] = await Promise.all([
//           request("GET", "/api/admin/dashboard/stats")
//         ]);
//         if (statsRes?.data) setStats(statsRes.data);
//       } catch (err) {
//         console.error("Error fetching dashboard data:", err);
//       }
//     };
//     fetchData();
//   }, [request]);

//   const statCards = [
//     { label: "Total Drugs", value: stats.totalDrugs, icon: <Package size={24} />, color: "#5b7cff", trend: "+10%", trendUp: true },
//     { label: "Suppliers", value: stats.suppliers, icon: <Users size={24} />, color: "#1a4d5c", trend: "+5%", trendUp: true },
//     { label: "Active Shipments", value: stats.activeShipments, icon: <Truck size={24} />, color: "#7c3aed", trend: "+15%", trendUp: true },
//     { label: "Low Stock Items", value: stats.lowStockItems, icon: <AlertTriangle size={24} />, color: "#ef4444", trend: "-8%", trendUp: false },
//   ];

//   const getSalesData = () => {
//     if (chartPeriod === "year") return [
//       {month:"Jan",value:450},{month:"Feb",value:320},{month:"Mar",value:750},
//       {month:"Apr",value:200},{month:"May",value:350},{month:"Jun",value:180}
//     ];
//     if (chartPeriod === "month") return [
//       {month:"Week 1",value:120},{month:"Week 2",value:180},{month:"Week 3",value:220},{month:"Week 4",value:160}
//     ];
//     return [
//       {month:"Mon",value:45},{month:"Tue",value:62},{month:"Wed",value:55},{month:"Thu",value:70},{month:"Fri",value:80}
//     ];
//   };

//   const salesData = getSalesData();
//   const maxValue = Math.max(...salesData.map(d => d.value));

//   return (
//     <div className="w-full text-white p-5">

//       {/* Top Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
//         {statCards.map((card, idx) => (
//           <motion.div
//             key={idx}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: idx * 0.1 }}
//             className="rounded-2xl p-5 shadow-xl backdrop-blur-lg border border-white/10 cursor-pointer"
//             style={{ background: "rgba(30,41,59,0.6)" }}
//           >
//             <div className="flex items-center justify-between mb-3">
//               <div className="p-3 rounded-xl" style={{ backgroundColor: `${card.color}20` }}>
//                 {card.icon}
//               </div>
//               <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${card.trendUp ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
//                 {card.trendUp ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}{card.trend}
//               </div>
//             </div>
//             <motion.h2
//               className="text-3xl font-bold mb-1"
//               initial={{ count: 0 }}
//               animate={{ count: card.value }}
//               transition={{ duration: 1.5, ease: "easeOut" }}
//             >
//               {Math.floor(card.value)}
//             </motion.h2>
//             <p className="text-gray-400 text-sm">{card.label}</p>
//           </motion.div>
//         ))}
//       </div>

//       {/* Charts Section (Doctor Image + Pie) */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

//         {/* Doctor Image + Learn More (Updated image source) */}
//         <motion.div 
//           className="rounded-2xl shadow-xl p-5 flex flex-col items-center justify-between backdrop-blur-xl border border-white/10"
//           style={{ background: "rgba(30,41,59,0.6)" }}
//         >
//           <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop" alt="Doctor" className="w-48 h-48 object-cover mb-4 rounded-full" />
//           <h2 className="text-lg font-bold text-white mb-2">Healthcare Insights</h2>
//           <p className="text-gray-400 text-sm text-center mb-4">Discover how digital health tools are transforming medical supply chains and patient care.</p>
//           <button className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-sm">
//             Learn More <ExternalLink size={16}/>
//           </button>
//         </motion.div>

//         {/* Pie Chart with Information */}
//         <motion.div 
//           className="rounded-2xl shadow-xl p-5 backdrop-blur-xl border border-white/10"
//           style={{ background: "rgba(30,41,59,0.6)" }}
//         >
//           <h2 className="text-lg font-bold text-white mb-4">Drug Categories Overview</h2>
//           <div className="flex items-center justify-center mb-6">
//             <svg className="w-44 h-44 -rotate-90" viewBox="0 0 100 100">
//               {(() => {
//                 let currentAngle = 0;
//                 return categoryData.map((item, idx) => {
//                   const angle = (item.value / 100) * 360;
//                   const startAngle = currentAngle;
//                   const endAngle = currentAngle + angle;
//                   currentAngle = endAngle;
//                   const x1 = 50 + 40 * Math.cos((Math.PI*startAngle)/180);
//                   const y1 = 50 + 40 * Math.sin((Math.PI*startAngle)/180);
//                   const x2 = 50 + 40 * Math.cos((Math.PI*endAngle)/180);
//                   const y2 = 50 + 40 * Math.sin((Math.PI*endAngle)/180);
//                   const largeArc = angle > 180 ? 1:0;
//                   return <motion.path key={idx} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:idx*0.1}} d={`M50 50 L${x1} ${y1} A40 40 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={item.color}/>;
//                 });
//               })()}
//               <circle cx="50" cy="50" r="25" fill="rgba(13,27,42,0.9)"/>
//             </svg>
//           </div>
//           {/* Legends */}
//           <div className="space-y-2">
//             {categoryData.map((item, idx) => (
//               <div key={idx} className="flex items-center justify-between text-sm">
//                 <div className="flex items-center gap-2">
//                   <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
//                   <span className="text-gray-300">{item.name}</span>
//                 </div>
//                 <span className="font-semibold text-white">{item.value}%</span>
//               </div>
//             ))}
//           </div>
//         </motion.div>
//       </div>

//       {/* Bottom Section (Latest Orders + Bar Chart swapped) */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Latest Orders */}
//         <motion.div className="lg:col-span-2 rounded-2xl shadow-xl p-5 backdrop-blur-xl border border-white/10"
//           style={{ background: "rgba(30,41,59,0.6)" }}
//         >
//           <h2 className="text-lg font-bold text-white mb-4">Latest Orders</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-white/10">
//                   <th className="text-left text-xs text-gray-400 pb-3">Order ID</th>
//                   <th className="text-left text-xs text-gray-400 pb-3">Medicine</th>
//                   <th className="text-left text-xs text-gray-400 pb-3">Price</th>
//                   <th className="text-left text-xs text-gray-400 pb-3">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {recentOrders.map((order, idx) => (
//                   <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
//                     <td className="py-3 text-sm text-white">{order.id}</td>
//                     <td className="py-3 text-sm text-white">{order.medicine}</td>
//                     <td className="py-3 text-sm text-white font-semibold">{order.price}</td>
//                     <td className="py-3">
//                       <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${order.status==="Delivered"?"bg-green-500/20 text-green-400":order.status==="Pending"?"bg-yellow-500/20 text-yellow-400":"bg-blue-500/20 text-blue-400"}`}>
//                         {order.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </motion.div>

//         {/* Bar Chart moved here */}
//         <motion.div 
//           className="rounded-2xl shadow-xl p-5 backdrop-blur-xl border border-white/10"
//           style={{ background: "rgba(30,41,59,0.6)" }}
//         >
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h2 className="text-lg font-bold text-white">Sales Analytics</h2>
//               <p className="text-xs text-gray-400 mt-1">{chartPeriod === "year" ? "Monthly" : chartPeriod === "month" ? "Weekly" : "Daily"} overview</p>
//             </div>
//             <select 
//               value={chartPeriod} 
//               onChange={e=>setChartPeriod(e.target.value)} 
//               className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
//             >
//               <option value="year">This Year</option>
//               <option value="month">This Month</option>
//               <option value="week">This Week</option>
//             </select>
//           </div>
//           <div className="flex items-end justify-between h-48 gap-2">
//             {salesData.map((data, idx) => {
//               const heightPercent = (data.value / maxValue) * 100;
//               const colors = ["#5b7cff","#7c3aed","#8b5cf6","#ec4899","#f43f5e","#f59e0b"];
//               return (
//                 <motion.div 
//                   key={idx}
//                   initial={{ height: 0 }} 
//                   animate={{ height: `${heightPercent}%` }} 
//                   transition={{ delay: idx*0.1, type:"spring", stiffness:100 }}
//                   className="flex-1 rounded-t-lg relative group cursor-pointer"
//                   style={{ background: colors[idx % colors.length], minHeight: "30px" }}
//                 >
//                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-2 py-1 rounded text-[10px] whitespace-nowrap font-semibold border border-white/10">
//                     ${data.value}
//                   </div>
//                   <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-medium">
//                     {data.month}
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }


// updated dhongggg

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../../hooks/useApi";
import { 
  Package, Users, Truck, AlertTriangle, TrendingUp, TrendingDown, ExternalLink,
  DollarSign, Activity, Bell, Download, Calendar, Filter, Search
} from "lucide-react";

export default function Dashboard() {
  const { request } = useApi();

  const [stats, setStats] = useState({
    totalDrugs: 98,
    suppliers: 24,
    activeShipments: 12,
    lowStockItems: 5,
  });

  const [chartPeriod, setChartPeriod] = useState("year");
  const [showNotifications, setShowNotifications] = useState(false);

  const categoryData = [
    { name: "Antibiotics", value: 35, color: "#5b7cff" },
    { name: "Pain Relief", value: 25, color: "#7c3aed" },
    { name: "Vitamins", value: 20, color: "#ec4899" },
    { name: "Others", value: 20, color: "#f59e0b" },
  ];

  const recentOrders = [
    { id: "#ORD121", medicine: "Metformin", price: "$10.50", status: "Delivered", quantity: 500 },
    { id: "#ORD122", medicine: "Omeprazole", price: "$15.05", status: "Delivered", quantity: 300 },
    { id: "#ORD123", medicine: "Lisinopril", price: "$8.75", status: "Pending", quantity: 200 },
    { id: "#ORD124", medicine: "Atorvastatin", price: "$12.30", status: "In Transit", quantity: 450 },
  ];

  const notifications = [
    { id: 1, type: "warning", message: "Low stock alert: Aspirin", time: "5 min ago" },
    { id: 2, type: "success", message: "Order #ORD125 delivered", time: "15 min ago" },
    { id: 3, type: "info", message: "New supplier registration", time: "1 hour ago" },
  ];

  const topPerformers = [
    { name: "Aspirin", sales: 2450, growth: "+25%", category: "Pain Relief" },
    { name: "Metformin", sales: 2100, growth: "+18%", category: "Diabetes" },
    { name: "Omeprazole", sales: 1850, growth: "+12%", category: "Digestive" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes] = await Promise.all([
          request("GET", "/api/admin/dashboard/stats")
        ]);
        if (statsRes?.data) setStats(statsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, [request]);

  const statCards = [
    { label: "Total Drugs", value: stats.totalDrugs, icon: <Package size={24} />, color: "#5b7cff", trend: "+10%", trendUp: true },
    { label: "Suppliers", value: stats.suppliers, icon: <Users size={24} />, color: "#1a4d5c", trend: "+5%", trendUp: true },
    { label: "Active Shipments", value: stats.activeShipments, icon: <Truck size={24} />, color: "#7c3aed", trend: "+15%", trendUp: true },
    { label: "Low Stock Items", value: stats.lowStockItems, icon: <AlertTriangle size={24} />, color: "#ef4444", trend: "-8%", trendUp: false },
  ];

  const getSalesData = () => {
    if (chartPeriod === "year") return [
      {month:"Jan",value:450},{month:"Feb",value:320},{month:"Mar",value:750},
      {month:"Apr",value:200},{month:"May",value:350},{month:"Jun",value:180}
    ];
    if (chartPeriod === "month") return [
      {month:"Week 1",value:120},{month:"Week 2",value:180},{month:"Week 3",value:220},{month:"Week 4",value:160}
    ];
    return [
      {month:"Mon",value:45},{month:"Tue",value:62},{month:"Wed",value:55},{month:"Thu",value:70},{month:"Fri",value:80}
    ];
  };

  const salesData = getSalesData();
  const maxValue = Math.max(...salesData.map(d => d.value));

  return (
    <div className="w-full text-white p-5">

      {/* Header Section with Quick Actions */}
      {/* Header Section with Quick Actions */}
<div className="flex items-center justify-between mb-6">
  <div>
    <motion.h1
      className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(99,102,241,0.6)] mb-1"
      initial={{ y: -5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      📊 Dashboard
    </motion.h1>
    <p className="text-gray-400 text-sm flex items-center gap-2">
      <Calendar size={14} />
      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  </div>
  <div className="flex gap-3">
    <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center gap-2">
      <Download size={16} />
      <span className="hidden sm:inline text-sm">Export</span>
    </button>
    <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center gap-2">
      <Filter size={16} />
      <span className="hidden sm:inline text-sm">Filter</span>
    </button>
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center gap-2 relative"
      >
        <Bell size={16} />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">3</span>
      </button>
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-slate-800 border border-white/10 rounded-xl shadow-2xl p-4 z-50"
          >
            <h3 className="font-bold mb-3">Notifications</h3>
            {notifications.map(notif => (
              <div key={notif.id} className="mb-3 pb-3 border-b border-white/10 last:border-0">
                <p className="text-sm text-white mb-1">{notif.message}</p>
                <p className="text-xs text-gray-400">{notif.time}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
</div>


      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-2xl p-5 shadow-xl backdrop-blur-lg border border-white/10 cursor-pointer hover:scale-105 transform transition relative overflow-hidden"
            style={{ background: "rgba(30,41,59,0.6)" }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${card.color}20` }}>
                {card.icon}
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${card.trendUp ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {card.trendUp ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} {card.trend}
              </div>
            </div>
            <motion.h2
              className="text-3xl font-bold mb-1 relative z-10"
              initial={{ count: 0 }}
              animate={{ count: card.value || 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              {Math.floor(card.value || 0)}
            </motion.h2>
            <p className="text-gray-400 text-sm relative z-10">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue & Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Card */}
        <motion.div 
          className="rounded-2xl shadow-xl p-5 backdrop-blur-xl border border-white/10 hover:scale-105 transform transition"
          style={{ background: "rgba(30,41,59,0.6)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Monthly Revenue</h2>
            <div className="p-2 rounded-lg bg-green-500/20">
              <DollarSign size={20} className="text-green-400"/>
            </div>
          </div>
          <h3 className="text-4xl font-bold text-white mb-2">$45,280</h3>
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <TrendingUp size={16}/>
            <span>+22.5% from last month</span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Target: $50,000</span>
              <span className="text-white font-semibold">90.5%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "90.5%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
              />
            </div>
          </div>
        </motion.div>

        {/* Top Performers */}
        <motion.div 
          className="lg:col-span-2 rounded-2xl shadow-xl p-5 backdrop-blur-xl border border-white/10 hover:scale-105 transform transition"
          style={{ background: "rgba(30,41,59,0.6)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Top Performing Products</h2>
            <Activity size={20} className="text-blue-400"/>
          </div>
          <div className="space-y-3">
            {topPerformers.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{item.sales} units</p>
                  <p className="text-xs text-green-400">{item.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Doctor Card */}
        <motion.div 
          className="rounded-2xl shadow-xl p-5 flex flex-col items-center justify-between backdrop-blur-xl border border-white/10 hover:scale-105 transform transition"
          style={{ background: "rgba(30,41,59,0.6)" }}
        >
          <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop" alt="Doctor" className="w-48 h-48 object-cover mb-4 rounded-full border-4 border-blue-500/30" />
          <h2 className="text-lg font-bold text-white mb-2">Healthcare Insights</h2>
          <p className="text-gray-400 text-sm text-center mb-4">Discover how digital health tools are transforming medical supply chains and patient care.</p>
          <button className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-500/50">
            Learn More <ExternalLink size={16}/>
          </button>
        </motion.div>

        {/* Pie Chart */}
        <motion.div 
          className="rounded-2xl shadow-xl p-5 backdrop-blur-xl border border-white/10 hover:scale-105 transform transition"
          style={{ background: "rgba(30,41,59,0.6)" }}
        >
          <h2 className="text-lg font-bold text-white mb-4">Drug Categories Distribution</h2>
          <div className="flex items-center justify-center mb-6">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 100 100">
              {(() => {
                let currentAngle = 0;
                return categoryData.map((item, idx) => {
                  const angle = (item.value / 100) * 360;
                  const startAngle = currentAngle;
                  const endAngle = currentAngle + angle;
                  currentAngle = endAngle;
                  const x1 = 50 + 40 * Math.cos((Math.PI*startAngle)/180);
                  const y1 = 50 + 40 * Math.sin((Math.PI*startAngle)/180);
                  const x2 = 50 + 40 * Math.cos((Math.PI*endAngle)/180);
                  const y2 = 50 + 40 * Math.sin((Math.PI*endAngle)/180);
                  const largeArc = angle > 180 ? 1:0;
                  return <motion.path key={idx} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:idx*0.1}} d={`M50 50 L${x1} ${y1} A40 40 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={item.color}/>;
                });
              })()}
              <circle cx="50" cy="50" r="25" fill="rgba(13,27,42,0.9)"/>
            </svg>
          </div>
          <div className="space-y-2">
            {categoryData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-white/5 transition">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="font-semibold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Orders & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Latest Orders */}
        <motion.div className="lg:col-span-2 rounded-2xl shadow-xl p-5 backdrop-blur-xl border border-white/10 hover:scale-105 transform transition"
          style={{ background: "rgba(30,41,59,0.6)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Latest Orders</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ExternalLink size={14}/>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-gray-400 pb-3 font-semibold">Order ID</th>
                  <th className="text-left text-xs text-gray-400 pb-3 font-semibold">Medicine</th>
                  <th className="text-left text-xs text-gray-400 pb-3 font-semibold">Qty</th>
                  <th className="text-left text-xs text-gray-400 pb-3 font-semibold">Price</th>
                  <th className="text-left text-xs text-gray-400 pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <motion.tr 
                    key={idx} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3 text-sm text-blue-400 font-semibold">{order.id}</td>
                    <td className="py-3 text-sm text-white">{order.medicine}</td>
                    <td className="py-3 text-sm text-gray-300">{order.quantity}</td>
                    <td className="py-3 text-sm text-white font-semibold">{order.price}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${order.status==="Delivered"?"bg-green-500/20 text-green-400":order.status==="Pending"?"bg-yellow-500/20 text-yellow-400":"bg-blue-500/20 text-blue-400"}`}>
                        {order.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div 
          className="rounded-2xl shadow-xl p-5 backdrop-blur-xl border border-white/10 hover:scale-105 transform transition"
          style={{ background: "rgba(30,41,59,0.6)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Sales Analytics</h2>
              <p className="text-xs text-gray-400 mt-1">{chartPeriod === "year" ? "Monthly" : chartPeriod === "month" ? "Weekly" : "Daily"} overview</p>
            </div>
            <select 
              value={chartPeriod} 
              onChange={e=>setChartPeriod(e.target.value)} 
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none cursor-pointer hover:bg-white/10 transition"
            >
              <option value="year">This Year</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {salesData.map((data, idx) => {
              const heightPercent = (data.value / maxValue) * 100;
              const colors = ["#5b7cff","#7c3aed","#8b5cf6","#ec4899","#f43f5e","#f59e0b"];
              return (
                <motion.div 
                  key={idx}
                  initial={{ height: 0 }} 
                  animate={{ height: `${heightPercent}%` }} 
                  transition={{ delay: idx*0.1, type:"spring", stiffness:100 }}
                  className="flex-1 rounded-t-lg relative group cursor-pointer"
                  style={{ background: colors[idx % colors.length], minHeight: "30px" }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-2 py-1 rounded text-[10px] whitespace-nowrap font-semibold border border-white/10">
                    ${data.value}
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-medium">
                    {data.month}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* KPI Rings + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* KPI Rings */}
        <div className="lg:col-span-1 grid grid-cols-1 gap-5">
          {[
            { label: "Shipment Completion", value: 75, color: "#5b7cff" },
            { label: "Stock Availability", value: 85, color: "#7c3aed" },
            { label: "Monthly Target", value: 60, color: "#ec4899" },
          ].map((item, idx) => (
            <motion.div key={idx} className="rounded-2xl p-5 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-center flex-col hover:scale-105 transform transition"
              style={{ background: "rgba(30,41,59,0.6)" }}
            >
              <svg className="w-24 h-24">
                <circle cx="50%" cy="50%" r="36" stroke="#ffffff20" strokeWidth="8" fill="none"/>
                <motion.circle
                  cx="50%" cy="50%" r="36"
                  stroke={item.color}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 36}
                  strokeDashoffset={2 * Math.PI * 36 * (1 - item.value / 100)}
                  initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - item.value / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <h3 className="text-white font-bold mt-2">{item.label}</h3>
              <p className="text-gray-400 text-sm">{item.value}%</p>
            </motion.div>
          ))}
        </div>

        {/* Map */}
        <motion.div className="lg:col-span-2 rounded-2xl shadow-xl p-5 backdrop-blur-xl border border-white/10 hover:scale-105 transform transition"
          style={{ background: "rgba(30,41,59,0.6)" }}
        >
          <h2 className="text-lg font-bold text-white mb-4">Supplier & Shipment Map</h2>
          <div className="w-full h-80 rounded-2xl overflow-hidden border border-white/10 bg-slate-800/50 flex items-center justify-center relative">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=68.0,8.0,97.5,35.5&layer=mapnik&marker=20.5937,78.9629"
              className="w-full h-full"
              title="Suppliers Map"
            ></iframe>
            <div className="absolute top-4 right-4 bg-black/90 px-4 py-3 rounded-lg backdrop-blur-sm border border-white/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                <p className="text-white text-xs font-semibold">Mumbai - 12 Suppliers</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-white text-xs font-semibold">Delhi - 15 Suppliers</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></span>
                <p className="text-white text-xs font-semibold">Bangalore - 10 Suppliers</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></span>
                <p className="text-white text-xs font-semibold">Kolkata - 8 Suppliers</p>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-2">Live tracking of supplier locations and active delivery routes across India.</p>
        </motion.div>

      </div>

    </div>
  );
}










