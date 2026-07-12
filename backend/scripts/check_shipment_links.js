import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from '../src/models/UserModel.js';
import Order from '../src/models/OrderModel.js';
import Shipment from '../src/models/ShipmentModel.js';

const MONGO = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

  const totalOrders = await Order.countDocuments();
  const retailerUsers = await User.find({ role: 'RETAILER' }).select('_id email').lean();
  const retailerOrderCount = await Order.countDocuments({ user: { $in: retailerUsers.map((u) => u._id) } });
  const totalShipments = await Shipment.countDocuments();
  const shipmentsWithOrder = await Shipment.countDocuments({ order: { $ne: null } });
  const shipmentsLinkedToRetailerOrders = await Shipment.countDocuments({ order: { $in: await Order.find({ user: { $in: retailerUsers.map((u) => u._id) } }).distinct('_id') } });

  console.log('totalOrders', totalOrders);
  console.log('retailerUsers', retailerUsers.length);
  console.log('retailerOrderCount', retailerOrderCount);
  console.log('totalShipments', totalShipments);
  console.log('shipmentsWithOrder', shipmentsWithOrder);
  console.log('shipmentsLinkedToRetailerOrders', shipmentsLinkedToRetailerOrders);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
