import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import UserModel from './src/models/UserModel.js';
import OrderModel from './src/models/OrderModel.js';

await mongoose.connect(process.env.MONGO_URI);

const user = await UserModel.findOne({ email: 'its.susneha@gmail.com' }).lean();
console.log('USER', JSON.stringify(user, null, 2));

const orders = await OrderModel.find({
  $or: [
    { userEmail: 'its.susneha@gmail.com' },
    { createdByEmail: 'its.susneha@gmail.com' },
    { user: user?._id },
    { createdBy: user?._id },
  ],
}).sort({ createdAt: -1 }).limit(10).lean();

console.log('ORDERS', JSON.stringify(orders, null, 2));

await mongoose.disconnect();
