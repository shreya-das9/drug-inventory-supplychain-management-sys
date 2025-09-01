import express from "express";
import cors from "cors";

const app = express();

// ✅ Allow frontend (5173) to access backend (5000)
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Example route (for testing only)
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Auth routes
import authRoutes from "./routes/auth.js";
app.use("/api/auth", authRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
