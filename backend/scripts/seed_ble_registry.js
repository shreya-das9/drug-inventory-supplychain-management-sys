#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BLERegistry from '../src/models/BLERegistryModel.js';
dotenv.config();

const MONGO = process.env.MONGO_URI;

async function run(){
  await mongoose.connect(MONGO);
  console.log('Connected to Mongo');
  const toCreate = [];
  for(let i=0;i<10;i++){
    const bleId = `BLE${Date.now()}${i}`;
    toCreate.push({ bleId, secretKey: `sk_${Math.random().toString(36).slice(2,12)}`, status: 'UNUSED' });
  }
  await BLERegistry.insertMany(toCreate);
  console.log('Inserted BLE entries');
  process.exit(0);
}

run().catch(e=>{ console.error(e); process.exit(1); });
