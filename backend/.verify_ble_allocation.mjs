import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/config/db.js';
import OrderModel from './src/models/OrderModel.js';
import ShipmentModel from './src/models/ShipmentModel.js';
import BLERegistry from './src/models/BLERegistryModel.js';
import User from './src/models/UserModel.js';
import './src/models/Drug.js';
import { allocateBleToShipment } from './src/controllers/bleAllocation.controller.js';

const run = async () => {
  await connectDB();

  const user = await User.findOne({ role: { $in: ['ADMIN', 'admin', 'WAREHOUSE_ADMIN', 'warehouse_admin', 'warehouse'] } }).lean();
  if (!user) throw new Error('No admin/warehouse user found');

  const orders = await OrderModel.find({ status: 'confirmed', $or: [{ supplier: { $exists: false } }, { supplier: null }] }).lean();
  let order = null;
  let createdOrder = false;

  if (orders && orders.length > 0) {
    for (const candidate of orders) {
      const existingShipment = await ShipmentModel.findOne({ order: candidate._id }).lean();
      if (!existingShipment) {
        order = candidate;
        break;
      }
    }
  }

  if (!order) {
    const drug = await import('./src/models/Drug.js').then((m) => m.default).then((Drug) => Drug.findOne({ supplier: { $exists: true, $ne: null } }).lean());
    if (!drug) throw new Error('No drug with a supplier found to create a test order');

    const user = await User.findOne({ role: { $in: ['ADMIN', 'admin', 'WAREHOUSE_ADMIN', 'warehouse_admin', 'warehouse'] } }).lean();
    if (!user) throw new Error('No admin/warehouse user found for test order creation');

    const orderData = {
      user: user._id,
      purchaseOrderNumber: `TEST-${Date.now()}`,
      createdBy: user._id,
      items: [
        {
          drug: drug._id,
          quantity: 1,
          price: drug.price || 10,
          subtotal: drug.price || 10
        }
      ],
      totalAmount: drug.price || 10,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      shippingAddress: {
        street: '123 Test Lane',
        city: 'Testville',
        state: 'TestState',
        zipCode: '00000',
        country: 'Testland',
        phone: '0000000000'
      },
      statusHistory: [
        { status: 'confirmed', timestamp: new Date(), updatedBy: user._id, notes: 'Test order confirmed' }
      ]
    };

    order = await OrderModel.create(orderData);
    createdOrder = true;
  }

  const availableBle = await BLERegistry.findOne({ status: 'UNUSED' }).lean();
  if (!availableBle) throw new Error('No UNUSED BLE registry item available');

  console.log('Selected order:', String(order._id));
  console.log('Order supplier:', order.supplier);
  console.log('Order item drug suppliers:', order.items.map((item) => item.drug));
  console.log('Selected BLE:', availableBle.bleId, availableBle._id.toString());
  console.log('Using user:', String(user._id), user.role);

  const req = { body: { orderId: order._id.toString() }, user: { _id: user._id, role: user.role } };
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      console.log('allocation response:', codeOrPayload(this.statusCode, payload));
      return payload;
    }
  };

  const codeOrPayload = (code, payload) => ({ code, payload });

  try {
    await allocateBleToShipment(req, res);
  } catch (err) {
    console.error('Controller threw error:', err);
    process.exit(1);
  }

  if (!res.payload || res.payload.success !== true) {
    throw new Error('Allocation did not succeed: ' + JSON.stringify(res.payload));
  }

  const { data } = res.payload;
  if (!data?.shipmentId) throw new Error('Allocation response missing shipmentId');

  const shipment = await ShipmentModel.findById(data.shipmentId).lean();
  if (!shipment) throw new Error('Shipment not found after allocation');
  if (!shipment.supplier) throw new Error('Shipment missing supplier');
  if (!shipment.bleId) throw new Error('Shipment missing bleId');

  const updatedBle = await BLERegistry.findOne({ bleId: data.bleId }).lean();
  if (!updatedBle) throw new Error('Allocated BLE registry entry not found');
  if (updatedBle.status !== 'ACTIVE') throw new Error(`BLE registry status is not ACTIVE: ${updatedBle.status}`);

  const duplicateReq = { body: { shipmentId: shipment._id.toString() }, user: { _id: user._id, role: user.role } };
  const duplicateRes = { status(code) { this.statusCode = code; return this; }, json(payload) { this.payload = payload; return payload; } };
  await allocateBleToShipment(duplicateReq, duplicateRes);
  if (!duplicateRes.payload || duplicateRes.payload.success !== false) {
    throw new Error('Duplicate allocation should have failed but did not');
  }
  if (duplicateRes.statusCode !== 400 && duplicateRes.statusCode !== 409) {
    throw new Error(`Duplicate allocation did not return expected status, got ${duplicateRes.statusCode}`);
  }

  console.log('END-TO-END VERIFICATION PASSED');
  console.log('Shipment created:', shipment._id.toString());
  console.log('Shipment supplier:', String(shipment.supplier));
  console.log('Shipment bleId:', shipment.bleId);
  console.log('BLE registry status:', updatedBle.status);
};

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
