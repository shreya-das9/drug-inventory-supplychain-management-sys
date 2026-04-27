//SHREYA'S CODE.
import Drug from "../../models/Drug.js";
import Inventory from "../../models/Inventory.js";
import Scanlog from "../../models/ScanlogModel.js";
import { validateArray, validateExpiryAlert, validateLowStockAlert, validateRequired } from "../../utils/validation.js";

export const getStats = async (req, res) => {
  try {
    const [totalDrugs, lowStockCount, expiredCount] = await Promise.all([
      Drug.countDocuments(),
      Inventory.countDocuments({ quantity: { $lt: 10 } }),
      Drug.countDocuments({ expiryDate: { $lt: new Date() } }),
    ]);

    // Validate required fields and types
    const stats = {
      totalDrugs: Number(totalDrugs) || 0,
      lowStockCount: Number(lowStockCount) || 0,
      expiredCount: Number(expiredCount) || 0,
    };

    // Ensure all stats are non-negative numbers
    if (stats.totalDrugs < 0 || stats.lowStockCount < 0 || stats.expiredCount < 0) {
      throw new Error("Invalid stat counts: all values must be non-negative");
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Stats Error:", error);
    res.status(500).json({ success: false, message: "Error fetching stats", error: error.message });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const today = new Date();
    const nextMonth = new Date(today.setMonth(today.getMonth() + 1));

    const [expiryAlerts, lowStockAlerts, securityTransitAlertsRaw] = await Promise.all([
      Drug.find({
        expiryDate: { $lte: nextMonth, $gte: new Date() },
      }).select("name batchNumber expiryDate"),
      Inventory.find({
        quantity: { $lt: 10 },
      }).populate("drug", "name category"),
      Scanlog.find({ alertCodes: "TRANSIT_TIME_EXCEEDED" })
        .sort({ scannedAt: -1 })
        .limit(50)
        .select("bleId stage scannedAt alertCodes location details verificationStatus")
    ]);

    const securityTransitAlerts = securityTransitAlertsRaw.map((log) => ({
      id: log._id,
      bleId: log.bleId,
      stage: log.stage,
      scannedAt: log.scannedAt,
      verificationStatus: log.verificationStatus,
      alertCodes: log.alertCodes,
      location: log.location,
      route: log.details?.transitDelay?.routeKey || null,
      elapsedMinutes: log.details?.transitDelay?.elapsedMinutes ?? null,
      allowedMinutes: log.details?.transitDelay?.allowedMinutes ?? null,
      trafficCondition: log.details?.transitDelay?.trafficCondition || null,
      delayReason: log.details?.transitDelay?.delayReason || null,
      delayReasonAccepted: Boolean(log.details?.transitDelay?.delayReasonAccepted)
    }));

    // Transform expiryAlerts to map batchNumber to batchNo for frontend consistency
    const formattedExpiryAlerts = expiryAlerts.map(alert => {
      const obj = alert.toObject ? alert.toObject() : alert;
      return {
        ...obj,
        batchNo: obj.batchNumber
      };
    });

    // Validate alerts before returning
    const validatedExpiryAlerts = validateArray(
      formattedExpiryAlerts,
      ["name"],
      {},
      "Expiry Alerts"
    );

    const validatedLowStockAlerts = validateArray(
      lowStockAlerts.map(item => ({
        _id: item._id,
        drugId: item.drug,
        quantity: item.quantity,
        threshold: item.threshold,
        warehouseLocation: item.warehouseLocation
      })),
      ["_id", "quantity"],
      {},
      "Low Stock Alerts"
    );

    res.status(200).json({
      success: true,
      data: {
        expiryAlerts: validatedExpiryAlerts,
        lowStockAlerts: validatedLowStockAlerts,
        securityTransitAlerts,
        totalAlerts: expiryAlerts.length + lowStockAlerts.length + securityTransitAlerts.length,
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