import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../../hooks/useApi";

export default function Alerts() {
  const { request } = useApi();
  const [alerts, setAlerts] = useState({ expiryAlerts: [], lowStockAlerts: [], securityTransitAlerts: [], incomingOrders: [] });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [notificationToast, setNotificationToast] = useState(null);
  const prevEscalationsRef = useRef(new Set());

  const fetchAlerts = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const res = await request("GET", "/api/admin/dashboard/alerts");
      const alertData = res?.data || { expiryAlerts: [], lowStockAlerts: [], securityTransitAlerts: [], incomingOrders: [] };
      setAlerts(alertData);

      // detect escalations and show a one-off toast per order
      try {
        const incoming = Array.isArray(alertData.incomingOrders) ? alertData.incomingOrders : [];
        incoming.forEach((o) => {
          if (o.escalatedToAdmin) {
            const set = prevEscalationsRef.current;
            const id = String(o.id || o._id || o.orderNumber);
            if (!set.has(id)) {
              set.add(id);
              setNotificationToast({ message: `Order ${o.orderNumber} escalated for review`, type: "info" });
              setTimeout(() => setNotificationToast(null), 4000);
            }
          }
        });
      } catch (e) {
        // ignore
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const id = setInterval(() => fetchAlerts(false), 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Alerts</h2>
        <div className="text-sm text-gray-500">Last: {lastUpdate.toLocaleTimeString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">Expiring Soon: {alerts.expiryAlerts.length}</div>
        <div className="p-4 bg-white rounded shadow">Low Stock: {alerts.lowStockAlerts.length}</div>
        <div className="p-4 bg-white rounded shadow">Incoming Orders: {(alerts.incomingOrders || []).length}</div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold">Incoming Orders</h3>
        <div className="mt-2 space-y-2">
          {(alerts.incomingOrders || []).map((o) => (
            <div key={o.id || o._id || o.orderNumber} className="p-3 bg-white rounded shadow flex justify-between items-center">
              <div>
                <div className="font-medium">{o.orderNumber}</div>
                <div className="text-sm text-gray-500">{o.medicine} — {o.quantity} units</div>
              </div>
              <div className="text-sm">
                {o.inventoryAvailable ? "Stock Available" : "Stock Shortage"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin escalation toast */}
      <AnimatePresence>
        {notificationToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-5 right-5 z-50 px-4 py-2 rounded-lg bg-amber-600 text-white shadow-lg"
          >
            {notificationToast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
