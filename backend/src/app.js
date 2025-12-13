import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { initializeEmailService } from "./services/email.service.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ===== CONNECT TO DATABASE =====
await connectDB();

// Initialize Email Service
initializeEmailService();

// ===== MIDDLEWARE (ORDER MATTERS!) =====
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== CORS FIX (THIS WAS THE PROBLEM) =====
app.use(
  cors({
    origin: "http://localhost:5173",   // ✅ your React frontend port
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

// ===== ROUTES =====

// 1. Auth Routes
try {
  const authRoutes = (await import("./routes/auth.routes.js")).default;
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes loaded");
} catch (err) {
  console.warn("⚠️ Auth routes not found:", err.message);
}

// 2. Admin Drugs Routes
try {
  const drugsRoutes = (await import("./routes/admin/drugs.routes.js")).default;
  app.use("/api/admin/drugs", drugsRoutes);
  console.log("✅ Drugs routes loaded");
} catch (err) {
  console.warn("⚠️ Drugs routes not found:", err.message);
}

// 3. Admin Dashboard Routes
try {
  const dashboardRoutes = (await import("./routes/admin/dashboard.routes.js")).default;
  app.use("/api/admin/dashboard", dashboardRoutes);
  console.log("✅ Dashboard routes loaded");
} catch (err) {
  console.warn("⚠️ Dashboard routes not found:", err.message);
}

// 4. Admin Inventory Routes
try {
  const inventoryRoutes = (await import("./routes/admin/inventory.routes.js")).default;
  app.use("/api/admin/inventory", inventoryRoutes);
  console.log("✅ Inventory routes loaded");
} catch (err) {
  console.warn("⚠️ Inventory routes not found:", err.message);
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
