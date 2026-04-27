import {
  clearDiscoveredDevices,
  getBLEStatus,
  getBleIdentityPublic,
  getDiscoveredDevices,
  getMockBatchData,
  initializeBLEService,
  initiateChallenge,
  issueBleIdentity,
  listSecurityScanLogs,
  mockSignChallenge,
  setTamperStatus,
  startScan,
  stopScan,
  verifySecureScan
} from "../services/ble.service.js";
import { sendBleAlertEmail } from "../services/email.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const getStatus = async (req, res) => {
  try {
    await initializeBLEService();
    return successResponse(res, 200, "BLE status fetched", getBLEStatus());
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const beginScan = async (req, res) => {
  try {
    await initializeBLEService();

    const { serviceUUIDs = [], allowDuplicates = false, durationMs = 10000 } = req.body || {};

    const result = await startScan({
      serviceUUIDs,
      allowDuplicates,
      durationMs
    });

    return successResponse(res, 200, result.message, {
      ...result,
      status: getBLEStatus()
    });
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const endScan = async (req, res) => {
  try {
    const result = await stopScan();
    return successResponse(res, 200, result.message, {
      ...result,
      status: getBLEStatus()
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const listDevices = async (req, res) => {
  try {
    return successResponse(res, 200, "BLE devices fetched", {
      devices: getDiscoveredDevices(),
      status: getBLEStatus()
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const resetDevices = async (req, res) => {
  try {
    clearDiscoveredDevices();
    return successResponse(res, 200, "BLE devices cleared", {
      status: getBLEStatus()
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const mockTrackingCheck = async (req, res) => {
  try {
    const tracking = getMockBatchData();
    let emailSent = false;
    let emailError = null;

    if (tracking.status === "ALERT") {
      try {
        await sendBleAlertEmail({ tracking });
        emailSent = true;
      } catch (error) {
        emailError = error.message;
        console.error("BLE alert email send failed:", error);
      }
    }

    return successResponse(res, 200, "Mock BLE tracking check success", {
      tracking,
      emailSent,
      emailError
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const issueSecureBle = async (req, res) => {
  try {
    const { bleId, metadata = {} } = req.body || {};
    const result = await issueBleIdentity({
      bleId,
      metadata,
      issuedBy: req.user?.id || null
    });

    return successResponse(res, 201, "BLE identity issued", result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const getBleIdentity = async (req, res) => {
  try {
    const result = await getBleIdentityPublic(req.params.bleId);
    return successResponse(res, 200, "BLE identity fetched", result);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

export const updateTamper = async (req, res) => {
  try {
    const result = await setTamperStatus({
      bleId: req.params.bleId,
      tamperStatus: req.body?.tamperStatus
    });

    return successResponse(res, 200, "Tamper status updated", result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const createChallenge = async (req, res) => {
  try {
    const { bleId } = req.body || {};
    const result = await initiateChallenge(bleId);
    return successResponse(res, 200, "Challenge created", result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const signChallengeMock = async (req, res) => {
  try {
    const { bleId, challenge } = req.body || {};
    const result = await mockSignChallenge({ bleId, challenge });
    return successResponse(res, 200, "Mock signature generated", result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const verifyChallengeScan = async (req, res) => {
  try {
    const { bleId, challenge, signature, stage, location = {}, trafficCondition, delayReason, timestamp } = req.body || {};

    const result = await verifySecureScan({
      bleId,
      challenge,
      signature,
      stage,
      location,
      trafficCondition,
      delayReason,
      timestamp,
      scannedBy: req.user?.id || null
    });

    const statusCode = result.verified ? 200 : 202;
    return successResponse(res, statusCode, "Secure BLE scan processed", result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const getSecurityLogs = async (req, res) => {
  try {
    const { bleId, limit } = req.query || {};
    const logs = await listSecurityScanLogs({ bleId, limit });

    return successResponse(res, 200, "BLE security logs fetched", {
      count: logs.length,
      logs
    });
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};