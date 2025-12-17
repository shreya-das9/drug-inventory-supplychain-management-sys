import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../../hooks/useApi";
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

export default function Suppliers() {
  const { request, loading } = useApi();
  
  const [suppliers, setSuppliers] = useState([]);
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

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [approvingSupplier, setApprovingSupplier] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contactPerson: '',
    address: ''
  });
  const [approvalData, setApprovalData] = useState({
    status: 'APPROVED',
    rejectionReason: ''
  });

  useEffect(() => {
    fetchSuppliers();
    fetchStats();
  }, [statusFilter, currentPage, searchQuery]);

  const fetchSuppliers = async () => {
    try {
      let url = `/api/admin/suppliers?page=${currentPage}&limit=${itemsPerPage}`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      
      const response = await request("GET", url);
      
      if (response?.success || response?.data) {
        const data = response.data || response;
        setSuppliers(data.suppliers || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await request("GET", "/api/admin/suppliers/stats");
      if (response?.success || response?.data) {
        setStats(response.data || response);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleAddSupplier = async () => {
    try {
      if (!formData.name || !formData.email || !formData.phone || !formData.contactPerson) {
        alert('Please fill all required fields');
        return;
      }
      
      const response = await request("POST", "/api/admin/suppliers", formData);
      if (response?.success) {
        alert('Supplier added successfully!');
        setFormData({ name: '', email: '', phone: '', contactPerson: '', address: '' });
        setShowAddModal(false);
        fetchSuppliers();
        fetchStats();
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
      alert('Failed to add supplier');
    }
  };

  const handleUpdateSupplier = async () => {
    try {
      if (!formData.name || !formData.email || !formData.phone || !formData.contactPerson) {
        alert('Please fill all required fields');
        return;
      }
      
      const response = await request("PUT", `/api/admin/suppliers/${editingSupplier._id}`, formData);
      if (response?.success) {
        alert('Supplier updated successfully!');
        setFormData({ name: '', email: '', phone: '', contactPerson: '', address: '' });
        setShowEditModal(false);
        setEditingSupplier(null);
        fetchSuppliers();
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      alert('Failed to update supplier');
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
      const response = await request("DELETE", `/api/admin/suppliers/${supplierId}`);
      if (response?.success) {
        alert('Supplier deleted successfully!');
        fetchSuppliers();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      alert('Failed to delete supplier');
    }
  };

  const handleApproveSupplier = async () => {
    try {
      if (approvalData.status === 'REJECTED' && !approvalData.rejectionReason) {
        alert('Please provide a rejection reason');
        return;
      }
      
      const response = await request("PATCH", `/api/admin/suppliers/${approvingSupplier._id}/approve`, approvalData);
      if (response?.success) {
        alert(`Supplier ${approvalData.status} successfully!`);
        setShowApprovalModal(false);
        setApprovingSupplier(null);
        setApprovalData({ status: 'APPROVED', rejectionReason: '' });
        fetchSuppliers();
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating supplier status:", error);
      alert('Failed to update supplier status');
    }
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      contactPerson: supplier.contactPerson,
      address: supplier.address
    });
    setShowEditModal(true);
  };

  const openApprovalModal = (supplier) => {
    setApprovingSupplier(supplier);
    setApprovalData({ status: 'APPROVED', rejectionReason: '' });
    setShowApprovalModal(true);
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
              onClick={() => {
                setFormData({ name: '', email: '', phone: '', contactPerson: '', address: '' });
                setShowAddModal(true);
              }}
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

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(supplier.status)}`}>
                      {getStatusIcon(supplier.status)}
                      {supplier.status?.toUpperCase()}
                    </span>
                    <div className="flex gap-2">
                      {supplier.status?.toUpperCase() === 'PENDING' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openApprovalModal(supplier)}
                          className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
                        >
                          Approve
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(supplier)}
                        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteSupplier(supplier._id)}
                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                      >
                        Delete
                      </motion.button>
                    </div>
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

      {/* Add Supplier Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Add New Supplier</h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Supplier Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Contact Person *"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddSupplier}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-semibold"
                >
                  {loading ? 'Adding...' : 'Add Supplier'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Supplier Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Edit Supplier</h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Supplier Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Contact Person *"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpdateSupplier}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-semibold"
                >
                  {loading ? 'Updating...' : 'Update Supplier'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApprovalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                {approvingSupplier?.name}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    Decision
                  </label>
                  <select
                    value={approvalData.status}
                    onChange={(e) => setApprovalData({ ...approvalData, status: e.target.value })}
                    className="w-full bg-white/5 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none"
                  >
                    <option value="APPROVED">Approve</option>
                    <option value="REJECTED">Reject</option>
                  </select>
                </div>

                {approvalData.status === 'REJECTED' && (
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      placeholder="Please provide a reason for rejection"
                      value={approvalData.rejectionReason}
                      onChange={(e) => setApprovalData({ ...approvalData, rejectionReason: e.target.value })}
                      className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:outline-none resize-none"
                      rows="4"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApproveSupplier}
                  disabled={loading}
                  className={`flex-1 ${approvalData.status === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'} disabled:opacity-50 text-white px-4 py-3 rounded-xl font-semibold`}
                >
                  {loading ? 'Processing...' : approvalData.status === 'APPROVED' ? 'Approve' : 'Reject'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}