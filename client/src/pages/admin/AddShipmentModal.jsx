import React from "react";

export default function AddShipmentModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = React.useState(false);
  const [suppliers, setSuppliers] = React.useState([]);
  const [drugs, setDrugs] = React.useState([]);
  const [formData, setFormData] = React.useState({
    trackingNumber: "",
    supplier: "",
    status: "pending",
    expectedDeliveryDate: "",
    destination: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India"
    },
    items: [],
    notes: ""
  });
  const [currentItem, setCurrentItem] = React.useState({
    drug: "",
    quantity: 1,
    price: 0
  });

  React.useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
      fetchDrugs();
    }
  }, [isOpen]);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/admin/suppliers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.error("Failed to fetch suppliers");
        return;
      }
      
      const data = await response.json();
      const approved = Array.isArray(data) ? data.filter(s => s.status === 'APPROVED') : [];
      setSuppliers(approved);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setSuppliers([]);
    }
  };

  const fetchDrugs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/admin/drugs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.error("Failed to fetch drugs");
        return;
      }
      
      const data = await response.json();
      setDrugs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching drugs:", error);
      setDrugs([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('destination.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        destination: {
          ...prev.destination,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addItem = () => {
    if (!currentItem.drug || currentItem.quantity < 1) {
      alert("Please select a drug and enter quantity");
      return;
    }

    const drug = drugs.find(d => d._id === currentItem.drug);
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        drug: currentItem.drug,
        drugName: drug?.name || "Unknown",
        quantity: parseInt(currentItem.quantity),
        price: parseFloat(currentItem.price) || 0
      }]
    }));

    setCurrentItem({
      drug: "",
      quantity: 1,
      price: 0
    });
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.trackingNumber.trim()) {
      alert("Tracking number is required");
      return false;
    }
    if (!formData.supplier) {
      alert("Supplier is required");
      return false;
    }
    if (!formData.expectedDeliveryDate) {
      alert("Expected delivery date is required");
      return false;
    }
    if (!formData.destination.city) {
      alert("City is required");
      return false;
    }
    if (!formData.destination.state) {
      alert("State is required");
      return false;
    }
    if (formData.items.length === 0) {
      alert("At least one item is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const totalAmount = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const shipmentData = {
        ...formData,
        totalAmount
      };

      const response = await fetch("http://localhost:5000/api/admin/shipments", {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shipmentData)
      });

      if (!response.ok) {
        throw new Error("Failed to create shipment");
      }

      // Reset form
      setFormData({
        trackingNumber: "",
        supplier: "",
        status: "pending",
        expectedDeliveryDate: "",
        destination: {
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India"
        },
        items: [],
        notes: ""
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      alert("Shipment created successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding shipment:", error);
      alert("Failed to add shipment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflow: 'auto',
          color: 'white',
          boxShadow: '0 20px 80px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'sticky',
          top: 0,
          backgroundColor: '#1e293b',
          zIndex: 1
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>New Shipment</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>
                Create a new shipment
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                fontSize: '24px',
                padding: '8px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Tracking Number */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Tracking Number <span style={{ color: '#fca5a5' }}>*</span>
              </label>
              <input
                type="text"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                placeholder="SHP123456789"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Supplier */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Supplier <span style={{ color: '#fca5a5' }}>*</span>
              </label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="" style={{ backgroundColor: '#1e293b' }}>Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id} style={{ backgroundColor: '#1e293b' }}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="pending" style={{ backgroundColor: '#1e293b' }}>Pending</option>
                <option value="processing" style={{ backgroundColor: '#1e293b' }}>Processing</option>
                <option value="in-transit" style={{ backgroundColor: '#1e293b' }}>In Transit</option>
                <option value="delivered" style={{ backgroundColor: '#1e293b' }}>Delivered</option>
              </select>
            </div>

            {/* Expected Delivery */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Expected Delivery <span style={{ color: '#fca5a5' }}>*</span>
              </label>
              <input
                type="date"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  colorScheme: 'dark'
                }}
              />
            </div>

            {/* City */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                City <span style={{ color: '#fca5a5' }}>*</span>
              </label>
              <input
                type="text"
                name="destination.city"
                value={formData.destination.city}
                onChange={handleChange}
                placeholder="Kolkata"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* State */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                State <span style={{ color: '#fca5a5' }}>*</span>
              </label>
              <input
                type="text"
                name="destination.state"
                value={formData.destination.state}
                onChange={handleChange}
                placeholder="West Bengal"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Items Section */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>
              Items <span style={{ color: '#fca5a5' }}>*</span>
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr auto',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <select
                value={currentItem.drug}
                onChange={(e) => setCurrentItem({...currentItem, drug: e.target.value})}
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="" style={{ backgroundColor: '#1e293b' }}>Select Drug</option>
                {drugs.map(drug => (
                  <option key={drug._id} value={drug._id} style={{ backgroundColor: '#1e293b' }}>
                    {drug.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})}
                min="1"
                placeholder="Qty"
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <input
                type="number"
                value={currentItem.price}
                onChange={(e) => setCurrentItem({...currentItem, price: e.target.value})}
                min="0"
                placeholder="Price (₹)"
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <button
                onClick={addItem}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0891b2',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Add
              </button>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                {formData.items.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <span style={{ fontWeight: '500' }}>{item.drugName}</span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)', marginLeft: '8px' }}>× {item.quantity}</span>
                      <span style={{ color: '#22d3ee', marginLeft: '8px' }}>₹{item.price}/unit</span>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fca5a5',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(to right, #2563eb, #0891b2)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Creating...' : 'Create Shipment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}