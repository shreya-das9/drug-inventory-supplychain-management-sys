import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../../hooks/useApi";
import { 
  Truck, 
  Plus, 
  Search,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  RefreshCw,
  TrendingUp,
  Navigation
} from "lucide-react";

export default function Shipments() {
  const { request, loading } = useApi();
  
  const [shipments, setShipments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;
  const [stats, setStats] = useState({
    totalShipments: 0,
    pending: 0,
    in_transit: 0,
    delivered: 0,
    totalValue: 0,
    delayedShipments: 0
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchShipments();
    fetchStats();
  }, [statusFilter, currentPage, searchQuery]);

  const fetchShipments = async () => {
    try {
      let url = `/api/admin/shipments?page=${currentPage}&limit=${itemsPerPage}`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      
      const response = await request("GET", url);
      
      if (response?.success || response?.data) {
        const data = response.data || response;
        setShipments(data.shipments || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await request("GET", "/api/admin/shipments/stats");
      if (response?.success || response?.data) {
        setStats(response.data || response);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      delivered: {
        color: "text-emerald-400 bg-emerald-500/10",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Delivered"
      },
      "in-transit": {
        color: "text-blue-400 bg-blue-500/10",
        icon: <Truck className="w-4 h-4" />,
        label: "In Transit"
      },
      in_transit: {
        color: "text-blue-400 bg-blue-500/10",
        icon: <Truck className="w-4 h-4" />,
        label: "In Transit"
      },
      shipped: {
        color: "text-cyan-400 bg-cyan-500/10",
        icon: <Package className="w-4 h-4" />,
        label: "Shipped"
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

  const filteredShipments = shipments.filter(shipment =>
    shipment.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
              x: [0, 10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.4)]"
          >
            <Truck className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Shipments
            </h1>
            <p className="text-sm text-white/50 flex items-center gap-2 mt-1">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-cyan-400 rounded-full"
              />
              Live Tracking • Real-time updates • Route optimization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchShipments}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 backdrop-blur-xl transition-all"
          >
            <RefreshCw className="w-5 h-5 text-white/70" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-semibold flex items-center gap-2 shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all"
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
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/70">Status: <span className="text-cyan-400 font-semibold">Active</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Clock className="w-4 h-4" />
            Last Update: <span className="text-white font-medium">{lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Navigation className="w-4 h-4 text-blue-400" />
            In Transit: <span className="text-white font-medium">{stats.inTransit || 0} Shipments</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 text-sm text-white/70"
          >
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
            {filteredShipments.length} Active Shipments
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { 
            label: "Total Shipments", 
            value: stats.total, 
            gradient: "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
            border: "border-blue-500/30",
            icon: <Package className="w-7 h-7" />,
            iconBg: "from-blue-500 to-cyan-500",
            trend: "+10%",
            chart: [70, 75, 72, 78, 80, 82, 85]
          },
          { 
            label: "Pending", 
            value: stats.pending || 0, 
            gradient: "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
            border: "border-orange-500/30",
            icon: <Clock className="w-7 h-7" />,
            iconBg: "from-orange-500 to-amber-500",
            trend: "+8%",
            chart: [20, 22, 25, 23, 26, 28, 30]
          },
          { 
            label: "In Transit", 
            value: stats.inTransit || 0, 
            gradient: "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
            border: "border-blue-500/30",
            icon: <Truck className="w-7 h-7" />,
            iconBg: "from-blue-500 to-indigo-500",
            trend: "+12%",
            chart: [40, 42, 45, 43, 47, 50, 52]
          },
          { 
            label: "Delivered", 
            value: stats.delivered || 0, 
            gradient: "from-emerald-500/20 via-teal-500/20 to-green-500/20",
            border: "border-emerald-500/30",
            icon: <CheckCircle className="w-7 h-7" />,
            iconBg: "from-emerald-500 to-teal-500",
            trend: "+18%",
            chart: [60, 65, 68, 70, 75, 78, 80]
          },
          { 
            label: "Total Value", 
            value: `₹${stats.totalValue?.toLocaleString() || 0}`, 
            gradient: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
            border: "border-purple-500/30",
            icon: <span className="w-7 h-7 text-2xl">₹</span>,
            iconBg: "from-purple-500 to-pink-500",
            trend: "+22%",
            chart: [100, 110, 115, 120, 130, 140, 150]
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} backdrop-blur-xl rounded-3xl p-5 border ${stat.border} shadow-[0_8px_40px_rgba(0,0,0,0.3)] group`}
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
              <div className="flex items-start justify-between mb-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                  className={`w-12 h-12 bg-gradient-to-br ${stat.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}
                >
                  {stat.icon}
                </motion.div>
                <div className="text-right">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                    className="text-3xl font-bold text-white mb-1"
                  >
                    {stat.value}
                  </motion.div>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </div>
                </div>
              </div>
              
              <p className="text-white/60 font-medium text-sm mb-2">{stat.label}</p>
              
              {/* Mini chart */}
              <div className="flex items-end gap-1 h-6">
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
              placeholder="Search by tracking number or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 text-white placeholder-white/30 pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 text-white px-6 py-4 rounded-xl border border-white/10 focus:border-cyan-500/50 focus:outline-none cursor-pointer backdrop-blur-xl"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 rounded-xl font-semibold shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] transition-all"
            >
              <Plus className="w-5 h-5" />
              New Shipment
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Shipments Grid */}
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
              className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
            />
            <p className="mt-4 text-white/50">Loading shipments...</p>
          </motion.div>
        ) : filteredShipments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10"
          >
            <Truck className="w-20 h-20 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-lg">No shipments found</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShipments.map((shipment, index) => {
              const statusConfig = getStatusConfig(shipment.status);
              return (
                <motion.div
                  key={shipment._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.3)] hover:border-cyan-500/30 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-blue-500/0 to-teal-500/0 group-hover:from-cyan-500/5 group-hover:via-blue-500/5 group-hover:to-teal-500/5 transition-all duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          animate={{ 
                            x: [0, 3, 0],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.1
                          }}
                          className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
                        >
                          <Truck className="w-7 h-7 text-white" />
                        </motion.div>
                        <div>
                          <p className="font-bold text-white text-lg">{shipment.trackingNumber}</p>
                          <p className="text-xs text-white/50">{shipment.supplier?.name}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm truncate">{shipment.destination?.city}, {shipment.destination?.state}</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm">Expected: {formatDate(shipment.expectedDeliveryDate)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-lg text-emerald-400">₹</span>
                          <span className="font-bold text-white text-lg">₹{shipment.totalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Package className="w-4 h-4 text-cyan-400" />
                          <span>{shipment.items?.length} items</span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full mt-4 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 rounded-xl text-sm font-medium text-cyan-400 border border-cyan-500/20 transition-all"
                    >
                      Track Shipment →
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && filteredShipments.length > 0 && (
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
          
          <div className="px-6 py-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl border border-cyan-500/30">
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