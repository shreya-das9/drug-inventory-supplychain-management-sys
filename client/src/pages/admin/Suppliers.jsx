import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Plus, 
  Search,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Download,
  RefreshCw,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import axios from "axios";
import AddSupplierModal from "./AddSupplierModal";
import SupplierDetailsModal from "./SupplierDetailsModal";
import EditSupplierModal from "./EditSupplierModal";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchSuppliers();
  }, [statusFilter]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.menu-container')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url = statusFilter === "all" 
        ? "http://localhost:5000/api/admin/suppliers"
        : `http://localhost:5000/api/admin/suppliers?status=${statusFilter}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      setSuppliers(data);
      
      // Calculate stats
      const stats = {
        total: data.length,
        approved: data.filter(s => s.status === 'APPROVED').length,
        pending: data.filter(s => s.status === 'PENDING').length,
        rejected: data.filter(s => s.status === 'REJECTED').length
      };
      setStats(stats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      APPROVED: {
        color: "text-emerald-400 bg-emerald-500/10",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Approved"
      },
      PENDING: {
        color: "text-orange-400 bg-orange-500/10",
        icon: <Clock className="w-4 h-4" />,
        label: "Pending"
      },
      REJECTED: {
        color: "text-red-400 bg-red-500/10",
        icon: <XCircle className="w-4 h-4" />,
        label: "Rejected"
      }
    };
    return configs[status] || configs.PENDING;
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    // Convert suppliers to CSV
    const headers = ['Name', 'Contact Person', 'Email', 'Phone', 'Status', 'Address', 'City', 'State', 'Country'];
    const csvData = filteredSuppliers.map(s => [
      s.name,
      s.contactPerson || '',
      s.email || '',
      s.phone || '',
      s.status,
      s.address || '',
      s.city || '',
      s.state || '',
      s.country || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suppliers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (supplier) => {
    if (!window.confirm(`Are you sure you want to delete ${supplier.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/admin/suppliers/${supplier._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Close modals and refresh
      setIsDetailsModalOpen(false);
      setOpenMenuId(null);
      fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      alert("Failed to delete supplier. Please try again.");
    }
  };

  const toggleMenu = (supplierId) => {
    setOpenMenuId(openMenuId === supplierId ? null : supplierId);
  };

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
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="w-16 h-16 bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)]"
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">
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
            <TrendingUp className="w-4 h-4 text-purple-400" />
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
            {stats.total} Active Suppliers
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: "Approved", 
            value: stats.approved, 
            gradient: "from-emerald-500/20 via-teal-500/20 to-green-500/20",
            border: "border-emerald-500/30",
            icon: <CheckCircle className="w-7 h-7" />,
            iconBg: "from-emerald-500 to-teal-500",
            trend: "+12%",
            chart: [60, 65, 68, 70, 75, 78, 80]
          },
          { 
            label: "Pending", 
            value: stats.pending, 
            gradient: "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
            border: "border-orange-500/30",
            icon: <Clock className="w-7 h-7" />,
            iconBg: "from-orange-500 to-amber-500",
            trend: "+8%",
            chart: [20, 22, 25, 23, 26, 28, 30]
          },
          { 
            label: "Rejected", 
            value: stats.rejected, 
            gradient: "from-red-500/20 via-rose-500/20 to-pink-500/20",
            border: "border-red-500/30",
            icon: <XCircle className="w-7 h-7" />,
            iconBg: "from-red-500 to-rose-500",
            trend: "+5%",
            chart: [10, 12, 11, 13, 15, 14, 16]
          },
          { 
            label: "Total Suppliers", 
            value: stats.total, 
            gradient: "from-purple-500/20 via-violet-500/20 to-purple-600/20",
            border: "border-purple-500/30",
            icon: <FileText className="w-7 h-7" />,
            iconBg: "from-purple-500 to-violet-500",
            trend: "+15%",
            chart: [70, 75, 78, 80, 85, 88, 90]
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
                    {stat.trend} vs last week
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
              placeholder="Search suppliers by name, email, or contact person..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 text-white placeholder-white/30 pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          <div className="flex gap-3">
            <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="bg-slate-800 text-white px-6 py-4 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none cursor-pointer backdrop-blur-xl"
  style={{
    backgroundImage: 'none'
  }}
>
  <option value="all" className="bg-slate-800 text-white">All Status</option>
  <option value="APPROVED" className="bg-slate-800 text-white">Approved</option>
  <option value="PENDING" className="bg-slate-800 text-white">Pending</option>
  <option value="REJECTED" className="bg-slate-800 text-white">Rejected</option>
</select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-4 rounded-xl font-semibold shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all"
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
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
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
            <p className="text-white/30 text-sm mt-2">
              {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filter' : 'Create your first supplier to get started'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSuppliers.map((supplier, index) => {
              const statusConfig = getStatusConfig(supplier.status);
              return (
                <motion.div
                  key={supplier._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.3)] hover:border-purple-500/30 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-violet-500/0 to-purple-600/0 group-hover:from-purple-500/5 group-hover:via-violet-500/5 group-hover:to-purple-600/5 transition-all duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.05, 1],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.1
                          }}
                          className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg"
                        >
                          <span className="text-2xl font-bold text-white">
                            {supplier.name[0].toUpperCase()}
                          </span>
                        </motion.div>
                        <div>
                          <p className="font-bold text-white text-lg">{supplier.name}</p>
                          <p className="text-xs text-white/50">{supplier.contactPerson || 'No contact person'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                        <div className="relative menu-container">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleMenu(supplier._id)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-white/50" />
                          </motion.button>
                          
                          {/* Dropdown Menu */}
                          <AnimatePresence>
                            {openMenuId === supplier._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-lg overflow-hidden z-10"
                              >
                                <motion.button
                                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                  onClick={() => handleViewDetails(supplier)}
                                  className="w-full px-4 py-3 text-left text-sm text-white flex items-center gap-3 transition-colors"
                                >
                                  <Eye className="w-4 h-4 text-purple-400" />
                                  View Details
                                </motion.button>
                                <motion.button
                                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                  onClick={() => handleEdit(supplier)}
                                  className="w-full px-4 py-3 text-left text-sm text-white flex items-center gap-3 transition-colors"
                                >
                                  <Edit className="w-4 h-4 text-blue-400" />
                                  Edit Supplier
                                </motion.button>
                                <motion.button
                                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                  onClick={() => handleDelete(supplier)}
                                  className="w-full px-4 py-3 text-left text-sm text-red-400 flex items-center gap-3 transition-colors border-t border-white/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Supplier
                                </motion.button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                        <Mail className="w-4 h-4 text-purple-400" />
                        <span className="text-sm truncate">{supplier.email || 'No email provided'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                        <Phone className="w-4 h-4 text-purple-400" />
                        <span className="text-sm">{supplier.phone || 'No phone provided'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span className="text-sm truncate">{supplier.address || 'No address provided'}</span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewDetails(supplier)}
                      className="w-full mt-4 py-2 bg-gradient-to-r from-purple-600/20 to-violet-600/20 hover:from-purple-600/30 hover:to-violet-600/30 rounded-xl text-sm font-medium text-purple-400 border border-purple-500/20 transition-all"
                    >
                      View Details →
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Add Supplier Modal */}
      <AddSupplierModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSuppliers}
      />

      {/* Supplier Details Modal */}
      <SupplierDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Supplier Modal */}
      <EditSupplierModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
        onSuccess={fetchSuppliers}
      />
    </div>
  );
}
