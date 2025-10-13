import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";

export default function Dashboard() {
  const { request, loading } = useApi();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState({ expiryAlerts: [], lowStockAlerts: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        request("GET", "/api/admin/dashboard/stats"),
        request("GET", "/api/admin/dashboard/alerts"),
      ]);

      setStats(statsRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Warehouse Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Drugs"
          value={stats?.totalDrugs || 0}
          icon="💊"
          color="blue"
        />
        <StatCard
          title="Low Stock"
          value={stats?.lowStockCount || 0}
          icon="📉"
          color="orange"
        />
        <StatCard
          title="Expired"
          value={stats?.expiredCount || 0}
          icon="⚠️"
          color="red"
        />
        <StatCard
          title="Total Alerts"
          value={alerts.expiryAlerts.length + alerts.lowStockAlerts.length}
          icon="🔔"
          color="purple"
        />
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expiry Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            ⏰ Expiring Soon
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.expiryAlerts.length > 0 ? (
              alerts.expiryAlerts.map((drug, i) => (
                <div key={i} className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="font-semibold text-red-900">{drug.name}</p>
                  <p className="text-sm text-red-700">
                    Batch: {drug.batchNo} | Expires:{" "}
                    {new Date(drug.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No expiry alerts</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📉 Low Stock
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.lowStockAlerts.length > 0 ? (
              alerts.lowStockAlerts.map((item, i) => (
                <div key={i} className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                  <p className="font-semibold text-orange-900">
                    {item.drugId?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-orange-700">
                    Current: {item.quantity} units | Threshold: {item.threshold}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No low stock alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const bgColors = {
    blue: "bg-blue-100",
    orange: "bg-orange-100",
    red: "bg-red-100",
    purple: "bg-purple-100",
  };
  const textColors = {
    blue: "text-blue-600",
    orange: "text-orange-600",
    red: "text-red-600",
    purple: "text-purple-600",
  };

  return (
    <div className={`${bgColors[color]} rounded-lg p-6 shadow`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${textColors[color]}`}>
            {value}
          </p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}


