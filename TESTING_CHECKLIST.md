# 📋 Dashboard E2E Test Checklist

## 🎯 Pre-Testing Setup

- [ ] MongoDB is running
  - Command: `mongosh` (should connect successfully)
  
- [ ] Backend dependencies installed
  - Command: `cd backend && npm install`
  
- [ ] Frontend dependencies installed
  - Command: `cd client && npm install`
  
- [ ] `.env` files configured with MONGO_URI
  - Check: `cat backend/.env | grep MONGO_URI`

---

## 🌱 Phase 1: Test Data Seeding

### Command
```bash
cd backend
node scripts/seed_test_data.js
```

### ✅ Expected Results
- [ ] Connected to MongoDB
- [ ] Test collections cleared
- [ ] 14 normal drugs created
- [ ] 3 low stock items created (quantity < 10)
- [ ] 4 expiring drugs created (within 30 days)
- [ ] 2 already expired drugs created
- [ ] 2 transit delay scenarios created

### ✅ Database Verification
```bash
mongosh
use drug_inventory

# Check drug count
db.drugs.countDocuments({manufacturer: "TEST_MANUFACTURER"})
# Expected: 14

# Check inventory with low stock
db.inventories.countDocuments({quantity: {$lt: 10}})
# Expected: 3

# Check expired drugs
db.drugs.countDocuments({expiryDate: {$lt: new Date()}})
# Expected: 2
```

---

## 🚀 Phase 2: Backend API Testing

### Prerequisites
- [ ] Backend server running on port 5000
  - Command: `cd backend && npm start`
  - Check: Server logs show "✅ Server running on port 5000"

### Run Tests
```bash
cd backend
node scripts/test_dashboard_e2e.js
```

### TEST 1: Stats Endpoint (/api/admin/dashboard/stats)

**Endpoint Details:**
```
GET http://localhost:5000/api/admin/dashboard/stats
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalDrugs": 14,
    "lowStockCount": 3,
    "expiredCount": 2
  }
}
```

**Validation Checks:**
- [ ] Response status code: 200
- [ ] `success` = true
- [ ] `totalDrugs` is number >= 0
- [ ] `lowStockCount` is number >= 0
- [ ] `expiredCount` is number >= 0
- [ ] Response time < 2000ms

**Manual cURL Test:**
```bash
curl http://localhost:5000/api/admin/dashboard/stats | jq .
```

---

### TEST 2: Alerts Endpoint (/api/admin/dashboard/alerts)

**Endpoint Details:**
```
GET http://localhost:5000/api/admin/dashboard/alerts
```

**Expected Response Structure:**
```json
{
  "success": true,
  "data": {
    "expiryAlerts": [
      {
        "_id": "...",
        "name": "Expiring Drug 1",
        "batchNumber": "EXP-BATCH-3001",
        "batchNo": "EXP-BATCH-3001",
        "expiryDate": "2026-05-10T..."
      }
    ],
    "lowStockAlerts": [
      {
        "_id": "...",
        "drugId": { "name": "Low Stock Drug 1" },
        "quantity": 4,
        "threshold": 20,
        "warehouseLocation": "TEST_WAREHOUSE"
      }
    ],
    "securityTransitAlerts": [
      {
        "id": "...",
        "bleId": "BLE-DEVICE-5001",
        "stage": "DISTRIBUTOR_TO_WAREHOUSE",
        "alertCodes": ["TRANSIT_TIME_EXCEEDED"],
        "elapsedMinutes": 150,
        "allowedMinutes": 120
      }
    ],
    "totalAlerts": 9
  }
}
```

**Validation Checks:**
- [ ] Response status code: 200
- [ ] `success` = true
- [ ] `expiryAlerts` is array with 4+ items
- [ ] `lowStockAlerts` is array with 3+ items
- [ ] `securityTransitAlerts` is array with 2+ items
- [ ] Each alert has required fields
- [ ] `totalAlerts` = sum of all alert arrays
- [ ] Response time < 2000ms

**Manual cURL Test:**
```bash
curl http://localhost:5000/api/admin/dashboard/alerts | jq '.data | keys'
```

---

### TEST 3: Data Integrity

**Validation Checks:**
- [ ] `expiredCount` ≤ `totalDrugs`
  - Verify: 2 ≤ 14 ✓
  
- [ ] `lowStockCount` ≤ `totalDrugs`
  - Verify: 3 ≤ 14 ✓
  
- [ ] `totalAlerts` = expiryAlerts.length + lowStockAlerts.length + securityTransitAlerts.length
  - Verify: 9 = 4 + 3 + 2 ✓

---

### TEST 4: Response Performance

**Expected Response Times:**

| Endpoint | Expected | Max |
|----------|----------|-----|
| /stats | 50-200ms | 2000ms |
| /alerts | 100-300ms | 2000ms |

**Measure with curl:**
```bash
curl -w "Time: %{time_total}s\n" http://localhost:5000/api/admin/dashboard/stats
curl -w "Time: %{time_total}s\n" http://localhost:5000/api/admin/dashboard/alerts
```

---

## 💻 Phase 3: Frontend Component Testing

### Prerequisites
- [ ] Frontend dependencies installed: `cd client && npm install`
- [ ] React testing library installed
- [ ] Jest configured

### Run Frontend Tests
```bash
cd client
npm test -- Dashboard.test.jsx
```

### Expected Test Results
All 11 tests should pass:

```
✓ Dashboard loads and displays initial loading state
✓ Dashboard successfully fetches stats data
✓ Dashboard successfully fetches alerts data
✓ Dashboard displays expiry alerts correctly
✓ Dashboard handles low stock alerts with fallback to populated field names
✓ Dashboard filters expiry alerts by search text
✓ Dashboard refreshes data on manual refresh
✓ Dashboard handles API errors gracefully
✓ Dashboard displays empty states when no alerts exist
✓ Dashboard handles concurrent API calls correctly
✓ Dashboard uses validation for stats data
```

**Validation Checks:**
- [ ] All tests pass (11/11)
- [ ] No console errors
- [ ] No warnings about missing dependencies
- [ ] Code coverage > 80%

---

## 👁️ Phase 4: Manual UI Testing

### Prerequisites
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173/5174
- [ ] Browser DevTools open (F12)

### Setup
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd client && npm run dev`
3. Open browser: `http://localhost:5173`
4. Login as WAREHOUSE_ADMIN role

### Dashboard Display Checks

**Stat Cards:**
- [ ] "Total Drugs" card shows: 14
- [ ] "Low Stock" card shows: 3
- [ ] "Expired" card shows: 2
- [ ] Cards have icons and styling
- [ ] Cards display trend indicators
- [ ] Mini charts render (if applicable)

**Expiry Alerts Section:**
- [ ] Title shows: "Expiring Soon (30 days)" or similar
- [ ] Shows 4 items:
  - [ ] Expiring Drug 1 (EXP-BATCH-3001)
  - [ ] Expiring Drug 2 (EXP-BATCH-3002)
  - [ ] Expiring Drug 3 (EXP-BATCH-3003)
  - [ ] Expiring Drug 4 (EXP-BATCH-3004)
- [ ] Each item shows:
  - [ ] Drug name
  - [ ] Batch number (handles both batchNumber and batchNo)
  - [ ] Expiry date
  - [ ] Days until expiry
- [ ] Alerts are color-coded (red = urgent, yellow = warning)

**Low Stock Alerts Section:**
- [ ] Title shows: "Low Stock Items"
- [ ] Shows 3 items:
  - [ ] Low Stock Drug 1 (quantity: 4)
  - [ ] Low Stock Drug 2 (quantity: 5)
  - [ ] Low Stock Drug 3 (quantity: 6)
- [ ] Each item shows:
  - [ ] Drug name
  - [ ] Current quantity
  - [ ] Warehouse location
- [ ] Visual indicator for low stock status

**Transit Alerts Section** (if displayed):
- [ ] Shows 2 items with delayed shipments
- [ ] Each shows:
  - [ ] BLE device ID
  - [ ] Route stage
  - [ ] Delay duration
  - [ ] Traffic condition

---

### Interactive Feature Tests

**Search/Filter Functionality:**
- [ ] Click search box
- [ ] Type drug name: "Expiring Drug 1"
- [ ] Results filter to show only matching drugs
- [ ] Clear search: results show all drugs again

**Refresh Button:**
- [ ] Click refresh icon
- [ ] Loading indicator appears (briefly)
- [ ] Stats update (even if same values)
- [ ] Timestamp updates to current time
- [ ] Network tab shows new API calls

**Responsive Design:**
- [ ] All elements fit on desktop (1920x1080)
- [ ] Elements stack properly on tablet (768x1024)
- [ ] Touch targets are large enough (min 44x44px)
- [ ] No horizontal scrolling needed

---

### Error Handling Tests

**Network Error Simulation:**
1. Open DevTools Network tab
2. Set throttling to "Offline"
3. Refresh dashboard
- [ ] Error message displays gracefully
- [ ] UI doesn't crash
- [ ] User can retry

**Invalid Data Handling:**
1. Modify API response in DevTools (simulate bad data)
2. Verify component handles gracefully:
- [ ] No JavaScript errors in console
- [ ] Fallback UI displays
- [ ] User sees helpful message

---

## 📊 Phase 5: Performance & Load Testing

### Browser DevTools Analysis

1. Open DevTools → Performance tab
2. Record dashboard load:

**Expected Metrics:**
- [ ] First Contentful Paint (FCP): < 2s
- [ ] Largest Contentful Paint (LCP): < 3s
- [ ] Cumulative Layout Shift (CLS): < 0.1
- [ ] Time to Interactive (TTI): < 4s

3. Network tab analysis:
- [ ] /stats API call: < 500ms
- [ ] /alerts API call: < 500ms
- [ ] Total assets: < 2MB
- [ ] No failed requests

4. Memory tab:
- [ ] No memory leaks after 5 refresh cycles
- [ ] Memory stable at ~50-100MB

---

## ✅ Final Verification Checklist

### All Systems
- [ ] Test data properly seeded
- [ ] Database contains expected records
- [ ] All 14 drugs visible in database
- [ ] All 3 low stock items in inventory
- [ ] All 2 expired drugs in database

### Backend APIs
- [ ] Stats endpoint returns correct counts
- [ ] Alerts endpoint returns all alert types
- [ ] Response times within performance budgets
- [ ] Data validation prevents invalid responses
- [ ] Error handling works for edge cases

### Frontend Component
- [ ] All 11 unit tests pass
- [ ] Dashboard displays stats correctly
- [ ] All alert types display
- [ ] Search/filter functionality works
- [ ] Refresh updates data
- [ ] Error handling graceful
- [ ] Performance metrics met

### Manual Testing
- [ ] Dashboard loads without errors
- [ ] All stat cards show correct values
- [ ] All alert lists display
- [ ] Interactive features work
- [ ] Responsive design works
- [ ] No console errors (F12)
- [ ] No network failures

---

## 🎯 Success Criteria

✅ **PASS** if:
- All automated tests pass (API + Frontend)
- Manual dashboard displays all data correctly
- Performance within acceptable ranges
- No critical console errors
- User can interact smoothly with dashboard

❌ **FAIL** if:
- Any automated test fails
- Dashboard doesn't display data
- Performance exceeds thresholds
- Critical JavaScript errors
- User cannot interact with dashboard

---

## 📝 Test Report Template

```
Dashboard E2E Test Report
========================
Date: [DATE]
Tester: [NAME]
Environment: [DEV/STAGING/PROD]

Test Results:
- Automated Tests: [PASS/FAIL] - X/Y tests passed
- Frontend Tests: [PASS/FAIL] - X/Y tests passed
- Manual UI Tests: [PASS/FAIL]
- Performance Tests: [PASS/FAIL]

Issues Found:
1. [Description and severity]
2. [Description and severity]

Recommendations:
- [Recommendation 1]
- [Recommendation 2]

Overall Status: [✅ APPROVED / ⚠️ NEEDS FIXES]
```

---

## 🔄 Regression Testing

Run this checklist every time code is modified:

- [ ] Seed fresh test data
- [ ] Run API tests (must pass)
- [ ] Run frontend tests (must pass)
- [ ] Quick manual UI check (5 min)
- [ ] Check browser console for errors
- [ ] Verify no performance regression

---

## 📞 Support & Debugging

See [E2E_TESTING_GUIDE.md](E2E_TESTING_GUIDE.md) for detailed troubleshooting steps.

