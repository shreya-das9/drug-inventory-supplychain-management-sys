# 🚀 End-to-End Dashboard Testing Guide

Complete guide to test the drug inventory dashboard data flows from API to frontend.

## 📋 Overview

This testing suite validates:
- ✅ API endpoint response structure and validation
- ✅ Required fields presence and types
- ✅ Data integrity across requests
- ✅ Frontend data fetching and display
- ✅ Error handling and edge cases
- ✅ Performance and response times

---

## 🛠️ Prerequisites

Ensure you have:
- MongoDB running locally or configured via `.env`
- Backend server dependencies installed (`npm install` in `/backend`)
- Frontend dependencies installed (`npm install` in `/client`)
- Backend running on port 5000
- Frontend running on port 5173/5174

---

## 📊 Step-by-Step Testing

### Step 1️⃣ : Seed Test Data

This creates sample drugs, inventory items, and alerts for comprehensive testing.

```bash
cd backend
node scripts/seed_test_data.js
```

**Expected Output:**
```
✅ Connected to MongoDB
🧹 Clearing test collections...
📦 Creating normal drugs...
✅ Created 5 normal drugs
📉 Creating low stock scenarios...
✅ Created 3 low stock scenarios
⏰ Creating expiring drug scenarios...
✅ Created 4 expiring drug scenarios
💀 Creating already expired scenarios...
✅ Created 2 already expired scenarios
🚚 Creating transit delay scenarios...
✅ Created transit delay scenarios

============================================================
📊 TEST DATA SEED SUMMARY
============================================================
✅ Total Drugs: 14
✅ Low Stock Items: 3
✅ Expired Drugs: 2
✅ Expiring Soon (30 days): 4
✅ Transit Alerts: 2
============================================================
```

**What this creates:**
- **14 total drugs** (5 normal + 3 low stock + 4 expiring + 2 expired)
- **3 low stock items** (quantity < 10)
- **2 already expired drugs**
- **4 expiring soon** (within 30 days)
- **2 transit delay alerts**

---

### Step 2️⃣ : Start Backend Server

```bash
cd backend
npm start
```

**Expected Output:**
```
✅ MongoDB Connected
✅ Auth routes loaded
✅ Dashboard routes loaded
✅ Drugs routes loaded
✅ Inventory routes loaded
✅ Suppliers routes loaded
✅ Shipments routes loaded
✅ Orders routes loaded
✅ Server running on port 5000
```

---

### Step 3️⃣ : Run API Endpoint Tests

Tests all dashboard API endpoints and validates responses.

```bash
cd backend
node scripts/test_dashboard_e2e.js
```

**What it tests:**

#### TEST 1: Dashboard Stats Endpoint
- ✅ Response has success flag
- ✅ Response has data object with stats
- ✅ All required fields exist (totalDrugs, lowStockCount, expiredCount)
- ✅ All fields are valid numbers
- ✅ All fields are non-negative
- ✅ All fields are integers

Expected values (from seeded data):
- `totalDrugs: 14`
- `lowStockCount: 3` 
- `expiredCount: 2`

#### TEST 2: Dashboard Alerts Endpoint
- ✅ Response has success flag
- ✅ Response has data object
- ✅ Has expiryAlerts array
- ✅ Has lowStockAlerts array
- ✅ Has securityTransitAlerts array
- ✅ Has totalAlerts count

Expected values:
- `expiryAlerts: 4` (drugs expiring within 30 days)
- `lowStockAlerts: 3` (items with quantity < 10)
- `securityTransitAlerts: 2` (transit delays)
- `totalAlerts: 9`

#### TEST 3: Expiry Alerts Validation
- ✅ Each alert has required fields (_id, name, expiryDate, batchNumber/batchNo)
- ✅ Alert names are strings
- ✅ Expiry dates are valid
- ✅ All data is complete and not null

#### TEST 4: Low Stock Alerts Validation
- ✅ Each alert has required fields (_id, quantity)
- ✅ Quantity is a number
- ✅ Quantity < 10 threshold

#### TEST 5: Security Transit Alerts Validation
- ✅ Each alert has required fields (id, bleId, stage, alertCodes)
- ✅ Transit delay details are present
- ✅ All fields are valid types

#### TEST 6: Data Integrity
- ✅ `expiredCount <= totalDrugs`
- ✅ `lowStockCount <= totalDrugs`
- ✅ `totalAlerts` matches sum of all alert arrays

#### TEST 7: Error Handling
- ✅ Invalid endpoints return 404 or 500
- ✅ Proper error response format

#### TEST 8: Response Times
- ✅ Stats endpoint responds in < 2000ms
- ✅ Alerts endpoint responds in < 2000ms

**Expected Output:**
```
============================================================
📋 DASHBOARD E2E TEST SUITE
============================================================
ℹ️  Server URL: http://localhost:5000/api
ℹ️  Starting tests...

✅ Server is reachable

============================================================
📋 TEST 1: Dashboard Stats Endpoint
============================================================
ℹ️  Fetching dashboard stats...
✅ Response has success flag
✅ Response has data object
✅ Stats has totalDrugs field
✅ Stats has lowStockCount field
✅ Stats has expiredCount field
✅ totalDrugs is a number
✅ lowStockCount is a number
✅ expiredCount is a number
✅ totalDrugs >= 0
✅ lowStockCount >= 0
✅ expiredCount >= 0
✅ totalDrugs is integer
✅ lowStockCount is integer
✅ expiredCount is integer
ℹ️  Stats Summary: 14 total drugs, 3 low stock, 2 expired

[... continues for TEST 2-8 ...]

============================================================
📊 TEST RESULTS SUMMARY
============================================================
✅ Passed: 50+
❌ Failed: 0
⚠️  Warnings: 0

📈 Success Rate: 100%

🎉 All tests passed!
```

---

### Step 4️⃣ : Start Frontend Development Server

```bash
cd client
npm run dev
```

**Expected Output:**
```
✅ VITE v5.0.0 ready in 1234 ms

➜  Local:   http://localhost:5173
```

---

### Step 5️⃣ : Run Frontend Component Tests

Tests that the warehouse dashboard component correctly displays API data.

```bash
cd client
npm test -- Dashboard.test.jsx
```

**What it tests:**

1. ✅ Dashboard loads with initial loading state
2. ✅ Stats data fetches successfully
3. ✅ Alerts data fetches successfully
4. ✅ Expiry alerts display correctly
5. ✅ Low stock alerts display correctly
6. ✅ Search/filter works on alerts
7. ✅ Manual refresh updates data
8. ✅ API errors handled gracefully
9. ✅ Empty states handled
10. ✅ Concurrent API calls work
11. ✅ Invalid data handled gracefully

**Expected Output:**
```
PASS  src/pages/warehouse/Dashboard.test.jsx
  Warehouse Dashboard E2E Tests
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

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

---

### Step 6️⃣ : Manual End-to-End Flow Testing

1. **Open Browser**: Navigate to `http://localhost:5173` (or 5174)
2. **Login**: Use appropriate credentials for WAREHOUSE_ADMIN role
3. **View Dashboard**: Warehouse staff should see:
   - ✅ Total Drugs: 14
   - ✅ Low Stock: 3
   - ✅ Expired: 2
   - ✅ Expiry Alerts: List of 4 drugs expiring soon with batch numbers
   - ✅ Low Stock Alerts: List of 3 items below threshold
   - ✅ Transit Alerts: List of 2 delayed shipments

4. **Test Refresh Button**: Click refresh and verify data updates
5. **Test Search**: Search for drug names and verify filtering works
6. **Verify Field Mapping**: Ensure batchNumber displays as "batchNo" in UI

---

## 🔍 Data Flow Diagram

```
[MongoDB] 
    ↓
[Seed Script] → Creates test data
    ↓
[Backend API]
    ├→ GET /api/admin/dashboard/stats
    │  └→ Returns: {totalDrugs, lowStockCount, expiredCount}
    ├→ GET /api/admin/dashboard/alerts
    │  └→ Returns: {expiryAlerts[], lowStockAlerts[], securityTransitAlerts[]}
    ↓
[Validation Utility] → Validates all fields
    ↓
[Frontend Component]
    ├→ useApi hook fetches data
    ├→ State updates with stats & alerts
    ├→ Renders stat cards & alert lists
    └→ Handles errors & empty states
    ↓
[UI Display]
    └→ User sees dashboard with all data
```

---

## ✅ Validation Checklist

### API Response Validation ✅
- [ ] Stats endpoint returns non-negative integers
- [ ] Alerts arrays contain valid objects
- [ ] All required fields are present
- [ ] No null or undefined values in critical fields
- [ ] Batch number field name consistency (batchNumber in DB → batchNo in response)

### Data Integrity ✅
- [ ] expiredCount ≤ totalDrugs
- [ ] lowStockCount ≤ totalDrugs
- [ ] Alert counts match calculated sum
- [ ] Inventory quantities are valid

### Frontend Display ✅
- [ ] Stats cards show correct numbers
- [ ] Expiry alerts list displays all items
- [ ] Low stock alerts list displays all items
- [ ] Transit alerts display correctly
- [ ] Search/filter functionality works
- [ ] Refresh button updates data
- [ ] Loading states handled
- [ ] Error messages displayed appropriately
- [ ] Empty states shown when no data

### Performance ✅
- [ ] Stats endpoint < 2000ms
- [ ] Alerts endpoint < 2000ms
- [ ] Frontend renders within 1 second
- [ ] No memory leaks during refresh cycles

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check MongoDB connection
mongosh

# Clear any stuck processes
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Seed data fails
```bash
# Verify MongoDB is running
mongosh

# Check MONGO_URI in .env
cat backend/.env | grep MONGO_URI

# Clear test data and retry
node scripts/seed_test_data.js
```

### API tests fail
```bash
# Check backend is running
curl http://localhost:5000/

# Verify routes are loaded
# Look for "✅ Dashboard routes loaded" in server logs

# Check database has seed data
mongosh
use drug_inventory
db.drugs.countDocuments({manufacturer: "TEST_MANUFACTURER"})
```

### Frontend tests fail
```bash
# Install dependencies
cd client
npm install

# Run with verbose output
npm test -- Dashboard.test.jsx --verbose
```

---

## 📈 Performance Benchmarks

Expected response times with seeded data:

| Endpoint | Expected Time | Max Threshold |
|----------|--------------|---------------|
| GET /stats | 50-200ms | 2000ms |
| GET /alerts | 100-300ms | 2000ms |
| Frontend render | 300-800ms | 1000ms |

---

## 🎯 Success Criteria

✅ **All tests pass** (API + Frontend + Manual)
✅ **No validation errors** in responses
✅ **Data integrity maintained** across requests
✅ **Performance within thresholds** for all endpoints
✅ **User can interact** with dashboard smoothly
✅ **Error handling** works gracefully

---

## 📞 Support

If you encounter issues:
1. Check server logs for errors
2. Verify MongoDB connection
3. Ensure all dependencies are installed
4. Clear browser cache and reload
5. Check console for frontend errors (F12)

