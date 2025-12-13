<<<<<<< HEAD
=======
// SHREYA'S CODE.
// import { useEffect, useState } from "react";
// import { useApi } from "../../hooks/useApi";

// export default function Inventory() {
//   const { request } = useApi();
//   const [inventory, setInventory] = useState([]);

//   useEffect(() => {
//     fetchInventory();
//   }, []);

//   const fetchInventory = async () => {
//     try {
//       const res = await request("GET", "/api/admin/inventory");
//       setInventory(res.inventory || []);
//     } catch (err) {
//       console.error("Error fetching inventory:", err);
//     }
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//       <table className="w-full">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-6 py-4 text-left">Drug</th>
//             <th className="px-6 py-4 text-left">Batch</th>
//             <th className="px-6 py-4 text-left">Quantity</th>
//             <th className="px-6 py-4 text-left">Location</th>
//           </tr>
//         </thead>
//         <tbody>
//           {inventory.length > 0 ? (
//             inventory.map((item) => (
//               <tr key={item._id} className="border-t hover:bg-gray-50">
//                 <td className="px-6 py-4">{item.drug?.name || "Unknown"}</td>
//                 <td className="px-6 py-4">{item.batchNo}</td>
//                 <td className="px-6 py-4">{item.quantity}</td>
//                 <td className="px-6 py-4">{item.warehouseLocation}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="4" className="text-center py-12 text-gray-400">
//                 No inventory records found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }


// doing shit
// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useApi } from "../../hooks/useApi";
// import {
//   PackageSearch,
//   Boxes,
//   Warehouse,
//   AlertTriangle,
//   CheckCircle2,
//   TrendingUp,
//   TrendingDown,
//   Layers,
//   Info,
//   X,
//   Factory,
//   CalendarDays,
//   DollarSign,
// } from "lucide-react";

// export default function Inventory() {
//   const { request } = useApi();
//   const [inventory, setInventory] = useState([]);
//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState("drug");
//   const [selectedDrug, setSelectedDrug] = useState(null);

//   useEffect(() => {
//     fetchInventory();
//   }, []);

//   const fetchInventory = async () => {
//     try {
//       const res = await request("GET", "/api/admin/inventory");
//       setInventory(res.inventory || []);
//     } catch (err) {
//       console.error("Error fetching inventory:", err);
//     }
//   };

//   const filteredInventory = inventory
//     .filter((item) =>
//       item.drug?.name?.toLowerCase().includes(search.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (sortBy === "quantity") return b.quantity - a.quantity;
//       if (sortBy === "drug") return a.drug?.name?.localeCompare(b.drug?.name);
//       return 0;
//     });

//   const totalItems = inventory.length;
//   const lowStockCount = inventory.filter((i) => i.quantity < 20).length;
//   const totalQuantity = inventory.reduce((sum, i) => sum + i.quantity, 0);
//   const totalBatches = new Set(inventory.map((i) => i.batchNo)).size;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0a0f24] to-[#111b3a] text-gray-200 p-6">
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.7 }}
//         className="max-w-7xl mx-auto space-y-8"
//       >
//         {/* HEADER */}
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-white">Inventory Dashboard</h1>
//             <p className="text-gray-400 text-sm">
//               Track and manage drug inventory efficiently
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <input
//               type="text"
//               placeholder="Search drug..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="bg-[#1a2342]/60 border border-[#3b4a73] text-gray-200 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
//             />
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="bg-[#1a2342]/60 border border-[#3b4a73] text-gray-200 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400"
//             >
//               <option value="drug">Sort by Drug</option>
//               <option value="quantity">Sort by Quantity</option>
//             </select>
//           </div>
//         </div>

//         {/* SUMMARY CARDS */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
//           <SummaryCard
//             title="Total Drugs"
//             value={totalItems}
//             icon={<PackageSearch className="text-purple-400" size={24} />}
//             color="from-purple-600/30 to-purple-800/30"
//             glow="shadow-purple-500/30"
//             trend="+12.5%"
//             trendUp
//           />
//           <SummaryCard
//             title="Total Quantity"
//             value={totalQuantity}
//             icon={<Boxes className="text-emerald-400" size={24} />}
//             color="from-emerald-600/30 to-emerald-800/30"
//             glow="shadow-emerald-500/30"
//             trend="+5.3%"
//             trendUp
//           />
//           <SummaryCard
//             title="Total Batches"
//             value={totalBatches}
//             icon={<Layers className="text-blue-400" size={24} />}
//             color="from-blue-600/30 to-blue-800/30"
//             glow="shadow-blue-500/30"
//             trend="+2.1%"
//             trendUp
//           />
//           <SummaryCard
//             title="Low Stock"
//             value={lowStockCount}
//             icon={<AlertTriangle className="text-red-400" size={24} />}
//             color="from-red-600/30 to-red-800/30"
//             glow="shadow-red-500/30"
//             trend="-3.4%"
//             trendUp={false}
//           />
//         </div>

//         {/* TABLE */}
//         <div className="bg-[#1b2240]/70 border border-[#2e3a68] rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden">
//           <table className="w-full text-left">
//             <thead className="bg-[#232b4d]/80">
//               <tr>
//                 <th className="px-6 py-4 text-gray-300 font-semibold">
//                   <PackageSearch className="inline mr-2 text-purple-400" size={16} />
//                   Drug
//                 </th>
//                 <th className="px-6 py-4 text-gray-300 font-semibold">
//                   <Boxes className="inline mr-2 text-purple-400" size={16} />
//                   Batch
//                 </th>
//                 <th className="px-6 py-4 text-gray-300 font-semibold">
//                   <Warehouse className="inline mr-2 text-purple-400" size={16} />
//                   Quantity
//                 </th>
//                 <th className="px-6 py-4 text-gray-300 font-semibold">Location</th>
//                 <th className="px-6 py-4 text-gray-300 font-semibold">Status</th>
//               </tr>
//             </thead>

//             <motion.tbody
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.7 }}
//             >
//               {filteredInventory.length > 0 ? (
//                 filteredInventory.map((item) => (
//                   <motion.tr
//                     key={item._id}
//                     className="border-t border-[#2e3a68]/60 hover:bg-[#262f58]/60 transition-all cursor-pointer"
//                     whileHover={{ scale: 1.01 }}
//                     onClick={() => setSelectedDrug(item)}
//                   >
//                     <td className="px-6 py-4 font-medium text-gray-100 flex items-center gap-2">
//                       {item.drug?.name || "Unknown"}
//                       <Info size={16} className="text-gray-400" />
//                     </td>
//                     <td className="px-6 py-4 text-gray-300">{item.batchNo}</td>
//                     <td
//                       className={`px-6 py-4 font-semibold ${
//                         item.quantity < 20 ? "text-red-400" : "text-emerald-400"
//                       }`}
//                     >
//                       {item.quantity}
//                     </td>
//                     <td className="px-6 py-4 text-gray-300">
//                       {item.warehouseLocation}
//                     </td>
//                     <td className="px-6 py-4">
//                       {item.quantity < 20 ? (
//                         <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-sm">
//                           <AlertTriangle size={14} /> Low Stock
//                         </span>
//                       ) : (
//                         <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-sm">
//                           <CheckCircle2 size={14} /> In Stock
//                         </span>
//                       )}
//                     </td>
//                   </motion.tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="5" className="text-center py-12 text-gray-400">
//                     No inventory records found
//                   </td>
//                 </tr>
//               )}
//             </motion.tbody>
//           </table>
//         </div>
//       </motion.div>

//       {/* ✅ Popup Modal */}
//       <AnimatePresence>
//         {selectedDrug && (
//           <motion.div
//             className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="bg-[#1b2240] border border-[#2e3a68] rounded-2xl p-6 max-w-md w-full shadow-xl text-gray-200 relative"
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               <button
//                 className="absolute top-3 right-3 text-gray-400 hover:text-gray-100"
//                 onClick={() => setSelectedDrug(null)}
//               >
//                 <X size={20} />
//               </button>

//               <h2 className="text-2xl font-bold mb-4 text-white">
//                 {selectedDrug.drug?.name}
//               </h2>

//               <div className="space-y-3 text-gray-300">
//                 <p className="flex items-center gap-2">
//                   <Boxes size={16} /> Batch:{" "}
//                   <span className="text-white">{selectedDrug.batchNo}</span>
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <Warehouse size={16} /> Location:{" "}
//                   <span className="text-white">{selectedDrug.warehouseLocation}</span>
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <Factory size={16} /> Manufacturer:{" "}
//                   <span className="text-white">{selectedDrug.drug?.manufacturer || "N/A"}</span>
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <CalendarDays size={16} /> Expiry:{" "}
//                   <span className="text-white">{selectedDrug.drug?.expiryDate || "Not Provided"}</span>
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <DollarSign size={16} /> Price:{" "}
//                   <span className="text-white">₹{selectedDrug.drug?.price || "N/A"}</span>
//                 </p>
//               </div>

//               <div className="mt-6 flex justify-end">
//                 <button
//                   onClick={() => setSelectedDrug(null)}
//                   className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white"
//                 >
//                   Close
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ✅ Summary Card Component
// function SummaryCard({ title, value, icon, color, glow, trend, trendUp }) {
//   return (
//     <motion.div
//       whileHover={{ scale: 1.03 }}
//       className={`rounded-2xl p-5 bg-gradient-to-br ${color} border border-[#2e3a68]/70 backdrop-blur-lg ${glow} shadow-lg`}
//     >
//       <div className="flex justify-between items-center mb-3">
//         <div className="text-gray-300 font-semibold">{title}</div>
//         {icon}
//       </div>
//       <div className="text-3xl font-bold text-white">{value}</div>
//       <div
//         className={`flex items-center gap-1 mt-2 text-sm ${
//           trendUp ? "text-emerald-400" : "text-red-400"
//         }`}
//       >
//         {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
//         <span>{trend}</span>
//       </div>
//     </motion.div>
//   );
// }

// doing moreeee shittttt
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../../hooks/useApi";
import {
  PackageSearch,
  RefreshCcw,
  FileDown,
  Eye,
  Filter,
  Package,
  Layers,
  AlertTriangle,
  Boxes,
  MapPin,
  Hash,
  TrendingUp,
  TrendingDown,
  Info,
<<<<<<< HEAD
  Edit,
  Trash2,
  Plus,
=======
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
} from "lucide-react";

import amphetamine from "../../assets/images/amphetamine.jpg";
import atropine from "../../assets/images/atropine.jpg";
import cortifoam from "../../assets/images/cortifoam.jpg";
import fludro from "../../assets/images/fludro.jpg";
import dextro from "../../assets/images/dextro.jpg";

// fallback image
const defaultDrug =
  "https://cdn-icons-png.flaticon.com/512/2966/2966485.png";

export default function Inventory() {
  const { request } = useApi();

  const [inventory, setInventory] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const popupRef = useRef(null);
<<<<<<< HEAD
  const tableRef = useRef(null);
=======
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({});
  const [trends, setTrends] = useState([]);
  const [showSupplier, setShowSupplier] = useState(false);
<<<<<<< HEAD
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // CRUD Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [drugs, setDrugs] = useState([]);
  const [formData, setFormData] = useState({
    drug: "",
    quantity: "",
    warehouseLocation: "",
    batchNo: "",
  });
=======
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584

  const drugNames = [
    { name: "Amphetamine Sulfate", usage: "Treatment for ADHD.", img: amphetamine },
    { name: "Atropine sulfate", usage: "Used to treat bradycardia.", img: atropine },
    { name: "Cortifoam", usage: "Corticosteroid for inflammation.", img: cortifoam },
    { name: "Fludrocortisone Acetate", usage: "Treats Addison's disease.", img: fludro },
    { name: "Dextroamphetamine Saccharate", usage: "CNS stimulant.", img: dextro },
  ];
<<<<<<< HEAD
  const loadInventory = async () => {
    try {
      const res = await request("GET", "/api/admin/inventory");
      if (res?.success && res?.inventory && res.inventory.length > 0) {
        setInventory(res.inventory);
      } else {
        console.warn("No inventory data returned from API");
      }
=======

  // fetch inventory (API unchanged)
  const fetchInventory = async () => {
    try {
      const res = await request("GET", "/api/admin/inventory");
      let data = res.inventory || [];

      data = data.map((item, index) => {
        const drugInfo = drugNames[index % drugNames.length];
        const randomQuantity = Math.floor(Math.random() * 100) + 10;
        const batchNo = item.batchNo || `BATCH-${1000 + index}`;
        const location = item.warehouseLocation || `Warehouse ${String.fromCharCode(65 + (index % 5))}`;

        return {
          ...item,
          quantity: randomQuantity,
          batchNo,
          warehouseLocation: location,
          drug: {
            ...item.drug,
            name: item.drug?.name || drugInfo.name,
            manufacturer: item.drug?.manufacturer || `PharmaCo ${index + 1}`,
            expiryDate: item.drug?.expiryDate || `2025-12-${(index % 28) + 1}`,
            price: item.drug?.price || (Math.random() * 50 + 5).toFixed(2),
            description: item.drug?.description || "High-quality pharmaceutical product.",
            usage: item.drug?.usage || drugInfo.usage,
            img: item.drug?.img || drugInfo.img || defaultDrug,
          },
          history: [
            { date: "2025-09-01", qty: "+100", type: "Received" },
            { date: "2025-10-10", qty: "-30", type: "Dispatched" },
          ],
        };
      });
      setInventory(data);
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

<<<<<<< HEAD
  // Load drugs list for dropdown
  const loadDrugs = async () => {
    try {
      const res = await request("GET", "/api/admin/drugs");
      if (res?.success && res?.drugs) {
        setDrugs(res.drugs);
      }
    } catch (err) {
      console.error("Error fetching drugs:", err);
    }
  };

  // Add Inventory
  const handleAddInventory = async () => {
    if (!formData.drug || !formData.quantity || !formData.warehouseLocation) {
      alert("Please fill all fields");
      return;
    }
    try {
      const res = await request("POST", "/api/admin/inventory", formData);
      if (res?.success) {
        alert("Inventory added successfully");
        setFormData({ drug: "", quantity: "", warehouseLocation: "", batchNo: "" });
        setShowAddModal(false);
        loadInventory();
      } else {
        alert(res?.message || "Error adding inventory");
      }
    } catch (err) {
      console.error("Error adding inventory:", err);
      alert("Error adding inventory");
    }
  };

  // Update Inventory
  const handleUpdateInventory = async () => {
    if (!editingItem?._id || !formData.quantity || !formData.warehouseLocation) {
      alert("Please fill all fields");
      return;
    }
    try {
      const updateData = {
        quantity: Number(formData.quantity),
        warehouseLocation: formData.warehouseLocation,
        batchNo: formData.batchNo,
      };
      const res = await request("PUT", `/api/admin/inventory/${editingItem._id}`, updateData);
      if (res?.success) {
        alert("Inventory updated successfully");
        setFormData({ drug: "", quantity: "", warehouseLocation: "", batchNo: "" });
        setShowEditModal(false);
        setEditingItem(null);
        loadInventory();
      } else {
        alert(res?.message || "Error updating inventory");
      }
    } catch (err) {
      console.error("Error updating inventory:", err);
      alert("Error updating inventory");
    }
  };

  // Delete Inventory
  const handleDeleteInventory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?")) return;
    try {
      const res = await request("DELETE", `/api/admin/inventory/${id}`);
      if (res?.success) {
        alert("Inventory deleted successfully");
        loadInventory();
      } else {
        alert(res?.message || "Error deleting inventory");
      }
    } catch (err) {
      console.error("Error deleting inventory:", err);
      alert("Error deleting inventory");
    }
  };

  // Open edit modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      drug: item.drug?._id || "",
      quantity: item.quantity,
      warehouseLocation: item.warehouseLocation,
      batchNo: item.batchNo,
    });
    setShowEditModal(true);
  };

  // Refresh inventory data
  const refreshInventory = async () => {
    try {
      const res = await request("GET", "/api/admin/inventory");
      if (res?.success && res?.inventory && res.inventory.length > 0) {
        setInventory(res.inventory);
      }
    } catch (err) {
      console.error("Error refreshing inventory:", err);
    }
  };

  // Load inventory data on mount ONLY
  useEffect(() => {
    loadInventory();
    loadDrugs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to table when page changes
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  // SIMPLE FILTERING - NO DEBOUNCE, NO USEMEMO - JUST LIKE DRUGS.JSX
  const filtered = inventory.filter((item) => {
    const drugName = item.drug?.name || "Unknown Drug";
    const searchLower = search.toLowerCase();
    
    const nameMatch = drugName.toLowerCase().includes(searchLower);
    const batchMatch = (item.batchNo || "").toLowerCase().includes(searchLower);
    const locationMatch = (item.warehouseLocation || "").toLowerCase().includes(searchLower);
    
    if (!nameMatch && !batchMatch && !locationMatch) return false;

    // Apply status filter
    if (filter === "All") return true;
    
    const status = item.quantity === 0 ? "Out of Stock" : item.quantity < 20 ? "Low Stock" : "In Stock";
    return status === filter;
  });

  // PAGINATION - Show 10 items per page like Drugs.jsx
  const itemsPerPage = 10;
  
  // Calculate total pages based on filtered results
  const calculatedTotalPages = filtered.length > 0 
    ? Math.ceil(filtered.length / itemsPerPage) 
    : 1;

  // Update totalPages when filtered data changes
  useEffect(() => {
    setTotalPages(calculatedTotalPages);
    // Only reset to page 1 if current page exceeds new total pages
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [calculatedTotalPages, currentPage]);

  // Pagination slice
  const paginatedInventory = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

=======
  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.drug?.name?.toLowerCase().includes(search.toLowerCase());
    const status = item.quantity === 0 ? "Out of Stock" : item.quantity < 20 ? "Low Stock" : "In Stock";
    if (filter === "All") return matchesSearch;
    return matchesSearch && status === filter;
  });

>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
  const getStatus = (qty) => (qty === 0 ? "Out of Stock" : qty < 20 ? "Low Stock" : "In Stock");
  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock": return "text-green-400 border-green-400/40 bg-green-900/40";
      case "Low Stock": return "text-yellow-300 border-yellow-400/40 bg-yellow-900/40";
      case "Out of Stock": return "text-red-400 border-red-400/40 bg-red-900/40";
      default: return "";
    }
  };

  const totalDrugs = inventory.length;
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalBatches = new Set(inventory.map((i) => i.batchNo)).size;
  const lowStock = inventory.filter((i) => i.quantity < 20).length;

  const stats = [
    { title: "Total Drugs", value: totalDrugs, icon: <Boxes size={22} /> },
    { title: "Total Quantity", value: totalQuantity, icon: <Package size={22} /> },
    { title: "Total Batches", value: totalBatches, icon: <Layers size={22} /> },
    { title: "Low Stock", value: lowStock, icon: <AlertTriangle size={22} /> },
  ];

<<<<<<< HEAD
  // Simple direct stats (no animation to reduce lag)
  useEffect(() => {
    setAnimatedStats({
      drugs: totalDrugs,
      quantity: totalQuantity,
      batches: totalBatches,
      low: lowStock,
    });
  }, [totalDrugs, totalQuantity, totalBatches, lowStock]);

  // random trends - only set once
=======
  // one-time animation
  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const step = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      setAnimatedStats({
        drugs: Math.floor(progress * totalDrugs),
        quantity: Math.floor(progress * totalQuantity),
        batches: Math.floor(progress * totalBatches),
        low: Math.floor(progress * lowStock),
      });
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [totalDrugs, totalQuantity, totalBatches, lowStock]);

  // random trends
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
  useEffect(() => {
    const make = () =>
      stats.map(() => {
        const up = Math.random() > 0.4;
        const pct = Math.floor(5 + Math.random() * 12);
        return { up, pct };
      });
    setTrends(make());
<<<<<<< HEAD
  }, [stats.length]);
=======
  }, []);
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584

  // export CSV
  const exportCSV = () => {
    const csvRows = [
      ["Drug", "Batch", "Quantity", "Location", "Status"],
<<<<<<< HEAD
      ...filtered.map((item) => [
=======
      ...filteredInventory.map((item) => [
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
        `"${(item.drug?.name || "").replace(/"/g, '""') }"`,
        item.batchNo,
        item.quantity,
        `"${(item.warehouseLocation || "").replace(/"/g, '""') }"`,
        getStatus(item.quantity),
      ]),
    ];
    const csv = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ✅ CHANGED: handle popup - center horizontally, align vertically with eye
  const handleEyeClick = (item, event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Center horizontally on screen, align vertically with button
    const top = rect.top + window.scrollY + (rect.height / 2); // Vertical position of button
    const left = window.innerWidth / 2; // Center of screen
    
    setPopupPos({ top, left });
    setSelectedDrug(item);
  };

  // expiry alert (within 30 days)
  const isExpiringSoon = (date) => {
    const expiry = new Date(date);
    const now = new Date();
    const diff = (expiry - now) / (1000 * 60 * 60 * 24);
    return diff < 30 && diff > 0;
  };

  // inject small helper CSS for animations & glows (keeps tailwind usage intact)
  useEffect(() => {
    const id = "inventory-enhance-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @keyframes pulse-slow { 0%,100%{ transform: translate(0,0) scale(1); opacity:1 } 50%{ transform: translate(1%,1%) scale(1.02); opacity:0.95 }}
      .animate-pulse-slow { animation: pulse-slow 12s ease-in-out infinite; }
      @keyframes ping-slow { 0%,100%{ transform: scale(1); opacity:1 } 50%{ transform: scale(1.8); opacity:0.35 }}
      .animate-ping-slow { animation: ping-slow 2s infinite; }
      .glow-strong { box-shadow: 0 8px 30px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.02);} 
      .glass-row { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); backdrop-filter: blur(6px); }
      .sparkline { opacity:0.95 }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
<<<<<<< HEAD
    <div
      className="p-8 text-white min-h-screen relative overflow-hidden bg-gradient-to-b from-[#030617] via-[#0a1128] to-[#02040a]"
=======
    <motion.div
      className="p-8 text-white min-h-screen relative overflow-hidden bg-gradient-to-b from-[#030617] via-[#0a1128] to-[#02040a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
    >
      {/* Ambient moving blobs (dark + neon) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div className="absolute -left-32 top-10 w-96 h-96 rounded-full blur-3xl bg-indigo-600/20 animate-pulse-slow" />
        <motion.div className="absolute right-10 top-40 w-80 h-80 rounded-full blur-3xl bg-cyan-400/18 animate-pulse-slow" />
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 relative">
        <div>
          <motion.h1
            className="text-5xl font-extrabold bg-gradient-to-r from-cyan-300 via-indigo-400 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(99,102,241,0.6)]"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
          >
            💊 Inventory
          </motion.h1>

          <div className="mt-2 text-sm text-gray-300 flex items-center gap-4">
            <span className="flex items-center gap-2">
              <Info size={14} />
              <span className="opacity-80">Business-ready • Real-time indicators •</span>
            </span>
            <span className="opacity-80">A robust vetting process is your safeguard against future disruption</span>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <motion.button
<<<<<<< HEAD
            onClick={() => {
              setFormData({ drug: "", quantity: "", warehouseLocation: "", batchNo: "" });
              setShowAddModal(true);
            }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
          >
            <Plus size={18} /> Add Inventory
          </motion.button>

          <motion.button
            onClick={refreshInventory}
=======
            onClick={fetchInventory}
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gray-900/60 border border-gray-700/60 rounded-xl flex items-center gap-2 hover:shadow-lg"
          >
            <RefreshCcw size={18} /> Refresh
          </motion.button>

          <motion.button
            onClick={() => setShowFilter(!showFilter)}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gray-900/60 border border-gray-700/60 rounded-xl flex items-center gap-2 hover:shadow-lg"
          >
            <Filter size={18} /> {filter !== "All" ? filter : "Filter"}
          </motion.button>

          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-44 bg-gray-900/90 border border-gray-700 rounded-xl shadow-lg"
              >
                {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFilter(option);
                      setShowFilter(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg ${filter === option ? 'bg-indigo-800 text-blue-200' : 'hover:bg-gray-800 text-gray-300'}`}
                  >
                    {option}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={exportCSV}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gray-900/60 border border-gray-700/60 rounded-xl flex items-center gap-2 hover:shadow-lg"
          >
            <FileDown size={18} /> Export
          </motion.button>
        </div>
      </div>

      {/* BUSINESS KPI BAR */}
      <div className="flex flex-wrap gap-6 mb-6 text-sm text-gray-300 items-center">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gray-900/50 border border-gray-700/50 shadow-sm">
          <div className="text-xs">💰 Total Inventory Value</div>
          <div className="ml-2 font-semibold text-green-300">₹{(totalQuantity * 25.5).toLocaleString()}</div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gray-900/50 border border-gray-700/50 shadow-sm">
          <div className="text-xs">🔄 Turnover Rate</div>
          <div className="ml-2 font-semibold text-blue-300">{(Math.random() * 5 + 1).toFixed(2)}x</div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gray-900/50 border border-gray-700/50 shadow-sm">
          <div className="text-xs">✅ Compliance</div>
          <div className="ml-2 font-semibold text-emerald-300">{Math.floor(Math.random() * 15 + 85)}%</div>
        </div>

        <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 animate-ping-slow"></span> Live</div>
          <div className="flex items-center gap-2">Updated: {new Date().toLocaleString()}</div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const value =
            i === 0
              ? animatedStats.drugs
              : i === 1
              ? animatedStats.quantity
              : i === 2
              ? animatedStats.batches
              : animatedStats.low;
          const trend = trends[i] || { up: true, pct: 10 };
          return (
<<<<<<< HEAD
            <div
              key={i}
              className="relative overflow-hidden group p-6 rounded-2xl border border-gray-700/60 bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl shadow-lg glow-strong hover:scale-105 transition-transform"
=======
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="relative overflow-hidden group p-6 rounded-2xl border border-gray-700/60 bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl shadow-lg glow-strong"
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
            >
              <div className="absolute -top-6 -right-8 w-40 h-40 bg-gradient-to-br from-indigo-500/30 to-cyan-400/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition" />

              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">{stat.title}</h3>
                {stat.icon}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-blue-300">{value || 0}</div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${trend.up ? 'text-green-300' : 'text-red-300'}`}>
                  {trend.up ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                  <span>{trend.up ? `+${trend.pct}%` : `-${trend.pct}%`}</span>
                </div>

                {/* mini sparkline */}
                <svg className="ml-auto sparkline" width="80" height="30" viewBox="0 0 80 30" preserveAspectRatio="none">
                  <polyline fill="none" stroke={trend.up ? '#4ade80' : '#f87171'} strokeWidth="2" points={Array.from({length:8}).map((_,k)=>`${k*10},${20-Math.sin(k+ i)*8}`).join(' ')} />
                </svg>
              </div>
<<<<<<< HEAD
            </div>
=======
            </motion.div>
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
          );
        })}
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-3 mb-5">
        <PackageSearch size={20} />
        <input
          type="text"
          placeholder="🔍 Search drug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80 px-4 py-2 bg-gray-900/60 border border-gray-700/60 rounded-lg text-gray-200"
        />

        <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">Theme: <strong className="text-blue-300 ml-1">Dark + Neon</strong></div>
          <div className="flex items-center gap-2">Motion: <strong className="text-blue-300 ml-1">Subtle + Bold</strong></div>
        </div>
      </div>

      {/* TABLE */}
<<<<<<< HEAD
      <div ref={tableRef} className="overflow-x-auto border border-gray-700/60 rounded-2xl bg-gray-900/50">
=======
      <div className="overflow-x-auto border border-gray-700/60 rounded-2xl bg-gray-900/50">
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-900/70 text-blue-300 uppercase text-sm">
            <tr>
              <th className="py-3 px-5">Drug</th>
              <th className="py-3 px-5">Batch</th>
              <th className="py-3 px-5">Quantity</th>
              <th className="py-3 px-5">Location</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
<<<<<<< HEAD
            {paginatedInventory && paginatedInventory.length > 0 ? (
              paginatedInventory.map((item, index) => {
                const status = getStatus(item.quantity);
                const color = getStatusColor(status);
                return (
                  <tr
                    key={index}
                    className="border-t border-gray-700/40 glass-row hover:bg-gradient-to-r hover:from-indigo-900/40 hover:to-cyan-900/40 transition"
                  >
                    <td className="py-3 px-5 flex items-center gap-3 first:rounded-l-xl last:rounded-r-xl">
                      <img
                        src={defaultDrug}
                        alt="Drug"
                        className="w-10 h-10 object-cover rounded-full border border-gray-700"
                      />
                      <div>
                        <div className="font-medium">{item.drug?.name || "Unknown Drug"}</div>
                        <div className="text-xs text-gray-400">{item.drug?.manufacturer || "N/A"}</div>
                      </div>
                      {item.drug && isExpiringSoon(item.drug?.expiryDate) && (
                        <span className="ml-2 px-2 py-0.5 bg-red-700 text-xs rounded-md">Expiring Soon</span>
                      )}
                    </td>
                    <td className="py-3 px-5">{item.batchNo}</td>
                    <td className="py-3 px-5">{item.quantity}</td>
                    <td className="py-3 px-5">{item.warehouseLocation}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-start">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${status === 'In Stock' ? 'bg-green-400' : status === 'Low Stock' ? 'bg-yellow-400' : 'bg-red-400'} animate-ping-slow`}></span>
                        <span className={`px-3 py-1 border rounded-full text-sm ${color}`}>{status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-center flex gap-2 justify-center">
                      <button
                        onClick={() => openEditModal(item)}
                        className="px-2 py-1 bg-gray-900/60 border border-blue-700/60 rounded-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] text-blue-400"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteInventory(item._id)}
                        className="px-2 py-1 bg-gray-900/60 border border-red-700/60 rounded-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-400">
                  No inventory data found
                </td>
              </tr>
            )}
=======
            {filteredInventory.map((item, index) => {
              const status = getStatus(item.quantity);
              const color = getStatusColor(status);
              return (
                <motion.tr
                  key={index}
                  className="border-t border-gray-700/40 glass-row hover:bg-gradient-to-r hover:from-indigo-900/40 hover:to-cyan-900/40 transition"
                  whileHover={{ scale: 1.01 }}
                >
                  <td className="py-3 px-5 flex items-center gap-3 first:rounded-l-xl last:rounded-r-xl">
                    <img
                      src={item.drug?.img || defaultDrug}
                      alt={item.drug?.name}
                      className="w-10 h-10 object-cover rounded-full border border-gray-700"
                      onError={(e) => (e.target.src = defaultDrug)}
                    />
                    <div>
                      <div className="font-medium">{item.drug?.name}</div>
                      <div className="text-xs text-gray-400">{item.drug?.manufacturer}</div>
                    </div>
                    {isExpiringSoon(item.drug?.expiryDate) && (
                      <span className="ml-2 px-2 py-0.5 bg-red-700 text-xs rounded-md">Expiring Soon</span>
                    )}
                  </td>
                  <td className="py-3 px-5">{item.batchNo}</td>
                  <td className="py-3 px-5">{item.quantity}</td>
                  <td className="py-3 px-5">{item.warehouseLocation}</td>
                  <td className="py-3 px-5">
                    <div className="flex items-center justify-start">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${status === 'In Stock' ? 'bg-green-400' : status === 'Low Stock' ? 'bg-yellow-400' : 'bg-red-400'} animate-ping-slow`}></span>
                      <span className={`px-3 py-1 border rounded-full text-sm ${color}`}>{status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-center">
                    <button
                      onClick={(e) => handleEyeClick(item, e)}
                      className="px-3 py-1 bg-gray-900/60 border border-gray-700/60 rounded-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
          </tbody>
        </table>
      </div>

<<<<<<< HEAD
      {/* PAGINATION CONTROLS */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-400">
          Page {currentPage} of {totalPages || 1} | Showing {paginatedInventory.length} of {filtered.length} items
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-900/60 border border-gray-700/60 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-900/60 border border-gray-700/60 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
          >
            Next →
          </button>
        </div>
      </div>

=======
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
      {/* ✅ CHANGED: DRUG POPUP - Centered horizontally, positioned at eye's vertical level */}
      <AnimatePresence>
        {selectedDrug && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDrug(null)}
          >
            <motion.div
              ref={popupRef}
              style={{
                position: 'absolute',
                top: `${popupPos.top}px`,
                left: `${popupPos.left}px`,
                transform: 'translate(-50%, -50%)', // Center both ways from the point
              }}
              className="w-[90%] sm:w-[520px] bg-gray-900/95 border border-gray-700/60 rounded-2xl p-5 shadow-[0_0_45px_rgba(99,102,241,0.6)]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">{selectedDrug.drug?.name}</h2>
                <button onClick={() => setSelectedDrug(null)} className="text-gray-400 hover:text-gray-200">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <img
                    src={selectedDrug.drug?.img || defaultDrug}
                    alt={selectedDrug.drug?.name}
                    className="w-full h-36 object-cover rounded-lg mb-3 border border-gray-700"
                    onError={(e) => (e.target.src = defaultDrug)}
                  />

                  <div className="text-xs text-gray-400">Price</div>
                  <div className="font-semibold text-xl">₹{selectedDrug.drug?.price}</div>

                  <div className="mt-3">
                    <button className="w-full px-3 py-2 mt-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 text-white">Create PO</button>
                    <button className="w-full px-3 py-2 mt-2 rounded-lg border border-gray-700 text-gray-200">View Analytics</button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex gap-4 mb-3">
                    <button className="text-sm text-blue-300 border-b-2 border-blue-300 pb-1">Details</button>
                    <button className="text-sm text-gray-400 hover:text-gray-200">History</button>
                    <button className="text-sm text-gray-400 hover:text-gray-200">Analytics</button>
                  </div>

                  <div className="space-y-1 text-gray-300 text-sm">
                    <p><strong>Manufacturer:</strong>{" "}
                      <button
                        onClick={() => setShowSupplier(true)}
                        className="text-blue-300 hover:underline"
                      >
                        {selectedDrug.drug?.manufacturer}
                      </button>
                    </p>
                    <p><strong>Batch:</strong> {selectedDrug.batchNo}</p>
                    <p><strong>Quantity:</strong> {selectedDrug.quantity}</p>
                    <p><strong>Location:</strong> {selectedDrug.warehouseLocation}</p>
                    <p><strong>Expiry:</strong> {selectedDrug.drug?.expiryDate}</p>
                    <p><strong>Usage:</strong> {selectedDrug.drug?.usage}</p>
                    <p className="text-xs text-gray-400">{selectedDrug.drug?.description}</p>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm text-blue-300 mb-1">📦 Batch History</h3>
                    <div className="bg-gray-800/50 rounded-lg p-2 text-xs">
                      {selectedDrug.history.map((h, i) => (
                        <div key={i} className="flex justify-between border-b border-gray-700/40 py-1">
                          <span>{h.date}</span>
                          <span>{h.qty}</span>
                          <span>{h.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUPPLIER POPUP */}
      <AnimatePresence>
        {showSupplier && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900/95 border border-gray-700 rounded-xl p-6 w-[90%] sm:w-[380px]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-lg font-bold text-blue-300 mb-2">🏭 Supplier Info</h2>
              <p><strong>Name:</strong> {selectedDrug?.drug?.manufacturer}</p>
              <p><strong>Contact:</strong> support@{selectedDrug?.drug?.manufacturer?.replace(/\s+/g, "").toLowerCase()}.com</p>
              <p><strong>Address:</strong> Sector {Math.ceil(Math.random() * 15)}, Industrial Zone</p>
              <button
                onClick={() => setShowSupplier(false)}
                className="mt-4 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

<<<<<<< HEAD
      {/* ADD INVENTORY MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900/95 border border-gray-700 rounded-xl p-6 w-[90%] sm:w-[500px]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-lg font-bold text-blue-300 mb-4">➕ Add New Inventory</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300">Drug *</label>
                  <select
                    value={formData.drug}
                    onChange={(e) => setFormData({ ...formData, drug: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select a drug</option>
                    {drugs.map((drug) => (
                      <option key={drug._id} value={drug._id}>
                        {drug.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-300">Quantity *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Warehouse Location *</label>
                  <select
                    value={formData.warehouseLocation}
                    onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select location</option>
                    <option value="A-Shelf-1">A-Shelf-1</option>
                    <option value="B-Bay-2">B-Bay-2</option>
                    <option value="C-Rack-3">C-Rack-3</option>
                    <option value="D-Aisle-4">D-Aisle-4</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-300">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    placeholder="Enter batch number"
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddInventory}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                >
                  Add Inventory
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT INVENTORY MODAL */}
      <AnimatePresence>
        {showEditModal && editingItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900/95 border border-gray-700 rounded-xl p-6 w-[90%] sm:w-[500px]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-lg font-bold text-blue-300 mb-4">✏️ Edit Inventory</h2>
              <p className="text-sm text-gray-400 mb-4">Drug: {editingItem.drug?.name}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300">Quantity *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Warehouse Location *</label>
                  <select
                    value={formData.warehouseLocation}
                    onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select location</option>
                    <option value="A-Shelf-1">A-Shelf-1</option>
                    <option value="B-Bay-2">B-Bay-2</option>
                    <option value="C-Rack-3">C-Rack-3</option>
                    <option value="D-Aisle-4">D-Aisle-4</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-300">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateInventory}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                >
                  Update Inventory
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 text-center text-xs text-gray-500">© 2025 MedTrack Analytics • Designed with 💙 for smarter pharma management</div>
    </div>
=======
      <div className="mt-10 text-center text-xs text-gray-500">© 2025 MedTrack Analytics • Designed with 💙 for smarter pharma management</div>
    </motion.div>
>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
  );
}


















<<<<<<< HEAD
=======

{/* // import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useApi } from "../../hooks/useApi";
// import { */}
{/* //   PackageSearch,
//   Boxes,
//   Warehouse,
//   AlertTriangle,
//   CheckCircle2,
//   TrendingUp,
//   TrendingDown,
//   Layers,
//   X,
//   Pencil,
//   RefreshCw,
// } from "lucide-react";

// export default function Inventory() { */}
{/* //   const { request } = useApi();
//   const [inventory, setInventory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState("drug");
//   const [selectedDrug, setSelectedDrug] = useState(null);

//   useEffect(() => { */}
//     fetchInventory();
//   }, []);

//   const fetchInventory = async () => {
//     setLoading(true);
//     try {
//       const res = await request("GET", "/api/admin/inventory");
//       const data = Array.isArray(res) ? res : res.inventory || [];

//       // Fallback mock data with realistic availability
//       if (!data.length) {
//         setInventory([
//           {
//             _id: "1",
//             drug: { name: "Paracetamol", manufacturer: "MediLife", expiryDate: "2026-01-10", price: 15 },
//             batchNo: "B001",
//             quantity: 45,
//             warehouseLocation: "Warehouse A",
//           },
//           {
//             _id: "2",
//             drug: { name: "Amoxicillin", manufacturer: "PharmaCure", expiryDate: "2025-08-20", price: 30 },
//             batchNo: "B002",
//             quantity: 12,
//             warehouseLocation: "Warehouse B",
//           },
//           {
//             _id: "3",
//             drug: { name: "Cetrizine", manufacturer: "HealthCorp", expiryDate: "2025-03-15", price: 10 },
//             batchNo: "B003",
//             quantity: 0,
//             warehouseLocation: "Warehouse C",
//           },
//           {
//             _id: "4",
//             drug: { name: "Ibuprofen", manufacturer: "MediCare", expiryDate: "2026-05-30", price: 20 },
//             batchNo: "B004",
//             quantity: 70,
//             warehouseLocation: "Warehouse D",
//           },
//           {
//             _id: "5",
//             drug: { name: "Azithromycin", manufacturer: "HealWell", expiryDate: "2025-09-12", price: 40 },
//             batchNo: "B005",
//             quantity: 18,
//             warehouseLocation: "Warehouse A",
//           },
//         ]);
//       } else {
//         setInventory(data);
//       }
//     } catch (err) {
//       console.error("Error fetching inventory:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredInventory = inventory
//     .filter((item) =>
//       item.drug?.name?.toLowerCase().includes(search.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (sortBy === "quantity") return b.quantity - a.quantity;
//       if (sortBy === "drug") return a.drug?.name?.localeCompare(b.drug?.name);
//       return 0;
//     });

//   const totalItems = inventory.length;
//   const lowStockCount = inventory.filter((i) => i.quantity < 20 && i.quantity > 0).length;
//   const outOfStockCount = inventory.filter((i) => i.quantity === 0).length;
//   const inStockCount = totalItems - lowStockCount - outOfStockCount;
//   const totalQuantity = inventory.reduce((sum, i) => sum + i.quantity, 0);
//   const totalBatches = new Set(inventory.map((i) => i.batchNo)).size;

//   // Calculate percentage for chart
//   const percent = (value) => ((value / totalItems) * 100).toFixed(1);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0a0f24] to-[#111b3a] text-gray-200 p-6">
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.7 }}
//         className="max-w-7xl mx-auto space-y-8"
//       >
//         {/* HEADER */}
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-white flex items-center gap-2">
//               <PackageSearch className="text-purple-400" size={28} /> Inventory Dashboard
//             </h1>
//             <p className="text-gray-400 text-sm">Track and manage drug inventory efficiently</p>
//           </div>
//           <div className="flex items-center gap-3">
//             <input
//               type="text"
//               placeholder="Search drug..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="bg-[#1a2342]/60 border border-[#3b4a73] text-gray-200 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
//             />
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="bg-[#1a2342]/60 border border-[#3b4a73] text-gray-200 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400"
//             >
//               <option value="drug">Sort by Drug</option>
//               <option value="quantity">Sort by Quantity</option>
//             </select>
//             <button
//               onClick={fetchInventory}
//               className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-xl text-white hover:shadow-[0_0_15px_#7e3ff2] transition-all"
//             >
//               <RefreshCw size={18} /> Refresh
//             </button>
//           </div>
//         </div>

//         {/* SUMMARY CARDS */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
//           <SummaryCard title="Total Drugs" value={totalItems} color="purple" icon={<PackageSearch size={22} />} />
//           <SummaryCard title="Total Quantity" value={totalQuantity} color="emerald" icon={<Boxes size={22} />} />
//           <SummaryCard title="Total Batches" value={totalBatches} color="blue" icon={<Layers size={22} />} />
//           <SummaryCard title="Low Stock" value={lowStockCount} color="red" icon={<AlertTriangle size={22} />} />
//         </div>

//         {/* STOCK CHART */}
//         <motion.div
//           className="bg-[#1b2240]/70 border border-[#2e3a68] rounded-2xl shadow-lg p-6 flex flex-col md:flex-row justify-around items-center gap-6"
//           whileHover={{ scale: 1.01 }}
//         >
//           <div className="relative w-48 h-48">
//             <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
//               <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2b355d" strokeWidth="3.8" />
//               <circle
//                 cx="18" cy="18" r="15.915"
//                 fill="none"
//                 stroke="#10b981"
//                 strokeWidth="3.8"
//                 strokeDasharray={`${percent(inStockCount)}, 100`}
//                 strokeLinecap="round"
//               />
//               <circle
//                 cx="18" cy="18" r="15.915"
//                 fill="none"
//                 stroke="#facc15"
//                 strokeWidth="3.8"
//                 strokeDasharray={`${percent(lowStockCount)}, 100`}
//                 strokeDashoffset={-percent(inStockCount)}
//                 strokeLinecap="round"
//               />
//               <circle
//                 cx="18" cy="18" r="15.915"
//                 fill="none"
//                 stroke="#ef4444"
//                 strokeWidth="3.8"
//                 strokeDasharray={`${percent(outOfStockCount)}, 100`}
//                 strokeDashoffset={-(percent(inStockCount) + percent(lowStockCount))}
//                 strokeLinecap="round"
//               />
//             </svg>
//             <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
//               Stock
//             </div>
//           </div>

//           <div className="space-y-2 text-gray-300 text-sm">
//             <p><span className="inline-block w-3 h-3 bg-emerald-400 mr-2 rounded-full"></span>In Stock: {percent(inStockCount)}%</p>
//             <p><span className="inline-block w-3 h-3 bg-yellow-400 mr-2 rounded-full"></span>Low Stock: {percent(lowStockCount)}%</p>
//             <p><span className="inline-block w-3 h-3 bg-red-400 mr-2 rounded-full"></span>Out of Stock: {percent(outOfStockCount)}%</p>
//           </div>
//         </motion.div>

//         {/* INVENTORY TABLE */}
//         <div className="bg-[#1b2240]/70 border border-[#2e3a68] rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden">
//           {loading ? (
//             <div className="text-center py-16 text-gray-400 text-lg">Loading inventory...</div>
//           ) : (
//             <table className="w-full text-left">
//               <thead className="bg-[#232b4d]/80">
//                 <tr>
//                   <th className="px-6 py-4 text-gray-300 font-semibold">Drug</th>
//                   <th className="px-6 py-4 text-gray-300 font-semibold">Batch</th>
//                   <th className="px-6 py-4 text-gray-300 font-semibold">Quantity</th>
//                   <th className="px-6 py-4 text-gray-300 font-semibold">Location</th>
//                   <th className="px-6 py-4 text-gray-300 font-semibold">Status</th>
//                   <th className="px-6 py-4 text-gray-300 font-semibold text-center">Actions</th>
//                 </tr>
//               </thead>

//               <motion.tbody
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.6 }}
//               >
//                 {filteredInventory.map((item) => {
//                   const status =
//                     item.quantity === 0
//                       ? "Out of Stock"
//                       : item.quantity < 20
//                       ? "Low Stock"
//                       : "In Stock";

//                   const statusColor =
//                     status === "In Stock"
//                       ? "emerald"
//                       : status === "Low Stock"
//                       ? "yellow"
//                       : "red";

//                   return (
//                     <motion.tr
//                       key={item._id}
//                       className="border-t border-[#2e3a68]/60 hover:bg-[#262f58]/60 transition-all cursor-pointer"
//                       whileHover={{ scale: 1.01 }}
//                     >
//                       <td className="px-6 py-4 font-medium text-gray-100 flex items-center gap-2">
//                         <img
//                           src={`https://source.unsplash.com/40x40/?medicine,pharmacy,${item.drug?.name}`}
//                           alt={item.drug?.name}
//                           className="w-8 h-8 rounded-full border border-gray-600"
//                         />
//                         {item.drug?.name || "Unknown"}
//                       </td>
//                       <td className="px-6 py-4 text-gray-300">{item.batchNo}</td>
//                       <td className="px-6 py-4 text-gray-300">{item.quantity}</td>
//                       <td className="px-6 py-4 text-gray-300">{item.warehouseLocation}</td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`flex items-center gap-1 text-${statusColor}-400 bg-${statusColor}-400/10 px-3 py-1 rounded-full text-sm`}
//                         >
//                           {status === "In Stock" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
//                           {status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-center">
//                         <button
//                           onClick={() => setSelectedDrug(item)}
//                           className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-[0_0_15px_#7e3ff2] transition-all"
//                         >
//                           <Pencil size={16} />
//                         </button>
//                       </td>
//                     </motion.tr>
//                   );
//                 })}
//               </motion.tbody>
//             </table>
//           )}
//         </div>
//       </motion.div>

//       {/* MODAL */}
//       <AnimatePresence>
//         {selectedDrug && (
//           <motion.div
//             className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="bg-[#1b2240] border border-[#2e3a68] rounded-2xl p-6 max-w-md w-full shadow-xl text-gray-200 relative"
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//             >
//               <button
//                 className="absolute top-3 right-3 text-gray-400 hover:text-gray-100"
//                 onClick={() => setSelectedDrug(null)}
//               >
//                 <X size={20} />
//               </button>

//               <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
//                 <img
//                   src={`https://source.unsplash.com/60x60/?pharmacy,${selectedDrug.drug?.name}`}
//                   alt={selectedDrug.drug?.name}
//                   className="w-10 h-10 rounded-lg"
//                 />
//                 {selectedDrug.drug?.name}
//               </h2>

//               <div className="space-y-3 text-gray-300">
//                 <p><strong>Batch:</strong> {selectedDrug.batchNo}</p>
//                 <p><strong>Location:</strong> {selectedDrug.warehouseLocation}</p>
//                 <p><strong>Manufacturer:</strong> {selectedDrug.drug?.manufacturer}</p>
//                 <p><strong>Expiry:</strong> {selectedDrug.drug?.expiryDate}</p>
//                 <p><strong>Price:</strong> ₹{selectedDrug.drug?.price}</p>
//                 <p><strong>Quantity:</strong> {selectedDrug.quantity}</p>
//               </div>

//               <div className="mt-6 flex justify-end gap-3">
//                 <button
//                   onClick={() => setSelectedDrug(null)}
//                   className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white"
//                 >
//                   Close
//                 </button>
//                 <button
//                   className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-[0_0_15px_#7e3ff2] rounded-xl text-white"
//                 >
//                   Reorder
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ✅ Summary Card Component
// function SummaryCard({ title, value, color, icon }) {
//   const colorMap = {
//     purple: "from-purple-600/30 to-purple-800/30 shadow-purple-500/30",
//     emerald: "from-emerald-600/30 to-emerald-800/30 shadow-emerald-500/30",
//     blue: "from-blue-600/30 to-blue-800/30 shadow-blue-500/30",
//     red: "from-red-600/30 to-red-800/30 shadow-red-500/30",
//   };
//   return (
//     <motion.div
//       whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}
//       className={`rounded-2xl p-5 bg-gradient-to-br ${colorMap[color]} border border-[#2e3a68]/70 backdrop-blur-lg transition-all`}
//     >
//       <div className="flex justify-between items-center mb-3">
//         <div className="text-gray-300 font-semibold">{title}</div>
//         {icon}
//       </div>
//       <div className="text-3xl font-bold text-white">{value}</div>
//     </motion.div>
//   );
// }


>>>>>>> 0464a212fb812c4d9a10b17460a276d925d13584
