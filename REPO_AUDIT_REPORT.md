# Repository Audit Report

Scanned repository for the requested terms and notification-related patterns.

Total matches: 274

| File | Line | Type | Can affect production email routing | Content |
| --- | ---: | --- | --- | --- |
| .env | 7 | Unused file | No | MONGO_FALLBACK_URI=mongodb://127.0.0.1:27017/drug_inventory |
| .env | 18 | Unused file | No | EMAIL_USER=dshreya943@gmail.com |
| .env | 22 | Unused file | No | EMAIL_FROM=dshreya943@gmail.com |
| .env.example | 11 | Unused file | No | MONGO_FALLBACK_URI=mongodb://127.0.0.1:27017/drug_inventory |
| .env.example | 23 | Unused file | No | EMAIL_USER=dshreya943@gmail.com |
| .env.example | 27 | Unused file | No | EMAIL_FROM=dshreya943@gmail.com |
| ADMIN_AUTH_MIGRATION.md | 88 | Documentation | No | Now when you try to login with `drug.inventory.management.system@gmail.com / calpol650`, it will: |
| audit_scan.py | 8 | Unused file | No |     r'demo', |
| audit_scan.py | 9 | Unused file | No |     r'sample', |
| audit_scan.py | 10 | Unused file | No |     r'test@example', |
| audit_scan.py | 11 | Unused file | No |     r'fake', |
| audit_scan.py | 12 | Unused file | No |     r'dummy', |
| audit_scan.py | 13 | Unused file | No |     r'fallback', |
| audit_scan.py | 14 | Unused file | No |     r'default recipient', |
| audit_scan.py | 18 | Unused file | No |     r'recipientEmail', |
| audit_scan.py | 19 | Unused file | No |     r'userEmail', |
| audit_scan.py | 20 | Unused file | No |     r'createdByEmail', |
| DATA_FLOW_ARCHITECTURE.md | 375 | Documentation | No | │  ├─ Check alert.batchNo.includes(search)  ✓ Field fallback! |
| E2E_TESTING_GUIDE.md | 32 | Documentation | No | This creates sample drugs, inventory items, and alerts for comprehensive testing. |
| E2E_TESTING_GUIDE.md | 256 | Documentation | No |     ✓ Dashboard handles low stock alerts with fallback to populated field names |
| package-lock.json | 42 | Unused file | No |         "nodemon": "^3.1.10", |
| package-lock.json | 361 | Unused file | No |     "backend/node_modules/nodemon": { |
| package-lock.json | 378 | Unused file | No |         "nodemon": "bin/nodemon.js" |
| package-lock.json | 385 | Unused file | No |         "url": "https://opencollective.com/nodemon" |
| TESTING_CHECKLIST.md | 217 | Documentation | No | ✓ Dashboard handles low stock alerts with fallback to populated field names |
| TESTING_CHECKLIST.md | 330 | Documentation | No | - [ ] Fallback UI displays |
| backend/.env | 12 | Unused file | No | MONGO_FALLBACK_URI=mongodb://127.0.0.1:27017/drug_inventory |
| backend/.env | 24 | Unused file | No | EMAIL_USER=drug.inventory.management.system@gmail.com |
| backend/.env | 28 | Unused file | No | EMAIL_FROM=drug.inventory.management.system@gmail.com |
| backend/.env | 29 | Unused file | No | BLE_ALERT_EMAIL=drug.inventory.management.system@gmail.com |
| backend/check-admin.js | 9 | Unused file | No | const EMAIL = 'drug.inventory.management.system@gmail.com'; |
| backend/create-admin.js | 10 | Unused file | No |     const email = 'drug.inventory.management.system@gmail.com'; |
| backend/package-lock.json | 28 | Unused file | No |         "nodemon": "^3.1.10" |
| backend/package-lock.json | 2354 | Unused file | No |     "node_modules/nodemon": { |
| backend/package-lock.json | 2356 | Unused file | No |       "resolved": "https://registry.npmjs.org/nodemon/-/nodemon-3.1.10.tgz", |
| backend/package-lock.json | 2372 | Unused file | No |         "nodemon": "bin/nodemon.js" |
| backend/package-lock.json | 2379 | Unused file | No |         "url": "https://opencollective.com/nodemon" |
| backend/package.json | 7 | Unused file | No |     "dev": "nodemon src/server.js", |
| backend/package.json | 35 | Unused file | No |     "nodemon": "^3.1.10", |
| backend/temp_db_check.js | 12 | Temporary script | No |     console.error('TEMP_RETAILER_EMAIL not set; aborting to avoid demo fallback'); |
| backend/docs/BLE_SIMULATION_SPEC.md | 157 | Documentation | No | - `FAKE_DEVICE_SIGNATURE`: signature mismatch |
| backend/scripts/allocate_to_shipment.js | 16 | Temporary script | No |   const adminEmail = process.env.DEBUG_ADMIN_EMAIL &#124;&#124; 'drug.inventory.management.system@gmail.com'; |
| backend/scripts/ble_simulator.js | 27 | Temporary script | No |       "Missing BLE_WAREHOUSE_TOKEN (or BLE_ADMIN_TOKEN fallback). Provide a token with warehouse/admin role." |
| backend/scripts/create_test_shipment.js | 15 | Temporary script | No |   const adminEmail = process.env.DEBUG_ADMIN_EMAIL &#124;&#124; 'drug.inventory.management.system@gmail.com'; |
| backend/scripts/debug_list_resources.js | 16 | Temporary script | No |   const adminEmail = process.env.DEBUG_ADMIN_EMAIL &#124;&#124; 'drug.inventory.management.system@gmail.com'; |
| backend/scripts/e2e_ble_allocate.js | 46 | Temporary script | No |     // Fallback: find a confirmed order and allocate by orderId (controller will create shipment) |
| backend/scripts/e2e_ble_allocate.js | 82 | Temporary script | No |     console.error('E2E_RETAILER_EMAIL not set; aborting e2e_ble_allocate to avoid demo fallbacks'); |
| backend/scripts/find_target_shipment.js | 15 | Temporary script | No |   const adminEmail = process.env.DEBUG_ADMIN_EMAIL &#124;&#124; 'drug.inventory.management.system@gmail.com'; |
| backend/scripts/get_admin_token.js | 12 | Temporary script | No |   const admin = await User.findOne({ email: 'drug.inventory.management.system@gmail.com' }); |
| backend/scripts/investigate_retailer_shipments.js | 15 | Temporary script | No |   // Require an explicit retailer email; do not fallback to seeded/demo users |
| backend/scripts/investigate_retailer_shipments.js | 17 | Temporary script | No |     console.error('No retailerEmail provided. Aborting to avoid demo fallbacks.'); |
| backend/scripts/investigate_retailer_shipments.js | 41 | Temporary script | No |   if (orders.length > 0) console.log('Sample order id:', orders[0]._id.toString(), 'orderNumber:', orders[0].orderNumber, 'user:', orders[0].user?.toString()); |
| backend/scripts/investigate_retailer_shipments.js | 65 | Temporary script | No |     console.log('\nSample shipments (up to 5)'); |
| backend/scripts/investigate_retailer_shipments.js | 107 | Temporary script | No | // run (explicit env var required to avoid demo fallbacks) |
| backend/scripts/list_drugs.js | 15 | Temporary script | No |   const adminEmail = process.env.DEBUG_ADMIN_EMAIL &#124;&#124; 'drug.inventory.management.system@gmail.com'; |
| backend/scripts/list_suppliers.js | 15 | Temporary script | No |   const adminEmail = process.env.DEBUG_ADMIN_EMAIL &#124;&#124; 'drug.inventory.management.system@gmail.com'; |
| backend/scripts/seed_openfda.js | 41 | Temporary script | No |           expiryDate: new Date(Date.now() + 365*24*3600*1000 * 1.5) // dummy |
| backend/scripts/seed_orders_shipments.js | 40 | Temporary script | No |     // Customers can be provided via environment variable as JSON array to avoid hardcoded demo emails |
| backend/scripts/seed_orders_shipments.js | 53 | Temporary script | No |       console.log('No SEED_CUSTOMERS_JSON provided; skipping creation of demo users to avoid seeded demo emails.'); |
| backend/scripts/seed_test_data.js | 3 | Temporary script | No |  * Creates sample drugs, inventory, and alerts for comprehensive testing |
| backend/src/config/db.js | 16 | Runtime code | Yes |   const fallbackUri = process.env.MONGO_FALLBACK_URI &#124;&#124; DEFAULT_LOCAL_MONGO_URI; |
| backend/src/config/db.js | 33 | Runtime code | Yes |         return await connectWithUri(fallbackUri); |
| backend/src/config/db.js | 34 | Runtime code | Yes |       } catch (fallbackError) { |
| backend/src/config/db.js | 35 | Runtime code | Yes |         console.error(`❌ Local fallback MongoDB connection failed: ${fallbackError.message}`); |
| backend/src/controllers/bleAllocation.controller.js | 148 | Runtime code | Yes |       const recipientEmails = await resolveWorkflowRecipientEmails({ |
| backend/src/controllers/bleAllocation.controller.js | 158 | Runtime code | Yes |       if (recipientEmails.length) { |
| backend/src/controllers/bleAllocation.controller.js | 160 | Runtime code | Yes |           recipientEmails, |
| backend/src/controllers/bleScan.controller.js | 3 | Runtime code | Yes | import { resolveWorkflowRecipientEmails, sendWorkflowEventNotification, sendWorkflowEventNotifications } from '../services/notification.service.js'; |
| backend/src/controllers/bleScan.controller.js | 112 | Runtime code | Yes |     const recipientEmails = await resolveWorkflowRecipientEmails({ |
| backend/src/controllers/bleScan.controller.js | 123 | Runtime code | Yes |     if (recipientEmails.length) { |
| backend/src/controllers/bleScan.controller.js | 125 | Runtime code | Yes |         recipientEmails, |
| backend/src/controllers/bleScan.controller.js | 320 | Runtime code | Yes |     const recipientEmails = await resolveWorkflowRecipientEmails({ |
| backend/src/controllers/bleScan.controller.js | 331 | Runtime code | Yes |     if (recipientEmails.length) { |
| backend/src/controllers/bleScan.controller.js | 333 | Runtime code | Yes |         recipientEmails, |
| backend/src/controllers/bleScan.controller.js | 395 | Runtime code | Yes |     const recipientEmails = await resolveWorkflowRecipientEmails({ |
| backend/src/controllers/bleScan.controller.js | 406 | Runtime code | Yes |     if (recipientEmails.length) { |
| backend/src/controllers/bleScan.controller.js | 408 | Runtime code | Yes |         recipientEmails, |
| backend/src/controllers/bleScan.controller.js | 455 | Runtime code | Yes |     const recipientEmails = await resolveWorkflowRecipientEmails({ |
| backend/src/controllers/bleScan.controller.js | 466 | Runtime code | Yes |     if (recipientEmails.length) { |
| backend/src/controllers/bleScan.controller.js | 468 | Runtime code | Yes |         recipientEmails, |
| backend/src/controllers/bleScan.controller.js | 648 | Runtime code | Yes |     const recipientEmails = await resolveWorkflowRecipientEmails({ |
| backend/src/controllers/bleScan.controller.js | 656 | Runtime code | Yes |     if (recipientEmails.length) { |
| backend/src/controllers/bleScan.controller.js | 658 | Runtime code | Yes |         recipientEmails, |
| backend/src/controllers/compliance.controller.js | 9 | Runtime code | Yes | import { resolveWorkflowRecipientEmails, sendWorkflowEventNotifications } from "../services/notification.service.js"; |
| backend/src/controllers/compliance.controller.js | 121 | Runtime code | Yes |       const recipientEmails = await resolveWorkflowRecipientEmails({ |
| backend/src/controllers/compliance.controller.js | 130 | Runtime code | Yes |       if (recipientEmails.length) { |
| backend/src/controllers/compliance.controller.js | 132 | Runtime code | Yes |           recipientEmails, |
| backend/src/controllers/orders.controller.js | 5 | Runtime code | Yes | import { resolveWorkflowRecipientEmails, sendWorkflowEventNotifications } from '../services/notification.service.js'; |
| backend/src/controllers/orders.controller.js | 109 | Runtime code | Yes |       orderData.userEmail = String(req.user.email).toLowerCase().trim(); |
| backend/src/controllers/orders.controller.js | 110 | Runtime code | Yes |       orderData.createdByEmail = String(req.user.email).toLowerCase().trim(); |
| backend/src/controllers/orders.controller.js | 156 | Runtime code | Yes |       const recipientEmails = await resolveWorkflowRecipientEmails({ |
| backend/src/controllers/orders.controller.js | 168 | Runtime code | Yes |       if (recipientEmails.length) { |
| backend/src/controllers/orders.controller.js | 170 | Runtime code | Yes |           recipientEmails, |
| backend/src/controllers/orders.controller.js | 311 | Runtime code | Yes |         console.info('[ORDER_OWNER]', { orderId: order._id?.toString(), ownerId: retailerUser?._id &#124;&#124; retailerUserId, ownerEmail: retailerUser?.email &#124;&#124; order.userEmail &#124;&#124; order.createdByEmail &#124;&#124; null }); |
| backend/src/controllers/orders.controller.js | 313 | Runtime code | Yes |         const recipientEmails = await resolveWorkflowRecipientEmails({ |
| backend/src/controllers/orders.controller.js | 326 | Runtime code | Yes |         recipientEmails.forEach((r) => console.info('[EMAIL_RECIPIENT]', { eventType: effectiveEventType, recipient: r })); |
| backend/src/controllers/orders.controller.js | 328 | Runtime code | Yes |         if (recipientEmails.length) { |
| backend/src/controllers/orders.controller.js | 331 | Runtime code | Yes |             recipientEmails, |
| backend/src/controllers/orders.controller.js | 352 | Runtime code | Yes |             recipientEmails |
| backend/src/controllers/orders.controller.js | 385 | Runtime code | Yes |       const recipientEmails = await resolveWorkflowRecipientEmails({ |
| backend/src/controllers/orders.controller.js | 394 | Runtime code | Yes |       if (recipientEmails.length) { |
| backend/src/controllers/orders.controller.js | 396 | Runtime code | Yes |           recipientEmails, |
| backend/src/controllers/shipments.controller.js | 7 | Runtime code | Yes | import { resolveWorkflowRecipientEmails, sendWorkflowEventNotifications } from '../services/notification.service.js'; |
| backend/src/controllers/shipments.controller.js | 342 | Runtime code | Yes |       const recipientEmails = await resolveWorkflowRecipientEmails({ |
| backend/src/controllers/shipments.controller.js | 354 | Runtime code | Yes |       if (recipientEmails.length && ['shipped', 'delivered'].includes(newStatusLower)) { |
| backend/src/controllers/shipments.controller.js | 356 | Runtime code | Yes |           recipientEmails, |
| backend/src/models/OrderModel.js | 33 | Runtime code | Yes |   userEmail: { |
| backend/src/models/OrderModel.js | 39 | Runtime code | Yes |   createdByEmail: { |
| backend/src/routes/auth.routes.js | 170 | Runtime code | Yes |     await transporter.sendMail({ |
| backend/src/routes/user.routes.js | 287 | Runtime code | Yes | router.post("/simulation/demo-flow", async (req, res) => { |
| backend/src/routes/user.routes.js | 296 | Runtime code | Yes |     const medicineName = req.body?.medicine &#124;&#124; "Demo Antibiotic"; |
| backend/src/routes/user.routes.js | 307 | Runtime code | Yes |         description: "Auto-created for simulation demo flow", |
| backend/src/routes/user.routes.js | 350 | Runtime code | Yes |       statusHistory: [{ status: "processing", timestamp: new Date(), updatedBy: userId, notes: "Demo flow created shipment" }], |
| backend/src/routes/user.routes.js | 355 | Runtime code | Yes |       description: "Demo workflow created a persisted order and shipment for frontend walkthroughs.", |
| backend/src/routes/user.routes.js | 362 | Runtime code | Yes |       metadata: { source: "simulation-demo-flow" }, |
| backend/src/routes/user.routes.js | 367 | Runtime code | Yes |     return successResponse(res, 201, "Simulation demo flow created", { orderId: order._id, shipmentId: shipment._id }); |
| backend/src/routes/user.routes.js | 369 | Runtime code | Yes |     console.error("Simulation demo flow error:", error); |
| backend/src/routes/user.routes.js | 370 | Runtime code | Yes |     return errorResponse(res, 500, "Failed to create simulation demo flow", error.message); |
| backend/src/routes/user.routes.js | 392 | Runtime code | Yes |     return successResponse(res, 200, "Simulation demo data reset", { deletedOrders: orderIds.length }); |
| backend/src/routes/user.routes.js | 395 | Runtime code | Yes |     return errorResponse(res, 500, "Failed to reset simulation demo data", error.message); |
| backend/src/routes/user.routes.js | 513 | Runtime code | Yes |       const recipientEmails = await resolveWorkflowRecipientEmails({ |
| backend/src/routes/user.routes.js | 523 | Runtime code | Yes |       if (recipientEmails.length) { |
| backend/src/routes/user.routes.js | 525 | Runtime code | Yes |           recipientEmails, |
| backend/src/services/ble.service.js | 596 | Runtime code | Yes | 		alerts.push("FAKE_DEVICE_SIGNATURE"); |
| backend/src/services/email.service.js | 94 | Runtime code | Yes |   return mailer.sendMail({ |
| backend/src/services/notification.service.js | 188 | Runtime code | Yes | export const resolveWorkflowRecipientEmails = async ({ retailerUserId, retailerUser, includeRetailer, includeWarehouse, includeAdmin, eventType, order, shipment, orderId, warehouseUserId }) => { |
| backend/src/services/notification.service.js | 190 | Runtime code | Yes |   const recipientEmails = new Set(); |
| backend/src/services/notification.service.js | 212 | Runtime code | Yes |     retailerUserEmail: retailerUser?.email &#124;&#124; null, |
| backend/src/services/notification.service.js | 217 | Runtime code | Yes |       recipientEmails.add(resolvedRetailerEmail); |
| backend/src/services/notification.service.js | 235 | Runtime code | Yes |           recipientEmails.add(userDoc.email); |
| backend/src/services/notification.service.js | 242 | Runtime code | Yes |   const resolvedEmailAddresses = Array.from(recipientEmails); |
| backend/src/services/notification.service.js | 261 | Runtime code | Yes |       resolvedRecipientEmails: resolvedEmailAddresses, |
| backend/src/services/notification.service.js | 268 | Runtime code | Yes |       resolvedRecipientEmails: resolvedEmailAddresses, |
| backend/src/services/notification.service.js | 279 | Runtime code | Yes |  * @param {string} options.recipientEmail - Recipient email address |
| backend/src/services/notification.service.js | 284 | Runtime code | Yes | export const sendLowStockAlert = async ({ recipientEmail, drugName, currentStock, threshold }) => { |
| backend/src/services/notification.service.js | 288 | Runtime code | Yes |       console.warn(`Email service not initialized; skipping low stock alert to ${recipientEmail}`); |
| backend/src/services/notification.service.js | 294 | Runtime code | Yes |       to: recipientEmail, |
| backend/src/services/notification.service.js | 305 | Runtime code | Yes |     await mailer.sendMail(mailOptions); |
| backend/src/services/notification.service.js | 306 | Runtime code | Yes |     console.log(`✅ Low stock alert sent to ${recipientEmail}`); |
| backend/src/services/notification.service.js | 316 | Runtime code | Yes |  * @param {string} options.recipientEmail - Recipient email address |
| backend/src/services/notification.service.js | 322 | Runtime code | Yes | export const sendExpiryAlert = async ({ recipientEmail, drugName, batchNumber, expiryDate, daysUntilExpiry }) => { |
| backend/src/services/notification.service.js | 326 | Runtime code | Yes |       console.warn(`Email service not initialized; skipping expiry alert to ${recipientEmail}`); |
| backend/src/services/notification.service.js | 332 | Runtime code | Yes |       to: recipientEmail, |
| backend/src/services/notification.service.js | 344 | Runtime code | Yes |     await mailer.sendMail(mailOptions); |
| backend/src/services/notification.service.js | 345 | Runtime code | Yes |     console.log(`✅ Expiry alert sent to ${recipientEmail}`); |
| backend/src/services/notification.service.js | 355 | Runtime code | Yes |  * @param {string} options.recipientEmail - Recipient email address |
| backend/src/services/notification.service.js | 360 | Runtime code | Yes | export const sendOrderConfirmation = async ({ recipientEmail, orderNumber, totalAmount, expectedDelivery }) => { |
| backend/src/services/notification.service.js | 364 | Runtime code | Yes |       console.warn(`Email service not initialized; skipping order confirmation to ${recipientEmail}`); |
| backend/src/services/notification.service.js | 370 | Runtime code | Yes |       to: recipientEmail, |
| backend/src/services/notification.service.js | 381 | Runtime code | Yes |     await mailer.sendMail(mailOptions); |
| backend/src/services/notification.service.js | 382 | Runtime code | Yes |     console.log(`✅ Order confirmation sent to ${recipientEmail}`); |
| backend/src/services/notification.service.js | 392 | Runtime code | Yes |  * @param {string} options.recipientEmail - Recipient email address |
| backend/src/services/notification.service.js | 397 | Runtime code | Yes | export const sendShipmentUpdate = async ({ recipientEmail, shipmentId, status, location }) => { |
| backend/src/services/notification.service.js | 401 | Runtime code | Yes |       console.warn(`Email service not initialized; skipping shipment update to ${recipientEmail}`); |
| backend/src/services/notification.service.js | 407 | Runtime code | Yes |       to: recipientEmail, |
| backend/src/services/notification.service.js | 418 | Runtime code | Yes |     await mailer.sendMail(mailOptions); |
| backend/src/services/notification.service.js | 419 | Runtime code | Yes |     console.log(`✅ Shipment update sent to ${recipientEmail}`); |
| backend/src/services/notification.service.js | 429 | Runtime code | Yes | export const sendWorkflowEventNotification = async ({ recipientEmail, eventType = 'order_workflow', orderNumber, shipmentNumber, medicine, quantity, totalAmount, status, nextStep, details }) => { |
| backend/src/services/notification.service.js | 432 | Runtime code | Yes |     if (!recipientEmail) { |
| backend/src/services/notification.service.js | 433 | Runtime code | Yes |       console.warn("[notifications] skipped", { eventName: eventType, recipientEmail: null, reason: "missing-recipient-email" }); |
| backend/src/services/notification.service.js | 438 | Runtime code | Yes |       console.warn("[notifications] skipped", { eventName: eventType, recipientEmail, reason: "email-service-not-initialized" }); |
| backend/src/services/notification.service.js | 442 | Runtime code | Yes |     console.info('[EMAIL_SEND]', { eventName: eventType, recipientEmail, service: 'sendWorkflowEventNotification' }); |
| backend/src/services/notification.service.js | 446 | Runtime code | Yes |       to: recipientEmail, |
| backend/src/services/notification.service.js | 459 | Runtime code | Yes |     console.info('[SENDMAIL_START]', { recipientEmail, eventType, subject: mailOptions.subject }); |
| backend/src/services/notification.service.js | 460 | Runtime code | Yes |     const result = await mailer.sendMail(mailOptions); |
| backend/src/services/notification.service.js | 461 | Runtime code | Yes |     console.info('[SENDMAIL_SUCCESS]', { recipientEmail, messageId: result.messageId, response: result.response }); |
| backend/src/services/notification.service.js | 472 | Runtime code | Yes | export const sendWorkflowEventNotifications = async ({ recipientEmails, ...payload }) => { |
| backend/src/services/notification.service.js | 473 | Runtime code | Yes |   const recipients = (recipientEmails &#124;&#124; []).filter(Boolean); |
| backend/src/services/notification.service.js | 484 | Runtime code | Yes |   console.info("[notifications] batch", { eventName: payload.eventType, recipientEmails: recipients, service: "sendWorkflowEventNotifications" }); |
| backend/src/services/notification.service.js | 486 | Runtime code | Yes |   const tasks = recipients.map((recipientEmail) => sendWorkflowEventNotification({ ...payload, recipientEmail })); |
| backend/src/services/retailerOrderWorkflow.service.js | 6 | Runtime code | Yes |   resolveWorkflowRecipientEmails, |
| backend/src/services/retailerOrderWorkflow.service.js | 69 | Runtime code | Yes |     userEmail: user.email &#124;&#124; null, |
| backend/src/services/retailerOrderWorkflow.service.js | 70 | Runtime code | Yes |     createdByEmail: user.email &#124;&#124; null, |
| backend/src/services/retailerOrderWorkflow.service.js | 104 | Runtime code | Yes |   const recipientEmails = await resolveWorkflowRecipientEmails({ |
| backend/src/services/retailerOrderWorkflow.service.js | 116 | Runtime code | Yes |   if (recipientEmails.length) { |
| backend/src/services/retailerOrderWorkflow.service.js | 117 | Runtime code | Yes |     console.info('[NOTIFICATION_TRIGGERED]', { eventType: 'order_created', recipientEmails }); |
| backend/src/services/retailerOrderWorkflow.service.js | 120 | Runtime code | Yes |       console.info('[EMAIL_ENTRY]', { eventType: 'order_created', recipientEmails }); |
| backend/src/services/retailerOrderWorkflow.service.js | 122 | Runtime code | Yes |         recipientEmails, |
| backend/tests/ble.routes.test.js | 52 | Test | No |         recipientEmail: 'test@example.com', |
| backend/tests/notification-routing.test.js | 4 | Test | No | import { resolveWorkflowRecipientEmails } from '../src/services/notification.service.js'; |
| backend/tests/notification-routing.test.js | 33 | Test | No |     const warehouseCreated = await resolveWorkflowRecipientEmails({ |
| backend/tests/notification-routing.test.js | 39 | Test | No |     const approvedRecipients = await resolveWorkflowRecipientEmails({ |
| backend/tests/notification-routing.test.js | 65 | Test | No |     const recipients = await resolveWorkflowRecipientEmails({ |
| backend/tests/notification-routing.test.js | 96 | Test | No |     const delayedRecipients = await resolveWorkflowRecipientEmails({ |
| backend/tests/notification-routing.test.js | 102 | Test | No |     const complianceRecipients = await resolveWorkflowRecipientEmails({ |
| backend/tests/simulation.routes.test.js | 39 | Test | No |   it('creates persisted demo order, shipment, and compliance artifacts', async () => { |
| backend/tests/simulation.routes.test.js | 42 | Test | No |       name: 'Demo Retailer', |
| backend/tests/simulation.routes.test.js | 52 | Test | No |       .post('/api/users/simulation/demo-flow') |
| backend/tests/simulation.routes.test.js | 54 | Test | No |       .send({ mode: 'demo' }) |
| client/backend/scripts/reports/retailer_data.json | 8 | Unused file | No |       "email": "john@retailer.com", |
| client/src/App.jsx | 227 | Runtime code | Yes |         {/* Fallback */} |
| client/src/pages/admin/Alerts.jsx | 57 | Runtime code | Yes |   const injectDemoAdminFlow = async () => { |
| client/src/pages/admin/Alerts.jsx | 59 | Runtime code | Yes |       await request("POST", "/api/users/simulation/demo-flow", { |
| client/src/pages/admin/Alerts.jsx | 60 | Runtime code | Yes |         medicine: "Demo Oncology Pack", |
| client/src/pages/admin/Alerts.jsx | 63 | Runtime code | Yes |         purchaseOrderNumber: `ADM-DEMO-${Date.now()}`, |
| client/src/pages/admin/Alerts.jsx | 67 | Runtime code | Yes |       setNotificationToast({ message: "Admin demo alerts synced from backend", type: "info" }); |
| client/src/pages/admin/Alerts.jsx | 70 | Runtime code | Yes |       console.error("Failed to create admin demo flow", error); |
| client/src/pages/admin/Alerts.jsx | 71 | Runtime code | Yes |       setNotificationToast({ message: error.message &#124;&#124; "Failed to create admin demo flow", type: "error" }); |
| client/src/pages/admin/Alerts.jsx | 81 | Runtime code | Yes |       setNotificationToast({ message: "Admin demo data cleared", type: "info" }); |
| client/src/pages/admin/Alerts.jsx | 84 | Runtime code | Yes |       console.error("Failed to reset admin demo flow", error); |
| client/src/pages/admin/Alerts.jsx | 85 | Runtime code | Yes |       setNotificationToast({ message: error.message &#124;&#124; "Failed to reset admin demo data", type: "error" }); |
| client/src/pages/admin/Alerts.jsx | 178 | Runtime code | Yes |             <p className="font-semibold">Admin demo controls</p> |
| client/src/pages/admin/Alerts.jsx | 187 | Runtime code | Yes |               {simulationEnabled ? "Disable demo mode" : "Enable demo mode"} |
| client/src/pages/admin/Alerts.jsx | 191 | Runtime code | Yes |               onClick={injectDemoAdminFlow} |
| client/src/pages/admin/Alerts.jsx | 201 | Runtime code | Yes |               Reset demo state |
| client/src/pages/admin/Drugs.jsx | 174 | Runtime code | Yes |   // Fallback to 0 if no inventory found |
| client/src/pages/admin/Drugs.jsx | 814 | Runtime code | Yes |   // If still no data, use sample |
| client/src/pages/admin/Drugs.jsx | 852 | Runtime code | Yes |             <Info size={14} /> <span>📊 Showing sample data - Add drugs with prices to see real analytics</span> |
| client/src/pages/admin/Inventory.jsx | 30 | Runtime code | Yes | // fallback image |
| client/src/pages/retailer/Home.jsx | 30 | Runtime code | Yes | import { buildRetailerFallbackData, shouldSeedRetailerFallbackData } from "./retailerDashboardData"; |
| client/src/pages/retailer/Home.jsx | 136 | Runtime code | Yes |   const addDemoOrderFlow = async () => { |
| client/src/pages/retailer/Home.jsx | 138 | Runtime code | Yes |       await request("POST", "/api/users/simulation/demo-flow", { |
| client/src/pages/retailer/Home.jsx | 139 | Runtime code | Yes |         medicine: "Demo Antibiotic", |
| client/src/pages/retailer/Home.jsx | 142 | Runtime code | Yes |         purchaseOrderNumber: `PO-DEMO-${Date.now()}`, |
| client/src/pages/retailer/Home.jsx | 146 | Runtime code | Yes |       showNotification("Demo order flow persisted and synced across dashboards", "success"); |
| client/src/pages/retailer/Home.jsx | 148 | Runtime code | Yes |       showNotification(error.message &#124;&#124; "Failed to create demo order flow", "error"); |
| client/src/pages/retailer/Home.jsx | 155 | Runtime code | Yes |       await addDemoOrderFlow(); |
| client/src/pages/retailer/Home.jsx | 168 | Runtime code | Yes |       showNotification("Demo entries cleared", "success"); |
| client/src/pages/retailer/Home.jsx | 170 | Runtime code | Yes |       showNotification(error.message &#124;&#124; "Failed to reset demo data", "error"); |
| client/src/pages/retailer/Home.jsx | 381 | Runtime code | Yes |       const fallbackDecision = shouldSeedRetailerFallbackData(normalizedOrders, normalizedShipments, localStorage.getItem("token") &#124;&#124; ""); |
| client/src/pages/retailer/Home.jsx | 382 | Runtime code | Yes |       const finalOrders = fallbackDecision.shouldSeed ? buildRetailerFallbackData().orders : normalizedOrders; |
| client/src/pages/retailer/Home.jsx | 383 | Runtime code | Yes |       const finalShipments = fallbackDecision.shouldSeed ? buildRetailerFallbackData().shipments : normalizedShipments; |
| client/src/pages/retailer/Home.jsx | 387 | Runtime code | Yes |         console.log("[DIAG][Home] Sample order:", normalizedOrders[0]); |
| client/src/pages/retailer/Home.jsx | 388 | Runtime code | Yes |         console.log("[DIAG][Home] Sample shipment:", normalizedShipments[0]); |
| client/src/pages/retailer/Home.jsx | 407 | Runtime code | Yes |       const fallback = buildRetailerFallbackData(); |
| client/src/pages/retailer/Home.jsx | 408 | Runtime code | Yes |       setOrders(fallback.orders.map(normalizeOrder)); |
| client/src/pages/retailer/Home.jsx | 409 | Runtime code | Yes |       setShipments(fallback.shipments.map(normalizeShipment)); |
| client/src/pages/retailer/Home.jsx | 410 | Runtime code | Yes |       setStats({ totalOrders: fallback.orders.length, pendingOrders: 0 }); |
| client/src/pages/retailer/Home.jsx | 421 | Runtime code | Yes |       console.log('[DIAG][Home.useEffect] sample shipments', Array.isArray(shipments) ? shipments.slice(0,3) : shipments); |
| client/src/pages/retailer/Home.jsx | 423 | Runtime code | Yes |       console.warn('[DIAG][Home.useEffect] unable to show sample shipments', e); |
| client/src/pages/retailer/Home.jsx | 721 | Runtime code | Yes |                 {simulationEnabled ? "Disable demo mode" : "Enable demo mode"} |
| client/src/pages/retailer/Home.jsx | 725 | Runtime code | Yes |                 onClick={addDemoOrderFlow} |
| client/src/pages/retailer/Home.jsx | 732 | Runtime code | Yes |                 onClick={addDemoOrderFlow} |
| client/src/pages/retailer/Home.jsx | 742 | Runtime code | Yes |                 Reset demo state |
| client/src/pages/retailer/Home.jsx | 1101 | Runtime code | Yes |                   onClick={addDemoOrderFlow} |
| client/src/pages/retailer/retailerDashboardData.js | 1 | Runtime code | Yes | const buildRetailerFallbackData = () => ({ |
| client/src/pages/retailer/retailerDashboardData.js | 4 | Runtime code | Yes |       _id: "fallback-order-1", |
| client/src/pages/retailer/retailerDashboardData.js | 5 | Runtime code | Yes |       orderNumber: "ORD-FALLBACK-001", |
| client/src/pages/retailer/retailerDashboardData.js | 15 | Runtime code | Yes |       _id: "fallback-shipment-1", |
| client/src/pages/retailer/retailerDashboardData.js | 16 | Runtime code | Yes |       trackingNumber: "SHP-FALLBACK-001", |
| client/src/pages/retailer/retailerDashboardData.js | 39 | Runtime code | Yes |       order: { orderNumber: "ORD-FALLBACK-001" }, |
| client/src/pages/retailer/retailerDashboardData.js | 52 | Runtime code | Yes | const shouldSeedRetailerFallbackData = (orders = [], shipments = [], token = "") => { |
| client/src/pages/retailer/retailerDashboardData.js | 63 | Runtime code | Yes | export { buildRetailerFallbackData, shouldSeedRetailerFallbackData }; |
| client/src/pages/retailer/retailerDashboardData.test.js | 3 | Runtime code | Yes | import { buildRetailerFallbackData, shouldSeedRetailerFallbackData } from "./retailerDashboardData.js"; |
| client/src/pages/retailer/retailerDashboardData.test.js | 5 | Runtime code | Yes | test("buildRetailerFallbackData returns demo orders and shipments", () => { |
| client/src/pages/retailer/retailerDashboardData.test.js | 6 | Runtime code | Yes |   const fallback = buildRetailerFallbackData(); |
| client/src/pages/retailer/retailerDashboardData.test.js | 8 | Runtime code | Yes |   assert.ok(Array.isArray(fallback.orders)); |
| client/src/pages/retailer/retailerDashboardData.test.js | 9 | Runtime code | Yes |   assert.equal(fallback.orders.length, 1); |
| client/src/pages/retailer/retailerDashboardData.test.js | 10 | Runtime code | Yes |   assert.ok(Array.isArray(fallback.shipments)); |
| client/src/pages/retailer/retailerDashboardData.test.js | 11 | Runtime code | Yes |   assert.equal(fallback.shipments.length, 1); |
| client/src/pages/retailer/retailerDashboardData.test.js | 12 | Runtime code | Yes |   assert.equal(fallback.orders[0].status, "Confirmed"); |
| client/src/pages/retailer/retailerDashboardData.test.js | 13 | Runtime code | Yes |   assert.equal(fallback.shipments[0].status, "Shipped"); |
| client/src/pages/retailer/retailerDashboardData.test.js | 16 | Runtime code | Yes | test("shouldSeedRetailerFallbackData returns false when real retailer data already exists", () => { |
| client/src/pages/retailer/retailerDashboardData.test.js | 17 | Runtime code | Yes |   const result = shouldSeedRetailerFallbackData( |
| client/src/pages/warehouse/Dashboard.jsx | 66 | Runtime code | Yes |   const injectDemoWarehouseFlow = async () => { |
| client/src/pages/warehouse/Dashboard.jsx | 68 | Runtime code | Yes |       await request("POST", "/api/users/simulation/demo-flow", { |
| client/src/pages/warehouse/Dashboard.jsx | 69 | Runtime code | Yes |         medicine: "Demo Vaccine", |
| client/src/pages/warehouse/Dashboard.jsx | 72 | Runtime code | Yes |         purchaseOrderNumber: `WH-DEMO-${Date.now()}`, |
| client/src/pages/warehouse/Dashboard.jsx | 76 | Runtime code | Yes |       showNotification("Demo warehouse activity persisted and synced", "success"); |
| client/src/pages/warehouse/Dashboard.jsx | 78 | Runtime code | Yes |       showNotification(error.message &#124;&#124; "Failed to create warehouse demo flow", "error"); |
| client/src/pages/warehouse/Dashboard.jsx | 85 | Runtime code | Yes |       await injectDemoWarehouseFlow(); |
| client/src/pages/warehouse/Dashboard.jsx | 99 | Runtime code | Yes |       showNotification("Warehouse demo state cleared", "success"); |
| client/src/pages/warehouse/Dashboard.jsx | 101 | Runtime code | Yes |       showNotification(error.message &#124;&#124; "Failed to reset warehouse demo data", "error"); |
| client/src/pages/warehouse/Dashboard.jsx | 631 | Runtime code | Yes |               <p className="font-semibold">Warehouse demo controls</p> |
| client/src/pages/warehouse/Dashboard.jsx | 640 | Runtime code | Yes |                 {simulationEnabled ? "Disable demo mode" : "Enable demo mode"} |
| client/src/pages/warehouse/Dashboard.jsx | 644 | Runtime code | Yes |                 onClick={injectDemoWarehouseFlow} |
| client/src/pages/warehouse/Dashboard.jsx | 661 | Runtime code | Yes |                 Reset demo state |
| client/src/pages/warehouse/Dashboard.test.jsx | 170 | Runtime code | Yes |   test('Dashboard handles low stock alerts with fallback to populated field names', async () => { |
| client/src/services/auth.api.js | 13 | Runtime code | Yes | const requestWithFallback = async (method, path, data = null) => { |
| client/src/services/auth.api.js | 46 | Runtime code | Yes | export const signup = (data) => requestWithFallback("post", "/auth/signup", data); |
| client/src/services/auth.api.js | 47 | Runtime code | Yes | export const login = (data) => requestWithFallback("post", "/auth/login", data); |
| client/src/services/auth.api.js | 48 | Runtime code | Yes | export const forgotPassword = (data) => requestWithFallback("post", "/auth/forgot-password", data); |
| client/src/services/auth.api.js | 49 | Runtime code | Yes | export const resetPassword = (data) => requestWithFallback("post", "/auth/reset-password", data); |
| client/src/services/auth.api.js | 50 | Runtime code | Yes | export const verifyResetToken = (token) => requestWithFallback("get", `/auth/verify-reset-token/${token}`); |
