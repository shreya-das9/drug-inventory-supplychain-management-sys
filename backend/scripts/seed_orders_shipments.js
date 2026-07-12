// backend/scripts/seed_orders_shipments.js
// Run this AFTER seed_openfda.js to add test orders and shipments
// Usage: node scripts/seed_orders_shipments.js

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Import models
import User from "../src/models/UserModel.js";
import Drug from "../src/models/Drug.js";
import Supplier from "../src/models/SupplierModel.js";
import Order from "../src/models/OrderModel.js";
import Shipment from "../src/models/ShipmentModel.js";

const MONGO = process.env.MONGO_URI;

async function seedOrdersAndShipments() {
  try {
    await mongoose.connect(MONGO, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log("✅ Connected to MongoDB");

    // Step 1: Get or create test admin user
    let adminUser = await User.findOne({ role: "ADMIN" });
    if (!adminUser) {
      console.log("Creating test admin user...");
      adminUser = await User.create({
        name: "Test Admin",
        email: "admin@test.com",
        password: "admin123", // Will be hashed by pre-save hook
        role: "ADMIN"
      });
    }
    console.log(`✅ Admin user: ${adminUser.email}`);

    // Step 2: Get or create test users (retailers and regular users)
    // Customers can be provided via environment variable as JSON array to avoid hardcoded demo emails
    // Example: SEED_CUSTOMERS_JSON='[{"name":"John Doe","email":"john@company.com","role":"RETAILER"}]'
    const customers = [];
    const customerDataRaw = process.env.SEED_CUSTOMERS_JSON || '[]';
    let customerData = [];
    try {
      customerData = JSON.parse(customerDataRaw);
    } catch (err) {
      console.error('Invalid SEED_CUSTOMERS_JSON; expected JSON array. Skipping customer seed.');
      customerData = [];
    }

    if (!Array.isArray(customerData) || customerData.length === 0) {
      console.log('No SEED_CUSTOMERS_JSON provided; skipping creation of demo users to avoid seeded demo emails.');
    } else {
      for (const data of customerData) {
        if (!data.email) continue;
        let user = await User.findOne({ email: data.email });
        if (!user) {
          user = await User.create({
            name: data.name || data.email,
            email: data.email,
            password: data.password || 'user123',
            role: data.role || 'USER'
          });
        }
        customers.push(user);
      }
      console.log(`✅ Created ${customers.length} users (retailers/customers)`);
    }

    // Step 3: Get some drugs from database
    const drugs = await Drug.find().limit(20);
    if (drugs.length === 0) {
      console.log("❌ No drugs found! Run seed_openfda.js first");
      process.exit(1);
    }
    console.log(`✅ Found ${drugs.length} drugs`);

    // Step 4: Create test orders
    const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered"];
    const paymentMethods = ["cash", "card", "upi", "net_banking"];
    const orders = [];

    for (let i = 0; i < 15; i++) {
      const customer = customers[i % customers.length];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const orderItems = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const drug = drugs[Math.floor(Math.random() * drugs.length)];
        const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 quantity
        const price = drug.price || 50;
        const subtotal = quantity * price;
        
        orderItems.push({
          drug: drug._id,
          quantity: quantity,
          price: price,
          subtotal: subtotal
        });
        
        totalAmount += subtotal;
      }

      const order = await Order.create({
        user: customer._id,
        items: orderItems,
        totalAmount: totalAmount,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        paymentStatus: Math.random() > 0.3 ? "paid" : "pending",
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        shippingAddress: {
          street: `${Math.floor(Math.random() * 999)} Main St`,
          city: ["Mumbai", "Delhi", "Bangalore", "Kolkata", "Chennai"][Math.floor(Math.random() * 5)],
          state: ["Maharashtra", "Delhi", "Karnataka", "West Bengal", "Tamil Nadu"][Math.floor(Math.random() * 5)],
          zipCode: `${400000 + Math.floor(Math.random() * 100000)}`,
          country: "India",
          phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`
        },
        notes: i % 3 === 0 ? "Urgent delivery required" : null
      });

      orders.push(order);
    }
    console.log(`✅ Created ${orders.length} orders`);

    // Step 5: Get suppliers for shipments
    const suppliers = await Supplier.find().limit(5);
    if (suppliers.length === 0) {
      console.log("⚠️  No suppliers found! Skipping shipment creation");
      console.log("Run seed_openfda.js first to create suppliers");
      process.exit(0);
    }
    console.log(`✅ Found ${suppliers.length} suppliers`);

    // Step 6: Create shipments from suppliers and associate them with retailer orders
    const shipmentStatuses = ["pending", "processing", "shipped", "in_transit", "delivered"];
    const shippingMethods = ["air", "ground", "express", "standard"];
    const carriers = ["Blue Dart", "DTDC", "FedEx", "DHL", "Indian Post"];
    const shipments = [];

    const retailerOrders = orders.filter((order) =>
      customers.some(
        (customer) =>
          customer.role === "RETAILER" &&
          customer._id?.toString() === order.user?.toString()
      )
    );
    const orderList = retailerOrders.length ? retailerOrders : orders;

    // Create one shipment per order in orderList to ensure retailer orders have linked shipments
    for (let i = 0; i < orderList.length; i++) {
      const supplier = suppliers[i % suppliers.length];
      const order = orderList[i] || null;
      const numItems = Math.floor(Math.random() * 4) + 2; // 2-5 items per shipment
      const shipmentItems = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const drug = drugs[Math.floor(Math.random() * drugs.length)];
        const quantity = Math.floor(Math.random() * 50) + 10; // 10-60 units
        const unitPrice = drug.price || 50;
        
        shipmentItems.push({
          drug: drug._id,
          quantity: quantity,
          unitPrice: unitPrice,
          batchNumber: `BATCH-${Date.now()}-${j}`,
          expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000) // 2 years from now
        });
        
        totalAmount += quantity * unitPrice;
      }

      const status = shipmentStatuses[Math.floor(Math.random() * shipmentStatuses.length)];
      const expectedDeliveryDate = new Date(Date.now() + (5 + Math.random() * 10) * 24 * 60 * 60 * 1000); // 5-15 days
      const actualDeliveryDate = (status === 'delivered') 
        ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) 
        : null;

      const shipment = await Shipment.create({
        supplier: supplier._id,
        order: order?._id || null,
        items: shipmentItems,
        status: status,
        origin: {
          address: supplier.address || "Supplier Warehouse",
          city: ["Mumbai", "Delhi", "Bangalore"][Math.floor(Math.random() * 3)],
          state: ["Maharashtra", "Delhi", "Karnataka"][Math.floor(Math.random() * 3)],
          country: "India",
          zipCode: `${400000 + Math.floor(Math.random() * 100000)}`
        },
        destination: {
          address: order ? order.shippingAddress?.street || "Retailer Warehouse" : "Main Warehouse",
          city: order ? order.shippingAddress?.city || "Kolkata" : "Kolkata",
          state: order ? order.shippingAddress?.state || "West Bengal" : "West Bengal",
          country: order ? order.shippingAddress?.country || "India" : "India",
          zipCode: order ? order.shippingAddress?.zipCode || "700001" : "700001"
        },
        expectedDeliveryDate: expectedDeliveryDate,
        actualDeliveryDate: actualDeliveryDate,
        shippingMethod: shippingMethods[Math.floor(Math.random() * shippingMethods.length)],
        carrier: {
          name: carriers[Math.floor(Math.random() * carriers.length)],
          contactNumber: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`
        },
        totalAmount: totalAmount,
        shippingCost: Math.floor(Math.random() * 2000) + 500, // 500-2500 INR
        notes: i % 3 === 0 ? "Urgent - Temperature sensitive medicines" : null,
        createdBy: adminUser._id
      });

      shipments.push(shipment);
    }
    console.log(`✅ Created ${shipments.length} shipments`);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log(`📦 Total Orders: ${orders.length}`);
    console.log(`🚛 Total Shipments: ${shipments.length}`);
    console.log("\nShipment Status Breakdown:");
    const pending = shipments.filter(s => s.status === "pending").length;
    const shipped = shipments.filter(s => s.status === "shipped").length;
    const delivered = shipments.filter(s => s.status === "delivered").length;
    console.log(`  - pending: ${pending}`);
    console.log(`  - shipped: ${shipped}`);
    console.log(`  - delivered: ${delivered}`);
    console.log("\n✅ You can now test shipment endpoints!");
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

// Run the seeding
seedOrdersAndShipments();