import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Warehouse,
  Search,
  RefreshCw,
  Bell,
  Package,
  AlertTriangle,
  Clock3,
  TrendingUp,
  TrendingDown,
  Boxes,
  ShieldAlert,
  LogOut,
  ShoppingCart,
  CheckCircle,
  Play,
  AlertCircle,
  Edit,
  X,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";

export default function Dashboard() {
  const navigate = useNavigate();
  const { request } = useApi();
  const [stats, setStats] = React.useState(null);
  const [alerts, setAlerts] = React.useState({ expiryAlerts: [], lowStockAlerts: [], incomingOrders: [] });
  const [pageLoading, setPageLoading] = React.useState(true);
  const [searchText, setSearchText] = React.useState("");
  const [showAlerts, setShowAlerts] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());
  const [notification, setNotification] = React.useState(null);
  const [actionLoading, setActionLoading] = React.useState(null);
  const [escalateModal, setEscalateModal] = React.useState({ show: false, order: null });
  const [escalateReason, setEscalateReason] = React.useState("");
  const [adjustInventoryModal, setAdjustInventoryModal] = React.useState({ show: false, item: null });
  const [adjustmentQty, setAdjustmentQty] = React.useState("");
  const [adjustmentReason, setAdjustmentReason] = React.useState("");

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

  const handleCreatePurchaseOrder = (lowStockItem) => {
    // This would typically navigate to a form or open a modal to create a PO
    showNotification(`Purchase order creation for ${lowStockItem.drugId?.name} initiated`, "success");
    console.log("Create PO for:", lowStockItem);
  };

  const handleAcknowledgeShortage = (orderId) => {
    // Mark shortage as acknowledged
    setAlerts((prev) => ({
      ...prev,
      incomingOrders: prev.incomingOrders.map((order) =>
        order._id === orderId ? { ...order, acknowledged: true } : order
      ),
    }));
    showNotification("Shortage acknowledged. Notifying retailers.", "success");
  };

  const handlePrepareDispatch = (orderId) => {
    // Mark order as ready for dispatch
    setAlerts((prev) => ({
      ...prev,
      incomingOrders: prev.incomingOrders.map((order) =>
        order._id === orderId ? { ...order, status: "prepared" } : order
      ),
    }));
    showNotification("Order marked as ready for dispatch", "success");
  };

  const handleAllocateBLE = async (orderId) => {
    try {
      setActionLoading(`ble-${orderId}`);
      const response = await request("POST", "/api/admin/ble/allocate", { orderId });
      const assignedBleId = response?.data?.bleId;

      setAlerts((prev) => ({
        ...prev,
        incomingOrders: prev.incomingOrders.map((order) =>
          order._id === orderId ? { ...order, bleId: assignedBleId } : order
        )
      }));

      showNotification(`BLE package ${assignedBleId} assigned to order`, "success");
    } catch (error) {
      showNotification(error.message || "Failed to allocate BLE package", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunBleScan = async (order) => {
    if (!order?.bleId) {
      showNotification("Order does not have a BLE package assigned", "error");
      return;
    }

    try {
      setActionLoading(`ble-scan-${order._id}`);

      const challengeResponse = await request("POST", "/api/ble/secure/challenge", { bleId: order.bleId });
      const challenge = challengeResponse?.data?.challenge;

      const signatureResponse = await request("POST", "/api/ble/secure/mock-sign", {
        bleId: order.bleId,
        challenge
      });
      const signature = signatureResponse?.data?.signature;

      const ingestResponse = await request("POST", "/api/ble/scan/ingest", {
        bleId: order.bleId,
        challenge,
        signature,
        stage: "warehouse",
        location: { city: "Warehouse" },
        orderId: order._id
      });

      const verified = ingestResponse?.data?.verified;
      const statusMessage = verified ? "BLE scan completed and verified" : "BLE scan completed with alerts";

      setAlerts((prev) => ({
        ...prev,
        incomingOrders: prev.incomingOrders.map((o) =>
          o._id === order._id
            ? {
                ...o,
                status: verified ? "shipped" : o.status,
                lastBleScanStatus: ingestResponse?.data?.verificationStatus
              }
            : o
        )
      }));

      showNotification(statusMessage, verified ? "success" : "warning");
    } catch (error) {
      showNotification(error.message || "Failed to ingest BLE scan", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEscalateShortage = async () => {
    const order = escalateModal.order;
    if (!order) return;

    try {
      setActionLoading(`escalate-${order._id}`);
      await request('POST', `/api/admin/dashboard/alerts/${order._id}/escalate`, { reason: escalateReason });

      showNotification(`Shortage escalated to admin for ${order.medicine}`, "success");
      // update local alerts state
      setAlerts((prev) => ({
        ...prev,
        incomingOrders: prev.incomingOrders.map((o) =>
          o._id === order._id ? { ...o, escalatedToAdmin: true } : o
        ),
      }));

      setEscalateModal({ show: false, order: null });
      setEscalateReason("");
    } catch (error) {
      showNotification(error.message || "Failed to escalate shortage", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualAdjustInventory = async () => {
    const item = adjustInventoryModal.item;
    if (!item || !adjustmentQty) return;

    try {
      setActionLoading(`adjust-${item._id}`);
      const newQty = Number(item.quantity) + Number(adjustmentQty);
      
      // Simulate inventory adjustment
      showNotification(`Inventory adjusted for ${item.drugId?.name}: +${adjustmentQty} units`, "success");
      
      setAlerts((prev) => ({
        ...prev,
        lowStockAlerts: prev.lowStockAlerts.map((i) =>
          i._id === item._id ? { ...i, quantity: newQty } : i
        ),
      }));
      
      setAdjustInventoryModal({ show: false, item: null });
      setAdjustmentQty("");
      setAdjustmentReason("");
    } catch (error) {
      showNotification(error.message || "Failed to adjust inventory", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = React.useCallback(async () => {
    try {
      setPageLoading(true);
      const [statsRes, alertsRes] = await Promise.all([
        request("GET", "/api/admin/dashboard/stats"),
        request("GET", "/api/admin/dashboard/alerts"),
      ]);

      setStats(statsRes?.data || null);
      setAlerts(alertsRes?.data || { expiryAlerts: [], lowStockAlerts: [], incomingOrders: [] });
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching warehouse dashboard data:", err);
    } finally {
      setPageLoading(false);
    }
  }, [request]);

  React.useEffect(() => {
    handleRefresh();
  }, []);

  const filteredExpiryAlerts = React.useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return alerts.expiryAlerts || [];
    return (alerts.expiryAlerts || []).filter((drug) =>
      [drug.name, drug.batchNo || drug.batchNumber].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [alerts.expiryAlerts, searchText]);

  const filteredLowStockAlerts = React.useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return alerts.lowStockAlerts || [];
    return (alerts.lowStockAlerts || []).filter((item) =>
      [item.drugId?.name, item.warehouseLocation, item.quantity].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [alerts.lowStockAlerts, searchText]);

  const filteredIncomingOrders = React.useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return alerts.incomingOrders || [];
    return (alerts.incomingOrders || []).filter((order) =>
      [order.orderNumber, order.purchaseOrderNumber, order.medicine, order.status].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [alerts.incomingOrders, searchText]);

  const statCards = React.useMemo(() => {
    const totalDrugs = Number(stats?.totalDrugs || 0);
    const lowStockCount = Number(stats?.lowStockCount || 0);
    const expiredCount = Number(stats?.expiredCount || 0);
    const totalAlerts = (alerts.expiryAlerts?.length || 0) + (alerts.lowStockAlerts?.length || 0);

    return [
      {
        label: "Total Drugs",
        value: totalDrugs,
        trend: "+10%",
        trendUp: true,
        icon: <Package className="w-6 h-6" />,
        gradient: "from-violet-500/20 to-purple-500/20",
        border: "border-violet-500/30",
        iconBg: "from-violet-500 to-purple-500",
        chart: [68, 70, 72, 74, 76, 78, 80],
      },
      {
        label: "Low Stock",
        value: lowStockCount,
        trend: "-5%",
        trendUp: false,
        icon: <AlertTriangle className="w-6 h-6" />,
        gradient: "from-amber-500/20 to-orange-500/20",
        border: "border-amber-500/30",
        iconBg: "from-amber-500 to-orange-500",
        chart: [40, 38, 36, 34, 32, 30, 28],
      },
      {
        label: "Expired",
        value: expiredCount,
        trend: "-3%",
        trendUp: false,
        icon: <Clock3 className="w-6 h-6" />,
        gradient: "from-rose-500/20 to-red-500/20",
        border: "border-rose-500/30",
        iconBg: "from-rose-500 to-red-500",
        chart: [30, 29, 27, 26, 25, 23, 22],
      },
      {
        label: "Total Alerts",
        value: totalAlerts,
        trend: "+2%",
        trendUp: true,
        icon: <Bell className="w-6 h-6" />,
        gradient: "from-cyan-500/20 to-blue-500/20",
        border: "border-cyan-500/30",
        iconBg: "from-cyan-500 to-blue-500",
        chart: [45, 47, 46, 48, 49, 50, 52],
      },
    ];
  }, [alerts.expiryAlerts, alerts.lowStockAlerts, stats]);

  return (
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
              <Warehouse className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                Warehouse Dashboard
              </h1>
              <p className="text-white/60 text-sm mt-1">Inventory health • Expiry watch • Stock monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <RefreshCw className="w-4 h-4 text-white/70" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAlerts((prev) => !prev)}
              className="relative px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition inline-flex items-center gap-2"
            >
              <Bell className="w-4 h-4 text-violet-300" />
              Alerts
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-500 text-[10px] flex items-center justify-center">
                {(alerts.expiryAlerts?.length || 0) + (alerts.lowStockAlerts?.length || 0)}
              </span>
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

        <AnimatePresence>
          {showAlerts && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-white/10 p-4"
            >
              <p className="text-sm text-white/75">
                {alerts.expiryAlerts?.length || 0} expiry alerts and {alerts.lowStockAlerts?.length || 0} low stock alerts need attention.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10"
        >
          <div className="flex items-center gap-6 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Status: <span className="text-cyan-400 font-semibold">Active</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-400" />
              Total Drugs: <span className="text-white font-medium">{Number(stats?.totalDrugs || 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock3 className="w-4 h-4" />
              Updated: <span className="text-white font-medium">{lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-white/70 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-violet-400" />
            {(alerts.expiryAlerts?.length || 0) + (alerts.lowStockAlerts?.length || 0)} Active Alerts
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search drug name, batch, quantity, location..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full bg-white/5 text-white placeholder-white/40 pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.08 + 0.18 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`relative overflow-hidden bg-gradient-to-br ${item.gradient} rounded-2xl border ${item.border} p-4 backdrop-blur-xl`}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"
              />
              <div className="relative z-10 flex items-start justify-between">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center shadow-lg`}
                >
                  {item.icon}
                </motion.div>
                <span className={`text-xs font-semibold inline-flex items-center gap-1 ${item.trendUp ? "text-emerald-400" : "text-red-400"}`}>
                  {item.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {item.trend}
                </span>
              </div>
              <p className="text-3xl font-bold mt-3">{item.value}</p>
              <p className="text-white/60 text-sm mt-1">{item.label}</p>
              <div className="flex items-end gap-1 h-5 mt-2">
                {item.chart.map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.08 + i * 0.04 + 0.24, duration: 0.4 }}
                    className={`flex-1 bg-gradient-to-t ${item.iconBg} rounded-t opacity-45`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2 font-semibold">
              <ShieldAlert className="w-5 h-5 text-rose-300" />
              Expiring Soon
            </div>
            <div className="p-5 space-y-3 max-h-[420px] overflow-y-auto">
              {pageLoading ? (
                <div className="text-white/50">Loading expiry alerts...</div>
              ) : filteredExpiryAlerts.length > 0 ? (
                filteredExpiryAlerts.map((drug, index) => (
                  <motion.div
                    key={`${drug.batchNo || drug.batchNumber}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.36 + index * 0.04 }}
                    className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20"
                  >
                    <p className="font-semibold text-rose-200">{drug.name || "Unknown"}</p>
                    <p className="text-sm text-rose-100/80 mt-1">
                      Batch: {drug.batchNo || drug.batchNumber || "N/A"} • Expires: {drug.expiryDate ? new Date(drug.expiryDate).toLocaleDateString() : "N/A"}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className="text-white/50">No expiry alerts found.</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
              Low Stock
            </div>
            <div className="p-5 space-y-3 max-h-[420px] overflow-y-auto">
              {pageLoading ? (
                <div className="text-white/50">Loading low stock alerts...</div>
              ) : filteredLowStockAlerts.length > 0 ? (
                filteredLowStockAlerts.map((item, index) => (
                  <motion.div
                    key={`${item._id || item.drugId?._id || index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.42 + index * 0.04 }}
                    className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-amber-200">{item.drugId?.name || "Unknown"}</p>
                        <p className="text-sm text-amber-100/80 mt-1">
                          Current: {item.quantity ?? "N/A"} • Threshold: {item.threshold ?? "N/A"}
                        </p>
                        <p className="text-xs text-amber-100/60 mt-1">Location: {item.warehouseLocation || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCreatePurchaseOrder(item)}
                        disabled={actionLoading === `po-${item._id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 font-semibold transition-colors disabled:opacity-50"
                        title="Create Purchase Order"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Create PO
                      </motion.button>                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAdjustInventoryModal({ show: true, item })}
                        disabled={actionLoading === `adjust-${item._id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-200 font-semibold transition-colors disabled:opacity-50"
                        title="Manually adjust inventory"
                      >
                        <Edit className="w-3 h-3" />
                        Adjust Stock
                      </motion.button>                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-white/50">No low stock alerts found.</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2 font-semibold">
              <Package className="w-5 h-5 text-cyan-300" />
              Incoming Orders
            </div>
            <div className="p-5 space-y-3 max-h-[420px] overflow-y-auto">
              {pageLoading ? (
                <div className="text-white/50">Loading incoming orders...</div>
              ) : filteredIncomingOrders.length > 0 ? (
                filteredIncomingOrders.map((order, index) => (
                  <motion.div
                    key={order.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.48 + index * 0.04 }}
                    className={`p-4 rounded-xl border ${order.inventoryAvailable ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{order.orderNumber}</p>
                        <p className="text-sm text-white/70 mt-1">{order.medicine}</p>
                        <p className="text-xs text-white/55 mt-1">
                          PO: {order.purchaseOrderNumber || "N/A"} • Qty: {order.quantity || 0}
                        </p>
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${order.inventoryAvailable ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                        {order.inventoryAvailable ? "Stock Available" : "Stock Shortage"}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-2">{order.warehouseAction || "Processing..."}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {!order.inventoryAvailable && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAcknowledgeShortage(order._id)}
                            disabled={actionLoading === `ack-${order._id}` || order.acknowledged}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 font-semibold transition-colors disabled:opacity-50"
                            title="Acknowledge shortage and notify retailers"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {order.acknowledged ? "Acknowledged" : "Acknowledge"}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEscalateModal({ show: true, order })}
                            disabled={actionLoading === `escalate-${order._id}` || order.escalatedToAdmin}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-200 font-semibold transition-colors disabled:opacity-50"
                            title="Escalate shortage to admin for decision"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {order.escalatedToAdmin ? "Escalated" : "Escalate"}
                          </motion.button>
                        </>
                      )}
                      {order.inventoryAvailable && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAllocateBLE(order._id)}
                            disabled={actionLoading === `ble-${order._id}`}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-200 font-semibold transition-colors disabled:opacity-50"
                            title="Allocate BLE package"
                          >
                            <Package className="w-3 h-3" />
                            Allocate BLE
                          </motion.button>
                          {order.bleId && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRunBleScan(order)}
                              disabled={actionLoading === `ble-scan-${order._id}`}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-violet-500/30 hover:bg-violet-500/50 text-violet-200 font-semibold transition-colors disabled:opacity-50"
                              title="Run BLE scan ingestion"
                            >
                              <Truck className="w-3 h-3" />
                              Run BLE Scan
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePrepareDispatch(order._id)}
                            disabled={actionLoading === `dispatch-${order._id}` || order.status === "prepared"}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 font-semibold transition-colors disabled:opacity-50"
                            title="Mark order as ready for dispatch"
                          >
                            <Play className="w-3 h-3" />
                            {order.status === "prepared" ? "Ready" : "Prepare"}
                          </motion.button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-white/50">No incoming orders yet.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Escalate Shortage Modal */}
        <AnimatePresence>
          {escalateModal.show && (
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
                  handleEscalateShortage();
                }}
                className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Escalate Shortage</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEscalateModal({ show: false, order: null });
                      setEscalateReason("");
                    }}
                    className="rounded-lg p-2 hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <p className="text-sm text-white/70 mb-3">
                    <strong>Order:</strong> {escalateModal.order?.medicine} ({escalateModal.order?.quantity} units)
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/70">Escalation Reason</label>
                  <textarea
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    rows="3"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-white placeholder-white/40"
                    placeholder="Provide details for admin decision (e.g., supplier delays, critical shortage)..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEscalateModal({ show: false, order: null });
                      setEscalateReason("");
                    }}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading?.includes("escalate")}
                    className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 font-semibold hover:from-red-500 hover:to-rose-500 disabled:opacity-50"
                  >
                    {actionLoading?.includes("escalate") ? "Escalating..." : "Escalate to Admin"}
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Adjust Inventory Modal */}
        <AnimatePresence>
          {adjustInventoryModal.show && (
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
                  handleManualAdjustInventory();
                }}
                className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Adjust Inventory</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustInventoryModal({ show: false, item: null });
                      setAdjustmentQty("");
                      setAdjustmentReason("");
                    }}
                    className="rounded-lg p-2 hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-white/70">
                    <strong>Drug:</strong> {adjustInventoryModal.item?.drugId?.name}
                  </p>
                  <p className="text-sm text-white/70">
                    <strong>Current Stock:</strong> {adjustInventoryModal.item?.quantity ?? 0} units
                  </p>
                  <p className="text-sm text-white/70">
                    <strong>Threshold:</strong> {adjustInventoryModal.item?.threshold ?? 0} units
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/70">Quantity to Add/Remove</label>
                  <input
                    type="number"
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(e.target.value)}
                    placeholder="Enter positive to add, negative to remove"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-white placeholder-white/40"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    New stock will be: {(Number(adjustInventoryModal.item?.quantity || 0) + Number(adjustmentQty || 0))} units
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/70">Reason (Optional)</label>
                  <textarea
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    rows="2"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-white placeholder-white/40"
                    placeholder="Why are you adjusting stock? (e.g., physical count, damage, correction)"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustInventoryModal({ show: false, item: null });
                      setAdjustmentQty("");
                      setAdjustmentReason("");
                    }}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading?.includes("adjust") || !adjustmentQty}
                    className="flex-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 font-semibold hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
                  >
                    {actionLoading?.includes("adjust") ? "Adjusting..." : "Confirm Adjustment"}
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


