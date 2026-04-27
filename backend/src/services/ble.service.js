import { EventEmitter } from "events";
import crypto from "crypto";
import BLERegistry from "../models/BLERegistryModel.js";
import Scanlog from "../models/ScanlogModel.js";

const bleEmitter = new EventEmitter();

let noble = null;
let initialized = false;
let isScanning = false;
let isDiscoverListenerBound = false;

const discoveredDevices = new Map();
const pendingChallenges = new Map();

const PROCESS_FLOW = ["manufacturer", "distributor", "warehouse", "pharmacy", "customer"];
const CHALLENGE_TTL_MS = 2 * 60 * 1000;
const MAX_POSSIBLE_SPEED_KMH = 900;
const TRANSIT_GRACE_MINUTES = 15;
const MIN_DELAY_REASON_LENGTH = 20;

const LEG_BASE_TRANSIT_HOURS = {
	"manufacturer->distributor": 8,
	"distributor->warehouse": 6,
	"warehouse->pharmacy": 4,
	"pharmacy->customer": 3
};

const TRAFFIC_SPEED_BY_CONDITION_KMH = {
	low: 60,
	moderate: 45,
	high: 30,
	severe: 18
};

const normalizeTrafficCondition = (trafficCondition) => {
	if (!trafficCondition || typeof trafficCondition !== "string") return "moderate";
	const normalized = trafficCondition.toLowerCase().trim();
	return TRAFFIC_SPEED_BY_CONDITION_KMH[normalized] ? normalized : "moderate";
};

const normalizeStage = (stage) => {
	if (!stage || typeof stage !== "string") return null;
	const normalized = stage.toLowerCase().trim();
	return PROCESS_FLOW.includes(normalized) ? normalized : null;
};

const generateBleId = () => `BLE${crypto.randomInt(100000, 999999)}`;

const generateSecret = () => crypto.randomBytes(16).toString("hex");

const generateChallenge = () => crypto.randomBytes(12).toString("hex");

const signChallengeWithSecret = (challenge, secret) =>
	crypto.createHash("sha256").update(`${challenge}:${secret}`).digest("hex");

const toPublicRegistryShape = (registryDoc) => {
	if (!registryDoc) return null;

	return {
		bleId: registryDoc.bleId,
		status: registryDoc.status,
		tamperStatus: registryDoc.tamperStatus,
		metadata: registryDoc.metadata,
		lastKnownStage: registryDoc.lastKnownStage,
		lastKnownLocation: registryDoc.lastKnownLocation,
		lastScanAt: registryDoc.lastScanAt,
		createdAt: registryDoc.createdAt,
		updatedAt: registryDoc.updatedAt
	};
};

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineDistanceKm = (from, to) => {
	const earthRadiusKm = 6371;
	const dLat = toRadians(to.lat - from.lat);
	const dLng = toRadians(to.lng - from.lng);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(from.lat)) *
			Math.cos(toRadians(to.lat)) *
			Math.sin(dLng / 2) *
			Math.sin(dLng / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return earthRadiusKm * c;
};

const evaluateFlow = ({ previousStage, nextStage }) => {
	if (!nextStage) {
		return {
			ok: true,
			code: null,
			details: "Stage not provided."
		};
	}

	if (!previousStage && nextStage !== PROCESS_FLOW[0]) {
		return {
			ok: false,
			code: "FLOW_VIOLATION",
			details: `First scan must start at ${PROCESS_FLOW[0]}.`
		};
	}

	if (!previousStage) {
		return { ok: true, code: null, details: "Flow initialized." };
	}

	const prevIndex = PROCESS_FLOW.indexOf(previousStage);
	const nextIndex = PROCESS_FLOW.indexOf(nextStage);

	if (nextIndex === -1) {
		return {
			ok: false,
			code: "FLOW_VIOLATION",
			details: "Invalid stage provided."
		};
	}

	if (nextIndex === prevIndex) {
		return { ok: true, code: null, details: "Repeated stage scan allowed." };
	}

	if (nextIndex === prevIndex + 1) {
		return { ok: true, code: null, details: "Flow sequence valid." };
	}

	return {
		ok: false,
		code: "FLOW_VIOLATION",
		details: `Invalid transition from ${previousStage} to ${nextStage}.`
	};
};

const evaluateGeoTemporalAnomaly = ({ previousScan, currentScanAt, currentLocation }) => {
	if (
		!previousScan ||
		!previousScan.location ||
		typeof previousScan.location.lat !== "number" ||
		typeof previousScan.location.lng !== "number" ||
		!currentLocation ||
		typeof currentLocation.lat !== "number" ||
		typeof currentLocation.lng !== "number"
	) {
		return {
			suspicious: false,
			code: null,
			details: "Location data incomplete."
		};
	}

	const previousTime = new Date(previousScan.scannedAt).getTime();
	const currentTime = new Date(currentScanAt).getTime();

	if (!Number.isFinite(previousTime) || !Number.isFinite(currentTime) || currentTime <= previousTime) {
		return {
			suspicious: false,
			code: null,
			details: "Timestamp comparison not applicable."
		};
	}

	const elapsedHours = (currentTime - previousTime) / (1000 * 60 * 60);
	const distanceKm = haversineDistanceKm(previousScan.location, currentLocation);
	const speedKmh = distanceKm / elapsedHours;

	if (speedKmh > MAX_POSSIBLE_SPEED_KMH) {
		return {
			suspicious: true,
			code: "IMPOSSIBLE_MOVEMENT",
			details: `Movement ${distanceKm.toFixed(1)} km in ${elapsedHours.toFixed(2)} hours (${speedKmh.toFixed(
				0
			)} km/h).`
		};
	}

	return {
		suspicious: false,
		code: null,
		details: `Movement ${distanceKm.toFixed(1)} km, speed ${speedKmh.toFixed(1)} km/h.`
	};
};

const evaluateTransitDelay = ({
	previousScan,
	currentStage,
	currentScanAt,
	currentLocation,
	trafficCondition
}) => {
	if (!previousScan || !previousScan.stage || !currentStage || previousScan.stage === currentStage) {
		return {
			applicable: false,
			exceeded: false,
			code: null,
			details: "Transit leg not applicable for this scan."
		};
	}

	const routeKey = `${previousScan.stage}->${currentStage}`;
	const baseHours = LEG_BASE_TRANSIT_HOURS[routeKey];

	if (!baseHours) {
		return {
			applicable: false,
			exceeded: false,
			code: null,
			routeKey,
			details: "Transit SLA rule not configured for this route."
		};
	}

	const previousTime = new Date(previousScan.scannedAt).getTime();
	const currentTime = new Date(currentScanAt).getTime();
	if (!Number.isFinite(previousTime) || !Number.isFinite(currentTime) || currentTime <= previousTime) {
		return {
			applicable: false,
			exceeded: false,
			code: null,
			routeKey,
			details: "Transit time comparison not applicable."
		};
	}

	const elapsedMs = currentTime - previousTime;
	const normalizedTraffic = normalizeTrafficCondition(trafficCondition);
	const assumedSpeedKmh = TRAFFIC_SPEED_BY_CONDITION_KMH[normalizedTraffic];

	let distanceKm = null;
	if (
		previousScan.location &&
		typeof previousScan.location.lat === "number" &&
		typeof previousScan.location.lng === "number" &&
		currentLocation &&
		typeof currentLocation.lat === "number" &&
		typeof currentLocation.lng === "number"
	) {
		distanceKm = haversineDistanceKm(previousScan.location, currentLocation);
	}

	const baseAllowedMs = baseHours * 60 * 60 * 1000;
	const distanceBasedAllowedMs =
		typeof distanceKm === "number"
			? (distanceKm / assumedSpeedKmh) * 60 * 60 * 1000
			: null;

	const allowedMs = Math.max(baseAllowedMs, distanceBasedAllowedMs || 0) + TRANSIT_GRACE_MINUTES * 60 * 1000;
	const exceeded = elapsedMs > allowedMs;

	return {
		applicable: true,
		exceeded,
		code: exceeded ? "TRANSIT_TIME_EXCEEDED" : null,
		routeKey,
		trafficCondition: normalizedTraffic,
		assumedSpeedKmh,
		distanceKm,
		elapsedMinutes: Math.round(elapsedMs / (1000 * 60)),
		allowedMinutes: Math.round(allowedMs / (1000 * 60)),
		details: exceeded
			? `Transit took longer than allowed for ${routeKey}.`
			: `Transit time is within allowed SLA for ${routeKey}.`
	};
};

const normalizeDevice = (peripheral) => {
	const manufacturerData = peripheral.advertisement?.manufacturerData;

	return {
		id: peripheral.id,
		address: peripheral.address || "unknown",
		connectable: Boolean(peripheral.connectable),
		rssi: peripheral.rssi,
		localName: peripheral.advertisement?.localName || null,
		txPowerLevel: peripheral.advertisement?.txPowerLevel ?? null,
		serviceUuids: peripheral.advertisement?.serviceUuids || [],
		manufacturerData: manufacturerData ? manufacturerData.toString("hex") : null,
		discoveredAt: new Date().toISOString()
	};
};

const bindDiscoverListener = () => {
	if (!noble || isDiscoverListenerBound) return;

	noble.on("discover", (peripheral) => {
		const device = normalizeDevice(peripheral);
		discoveredDevices.set(device.id, device);
		bleEmitter.emit("device", device);
	});

	isDiscoverListenerBound = true;
};

const loadNoble = async () => {
	if (noble) return noble;

	try {
		const nobleModule = await import("@abandonware/noble");
		noble = nobleModule.default;
	} catch (error) {
		throw new Error(
			"BLE dependency not available. Install @abandonware/noble or run backend on Node 18/20 (Node 22 on Windows may fail native build)."
		);
	}

	return noble;
};

export const initializeBLEService = async ({ autoStart = false, serviceUUIDs = [] } = {}) => {
	if (initialized) {
		return getBLEStatus();
	}

	await loadNoble();
	bindDiscoverListener();

	noble.on("stateChange", async (state) => {
		if (state !== "poweredOn" && isScanning) {
			await stopScan();
		}
	});

	initialized = true;

	if (autoStart) {
		try {
			await startScan({ serviceUUIDs });
		} catch (error) {
			console.warn("BLE auto-start scan skipped:", error.message);
		}
	}

	return getBLEStatus();
};

export const startScan = async ({
	serviceUUIDs = [],
	allowDuplicates = false,
	durationMs = 10000
} = {}) => {
	await loadNoble();
	bindDiscoverListener();

	if (!initialized) {
		initialized = true;
	}

	if (noble.state !== "poweredOn") {
		throw new Error(`Bluetooth adapter is not ready (state: ${noble.state || "unknown"}).`);
	}

	if (isScanning) {
		return {
			started: false,
			message: "BLE scan already running"
		};
	}

	discoveredDevices.clear();

	await noble.startScanningAsync(serviceUUIDs, allowDuplicates);
	isScanning = true;
	bleEmitter.emit("scanStarted");

	if (durationMs > 0) {
		setTimeout(async () => {
			if (!isScanning) return;
			try {
				await stopScan();
			} catch (error) {
				console.error("Failed to stop BLE scan:", error.message);
			}
		}, durationMs);
	}

	return {
		started: true,
		message: "BLE scan started"
	};
};

export const stopScan = async () => {
	if (!noble || !isScanning) {
		return {
			stopped: false,
			message: "BLE scan is not running"
		};
	}

	await noble.stopScanningAsync();
	isScanning = false;
	bleEmitter.emit("scanStopped");

	return {
		stopped: true,
		message: "BLE scan stopped"
	};
};

export const getDiscoveredDevices = () => {
	return Array.from(discoveredDevices.values());
};

export const clearDiscoveredDevices = () => {
	discoveredDevices.clear();
	return { cleared: true };
};

export const issueBleIdentity = async ({ bleId, metadata = {}, issuedBy = null } = {}) => {
	let resolvedBleId = String(bleId || "")
		.toUpperCase()
		.trim();

	if (!resolvedBleId) {
		let generated = null;
		do {
			generated = generateBleId();
		} while (await BLERegistry.exists({ bleId: generated }));
		resolvedBleId = generated;
	}

	const exists = await BLERegistry.exists({ bleId: resolvedBleId });
	if (exists) {
		throw new Error(`BLE ID ${resolvedBleId} already exists.`);
	}

	const secretKey = generateSecret();

	const created = await BLERegistry.create({
		bleId: resolvedBleId,
		secretKey,
		status: "UNUSED",
		tamperStatus: "INTACT",
		metadata,
		issuedBy
	});

	return {
		bleId: created.bleId,
		secretKey,
		status: created.status,
		tamperStatus: created.tamperStatus
	};
};

export const getBleIdentityPublic = async (bleId) => {
	const resolvedBleId = String(bleId || "")
		.toUpperCase()
		.trim();

	if (!resolvedBleId) {
		throw new Error("bleId is required.");
	}

	const registry = await BLERegistry.findOne({ bleId: resolvedBleId });
	if (!registry) {
		throw new Error(`BLE ID ${resolvedBleId} not found.`);
	}

	return toPublicRegistryShape(registry);
};

export const setTamperStatus = async ({ bleId, tamperStatus }) => {
	const resolvedBleId = String(bleId || "")
		.toUpperCase()
		.trim();
	const resolvedTamperStatus = String(tamperStatus || "")
		.toUpperCase()
		.trim();

	if (!resolvedBleId) throw new Error("bleId is required.");
	if (!["INTACT", "BREACHED"].includes(resolvedTamperStatus)) {
		throw new Error("tamperStatus must be INTACT or BREACHED.");
	}

	const updated = await BLERegistry.findOneAndUpdate(
		{ bleId: resolvedBleId },
		{ tamperStatus: resolvedTamperStatus },
		{ new: true }
	);

	if (!updated) {
		throw new Error(`BLE ID ${resolvedBleId} not found.`);
	}

	return toPublicRegistryShape(updated);
};

export const initiateChallenge = async (bleId) => {
	const resolvedBleId = String(bleId || "")
		.toUpperCase()
		.trim();

	if (!resolvedBleId) throw new Error("bleId is required.");

	const registry = await BLERegistry.findOne({ bleId: resolvedBleId });
	if (!registry) {
		throw new Error(`BLE ID ${resolvedBleId} not found.`);
	}

	if (registry.status === "REVOKED") {
		throw new Error("BLE device is revoked.");
	}

	if (registry.tamperStatus === "BREACHED") {
		throw new Error("BLE package tamper status is BREACHED.");
	}

	const challenge = generateChallenge();
	const expiresAt = Date.now() + CHALLENGE_TTL_MS;

	pendingChallenges.set(resolvedBleId, {
		challenge,
		expiresAt
	});

	return {
		bleId: resolvedBleId,
		challenge,
		expiresAt: new Date(expiresAt).toISOString()
	};
};

export const mockSignChallenge = async ({ bleId, challenge }) => {
	const resolvedBleId = String(bleId || "")
		.toUpperCase()
		.trim();

	if (!resolvedBleId) throw new Error("bleId is required.");
	if (!challenge) throw new Error("challenge is required.");

	const registry = await BLERegistry.findOne({ bleId: resolvedBleId }).select("+secretKey");
	if (!registry) {
		throw new Error(`BLE ID ${resolvedBleId} not found.`);
	}

	return {
		bleId: resolvedBleId,
		signature: signChallengeWithSecret(challenge, registry.secretKey)
	};
};

export const verifySecureScan = async ({
	bleId,
	challenge,
	signature,
	stage,
	location = {},
	trafficCondition,
	delayReason,
	timestamp,
	scannedBy = null
}) => {
	const resolvedBleId = String(bleId || "")
		.toUpperCase()
		.trim();
	const resolvedStage = normalizeStage(stage);
	const resolvedScanTime = timestamp ? new Date(timestamp) : new Date();
	const resolvedTrafficCondition = normalizeTrafficCondition(trafficCondition || location?.trafficCondition);
	const resolvedDelayReason = String(delayReason || "").trim();

	if (!resolvedBleId) throw new Error("bleId is required.");
	if (!challenge) throw new Error("challenge is required.");
	if (!signature) throw new Error("signature is required.");
	if (Number.isNaN(resolvedScanTime.getTime())) {
		throw new Error("timestamp is invalid.");
	}

	const registry = await BLERegistry.findOne({ bleId: resolvedBleId }).select("+secretKey");
	if (!registry) {
		throw new Error(`BLE ID ${resolvedBleId} not found.`);
	}

	const alerts = [];
	let verificationStatus = "VERIFIED";

	if (registry.status === "REVOKED") {
		alerts.push("DEVICE_REVOKED");
		verificationStatus = "BLOCKED";
	}

	if (registry.tamperStatus === "BREACHED") {
		alerts.push("TAMPER_BREACH");
		verificationStatus = "BLOCKED";
	}

	const pending = pendingChallenges.get(resolvedBleId);
	if (!pending || pending.challenge !== challenge || pending.expiresAt < Date.now()) {
		alerts.push("CHALLENGE_INVALID");
		verificationStatus = "FAILED";
	}

	const expectedSignature = signChallengeWithSecret(challenge, registry.secretKey);
	if (expectedSignature !== signature) {
		alerts.push("FAKE_DEVICE_SIGNATURE");
		verificationStatus = "FAILED";
	}

	const previousVerifiedScan = await Scanlog.findOne({
		bleId: resolvedBleId,
		verificationStatus: "VERIFIED"
	}).sort({ scannedAt: -1 });

	const flowResult = evaluateFlow({
		previousStage: previousVerifiedScan?.stage || null,
		nextStage: resolvedStage
	});

	if (!flowResult.ok) {
		alerts.push(flowResult.code);
		if (verificationStatus === "VERIFIED") {
			verificationStatus = "BLOCKED";
		}
	}

	const normalizedLocation = {
		city: String(location.city || "").trim(),
		lat: typeof location.lat === "number" ? location.lat : null,
		lng: typeof location.lng === "number" ? location.lng : null
	};

	const geoResult = evaluateGeoTemporalAnomaly({
		previousScan: previousVerifiedScan,
		currentScanAt: resolvedScanTime,
		currentLocation: normalizedLocation
	});

	const transitDelay = evaluateTransitDelay({
		previousScan: previousVerifiedScan,
		currentStage: resolvedStage,
		currentScanAt: resolvedScanTime,
		currentLocation: normalizedLocation,
		trafficCondition: resolvedTrafficCondition
	});

	if (geoResult.suspicious) {
		alerts.push(geoResult.code);
		if (verificationStatus === "VERIFIED") {
			verificationStatus = "BLOCKED";
		}
	}

	const delayReasonRequired = transitDelay.exceeded;
	const delayReasonAccepted = !delayReasonRequired || resolvedDelayReason.length >= MIN_DELAY_REASON_LENGTH;

	if (transitDelay.exceeded) {
		alerts.push(transitDelay.code);
		if (verificationStatus === "VERIFIED") {
			verificationStatus = "BLOCKED";
		}
	}

	if (delayReasonRequired && !delayReasonAccepted) {
		alerts.push("DELAY_REASON_REQUIRED");
		if (verificationStatus === "VERIFIED") {
			verificationStatus = "BLOCKED";
		}
	}

	const scanLog = await Scanlog.create({
		bleId: resolvedBleId,
		stage: resolvedStage,
		challenge,
		signature,
		verificationStatus,
		alertCodes: alerts,
		location: normalizedLocation,
		scannedAt: resolvedScanTime,
		scannedBy,
		details: {
			flow: flowResult,
			geoTemporal: geoResult,
			transitDelay: {
				...transitDelay,
				delayReason: resolvedDelayReason || null,
				delayReasonRequired,
				delayReasonAccepted
			}
		}
	});

	pendingChallenges.delete(resolvedBleId);

	if (verificationStatus === "VERIFIED") {
		registry.status = registry.status === "UNUSED" ? "ACTIVE" : registry.status;
		registry.lastKnownStage = resolvedStage;
		registry.lastKnownLocation = normalizedLocation;
		registry.lastScanAt = resolvedScanTime;
		await registry.save();
	}

	return {
		bleId: resolvedBleId,
		verified: verificationStatus === "VERIFIED",
		verificationStatus,
		alerts,
		flow: flowResult,
		geoTemporal: geoResult,
		transitDelay: {
			...transitDelay,
			delayReason: resolvedDelayReason || null,
			delayReasonRequired,
			delayReasonAccepted
		},
		scanId: scanLog._id,
		publicRegistry: toPublicRegistryShape(registry)
	};
};

export const listSecurityScanLogs = async ({ bleId, limit = 50 } = {}) => {
	const query = {};
	if (bleId) {
		query.bleId = String(bleId).toUpperCase().trim();
	}

	const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);

	const logs = await Scanlog.find(query)
		.sort({ scannedAt: -1 })
		.limit(safeLimit);

	return logs;
};

export const getMockBatchData = () => {
	const temperature = 12.5;

	return {
		deviceId: "BLE12345",
		batchId: "BATCH-98765",
		temperature,
		status: temperature > 8 ? "ALERT" : "OK",
		timestamp: new Date()
	};
};

export const getBLEStatus = () => {
	return {
		initialized,
		adapterState: noble?.state || "unknown",
		scanning: isScanning,
		deviceCount: discoveredDevices.size
	};
};

export const bleEvents = bleEmitter;
