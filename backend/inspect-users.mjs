import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./src/models/UserModel.js";

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("MONGO_URI not set");
      process.exit(1);
    }
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    const users = await User.find({}).limit(20).lean();
    console.log(`Found ${users.length} users`);
    users.forEach(user => {
      console.log(JSON.stringify({ email: user.email, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt }, null, 2));
    });
  } catch (err) {
    console.error("ERROR", err);
  } finally {
    await mongoose.disconnect();
  }
})();