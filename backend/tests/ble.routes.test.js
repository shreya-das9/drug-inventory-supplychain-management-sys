import assert from 'assert';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ingestBleScan } from '../src/controllers/bleScan.controller.js';
import Compliance from '../src/models/ComplianceModel.js';
import ShipmentModel from '../src/models/ShipmentModel.js';
import AuditModel from '../src/models/AuditModel.js';
import { issueBleIdentity, initiateChallenge, mockSignChallenge, verifySecureScan } from '../src/services/ble.service.js';
import { sendWorkflowEventNotification } from '../src/services/notification.service.js';

process.env.NODE_ENV = 'test';
process.env.BLE_ENABLED = 'false';

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

describe('BLE routes', () => {
  it('should expose BLE route health endpoint', async () => {
    const response = await request(app)
      .get('/api/test')
      .set('Accept', 'application/json')
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.message, 'Server is running!');
  });

  it('should not throw when workflow notifications are sent without an initialized mailer', async () => {
    await assert.doesNotReject(async () => {
      await sendWorkflowEventNotification({
        recipientEmail: 'test@example.com',
        eventType: 'order_created',
        orderNumber: 'TEST-ORDER',
        medicine: 'Test Drug',
        quantity: 2,
        totalAmount: 120,
        status: 'CREATED',
        nextStep: 'Review in the dashboard.'
      });
    });
  });

  it('should verify a secure scan using a persisted BLE registry entry', async () => {
    const identity = await issueBleIdentity({ bleId: 'BLE100001', metadata: { manufacturer: 'Test' } });
    const challengeResponse = await initiateChallenge(identity.bleId);
    const signatureResponse = await mockSignChallenge({ bleId: identity.bleId, challenge: challengeResponse.challenge });

    const result = await verifySecureScan({
      bleId: identity.bleId,
      challenge: challengeResponse.challenge,
      signature: signatureResponse.signature,
      stage: 'manufacturer',
      location: { city: 'Austin', lat: 30.2672, lng: -97.7431 },
      trafficCondition: 'moderate',
      timestamp: new Date().toISOString()
    });

    assert.strictEqual(result.verified, true);
    assert.strictEqual(result.verificationStatus, 'VERIFIED');
    assert.deepStrictEqual(result.alerts, []);
  });

  it('should reject invalid checkpoint transitions', async () => {
    const identity = await issueBleIdentity({ bleId: 'BLE100002', metadata: { manufacturer: 'Test' } });
    const challengeResponse = await initiateChallenge(identity.bleId);
    const signatureResponse = await mockSignChallenge({ bleId: identity.bleId, challenge: challengeResponse.challenge });

    const shipment = await ShipmentModel.create({
      supplier: new mongoose.Types.ObjectId(),
      expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdBy: new mongoose.Types.ObjectId(),
      bleId: identity.bleId,
      currentCheckpoint: 'dispatched',
      currentResponsibleOrganization: 'warehouse',
      statusHistory: []
    });

    const req = {
      body: {
        bleId: identity.bleId,
        challenge: challengeResponse.challenge,
        signature: signatureResponse.signature,
        stage: 'manufacturer',
        location: { city: 'Austin', lat: 30.2672, lng: -97.7431 },
        trafficCondition: 'moderate',
        timestamp: new Date().toISOString(),
        shipmentId: shipment._id.toString()
      },
      user: { _id: new mongoose.Types.ObjectId().toString() }
    };

    let responsePayload;
    const res = {
      status: (code) => ({
        json: (payload) => {
          responsePayload = { code, payload };
        }
      })
    };

    await ingestBleScan(req, res);

    assert.strictEqual(responsePayload.payload.success, false);
    assert.match(responsePayload.payload.message, /Invalid checkpoint transition/i);
  });

  it('should create a transit delay alert when a shipment misses its deadline', async () => {
    const identity = await issueBleIdentity({ bleId: 'BLE100004', metadata: { manufacturer: 'Test' } });
    const challengeResponse = await initiateChallenge(identity.bleId);
    const signatureResponse = await mockSignChallenge({ bleId: identity.bleId, challenge: challengeResponse.challenge });

    const shipment = await ShipmentModel.create({
      supplier: new mongoose.Types.ObjectId(),
      expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdBy: new mongoose.Types.ObjectId(),
      bleId: identity.bleId,
      currentCheckpoint: 'package_verified',
      currentResponsibleOrganization: 'warehouse',
      nextExpectedCheckpoint: 'dispatched',
      expectedCheckpointDeadline: new Date(Date.now() - 60 * 1000),
      statusHistory: []
    });

    const req = {
      body: {
        bleId: identity.bleId,
        challenge: challengeResponse.challenge,
        signature: signatureResponse.signature,
        stage: 'distributor',
        location: { city: 'Austin', lat: 30.2672, lng: -97.7431 },
        trafficCondition: 'moderate',
        timestamp: new Date().toISOString(),
        shipmentId: shipment._id.toString()
      },
      user: { _id: new mongoose.Types.ObjectId().toString() }
    };

    let responsePayload;
    const res = {
      status: (code) => ({
        json: (payload) => {
          responsePayload = { code, payload };
        }
      })
    };

    await ingestBleScan(req, res);

    const updatedShipment = await ShipmentModel.findById(shipment._id);
    const delayCompliance = await Compliance.findOne({ relatedShipment: shipment._id, 'metadata.alertType': 'transit_delay' });

    assert.strictEqual(updatedShipment.status, 'under_review');
    assert.strictEqual(delayCompliance !== null, true);
    assert.strictEqual(responsePayload.payload.success, true);
  });

  it('should complete final delivery verification for an eligible shipment', async () => {
    const identity = await issueBleIdentity({ bleId: 'BLE100005', metadata: { manufacturer: 'Test' } });
    const challengeResponse = await initiateChallenge(identity.bleId);
    const signatureResponse = await mockSignChallenge({ bleId: identity.bleId, challenge: challengeResponse.challenge });

    const shipment = await ShipmentModel.create({
      supplier: new mongoose.Types.ObjectId(),
      expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdBy: new mongoose.Types.ObjectId(),
      bleId: identity.bleId,
      currentCheckpoint: 'retailer_verified',
      currentResponsibleOrganization: 'retailer',
      statusHistory: []
    });

    const order = await new mongoose.models.Order({
      orderNumber: 'ORDDELIVERY1',
      user: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      totalAmount: 100,
      items: [{ drug: new mongoose.Types.ObjectId(), quantity: 1, price: 100, subtotal: 100 }],
      status: 'shipped',
      statusHistory: []
    }).save();

    shipment.order = order._id;
    await shipment.save();

    const req = {
      body: {
        bleId: identity.bleId,
        challenge: challengeResponse.challenge,
        signature: signatureResponse.signature,
        stage: 'customer',
        location: { city: 'Austin', lat: 30.2672, lng: -97.7431 },
        trafficCondition: 'moderate',
        timestamp: new Date().toISOString(),
        shipmentId: shipment._id.toString(),
        orderId: order._id.toString(),
        finalDelivery: true
      },
      user: { _id: new mongoose.Types.ObjectId().toString() }
    };

    let responsePayload;
    const res = {
      status: (code) => ({
        json: (payload) => {
          responsePayload = { code, payload };
        }
      })
    };

    await ingestBleScan(req, res);

    const updatedShipment = await ShipmentModel.findById(shipment._id);
    const updatedOrder = await mongoose.model('Order').findById(order._id);

    assert.strictEqual(updatedShipment.status, 'delivered');
    assert.strictEqual(updatedOrder.status, 'completed');
    assert.strictEqual(updatedShipment.currentCheckpoint, 'delivered');
    assert.strictEqual(updatedShipment.timeline.some(entry => entry.checkpoint === 'delivered'), true);
    assert.strictEqual(responsePayload.payload.success, true);
  });

  it('should flag failed final delivery verification for investigation', async () => {
    const identity = await issueBleIdentity({ bleId: 'BLE100006', metadata: { manufacturer: 'Test' } });
    const challengeResponse = await initiateChallenge(identity.bleId);
    const signatureResponse = await mockSignChallenge({ bleId: identity.bleId, challenge: challengeResponse.challenge });

    const shipment = await ShipmentModel.create({
      supplier: new mongoose.Types.ObjectId(),
      expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdBy: new mongoose.Types.ObjectId(),
      bleId: identity.bleId,
      currentCheckpoint: 'package_verified',
      currentResponsibleOrganization: 'warehouse',
      statusHistory: []
    });

    const req = {
      body: {
        bleId: identity.bleId,
        challenge: 'bad-challenge',
        signature: signatureResponse.signature,
        stage: 'customer',
        location: { city: 'Austin', lat: 30.2672, lng: -97.7431 },
        trafficCondition: 'moderate',
        timestamp: new Date().toISOString(),
        shipmentId: shipment._id.toString(),
        finalDelivery: true
      },
      user: { _id: new mongoose.Types.ObjectId().toString() }
    };

    let responsePayload;
    const res = {
      status: (code) => ({
        json: (payload) => {
          responsePayload = { code, payload };
        }
      })
    };

    await ingestBleScan(req, res);

    const updatedShipment = await ShipmentModel.findById(shipment._id);
    const compliance = await Compliance.findOne({ relatedShipment: shipment._id, 'metadata.alertType': 'delivery_verification_failed' });

    assert.strictEqual(updatedShipment.status, 'investigation_required');
    assert.strictEqual(compliance !== null, true);
    assert.strictEqual(compliance?.severity, 'critical');
    assert.strictEqual(responsePayload.payload.success, true);
  });

  it('should advance a shipment checkpoint after a verified scan', async () => {
    const identity = await issueBleIdentity({ bleId: 'BLE100003', metadata: { manufacturer: 'Test' } });
    const challengeResponse = await initiateChallenge(identity.bleId);
    const signatureResponse = await mockSignChallenge({ bleId: identity.bleId, challenge: challengeResponse.challenge });

    const shipment = await ShipmentModel.create({
      supplier: new mongoose.Types.ObjectId(),
      expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdBy: new mongoose.Types.ObjectId(),
      bleId: identity.bleId,
      currentCheckpoint: 'ble_allocated',
      currentResponsibleOrganization: 'warehouse',
      statusHistory: []
    });

    const req = {
      body: {
        bleId: identity.bleId,
        challenge: challengeResponse.challenge,
        signature: signatureResponse.signature,
        stage: 'manufacturer',
        location: { city: 'Austin', lat: 30.2672, lng: -97.7431 },
        trafficCondition: 'moderate',
        timestamp: new Date().toISOString(),
        shipmentId: shipment._id.toString()
      },
      user: { _id: new mongoose.Types.ObjectId().toString() }
    };

    let responsePayload;
    const res = {
      status: (code) => ({
        json: (payload) => {
          responsePayload = { code, payload };
        }
      })
    };

    await ingestBleScan(req, res);

    const updatedShipment = await ShipmentModel.findById(shipment._id);
    const auditEntries = await AuditModel.find({ shipmentId: shipment._id.toString() }).lean();

    assert.strictEqual(updatedShipment.currentCheckpoint, 'package_verified');
    assert.strictEqual(updatedShipment.status, 'processing');
    assert.strictEqual(updatedShipment.currentResponsibleOrganization, 'warehouse');
    assert.strictEqual(updatedShipment.timeline.length, 1);
    assert.strictEqual(auditEntries.some(entry => entry.eventType === 'checkpoint_scan'), true);
    assert.strictEqual(auditEntries.some(entry => entry.eventType === 'shipment_progression'), true);
    assert.strictEqual(responsePayload.payload.success, true);
  });
});
