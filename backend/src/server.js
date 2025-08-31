import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import cors from 'cors';

const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Import auth routes using ES module syntax
import authRoutes from './routes/auth.js';
app.use("/api/auth", authRoutes);

// Start server
(async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
})();