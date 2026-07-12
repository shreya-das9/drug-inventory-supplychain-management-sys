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
  console.log('Logged in, fetching shipments and orders...');
  const shipments = await req('/api/admin/shipments?limit=50','GET',null,token);
  console.log('Shipments:', JSON.stringify(shipments,null,2));
  const orders = await req('/api/admin/orders?limit=50','GET',null,token);
  console.log('Orders:', JSON.stringify(orders,null,2));
}

main().catch(e=>{ console.error(e); process.exit(1); });
