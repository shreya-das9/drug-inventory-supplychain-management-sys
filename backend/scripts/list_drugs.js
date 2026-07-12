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
  const res = await req('/api/admin/drugs?limit=20','GET',null,token);
  console.log('Drugs:', JSON.stringify(res,null,2));
}

main().catch(e=>{ console.error(e); process.exit(1); });
