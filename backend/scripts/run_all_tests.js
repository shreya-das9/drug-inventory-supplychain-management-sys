#!/usr/bin/env node

/**
 * Quick Start: Run All Dashboard E2E Tests
 * This script:
 * 1. Seeds test data
 * 2. Waits for backend to be ready
 * 3. Runs all API tests
 * 4. Generates a test report
 */

import { spawn } from "child_process";
import axios from "axios";
import chalk from "chalk";

const log = {
  success: (msg) => console.log(chalk.green(`✅ ${msg}`)),
  error: (msg) => console.log(chalk.red(`❌ ${msg}`)),
  info: (msg) => console.log(chalk.blue(`ℹ️  ${msg}`)),
  section: (msg) => console.log(chalk.cyan.bold(`\n${"=".repeat(70)}\n🚀 ${msg}\n${"=".repeat(70)}\n`)),
};

async function checkServerHealth() {
  try {
    await axios.get("http://localhost:5000/", { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function waitForServer(maxAttempts = 30) {
  log.info("Waiting for backend server to be ready...");
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkServerHealth()) {
      log.success("Backend server is ready!");
      return true;
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

function runCommand(command, args, description) {
  return new Promise((resolve, reject) => {
    log.info(`${description}...`);
    const child = spawn(command, args, { stdio: "inherit", shell: true });
    child.on("close", (code) => {
      if (code === 0) {
        log.success(description);
        resolve();
      } else {
        log.error(`${description} failed with code ${code}`);
        reject(new Error(`${description} failed`));
      }
    });
    child.on("error", reject);
  });
}

async function main() {
  log.section("📊 DASHBOARD E2E TEST SUITE - AUTO RUN");

  try {
    // Step 1: Seed test data
    log.section("STEP 1: Seeding Test Data");
    await runCommand("node", ["backend/scripts/seed_test_data.js"], "Seeding test data");

    // Step 2: Check if server is running
    log.section("STEP 2: Checking Backend Server");
    const serverReady = await checkServerHealth();
    
    if (!serverReady) {
      log.warning("Backend server is not running on port 5000");
      log.info("Please start the backend server manually:");
      log.info("  cd backend && npm start");
      log.info("\nThen run the API tests manually:");
      log.info("  node backend/scripts/test_dashboard_e2e.js");
      process.exit(1);
    }

    // Step 3: Run API tests
    log.section("STEP 3: Running API Endpoint Tests");
    await runCommand("node", ["backend/scripts/test_dashboard_e2e.js"], "Running API tests");

    // Step 4: Summary
    log.section("✅ E2E TEST SUITE COMPLETED");
    log.success("All dashboard tests completed!");
    log.info("\nNext steps:");
    log.info("1. Start frontend: cd client && npm run dev");
    log.info("2. Open browser: http://localhost:5173");
    log.info("3. Run frontend tests: npm test -- Dashboard.test.jsx");

    process.exit(0);
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

main();
