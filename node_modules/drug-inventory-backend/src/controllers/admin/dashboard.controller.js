// import Drug from "../../models/Drug.js";
// import Inventory from "../../models/Inventory.js";
// //import Supplier from "../../models/Supplier.model.js";
// //import Shipment from "../../models/Shipment.model.js";

// /**
//  * ✅ GET /api/admin/stats
//  * Dashboard summary (total drugs, suppliers, shipments, low stock)
//  */
// export const getDashboardStats = async (req, res) => {
//   try {
//     // Count all documents efficiently
//     const [totalDrugs, totalSuppliers, totalShipments, lowStockCount] =
//       await Promise.all([
//         Drug.countDocuments(),
//         Supplier.countDocuments(),
//         Shipment.countDocuments(),
//         Inventory.countDocuments({ quantity: { $lt: 10 } }), // threshold
//       ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         totalDrugs,
//         totalSuppliers,
//         totalShipments,
//         lowStockCount,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Dashboard Stats Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching dashboard statistics",
//     });
//   }
// };

// /**
//  * ✅ GET /api/admin/alerts
//  * Expiry and low stock alerts
//  */
// export const getAlerts = async (req, res) => {
//   try {
//     const today = new Date();
//     const expiryAlerts = await Drug.find({
//       expiryDate: { $lte: new Date(today.setMonth(today.getMonth() + 1)) }, // expiring within 1 month
//     }).select("name batchNo expiryDate");

//     const lowStockAlerts = await Inventory.find({
//       quantity: { $lt: 10 },
//     })
//       .populate("drugId", "name category")
//       .select("quantity drugId");

//     res.status(200).json({
//       success: true,
//       data: {
//         expiryAlerts,
//         lowStockAlerts,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Alerts Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching alerts",
//     });
//   }
// };


// controllers/admin/dashboard.controller.js
import Drug from "../../models/Drug.js";
import Inventory from "../../models/Inventory.js";

export const getStats = async (req, res) => {
  try {
    const [totalDrugs, lowStockCount, expiredCount] = await Promise.all([
      Drug.countDocuments(),
      Inventory.countDocuments({ quantity: { $lt: 10 } }),
      Drug.countDocuments({ expiryDate: { $lt: new Date() } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDrugs,
        lowStockCount,
        expiredCount,
      },
    });
  } catch (error) {
    console.error("❌ Stats Error:", error);
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const today = new Date();
    const nextMonth = new Date(today.setMonth(today.getMonth() + 1));

    const expiryAlerts = await Drug.find({
      expiryDate: { $lte: nextMonth, $gte: new Date() },
    }).select("name batchNo expiryDate");

    const lowStockAlerts = await Inventory.find({
      quantity: { $lt: 10 },
    }).populate("drugId", "name category");

    res.status(200).json({
      success: true,
      data: {
        expiryAlerts,
        lowStockAlerts,
        totalAlerts: expiryAlerts.length + lowStockAlerts.length,
      },
    });
  } catch (error) {
    console.error("❌ Alerts Error:", error);
    res.status(500).json({ success: false, message: "Error fetching alerts" });
  }
};

export const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    // Mark alert as resolved (implementation depends on your alert model)
    res.json({ success: true, message: "Alert resolved" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error resolving alert" });
  }
};