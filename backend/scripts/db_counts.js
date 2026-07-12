import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO = process.env.MONGO_URI;
if (!MONGO) {
  console.error('MONGO_URI not set');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO, { });
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Collections found:', collections.map(c => c.name).join(', '));
  const names = collections.map(c => c.name);
  const toCheck = ['users','orders','shipments','inventory','drugs','suppliers','bleRegistries','bler registries','scanlogs','compliances','audits','ble_registry','bleRegistry','ble_registrymodels'];
  for (const name of names) {
    try {
      const count = await db.collection(name).countDocuments();
      console.log(`${name}: ${count}`);
    } catch (e) {
      console.warn('Could not count', name, e.message);
    }
  }
  await mongoose.disconnect();
}

run().catch(e=>{console.error(e);process.exit(1)});
