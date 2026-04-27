import { motion, AnimatePresence } from "framer-motion";
import { X, Package, MapPin, Calendar, DollarSign, Truck, User, Building, Phone, Mail, Edit, Trash2 } from "lucide-react";

export default function ShipmentDetailsModal({ isOpen, onClose, shipment, onEdit, onDelete }) {
  if (!shipment) return null;

  const getStatusConfig = (status) => {
    const configs = {
      delivered: {
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        label: "Delivered"
      },
      "in-transit": {
        color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
        label: "In Transit"
      },
      in_transit: {
        color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
        label: "In Transit"
      },
      shipped: {
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
        label: "Shipped"
      },
      processing: {
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        label: "Processing"
      },
      pending: {
        color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
        label: "Pending"
      }
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const statusConfig = getStatusConfig(shipment.status);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.5)] w-full max-w-4xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Truck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {shipment.trackingNumber}
                      </h2>
                      <p className="text-sm text-white/50 mt-1">{shipment.supplier?.name || 'Unknown Supplier'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <X className="w-6 h-6 text-white/70" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <DollarSign className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-xs text-white/50">Total Amount</p>
                      <p className="text-lg font-bold text-white">₹{shipment.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <Package className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-xs text-white/50">Items</p>
                      <p className="text-lg font-bold text-white">{shipment.items?.length || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-xs text-white/50">Expected Delivery</p>
                      <p className="text-sm font-semibold text-white">
                        {new Date(shipment.expectedDeliveryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Destination Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                    Destination
                  </h3>
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <MapPin className="w-5 h-5 text-cyan-400 mt-1" />
                    <div>
                      <p className="text-xs text-white/50 mb-1">Shipping Address</p>
                      <p className="text-sm text-white">
                        {shipment.destination?.address && <>{shipment.destination.address}<br /></>}
                        {shipment.destination?.city}, {shipment.destination?.state} {shipment.destination?.zipCode}
                        {shipment.destination?.country && <><br />{shipment.destination.country}</>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Supplier Information */}
                {shipment.supplier && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                      Supplier Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                        <Building className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-xs text-white/50">Company</p>
                          <p className="text-sm text-white">{shipment.supplier.name}</p>
                        </div>
                      </div>
                      {shipment.supplier.contactPerson && (
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                          <User className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="text-xs text-white/50">Contact Person</p>
                            <p className="text-sm text-white">{shipment.supplier.contactPerson}</p>
                          </div>
                        </div>
                      )}
                      {shipment.supplier.email && (
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                          <Mail className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="text-xs text-white/50">Email</p>
                            <p className="text-sm text-white">{shipment.supplier.email}</p>
                          </div>
                        </div>
                      )}
                      {shipment.supplier.phone && (
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                          <Phone className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="text-xs text-white/50">Phone</p>
                            <p className="text-sm text-white">{shipment.supplier.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                {shipment.items && shipment.items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                      Items ({shipment.items.length})
                    </h3>
                    <div className="space-y-3">
                      {shipment.items.map((item, index) => (
                        <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-white">{item.drug?.name || item.name || 'Unknown Item'}</p>
                              <p className="text-xs text-white/50 mt-1">Quantity: {item.quantity}</p>
                            </div>
                            {item.price && (
                              <p className="text-sm font-bold text-cyan-400">₹{item.price.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shipment.shippedDate && (
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-white/50">Shipped Date</p>
                        <p className="text-sm text-white">{formatDate(shipment.shippedDate)}</p>
                      </div>
                    </div>
                  )}
                  {shipment.deliveredDate && (
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-xs text-white/50">Delivered Date</p>
                        <p className="text-sm text-white">{formatDate(shipment.deliveredDate)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {shipment.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                      Notes
                    </h3>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm text-white/70">{shipment.notes}</p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {(shipment.createdAt || shipment.updatedAt) && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-white/40">
                      {shipment.createdAt && (
                        <span>Created: {formatDate(shipment.createdAt)}</span>
                      )}
                      {shipment.updatedAt && (
                        <span>Last Updated: {formatDate(shipment.updatedAt)}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between p-6 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDelete(shipment)}
                  className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-all border border-red-500/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Shipment
                </motion.button>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all"
                  >
                    Close
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onEdit(shipment)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Shipment
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(34, 211, 238, 0.5);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(34, 211, 238, 0.7);
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}