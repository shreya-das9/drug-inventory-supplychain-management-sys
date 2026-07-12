import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = await MongoMemoryServer.create();
process.env.MONGO_URI = mongod.getUri();
process.env.NODE_ENV = 'test';
process.env.BLE_ENABLED = 'false';

console.log('Using in-memory MongoDB for tests:', process.env.MONGO_URI);

if (typeof after === 'function') {
  after(async () => {
    await mongod.stop();
  });
}
