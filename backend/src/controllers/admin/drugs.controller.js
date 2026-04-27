//SHREYA'S CODE.
import Drug from "../../models/Drug.js";
import { validateArray, validateRequired } from "../../utils/validation.js";

export const getAllDrugs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const total = await Drug.countDocuments(query);
    const drugs = await Drug.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Validate drugs data before returning
    const validatedDrugs = validateArray(
      drugs,
      ['_id', 'name', 'batchNumber'],
      {},
      'Drugs'
    );

    res.json({
      success: true,
      total,
      currentPage: page,
      drugs: validatedDrugs,
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

    // Validate required fields
    validateRequired(
      { name, batchNumber },
      ['name', 'batchNumber'],
      'Drug Input'
    );

    // Ensure name is not empty string
    if (!name.trim() || !batchNumber.trim()) {
      return res.status(400).json({ success: false, message: "Name and batch number cannot be empty" });
    }

    const newDrug = await Drug.create({
      name: name.trim(),
      category,
      manufacturer,
      batchNumber: batchNumber.trim(),
      price: Number(price) || 0,
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