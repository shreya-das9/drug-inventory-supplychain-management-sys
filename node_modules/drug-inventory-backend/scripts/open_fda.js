import mongoose from "mongoose";
import axios from "axios";
import Drug from "../src/models/Drug.js";
import Inventory from "../src/models/Inventory.js"; 
import Supplier from "../src/models/Supplier.js";
import dotenv from "dotenv";

dotenv.config();

const OPENFDA_BASE = "https://api.fda.gov/drug/label.json";
const MONGO = process.env.MONGO_URI;

async function main() {
  try {
    await mongoose.connect(MONGO);
    console.log("✅ Connected to MongoDB");

    // --- 1. SEED SUPPLIER ---
    let supplier = null;
    try {
      supplier = await Supplier.findOneAndUpdate(
        { name: "OpenFDA-Provider" },
        { 
          name: "OpenFDA-Provider", 
          status: "APPROVED",
          contactPerson: "FDA Data Source",
          email: "data@openfda.gov"
        },
        { upsert: true, new: true }
      );
      console.log("✅ Supplier created/found:", supplier.name);
    } catch (err) {
      console.log("⚠️ No Supplier model found, skipping supplier reference.");
    }

    // --- 2. SEED DRUGS ---
    // This ensures the Drug collection has data to link to the Inventory.
    await Drug.deleteMany({});
    console.log("🗑️ Cleared existing drugs");
    
    const limit = 50;
    const pages = 2; // Reduced pages to 2 for faster testing
    let totalAdded = 0;

    for (let p = 0; p < pages; p++) {
      const skip = p * limit;
      const query = `${OPENFDA_BASE}?search=openfda.product_type:prescription&limit=${limit}&skip=${skip}`;
      
      console.log(`\n📡 Fetching page ${p + 1}/${pages}...`);

      try {
        const response = await axios.get(query, { timeout: 15000 });
        const results = response.data.results || [];

        for (const item of results) {
          // Extract drug information
          const name = item.openfda?.brand_name?.[0] 
            || item.openfda?.generic_name?.[0] 
            || item.openfda?.substance_name?.[0] 
            || `Drug-${item.id || Date.now()}`;

          const drugData = {
            name,
            category: item.openfda?.product_type?.[0] || "Prescription",
            manufacturer: item.openfda?.manufacturer_name?.[0] || "Unknown Manufacturer",
            batchNumber: `BATCH-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            price: Math.floor(Math.random() * 490) + 10,
            expiryDate: new Date(Date.now() + (1 + Math.random() * 2) * 365 * 24 * 3600 * 1000),
            description: item.purpose?.[0] || item.description?.[0] || "No description available"
          };

          if (supplier) { drugData.supplier = supplier._id; }

          try {
            await Drug.create(drugData);
            totalAdded++;
          } catch (err) {
            if (err.code !== 11000) { console.error(`⚠️ Error adding drug ${name}:`, err.message); }
          }
        }

        console.log(`✅ Page ${p + 1} processed. Total drugs added: ${totalAdded}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Be nice to the API
      } catch (err) {
        console.error(`❌ Error fetching page ${p + 1}:`, err.message);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    console.log(`\n🎉 Drug Seeding complete! Total drugs added: ${totalAdded}`);


    // --- 3. SEED INVENTORY ---
    console.log("\n--- Starting Inventory Seeding ---");
    
    // Clear existing inventory to prevent duplicates
    await Inventory.deleteMany({});
    console.log("🗑️ Cleared existing inventory records.");

    // Fetch all drug IDs and names
    const allDrugs = await Drug.find().select("_id name batchNumber");

    if (allDrugs.length === 0) {
      console.log("⚠️ No drugs found to create inventory for.");
    }

    let inventoryAdded = 0;
    const inventoryDocs = allDrugs.map(drug => {
      inventoryAdded++;
      return {
        drug: drug._id,
        batchNo: drug.batchNumber || `BATCH-INV-${Math.floor(Math.random() * 9999)}`,
        quantity: Math.floor(Math.random() * 500) + 50, // Quantity between 50 and 550
        warehouseLocation: ["A-Shelf-1", "B-Bay-2", "C-Rack-3", "D-Aisle-4"][Math.floor(Math.random() * 4)],
      };
    });
    
    if (inventoryDocs.length > 0) {
      await Inventory.insertMany(inventoryDocs);
      console.log(`🎉 Successfully added ${inventoryAdded} inventory records!`);
    } else {
      console.log("No inventory records were created.");
    }

    process.exit(0);

  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
