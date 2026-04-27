import React from "react";
import { X, FileText, User, Package, DollarSign, Calendar, Edit, Trash2 } from "lucide-react";

export default function OrderDetailsModal({ isOpen, onClose, order, onEdit, onDelete }) {
  if (!isOpen || !order) return null;

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-orange-400 bg-orange-500/10 border-orange-500/30",
      approved: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      processing: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      completed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      cancelled: "text-red-400 bg-red-500/10 border-red-500/30"
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  const totalAmount = order.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || order.totalAmount || 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-4xl w-full border border-white/10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Order Details</h2>
            <p className="text-white/50 text-sm">{order.orderNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(order)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400"
              title="Edit Order"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(order)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
              title="Delete Order"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white/70" />
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(order.status)}`}>
            <div className="w-2 h-2 rounded-full bg-current" />
            {order.status?.toUpperCase()}
          </span>
        </div>

        {/* Supplier & Order Info Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Supplier Info */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
              <User className="w-4 h-4" />
              Supplier
            </div>
            <p className="text-white font-semibold text-lg">
              {order.supplier?.name || 'N/A'}
            </p>
            {order.supplier?.email && (
              <p className="text-white/50 text-sm mt-1">{order.supplier.email}</p>
            )}
          </div>

          {/* Order Date */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
              <Calendar className="w-4 h-4" />
              Order Date
            </div>
            <p className="text-white font-semibold text-lg">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <p className="text-white/50 text-sm mt-1">
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            Order Items
          </h3>
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/10 text-sm font-semibold text-white/50 bg-white/5">
              <div className="col-span-5">ITEM</div>
              <div className="col-span-2 text-center">QUANTITY</div>
              <div className="col-span-2 text-right">PRICE</div>
              <div className="col-span-3 text-right">TOTAL</div>
            </div>

            {/* Table Body */}
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/5 last:border-0"
                >
                  <div className="col-span-5 text-white">
                    {item.drug?.name || item.drugName || 'Unknown Item'}
                  </div>
                  <div className="col-span-2 text-center text-white/70">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right text-white/70">
                    ₹{item.price?.toLocaleString()}
                  </div>
                  <div className="col-span-3 text-right text-white font-semibold">
                    ₹{(item.quantity * item.price)?.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-white/40">
                No items in this order
              </div>
            )}
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-purple-400" />
              <span className="text-white/70 text-lg">Total Amount</span>
            </div>
            <span className="text-3xl font-bold text-white">
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Notes Section */}
        {order.notes && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
            <h4 className="text-white/50 text-sm mb-2">Notes</h4>
            <p className="text-white">{order.notes}</p>
          </div>
        )}

        {/* Metadata - Created & Updated Times */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div className="bg-white/5 rounded-lg p-3">
            <span className="text-white/50">Created:</span>
            <p className="text-white mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <span className="text-white/50">Last Updated:</span>
            <p className="text-white mt-1">
              {new Date(order.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-xl font-semibold transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}