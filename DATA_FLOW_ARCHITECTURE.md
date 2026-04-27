# 📊 Dashboard E2E Data Flow Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│                                                                  │
│    ┌─────────────────────────────────────────────────────┐     │
│    │         Warehouse Dashboard Component              │     │
│    │  (client/src/pages/warehouse/Dashboard.jsx)        │     │
│    │                                                     │     │
│    │  ┌──────────────────────────────────────────────┐  │     │
│    │  │  useApi Hook - Axios Instance               │  │     │
│    │  │  - Handles HTTP requests                     │  │     │
│    │  │  - Auth tokens & credentials                 │  │     │
│    │  └──────────────────────────────────────────────┘  │     │
│    │                                                     │     │
│    │  ┌──────────────────────────────────────────────┐  │     │
│    │  │  React State Management                      │  │     │
│    │  │  - stats (totalDrugs, lowStockCount, etc)    │  │     │
│    │  │  - alerts (expiry, low stock, transit)       │  │     │
│    │  │  - pageLoading, lastUpdate                   │  │     │
│    │  └──────────────────────────────────────────────┘  │     │
│    │                                                     │     │
│    │  ┌──────────────────────────────────────────────┐  │     │
│    │  │  Render Components                           │  │     │
│    │  │  - Stat Cards (Package, Alert, Clock icons)  │  │     │
│    │  │  - Alert Lists (Expiry, Low Stock, Transit)  │  │     │
│    │  │  - Search/Filter Box                         │  │     │
│    │  │  - Refresh Button                            │  │     │
│    │  └──────────────────────────────────────────────┘  │     │
│    └─────────────────────────────────────────────────────┘     │
│                            ↕️ HTTP Requests/Responses          │
├─────────────────────────────────────────────────────────────────┤
│                      NETWORK LAYER (HTTP)                       │
│                                                                  │
│  GET /api/admin/dashboard/stats       (50-200ms)               │
│  GET /api/admin/dashboard/alerts      (100-300ms)              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                       BACKEND LAYER (Node.js)                   │
│                                                                  │
│    ┌──────────────────────────────────────────────────┐        │
│    │    Express.js API Server (port 5000)             │        │
│    │                                                  │        │
│    │  ┌────────────────────────────────────────────┐ │        │
│    │  │  Dashboard Routes                          │ │        │
│    │  │  (src/routes/admin/dashboard.routes.js)    │ │        │
│    │  │                                            │ │        │
│    │  │  GET /stats → getStats()                   │ │        │
│    │  │  GET /alerts → getAlerts()                 │ │        │
│    │  └────────────────────────────────────────────┘ │        │
│    │                    ↓                            │        │
│    │  ┌────────────────────────────────────────────┐ │        │
│    │  │  Dashboard Controller                      │ │        │
│    │  │  (src/controllers/admin/dashboard.js)      │ │        │
│    │  │                                            │ │        │
│    │  │  getStats()                                │ │        │
│    │  │  ├─ Count total drugs                      │ │        │
│    │  │  ├─ Count low stock (qty < 10)             │ │        │
│    │  │  ├─ Count expired drugs                    │ │        │
│    │  │  ├─ Validate stats (non-negative)          │ │        │
│    │  │  └─ Return validated stats                 │ │        │
│    │  │                                            │ │        │
│    │  │  getAlerts()                               │ │        │
│    │  │  ├─ Fetch expiring drugs (30 days)         │ │        │
│    │  │  ├─ Fetch low stock items                  │ │        │
│    │  │  ├─ Fetch transit delays                   │ │        │
│    │  │  ├─ Transform batchNumber → batchNo        │ │        │
│    │  │  ├─ Validate all alerts                    │ │        │
│    │  │  └─ Return validated alerts                │ │        │
│    │  └────────────────────────────────────────────┘ │        │
│    │                    ↓                            │        │
│    │  ┌────────────────────────────────────────────┐ │        │
│    │  │  Validation Utility                        │ │        │
│    │  │  (src/utils/validation.js)                 │ │        │
│    │  │                                            │ │        │
│    │  │  validateRequired()                        │ │        │
│    │  │  ├─ Check required fields exist            │ │        │
│    │  │  └─ Ensure non-null values                 │ │        │
│    │  │                                            │ │        │
│    │  │  validateArray()                           │ │        │
│    │  │  ├─ Validate collection of items           │ │        │
│    │  │  ├─ Check each item structure              │ │        │
│    │  │  └─ Log warnings for invalid items         │ │        │
│    │  └────────────────────────────────────────────┘ │        │
│    │                    ↓                            │        │
│    │  ┌────────────────────────────────────────────┐ │        │
│    │  │  Database Queries (Mongoose ODM)           │ │        │
│    │  │                                            │ │        │
│    │  │  Drug.countDocuments()                     │ │        │
│    │  │  ├─ Total drugs in system                  │ │        │
│    │  │  └─ Expected: 14                           │ │        │
│    │  │                                            │ │        │
│    │  │  Inventory.countDocuments({qty < 10})      │ │        │
│    │  │  ├─ Items below threshold                  │ │        │
│    │  │  └─ Expected: 3                            │ │        │
│    │  │                                            │ │        │
│    │  │  Drug.find({expiry < now})                 │ │        │
│    │  │  ├─ Expired items                          │ │        │
│    │  │  └─ Expected: 2                            │ │        │
│    │  │                                            │ │        │
│    │  │  Drug.find({expiry within 30 days})        │ │        │
│    │  │  ├─ Soon to expire                         │ │        │
│    │  │  └─ Expected: 4                            │ │        │
│    │  │                                            │ │        │
│    │  │  Scanlog.find({TRANSIT_TIME_EXCEEDED})     │ │        │
│    │  │  ├─ Transit delays                         │ │        │
│    │  │  └─ Expected: 2                            │ │        │
│    │  └────────────────────────────────────────────┘ │        │
│    └──────────────────────────────────────────────────┘        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                    DATABASE LAYER (MongoDB)                     │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐    │
│    │  drug_inventory Database                           │    │
│    │                                                      │    │
│    │  Collections:                                       │    │
│    │  ├─ drugs (14 test records)                        │    │
│    │  │  ├─ name, batchNumber, expiryDate, etc         │    │
│    │  │  └─ Query: {expiryDate < now} → 2 results      │    │
│    │  │                                                │    │
│    │  ├─ inventories (17 total)                         │    │
│    │  │  ├─ drug (ref), quantity, warehouseLocation    │    │
│    │  │  └─ Query: {quantity < 10} → 3 results         │    │
│    │  │                                                │    │
│    │  ├─ scanlogs (2 test records)                      │    │
│    │  │  ├─ bleId, stage, alertCodes, details          │    │
│    │  │  └─ Query: {alertCodes: TRANSIT_...} → 2 res  │    │
│    │  │                                                │    │
│    │  └─ suppliers (1 test record)                      │    │
│    │     └─ name, status, email, etc                   │    │
│    └──────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request/Response Flow

### 1️⃣ Stats Endpoint Flow

```
Frontend Initiates Request:
request("GET", "/api/admin/dashboard/stats")
         ↓
Backend Route Handler:
GET /api/admin/dashboard/stats
         ↓
Dashboard Controller (getStats):
├─ Promise.all([
│  ├─ Drug.countDocuments()                → 14
│  ├─ Inventory.countDocuments(qty<10)     → 3
│  └─ Drug.countDocuments(expiry<now)      → 2
├─ Create stats object with Number() casting
├─ Validate all are non-negative
└─ Return success response
         ↓
Frontend Receives:
{
  success: true,
  data: {
    totalDrugs: 14,        ✓ Number
    lowStockCount: 3,      ✓ Number
    expiredCount: 2        ✓ Number
  }
}
         ↓
Frontend Updates State:
setStats({ totalDrugs: 14, lowStockCount: 3, expiredCount: 2 })
         ↓
Frontend Renders:
- Stat Card 1: "Total Drugs" = 14
- Stat Card 2: "Low Stock" = 3
- Stat Card 3: "Expired" = 2
```

---

### 2️⃣ Alerts Endpoint Flow

```
Frontend Initiates Request:
request("GET", "/api/admin/dashboard/alerts")
         ↓
Backend Route Handler:
GET /api/admin/dashboard/alerts
         ↓
Dashboard Controller (getAlerts):
├─ Calculate date range (today → next month)
├─ Promise.all([
│  ├─ Drug.find({expiry in range})          → 4 items
│  ├─ Inventory.find({qty<10}).populate()   → 3 items
│  └─ Scanlog.find({TRANSIT_EXCEEDED})      → 2 items
│  ├─ Transform expiryAlerts
│  │  ├─ Convert batchNumber → batchNo
│  │  └─ Validate required fields
│  ├─ Transform lowStockAlerts
│  │  ├─ Restructure inventory data
│  │  └─ Validate required fields
│  ├─ Transform securityTransitAlerts
│  │  ├─ Extract delay details
│  │  └─ Format response structure
│  └─ Validate all arrays with validateArray()
└─ Return success response
         ↓
Frontend Receives:
{
  success: true,
  data: {
    expiryAlerts: [
      { _id, name, batchNumber, batchNo, expiryDate },
      ...4 items
    ],
    lowStockAlerts: [
      { _id, quantity, threshold, warehouseLocation },
      ...3 items
    ],
    securityTransitAlerts: [
      { id, bleId, stage, alertCodes, elapsedMinutes, ... },
      ...2 items
    ],
    totalAlerts: 9
  }
}
         ↓
Frontend Updates State:
setAlerts({
  expiryAlerts: [...],
  lowStockAlerts: [...],
  securityTransitAlerts: [...],
  totalAlerts: 9
})
         ↓
Frontend Renders Alert Lists:
- Expiry Alerts: 4 items displayed
- Low Stock Alerts: 3 items displayed
- Transit Alerts: 2 items displayed
```

---

## Data Validation Points

```
LAYER 1: Database Query
┌────────────────────────────┐
│ MongoDB Returns Raw Docs   │
└────────────────────────────┘
         ↓
LAYER 2: Controller Processing
┌────────────────────────────┐
│ Transform & Format Data    │
│ Map field names (batch)    │
│ Calculate derived values   │
└────────────────────────────┘
         ↓
LAYER 3: Validation Utility
┌────────────────────────────┐
│ validateArray()            │
│ - Check each item         │
│ - Verify required fields  │
│ - Type checking           │
│ - Log warnings            │
└────────────────────────────┘
         ↓
LAYER 4: Response Serialization
┌────────────────────────────┐
│ JSON Response Structure    │
│ - success: boolean        │
│ - data: validated         │
│ - Status: 200 OK          │
└────────────────────────────┘
         ↓
LAYER 5: Frontend Reception
┌────────────────────────────┐
│ useApi Hook Receives       │
│ Frontend State Updates     │
│ Component Re-renders       │
└────────────────────────────┘
         ↓
LAYER 6: UI Display
┌────────────────────────────┐
│ User Sees:                 │
│ - Stat cards              │
│ - Alert lists             │
│ - Search/filter           │
└────────────────────────────┘
```

---

## Concurrent Request Pattern

```
Frontend Component Mounts:
         ↓
useEffect Triggers:
         ↓
┌─────────────────────────────────────────┐
│ handleRefresh() Callback                │
│                                         │
│ setPageLoading(true)                   │
│         ↓                               │
│ Promise.all([                           │
│   request("GET", "/stats"),      ┐     │
│   request("GET", "/alerts")  │     │
│ ])                                 │     │
│         ↓                          │     │
│ Both requests execute in parallel:      │
│ ├─ Request 1: 50-200ms                 │
│ ├─ Request 2: 100-300ms                │
│ └─ Wait for longest → ~300ms           │
│                                         │
│ Promise resolves:                       │
│   [statsRes, alertsRes]                 │
│         ↓                               │
│ setStats(statsRes.data)                │
│ setAlerts(alertsRes.data)              │
│ setPageLoading(false)                  │
│ setLastUpdate(new Date())              │
│                                         │
└─────────────────────────────────────────┘
         ↓
Component Renders with Updated Data
```

---

## Error Handling Flow

```
Frontend Request Fails:
         ↓
┌────────────────────────────────────┐
│ try/catch Block in handleRefresh   │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│ catch (err)                         │
│ ├─ console.error(err)              │
│ └─ Continue execution              │
└────────────────────────────────────┘
         ↓
Finally Block:
setPageLoading(false)
         ↓
State Remains with Last Valid Data
(or empty default values)
         ↓
UI Displays Either:
├─ Last cached data (graceful)
└─ Empty state with message
```

---

## Search/Filter Logic

```
User Types in Search Box:
"Expiring Drug 1"
         ↓
searchText State Updates
         ↓
filteredExpiryAlerts useMemo Computes:
         ↓
├─ Get current alerts.expiryAlerts
├─ Lowercase search: "expiring drug 1"
├─ Filter each alert:
│  ├─ Check alert.name.includes(search)
│  ├─ Check alert.batchNo.includes(search)  ✓ Field fallback!
│  ├─ Check alert.batchNumber.includes(search)
│  └─ Include if ANY match
└─ Return filtered results
         ↓
Render Only Matching Items
```

---

## Test Data Coverage Map

```
DATABASE STATE:
drug_inventory (MongoDB)
├─ Drugs Collection (14 docs)
│  ├─ Normal drugs: 5
│  │  └─ ID: Drug001 → Drug005
│  ├─ Low stock drugs: 3
│  │  └─ ID: LowDrug001 → LowDrug003
│  ├─ Expiring soon: 4
│  │  └─ ID: ExpDrug001 → ExpDrug004
│  └─ Already expired: 2
│     └─ ID: OldDrug001 → OldDrug002
│
├─ Inventory Collection (17 docs)
│  ├─ Normal inventory: 5
│  ├─ Low stock items: 3 (quantity < 10)
│  ├─ Expiring drug stock: 4
│  └─ Expired drug stock: 2
│     └─ Location: "TEST_WAREHOUSE"
│
└─ Scanlog Collection (2 docs)
   ├─ Transit Delay 1 → 150 min (allowed 120)
   └─ Transit Delay 2 → 150 min (allowed 120)

API SHOULD RETURN:
✓ totalDrugs: 14
✓ lowStockCount: 3
✓ expiredCount: 2
✓ expiryAlerts: 4
✓ lowStockAlerts: 3
✓ securityTransitAlerts: 2
✓ totalAlerts: 9
```

---

## Validation Matrix

| Data Point | Type | Validation | Expected |
|------------|------|-----------|----------|
| totalDrugs | number | >= 0, integer | 14 |
| lowStockCount | number | >= 0, integer | 3 |
| expiredCount | number | >= 0, integer | 2 |
| expiryAlert.name | string | non-empty | "Expiring Drug 1" |
| expiryAlert.batchNo | string | exists | "EXP-BATCH-3001" |
| lowStockAlert.quantity | number | > 0, < 10 | 4, 5, 6 |
| transitAlert.bleId | string | non-empty | "BLE-DEVICE-5001" |
| response.success | boolean | true | true |

---

## Performance Profile

```
┌──────────────────────────────────┐
│ Timeline for Complete Dashboard  │
├──────────────────────────────────┤
│                                  │
│ Component Mount        ═ 0ms    │
│                                  │
│ handleRefresh Called   ═ 1ms    │
│ └─ setPageLoading(true)         │
│                                  │
│ API Request Sent       ═ 2ms    │
│ ├─ Stats Request ═══════════     │
│ │  (50-200ms)                    │
│ │                                │
│ └─ Alerts Request ════════════    │
│    (100-300ms)                   │
│                                  │
│ Both Complete          ═ 300ms   │
│ ├─ setStats()                    │
│ ├─ setAlerts()                   │
│ └─ setPageLoading(false)         │
│                                  │
│ Component Re-render    ═ 350ms   │
│                                  │
│ User Sees Data         ═ 400ms   │
│                                  │
│ Total Time: ~400ms               │
│                                  │
└──────────────────────────────────┘
```

---

## Integration Points

```
Dashboard Component ↔ useApi Hook
         ↓                ↓
    Calls request()  Creates Axios Instance
         ↓                ↓
    HTTP Layer (Fetch)   Token Management
         ↓                ↓
Express Backend ←────────┐
    ↓                    │
Dashboard Routes ────────┤
    ↓                    │
Dashboard Controller ────┤
    ↓                    │
Validation Utility ──────┤
    ↓                    │
MongoDB Queries ─────────┘
    ↓
Database Documents
```

---

**Last Updated**: 2026-04-27
**Version**: 1.0
**Status**: ✅ Complete
