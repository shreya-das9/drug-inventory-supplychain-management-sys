import mongoose from "mongoose";
import dotenv from "dotenv";
import SupplierModel from "../src/models/SupplierModel.js";
import ShipmentModel from "../src/models/ShipmentModel.js";
import OrderModel from "../src/models/OrderModel.js";
import Drug from "../src/models/Drug.js";
import UserModel from "../src/models/UserModel.js";

dotenv.config();

const MONGO = process.env.MONGO_URI;

// Helper function to generate tracking number
function generateTrackingNumber() {
  return `TRK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// Helper function to generate order number
function generateOrderNumber() {
  return `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// Indian addresses for warehouses
const indianCities = [
  { city: "Mumbai", state: "Maharashtra", address: "123 Pharma Street, Bandra" },
  { city: "Bangalore", state: "Karnataka", address: "456 Drug Lane, Whitefield" },
  { city: "Delhi", state: "Delhi", address: "789 Medical Avenue, Dwarka" },
  { city: "Chennai", state: "Tamil Nadu", address: "321 Health Road, T. Nagar" },
  { city: "Hyderabad", state: "Telangana", address: "654 Supply Chain Blvd, Hitech City" },
  { city: "Ahmedabad", state: "Gujarat", address: "987 Pharma Park, Mani Nagar" }
];

// Supplier names
const supplierNames = [
  "Cipla Limited",
  "Dr. Reddy's Laboratories",
  "Lupin Limited",
  "Aurobindo Pharma",
  "Alembic Pharmaceuticals",
  "Mankind Pharma",
  "Torrent Pharmaceuticals",
  "Sun Pharmaceutical",
  "Glenmark Pharma",
  "Cadila Healthcare"
];

async function seedSuppliers() {
  console.log("\n--- Starting Supplier Seeding ---");
  
  try {
    const suppliers = [];
    
    for (const name of supplierNames) {
      try {
        const supplier = await SupplierModel.findOneAndUpdate(
          { name },
          {
            name,
            contactPerson: `${name.split(" ")[0]} Manager`,
            email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
            phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            address: indianCities[Math.floor(Math.random() * indianCities.length)].address,
            status: ["APPROVED", "APPROVED", "APPROVED", "PENDING"][Math.floor(Math.random() * 4)]
          },
          { upsert: true, new: true }
        );
        suppliers.push(supplier);
        console.log(`✅ Supplier: ${supplier.name} (${supplier.status})`);
      } catch (err) {
        console.error(`⚠️ Error creating supplier ${name}:`, err.message);
      }
    }
    
    console.log(`\n🎉 Supplier Seeding complete! Total suppliers: ${suppliers.length}`);
    return suppliers;
  } catch (err) {
    console.error("❌ Error in seedSuppliers:", err.message);
    return [];
  }
}

async function seedShipments(suppliers) {
  console.log("\n--- Starting Shipment Seeding ---");
  
  try {
    const drugs = await Drug.find().select("_id name");
    const users = await UserModel.find().select("_id");
    
    console.log(`📦 Found ${drugs.length} drugs to create shipments from`);
    console.log(`👥 Found ${users.length} users for createdBy`);
    
    if (drugs.length === 0) {
      console.log("⚠️ No drugs found! Make sure to seed drugs first using: node scripts/open_fda.js");
      return;
    }
    
    if (suppliers.length === 0) {
      console.log("⚠️ No suppliers found!");
      return;
    }

    if (users.length === 0) {
      console.log("⚠️ No users found! Cannot create shipments without createdBy user.");
      return;
    }

    let shipmentCount = 0;
    const statusOptions = ['pending', 'processing', 'shipped', 'in_transit', 'delivered'];
    const shipmentDocs = [];

    for (let i = 0; i < 15; i++) {
      const randomDrugs = drugs
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 5) + 1);

      const items = randomDrugs.map(drug => ({
        drug: drug._id,
        quantity: Math.floor(Math.random() * 100) + 10,
        unitPrice: Math.floor(Math.random() * 490) + 10,
        batchNumber: `BATCH-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 9)}`,
        expiryDate: new Date(Date.now() + (1 + Math.random() * 2) * 365 * 24 * 3600 * 1000)
      }));

      const origin = indianCities[Math.floor(Math.random() * indianCities.length)];
      const destination = indianCities[Math.floor(Math.random() * indianCities.length)];

      shipmentDocs.push({
        trackingNumber: generateTrackingNumber(),
        supplier: suppliers[Math.floor(Math.random() * suppliers.length)]._id,
        items,
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
        origin: {
          address: origin.address,
          city: origin.city,
          state: origin.state,
          country: "India",
          zipCode: `${Math.floor(Math.random() * 900000) + 100000}`
        },
        destination: {
          address: destination.address,
          city: destination.city,
          state: destination.state,
          country: "India",
          zipCode: `${Math.floor(Math.random() * 900000) + 100000}`
        },
        expectedDeliveryDate: new Date(Date.now() + (3 + Math.random() * 14) * 24 * 3600 * 1000),
        actualDeliveryDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 10 * 24 * 3600 * 1000) : null,
        createdBy: users[Math.floor(Math.random() * users.length)]._id
      });
    }

    if (shipmentDocs.length > 0) {
      await ShipmentModel.insertMany(shipmentDocs);
      shipmentCount = shipmentDocs.length;
      console.log(`🎉 Successfully added ${shipmentCount} shipment records!`);
    }
  } catch (err) {
    console.error("❌ Error in seedShipments:", err.message);
  }
}

async function seedOrders(suppliers) {
  console.log("\n--- Starting Order Seeding ---");
  
  try {
    const drugs = await Drug.find().select("_id name");
    const users = await UserModel.find().select("_id");

    console.log(`💊 Found ${drugs.length} drugs`);
    console.log(`👥 Found ${users.length} users`);

    if (drugs.length === 0) {
      console.log("⚠️ No drugs found! Make sure to seed drugs first using: node scripts/open_fda.js");
      return;
    }

    if (users.length === 0) {
      console.log("⚠️ No users found! Make sure users are created in the system.");
      return;
    }

    let orderCount = 0;
    const statusOptions = ['pending', 'approved', 'processing', 'completed', 'delivered'];
    const paymentStatusOptions = ['pending', 'paid'];
    const orderDocs = [];

    for (let i = 0; i < 20; i++) {
      const randomDrugs = drugs
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 8) + 2);

      const items = randomDrugs.map(drug => {
        const price = Math.floor(Math.random() * 490) + 10;
        const quantity = Math.floor(Math.random() * 50) + 5;
        return {
          drug: drug._id,
          quantity,
          price,
          subtotal: price * quantity
        };
      });

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const shippingAddress = indianCities[Math.floor(Math.random() * indianCities.length)];

      orderDocs.push({
        orderNumber: generateOrderNumber(),
        user: randomUser._id,
        supplier: suppliers.length > 0 ? suppliers[Math.floor(Math.random() * suppliers.length)]._id : null,
        items,
        totalAmount,
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
        paymentStatus: paymentStatusOptions[Math.floor(Math.random() * paymentStatusOptions.length)],
        paymentMethod: ['cash', 'card', 'upi', 'net_banking'][Math.floor(Math.random() * 4)],
        shippingAddress: {
          street: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: `${Math.floor(Math.random() * 900000) + 100000}`,
          country: "India"
        },
        notes: `Order for medical supplies - Priority: ${Math.random() > 0.5 ? 'High' : 'Standard'}`
      });
    }

    if (orderDocs.length > 0) {
      await OrderModel.insertMany(orderDocs);
      orderCount = orderDocs.length;
      console.log(`🎉 Successfully added ${orderCount} order records!`);
    }
  } catch (err) {
    console.error("❌ Error in seedOrders:", err.message);
  }
}

async function main() {
  try {
    console.log("🔌 Attempting to connect to MongoDB...");
    await mongoose.connect(MONGO, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000
    });
    console.log("✅ Connected to MongoDB");

    // Seed suppliers
    const suppliers = await seedSuppliers();

    // Seed shipments
    await seedShipments(suppliers);

    // Seed orders
    await seedOrders(suppliers);

    console.log("\n✅ All supply chain data seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Fatal error:", err.message);
    process.exit(1);
  }
}

main();
