import Compliance from "../models/ComplianceModel.js";
import Drug from "../models/Drug.js";
import Inventory from "../models/Inventory.js";
import Shipment from "../models/ShipmentModel.js";
import Order from "../models/OrderModel.js";
import Scanlog from "../models/ScanlogModel.js";
import { successResponse, errorResponse } from "../utils/response.js";

const buildComplianceQuery = (queryParams = {}) => {
  const query = {};
  const { status, severity, type, search } = queryParams;

  if (status) query.status = String(status).toLowerCase();
  if (severity) query.severity = String(severity).toLowerCase();
  if (type) query.type = String(type).toLowerCase();

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { reportNumber: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  return query;
};

export const listReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = "-createdAt" } = req.query;
    const query = buildComplianceQuery(req.query);
    const skip = (Number(page) - 1) * Number(limit);

    const reports = await Compliance.find(query)
      .populate("relatedDrug", "name batchNumber manufacturer expiryDate")
      .populate("relatedInventory", "quantity warehouseLocation threshold")
      .populate("relatedShipment", "trackingNumber status expectedDeliveryDate")
      .populate("relatedOrder", "orderNumber status totalAmount")
      .populate("relatedScanlog", "bleId stage verificationStatus alertCodes scannedAt")
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    const total = await Compliance.countDocuments(query);

    return successResponse(res, 200, "Compliance reports fetched successfully", {
      reports,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch compliance reports", error.message);
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Compliance.findById(req.params.id)
      .populate("relatedDrug")
      .populate("relatedInventory")
      .populate("relatedShipment")
      .populate("relatedOrder")
      .populate("relatedScanlog")
      .populate("createdBy")
      .populate("updatedBy");

    if (!report) {
      return errorResponse(res, 404, "Compliance report not found");
    }

    return successResponse(res, 200, "Compliance report fetched successfully", report);
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch compliance report", error.message);
  }
};

export const createReport = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user?._id || req.user?.id || null,
      updatedBy: req.user?._id || req.user?.id || null
    };

    if (payload.relatedDrug) {
      const exists = await Drug.exists({ _id: payload.relatedDrug });
      if (!exists) return errorResponse(res, 404, "Related drug not found");
    }

    if (payload.relatedInventory) {
      const exists = await Inventory.exists({ _id: payload.relatedInventory });
      if (!exists) return errorResponse(res, 404, "Related inventory record not found");
    }

    if (payload.relatedShipment) {
      const exists = await Shipment.exists({ _id: payload.relatedShipment });
      if (!exists) return errorResponse(res, 404, "Related shipment not found");
    }

    if (payload.relatedOrder) {
      const exists = await Order.exists({ _id: payload.relatedOrder });
      if (!exists) return errorResponse(res, 404, "Related order not found");
    }

    if (payload.relatedScanlog) {
      const exists = await Scanlog.exists({ _id: payload.relatedScanlog });
      if (!exists) return errorResponse(res, 404, "Related scan log not found");
    }

    const report = await Compliance.create(payload);
    return successResponse(res, 201, "Compliance report created successfully", report);
  } catch (error) {
    return errorResponse(res, 500, "Failed to create compliance report", error.message);
  }
};

export const updateReport = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedBy: req.user?._id || req.user?.id || null
    };

    const report = await Compliance.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!report) {
      return errorResponse(res, 404, "Compliance report not found");
    }

    return successResponse(res, 200, "Compliance report updated successfully", report);
  } catch (error) {
    return errorResponse(res, 500, "Failed to update compliance report", error.message);
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await Compliance.findByIdAndDelete(req.params.id);
    if (!report) {
      return errorResponse(res, 404, "Compliance report not found");
    }

    return successResponse(res, 200, "Compliance report deleted successfully");
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete compliance report", error.message);
  }
};

export const getComplianceStats = async (req, res) => {
  try {
    const [total, byStatus, bySeverity, openHighRisk, recentReports] = await Promise.all([
      Compliance.countDocuments(),
      Compliance.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Compliance.aggregate([
        { $group: { _id: "$severity", count: { $sum: 1 } } }
      ]),
      Compliance.countDocuments({ status: { $in: ["open", "in_review"] }, severity: { $in: ["high", "critical"] } }),
      Compliance.find().sort({ createdAt: -1 }).limit(5)
    ]);

    return successResponse(res, 200, "Compliance statistics fetched successfully", {
      total,
      byStatus,
      bySeverity,
      openHighRisk,
      recentReports
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch compliance statistics", error.message);
  }
};

export default {
  listReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getComplianceStats
};