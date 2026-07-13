import assert from 'assert';
import mongoose from 'mongoose';
import UserModel from '../src/models/UserModel.js';
import OrderModel from '../src/models/OrderModel.js';
import { resolveWorkflowRecipientEmails } from '../src/services/notification.service.js';
import { preserveOrderOwnerIdentity } from '../src/utils/orderOwner.js';

describe('notification routing', function() {
  this.timeout(30000);
  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  it('routes order creation to warehouse only and approval/rejection to retailer only', async () => {
    const retailer = await UserModel.create({
      name: 'Retailer User',
      email: 'retailer-routing@example.com',
      password: 'Password123!',
      role: 'RETAILER'
    });

    const warehouse = await UserModel.create({
      name: 'Warehouse User',
      email: 'warehouse-routing@example.com',
      password: 'Password123!',
      role: 'WAREHOUSE'
    });

    const admin = await UserModel.create({
      name: 'Admin User',
      email: 'admin-routing@example.com',
      password: 'Password123!',
      role: 'ADMIN'
    });

    const warehouseCreated = await resolveWorkflowRecipientEmails({
      eventType: 'order_created',
      retailerUserId: retailer._id,
      retailerUser: retailer,
    });

    const approvedRecipients = await resolveWorkflowRecipientEmails({
      eventType: 'order_approved',
      retailerUserId: retailer._id,
      retailerUser: retailer,
    });

    assert.deepStrictEqual(warehouseCreated.sort(), [warehouse.email]);
    assert.deepStrictEqual(approvedRecipients.sort(), [retailer.email]);
    assert.ok(!approvedRecipients.includes(admin.email));
    assert.ok(!approvedRecipients.includes(warehouse.email));
  });

  it('resolves the retailer email when a populated order object is passed in', async () => {
    const retailer = await UserModel.create({
      name: 'Retailer User',
      email: 'retailer-populated-order@example.com',
      password: 'Password123!',
      role: 'RETAILER'
    });

    const populatedOrder = {
      _id: new mongoose.Types.ObjectId(),
      createdBy: retailer._id,
      user: retailer._id,
    };

    const recipients = await resolveWorkflowRecipientEmails({
      eventType: 'shipment_dispatched',
      retailerUserId: populatedOrder,
      retailerUser: null,
    });

    assert.deepStrictEqual(recipients, [retailer.email]);
  });

  it('uses the persisted retailer email when no user document is available', async () => {
    const recipients = await resolveWorkflowRecipientEmails({
      eventType: 'order_approved',
      order: {
        _id: new mongoose.Types.ObjectId(),
        userEmail: 'persisted-retailer@example.com',
        createdByEmail: 'persisted-retailer@example.com',
        user: null,
        createdBy: null,
      },
      orderId: new mongoose.Types.ObjectId(),
      includeRetailer: true,
      includeWarehouse: false,
      includeAdmin: false,
    });

    assert.deepStrictEqual(recipients, ['persisted-retailer@example.com']);
  });

  it('routes rejected orders to the retailer owner', async () => {
    const retailer = await UserModel.create({
      name: 'Retailer User',
      email: 'retailer-rejected@example.com',
      password: 'Password123!',
      role: 'RETAILER'
    });

    const recipients = await resolveWorkflowRecipientEmails({
      eventType: 'order_rejected',
      retailerUserId: retailer._id,
      retailerUser: retailer,
    });

    assert.deepStrictEqual(recipients, [retailer.email]);
  });

  it('preserves the retailer owner when an approval updates the order', async () => {
    const retailer = await UserModel.create({
      name: 'Retailer User',
      email: 'retailer-approval-preserve@example.com',
      password: 'Password123!',
      role: 'RETAILER'
    });

    const warehouse = await UserModel.create({
      name: 'Warehouse User',
      email: 'warehouse-approval-preserve@example.com',
      password: 'Password123!',
      role: 'WAREHOUSE'
    });

    const order = await OrderModel.create({
      orderNumber: 'ORD-OWNER-PRESERVE',
      user: retailer._id,
      createdBy: retailer._id,
      userEmail: retailer.email,
      createdByEmail: retailer.email,
      items: [{ drug: new mongoose.Types.ObjectId(), quantity: 1, price: 10, subtotal: 10 }],
      totalAmount: 10,
      status: 'pending',
    });

    preserveOrderOwnerIdentity(order, warehouse);

    const recipients = await resolveWorkflowRecipientEmails({
      eventType: 'order_approved',
      retailerUserId: order.user,
      retailerUser: retailer,
      order,
      orderId: order._id,
      includeRetailer: true,
      includeWarehouse: false,
      includeAdmin: false,
    });

    assert.deepStrictEqual(recipients, [retailer.email]);
  });

  it('resolves warehouse recipients even when roles are stored in lowercase', async () => {
    const retailer = await UserModel.create({
      name: 'Retailer User',
      email: 'retailer-lowercase-role@example.com',
      password: 'Password123!',
      role: 'RETAILER'
    });

    const warehouse = await UserModel.collection.insertOne({
      name: 'Warehouse User',
      email: 'warehouse-lowercase-role@example.com',
      password: 'Password123!',
      role: 'warehouse',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const warehouseDoc = await UserModel.findById(warehouse.insertedId).lean();

    const recipients = await resolveWorkflowRecipientEmails({
      eventType: 'order_created',
      retailerUserId: retailer._id,
      retailerUser: retailer,
    });

    assert.deepStrictEqual(recipients, [warehouseDoc.email]);
  });

  it('routes delay and compliance events to the expected recipient roles', async () => {
    const retailer = await UserModel.create({
      name: 'Retailer User',
      email: 'retailer-delay@example.com',
      password: 'Password123!',
      role: 'RETAILER'
    });

    const warehouse = await UserModel.create({
      name: 'Warehouse User',
      email: 'warehouse-delay@example.com',
      password: 'Password123!',
      role: 'WAREHOUSE'
    });

    const admin = await UserModel.create({
      name: 'Admin User',
      email: 'admin-delay@example.com',
      password: 'Password123!',
      role: 'ADMIN'
    });

    const delayedRecipients = await resolveWorkflowRecipientEmails({
      eventType: 'shipment_delayed',
      retailerUserId: retailer._id,
      retailerUser: retailer,
    });

    const complianceRecipients = await resolveWorkflowRecipientEmails({
      eventType: 'compliance_event',
      retailerUserId: retailer._id,
      retailerUser: retailer,
    });

    assert.ok(delayedRecipients.includes(retailer.email));
    assert.ok(delayedRecipients.includes(admin.email));
    assert.ok(!delayedRecipients.includes(warehouse.email));
    assert.deepStrictEqual(complianceRecipients, [admin.email]);
  });
});
