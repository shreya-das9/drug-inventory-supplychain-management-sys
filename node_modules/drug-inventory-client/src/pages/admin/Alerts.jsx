import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";

export default function Alerts() {
  const { request } = useApi();
  const [alerts, setAlerts] = useState({
    expiryAlerts: [],
    lowStockAlerts: [],
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await request("GET", "/api/admin/dashboard/alerts");
      setAlerts(res.data);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  const getFilteredAlerts = () => {
    if (filter === "expiry") return { expiryAlerts: alerts.expiryAlerts, lowStockAlerts: [] };
    if (filter === "lowStock") return { expiryAlerts: [], lowStockAlerts: alerts.lowStockAlerts };
    return alerts;
  };

  const filteredAlerts = getFilteredAlerts();
  const totalAlerts = alerts.expiryAlerts.length + alerts.lowStockAlerts.length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Expiring Soon</p>
              <p className="text-4xl font-bold mt-2">{alerts.expiryAlerts.length}</p>
            </div>
            <span className="text-5xl opacity-50">⏰</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Low Stock</p>
              <p className="text-4xl font-bold mt-2">{alerts.lowStockAlerts.length}</p>
            </div>
            <span className="text-5xl opacity-50">📉</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Alerts</p>
              <p className="text-4xl font-bold mt-2">{totalAlerts}</p>
            </div>
            <span className="text-5xl opacity-50">🔔</span>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All Alerts
        </button>
        <button
          onClick={() => setFilter("expiry")}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            filter === "expiry"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Expiry Alerts
        </button>
        <button
          onClick={() => setFilter("lowStock")}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            filter === "lowStock"
              ? "bg-orange-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Low Stock Alerts
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-6">
        {/* Expiry Alerts */}
        {filteredAlerts.expiryAlerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                ⏰ Drugs Expiring Soon ({filteredAlerts.expiryAlerts.length})
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredAlerts.expiryAlerts.map((drug, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-red-500 rounded-md hover:shadow-md transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 text-lg">{drug.name}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Batch:</span>{" "}
                          <span className="font-mono">{drug.batchNo}</span>
                        </p>
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Expiry Date:</span>{" "}
                          {new Date(drug.expiryDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Days Remaining:</span>{" "}
                          {Math.ceil(
                            (new Date(drug.expiryDate) - new Date()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days
                        </p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium">
                        Urgent
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Low Stock Alerts */}
        {filteredAlerts.lowStockAlerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                📉 Low Stock Items ({filteredAlerts.lowStockAlerts.length})
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredAlerts.lowStockAlerts.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-orange-50 border-l-4 border-orange-500 rounded-md hover:shadow-md transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-orange-900 text-lg">
                        {item.drugId?.name || "Unknown Drug"}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-orange-700">
                          <span className="font-medium">Current Stock:</span>{" "}
                          <span className="font-bold text-lg">{item.quantity}</span> units
                        </p>
                        <p className="text-sm text-orange-700">
                          <span className="font-medium">Threshold:</span>{" "}
                          <span className="font-bold">{item.threshold}</span> units
                        </p>
                        <p className="text-sm text-orange-700">
                          <span className="font-medium">Location:</span>{" "}
                          {item.warehouseLocation || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium">
                        Reorder
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Alerts */}
        {filteredAlerts.expiryAlerts.length === 0 &&
          filteredAlerts.lowStockAlerts.length === 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No Alerts
              </h3>
              <p className="text-gray-600">
                {filter === "all"
                  ? "All inventory levels are good and no drugs are expiring soon."
                  : filter === "expiry"
                  ? "No drugs are expiring soon."
                  : "All inventory levels are above threshold."}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}