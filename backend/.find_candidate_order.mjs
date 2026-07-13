import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/config/db.js';
import OrderModel from './src/models/OrderModel.js';
import ShipmentModel from './src/models/ShipmentModel.js';
import './src/models/Drug.js';

await connectDB();
const orders = await OrderModel.find({ status: 'confirmed', supplier: null }).lean();
const results = [];
for (const o of orders) {
  const shipment = await ShipmentModel.findOne({ order: o._id }).lean();
  results.push({
    id: o._id.toString(),
    orderNumber: o.orderNumber,
    supplier: o.supplier,
    hasShipment: !!shipment,
    shipmentId: shipment?._id?.toString(),
    itemDrugRefs: o.items.map(i => i.drug)
  });
}
console.log(JSON.stringify({ count: orders.length, results }, null, 2));
process.exit(0);
