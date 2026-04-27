import Drug from "../models/Drug.js";
import Inventory from "../models/Inventory.js";
import Order from "../models/OrderModel.js";
import Shipment from "../models/ShipmentModel.js";
import Scanlog from "../models/ScanlogModel.js";
import { successResponse, errorResponse } from "../utils/response.js";

const LOW_STOCK_DEFAULT_THRESHOLD = 10;

const summarizeInventoryRisk = (inventoryItems = []) => {
  const lowStock = inventoryItems.filter((item) => item.quantity <= (item.threshold ?? LOW_STOCK_DEFAULT_THRESHOLD));
  const outOfStock = inventoryItems.filter((item) => item.quantity <= 0);
  const nearExpiry = inventoryItems.filter((item) => {
    const expiry = item.drug?.expiryDate ? new Date(item.drug.expiryDate) : null;
    if (!expiry) return false;
    const days = (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 45;
  });

  return { lowStock, outOfStock, nearExpiry };
};

export const getAiSummary = async (req, res) => {
  try {
    const [drugCount, inventoryCount, orderCount, shipmentCount, scanCount] = await Promise.all([
      Drug.countDocuments(),
      Inventory.countDocuments(),
      Order.countDocuments(),
      Shipment.countDocuments(),
      Scanlog.countDocuments()
    ]);

    const [inventory, riskyScans] = await Promise.all([
      Inventory.find().populate("drug", "name batchNumber expiryDate manufacturer").limit(500),
      Scanlog.countDocuments({ alertCodes: { $in: ["FLOW_VIOLATION", "TRANSIT_TIME_EXCEEDED", "IMPOSSIBLE_MOVEMENT"] } })
    ]);

    const risk = summarizeInventoryRisk(inventory);

    return successResponse(res, 200, "AI summary fetched successfully", {
      counts: {
        drugs: drugCount,
        inventory: inventoryCount,
        orders: orderCount,
        shipments: shipmentCount,
        scans: scanCount
      },
      signals: {
        lowStockItems: risk.lowStock.length,
        outOfStockItems: risk.outOfStock.length,
        nearExpiryItems: risk.nearExpiry.length,
        riskyScans
      }
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch AI summary", error.message);
  }
};

export const predictInventory = async (req, res) => {
  try {
    const horizonDays = Math.min(Math.max(Number(req.query.horizonDays || req.body?.horizonDays || 30), 1), 180);
    const threshold = Math.max(Number(req.query.threshold || req.body?.threshold || LOW_STOCK_DEFAULT_THRESHOLD), 1);

    const inventory = await Inventory.find().populate("drug", "name batchNumber expiryDate manufacturer").limit(500);
    const { lowStock, outOfStock, nearExpiry } = summarizeInventoryRisk(inventory);

    const predictions = inventory.map((item) => {
      const current = Number(item.quantity || 0);
      const safeStock = Number(item.threshold || threshold);
      const dailyUseEstimate = Math.max(1, Math.round(safeStock / 7));
      const projectedRemaining = current - dailyUseEstimate * horizonDays;

      return {
        inventoryId: item._id,
        drugId: item.drug?._id || item.drug,
        drugName: item.drug?.name || "Unknown",
        currentStock: current,
        threshold: safeStock,
        dailyUseEstimate,
        projectedRemaining,
        shortageRisk: projectedRemaining <= 0,
        alertLevel: projectedRemaining <= 0 ? "critical" : projectedRemaining <= safeStock ? "warning" : "normal"
      };
    });

    return successResponse(res, 200, "Inventory prediction generated", {
      horizonDays,
      threshold,
      summary: {
        lowStock: lowStock.length,
        outOfStock: outOfStock.length,
        nearExpiry: nearExpiry.length
      },
      predictions: predictions.sort((a, b) => a.projectedRemaining - b.projectedRemaining)
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to generate inventory prediction", error.message);
  }
};

export const detectFraudSignals = async (req, res) => {
  try {
    const [flaggedScans, blockedScans, totalRecentScans] = await Promise.all([
      Scanlog.find({ alertCodes: { $exists: true, $ne: [] } }).sort({ scannedAt: -1 }).limit(50),
      Scanlog.countDocuments({ verificationStatus: "BLOCKED" }),
      Scanlog.countDocuments({ scannedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
    ]);

    const fraudScore = Math.min(100, Math.round((blockedScans / Math.max(totalRecentScans, 1)) * 100) + (flaggedScans.length > 10 ? 10 : 0));

    return successResponse(res, 200, "Fraud detection signals generated", {
      fraudScore,
      totalRecentScans,
      blockedScans,
      flaggedScans: flaggedScans.map((log) => ({
        id: log._id,
        bleId: log.bleId,
        stage: log.stage,
        verificationStatus: log.verificationStatus,
        alertCodes: log.alertCodes,
        scannedAt: log.scannedAt
      })),
      recommendation: fraudScore >= 70 ? "Immediate manual review recommended" : "Monitor and review weekly"
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to detect fraud signals", error.message);
  }
};

export const evaluateSupplyChain = async (req, res) => {
  try {
    const [shipments, orders, inventory] = await Promise.all([
      Shipment.find().sort({ createdAt: -1 }).limit(100),
      Order.find().sort({ createdAt: -1 }).limit(100),
      Inventory.find().populate("drug", "name batchNumber expiryDate manufacturer")
    ]);

    const delayedShipments = shipments.filter((shipment) => {
      if (!shipment.expectedDeliveryDate) return false;
      return shipment.status !== "delivered" && new Date(shipment.expectedDeliveryDate) < new Date();
    }).length;

    return successResponse(res, 200, "Supply chain evaluation generated", {
      delayedShipments,
      openOrders: orders.filter((order) => ["pending", "approved", "processing", "confirmed", "shipped"].includes(order.status)).length,
      criticalInventory: inventory.filter((item) => Number(item.quantity || 0) <= Number(item.threshold || LOW_STOCK_DEFAULT_THRESHOLD)).length,
      coverageScore: Math.max(0, 100 - delayedShipments * 5)
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to evaluate supply chain", error.message);
  }
};

export default {
  getAiSummary,
  predictInventory,
  detectFraudSignals,
  evaluateSupplyChain
};