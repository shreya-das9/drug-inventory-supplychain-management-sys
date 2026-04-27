import mongoose from "mongoose";

const DEFAULT_LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/drug_inventory";

const connectWithUri = async (uri) => {
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = process.env.MONGO_FALLBACK_URI || DEFAULT_LOCAL_MONGO_URI;

  if (!primaryUri) {
    console.error("❌ MONGO_URI is missing in environment variables.");
    process.exit(1);
  }

  try {
    return await connectWithUri(primaryUri);
  } catch (error) {
    const isDev = String(process.env.NODE_ENV || "development").toLowerCase() !== "production";
    const isSrvDnsError = error?.code === "ENOTFOUND" && String(error.message).includes("_mongodb._tcp");

    if (isDev && isSrvDnsError) {
      console.warn("⚠️ Atlas SRV DNS lookup failed. Falling back to local MongoDB...");

      try {
        return await connectWithUri(fallbackUri);
      } catch (fallbackError) {
        console.error(`❌ Local fallback MongoDB connection failed: ${fallbackError.message}`);
      }
    }

    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;