import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../src/models/UserModel.js';
import mongoose from 'mongoose';

dotenv.config();

const MONGO = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO);
  const admin = await User.findOne({ email: 'drug.inventory.management.system@gmail.com' });
  if (!admin) {
    console.error('Admin user not found');
    process.exit(1);
  }

  const payload = { id: admin._id, role: admin.role, email: admin.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  console.log(token);
  await mongoose.connection.close();
}

run().catch((e) => { console.error(e); process.exit(1); });
