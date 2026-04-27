import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { initializeEmailService } from "./services/email.service.js";
import { initializeBLEService } from "./services/ble.service.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ===== CONNECT TO DATABASE =====
await connectDB();

// Initialize Email Service
initializeEmailService();

// Initialize BLE Service
const BLE_ENABLED = String(process.env.BLE_ENABLED ?? "true").toLowerCase() === "true";

if (BLE_ENABLED) {
  initializeBLEService({
    autoStart: process.env.BLE_AUTO_START === "true"
  }).catch((error) => {
    console.warn("⚠️ BLE initialization skipped:", error.message);
  });
} else {
  console.log("ℹ️ BLE disabled via BLE_ENABLED=false");
}

// ===== MIDDLEWARE (ORDER MATTERS!) =====
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== CORS FIX (THIS WAS THE PROBLEM) =====
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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

// 1b. User Routes
try {
  const userRoutes = (await import("./routes/user.routes.js")).default;
  app.use("/api/users", userRoutes);
  console.log("✅ User routes loaded");
} catch (err) {
  console.warn("⚠️ User routes not found:", err.message);
}

// 1c. AI Routes
try {
  const aiRoutes = (await import("./routes/ai.routes.js")).default;
  app.use("/api/ai", aiRoutes);
  console.log("✅ AI routes loaded");
} catch (err) {
  console.warn("⚠️ AI routes not found:", err.message);
}

// 1d. Compliance Routes
try {
  const complianceRoutes = (await import("./routes/compliance.routes.js")).default;
  app.use("/api/compliance", complianceRoutes);
  console.log("✅ Compliance routes loaded");
} catch (err) {
  console.warn("⚠️ Compliance routes not found:", err.message);
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

// 5. Admin Suppliers Routes
try {
  const suppliersRoutes = (await import("./routes/admin/suppliers.routes.js")).default;
  app.use("/api/admin/suppliers", suppliersRoutes);
  console.log("✅ Suppliers routes loaded");
} catch (err) {
  console.warn("⚠️ Suppliers routes not found:", err.message);
}

// 6. Admin Shipments Routes
try {
  const shipmentsRoutes = (await import("./routes/admin/shipments.routes.js")).default;
  app.use("/api/admin/shipments", shipmentsRoutes);
  console.log("✅ Shipments routes loaded");
} catch (err) {
  console.warn("⚠️ Shipments routes not found:", err.message);
}

// 7. Admin Orders Routes
try {
  const ordersRoutes = (await import("./routes/admin/orders.routes.js")).default;
  app.use("/api/admin/orders", ordersRoutes);
  console.log("✅ Orders routes loaded");
} catch (err) {
  console.warn("⚠️ Orders routes not found:", err.message);
}

// 8. BLE Routes
try {
  const bleRoutes = (await import("./routes/ble.routes.js")).default;
  app.use("/api/ble", bleRoutes);
  console.log("✅ BLE routes loaded");
} catch (err) {
  console.warn("⚠️ BLE routes not found:", err.message);
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
const BASE_PORT = Number(process.env.PORT || 5000);
const MAX_PORT_RETRIES = 10;

const startServer = (port, retryCount = 0) => {
  const server = app.listen(port, () => {
    console.log(`🚀 API running on http://localhost:${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      if (retryCount >= MAX_PORT_RETRIES) {
        console.error(
          `❌ Could not start server: ports ${BASE_PORT}-${port} are already in use.`
        );
        process.exit(1);
      }

      const nextPort = port + 1;
      console.warn(`⚠️ Port ${port} is in use. Retrying on ${nextPort}...`);
      startServer(nextPort, retryCount + 1);
      return;
    }

    console.error("❌ Server startup error:", error);
    process.exit(1);
  });
};

startServer(BASE_PORT);

 export default app;