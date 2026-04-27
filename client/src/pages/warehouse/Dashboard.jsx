import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { useApi } from "../../hooks/useApi";

export default function Dashboard() {
  const { request } = useApi();
  const [stats, setStats] = React.useState(null);
  const [alerts, setAlerts] = React.useState({ expiryAlerts: [], lowStockAlerts: [] });
  const [pageLoading, setPageLoading] = React.useState(true);
  const [searchText, setSearchText] = React.useState("");
  const [showAlerts, setShowAlerts] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  const handleRefresh = React.useCallback(async () => {
    try {
      setPageLoading(true);
      const [statsRes, alertsRes] = await Promise.all([
        request("GET", "/api/admin/dashboard/stats"),
        request("GET", "/api/admin/dashboard/alerts"),
      ]);

      setStats(statsRes?.data || null);
      setAlerts(alertsRes?.data || { expiryAlerts: [], lowStockAlerts: [] });
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                    <p className="font-semibold text-amber-200">{item.drugId?.name || "Unknown"}</p>
                    <p className="text-sm text-amber-100/80 mt-1">
                      Current: {item.quantity ?? "N/A"} • Threshold: {item.threshold ?? "N/A"}
                    </p>
                    <p className="text-xs text-amber-100/60 mt-1">Location: {item.warehouseLocation || "N/A"}</p>
                  </motion.div>
                ))
              ) : (
                <p className="text-white/50">No low stock alerts found.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


