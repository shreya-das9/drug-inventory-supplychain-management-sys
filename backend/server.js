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

dotenv.config();

const app = express();

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// CORS
app.use(
  cors({
    origin: "http://localhost:5174",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ============= ROUTES =============

// Auth routes
import authRoutes from "./routes/auth.routes.js";
app.use("/api/auth", authRoutes);
console.log("✅ Auth routes loaded");

// Admin Dashboard routes
import dashboardRoutes from "./routes/admin/dashboard.routes.js";
app.use("/api/admin/dashboard", dashboardRoutes);
console.log("✅ Dashboard routes loaded");

// Admin Drugs routes
import drugsRoutes from "./routes/admin/drugs.routes.js";
app.use("/api/admin/drugs", drugsRoutes);
console.log("✅ Drugs routes loaded");

// Admin Inventory routes
import inventoryRoutes from "./routes/admin/inventory.routes.js";
app.use("/api/admin/inventory", inventoryRoutes);
console.log("✅ Inventory routes loaded");

// Admin Suppliers routes (ADDED)
import supplierRoutes from "./routes/admin/suppliers.routes.js";
app.use("/api/admin/suppliers", supplierRoutes);
console.log("✅ Suppliers routes loaded");

// Admin Shipments routes (ADDED)
import shipmentRoutes from "./routes/admin/shipments.routes.js";
app.use("/api/admin/shipments", shipmentRoutes);
console.log("✅ Shipments routes loaded");

// Admin Orders routes (ADDED)
import orderRoutes from "./routes/admin/orders.routes.js";
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