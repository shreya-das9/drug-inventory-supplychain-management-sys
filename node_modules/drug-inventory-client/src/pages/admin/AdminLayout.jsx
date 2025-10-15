
import { useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", path: "/admin/dashboard" },
    { id: "drugs", label: "Drugs", icon: "💊", path: "/admin/drugs" },
    { id: "inventory", label: "Inventory", icon: "📦", path: "/admin/inventory" },
    { id: "alerts", label: "Alerts", icon: "🔔", path: "/admin/alerts" },
  ];

  const getActivePage = () => {
    if (location.pathname.includes("drugs")) return "drugs";
    if (location.pathname.includes("inventory")) return "inventory";
    if (location.pathname.includes("alerts")) return "alerts";
    return "dashboard";
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className="bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col justify-between transition-all duration-300"
      >
        {/* Logo */}
        <div>
          <div className="p-6 border-b border-blue-600 flex items-center gap-3">
            <div className="text-3xl">📦</div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">MedStock</h1>
                <p className="text-xs text-blue-200">Warehouse Admin</p>
              </div>
            )}
          </div>

          {/* Menu */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  getActivePage() === item.id
                    ? "bg-white text-blue-800 font-semibold shadow-md"
                    : "text-blue-100 hover:bg-blue-600"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Toggle Button */}
        <div className="p-4 border-t border-blue-600">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            {sidebarOpen ? "<<" : ">>"}
          </button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800">
            {menuItems.find((item) => item.id === getActivePage())?.label}
          </h2>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900 text-xl">🔔</button>
            <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              A
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 overflow-auto flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
