import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../../hooks/useApi";
import {
  AlertTriangle,
  RefreshCcw,
  Bluetooth,
  FileText,
  ShieldAlert,
  Clock3,
  Search,
  Truck
} from "lucide-react";

const TABS = [
  { id: "summary", label: "Summary", icon: ShieldAlert },
  { id: "alerts", label: "Order Alerts", icon: AlertTriangle },
  { id: "bleLogs", label: "BLE Logs", icon: Bluetooth },
  { id: "compliance", label: "Compliance", icon: FileText }
];

export default function Alerts() {
  const { request } = useApi();
  const [activeTab, setActiveTab] = useState("summary");
  const [alerts, setAlerts] = useState({ expiryAlerts: [], lowStockAlerts: [], securityTransitAlerts: [], incomingOrders: [] });
  const [bleLogs, setBleLogs] = useState([]);
  const [complianceReports, setComplianceReports] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [notificationToast, setNotificationToast] = useState(null);
  const prevEscalationsRef = useRef(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAlerts = async () => {
    const res = await request("GET", "/api/admin/dashboard/alerts");
    return res?.data || { expiryAlerts: [], lowStockAlerts: [], securityTransitAlerts: [], incomingOrders: [] };
  };

  const fetchBleLogs = async () => {
    const res = await request("GET", "/api/ble/secure/logs?limit=25");
    return res?.data?.logs || [];
  };

  const fetchComplianceReports = async () => {
    const res = await request("GET", "/api/compliance?limit=25");
    return res?.data?.reports || [];
  };

  const refreshData = async (showRefresh = true) => {
    if (showRefresh) setIsRefreshing(true);

    try {
      const [alertData, logs, reports] = await Promise.all([fetchAlerts(), fetchBleLogs(), fetchComplianceReports()]);
      setAlerts(alertData);
      setBleLogs(logs);
      setComplianceReports(reports);
      setLastUpdate(new Date());

      const incoming = Array.isArray(alertData.incomingOrders) ? alertData.incomingOrders : [];
      incoming.forEach((order) => {
        if (order.escalatedToAdmin) {
          const key = String(order.id || order._id || order.orderNumber);
          if (!prevEscalationsRef.current.has(key)) {
            prevEscalationsRef.current.add(key);
            setNotificationToast({ message: `Order ${order.orderNumber} escalated for review`, type: "info" });
            setTimeout(() => setNotificationToast(null), 4000);
          }
        }
      });
    } catch (error) {
      console.error("Error refreshing alerts page:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData(false);
    const intervalId = setInterval(() => refreshData(false), 60000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBleLogs = bleLogs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return [log.bleId, log.stage, log.verificationStatus, log.alertCodes?.join(", "), log.location?.city]
      .filter(Boolean)
      .some((text) => String(text).toLowerCase().includes(q));
  });

  const filteredCompliance = complianceReports.filter((report) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return [report.title, report.description, report.severity, report.status, report.relatedOrder?.orderNumber, report.relatedScanlog?.bleId]
      .filter(Boolean)
      .some((text) => String(text).toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Admin Alerts & BLE Inspection</h2>
          <p className="text-sm text-slate-400">Monitor order alerts, headset BLE scan logs, and compliance investigations in one admin view.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            onClick={() => refreshData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCcw size={16} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          <div className="text-sm text-slate-400">Updated: {lastUpdate.toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-300"><ShieldAlert size={18} /> Order Alerts</div>
          <div className="mt-4 text-3xl font-semibold text-white">{alerts.incomingOrders.length}</div>
          <div className="text-sm text-slate-500">Incoming orders needing attention</div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-300"><Bluetooth size={18} /> BLE Logs</div>
          <div className="mt-4 text-3xl font-semibold text-white">{bleLogs.length}</div>
          <div className="text-sm text-slate-500">Recent scanned BLE events</div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-300"><FileText size={18} /> Compliance</div>
          <div className="mt-4 text-3xl font-semibold text-white">{complianceReports.length}</div>
          <div className="text-sm text-slate-500">Latest compliance reports</div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-300"><Clock3 size={18} /> Auto Refresh</div>
          <div className="mt-4 text-3xl font-semibold text-white">1m</div>
          <div className="text-sm text-slate-500">Auto refresh interval</div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-950 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeTab === tab.id ? "bg-slate-700 text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"}`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-950 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{activeTab === "summary" ? "Summary" : activeTab === "alerts" ? "Order Alerts" : activeTab === "bleLogs" ? "BLE Security Logs" : "Compliance Reports"}</h3>
            <p className="text-sm text-slate-400">{activeTab === "summary" ? "Overview of all alert categories and inspection data." : activeTab === "alerts" ? "Incoming order and inventory alerts." : activeTab === "bleLogs" ? "Recent BLE scan events and verification results." : "Recent compliance investigations and issues."}</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs, orders, reports..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-2 pl-10 pr-4 text-sm text-white outline-none transition focus:border-slate-500"
            />
          </div>
        </div>

        {activeTab === "summary" && (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h4 className="text-sm font-semibold text-slate-300">Latest Order Alerts</h4>
              <div className="mt-3 space-y-3">
                {(alerts.incomingOrders || []).slice(0, 4).map((order) => (
                  <div key={order._id || order.orderNumber} className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{order.orderNumber}</p>
                        <p className="text-sm text-slate-400">{order.medicine} • {order.quantity || 0} units</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${order.inventoryAvailable ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                        {order.inventoryAvailable ? "Available" : "Shortage"}
                      </span>
                    </div>
                  </div>
                ))}
                {!alerts.incomingOrders?.length && <p className="text-sm text-slate-500">No incoming order alerts.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h4 className="text-sm font-semibold text-slate-300">Recent BLE Alerts</h4>
              <div className="mt-3 space-y-3">
                {bleLogs.slice(0, 4).map((log) => (
                  <div key={log._id || `${log.bleId}-${log.scannedAt}`} className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{log.bleId}</p>
                        <p className="text-sm text-slate-400">{log.stage || "Unknown stage"}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${log.verificationStatus === "VERIFIED" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                        {log.verificationStatus}
                      </span>
                    </div>
                  </div>
                ))}
                {!bleLogs.length && <p className="text-sm text-slate-500">No BLE logs available.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="mt-6 space-y-4">
            {(alerts.incomingOrders || []).map((order) => (
              <div key={order._id || order.orderNumber} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{order.orderNumber}</p>
                    <p className="text-sm text-slate-400">{order.medicine} • {order.quantity || 0} units • {order.purchaseOrderNumber || "PO N/A"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-300">
                    <span className="rounded-full bg-slate-800 px-3 py-1">Status: {order.status || "unknown"}</span>
                    <span className="rounded-full bg-slate-800 px-3 py-1">Inventory: {order.inventoryAvailable ? "OK" : "Short"}</span>
                    {order.escalatedToAdmin && <span className="rounded-full bg-amber-500/20 text-amber-200 px-3 py-1">Escalated</span>}
                  </div>
                </div>
              </div>
            ))}
            {!alerts.incomingOrders?.length && <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-400">No order alerts found.</div>}
          </div>
        )}

        {activeTab === "bleLogs" && (
          <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="px-3 py-3">BLE ID</th>
                  <th className="px-3 py-3">Stage</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Alerts</th>
                  <th className="px-3 py-3">Scanned At</th>
                </tr>
              </thead>
              <tbody>
                {filteredBleLogs.map((log) => (
                  <tr key={log._id || `${log.bleId}-${log.scannedAt}`} className="border-b border-slate-800 hover:bg-slate-900/80">
                    <td className="px-3 py-3 text-white">{log.bleId}</td>
                    <td className="px-3 py-3">{log.stage || "N/A"}</td>
                    <td className="px-3 py-3">{log.verificationStatus}</td>
                    <td className="px-3 py-3">{(log.alertCodes || []).join(", ") || "—"}</td>
                    <td className="px-3 py-3">{log.scannedAt ? new Date(log.scannedAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {!filteredBleLogs.length && (
                  <tr>
                    <td colSpan="5" className="px-3 py-8 text-center text-slate-500">No BLE log records available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="px-3 py-3">Report</th>
                  <th className="px-3 py-3">Severity</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Order / BLE ID</th>
                  <th className="px-3 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompliance.map((report) => (
                  <tr key={report._id} className="border-b border-slate-800 hover:bg-slate-900/80">
                    <td className="px-3 py-3 text-white font-semibold">{report.title || report.description?.slice(0, 45) || "Compliance report"}</td>
                    <td className="px-3 py-3">{report.severity || "N/A"}</td>
                    <td className="px-3 py-3">{report.status || "N/A"}</td>
                    <td className="px-3 py-3">{report.relatedOrder?.orderNumber || report.relatedScanlog?.bleId || "—"}</td>
                    <td className="px-3 py-3">{report.createdAt ? new Date(report.createdAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {!filteredCompliance.length && (
                  <tr>
                    <td colSpan="5" className="px-3 py-8 text-center text-slate-500">No compliance reports available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {notificationToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed right-5 top-5 z-50 rounded-2xl bg-emerald-500 px-4 py-3 text-sm text-slate-950 shadow-lg"
          >
            {notificationToast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
