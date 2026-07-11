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
  Sparkles,
  PlayCircle,
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import ShipmentDetailsModal from "../admin/ShipmentDetailsModal";
import { buildRetailerFallbackData, shouldSeedRetailerFallbackData } from "./retailerDashboardData";

const DIAG_FRONTEND = false;
const DIAG_RENDER = false; // set to true only during debugging

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

const normalizeOrder = (order = {}, idx = 0) => ({
  ...order,
  _id: order._id || order.id || `temp-order-${idx}`,
  status: String(order.status || "pending").charAt(0).toUpperCase() + String(order.status || "pending").slice(1),
  orderNumber: order.orderNumber || order.order_number || `ORD-${String(order._id || order.id || idx).slice(0, 8)}`,
  purchaseOrderNumber: order.purchaseOrderNumber || order.purchase_order_number || "N/A",
  totalAmount: Number(order.totalAmount ?? order.total_amount ?? order.amount ?? 0),
  date: order.createdAt || order.date || new Date().toISOString(),
});

const normalizeShipment = (shipment = {}, idx = 0) => ({
  ...shipment,
  _id: shipment._id || shipment.id || `temp-shipment-${idx}`,
  trackingNumber: shipment.trackingNumber || shipment.tracking_number || shipment.order?.orderNumber || `SHP-${idx}`,
  status: String(shipment.status || "pending").charAt(0).toUpperCase() + String(shipment.status || "pending").slice(1),
  eta: shipment.expectedDeliveryDate ? new Date(shipment.expectedDeliveryDate).toLocaleDateString() : shipment.eta || "TBD",
  isDelayed: shipment.isDelayed ?? shipment.delayed ?? false,
});

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
  React.useEffect(() => {
    console.log('[DIAG][Home.mount] RetailerHome mounted');
  }, []);
  const [orders, setOrders] = React.useState([]);
  const [shipments, setShipments] = React.useState([]);
  const [stats, setStats] = React.useState(null);
  const [pageLoading, setPageLoading] = React.useState(true);
  const [searchText, setSearchText] = React.useState("");
  const [showAlerts, setShowAlerts] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [showAllOrders, setShowAllOrders] = React.useState(false);
  const [trackingShipment, setTrackingShipment] = React.useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = React.useState(false);
  const [trackLoading, setTrackLoading] = React.useState(false);
  const [trackError, setTrackError] = React.useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = React.useState(false);
  const [newOrder, setNewOrder] = React.useState({
    medicine: "",
    quantity: 1,
    purchaseOrderNumber: "",
    totalAmount: "",
  });
  const [notification, setNotification] = React.useState(null);
  const [actionLoading, setActionLoading] = React.useState(null);
  const [shipmentActionLoading, setShipmentActionLoading] = React.useState(null);
  const [simulationEnabled, setSimulationEnabled] = React.useState(true);
  const [cancelReasonModal, setCancelReasonModal] = React.useState({ show: false, orderId: null });
  const [cancelReason, setCancelReason] = React.useState("");
  const [quarantineModal, setQuarantineModal] = React.useState({ show: false, shipmentId: null });
  const [quarantineReason, setQuarantineReason] = React.useState("");

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

  const emitSimulationSync = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("simulation:updated"));
    }
  };

  const addDemoOrderFlow = async () => {
    try {
      await request("POST", "/api/users/simulation/demo-flow", {
        medicine: "Demo Antibiotic",
        quantity: 24,
        totalAmount: 1250,
        purchaseOrderNumber: `PO-DEMO-${Date.now()}`,
      });
      await fetchData();
      emitSimulationSync();
      showNotification("Demo order flow persisted and synced across dashboards", "success");
    } catch (error) {
      showNotification(error.message || "Failed to create demo order flow", "error");
    }
  };

  const simulateShipmentUpdate = async () => {
    try {
      setShipmentActionLoading("simulation-order");
      await addDemoOrderFlow();
      showNotification("Retailer simulation flow persisted and synced", "success");
    } catch (error) {
      showNotification(error.message || "Failed to create retailer simulation flow", "error");
    } finally {
      setShipmentActionLoading(null);
    }
  };

  const resetSimulationData = async () => {
    try {
      await request("POST", "/api/users/simulation/reset");
      await fetchData();
      showNotification("Demo entries cleared", "success");
    } catch (error) {
      showNotification(error.message || "Failed to reset demo data", "error");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      setActionLoading(orderId);
      await request("DELETE", `/api/users/retailer/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      showNotification("Order deleted successfully", "success");
      await fetchData();
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
      await fetchData();
      setCancelReasonModal({ show: false, orderId: null });
      setCancelReason("");
    } catch (error) {
      showNotification(error.message || "Failed to cancel order", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmShipment = async (shipmentId) => {
    if (!window.confirm("Confirm final delivery for this shipment?")) return;

    try {
      setShipmentActionLoading(shipmentId);
      await request("PATCH", `/api/users/retailer/shipments/${shipmentId}/confirm`);
      setShipments((prev) =>
        prev.map((s) =>
          s._id === shipmentId ? { ...s, status: "Delivered" } : s
        )
      );
      showNotification("Shipment confirmed as delivered", "success");
      await fetchData();
    } catch (error) {
      showNotification(error.message || "Failed to confirm shipment", "error");
    } finally {
      setShipmentActionLoading(null);
    }
  };

  const handleTrackShipment = async (shipment) => {
    if (!shipment?._id) {
      const message = "Unable to track shipment: ID is missing.";
      setTrackError(message);
      showNotification(message, "error");
      return;
    }

    setTrackLoading(true);
    setTrackError(null);

    try {
      const response = await request("GET", `/api/users/retailer/shipments/${shipment._id}`);
      const shipmentDetail = response?.shipment ?? response?.data?.shipment ?? response?.data ?? null;

      if (!shipmentDetail) {
        throw new Error("Shipment details are unavailable.");
      }

      setTrackingShipment(shipmentDetail);
      setIsTrackingModalOpen(true);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Failed to fetch shipment details.";
      setTrackError(message);
      showNotification(message, "error");
    } finally {
      setTrackLoading(false);
    }
  };

  const handleCloseTracking = () => {
    setIsTrackingModalOpen(false);
    setTrackingShipment(null);
    setTrackError(null);
  };

  const handleQuarantineShipment = async () => {
    const shipmentId = quarantineModal.shipmentId;
    if (!shipmentId) return;

    try {
      setShipmentActionLoading(shipmentId);
      await request("PATCH", `/api/users/retailer/shipments/${shipmentId}/quarantine`, {
        reason: quarantineReason.trim(),
      });
      setShipments((prev) =>
        prev.map((s) =>
          s._id === shipmentId ? { ...s, status: "Quarantined" } : s
        )
      );
      showNotification("Shipment quarantined successfully", "success");
      await fetchData();
      setQuarantineModal({ show: false, shipmentId: null });
      setQuarantineReason("");
    } catch (error) {
      showNotification(error.message || "Failed to quarantine shipment", "error");
    } finally {
      setShipmentActionLoading(null);
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
        showNotification("Order created successfully!", "success");
        await fetchData();
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
      console.log("[DIAG][Home] fetchData: start");
      console.log('[DIAG][Home] typeof request', typeof request, { hasToken: !!localStorage.getItem('token') });
      setPageLoading(true);

      const ordersUrl = "/api/users/retailer/orders?limit=50";
      const shipmentsUrl = "/api/users/retailer/shipments";
      console.log("[DIAG][Home] Shipment fetch started", shipmentsUrl);
      console.log("[DIAG][Home] Calling orders API", ordersUrl);
      console.log("[DIAG][Home] Calling shipments API", shipmentsUrl);

      // Guard and trace the request invocation to ensure the call is reached
      if (typeof request !== 'function') {
        throw new Error('useApi.request is not a function');
      }

      console.log('[DIAG][Home] About to invoke request for orders and shipments');
      const ordersPromise = (async () => {
        console.log('[DIAG][Home] invoking request GET', ordersUrl);
        return request("GET", ordersUrl);
      })();
      const shipmentsPromise = (async () => {
        console.log('[DIAG][Home] invoking request GET', shipmentsUrl);
        return request("GET", shipmentsUrl);
      })();

      const [ordersResult, shipmentsResult] = await Promise.allSettled([ordersPromise, shipmentsPromise]);

      console.log("[DIAG][Home] ordersResult", ordersResult);
      console.log("[DIAG][Home] shipmentsResult", shipmentsResult);

      const fetchedOrders = ordersResult.status === "fulfilled"
        ? ordersResult.value?.data?.orders ?? ordersResult.value?.orders ?? []
        : [];

      const fetchedShipments = shipmentsResult.status === "fulfilled"
        ? shipmentsResult.value?.data?.shipments ?? shipmentsResult.value?.shipments ?? []
        : [];

      const normalizedOrders = Array.isArray(fetchedOrders)
        ? fetchedOrders.map(normalizeOrder)
        : [];

      const normalizedShipments = Array.isArray(fetchedShipments)
        ? fetchedShipments.map(normalizeShipment)
        : [];

      console.log("[DIAG][Home] Shipment response received", { fetchedShipments, normalizedShipmentsLength: normalizedShipments.length });

      const fallbackDecision = shouldSeedRetailerFallbackData(normalizedOrders, normalizedShipments, localStorage.getItem("token") || "");
      const finalOrders = fallbackDecision.shouldSeed ? buildRetailerFallbackData().orders : normalizedOrders;
      const finalShipments = fallbackDecision.shouldSeed ? buildRetailerFallbackData().shipments : normalizedShipments;

      if (DIAG_FRONTEND) {
        console.log(`[DIAG][Home] Normalized counts - orders:${normalizedOrders.length} shipments:${normalizedShipments.length}`);
        console.log("[DIAG][Home] Sample order:", normalizedOrders[0]);
        console.log("[DIAG][Home] Sample shipment:", normalizedShipments[0]);
      }

      setOrders(finalOrders.map(normalizeOrder));
      setShipments(finalShipments.map(normalizeShipment));
      console.log("[DIAG][Home] Shipments state updated with count", finalShipments.length);
      if (DIAG_FRONTEND) console.log('[DIAG][Home] setShipments count:', Array.isArray(finalShipments) ? finalShipments.length : typeof finalShipments, finalShipments && finalShipments.slice ? finalShipments.slice(0,3) : finalShipments);
      setStats({
        totalOrders: finalOrders.length,
        pendingOrders: finalOrders.filter((o) => String(o.status || "").toLowerCase() === "pending").length,
      });
      setLastUpdate(new Date());

      if (ordersResult.status === "rejected" && shipmentsResult.status === "rejected") {
        const reason = ordersResult.reason || shipmentsResult.reason || new Error("Failed to load retailer dashboard data");
        throw reason;
      }
    } catch (err) {
      console.error("Error fetching retailer dashboard data:", err, err?.stack || 'no-stack');
      const fallback = buildRetailerFallbackData();
      setOrders(fallback.orders.map(normalizeOrder));
      setShipments(fallback.shipments.map(normalizeShipment));
      setStats({ totalOrders: fallback.orders.length, pendingOrders: 0 });
    } finally {
      setPageLoading(false);
    }
  }, [request]);

  // Small floating debug panel to help diagnose missing-data issues in non-embedded browsers
  // Log state changes for verification
  React.useEffect(() => {
    console.log('[DIAG][Home.useEffect] orders length', Array.isArray(orders) ? orders.length : typeof orders, 'shipments length', Array.isArray(shipments) ? shipments.length : typeof shipments);
    try {
      console.log('[DIAG][Home.useEffect] sample shipments', Array.isArray(shipments) ? shipments.slice(0,3) : shipments);
    } catch(e) {
      console.warn('[DIAG][Home.useEffect] unable to show sample shipments', e);
    }
  }, [orders, shipments]);

  // Ensure fetchData only runs once on mount even when React.StrictMode
  // double-invokes effects in development. Use a ref guard to make the
  // initial load idempotent and avoid duplicate network requests.
  const didInitialFetchRef = React.useRef(false);
  React.useEffect(() => {
    if (didInitialFetchRef.current) return;
    didInitialFetchRef.current = true;
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    const handleSimulationUpdated = () => {
      fetchData();
    };

    window.addEventListener("simulation:updated", handleSimulationUpdated);
    return () => window.removeEventListener("simulation:updated", handleSimulationUpdated);
  }, [fetchData]);
  // Poll for order updates and show lightweight toasts for important status changes
  // Use refs to ensure only one interval runs and to prevent overlapping requests
  const prevOrdersRef = React.useRef(new Map());
  const pollingRef = React.useRef(null);
  const isPollingFetchRef = React.useRef(false);

  React.useEffect(() => {
    // Clear any existing interval before creating a new one
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    const handler = async () => {
      if (isPolling_fetch_check()) return; // guard wrapper
      isPollingFetchRef.current = true;
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
      } finally {
        isPollingFetchRef.current = false;
      }
    };

    function isPolling_fetch_check() {
      return isPollingFetchRef.current === true;
    }

    // Run handler first time after mount only if we didn't just run fetchData
    if (!didInitialFetchRef.current) {
      handler().catch(() => {});
    }

    // Start polling interval
    pollingRef.current = setInterval(() => {
      handler().catch(() => {});
    }, 15000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
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

  // Render-time diagnostic: print derived values so we can trace where arrays become empty
  React.useEffect(() => {
    try {
      const shipmentsLength = Array.isArray(shipments) ? shipments.length : 0;
      const recentLength = shipmentsLength; // currently we render all shipments in the list
      const displayedLength = shipmentsLength; // direct mapping in JSX
      console.log('[DIAG][Home.renderTrace]', { shipmentsLength, recentLength, displayedLength, shipmentStats });
    } catch (e) {
      console.warn('[DIAG][Home.renderTrace] error computing trace', e);
    }
  }, [shipments, shipmentStats]);

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
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
              <Sparkles className="w-4 h-4 text-violet-300" />
              <span>{simulationEnabled ? "Simulation mode" : "Live mode"}</span>
            </div>
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

        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-sm text-violet-100 backdrop-blur-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">Workflow controls</p>
              <p className="text-violet-100/80">Use these actions to exercise the live retailer workflow and trigger the existing backend notifications.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSimulationEnabled((prev) => !prev)}
                className="rounded-lg border border-violet-400/30 bg-slate-950/50 px-3 py-2 text-sm font-medium text-violet-100"
              >
                {simulationEnabled ? "Disable demo mode" : "Enable demo mode"}
              </button>
              <button
                type="button"
                onClick={addDemoOrderFlow}
                className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-100"
              >
                <span className="inline-flex items-center gap-2"><PlayCircle className="w-4 h-4" />Simulate order</span>
              </button>
              <button
                type="button"
                onClick={addDemoOrderFlow}
                className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-100"
              >
                <span className="inline-flex items-center gap-2"><Truck className="w-4 h-4" />Simulate Order</span>
              </button>
              <button
                type="button"
                onClick={resetSimulationData}
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-white/80"
              >
                Reset demo state
              </button>
            </div>
          </div>
        </div>

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

          {/* Shipment List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2 bg-gradient-to-br from-slate-900/40 to-slate-800/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Recent Shipments
              </h2>
            </div>

            {(() => { console.log('[DIAG][RENDER] shipments:', shipments); console.log('[DIAG][RENDER] shipments length:', shipments?.length); return null; })()}
            {(!localStorage.getItem('token')) ? (
              <div className="py-8 text-center text-white/40">
                You are not signed in. Please <button onClick={() => navigate('/login')} className="text-violet-300 underline">sign in</button> to view shipments.
              </div>
            ) : pageLoading ? (
              <div className="py-8 text-center text-white/60">Loading shipments...</div>
            ) : shipments.length === 0 ? (
              <div className="py-8 text-center text-white/40">No shipments found.</div>
            ) : (
              (DIAG_RENDER ? (
                <div className="space-y-4">
                  {Array.isArray(shipments) ? shipments.map((s, i) => (
                    <pre key={s._id || i} className="bg-white/5 p-4 rounded text-xs text-white/80 overflow-auto">{JSON.stringify(s, null, 2)}</pre>
                  )) : (<div className="text-white/60">No shipments array available</div>)}
                </div>
              ) : (
                <div className="space-y-4">
                  {shipments.map((shipment, idx) => (
                    <div key={shipment._id || idx} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-white/60">Tracking</p>
                          <p className="font-semibold text-white">{shipment.trackingNumber}</p>
                          <p className="text-sm text-white/50">ETA: {shipment.eta || "TBD"}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="px-3 py-1 rounded-full bg-slate-800 text-xs uppercase tracking-[0.12em] text-white/80">
                            {shipment.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleConfirmShipment(shipment._id)}
                            disabled={shipmentActionLoading === shipment._id || shipment.status === "Delivered" || shipment.status === "Quarantined"}
                            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Verify Package
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTrackShipment(shipment)}
                            disabled={trackLoading}
                            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {trackLoading ? "Loading..." : "Track Shipment"}
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/70">
                        <div>
                          <p><span className="font-semibold text-white/80">Order</span>: {shipment.order?.orderNumber || "N/A"}</p>
                          <p><span className="font-semibold text-white/80">Items</span>: {shipment.items?.length || 0}</p>
                        </div>
                        <div>
                          <p><span className="font-semibold text-white/80">Value</span>: ₹{Number(shipment.totalAmount || 0).toFixed(2)}</p>
                          <p><span className="font-semibold text-white/80">BLE ID</span>: {shipment.bleId || "Unavailable"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 space-y-4"
          >
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
                  Place Order
                </button>
                <button
                  type="button"
                  onClick={addDemoOrderFlow}
                  className="w-full py-2 px-4 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/50 rounded-lg text-fuchsia-300 font-semibold text-sm transition-colors"
                >
                  Simulate Order
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const firstShipment = shipments[0];
                    if (firstShipment) {
                      handleTrackShipment(firstShipment);
                    }
                  }}
                  className="w-full py-2 px-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-300 font-semibold text-sm transition-colors"
                >
                  Track Shipment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const firstShipment = shipments.find((item) => !["Delivered", "Quarantined"].includes(item.status));
                    if (firstShipment) {
                      handleConfirmShipment(firstShipment._id);
                    }
                  }}
                  className="w-full py-2 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-emerald-300 font-semibold text-sm transition-colors"
                >
                  Verify Package
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const firstShipment = shipments.find((item) => !["Delivered", "Quarantined"].includes(item.status));
                    if (firstShipment) {
                      handleConfirmShipment(firstShipment._id);
                    }
                  }}
                  className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/80 font-semibold text-sm transition-colors"
                >
                  Confirm Delivery
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

        {/* Quarantine Shipment Modal */}
        <AnimatePresence>
          {quarantineModal.show && (
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
                  handleQuarantineShipment();
                }}
                className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Quarantine Shipment</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setQuarantineModal({ show: false, shipmentId: null });
                      setQuarantineReason("");
                    }}
                    className="rounded-lg p-2 hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/70">Quarantine Reason</label>
                  <textarea
                    value={quarantineReason}
                    onChange={(e) => setQuarantineReason(e.target.value)}
                    rows="4"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-white placeholder-white/40"
                    placeholder="Explain why this shipment should be quarantined"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuarantineModal({ show: false, shipmentId: null });
                      setQuarantineReason("");
                    }}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={shipmentActionLoading === quarantineModal.shipmentId}
                    className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 font-semibold hover:from-red-500 hover:to-rose-500 disabled:opacity-50"
                  >
                    {shipmentActionLoading === quarantineModal.shipmentId ? "Quarantining..." : "Confirm Quarantine"}
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        <ShipmentDetailsModal
          isOpen={isTrackingModalOpen}
          onClose={handleCloseTracking}
          shipment={trackingShipment}
        />

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
