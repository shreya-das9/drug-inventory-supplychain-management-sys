//SHREYA'S CODE.
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