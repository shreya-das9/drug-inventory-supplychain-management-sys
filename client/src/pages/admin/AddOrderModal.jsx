import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import axios from "axios";

export default function AddOrderModal({ isOpen, onClose, onSuccess }) {
  const [suppliers, setSuppliers] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [formData, setFormData] = useState({
    supplier: "",
    items: [{ drug: "", quantity: 1, price: 0 }],
    status: "pending",
    notes: ""
  });

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
      fetchDrugs();
    }
  }, [isOpen]);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/admin/suppliers", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const payload = response.data;
      const supplierList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.data?.suppliers)
            ? payload.data.suppliers
            : Array.isArray(payload?.suppliers)
              ? payload.suppliers
              : [];

      setSuppliers(supplierList);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchDrugs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/admin/drugs", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const payload = response.data;
      const drugList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.data?.drugs)
            ? payload.data.drugs
            : Array.isArray(payload?.drugs)
              ? payload.drugs
              : [];

      setDrugs(drugList);
    } catch (error) {
      console.error("Error fetching drugs:", error);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { drug: "", quantity: 1, price: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === "drug") {
      const selectedDrug = drugs.find(d => d._id === value);
      if (selectedDrug) {
        newItems[index].price = selectedDrug.price || 0;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.supplier) {
      alert("Please select a supplier");
      return;
    }
    
    if (formData.items.length === 0 || !formData.items[0].drug) {
      alert("Please add at least one item");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/admin/orders",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onSuccess();
      onClose();
      
      setFormData({
        supplier: "",
        items: [{ drug: "", quantity: 1, price: 0 }],
        status: "pending",
        notes: ""
      });
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    }
  };

  if (!isOpen) return null;

  const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-3xl w-full border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-6 h-6 text-white/70" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Supplier *</label>
            <select
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none"
              required
            >
              <option value="" className="bg-slate-800">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id} className="bg-slate-800">
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white">Order Items *</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start bg-white/5 p-4 rounded-xl">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <select
                      value={item.drug}
                      onChange={(e) => handleItemChange(index, "drug", e.target.value)}
                      className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-purple-500/50 focus:outline-none text-sm"
                      required
                    >
                      <option value="" className="bg-slate-800">Select Drug</option>
                      {drugs.map((drug) => (
                        <option key={drug._id} value={drug._id} className="bg-slate-800">
                          {drug.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                      placeholder="Quantity"
                      className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-purple-500/50 focus:outline-none text-sm"
                      required
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value))}
                      placeholder="Price"
                      className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-purple-500/50 focus:outline-none text-sm"
                      required
                    />
                  </div>

                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none"
            >
              <option value="pending" className="bg-slate-800">Pending</option>
              <option value="approved" className="bg-slate-800">Approved</option>
              <option value="processing" className="bg-slate-800">Processing</option>
              <option value="completed" className="bg-slate-800">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes or special instructions..."
              rows="3"
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none resize-none"
            />
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Total Amount:</span>
              <span className="text-2xl font-bold text-white">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-xl font-semibold transition-all shadow-lg"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}