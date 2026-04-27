import crypto from "crypto";

const API_BASE = process.env.BLE_API_BASE || "http://localhost:5000/api/ble";
const ADMIN_TOKEN = process.env.BLE_ADMIN_TOKEN;
const WAREHOUSE_TOKEN = process.env.BLE_WAREHOUSE_TOKEN || ADMIN_TOKEN;

const BLE_ID = (process.env.BLE_ID || `BLE-SIM-${crypto.randomInt(1000, 9999)}`)
  .toUpperCase()
  .trim();

const STAGE = (process.env.BLE_STAGE || "manufacturer").toLowerCase().trim();
const CITY = process.env.BLE_CITY || "Kolkata";
const LAT = Number(process.env.BLE_LAT || "22.5726");
const LNG = Number(process.env.BLE_LNG || "88.3639");
const TRAFFIC_CONDITION = (process.env.BLE_TRAFFIC_CONDITION || "moderate").toLowerCase().trim();
const DELAY_REASON = process.env.BLE_DELAY_REASON || "";

const assertEnv = () => {
  if (!ADMIN_TOKEN) {
    throw new Error(
      "Missing BLE_ADMIN_TOKEN. Provide an admin JWT so /secure/issue can be called."
    );
  }

  if (!WAREHOUSE_TOKEN) {
    throw new Error(
      "Missing BLE_WAREHOUSE_TOKEN (or BLE_ADMIN_TOKEN fallback). Provide a token with warehouse/admin role."
    );
  }
};

const request = async ({ path, method = "GET", token, body }) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = { success: false, message: "Non-JSON response from API." };
  }

  if (!response.ok || !json?.success) {
    const message = json?.message || `HTTP ${response.status}`;
    throw new Error(`${method} ${path} failed: ${message}`);
  }

  return json.data;
};

const run = async () => {
  assertEnv();

  console.log("\n=== BLE CHIPLESS SIMULATION START ===");
  console.log(`API_BASE: ${API_BASE}`);
  console.log(`BLE_ID:   ${BLE_ID}`);
  console.log(`STAGE:    ${STAGE}`);

  const issue = await request({
    path: "/secure/issue",
    method: "POST",
    token: ADMIN_TOKEN,
    body: {
      bleId: BLE_ID,
      metadata: {
        source: "chipless-simulator",
        note: "Created by backend/scripts/ble_simulator.js"
      }
    }
  });

  console.log("\n[1/6] Issued BLE identity");
  console.log({ bleId: issue.bleId, status: issue.status, tamperStatus: issue.tamperStatus });

  const challengeData = await request({
    path: "/secure/challenge",
    method: "POST",
    token: WAREHOUSE_TOKEN,
    body: { bleId: BLE_ID }
  });

  console.log("\n[2/6] Challenge generated");
  console.log({ challenge: challengeData.challenge, expiresAt: challengeData.expiresAt });

  const signatureData = await request({
    path: "/secure/mock-sign",
    method: "POST",
    token: WAREHOUSE_TOKEN,
    body: {
      bleId: BLE_ID,
      challenge: challengeData.challenge
    }
  });

  console.log("\n[3/6] Mock signature generated");
  console.log({ signature: signatureData.signature });

  const verifyData = await request({
    path: "/secure/verify",
    method: "POST",
    token: WAREHOUSE_TOKEN,
    body: {
      bleId: BLE_ID,
      challenge: challengeData.challenge,
      signature: signatureData.signature,
      stage: STAGE,
      trafficCondition: TRAFFIC_CONDITION,
      delayReason: DELAY_REASON,
      location: {
        city: CITY,
        lat: Number.isFinite(LAT) ? LAT : null,
        lng: Number.isFinite(LNG) ? LNG : null
      },
      timestamp: new Date().toISOString()
    }
  });

  console.log("\n[4/6] Verify scan complete");
  console.log({
    verified: verifyData.verified,
    verificationStatus: verifyData.verificationStatus,
    alerts: verifyData.alerts,
    scanId: verifyData.scanId
  });

  const registryData = await request({
    path: `/secure/registry/${BLE_ID}`,
    method: "GET",
    token: WAREHOUSE_TOKEN
  });

  console.log("\n[5/6] Registry state");
  console.log({
    bleId: registryData.bleId,
    status: registryData.status,
    tamperStatus: registryData.tamperStatus,
    lastKnownStage: registryData.lastKnownStage,
    lastKnownLocation: registryData.lastKnownLocation,
    lastScanAt: registryData.lastScanAt
  });

  const logsData = await request({
    path: `/secure/logs?bleId=${encodeURIComponent(BLE_ID)}&limit=5`,
    method: "GET",
    token: WAREHOUSE_TOKEN
  });

  console.log("\n[6/6] Recent logs");
  console.log({ count: logsData.count });
  console.log(logsData.logs.map((log) => ({
    id: log._id,
    stage: log.stage,
    verificationStatus: log.verificationStatus,
    alertCodes: log.alertCodes,
    scannedAt: log.scannedAt
  })));

  console.log("\n=== BLE CHIPLESS SIMULATION DONE ===\n");
};

run().catch((error) => {
  console.error("\nBLE simulation failed:", error.message);
  process.exit(1);
});
