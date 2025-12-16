import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Search,
  ShoppingBag,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Download,
  RefreshCw,
  TrendingUp,
  Zap,
  ArrowUpRight
} from "lucide-react";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    totalValue: 0
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [statusFilter, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url = statusFilter === "all" 
        ? `http://localhost:5000/api/admin/orders?page=${currentPage}&limit=${itemsPerPage}`
        : `http://localhost:5000/api/admin/orders?status=${statusFilter}&page=${currentPage}&limit=${itemsPerPage}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(response.data.data?.orders || []);
      setTotalPages(response.data.data?.pagination?.totalPages || 1);
      setTotalItems(response.data.data?.pagination?.totalItems || 0);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/admin/orders/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        color: "text-emerald-400 bg-emerald-500/10",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Completed"
      },
      approved: {
        color: "text-blue-400 bg-blue-500/10",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Approved"
      },
      processing: {
        color: "text-amber-400 bg-amber-500/10",
        icon: <Package className="w-4 h-4" />,
        label: "Processing"
      },
      pending: {
        color: "text-orange-400 bg-orange-500/10",
        icon: <Clock className="w-4 h-4" />,
        label: "Pending"
      },
      cancelled: {
        color: "text-rose-400 bg-rose-500/10",
        icon: <XCircle className="w-4 h-4" />,
        label: "Cancelled"
      }
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
              rotate: [0, 10, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(167,139,250,0.4)]"
          >
            <FileText className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Orders
            </h1>
            <p className="text-sm text-white/50 flex items-center gap-2 mt-1">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-violet-400 rounded-full"
              />
              Live Updates • Order tracking • Automated processing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchOrders}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 backdrop-blur-xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-white/70" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl font-semibold flex items-center gap-2 shadow-[0_0_30px_rgba(167,139,250,0.3)] transition-all"
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
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/70">Status: <span className="text-violet-400 font-semibold">Active</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Clock className="w-4 h-4" />
            Last Update: <span className="text-white font-medium">{lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Zap className="w-4 h-4 text-violet-400" />
            Processing: <span className="text-white font-medium">{stats.processing || 0} Orders</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 text-sm text-white/70"
          >
            <div className="w-2 h-2 bg-violet-400 rounded-full" />
            {filteredOrders.length} Active Orders
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { 
            label: "Total", 
            value: stats.total || 0, 
            gradient: "from-violet-500/20 via-purple-500/20 to-fuchsia-500/20",
            border: "border-violet-500/30",
            icon: <FileText className="w-6 h-6" />,
            iconBg: "from-violet-500 to-purple-500",
            trend: "+15%",
            chart: [85, 88, 90, 92, 95, 98, 100]
          },
          { 
            label: "Pending", 
            value: stats.pending || 0, 
            gradient: "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
            border: "border-orange-500/30",
            icon: <Clock className="w-6 h-6" />,
            iconBg: "from-orange-500 to-amber-500",
            trend: "+8%",
            chart: [20, 22, 24, 23, 26, 28, 30]
          },
          { 
            label: "Approved", 
            value: stats.approved || 0, 
            gradient: "from-blue-500/20 via-indigo-500/20 to-cyan-500/20",
            border: "border-blue-500/30",
            icon: <CheckCircle className="w-6 h-6" />,
            iconBg: "from-blue-500 to-indigo-500",
            trend: "+12%",
            chart: [40, 42, 45, 47, 50, 52, 55]
          },
          { 
            label: "Processing", 
            value: stats.processing || 0, 
            gradient: "from-amber-500/20 via-yellow-500/20 to-orange-500/20",
            border: "border-amber-500/30",
            icon: <Package className="w-6 h-6" />,
            iconBg: "from-amber-500 to-yellow-500",
            trend: "+10%",
            chart: [30, 32, 35, 37, 40, 42, 45]
          },
          { 
            label: "Completed", 
            value: stats.completed || 0, 
            gradient: "from-emerald-500/20 via-teal-500/20 to-green-500/20",
            border: "border-emerald-500/30",
            icon: <CheckCircle className="w-6 h-6" />,
            iconBg: "from-emerald-500 to-teal-500",
            trend: "+20%",
            chart: [70, 75, 78, 80, 85, 88, 90]
          },
          { 
            label: "Cancelled", 
            value: stats.cancelled || 0, 
            gradient: "from-rose-500/20 via-pink-500/20 to-red-500/20",
            border: "border-rose-500/30",
            icon: <XCircle className="w-6 h-6" />,
            iconBg: "from-rose-500 to-pink-500",
            trend: "-5%",
            chart: [10, 9, 8, 7, 6, 5, 4]
          },
          { 
            label: "Total Value", 
            value: `$${stats.totalValue?.toLocaleString() || 0}`, 
            gradient: "from-purple-500/20 via-fuchsia-500/20 to-pink-500/20",
            border: "border-purple-500/30",
            icon: <DollarSign className="w-6 h-6" />,
            iconBg: "from-purple-500 to-fuchsia-500",
            trend: "+25%",
            chart: [100, 110, 120, 130, 140, 150, 160]
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} backdrop-blur-xl rounded-2xl p-4 border ${stat.border} shadow-[0_8px_40px_rgba(0,0,0,0.3)] group`}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"
            />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-2">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                  className={`w-10 h-10 bg-gradient-to-br ${stat.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}
                >
                  {stat.icon}
                </motion.div>
                <div className="text-right">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.08 + 0.4, type: "spring" }}
                    className="text-2xl font-bold text-white mb-0.5"
                  >
                    {stat.value}
                  </motion.div>
                  <div className={`flex items-center gap-1 ${stat.trend.startsWith('-') ? 'text-rose-400' : 'text-emerald-400'} text-xs font-medium`}>
                    <TrendingUp className={`w-3 h-3 ${stat.trend.startsWith('-') ? 'rotate-180' : ''}`} />
                    {stat.trend}
                  </div>
                </div>
              </div>
              
              <p className="text-white/60 font-medium text-xs mb-2">{stat.label}</p>
              
              {/* Mini chart */}
              <div className="flex items-end gap-0.5 h-5">
                {stat.chart.map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.08 + i * 0.04 + 0.3, duration: 0.5 }}
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
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.3)]"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search by order number or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 text-white placeholder-white/30 pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 text-white px-6 py-4 rounded-xl border border-white/10 focus:border-violet-500/50 focus:outline-none cursor-pointer backdrop-blur-xl"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 rounded-xl font-semibold shadow-[0_0_30px_rgba(167,139,250,0.3)] hover:shadow-[0_0_50px_rgba(167,139,250,0.5)] transition-all"
            >
              <Plus className="w-5 h-5" />
              New Order
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
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
              className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full"
            />
            <p className="mt-4 text-white/50">Loading orders...</p>
          </motion.div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10"
          >
            <FileText className="w-20 h-20 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-lg">No orders found</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Order Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((order, index) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-violet-500/50 transition-all">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm">{order.orderNumber}</p>
                              <p className="text-xs text-white/50">Order ID</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-violet-400" />
                            <span className="text-white/80 text-sm">{order.supplier?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-white/70">
                            <ShoppingBag className="w-4 h-4 text-violet-400" />
                            <span className="text-sm">{order.items?.length || 0} items</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-white text-sm">${order.totalAmount?.toLocaleString() || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Calendar className="w-4 h-4 text-violet-400" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all group/btn"
                          >
                            <ArrowUpRight className="w-5 h-5 text-white/60 group-hover/btn:text-violet-400 transition-colors" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && filteredOrders.length > 0 && (
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
          
          <div className="px-6 py-3 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-xl border border-violet-500/30">
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