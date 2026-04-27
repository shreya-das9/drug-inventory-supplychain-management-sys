import express from "express";
import {
  beginScan,
  createChallenge,
  endScan,
  getBleIdentity,
  getSecurityLogs,
  getStatus,
  issueSecureBle,
  listDevices,
  mockTrackingCheck,
  resetDevices,
  signChallengeMock,
  updateTamper,
  verifyChallengeScan
} from "../controllers/ble.controller.js";
import { isAdmin, isWarehouseAdmin, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/status", verifyToken, isWarehouseAdmin, getStatus);
router.post("/scan/start", verifyToken, isWarehouseAdmin, beginScan);
router.post("/scan/stop", verifyToken, isWarehouseAdmin, endScan);
router.get("/devices", verifyToken, isWarehouseAdmin, listDevices);
router.delete("/devices", verifyToken, isWarehouseAdmin, resetDevices);
router.get("/mock-check", verifyToken, isWarehouseAdmin, mockTrackingCheck);

router.post("/secure/issue", verifyToken, isAdmin, issueSecureBle);
router.get("/secure/registry/:bleId", verifyToken, isWarehouseAdmin, getBleIdentity);
router.patch("/secure/registry/:bleId/tamper", verifyToken, isAdmin, updateTamper);
router.post("/secure/challenge", verifyToken, isWarehouseAdmin, createChallenge);
router.post("/secure/mock-sign", verifyToken, isWarehouseAdmin, signChallengeMock);
router.post("/secure/verify", verifyToken, isWarehouseAdmin, verifyChallengeScan);
router.get("/secure/logs", verifyToken, isWarehouseAdmin, getSecurityLogs);

export default router;