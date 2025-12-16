import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  TrendingUp,
  Building2
} from "lucide-react";
import axios from "axios";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchSuppliers();
    fetchStats();
  }, [statusFilter, currentPage]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url = statusFilter === "all" 
        ? `http://localhost:5000/api/admin/suppliers?page=${currentPage}&limit=${itemsPerPage}`
        : `http://localhost:5000/api/admin/suppliers?status=${statusFilter}&page=${currentPage}&limit=${itemsPerPage}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuppliers(response.data.data.suppliers || []);
      setTotalPages(response.data.data.pagination?.totalPages || 1);
      setTotalItems(response.data.data.pagination?.totalItems || 0);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/admin/suppliers/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "text-emerald-400 bg-emerald-500/10";
      case "pending": return "text-amber-400 bg-amber-500/10";
      case "rejected": return "text-rose-400 bg-rose-500/10";
      default: return "text-slate-400 bg-slate-500/10";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.4)]"
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Suppliers
            </h1>
            <p className="text-sm text-white/50 flex items-center gap-2 mt-1">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-emerald-400 rounded-full"
              />
              Live Monitoring • Real-time sync • Smart analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchSuppliers}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 backdrop-blur-xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-white/70" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-semibold flex items-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all"
          >
            <Download className="w-5 h-5" />
            Export
          </motion.button>
        </div>
      </motion.div>

      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10"
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/70">Status: <span className="text-emerald-400 font-semibold">Active</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Clock className="w-4 h-4" />
            Last Update: <span className="text-white font-medium">{lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Priority: <span className="text-white font-medium">{stats.pending} Pending</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 text-sm text-white/70"
          >
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            {filteredSuppliers.length} Active Suppliers
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: "Approved", 
            value: stats.approved, 
            gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
            border: "border-emerald-500/30",
            icon: <CheckCircle className="w-8 h-8" />,
            iconBg: "from-emerald-500 to-teal-500",
            trend: "+12%",
            chart: [40, 45, 42, 48, 50, 52, 55]
          },
          { 
            label: "Pending", 
            value: stats.pending, 
            gradient: "from-amber-500/20 via-orange-500/20 to-yellow-500/20",
            border: "border-amber-500/30",
            icon: <Clock className="w-8 h-8" />,
            iconBg: "from-amber-500 to-orange-500",
            trend: "+8%",
            chart: [30, 32, 35, 33, 36, 38, 40]
          },
          { 
            label: "Rejected", 
            value: stats.rejected, 
            gradient: "from-rose-500/20 via-pink-500/20 to-red-500/20",
            border: "border-rose-500/30",
            icon: <XCircle className="w-8 h-8" />,
            iconBg: "from-rose-500 to-pink-500",
            trend: "+5%",
            chart: [15, 14, 16, 15, 17, 16, 18]
          },
          { 
            label: "Total Suppliers", 
            value: stats.total, 
            gradient: "from-indigo-500/20 via-purple-500/20 to-pink-500/20",
            border: "border-indigo-500/30",
            icon: <Building2 className="w-8 h-8" />,
            iconBg: "from-indigo-500 to-purple-500",
            trend: "+15%",
            chart: [85, 88, 92, 90, 95, 98, 100]
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} backdrop-blur-xl rounded-3xl p-6 border ${stat.border} shadow-[0_8px_40px_rgba(0,0,0,0.3)] group`}
          >
            {/* Animated background */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"
            />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                  className={`w-14 h-14 bg-gradient-to-br ${stat.iconBg} rounded-2xl flex items-center justify-center text-white shadow-lg`}
                >
                  {stat.icon}
                </motion.div>
                <div className="text-right">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                    className="text-4xl font-bold text-white mb-1"
                  >
                    {stat.value}
                  </motion.div>
                  <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend} vs last week
                  </div>
                </div>
              </div>
              
              <p className="text-white/60 font-medium mb-3">{stat.label}</p>
              
              {/* Mini chart */}
              <div className="flex items-end gap-1 h-8">
                {stat.chart.map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1 + i * 0.05 + 0.3, duration: 0.5 }}
                    className={`flex-1 bg-gradient-to-t ${stat.iconBg} rounded-t opacity-40 group-hover:opacity-70 transition-opacity`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.3)]"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search suppliers by name, email, or contact person..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 text-white placeholder-white/30 pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 text-white px-6 py-4 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none cursor-pointer backdrop-blur-xl"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 rounded-xl font-semibold shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Supplier
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Suppliers Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
            />
            <p className="mt-4 text-white/50">Loading suppliers...</p>
          </motion.div>
        ) : filteredSuppliers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10"
          >
            <Users className="w-20 h-20 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-lg">No suppliers found</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSuppliers.map((supplier, index) => (
              <motion.div
                key={supplier._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.3)] hover:border-indigo-500/30 transition-all"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-lg group-hover:shadow-indigo-500/50 transition-all">
                        {supplier.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{supplier.name}</h3>
                        <p className="text-sm text-white/50">{supplier.contactPerson || 'No contact person'}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-white/10 rounded-xl transition-all"
                    >
                      <MoreVertical className="w-5 h-5 text-white/60" />
                    </motion.button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-white/70 group/item hover:text-white transition-colors">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm">{supplier.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70 group/item hover:text-white transition-colors">
                      <Phone className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm">{supplier.phone || 'No phone provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70 group/item hover:text-white transition-colors">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm truncate">{supplier.address || 'No address provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(supplier.status)}`}>
                      {getStatusIcon(supplier.status)}
                      {supplier.status?.toUpperCase()}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      View Details →
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && filteredSuppliers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-medium transition-all"
          >
            ← Previous
          </motion.button>
          
          <div className="px-6 py-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl border border-indigo-500/30">
            <span className="font-semibold">Page {currentPage} of {totalPages}</span>
            <span className="text-white/50 text-sm ml-2">({totalItems} total)</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-medium transition-all"
          >
            Next →
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}