# BLE Specification and Chipless Simulation Guide

This guide gives your teammate the exact BLE contracts and runnable simulation flow without a physical BLE chip.

## Base API

- Base path: `/api/ble`
- Auth: `Authorization: Bearer <JWT>`
- Roles:
  - `admin`: required for `/secure/issue`, `/secure/registry/:bleId/tamper`
  - `warehouse_admin` / `warehouse` / `admin`: required for all scan + verification routes

## Secure BLE Contract

### 1) Issue BLE identity

`POST /api/ble/secure/issue` (admin)

Request:

```json
{
  "bleId": "BLE-SIM-1001",
  "metadata": {
    "batchId": "BATCH-98765",
    "sku": "DRUG-ABC"
  }
}
```

Response `data`:

```json
{
  "bleId": "BLE-SIM-1001",
  "secretKey": "<hex>",
  "status": "UNUSED",
  "tamperStatus": "INTACT"
}
```

### 2) Create challenge

`POST /api/ble/secure/challenge` (warehouse/admin)

Request:

```json
{ "bleId": "BLE-SIM-1001" }
```

Response `data`:

```json
{
  "bleId": "BLE-SIM-1001",
  "challenge": "<hex>",
  "expiresAt": "2026-03-09T10:10:10.000Z"
}
```

Notes:
- Challenge TTL is 2 minutes.
- Device must not be `REVOKED`.
- `tamperStatus` must not be `BREACHED`.

### 3) Mock-sign challenge (chip emulator)

`POST /api/ble/secure/mock-sign` (warehouse/admin)

Request:

```json
{
  "bleId": "BLE-SIM-1001",
  "challenge": "<challenge-from-step-2>"
}
```

Response `data`:

```json
{
  "bleId": "BLE-SIM-1001",
  "signature": "<sha256(challenge:secretKey)>"
}
```

### 4) Verify secure scan

`POST /api/ble/secure/verify` (warehouse/admin)

Request:

```json
{
  "bleId": "BLE-SIM-1001",
  "challenge": "<challenge>",
  "signature": "<signature>",
  "stage": "warehouse",
  "trafficCondition": "high",
  "delayReason": "Road closure due to police diversion. Alternate route was used and parcel remained sealed.",
  "location": {
    "city": "Kolkata",
    "lat": 22.5726,
    "lng": 88.3639
  },
  "timestamp": "2026-03-09T10:11:00.000Z"
}
```

Response `data` (success example):

```json
{
  "bleId": "BLE-SIM-1001",
  "verified": true,
  "verificationStatus": "VERIFIED",
  "alerts": [],
  "scanId": "<mongo-id>",
  "publicRegistry": {
    "status": "ACTIVE",
    "tamperStatus": "INTACT",
    "lastKnownStage": "manufacturer"
  }
}
```

## Stage Flow Rules

Allowed progression:

`manufacturer -> distributor -> warehouse -> pharmacy -> customer`

Behavior:
- First verified scan must be `manufacturer`
- Repeated same stage is allowed
- Skipping/reversing stage creates `FLOW_VIOLATION` and results in `BLOCKED`

## Transit SLA Security Rule

For each handoff leg, the backend computes allowed transit time using:

- fixed leg baseline (hours), and
- distance-adjusted estimate from traffic condition (`low`, `moderate`, `high`, `severe`),
- plus a 15-minute grace window.

If elapsed transit time exceeds allowed time:

- `TRANSIT_TIME_EXCEEDED` is logged,
- scan is marked `BLOCKED`,
- and a delay reason is required (`delayReason`, minimum 20 chars), otherwise `DELAY_REASON_REQUIRED` is logged.

## Alert Codes and Meanings

- `CHALLENGE_INVALID`: expired/wrong/missing challenge
- `FAKE_DEVICE_SIGNATURE`: signature mismatch
- `TAMPER_BREACH`: registry tamper status is `BREACHED`
- `DEVICE_REVOKED`: registry status is `REVOKED`
- `FLOW_VIOLATION`: stage transition invalid
- `IMPOSSIBLE_MOVEMENT`: speed between scans > 900 km/h
- `TRANSIT_TIME_EXCEEDED`: handoff took longer than permitted SLA
- `DELAY_REASON_REQUIRED`: delayed handoff submitted without adequate reason

Verification statuses:
- `VERIFIED`
- `FAILED`
- `BLOCKED`

## Ready-to-run Chipless Simulator

A simulator script is available at:

- `backend/scripts/ble_simulator.js`

Run:

```bash
cd backend
BLE_ADMIN_TOKEN="<admin-jwt>" BLE_WAREHOUSE_TOKEN="<warehouse-or-admin-jwt>" npm run ble:simulate
```

PowerShell example:

```powershell
cd backend
$env:BLE_ADMIN_TOKEN="<admin-jwt>"
$env:BLE_WAREHOUSE_TOKEN="<warehouse-or-admin-jwt>"
npm run ble:simulate
```

Optional envs:
- `BLE_API_BASE` (default: `http://localhost:5000/api/ble`)
- `BLE_ID` (default generated, like `BLE-SIM-4821`)
- `BLE_STAGE` (default: `manufacturer`)
- `BLE_CITY`, `BLE_LAT`, `BLE_LNG`
- `BLE_TRAFFIC_CONDITION` (`low|moderate|high|severe`)
- `BLE_DELAY_REASON`

## Optional Raw Curl Sequence

1) Issue

```bash
curl -X POST http://localhost:5000/api/ble/secure/issue \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"bleId":"BLE-SIM-1001","metadata":{"batchId":"BATCH-98765"}}'
```

2) Challenge

```bash
curl -X POST http://localhost:5000/api/ble/secure/challenge \
  -H "Authorization: Bearer <WAREHOUSE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"bleId":"BLE-SIM-1001"}'
```

3) Mock sign

```bash
curl -X POST http://localhost:5000/api/ble/secure/mock-sign \
  -H "Authorization: Bearer <WAREHOUSE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"bleId":"BLE-SIM-1001","challenge":"<challenge>"}'
```

4) Verify

```bash
curl -X POST http://localhost:5000/api/ble/secure/verify \
  -H "Authorization: Bearer <WAREHOUSE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "bleId":"BLE-SIM-1001",
    "challenge":"<challenge>",
    "signature":"<signature>",
    "stage":"manufacturer",
    "location":{"city":"Kolkata","lat":22.5726,"lng":88.3639},
    "timestamp":"2026-03-09T10:11:00.000Z"
  }'
```
