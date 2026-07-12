#!/usr/bin/env node
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const base = process.env.BASE_URL || 'http://localhost:5000';

async function req(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(base + path, opts);
  const txt = await res.text();
  try { return { status: res.status, body: JSON.parse(txt) }; } catch(e) { return { status: res.status, body: txt }; }
}

async function login(email, password) {
  const r = await req('/api/auth/login', 'POST', { email, password });
  if (r.status !== 200) throw new Error('Login failed: ' + JSON.stringify(r.body));
  return r.body.token || (r.body.data && r.body.data.token) || null;
}

async function main() {
  console.log('E2E BLE allocation test starting against', base);
  const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@test.com';
  const adminPass = process.env.E2E_ADMIN_PASS || 'admin123';

  const adminToken = await login(adminEmail, adminPass);
  console.log('Got admin token');

  // Fetch shipments
  const shipmentsRes = await req('/api/admin/shipments?limit=50', 'GET', null, adminToken);
  if (shipmentsRes.status !== 200) throw new Error('Failed to list shipments: ' + JSON.stringify(shipmentsRes.body));
  const shipments = shipmentsRes.body.data && shipmentsRes.body.data.shipments ? shipmentsRes.body.data.shipments : shipmentsRes.body.data || [];
  console.log('Found', shipments.length, 'shipments');

  // Pick a shipment without bleId and with confirmed linked order if present
  let target = shipments.find(s => !s.bleId && (!s.order || (s.order && s.order.status && s.order.status.toLowerCase() === 'confirmed')));
  let allocRes;
  if (target) {
    console.log('Using shipment:', target._id || target.id || target);
    // Allocate BLE to shipment
    allocRes = await req('/api/admin/ble/allocate', 'POST', { shipmentId: target._id || target.id || target }, adminToken);
  } else {
    // Fallback: find a confirmed order and allocate by orderId (controller will create shipment)
    console.log('No suitable shipment found; looking for confirmed orders to allocate by orderId');
    const ordersRes = await req('/api/admin/orders?limit=50', 'GET', null, adminToken);
    if (ordersRes.status !== 200) throw new Error('Failed to list orders: ' + JSON.stringify(ordersRes.body));
    const orders = ordersRes.body.data && ordersRes.body.data.orders ? ordersRes.body.data.orders : ordersRes.body.data || [];
    const confirmed = orders.find(o => (o.status || '').toLowerCase() === 'confirmed');
    if (!confirmed) throw new Error('No confirmed order found to allocate BLE');
    console.log('Using order:', confirmed._id || confirmed.id || confirmed);
    allocRes = await req('/api/admin/ble/allocate', 'POST', { orderId: confirmed._id || confirmed.id || confirmed }, adminToken);
    // after allocation, fetch the created shipment id from response
    if (allocRes.status === 200 && allocRes.body.data && allocRes.body.data.shipmentId) {
      target = { _id: allocRes.body.data.shipmentId };
    }
  }
  console.log('Allocation status:', allocRes.status);
  console.log('Allocation response:', JSON.stringify(allocRes.body, null, 2));
  if (allocRes.status !== 200) throw new Error('Allocation failed: ' + JSON.stringify(allocRes.body));

  const bleId = allocRes.body.data?.bleId || allocRes.body.bleId || (allocRes.body.data && allocRes.body.data.bleId) || (allocRes.body.bleId);
  const masked = allocRes.body.data?.maskedBleId || allocRes.body.maskedBleId || (allocRes.body.data && allocRes.body.data.maskedBleId) || allocRes.body.maskedBleId;
  console.log('Allocated BLE id (raw for admin):', bleId);
  console.log('Masked BLE id:', masked);

  // Re-fetch shipment to verify
  const checkRes = await req(`/api/admin/shipments/${target._id || target.id || target}`, 'GET', null, adminToken);
  console.log('Post-allocation shipment fetch status:', checkRes.status);
  console.log('Shipment:', JSON.stringify(checkRes.body, null, 2));

  // Try duplicate allocation
  const dupRes = await req('/api/admin/ble/allocate', 'POST', { shipmentId: target._id || target.id || target }, adminToken);
  console.log('Duplicate allocation status:', dupRes.status);
  console.log('Duplicate allocation response:', JSON.stringify(dupRes.body, null, 2));

  // Login as retailer to verify masking
  const retailerEmail = process.env.E2E_RETAILER_EMAIL || null;
  if (!retailerEmail) {
    console.error('E2E_RETAILER_EMAIL not set; aborting e2e_ble_allocate to avoid demo fallbacks');
    process.exit(1);
  }
  const retailerPass = process.env.E2E_RETAILER_PASS || 'user123';
  const retailerToken = await login(retailerEmail, retailerPass);
  console.log('Got retailer token');

  // Fetch retailer shipments and look for our shipment
  const retShipRes = await req('/api/users/retailer/shipments', 'GET', null, retailerToken);
  console.log('Retailer shipments status:', retShipRes.status);
  // Print summary whether BLE exposed
  const retShipData = retShipRes.body.data || retShipRes.body;
  const found = JSON.stringify(retShipData).includes(bleId || masked);
  console.log('Retailer view contains raw BLE id?', found);

  console.log('E2E BLE allocation test completed successfully');
}

main().catch(err => {
  console.error('E2E script error:', err.message || err);
  process.exit(1);
});
