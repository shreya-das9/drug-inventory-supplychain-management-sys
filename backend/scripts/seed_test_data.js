/**
 * Seed Test Data for Dashboard E2E Testing
 * Creates sample drugs, inventory, and alerts for comprehensive testing
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Drug from "../src/models/Drug.js";
import Inventory from "../src/models/Inventory.js";
import Supplier from "../src/models/SupplierModel.js";
import Scanlog from "../src/models/ScanlogModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/drug_inventory";

async function seedTestData() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Clear existing test data
    console.log("🧹 Clearing test collections...");
    await Drug.deleteMany({ manufacturer: "TEST_MANUFACTURER" });
    await Inventory.deleteMany({ warehouseLocation: "TEST_WAREHOUSE" });
    await Scanlog.deleteMany({ details: { test: true } });

    // Create test supplier
    let supplier = await Supplier.findOne({ name: "TEST_SUPPLIER" });
    if (!supplier) {
      supplier = await Supplier.create({
        name: "TEST_SUPPLIER",
        email: "test@supplier.com",
        phone: "123-456-7890",
        location: "Test City",
        status: "APPROVED",
      });
      console.log("✅ Created test supplier");
    }

    // 1. NORMAL DRUGS (For totalDrugs count)
    console.log("📦 Creating normal drugs...");
    const normalDrugs = [];
    for (let i = 1; i <= 5; i++) {
      const drug = await Drug.create({
        name: `Test Drug ${i}`,
        manufacturer: "TEST_MANUFACTURER",
        supplier: supplier._id,
        batchNumber: `BATCH-${1000 + i}`,
        category: "Antibiotic",
        price: 50 + i * 10,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      });
      normalDrugs.push(drug);
    }
    console.log(`✅ Created ${normalDrugs.length} normal drugs`);

    // 2. LOW STOCK DRUGS (For lowStockCount)
    console.log("📉 Creating low stock scenarios...");
    const lowStockDrugs = [];
    for (let i = 1; i <= 3; i++) {
      const drug = await Drug.create({
        name: `Low Stock Drug ${i}`,
        manufacturer: "TEST_MANUFACTURER",
        supplier: supplier._id,
        batchNumber: `LOW-BATCH-${2000 + i}`,
        category: "Painkiller",
        price: 25 + i * 5,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
      });

      // Create inventory with LOW quantity (< 10)
      await Inventory.create({
        drug: drug._id,
        quantity: 3 + i, // Will be 4, 5, 6 (all < 10)
        warehouseLocation: "TEST_WAREHOUSE",
        threshold: 20,
      });
      lowStockDrugs.push(drug);
    }
    console.log(`✅ Created ${lowStockDrugs.length} low stock scenarios`);

    // 3. EXPIRING DRUGS (For expiryAlerts - next 30 days)
    console.log("⏰ Creating expiring drug scenarios...");
    const expiringDrugs = [];
    for (let i = 1; i <= 4; i++) {
      const daysUntilExpiry = 10 + i * 2; // 12, 14, 16, 18 days
      const expiryDate = new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000);
      
      const drug = await Drug.create({
        name: `Expiring Drug ${i}`,
        manufacturer: "TEST_MANUFACTURER",
        supplier: supplier._id,
        batchNumber: `EXP-BATCH-${3000 + i}`,
        category: "Antibiotic",
        price: 30,
        expiryDate: expiryDate,
      });

      // Create inventory for expiring drug
      await Inventory.create({
        drug: drug._id,
        quantity: 50, // Normal quantity
        warehouseLocation: "TEST_WAREHOUSE",
      });
      expiringDrugs.push(drug);
    }
    console.log(`✅ Created ${expiringDrugs.length} expiring drug scenarios`);

    // 4. ALREADY EXPIRED DRUGS (For expiredCount)
    console.log("💀 Creating already expired scenarios...");
    const expiredDrugs = [];
    for (let i = 1; i <= 2; i++) {
      const drug = await Drug.create({
        name: `Expired Drug ${i}`,
        manufacturer: "TEST_MANUFACTURER",
        supplier: supplier._id,
        batchNumber: `OLD-BATCH-${4000 + i}`,
        category: "Antibiotic",
        price: 20,
        expiryDate: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000), // Already expired
      });

      // Create inventory for expired drug
      await Inventory.create({
        drug: drug._id,
        quantity: 5,
        warehouseLocation: "TEST_WAREHOUSE",
      });
      expiredDrugs.push(drug);
    }
    console.log(`✅ Created ${expiredDrugs.length} already expired scenarios`);

    // 5. SECURITY/TRANSIT ALERTS (For securityTransitAlerts)
    console.log("🚚 Creating transit delay scenarios...");
    for (let i = 1; i <= 2; i++) {
      await Scanlog.create({
        bleId: `BLE-DEVICE-${5000 + i}`,
        stage: "DISTRIBUTOR_TO_WAREHOUSE",
        scannedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        alertCodes: ["TRANSIT_TIME_EXCEEDED"],
        location: `Route ${i}`,
        verificationStatus: "PENDING",
        details: {
          test: true,
          transitDelay: {
            routeKey: `ROUTE-${i}`,
            elapsedMinutes: 150,
            allowedMinutes: 120,
            trafficCondition: "HEAVY",
            delayReason: "Weather conditions",
            delayReasonAccepted: false,
          },
        },
      });
    }
    console.log("✅ Created transit delay scenarios");

    // Print Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST DATA SEED SUMMARY");
    console.log("=".repeat(60));
    const totalDrugs = await Drug.countDocuments({ manufacturer: "TEST_MANUFACTURER" });
    const lowStockCount = await Inventory.countDocuments({ quantity: { $lt: 10 }, warehouseLocation: "TEST_WAREHOUSE" });
    const expiredCount = await Drug.countDocuments({
      manufacturer: "TEST_MANUFACTURER",
      expiryDate: { $lt: new Date() },
    });
    console.log(`✅ Total Drugs: ${totalDrugs}`);
    console.log(`✅ Low Stock Items: ${lowStockCount}`);
    console.log(`✅ Expired Drugs: ${expiredCount}`);
    console.log(`✅ Expiring Soon (30 days): ${expiringDrugs.length}`);
    console.log(`✅ Transit Alerts: 2`);
    console.log("=".repeat(60));

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedTestData();
