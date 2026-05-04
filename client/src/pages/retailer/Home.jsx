import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  Truck,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock3,
  CheckCircle,
  RefreshCw,
  Bell,
  ArrowRight,
  Filter,
  MoreVertical,
  Eye,
  Download,
  LogOut,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";

// Add style for dropdown options
const dropdownStyles = `
  select {
    background-color: #1e3a5f !important;
    background-image: none !important;
  }
  select option {
    background-color: #1e3a5f;
    color: white;
    padding: 8px;
  }
  select option:checked {
    background: linear-gradient(#1e3a5f, #1e3a5f) !important;
    background-color: #1e3a5f !important;
  }
  select option:hover {
    background-color: #2a5a8f;
  }
`;

// Mock data for retailer orders
const mockOrders = [
  { _id: "1", orderNumber: "ORD-2401", purchaseOrderNumber: "PO-2401", status: "Delivered", totalAmount: 450.50, date: "2026-02-20" },
  { _id: "2", orderNumber: "ORD-2402", purchaseOrderNumber: "PO-2402", status: "Shipped", totalAmount: 320.75, date: "2026-02-21" },
  { _id: "3", orderNumber: "ORD-2403", purchaseOrderNumber: "PO-2403", status: "Pending", totalAmount: 185.00, date: "2026-02-22" },
  { _id: "4", orderNumber: "ORD-2404", purchaseOrderNumber: "PO-2404", status: "Confirmed", totalAmount: 520.25, date: "2026-02-23" },
  { _id: "5", orderNumber: "ORD-2405", purchaseOrderNumber: "PO-2405", status: "Delivered", totalAmount: 410.00, date: "2026-02-24" },
  { _id: "6", orderNumber: "ORD-2406", purchaseOrderNumber: "PO-2406", status: "Processing", totalAmount: 290.50, date: "2026-02-25" },
];

const mockShipments = [
  { _id: "1", trackingNumber: "TRK-98231", status: "shipped", isDelayed: false, eta: "Today" },
  { _id: "2", trackingNumber: "TRK-98232", status: "delivered", isDelayed: false, eta: "Yesterday" },
  { _id: "3", trackingNumber: "TRK-98233", status: "shipped", isDelayed: true, eta: "Tomorrow" },
];

const statusColors = {
  Pending: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  Confirmed: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  Processing: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  Shipped: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  Delivered: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  Cancelled: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

export default function RetailerHome() {
  const navigate = useNavigate();
  const { request } = useApi();
  const [orders, setOrders] = React.useState([]);
  const [shipments, setShipments] = React.useState([]);
  const [stats, setStats] = React.useState(null);
  const [pageLoading, setPageLoading] = React.useState(true);
  const [searchText, setSearchText] = React.useState("");
  const [showAlerts, setShowAlerts] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [showAllOrders, setShowAllOrders] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchData = React.useCallback(async () => {
    try {
      setPageLoading(true);
      // Use mock data for now since retailer endpoints are not yet available
      setOrders(mockOrders);
      setShipments(mockShipments);
      setStats({
        totalOrders: mockOrders.length,
        pendingOrders: mockOrders.filter(o => o.status === "Pending").length,
      });
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching retailer dashboard data:", err);
    } finally {
      setPageLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredOrders = React.useMemo(() => {
    let filtered = orders;

    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    const query = searchText.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((order) =>
        [order.orderNumber, order.purchaseOrderNumber].some((value) =>
          String(value || "").toLowerCase().includes(query)
        )
      );
    }

    return filtered;
  }, [orders, searchText, statusFilter]);

  const visibleOrders = showAllOrders ? filteredOrders : filteredOrders.slice(0, 5);

  const orderStats = React.useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "Pending").length;
    const shipped = orders.filter((o) => o.status === "Shipped").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const cancelled = orders.filter((o) => o.status === "Cancelled").length;

    return { total, pending, shipped, delivered, cancelled };
  }, [orders]);

  const shipmentStats = React.useMemo(() => {
    const total = shipments.length;
    const inTransit = shipments.filter((s) => s.status === "shipped").length;
    const delivered = shipments.filter((s) => s.status === "delivered").length;
    const delayed = shipments.filter((s) => s.isDelayed).length;

    return { total, inTransit, delivered, delayed };
  }, [shipments]);

  const statCards = [
    {
      label: "Total Orders",
      value: orderStats.total,
      trend: "+12%",
      trendUp: true,
      icon: <ShoppingCart className="w-6 h-6" />,
      gradient: "from-violet-500/20 to-purple-500/20",
      border: "border-violet-500/30",
      iconBg: "from-violet-500 to-purple-500",
    },
    {
      label: "Pending Orders",
      value: orderStats.pending,
      trend: "-3%",
      trendUp: false,
      icon: <Clock3 className="w-6 h-6" />,
      gradient: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-500/30",
      iconBg: "from-amber-500 to-orange-500",
    },
    {
      label: "Shipments",
      value: shipmentStats.total,
      trend: "+8%",
      trendUp: true,
      icon: <Truck className="w-6 h-6" />,
      gradient: "from-cyan-500/20 to-blue-500/20",
      border: "border-cyan-500/30",
      iconBg: "from-cyan-500 to-blue-500",
    },
    {
      label: "Delivered",
      value: shipmentStats.delivered,
      trend: "+15%",
      trendUp: true,
      icon: <CheckCircle className="w-6 h-6" />,
      gradient: "from-emerald-500/20 to-green-500/20",
      border: "border-emerald-500/30",
      iconBg: "from-emerald-500 to-green-500",
    },
  ];

  const alerts = [
    { id: 1, message: "3 orders pending approval", type: "warning", icon: "⚠️" },
    { id: 2, message: "Shipment TRK-98231 delayed by 2 hours", type: "alert", icon: "🚨" },
    { id: 3, message: "2 orders delivered today", type: "success", icon: "✅" },
  ];

  return (
    <>
      <style>{dropdownStyles}</style>
      <div className="min-h-screen p-6 md:p-8 bg-gradient-to-br from-slate-950 via-[#0b1732] to-[#070d1f] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ x: [0, 8, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-[0_0_35px_rgba(139,92,246,0.4)]"
            >
              <ShoppingCart className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                Retailer Dashboard
              </h1>
              <p className="text-white/60 text-sm mt-1">Orders • Shipments • Performance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            >
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition shadow-[0_0_25px_rgba(220,38,38,0.35)] inline-flex items-center gap-2 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Alerts Modal */}
        <AnimatePresence>
          {showAlerts && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-white/10 rounded-2xl p-4 space-y-2"
            >
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <span className="text-xl">{alert.icon}</span>
                  <span className="text-sm text-white/80">{alert.message}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-2xl p-6 backdrop-blur-xl`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">{card.label}</p>
                  <p className="text-4xl font-bold text-white">{card.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.iconBg} flex items-center justify-center text-white/80`}
                >
                  {card.icon}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {card.trendUp ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    card.trendUp ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {card.trend}
                </span>
                <span className="text-white/40 text-sm">vs last month</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-gradient-to-br from-slate-900/40 to-slate-800/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5" />
                Recent Orders
              </h2>
              <button
                onClick={() => setShowAllOrders(!showAllOrders)}
                className="text-violet-400 hover:text-violet-300 text-sm font-semibold flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Orders Table */}
            <div className="space-y-2">
              {pageLoading ? (
                <div className="py-8 text-center text-white/40">Loading orders...</div>
              ) : visibleOrders.length === 0 ? (
                <div className="py-8 text-center text-white/40">No orders found</div>
              ) : (
                visibleOrders.map((order, idx) => (
                  <motion.div
                    key={order._id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-white">{order.orderNumber}</p>
                      <p className="text-sm text-white/60">{order.purchaseOrderNumber}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                      <div>
                        <p className="text-sm text-white/80 font-medium">
                          {order.totalAmount ? `₹${order.totalAmount.toFixed(2)}` : "N/A"}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                          statusColors[order.status] ||
                          statusColors["Pending"]
                        }`}
                      >
                        {order.status}
                      </div>
                    </div>
                    <button className="p-2 rounded-lg bg-white/0 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
                      <Eye className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {filteredOrders.length > 5 && !showAllOrders && (
              <button
                onClick={() => setShowAllOrders(true)}
                className="w-full mt-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/50 text-violet-300 font-semibold transition-colors"
              >
                Load More ({filteredOrders.length - 5} more)
              </button>
            )}
          </motion.div>

          {/* Quick Stats Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {/* Shipment Status */}
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipments
              </h3>
              <div className="space-y-3">
                {[
                  { label: "In Transit", value: shipmentStats.inTransit, color: "text-cyan-400" },
                  { label: "Delivered", value: shipmentStats.delivered, color: "text-emerald-400" },
                  { label: "Delayed", value: shipmentStats.delayed, color: "text-red-400" },
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">{stat.label}</span>
                    <span className={`font-bold text-lg ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white mb-4">Performance</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">On-time Rate</span>
                    <span className="font-bold text-emerald-400">94%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 w-[94%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Fulfillment Rate</span>
                    <span className="font-bold text-violet-400">88%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 w-[88%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full py-2 px-4 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/50 rounded-lg text-violet-300 font-semibold text-sm transition-colors">
                  New Order
                </button>
                <button className="w-full py-2 px-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-300 font-semibold text-sm transition-colors">
                  Track Shipment
                </button>
                <button className="w-full py-2 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-emerald-300 font-semibold text-sm transition-colors">
                  Export Report
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-white/40 text-xs">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
      </div>
    </>
  );
}
