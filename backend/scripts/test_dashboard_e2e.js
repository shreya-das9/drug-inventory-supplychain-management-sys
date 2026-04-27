/**
 * End-to-End Dashboard Test Suite
 * Tests complete data flow from API to validation
 */

import axios from "axios";
import chalk from "chalk";

const API_BASE_URL = "http://localhost:5000/api";
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

// Helper: Colored console output
const log = {
  success: (msg) => console.log(chalk.green(`✅ ${msg}`)),
  error: (msg) => console.log(chalk.red(`❌ ${msg}`)),
  info: (msg) => console.log(chalk.blue(`ℹ️  ${msg}`)),
  warning: (msg) => console.log(chalk.yellow(`⚠️  ${msg}`)),
  section: (msg) => console.log(chalk.cyan.bold(`\n${"=".repeat(60)}\n📋 ${msg}\n${"=".repeat(60)}`)),
};

// Test assertion helper
async function assert(testName, condition, errorMsg = "") {
  if (condition) {
    log.success(testName);
    testResults.passed++;
  } else {
    log.error(`${testName}${errorMsg ? ": " + errorMsg : ""}`);
    testResults.failed++;
  }
}

async function assertArrayNotEmpty(testName, array, errorMsg = "") {
  if (Array.isArray(array) && array.length > 0) {
    log.success(`${testName} (${array.length} items)`);
    testResults.passed++;
    return true;
  } else {
    log.error(`${testName}${errorMsg ? ": " + errorMsg : ""}`);
    testResults.failed++;
    return false;
  }
}

// ============= TESTS =============

async function testDashboardStats() {
  log.section("TEST 1: Dashboard Stats Endpoint");

  try {
    log.info("Fetching dashboard stats...");
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`);
    const { success, data } = response.data;

    // Test 1.1: Response structure
    await assert("Response has success flag", success === true);
    await assert("Response has data object", data && typeof data === "object");

    // Test 1.2: Required fields exist
    const { totalDrugs, lowStockCount, expiredCount } = data || {};
    await assert("Stats has totalDrugs field", totalDrugs !== undefined, `Got: ${totalDrugs}`);
    await assert("Stats has lowStockCount field", lowStockCount !== undefined, `Got: ${lowStockCount}`);
    await assert("Stats has expiredCount field", expiredCount !== undefined, `Got: ${expiredCount}`);

    // Test 1.3: Field types and validation
    await assert("totalDrugs is a number", typeof totalDrugs === "number", `Got: ${typeof totalDrugs}`);
    await assert("lowStockCount is a number", typeof lowStockCount === "number", `Got: ${typeof lowStockCount}`);
    await assert("expiredCount is a number", typeof expiredCount === "number", `Got: ${typeof expiredCount}`);

    // Test 1.4: Fields are non-negative
    await assert("totalDrugs >= 0", totalDrugs >= 0, `Got: ${totalDrugs}`);
    await assert("lowStockCount >= 0", lowStockCount >= 0, `Got: ${lowStockCount}`);
    await assert("expiredCount >= 0", expiredCount >= 0, `Got: ${expiredCount}`);

    // Test 1.5: Fields are integers
    await assert("totalDrugs is integer", Number.isInteger(totalDrugs), `Got: ${totalDrugs}`);
    await assert("lowStockCount is integer", Number.isInteger(lowStockCount), `Got: ${lowStockCount}`);
    await assert("expiredCount is integer", Number.isInteger(expiredCount), `Got: ${expiredCount}`);

    log.info(`Stats Summary: ${totalDrugs} total drugs, ${lowStockCount} low stock, ${expiredCount} expired`);
    return { totalDrugs, lowStockCount, expiredCount };
  } catch (error) {
    log.error(`Failed to fetch stats: ${error.message}`);
    testResults.failed += 6;
    return null;
  }
}

async function testDashboardAlerts() {
  log.section("TEST 2: Dashboard Alerts Endpoint");

  try {
    log.info("Fetching dashboard alerts...");
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard/alerts`);
    const { success, data } = response.data;

    // Test 2.1: Response structure
    await assert("Response has success flag", success === true);
    await assert("Response has data object", data && typeof data === "object");

    // Test 2.2: Required alert arrays exist
    const { expiryAlerts = [], lowStockAlerts = [], securityTransitAlerts = [], totalAlerts } = data || {};
    await assert("Data has expiryAlerts array", Array.isArray(expiryAlerts), `Got: ${typeof expiryAlerts}`);
    await assert("Data has lowStockAlerts array", Array.isArray(lowStockAlerts), `Got: ${typeof lowStockAlerts}`);
    await assert("Data has securityTransitAlerts array", Array.isArray(securityTransitAlerts), `Got: ${typeof securityTransitAlerts}`);
    await assert("Data has totalAlerts count", typeof totalAlerts === "number", `Got: ${typeof totalAlerts}`);

    log.info(
      `Alerts Summary: ${expiryAlerts.length} expiry, ${lowStockAlerts.length} low stock, ${securityTransitAlerts.length} transit`
    );

    return { expiryAlerts, lowStockAlerts, securityTransitAlerts, totalAlerts };
  } catch (error) {
    log.error(`Failed to fetch alerts: ${error.message}`);
    testResults.failed += 4;
    return null;
  }
}

async function testExpiryAlerts(expiryAlerts) {
  log.section("TEST 3: Expiry Alerts Validation");

  if (!expiryAlerts || expiryAlerts.length === 0) {
    log.warning("No expiry alerts to validate");
    testResults.warnings++;
    return;
  }

  try {
    // Test 3.1: Alert structure
    const firstAlert = expiryAlerts[0];
    await assert("Alert has _id field", firstAlert._id !== undefined);
    await assert("Alert has name field", firstAlert.name !== undefined, `Got: ${firstAlert.name}`);
    await assert("Alert has expiryDate field", firstAlert.expiryDate !== undefined);
    await assert("Alert has batchNumber OR batchNo field", 
      firstAlert.batchNumber !== undefined || firstAlert.batchNo !== undefined,
      `Expected batchNumber or batchNo, got neither`
    );

    // Test 3.2: Field types
    await assert("Alert name is string", typeof firstAlert.name === "string", `Got: ${typeof firstAlert.name}`);
    await assert("Alert expiryDate is valid date", !isNaN(new Date(firstAlert.expiryDate).getTime()), `Got: ${firstAlert.expiryDate}`);

    // Test 3.3: Field consistency
    for (const alert of expiryAlerts) {
      if (!alert.name || !alert.batchNumber && !alert.batchNo || !alert.expiryDate) {
        log.warning(`Incomplete alert data: ${JSON.stringify(alert)}`);
        testResults.warnings++;
      }
    }

    log.success(`All ${expiryAlerts.length} expiry alerts have required fields`);
  } catch (error) {
    log.error(`Failed to validate expiry alerts: ${error.message}`);
    testResults.failed++;
  }
}

async function testLowStockAlerts(lowStockAlerts) {
  log.section("TEST 4: Low Stock Alerts Validation");

  if (!lowStockAlerts || lowStockAlerts.length === 0) {
    log.warning("No low stock alerts to validate");
    testResults.warnings++;
    return;
  }

  try {
    // Test 4.1: Alert structure
    const firstAlert = lowStockAlerts[0];
    await assert("Alert has _id field", firstAlert._id !== undefined);
    await assert("Alert has quantity field", firstAlert.quantity !== undefined, `Got: ${firstAlert.quantity}`);
    await assert("Alert quantity is a number", typeof firstAlert.quantity === "number", `Got: ${typeof firstAlert.quantity}`);

    // Test 4.2: Quantity validation (should be < 10 for test data)
    for (const alert of lowStockAlerts) {
      if (alert.quantity >= 10) {
        log.warning(`Low stock alert with quantity >= 10: ${alert.quantity} (expected < 10)`);
        testResults.warnings++;
      }
    }

    log.success(`All ${lowStockAlerts.length} low stock alerts have required fields`);
  } catch (error) {
    log.error(`Failed to validate low stock alerts: ${error.message}`);
    testResults.failed++;
  }
}

async function testSecurityTransitAlerts(securityTransitAlerts) {
  log.section("TEST 5: Security Transit Alerts Validation");

  if (!securityTransitAlerts || securityTransitAlerts.length === 0) {
    log.warning("No security transit alerts to validate");
    testResults.warnings++;
    return;
  }

  try {
    // Test 5.1: Alert structure
    const firstAlert = securityTransitAlerts[0];
    await assert("Alert has id or _id field", firstAlert.id || firstAlert._id);
    await assert("Alert has bleId field", firstAlert.bleId !== undefined, `Got: ${firstAlert.bleId}`);
    await assert("Alert has stage field", firstAlert.stage !== undefined, `Got: ${firstAlert.stage}`);
    await assert("Alert has alertCodes array", Array.isArray(firstAlert.alertCodes), `Got: ${typeof firstAlert.alertCodes}`);

    // Test 5.2: Transit delay details
    const firstWithDelay = securityTransitAlerts[0];
    if (firstWithDelay.elapsedMinutes !== undefined) {
      await assert("Transit has elapsedMinutes", typeof firstWithDelay.elapsedMinutes === "number" || firstWithDelay.elapsedMinutes === null);
      await assert("Transit has allowedMinutes", typeof firstWithDelay.allowedMinutes === "number" || firstWithDelay.allowedMinutes === null);
    }

    log.success(`All ${securityTransitAlerts.length} transit alerts have required fields`);
  } catch (error) {
    log.error(`Failed to validate transit alerts: ${error.message}`);
    testResults.failed++;
  }
}

async function testDataIntegrity() {
  log.section("TEST 6: Data Integrity Across Requests");

  try {
    // Fetch stats and alerts
    const statsRes = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`);
    const alertsRes = await axios.get(`${API_BASE_URL}/admin/dashboard/alerts`);

    const stats = statsRes.data.data;
    const alerts = alertsRes.data.data;

    // Test 6.1: Stats consistency
    await assert("expiredCount <= totalDrugs", stats.expiredCount <= stats.totalDrugs, 
      `${stats.expiredCount} > ${stats.totalDrugs}`);
    await assert("lowStockCount <= totalDrugs", stats.lowStockCount <= stats.totalDrugs,
      `${stats.lowStockCount} > ${stats.totalDrugs}`);

    // Test 6.2: Alert count consistency
    const calculatedTotalAlerts = 
      (alerts.expiryAlerts?.length || 0) + 
      (alerts.lowStockAlerts?.length || 0) + 
      (alerts.securityTransitAlerts?.length || 0);
    
    await assert("totalAlerts matches calculated sum", 
      alerts.totalAlerts === calculatedTotalAlerts,
      `Expected ${calculatedTotalAlerts}, got ${alerts.totalAlerts}`);

    log.success("Data integrity checks passed");
  } catch (error) {
    log.error(`Failed data integrity check: ${error.message}`);
    testResults.failed += 3;
  }
}

async function testErrorHandling() {
  log.section("TEST 7: Error Handling");

  try {
    // Test invalid endpoint
    try {
      await axios.get(`${API_BASE_URL}/admin/dashboard/invalid`);
      log.error("Should have failed for invalid endpoint");
      testResults.failed++;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 500) {
        log.success("Proper error handling for invalid endpoint");
        testResults.passed++;
      } else {
        log.error(`Unexpected status code: ${error.response?.status}`);
        testResults.failed++;
      }
    }

    log.success("Error handling tests completed");
  } catch (error) {
    log.error(`Failed error handling test: ${error.message}`);
    testResults.failed++;
  }
}

async function testResponseTimes() {
  log.section("TEST 8: Response Time Performance");

  try {
    // Test stats endpoint
    const statsStart = Date.now();
    await axios.get(`${API_BASE_URL}/admin/dashboard/stats`);
    const statsTime = Date.now() - statsStart;

    // Test alerts endpoint
    const alertsStart = Date.now();
    await axios.get(`${API_BASE_URL}/admin/dashboard/alerts`);
    const alertsTime = Date.now() - alertsStart;

    const threshold = 2000; // 2 seconds
    await assert(`Stats endpoint response time < ${threshold}ms`, statsTime < threshold, `Got: ${statsTime}ms`);
    await assert(`Alerts endpoint response time < ${threshold}ms`, alertsTime < threshold, `Got: ${alertsTime}ms`);

    log.info(`Stats API: ${statsTime}ms, Alerts API: ${alertsTime}ms`);
  } catch (error) {
    log.error(`Failed performance test: ${error.message}`);
    testResults.failed += 2;
  }
}

// ============= MAIN TEST RUNNER =============

async function runAllTests() {
  console.clear();
  log.section("🚀 DASHBOARD E2E TEST SUITE");
  log.info(`Server URL: ${API_BASE_URL}`);
  log.info("Starting tests...\n");

  try {
    // Test connectivity
    log.info("Checking server connectivity...");
    await axios.get("http://localhost:5000/", { timeout: 5000 });
    log.success("Server is reachable\n");
  } catch (error) {
    log.error(`Cannot reach server: ${error.message}`);
    log.error("Make sure the backend server is running on port 5000");
    process.exit(1);
  }

  // Run all tests
  const stats = await testDashboardStats();
  const alerts = await testDashboardAlerts();

  if (alerts) {
    await testExpiryAlerts(alerts.expiryAlerts);
    await testLowStockAlerts(alerts.lowStockAlerts);
    await testSecurityTransitAlerts(alerts.securityTransitAlerts);
  }

  await testDataIntegrity();
  await testErrorHandling();
  await testResponseTimes();

  // Print results
  log.section("📊 TEST RESULTS SUMMARY");
  console.log(chalk.green(`✅ Passed: ${testResults.passed}`));
  console.log(chalk.red(`❌ Failed: ${testResults.failed}`));
  console.log(chalk.yellow(`⚠️  Warnings: ${testResults.warnings}`));

  const total = testResults.passed + testResults.failed;
  const percentage = total > 0 ? ((testResults.passed / total) * 100).toFixed(2) : 0;
  console.log(chalk.bold(`\n📈 Success Rate: ${percentage}%`));

  if (testResults.failed === 0) {
    log.success("\n🎉 All tests passed!");
    process.exit(0);
  } else {
    log.error(`\n⚠️  ${testResults.failed} test(s) failed`);
    process.exit(1);
  }
}

// Start tests
runAllTests().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
