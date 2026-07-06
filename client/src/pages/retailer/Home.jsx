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
  X,
  Trash2,
  XCircle,
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
  const [isOrderModalOpen, setIsOrderModalOpen] = React.useState(false);
  const [newOrder, setNewOrder] = React.useState({
    medicine: "",
    quantity: 1,
    purchaseOrderNumber: "",
    totalAmount: "",
  });
  const [notification, setNotification] = React.useState(null);
  const [actionLoading, setActionLoading] = React.useState(null);
  const [cancelReasonModal, setCancelReasonModal] = React.useState({ show: false, orderId: null });
  const [cancelReason, setCancelReason] = React.useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      setActionLoading(orderId);
      await request("DELETE", `/api/users/retailer/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      showNotification("Order deleted successfully", "success");
    } catch (error) {
      showNotification(error.message || "Failed to delete order", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async () => {
    const orderId = cancelReasonModal.orderId;
    if (!orderId) return;

    try {
      setActionLoading(orderId);
      await request("PATCH", `/api/users/retailer/orders/${orderId}/cancel`, {
        reason: cancelReason.trim(),
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
      );
      showNotification("Order cancelled successfully", "success");
      setCancelReasonModal({ show: false, orderId: null });
      setCancelReason("");
    } catch (error) {
      showNotification(error.message || "Failed to cancel order", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const resetOrderForm = () => {
    setNewOrder({
      medicine: "",
      quantity: 1,
      purchaseOrderNumber: "",
      totalAmount: "",
    });
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();

    const medicine = newOrder.medicine.trim();
    if (!medicine) return;

    try {
      const response = await request("POST", "/api/users/retailer/orders", {
        medicine,
        quantity: Number(newOrder.quantity) || 1,
        purchaseOrderNumber: newOrder.purchaseOrderNumber.trim(),
        totalAmount: newOrder.totalAmount,
      });

      const createdOrder = response?.data?.order;
      if (createdOrder) {
        setOrders((prev) => [createdOrder, ...prev]);
        setStats((prev) => ({
          ...(prev || {}),
          totalOrders: (prev?.totalOrders || 0) + 1,
          pendingOrders: (prev?.pendingOrders || 0) + (createdOrder.status === "pending" ? 1 : 0),
        }));
        showNotification("Order created successfully!", "success");
      }

      setLastUpdate(new Date());
      setIsOrderModalOpen(false);
      resetOrderForm();
    } catch (error) {
      showNotification(error.message || "Failed to create order", "error");
    }
  };

  const fetchData = React.useCallback(async () => {
    try {
      setPageLoading(true);
      const response = await request("GET", "/api/users/retailer/orders?limit=50");
      
      // Extract orders - check different possible response structures
      let fetchedOrders = [];
      if (response?.data?.orders) {
        fetchedOrders = response.data.orders;
      } else if (response?.orders) {
        fetchedOrders = response.orders;
      } else if (Array.isArray(response)) {
        fetchedOrders = response;
      }
      
      if (!Array.isArray(fetchedOrders)) {
        fetchedOrders = [];
      }
      
      // Normalize status to title case for display
      const normalizedOrders = fetchedOrders.map((order, idx) => ({
        ...order,
        _id: order._id || `temp-${idx}`,
        status: (order.status || "pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1),
        orderNumber: order.orderNumber || `ORD-${order._id?.substring(0, 8)}`,
        purchaseOrderNumber: order.purchaseOrderNumber || "N/A",
        totalAmount: order.totalAmount || 0,
        date: order.createdAt || order.date || new Date().toISOString(),
      }));
      
      setOrders(normalizedOrders);
      setShipments(mockShipments);
      setShipments(mockShipments);
      setStats({
        totalOrders: normalizedOrders.length,
        pendingOrders: normalizedOrders.filter(o => o.status.toLowerCase() === "pending").length,
      });
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching retailer orders:", err);
      setOrders([]);
      setStats({ totalOrders: 0, pendingOrders: 0 });
    } finally {
      setPageLoading(false);
    }
  }, [request]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll for order updates and show lightweight toasts for important status changes
  const prevOrdersRef = React.useRef(new Map());
  React.useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await request('GET', '/api/users/retailer/orders?limit=50');
        let fetchedOrders = [];
        if (response?.data?.orders) fetchedOrders = response.data.orders;
        else if (Array.isArray(response)) fetchedOrders = response;

        const normalized = (fetchedOrders || []).map(o => ({
          _id: o._id,
          status: (o.status || 'pending').toLowerCase(),
          orderNumber: o.orderNumber || `ORD-${o._id?.slice(0,8)}`
        }));

        normalized.forEach(o => {
          const prev = prevOrdersRef.current.get(o._id);
          if (!prev) {
            prevOrdersRef.current.set(o._id, o.status);
            return;
          }
          if (prev !== o.status) {
            // show notifications for key transitions
            const keyStatuses = ['confirmed', 'shipped', 'delivered', 'cancelled'];
            if (keyStatuses.includes(o.status)) {
              showNotification(`Order ${o.orderNumber} is now ${o.status}`, 'success');
            }
            prevOrdersRef.current.set(o._id, o.status);
          }
        });
      } catch (e) {
        // ignore polling errors
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [request]);

  

  const filteredOrders = React.useMemo(() => {
    try {
      let filtered = Array.isArray(orders) ? orders : [];

      if (statusFilter !== "All" && statusFilter) {
        filtered = filtered.filter((order) => {
          const orderStatus = String(order?.status || "").toLowerCase();
          const filterStatus = String(statusFilter || "").toLowerCase();
          return orderStatus === filterStatus;
        });
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
    } catch (err) {
      console.error("Error filtering orders:", err);
      return [];
    }
  }, [orders, searchText, statusFilter]);

  const visibleOrders = showAllOrders ? filteredOrders : filteredOrders.slice(0, 5);

  const orderStats = React.useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status.toLowerCase() === "pending").length;
    const shipped = orders.filter((o) => o.status.toLowerCase() === "shipped").length;
    const delivered = orders.filter((o) => o.status.toLowerCase() === "delivered").length;
    const cancelled = orders.filter((o) => o.status.toLowerCase() === "cancelled").length;

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
        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`fixed top-4 right-4 p-4 rounded-lg border backdrop-blur-xl z-50 ${
                notification.type === "success"
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-100"
                  : "bg-red-500/20 border-red-500/50 text-red-100"
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
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
              {pageLoading && (!visibleOrders || visibleOrders.length === 0) ? (
                <div className="py-8 text-center text-white/40">Loading orders...</div>
              ) : !visibleOrders || visibleOrders.length === 0 ? (
                <div className="py-8 text-center text-white/40">
                  {orders.length === 0 ? "No orders found" : `No orders match "${statusFilter}"`}
                </div>
              ) : (
                visibleOrders.map((order, idx) => {
                  try {
                    const orderNum = order?.orderNumber || order?.purchaseOrderNumber || `ORD-${idx}`;
                    const orderDate = new Date(order?.date || order?.createdAt || new Date()).toLocaleDateString();
                    const orderAmount = order?.totalAmount ? `₹${Number(order.totalAmount).toFixed(2)}` : "N/A";
                    const orderStatus = String(order?.status || "pending").charAt(0).toUpperCase() + String(order?.status || "pending").slice(1);
                    const orderId = order?._id || `temp-${idx}`;
                    
                    return (
                      <motion.div
                        key={orderId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group cursor-pointer"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-white">{orderNum}</p>
                          <p className="text-sm text-white/60">{orderDate}</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-4">
                          <div>
                            <p className="text-sm text-white/80 font-medium">{orderAmount}</p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                              statusColors[orderStatus] || statusColors["Pending"]
                            }`}
                          >
                            {orderStatus}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {["pending", "cancelled"].includes(orderStatus.toLowerCase()) && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteOrder(orderId)}
                              disabled={actionLoading === orderId}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors disabled:opacity-50"
                              title="Delete order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                          {!["completed", "cancelled", "delivered"].includes(orderStatus.toLowerCase()) && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setCancelReasonModal({ show: true, orderId })}
                              disabled={actionLoading === orderId}
                              className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors disabled:opacity-50"
                              title="Cancel order"
                            >
                              <XCircle className="w-4 h-4" />
                            </motion.button>
                          )}
                          <button className="p-2 rounded-lg bg-white/0 hover:bg-white/10 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  } catch (renderErr) {
                    console.error("❌ Error rendering order:", renderErr, order);
                    return (
                      <div key={`error-${idx}`} className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300">
                        Error rendering order - check console
                      </div>
                    );
                  }
                })
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
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(true)}
                  className="w-full py-2 px-4 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/50 rounded-lg text-violet-300 font-semibold text-sm transition-colors"
                >
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

        {/* Cancel Order Modal */}
        <AnimatePresence>
          {cancelReasonModal.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
              <motion.form
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCancelOrder();
                }}
                className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Cancel Order</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setCancelReasonModal({ show: false, orderId: null });
                      setCancelReason("");
                    }}
                    className="rounded-lg p-2 hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/70">Cancellation Reason (Optional)</label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows="4"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-white placeholder-white/40"
                    placeholder="Why are you cancelling this order?"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCancelReasonModal({ show: false, orderId: null });
                      setCancelReason("");
                    }}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 hover:bg-white/10"
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === cancelReasonModal.orderId}
                    className="flex-1 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 font-semibold hover:from-amber-500 hover:to-orange-500 disabled:opacity-50"
                  >
                    {actionLoading === cancelReasonModal.orderId ? "Cancelling..." : "Confirm Cancel"}
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Order Modal */}
        <AnimatePresence>
          {isOrderModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
              <motion.form
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                onSubmit={handleCreateOrder}
                className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Place New Order</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOrderModalOpen(false);
                      resetOrderForm();
                    }}
                    className="rounded-lg p-2 hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/70">Medicine Name</label>
                  <input
                    value={newOrder.medicine}
                    onChange={(event) =>
                      setNewOrder((prev) => ({
                        ...prev,
                        medicine: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    placeholder="Enter medicine name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm text-white/70">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={newOrder.quantity}
                      onChange={(event) =>
                        setNewOrder((prev) => ({
                          ...prev,
                          quantity: event.target.value,
                        }))
                      }
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-white/70">Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newOrder.totalAmount}
                    onChange={(event) =>
                      setNewOrder((prev) => ({
                        ...prev,
                        totalAmount: event.target.value,
                      }))
                    }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/70">Purchase Order Number</label>
                  <input
                    value={newOrder.purchaseOrderNumber}
                    onChange={(event) =>
                      setNewOrder((prev) => ({
                        ...prev,
                        purchaseOrderNumber: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    placeholder="Optional"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOrderModalOpen(false);
                      resetOrderForm();
                    }}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 font-semibold hover:from-violet-500 hover:to-indigo-500"
                  >
                    Create Order
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </>
  );
}
