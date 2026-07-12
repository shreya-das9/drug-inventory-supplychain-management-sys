import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../src/models/UserModel.js";
import AdminAllowedEmail from "../src/models/AdminAllowedEmailModel.js";

const MONGO = process.env.MONGO_URI;

async function ensure() {
  if (!MONGO) {
    console.error('MONGO_URI not set in environment');
    process.exit(1);
  }

  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to Mongo for admin allowed emails check');

  const admins = await User.find({ role: 'ADMIN' });
  console.log(`Found ${admins.length} admin users`);

  for (const admin of admins) {
    const email = String(admin.email || '').trim().toLowerCase();
    if (!email) continue;
    const existing = await AdminAllowedEmail.findOne({ email });
    if (!existing) {
      await AdminAllowedEmail.create({ email, status: 'ACTIVE', addedBy: 'SYSTEM', reason: 'Auto-added for existing admin user' });
      console.log('Added AdminAllowedEmail for', email);
    } else {
      console.log('AdminAllowedEmail exists for', email);
    }
  }

  await mongoose.disconnect();
  console.log('Done');
}

ensure().catch((e) => { console.error(e); process.exit(1); });
