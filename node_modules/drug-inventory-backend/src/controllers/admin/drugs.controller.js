// import Drug from "../../models/Drug.js";
// //import Supplier from "../../models/Supplier.model.js";

// // ✅ Get all drugs (with search + pagination)
// export const getAllDrugs = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search = "" } = req.query;
//     const query = search
//       ? { name: { $regex: search, $options: "i" } }
//       : {};

//     const total = await Drug.countDocuments(query);
//     const drugs = await Drug.find(query)
//       .populate("supplierId", "name")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     res.json({
//       success: true,
//       total,
//       currentPage: page,
//       drugs,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching drugs:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // ✅ Get drug by ID
// export const getDrugById = async (req, res) => {
//   try {
//     const drug = await Drug.findById(req.params.id).populate("supplierId", "name email phone");
//     if (!drug) return res.status(404).json({ success: false, message: "Drug not found" });

//     res.json({ success: true, drug });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error fetching drug" });
//   }
// };

// // ✅ Add new drug
// export const addDrug = async (req, res) => {
//   try {
//     const { name, category, price, batchNo, expiryDate, supplierId, stock } = req.body;

//     if (!name || !batchNo || !supplierId)
//       return res.status(400).json({ success: false, message: "Missing required fields" });

//     const supplierExists = await Supplier.findById(supplierId);
//     if (!supplierExists)
//       return res.status(404).json({ success: false, message: "Supplier not found" });

//     const newDrug = await Drug.create({
//       name,
//       category,
//       price,
//       batchNo,
//       expiryDate,
//       supplierId,
//       stock,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Drug added successfully",
//       data: newDrug,
//     });
//   } catch (error) {
//     console.error("❌ Add Drug Error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // ✅ Update drug details
// export const updateDrug = async (req, res) => {
//   try {
//     const updatedDrug = await Drug.findByIdAndUpdate(req.params.id, req.body, { new: true });

//     if (!updatedDrug)
//       return res.status(404).json({ success: false, message: "Drug not found" });

//     res.json({ success: true, message: "Drug details updated", updatedDrug });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error updating drug" });
//   }
// };

// // ✅ Delete drug
// export const deleteDrug = async (req, res) => {
//   try {
//     const deleted = await Drug.findByIdAndDelete(req.params.id);
//     if (!deleted)
//       return res.status(404).json({ success: false, message: "Drug not found" });

//     res.json({ success: true, message: "Drug deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error deleting drug" });
//   }
// };

// // ✅ Bulk add drugs
// export const bulkAddDrugs = async (req, res) => {
//   try {
//     const { drugs } = req.body;
//     if (!Array.isArray(drugs) || drugs.length === 0)
//       return res.status(400).json({ success: false, message: "No drugs provided" });

//     const added = await Drug.insertMany(drugs);
//     res.json({ success: true, message: "Drugs added successfully", count: added.length });
//   } catch (error) {
//     console.error("❌ Bulk Add Error:", error);
//     res.status(500).json({ success: false, message: "Error adding drugs" });
//   }
// };

// // ✅ Get QR Code (optional - can integrate qrcode library)
// // export const getDrugQRCode = async (req, res) => {
// //   try {
// //     const drug = await Drug.findById(req.params.id);
// //     if (!drug)
// //       return res.status(404).json({ success: false, message: "Drug not found" });

// //     // Future: integrate QRCode.toDataURL(JSON.stringify(drug))
// //     res.json({ success: true, message: "QR generation logic pending", drug });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: "Error generating QR" });
// //   }
// // };
// import { fetchDrugData } from "../services/fda.service.js";

// export const lookupDrug = async (req, res) => {
//   try {
//     const { name } = req.query;
//     if (!name) return res.status(400).json({ success: false, message: "Drug name is required" });

//     const data = await fetchDrugData(name);
//     if (!data)
//       return res.status(404).json({ success: false, message: "No drug data found" });

//     return res.json({ success: true, data });
//   } catch (error) {
//     console.error("Lookup error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
// controllers/admin/drugs.controller.js
import Drug from "../../models/Drug.js";

export const getAllDrugs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const total = await Drug.countDocuments(query);
    const drugs = await Drug.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      currentPage: page,
      drugs,
    });
  } catch (error) {
    console.error("❌ Error fetching drugs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getDrugById = async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    if (!drug) return res.status(404).json({ success: false, message: "Drug not found" });

    res.json({ success: true, drug });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching drug" });
  }
};

export const addDrug = async (req, res) => {
  try {
    const { name, category, manufacturer, batchNumber, price, expiryDate, description } = req.body;

    if (!name || !batchNumber)
      return res.status(400).json({ success: false, message: "Name and batch number required" });

    const newDrug = await Drug.create({
      name,
      category,
      manufacturer,
      batchNumber,
      price,
      expiryDate,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Drug added successfully",
      data: newDrug,
    });
  } catch (error) {
    console.error("❌ Add Drug Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateDrug = async (req, res) => {
  try {
    const updatedDrug = await Drug.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedDrug)
      return res.status(404).json({ success: false, message: "Drug not found" });

    res.json({ success: true, message: "Drug updated", updatedDrug });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating drug" });
  }
};

export const deleteDrug = async (req, res) => {
  try {
    const deleted = await Drug.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Drug not found" });

    res.json({ success: true, message: "Drug deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting drug" });
  }
};

export const bulkAddDrugs = async (req, res) => {
  try {
    const { drugs } = req.body;
    if (!Array.isArray(drugs) || drugs.length === 0)
      return res.status(400).json({ success: false, message: "No drugs provided" });

    const added = await Drug.insertMany(drugs);
    res.json({ success: true, message: "Drugs added", count: added.length });
  } catch (error) {
    console.error("❌ Bulk Add Error:", error);
    res.status(500).json({ success: false, message: "Error adding drugs" });
  }
};