
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";

export default function Drugs() {
  const { request, loading } = useApi();
  const [drugs, setDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDrug, setEditingDrug] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDrugs();
  }, [currentPage, searchTerm]);

  const fetchDrugs = async () => {
    try {
      setError("");
      const url = `/api/admin/drugs?page=${currentPage}&limit=10&search=${encodeURIComponent(searchTerm)}`;
      const response = await request("GET", url);
      
      if (response?.success) {
        setDrugs(response.drugs || []);
        setTotalPages(Math.ceil((response.total || 0) / 10));
      } else if (response?.drugs) {
        // Handle case where response doesn't have success flag
        setDrugs(response.drugs || []);
        setTotalPages(Math.ceil((response.total || response.drugs.length) / 10));
      }
    } catch (error) {
      console.error("Error fetching drugs:", error);
      setError("Failed to load drugs");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this drug?")) return;

    try {
      setError("");
      const response = await request("DELETE", `/api/admin/drugs/${id}`, {});
      
      if (response?.success || response?.message) {
        alert("Drug deleted successfully!");
        fetchDrugs();
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Error deleting drug:", error);
      setError("Failed to delete drug");
      alert("Failed to delete drug");
    }
  };

  const handleEdit = (drug) => {
    setEditingDrug(drug);
    setShowAddModal(true);
  };

  const handleAddOrUpdate = async (formData) => {
    try {
      setError("");
      const isEditing = !!editingDrug;
      const url = isEditing ? `/api/admin/drugs/${editingDrug._id}` : "/api/admin/drugs";
      const method = isEditing ? "PUT" : "POST";

      const response = await request(method, url, formData);

      if (response?.success || response?.drug || response?.message) {
        alert(isEditing ? "Drug updated successfully!" : "Drug added successfully!");
        setShowAddModal(false);
        setEditingDrug(null);
        fetchDrugs();
      } else {
        throw new Error("Save failed");
      }
    } catch (error) {
      console.error("Error saving drug:", error);
      setError("Failed to save drug");
      alert("Failed to save drug. Check console for details.");
    }
  };

  if (loading && drugs.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">Loading drugs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Drugs Inventory</h1>
        <button
          onClick={() => {
            setEditingDrug(null);
            setShowAddModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Add Drug
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search drugs by name, batch, or manufacturer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                setCurrentPage(1);
                fetchDrugs();
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              setCurrentPage(1);
              fetchDrugs();
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            Search
          </button>
        </div>
      </div>

      {/* Drugs Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {drugs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No drugs found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drugs.map((drug) => (
                <tr key={drug._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{drug.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{drug.manufacturer || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{drug.batchNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">${drug.price || "0"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {drug.expiryDate ? new Date(drug.expiryDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(drug)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(drug._id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 items-center">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <DrugModal
          drug={editingDrug}
          onClose={() => {
            setShowAddModal(false);
            setEditingDrug(null);
          }}
          onSave={handleAddOrUpdate}
        />
      )}
    </div>
  );
}

// Drug Modal Component
function DrugModal({ drug, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: drug?.name || "",
    manufacturer: drug?.manufacturer || "",
    batchNumber: drug?.batchNumber || "",
    price: drug?.price || "",
    expiryDate: drug?.expiryDate ? new Date(drug.expiryDate).toISOString().split("T")[0] : "",
    category: drug?.category || "",
    description: drug?.description || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.batchNumber.trim()) {
      alert("Please fill in required fields (Name and Batch Number)");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{drug ? "Edit Drug" : "Add New Drug"}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter drug name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter manufacturer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number *</label>
            <input
              type="text"
              required
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter batch number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {drug ? "Update Drug" : "Add Drug"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}