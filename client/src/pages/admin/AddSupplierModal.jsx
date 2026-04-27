import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2 } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default function AddSupplierModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    taxId: "",
    paymentTerms: "",
    bankDetails: "",
    notes: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Supplier name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Phone number is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      await axios.post(
        "http://localhost:5000/api/admin/suppliers",
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Reset form
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        taxId: "",
        paymentTerms: "",
        bankDetails: "",
        notes: ""
      });
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
    } catch (error) {
      console.error("Error adding supplier:", error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Failed to add supplier. Please try again." });
      }
    } finally {
      setLoading(false);
    }
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
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                    Add New Supplier
                  </h2>
                  <p className="text-sm text-white/50 mt-1">Fill in the supplier details below</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white/70" />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                {errors.submit && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                  >
                    {errors.submit}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Basic Information */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
                      Basic Information
                    </h3>
                  </div>

                  {/* Supplier Name */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Supplier Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border ${
                        errors.name ? 'border-red-500/50' : 'border-white/10'
                      } focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                      placeholder="Enter supplier name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="Enter contact person name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border ${
                        errors.email ? 'border-red-500/50' : 'border-white/10'
                      } focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                      placeholder="supplier@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border ${
                        errors.phone ? 'border-red-500/50' : 'border-white/10'
                      } focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
                    )}
                  </div>

                  {/* Address Section */}
                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
                      Address Information
                    </h3>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="123 Main Street"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="New York"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="NY"
                    />
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Zip/Postal Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="10001"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="United States"
                    />
                  </div>

                  {/* Additional Information */}
                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
                      Additional Information
                    </h3>
                  </div>

                  {/* Tax ID */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Tax ID / VAT Number
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="XX-XXXXXXX"
                    />
                  </div>

                  {/* Payment Terms */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      name="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={handleChange}
                      className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="Net 30"
                    />
                  </div>

                  {/* Bank Details */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Bank Details
                    </label>
                    <input
                      type="text"
                      name="bankDetails"
                      value={formData.bankDetails}
                      onChange={handleChange}
                      className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="Account number, routing number, etc."
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-white/5 text-white placeholder-white/30 px-4 py-3 rounded-xl border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                      placeholder="Additional notes about the supplier..."
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-xl font-semibold shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Supplier'
                    )}
                  </motion.button>
                </div>
              </form>
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
