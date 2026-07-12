#!/usr/bin/env node
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const base = process.env.BASE_URL || 'http://localhost:5001';
async function req(path, method='GET', body=null, token=null){
  const headers={ 'Content-Type':'application/json' };
  if(token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(base+path, { method, headers, body: body?JSON.stringify(body):undefined });
  return res.json();
}

async function main(){
  const adminEmail = process.env.DEBUG_ADMIN_EMAIL || 'drug.inventory.management.system@gmail.com';
  const adminPass = process.env.DEBUG_ADMIN_PASS || 'calpol650';
  const login = await req('/api/auth/login','POST',{ email: adminEmail, password: adminPass });
  const token = login.token;
  const supplierId = process.env.TEST_SUPPLIER_ID || '6a4f54418af2f550000a7229';
  const drugId = process.env.TEST_DRUG_ID || '6a4f54418af2f550000a722b';

  const payload = {
    supplier: supplierId,
    items: [ { drug: drugId, quantity: 10, unitPrice: 60, batchNumber: 'E2E-BATCH-1', expiryDate: new Date(Date.now()+365*24*60*60*1000) } ],
    expectedDeliveryDate: new Date(Date.now()+5*24*60*60*1000),
    shippingMethod: 'ground'
  };

  const res = await req('/api/admin/shipments','POST', payload, token);
  console.log('Create shipment response:', JSON.stringify(res, null, 2));
}

main().catch(e=>{ console.error(e); process.exit(1); });
