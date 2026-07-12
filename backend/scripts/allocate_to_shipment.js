#!/usr/bin/env node
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const base = process.env.BASE_URL || 'http://localhost:5001';
async function req(path, method='GET', body=null, token=null){
  const headers={ 'Content-Type':'application/json' };
  if(token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(base+path, { method, headers, body: body?JSON.stringify(body):undefined });
  const text = await res.text();
  try { return { status: res.status, body: JSON.parse(text) }; } catch(e){ return { status: res.status, body: text }; }
}

async function main(){
  const adminEmail = process.env.DEBUG_ADMIN_EMAIL || 'drug.inventory.management.system@gmail.com';
  const adminPass = process.env.DEBUG_ADMIN_PASS || 'calpol650';
  const shipmentId = process.env.TEST_SHIPMENT_ID || '';
  if (!shipmentId) { console.error('Provide TEST_SHIPMENT_ID env var'); process.exit(1); }
  const login = await req('/api/auth/login','POST',{ email: adminEmail, password: adminPass });
  console.log('Login response:', JSON.stringify(login));
  const token = login.body && login.body.token ? login.body.token : login.token;
  const alloc = await req('/api/admin/ble/allocate','POST',{ shipmentId }, token);
  console.log('Allocation result:', JSON.stringify(alloc, null, 2));
}

main().catch(e=>{ console.error(e); process.exit(1); });
