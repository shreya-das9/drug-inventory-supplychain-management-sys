// // import express from "express";
// // import cors from "cors"; // Add this import
// // import dotenv from "dotenv";
// // import connectDB from "./config/db.js";
// // import authRoutes from "./routes/auth.routes.js";
// // import { initializeEmailService } from "./services/email.service.js";

// // dotenv.config();
// // connectDB();

// // // Initialize the email service after dotenv is configured
// // initializeEmailService();

// // const app = express();

// // // ✅ Add CORS middleware BEFORE other middleware
// // app.use(cors({
// //   origin: "http://localhost:5173",
// //   methods: ["GET", "POST", "PUT", "DELETE"],
// //   credentials: true
// // }));

// // app.use(express.json());

// // app.use("/api/auth", authRoutes);

// // app.listen(process.env.PORT || 5000, () => {
// //   console.log(`🚀 API running on http://localhost:${process.env.PORT || 5000}`);
// // });

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/auth.routes.js";
// import { initializeEmailService } from "./services/email.service.js";

// // ✅ Import admin routes
// import dashboardRoutes from "./routes/admin/dashboard.routes.js";
// import drugsRoutes from "./routes/admin/drugs.routes.js";
// import inventoryRoutes from "./routes/admin/inventory.routes.js";

// dotenv.config();
// connectDB();

// // Initialize the email service after dotenv is configured
// initializeEmailService();

// const app = express();

// // ✅ CORS middleware
// app.use(cors({
//   origin: "http://localhost:5173",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));

// app.use(express.json());

// // ✅ Auth routes
// app.use("/api/auth", authRoutes);

// // ✅ Admin routes (ADD THESE!)
// app.use("/api/admin/dashboard", dashboardRoutes);
// app.use("/api/admin/drugs", drugsRoutes);
// app.use("/api/admin/inventory", inventoryRoutes);

// // ✅ Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Server Error:", err);
//   res.status(500).json({ 
//     success: false, 
//     message: err.message || "Internal Server Error" 
//   });
// });

// // ✅ 404 handler
// app.use((req, res) => {
//   res.status(404).json({ 
//     success: false, 
//     message: `Route ${req.originalUrl} not found` 
//   });
// });

// app.listen(process.env.PORT || 5000, () => {
//   console.log(`🚀 API running on http://localhost:${process.env.PORT || 5000}`);
// });

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import morgan from "morgan";
// import connectDB from "./config/db.js";

// // Load environment variables
// dotenv.config();

// // Initialize Express app
// const app = express();

// // ===== CONNECT TO DATABASE =====
// await connectDB();

// // ===== MIDDLEWARE (ORDER MATTERS!) =====
// app.use(morgan("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//   origin: "http://localhost:5173",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));

// // ===== ROUTES =====
// try {
//   const { default: authRoutes } = await import("./routes/auth.routes.js");
//   app.use("/api/auth", authRoutes);
//   console.log("✅ Auth routes loaded");
// } catch (err) {
//   console.warn("⚠️  Auth routes not found:", err.message);
// }

// try {
//   const { default: drugsRoutes } = await import("./routes/admin/drugs.routes.js");
//   app.use("/api/admin/drugs", drugsRoutes);
//   console.log("✅ Drugs routes loaded");
// } catch (err) {
//   console.warn("⚠️  Drugs routes not found:", err.message);
// }

// try {
//   const { default: dashboardRoutes } = await import("./routes/admin/dashboard.routes.js");
//   app.use("/api/admin/dashboard", dashboardRoutes);
//   console.log("✅ Dashboard routes loaded");
// } catch (err) {
//   console.warn("⚠️  Dashboard routes not found:", err.message);
// }

// try {
//   const { default: inventoryRoutes } = await import("./routes/admin/inventory.routes.js");
//   app.use("/api/admin/inventory", inventoryRoutes);
//   console.log("✅ Inventory routes loaded");
// } catch (err) {
//   console.warn("⚠️  Inventory routes not found:", err.message);
// }

// // ===== TEST ROUTE =====
// app.get("/api/test", (req, res) => {
//   res.json({ success: true, message: "Server is running!" });
// });

// // ===== 404 HANDLER =====
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`
//   });
// });

// // ===== ERROR HANDLING MIDDLEWARE =====
// app.use((err, req, res, next) => {
//   console.error("Server Error:", err);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error"
//   });
// });

// // ===== START SERVER =====
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 API running on http://localhost:${PORT}`);
// });

// export default app;




// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import morgan from "morgan";
// import connectDB from "./config/db.js";
// // 👇 NEW: Import the email service initialization
// import { initializeEmailService } from "./services/email.service.js"; 


// // Load environment variables
// dotenv.config();

// // Initialize Express app
// const app = express();

// // ===== CONNECT TO DATABASE =====
// await connectDB();

// // 👇 NEW: Initialize Email Service
// initializeEmailService();

// // ===== MIDDLEWARE (ORDER MATTERS!) =====
// app.use(morgan("dev"));
// // ... rest of middleware is the same ...
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//   origin: "http://localhost:5173",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));

// // ===== ROUTES =====
// // ... rest of routes logic is the same ...
// try {
//   const { default: authRoutes } = await import("./routes/auth.routes.js");
//   app.use("/api/auth", authRoutes);
//   console.log("✅ Auth routes loaded");
// } catch (err) {
//   console.warn("⚠️  Auth routes not found:", err.message);
// }

// // ... rest of routes ...

// // ===== TEST ROUTE =====
// app.get("/api/test", (req, res) => {
//   res.json({ success: true, message: "Server is running!" });
// });

// // ===== 404 HANDLER =====
// app.use((req, res) => {
// // ... same as before ...
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`
//   });
// });

// // ===== ERROR HANDLING MIDDLEWARE =====
// app.use((err, req, res, next) => {
// // ... same as before ...
//   console.error("Server Error:", err);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error"
//   });
// });

// // ===== START SERVER =====
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 API running on http://localhost:${PORT}`);
// });

// export default app;






import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
// 👇 NEW: Import the email service initialization
import { initializeEmailService } from "./services/email.service.js"; 


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ===== CONNECT TO DATABASE =====
await connectDB();

// 👇 NEW: Initialize Email Service
initializeEmailService();

// ===== MIDDLEWARE (ORDER MATTERS!) =====
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ===== ROUTES (USING SIMPLE REQUIRE FOR RELIABILITY) =====

// 1. Auth Routes
try {
  // Using require() and .default to handle ES module imports reliably
  const authRoutes = (await import("./routes/auth.routes.js")).default;
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes loaded");
} catch (err) {
  console.warn("⚠️  Auth routes not found:", err.message);
}

// 2. Admin Drugs Routes
try {
  const drugsRoutes = (await import("./routes/admin/drugs.routes.js")).default;
  app.use("/api/admin/drugs", drugsRoutes);
  console.log("✅ Drugs routes loaded");
} catch (err) {
  console.warn("⚠️  Drugs routes not found:", err.message);
}

// 3. Admin Dashboard Routes
try {
  const dashboardRoutes = (await import("./routes/admin/dashboard.routes.js")).default;
  app.use("/api/admin/dashboard", dashboardRoutes);
  console.log("✅ Dashboard routes loaded");
} catch (err) {
  console.warn("⚠️  Dashboard routes not found:", err.message);
}

// 4. Admin Inventory Routes
try {
  const inventoryRoutes = (await import("./routes/admin/inventory.routes.js")).default;
  app.use("/api/admin/inventory", inventoryRoutes);
  console.log("✅ Inventory routes loaded");
} catch (err) {
  console.warn("⚠️  Inventory routes not found:", err.message);
}

// ===== TEST ROUTE =====
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Server is running!" });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ===== ERROR HANDLING MIDDLEWARE =====
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});

export default app;
