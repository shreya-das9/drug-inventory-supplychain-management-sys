import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Search,
  Package,
  Truck,
  ClipboardList,
  CircleCheck,
  Clock3,
  ArrowRight,
  CalendarDays,
  Bell,
  ShoppingCart,
  X,
  RefreshCw,
  Navigation,
  TrendingUp,
  TrendingDown,
  LogOut,
} from "lucide-react";

const baseOrders = [
  { id: "ORD-1001", medicine: "Paracetamol 500mg", qty: 4, amount: 320, status: "Delivered", date: "Feb 20, 2026" },
  { id: "ORD-1002", medicine: "Amoxicillin 250mg", qty: 2, amount: 190, status: "In Transit", date: "Feb 22, 2026" },
  { id: "ORD-1003", medicine: "Vitamin D3", qty: 1, amount: 110, status: "Pending", date: "Feb 23, 2026" },
  { id: "ORD-1004", medicine: "Ibuprofen 400mg", qty: 3, amount: 270, status: "Delivered", date: "Feb 24, 2026" },
  { id: "ORD-1005", medicine: "Cough Syrup", qty: 2, amount: 240, status: "In Transit", date: "Feb 25, 2026" },
];

const baseShipments = [
  { tracking: "TRK-98231", route: "Mumbai → Pune", eta: "Today, 6:30 PM", progress: 80 },
  { tracking: "TRK-98277", route: "Delhi → Jaipur", eta: "Tomorrow, 11:00 AM", progress: 55 },
  { tracking: "TRK-98302", route: "Bangalore → Mysore", eta: "Tomorrow, 3:15 PM", progress: 35 },
];

const alerts = [
  "Order ORD-1002 has reached nearest hub.",
  "Price dropped for Vitamin D3.",
  "2 medicines in your cart are almost out of stock.",
];

const statusStyle = {
  Delivered: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  "In Transit": "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  Pending: "text-amber-400 bg-amber-500/10 border-amber-500/30",
};

export default function UserHome() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = React.useState("");
  const [showAlerts, setShowAlerts] = React.useState(false);
  const [showAllOrders, setShowAllOrders] = React.useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = React.useState(false);
  const [expandedShipment, setExpandedShipment] = React.useState(null);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());
  const [orders, setOrders] = React.useState(baseOrders);
  const [newOrder, setNewOrder] = React.useState({
    medicine: "",
    qty: 1,
    amount: "",
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredOrders = React.useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((order) =>
      [order.id, order.medicine, order.status].some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }, [orders, searchText]);

  const filteredShipments = React.useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return baseShipments;
    return baseShipments.filter((shipment) =>
      [shipment.tracking, shipment.route, shipment.eta].some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }, [searchText]);

  const visibleOrders = showAllOrders ? filteredOrders : filteredOrders.slice(0, 3);

  const stats = React.useMemo(() => {
    const total = orders.length;
    const inTransit = orders.filter((order) => order.status === "In Transit").length;
    const delivered = orders.filter((order) => order.status === "Delivered").length;
    const pending = orders.filter((order) => order.status === "Pending").length;

    return [
      {
        label: "Total Orders",
        value: total,
        trend: "+8%",
        trendUp: true,
        icon: <ClipboardList className="w-6 h-6" />,
        gradient: "from-violet-500/20 to-purple-500/20",
        iconBg: "from-violet-500 to-purple-500",
        chart: [70, 74, 72, 75, 78, 80, 83],
      },
      {
        label: "In Transit",
        value: inTransit,
        trend: "+3%",
        trendUp: true,
        icon: <Truck className="w-6 h-6" />,
        gradient: "from-blue-500/20 to-cyan-500/20",
        iconBg: "from-blue-500 to-cyan-500",
        chart: [40, 42, 45, 44, 46, 48, 50],
      },
      {
        label: "Delivered",
        value: delivered,
        trend: "+12%",
        trendUp: true,
        icon: <CircleCheck className="w-6 h-6" />,
        gradient: "from-emerald-500/20 to-teal-500/20",
        iconBg: "from-emerald-500 to-teal-500",
        chart: [55, 58, 62, 65, 68, 72, 75],
      },
      {
        label: "Pending",
        value: pending,
        trend: "-2%",
        trendUp: false,
        icon: <Clock3 className="w-6 h-6" />,
        gradient: "from-amber-500/20 to-orange-500/20",
        iconBg: "from-amber-500 to-orange-500",
        chart: [35, 34, 33, 32, 31, 30, 29],
      },
    ];
  }, [orders]);

  const refreshDashboard = () => {
    setShowAlerts(false);
    setExpandedShipment(null);
    setLastUpdate(new Date());
  };

  const resetOrderForm = () => {
    setNewOrder({ medicine: "", qty: 1, amount: "" });
  };

  const handleCreateOrder = (event) => {
    event.preventDefault();
    if (!newOrder.medicine.trim()) return;

    const qty = Number(newOrder.qty) || 1;
    const amount = Number(newOrder.amount) || qty * 100;

    const createdOrder = {
      id: `ORD-${1000 + orders.length + 1}`,
      medicine: newOrder.medicine.trim(),
      qty,
      amount,
      status: "Pending",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setOrders((prev) => [createdOrder, ...prev]);
    setIsOrderModalOpen(false);
    resetOrderForm();
  };

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
              animate={{ x: [0, 6, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-[0_0_35px_rgba(139,92,246,0.4)]"
            >
              <User className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                User Dashboard
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Browse medicines • Place orders • Track deliveries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshDashboard}
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
                {alerts.length}
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOrderModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition shadow-[0_0_25px_rgba(99,102,241,0.35)] inline-flex items-center gap-2 font-semibold"
            >
              <ShoppingCart className="w-4 h-4" />
              New Order
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
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-white/10 p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-violet-200">Notifications</h3>
                <button onClick={() => setShowAlerts(false)} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {alerts.map((message, index) => (
                <p key={index} className="text-sm text-white/75 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                  {message}
                </p>
              ))}
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
              <Navigation className="w-4 h-4 text-cyan-400" />
              In Transit: <span className="text-white font-medium">{stats[1]?.value || 0}</span>
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
            {filteredOrders.length} Active Orders
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
              placeholder="Search medicines, categories, or brands..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full bg-white/5 text-white placeholder-white/40 pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.08 + 0.18 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`relative overflow-hidden bg-gradient-to-br ${item.gradient} rounded-2xl border border-white/10 p-4 backdrop-blur-xl`}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"
              />
              <div className="flex items-start justify-between">
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
            className="xl:col-span-2 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <button
                onClick={() => setShowAllOrders((prev) => !prev)}
                className="text-sm text-violet-300 hover:text-violet-200 inline-flex items-center gap-1"
              >
                {showAllOrders ? "Show less" : "View all"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-white/5">
              {visibleOrders.length === 0 ? (
                <div className="px-5 py-10 text-center text-white/50">No matching orders found.</div>
              ) : (
                visibleOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.06 }}
                  className="px-5 py-4 hover:bg-white/5 transition"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-white/65 text-sm">{order.medicine}</p>
                    </div>
                    <div className="flex items-center gap-5 text-sm">
                      <span className="text-white/70">Qty: {order.qty}</span>
                      <span className="font-semibold">₹{order.amount}</span>
                      <span className="text-white/60 inline-flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {order.date}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${statusStyle[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
          >
            <h2 className="text-lg font-semibold mb-4">Tracked Shipments</h2>
            <div className="space-y-4">
              {filteredShipments.length === 0 ? (
                <div className="text-center text-white/50 py-8">No matching shipments found.</div>
              ) : (
                filteredShipments.map((shipment, index) => (
                <motion.div
                  key={shipment.tracking}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42 + index * 0.06 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
                  onClick={() =>
                    setExpandedShipment((prev) =>
                      prev === shipment.tracking ? null : shipment.tracking
                    )
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{shipment.tracking}</p>
                    <Package className="w-4 h-4 text-violet-300" />
                  </div>
                  <p className="text-white/70 text-sm">{shipment.route}</p>
                  <p className="text-xs text-white/50 mt-1">ETA: {shipment.eta}</p>
                  <div className="mt-3 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${shipment.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.08 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    />
                  </div>

                  <AnimatePresence>
                    {expandedShipment === shipment.tracking && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 p-3 rounded-lg bg-slate-900/40 border border-white/10 text-xs text-white/70 space-y-1">
                          <p>Current checkpoint: Regional Distribution Center</p>
                          <p>Estimated delay: None</p>
                          <p>Support: +91 1800-123-789</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {isOrderModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.form
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                onSubmit={handleCreateOrder}
                className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Place New Order</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOrderModalOpen(false);
                      resetOrderForm();
                    }}
                    className="p-2 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1">Medicine Name</label>
                  <input
                    value={newOrder.medicine}
                    onChange={(event) =>
                      setNewOrder((prev) => ({ ...prev, medicine: event.target.value }))
                    }
                    required
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    placeholder="Enter medicine"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={newOrder.qty}
                      onChange={(event) =>
                        setNewOrder((prev) => ({ ...prev, qty: event.target.value }))
                      }
                      required
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newOrder.amount}
                      onChange={(event) =>
                        setNewOrder((prev) => ({ ...prev, amount: event.target.value }))
                      }
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      placeholder="Auto if empty"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOrderModalOpen(false);
                      resetOrderForm();
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold"
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
  );
}
