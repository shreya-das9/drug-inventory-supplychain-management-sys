// // import express from "express";
// // import cors from "cors";

// // const app = express();

// // // ✅ Allow frontend (5173) to access backend (5000)
// // app.use(cors({
// //   origin: "http://localhost:5173",
// //   methods: ["GET", "POST", "PUT", "DELETE"],
// //   credentials: true
// // }));

// // app.use(express.json());

// // // Example route (for testing only)
// // app.get("/", (req, res) => {
// //   res.send("API is running 🚀");
// // });

// // // Auth routes
// // import authRoutes from "./routes/auth.js";
// // app.use("/api/auth", authRoutes);

// // // import adminRoutes from "./routes/admin/index.js";
// // // app.use("/api/admin", adminRoutes);

// // // import drugRoutes from "./routes/drug.routes.js";

// // // app.use("/api/admin/drugs", drugRoutes);
// // // app.js or server.js
// // import dashboardRoutes from "./routes/admin/dashboard.routes.js";
// // import drugsRoutes from "./routes/admin/drugs.routes.js";
// // import inventoryRoutes from "./routes/admin/inventory.routes.js";

// // // Mount routes

// // app.use("/api/admin/dashboard", dashboardRoutes);
// // app.use("/api/admin/drugs", drugsRoutes);
// // app.use("/api/admin/inventory", inventoryRoutes);



// // const PORT = 5000;
// // app.listen(PORT, () => {
// //   console.log(`✅ Server running on port ${PORT}`);
// // });
// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();

// // ✅ MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// // ✅ Middleware
// app.use(cors({
//   origin: "http://localhost:5173",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));

// app.use(express.json());

// // ✅ Test route
// app.get("/", (req, res) => {
//   res.send("API is running 🚀");
// });

// // ✅ Auth routes
// import authRoutes from "./routes/auth.js";
// app.use("/api/auth", authRoutes);

// // ✅ Admin routes
// import dashboardRoutes from "./routes/admin/dashboard.routes.js";
// import drugsRoutes from "./routes/admin/drugs.routes.js";
// import inventoryRoutes from "./routes/admin/inventory.routes.js";

// app.use("/api/admin/dashboard", dashboardRoutes);
// app.use("/api/admin/drugs", drugsRoutes);
// app.use("/api/admin/inventory", inventoryRoutes);

// // ✅ Error handling middleware (ADD THIS!)
// app.use((err, req, res, next) => {
//   console.error("Server Error:", err);
//   res.status(500).json({ 
//     success: false, 
//     message: err.message || "Internal Server Error" 
//   });
// });

// // ✅ 404 handler for unmatched routes (ADD THIS!)
// app.use((req, res) => {
//   res.status(404).json({ 
//     success: false, 
//     message: `Route ${req.originalUrl} not found` 
//   });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { initializeEmailService } from "./src/services/email.service.js";
import { exec } from 'child_process';
import path from 'path';
import Supplier from './src/models/SupplierModel.js';
import Drug from './src/models/Drug.js';
import Inventory from './src/models/Inventory.js';

dotenv.config();

const app = express();

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Auto-seed test data in development if collections are empty
mongoose.connection.once('open', async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      const [supplierCount, drugCount, inventoryCount] = await Promise.all([
        Supplier.countDocuments(),
        Drug.countDocuments(),
        Inventory.countDocuments(),
      ]);

      if (supplierCount === 0 && drugCount === 0 && inventoryCount === 0) {
        console.log('⚙️ No data found — seeding test data (development mode)');
        const seedScript = path.join(process.cwd(), 'backend', 'scripts', 'seed_test_data.js');
        exec(`node "${seedScript}"`, (err, stdout, stderr) => {
          if (err) {
            console.error('❌ Seeding failed:', err.message);
            return;
          }
          if (stdout) console.log(stdout);
          if (stderr) console.error(stderr);
          console.log('✅ Test data seeding finished');
        });
      }
    }
  } catch (err) {
    console.warn('⚠️ Auto-seed check failed:', err.message);
  }
});

// CORS - allow common dev ports (Vite may choose 5173-5176)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || /^http:\/\/localhost:517\d$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Initialize email service (so notification emails can be sent)
try {
  initializeEmailService();
  console.log("✅ Email service initialized");
} catch (e) {
  console.warn("⚠️ Email service initialization failed:", e.message);
}

// ============= ROUTES =============

// Auth routes
import authRoutes from "./src/routes/auth.routes.js";
app.use("/api/auth", authRoutes);
console.log("✅ Auth routes loaded");

// User routes
import userRoutes from "./src/routes/user.routes.js";
app.use("/api/users", userRoutes);
console.log("✅ User routes loaded");

// Admin Dashboard routes
import dashboardRoutes from "./src/routes/admin/dashboard.routes.js";
app.use("/api/admin/dashboard", dashboardRoutes);
console.log("✅ Dashboard routes loaded");

// Admin Drugs routes
import drugsRoutes from "./src/routes/admin/drugs.routes.js";
app.use("/api/admin/drugs", drugsRoutes);
console.log("✅ Drugs routes loaded");

// Admin Inventory routes
import inventoryRoutes from "./src/routes/admin/inventory.routes.js";
app.use("/api/admin/inventory", inventoryRoutes);
console.log("✅ Inventory routes loaded");

// Admin Suppliers routes (ADDED)
import supplierRoutes from "./src/routes/admin/suppliers.routes.js";
app.use("/api/admin/suppliers", supplierRoutes);
console.log("✅ Suppliers routes loaded");

// Admin Shipments routes (ADDED)
import shipmentRoutes from "./src/routes/admin/shipments.routes.js";
app.use("/api/admin/shipments", shipmentRoutes);
console.log("✅ Shipments routes loaded");

// Admin Orders routes (ADDED)
import orderRoutes from "./src/routes/admin/orders.routes.js";
app.use("/api/admin/orders", orderRoutes);
console.log("✅ Orders routes loaded");

// ============= ERROR HANDLING =============

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ 
    success: false, 
    message: err.message || "Internal Server Error" 
  });
});

// ============= START SERVER =============

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});