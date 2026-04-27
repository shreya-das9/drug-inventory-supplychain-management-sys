import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, MapPin, Building, CreditCard, Calendar, FileText, Edit, Trash2 } from "lucide-react";

export default function SupplierDetailsModal({ isOpen, onClose, supplier, onEdit, onDelete }) {
  if (!supplier) return null;

  const getStatusConfig = (status) => {
    const configs = {
      APPROVED: {
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        label: "Approved"
      },
      PENDING: {
        color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
        label: "Pending"
      },
      REJECTED: {
        color: "text-red-400 bg-red-500/10 border-red-500/30",
        label: "Rejected"
      }
    };
    return configs[status] || configs.PENDING;
  };

  const statusConfig = getStatusConfig(supplier.status);

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
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.5)] w-full max-w-3xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-white">
                        {supplier.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {supplier.name}
                      </h2>
                      <p className="text-sm text-white/50 mt-1">{supplier.contactPerson || 'No contact person'}</p>
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
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <Mail className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-white/50">Email</p>
                        <p className="text-sm text-white">{supplier.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <Phone className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-white/50">Phone</p>
                        <p className="text-sm text-white">{supplier.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                {(supplier.address || supplier.city || supplier.state || supplier.zipCode || supplier.country) && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
                      Address Information
                    </h3>
                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <MapPin className="w-5 h-5 text-purple-400 mt-1" />
                      <div>
                        <p className="text-xs text-white/50 mb-1">Address</p>
                        <p className="text-sm text-white">
                          {supplier.address && <>{supplier.address}<br /></>}
                          {(supplier.city || supplier.state || supplier.zipCode) && (
                            <>{supplier.city}{supplier.city && supplier.state && ', '}{supplier.state} {supplier.zipCode}<br /></>
                          )}
                          {supplier.country}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Business Information */}
                {(supplier.taxId || supplier.paymentTerms || supplier.bankDetails) && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {supplier.taxId && (
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                          <Building className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-xs text-white/50">Tax ID / VAT Number</p>
                            <p className="text-sm text-white">{supplier.taxId}</p>
                          </div>
                        </div>
                      )}
                      {supplier.paymentTerms && (
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                          <Calendar className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-xs text-white/50">Payment Terms</p>
                            <p className="text-sm text-white">{supplier.paymentTerms}</p>
                          </div>
                        </div>
                      )}
                      {supplier.bankDetails && (
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                          <CreditCard className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-xs text-white/50">Bank Details</p>
                            <p className="text-sm text-white">{supplier.bankDetails}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {supplier.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
                      Notes
                    </h3>
                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <FileText className="w-5 h-5 text-purple-400 mt-1" />
                      <p className="text-sm text-white/70">{supplier.notes}</p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {(supplier.createdAt || supplier.updatedAt) && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-white/40">
                      {supplier.createdAt && (
                        <span>Created: {new Date(supplier.createdAt).toLocaleDateString()}</span>
                      )}
                      {supplier.updatedAt && (
                        <span>Last Updated: {new Date(supplier.updatedAt).toLocaleDateString()}</span>
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
                  onClick={() => onDelete(supplier)}
                  className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-all border border-red-500/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Supplier
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
                    onClick={() => onEdit(supplier)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-xl font-semibold shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Supplier
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
              background: rgba(168, 85, 247, 0.5);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(168, 85, 247, 0.7);
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
