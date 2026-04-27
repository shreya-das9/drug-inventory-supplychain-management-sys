import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Search,
   CheckCircle,
  Clock,
  XCircle,
  Package,
  Download,
  RefreshCw,
   TrendingUp,
  ArrowUpRight
} from "lucide-react";
import axios from "axios";
import AddOrderModal from "./AddOrderModal";
import OrderDetailsModal from "./OrderDetailsModal";

export default function Orders() {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [stats, setStats] = React.useState({
    total: 0,
    pending: 0,
    approved: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    totalValue: 0
  });
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  React.useEffect(() => {
    fetchOrders();
  }, [statusFilter, currentPage, itemsPerPage, debouncedSearchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage)
      });
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (debouncedSearchQuery) {
        params.set("search", debouncedSearchQuery);
      }

      const url = `http://localhost:5000/api/admin/orders?${params.toString()}`;
      
      const [ordersResponse, statsResponse] = await Promise.all([
        axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/admin/orders/stats", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      // CRITICAL FIX: Handle different response shapes coming from backend
      // Backend typically returns: { success: true, message: '', data: { orders: [...], pagination: {...} } }
      const resp = ordersResponse.data;

      // Try to unwrap common wrappers safely
      let ordersArray = [];
      if (Array.isArray(resp)) {
        ordersArray = resp;
      } else if (resp && Array.isArray(resp.data)) {
        ordersArray = resp.data;
      } else if (resp && resp.data && Array.isArray(resp.data.orders)) {
        ordersArray = resp.data.orders;
      } else if (resp && Array.isArray(resp.orders)) {
        ordersArray = resp.orders;
      } else {
        console.warn("Unexpected API response format for orders:", resp);
        ordersArray = [];
      }
      setOrders(ordersArray);

      const paginationData = resp?.data?.pagination || resp?.pagination;
      setPagination({
        currentPage: paginationData?.currentPage || currentPage,
        totalPages: paginationData?.totalPages || 1,
        totalItems: paginationData?.totalItems || ordersArray.length,
        itemsPerPage: paginationData?.itemsPerPage || itemsPerPage
      });

      const statsPayload = statsResponse?.data?.data || statsResponse?.data || {};
      setStats({
        total: Number(statsPayload.total) || 0,
        pending: Number(statsPayload.pending) || 0,
        approved: Number(statsPayload.approved) || 0,
        processing: Number(statsPayload.processing) || 0,
        completed: Number(statsPayload.completed) || 0,
        cancelled: Number(statsPayload.cancelled) || 0,
        totalValue: Number(statsPayload.totalValue) || 0
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };
 
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "text-orange-400 bg-orange-500/10",
        icon: <Clock className="w-4 h-4" />,
        label: "Pending"
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
      completed: {
        color: "text-emerald-400 bg-emerald-500/10",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Completed"
      },
      cancelled: {
        color: "text-red-400 bg-red-500/10",
        icon: <XCircle className="w-4 h-4" />,
        label: "Cancelled"
      }
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const visibleOrders = Array.isArray(orders) ? orders : [];

  const handleExport = () => {
    const headers = ['Order Number', 'Supplier', 'Items', 'Amount', 'Date', 'Status'];
    const csvData = visibleOrders.map(o => [
      o.orderNumber,
      o.supplier?.name || 'N/A',
      o.items?.length || 0,
      o.totalAmount || 0,
      new Date(o.createdAt).toLocaleDateString(),
      o.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`Are you sure you want to delete order ${order.orderNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/admin/orders/${order._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setIsDetailsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order. Please try again.");
    }
  };

  return (
  <div className="space-y-6 pb-8">
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ x: [0, 8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          className="w-16 h-16 bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)]"
        >
          <FileText className="w-8 h-8 text-white" />
        </motion.div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">
            Orders
          </h1>
          <p className="text-sm text-white/50 flex items-center gap-2 mt-1">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-emerald-400 rounded-full"
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
          onClick={handleExport}
          className="px-5 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-xl font-semibold flex items-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all"
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
          <Package className="w-4 h-4 text-purple-400" />
          Processing: <span className="text-white font-medium">{stats.processing} Orders</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2 text-sm text-white/70"
        >
          <div className="w-2 h-2 bg-purple-400 rounded-full" />
          {stats.total} Active Orders
        </motion.div>
      </div>
    </motion.div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {[
        { label: "Total", value: stats.total, gradient: "from-purple-500/20 to-violet-500/20", border: "border-purple-500/30", icon: <FileText className="w-6 h-6" />, iconBg: "from-purple-500 to-violet-500", trend: "+15%", chart: [65, 70, 68, 72, 75, 78, 80] },
        { label: "Pending", value: stats.pending, gradient: "from-orange-500/20 to-amber-500/20", border: "border-orange-500/30", icon: <Clock className="w-6 h-6" />, iconBg: "from-orange-500 to-amber-500", trend: "+8%", chart: [30, 32, 34, 33, 36, 35, 38] },
        { label: "Approved", value: stats.approved, gradient: "from-blue-500/20 to-indigo-500/20", border: "border-blue-500/30", icon: <CheckCircle className="w-6 h-6" />, iconBg: "from-blue-500 to-indigo-500", trend: "+12%", chart: [45, 48, 50, 52, 54, 56, 58] },
        { label: "Processing", value: stats.processing, gradient: "from-amber-500/20 to-yellow-500/20", border: "border-amber-500/30", icon: <Package className="w-6 h-6" />, iconBg: "from-amber-500 to-yellow-500", trend: "+10%", chart: [35, 38, 40, 42, 41, 45, 47] },
        { label: "Completed", value: stats.completed, gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30", icon: <CheckCircle className="w-6 h-6" />, iconBg: "from-emerald-500 to-teal-500", trend: "+20%", chart: [50, 54, 58, 60, 64, 68, 72] },
        { label: "Cancelled", value: stats.cancelled, gradient: "from-red-500/20 to-rose-500/20", border: "border-red-500/30", icon: <XCircle className="w-6 h-6" />, iconBg: "from-red-500 to-rose-500", trend: "-5%", chart: [20, 22, 21, 23, 22, 24, 23] },
        { label: "Total Value", value: `₹${stats.totalValue.toLocaleString()}`, gradient: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", icon: <TrendingUp className="w-6 h-6" />, iconBg: "from-purple-500 to-pink-500", trend: "+25%", chart: [70, 72, 75, 78, 82, 86, 90] }
      ].map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: index * 0.08 + 0.2 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} backdrop-blur-xl rounded-2xl p-4 border ${stat.border} shadow-[0_8px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform`}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                className={`w-10 h-10 bg-gradient-to-br ${stat.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}
              >
                {stat.icon}
              </motion.div>
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <p className="text-white/60 text-xs mt-1">{stat.label}</p>
            <div className="flex items-end gap-1 h-5 mt-2">
              {stat.chart.map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.08 + i * 0.04 + 0.3, duration: 0.4 }}
                  className={`flex-1 bg-gradient-to-t ${stat.iconBg} rounded-t opacity-40`}
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
      transition={{ delay: 0.35 }}
      className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by order number or supplier..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white/5 text-white placeholder-white/30 pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-800 text-white px-6 py-4 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none cursor-pointer backdrop-blur-xl"
            style={{ backgroundImage: 'none' }}
          >
            <option value="all" className="bg-slate-800 text-white">All Status</option>
            <option value="pending" className="bg-slate-800 text-white">Pending</option>
            <option value="approved" className="bg-slate-800 text-white">Approved</option>
            <option value="processing" className="bg-slate-800 text-white">Processing</option>
            <option value="completed" className="bg-slate-800 text-white">Completed</option>
            <option value="cancelled" className="bg-slate-800 text-white">Cancelled</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-4 rounded-xl font-semibold shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all"
          >
            <Plus className="w-5 h-5" />
            New Order
          </motion.button>

          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-800 text-white px-4 py-4 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none cursor-pointer backdrop-blur-xl"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>
    </motion.div>

    {/* Orders Table */}
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-sm font-semibold text-white/50">
        <div className="col-span-3">ORDER DETAILS</div>
        <div className="col-span-2">SUPPLIER</div>
        <div className="col-span-1">ITEMS</div>
        <div className="col-span-2">AMOUNT</div>
        <div className="col-span-2">DATE</div>
        <div className="col-span-1">STATUS</div>
        <div className="col-span-1 text-right">ACTIONS</div>
      </div>

      {/* Table Body */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
          />
        </motion.div>
      ) : visibleOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <FileText className="w-20 h-20 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-lg">No orders found</p>
        </motion.div>
      ) : (
        visibleOrders.map((order, index) => {
          const statusConfig = getStatusConfig(order.status);
          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center"
            >
              {/* Order Details */}
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-white/50">Order ID</p>
                </div>
              </div>

              {/* Supplier */}
              <div className="col-span-2 text-white/70 text-sm">
                {order.supplier?.name || 'N/A'}
              </div>

              {/* Items */}
              <div className="col-span-1 text-white/70 text-sm">
                {order.items?.length || 0} items
              </div>

              {/* Amount */}
              <div className="col-span-2 text-white font-semibold">
                ₹{order.totalAmount?.toLocaleString() || 0}
              </div>

              {/* Date */}
              <div className="col-span-2 text-white/70 text-sm">
                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Status */}
              <div className="col-span-1">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleViewDetails(order)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowUpRight className="w-5 h-5 text-purple-400" />
                </motion.button>
              </div>
            </motion.div>
          );
        })
      )}
    </div>

    {!loading && pagination.totalPages > 1 && (
      <div className="flex items-center justify-between gap-4 px-4">
        <p className="text-sm text-white/60">
          Showing page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalItems} orders
        </p>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/80 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition"
          >
            Previous
          </motion.button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, pagination.currentPage - 3), Math.min(pagination.totalPages, pagination.currentPage + 2))
            .map((page) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg border transition ${
                  pagination.currentPage === page
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                }`}
              >
                {page}
              </motion.button>
            ))}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/80 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition"
          >
            Next
          </motion.button>
        </div>
      </div>
    )}

    {/* Modals */}
    <AddOrderModal
      isOpen={isAddModalOpen}
      onClose={() => setIsAddModalOpen(false)}
      onSuccess={fetchOrders}
    />

    <OrderDetailsModal
      isOpen={isDetailsModalOpen}
      onClose={() => {
        setIsDetailsModalOpen(false);
        setSelectedOrder(null);
      }}
      order={selectedOrder}
      onEdit={() => {}}
      onDelete={handleDelete}
    />
  </div>
);
}