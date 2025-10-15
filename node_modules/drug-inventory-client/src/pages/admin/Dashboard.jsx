//SHREYA'S CODE.
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";

export default function Dashboard() {
  const { request, loading } = useApi();
  const [stats, setStats] = useState({
    totalDrugs: 0,
    suppliers: 0,
    activeShipments: 0,
    lowStockItems: 0,
  });
  const [alerts, setAlerts] = useState({
    expiryAlerts: [],
    lowStockAlerts: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        request("GET", "/api/admin/dashboard/stats"),
        request("GET", "/api/admin/dashboard/alerts"),
      ]);
      if (statsRes?.data) setStats(statsRes.data);
      if (alertsRes?.data) setAlerts(alertsRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Total Drugs", value: stats.totalDrugs, icon: "📦", color: "blue" },
          { label: "Suppliers", value: stats.suppliers, icon: "👥", color: "green" },
          { label: "Active Shipments", value: stats.activeShipments, icon: "🚚", color: "purple" },
          { label: "Low Stock Items", value: stats.lowStockItems, icon: "⚠️", color: "red" },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-14 h-14 bg-${card.color}-100 rounded-xl flex items-center justify-center text-3xl`}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-800">{card.value}</p>
            <p className="text-gray-500 mt-2">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
