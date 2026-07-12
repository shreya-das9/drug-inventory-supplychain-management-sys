import test from "node:test";
import assert from "node:assert/strict";
import { buildRetailerFallbackData, shouldSeedRetailerFallbackData } from "./retailerDashboardData.js";

test("buildRetailerFallbackData returns demo orders and shipments", () => {
  const fallback = buildRetailerFallbackData();

  assert.ok(Array.isArray(fallback.orders));
  assert.equal(fallback.orders.length, 1);
  assert.ok(Array.isArray(fallback.shipments));
  assert.equal(fallback.shipments.length, 1);
  assert.equal(fallback.orders[0].status, "Confirmed");
  assert.equal(fallback.shipments[0].status, "Shipped");
});

test("shouldSeedRetailerFallbackData returns false when real retailer data already exists", () => {
  const result = shouldSeedRetailerFallbackData(
    [{ _id: "real-order" }],
    [{ _id: "real-shipment" }],
    ""
  );

  assert.equal(result.shouldSeed, false);
  assert.equal(result.orders.length, 1);
  assert.equal(result.shipments.length, 1);
});
