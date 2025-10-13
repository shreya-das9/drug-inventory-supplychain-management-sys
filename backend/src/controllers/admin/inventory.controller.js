
import Inventory from "../../models/Inventory.js";
import Drug from "../../models/Drug.js";

export const getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate("drug", "name batchNumber category expiryDate price")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    console.error("❌ Error fetching inventory:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate("drug");

    if (!inventory)
      return res.status(404).json({ success: false, message: "Inventory not found" });

    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching inventory" });
  }
};

export const getInventoryByDrug = async (req, res) => {
  try {
    const { drugId } = req.params;

    const stock = await Inventory.findOne({ drug: drugId }).populate("drug");

    if (!stock)
      return res.status(404).json({ success: false, message: "Inventory not found" });

    res.json({ success: true, stock });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stock" });
  }
};

export const addInventory = async (req, res) => {
  try {
    const { drug, quantity, warehouseLocation, batchNo } = req.body;

    if (!drug || !quantity)
      return res.status(400).json({ success: false, message: "Drug and quantity required" });

    const drugExists = await Drug.findById(drug);
    if (!drugExists)
      return res.status(404).json({ success: false, message: "Drug not found" });

    let inventory = await Inventory.findOne({ drug });

    if (inventory) {
      inventory.quantity += Number(quantity);
      await inventory.save();
    } else {
      inventory = await Inventory.create({
        drug,
        quantity,
        warehouseLocation,
        batchNo,
      });
    }

    res.status(201).json({
      success: true,
      message: "Stock added successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("❌ Add Stock Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Inventory.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated)
      return res.status(404).json({ success: false, message: "Inventory not found" });

    res.json({ success: true, message: "Inventory updated", updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating inventory" });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Inventory.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Inventory not found" });

    res.json({ success: true, message: "Stock record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting inventory" });
  }
};

export const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityChange } = req.body;

    const inventory = await Inventory.findById(id);
    if (!inventory)
      return res.status(404).json({ success: false, message: "Inventory not found" });

    inventory.quantity += Number(quantityChange);
    await inventory.save();

    res.json({ success: true, message: "Stock adjusted", inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adjusting stock" });
  }
};

export const transferStock = async (req, res) => {
  try {
    const { fromInventoryId, toInventoryId, quantity } = req.body;

    const fromInventory = await Inventory.findById(fromInventoryId);
    const toInventory = await Inventory.findById(toInventoryId);

    if (!fromInventory || !toInventory)
      return res.status(404).json({ success: false, message: "Inventory not found" });

    if (fromInventory.quantity < quantity)
      return res.status(400).json({ success: false, message: "Insufficient stock" });

    fromInventory.quantity -= Number(quantity);
    toInventory.quantity += Number(quantity);

    await fromInventory.save();
    await toInventory.save();

    res.json({ success: true, message: "Stock transferred successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error transferring stock" });
  }
};

export const getStockMovements = async (req, res) => {
  try {
    const { id } = req.params;
    // Implement based on your movement tracking model
    res.json({ success: true, message: "Movements fetched" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching movements" });
  }
};