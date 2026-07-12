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
  const shipmentsRes = await req('/api/admin/shipments?limit=100','GET',null,token);
  const shipments = shipmentsRes.data && shipmentsRes.data.shipments ? shipmentsRes.data.shipments : shipmentsRes.data || [];
  const noOrder = shipments.filter(s => !s.bleId && !s.order);
  console.log('Shipments with no order and no bleId:', noOrder.map(s => ({ id: s._id, status: s.status })));
  const linkedUnconfirmed = shipments.filter(s => !s.bleId && s.order && s.order.status && s.order.status.toLowerCase() === 'confirmed');
  console.log('Shipments linked to confirmed order:', linkedUnconfirmed.map(s=>({id:s._id, orderId: s.order?._id||s.order}))); 
}

main().catch(e=>{ console.error(e); process.exit(1); });
