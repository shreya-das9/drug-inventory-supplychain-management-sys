import assert from 'assert';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../src/models/UserModel.js';
import OrderModel from '../src/models/OrderModel.js';
import ShipmentModel from '../src/models/ShipmentModel.js';
import ComplianceModel from '../src/models/ComplianceModel.js';

process.env.NODE_ENV = 'test';
process.env.BLE_ENABLED = 'false';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const mongod = await MongoMemoryServer.create();
process.env.MONGO_URI = mongod.getUri();

const appModule = await import('../src/app.js');
const app = appModule.default;
const initializeApp = appModule.initializeApp;

before(async function() {
  this.timeout(20000);
  if (mongoose.connection.readyState === 0) {
    await initializeApp();
  }
});

after(async function() {
  this.timeout(10000);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
  await mongod.stop();
});

describe('simulation workflow routes', () => {
  it('creates persisted demo order, shipment, and compliance artifacts', async () => {
    const testEmail = process.env.TEST_RETAILER_EMAIL || `test-${Date.now()}@example.test`;
    const user = await User.create({
      name: 'Demo Retailer',
      email: testEmail,
      password: 'Password123!',
      role: 'RETAILER',
      status: 'ACTIVE'
    });

    const token = jwt.sign({ id: user._id, role: 'RETAILER' }, process.env.JWT_SECRET);

    const response = await request(app)
      .post('/api/users/simulation/demo-flow')
      .set('Authorization', `Bearer ${token}`)
      .send({ mode: 'demo' })
      .expect(201);

    assert.strictEqual(response.body.success, true);
    assert.ok(response.body.data?.orderId);
    assert.ok(response.body.data?.shipmentId);

    const order = await OrderModel.findById(response.body.data.orderId);
    const shipment = await ShipmentModel.findById(response.body.data.shipmentId);
    const compliance = await ComplianceModel.findOne({ relatedOrder: order._id });

    assert.ok(order);
    assert.ok(shipment);
    assert.ok(compliance);
    assert.match(order.orderNumber, /^SIM-/i);
    assert.match(shipment.trackingNumber, /^SIM-/i);
  });
});
