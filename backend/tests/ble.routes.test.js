import assert from 'assert';
import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app.js';

const TEST_MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/drug_inventory_test';

const makeRequest = (path) => {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body: rawData }));
      }
    );

    req.on('error', reject);
    req.end();
  });
};

describe('BLE routes', () => {
  let server;

  before(async () => {
    await mongoose.connect(TEST_MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    server = app.listen(5000);
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await server.close();
  });

  it('should expose BLE route health endpoint', async () => {
    const response = await makeRequest('/api/test');
    const body = JSON.parse(response.body);

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.message, 'Server is running!');
  });
});
