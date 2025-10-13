

import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";

export default function Inventory() {
  const { request } = useApi();
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await request("GET", "/api/admin/inventory");
      setInventory(res.inventory || []);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left">Drug</th>
            <th className="px-6 py-4 text-left">Batch</th>
            <th className="px-6 py-4 text-left">Quantity</th>
            <th className="px-6 py-4 text-left">Location</th>
          </tr>
        </thead>
        <tbody>
          {inventory.length > 0 ? (
            inventory.map((item) => (
              <tr key={item._id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{item.drug?.name || "Unknown"}</td>
                <td className="px-6 py-4">{item.batchNo}</td>
                <td className="px-6 py-4">{item.quantity}</td>
                <td className="px-6 py-4">{item.warehouseLocation}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-12 text-gray-400">
                No inventory records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
