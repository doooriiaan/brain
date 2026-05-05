import { broadcastActivationUpdate } from "./realtimeService.js";
import { incrementAccountDevices } from "./accountService.js";
import {
  getDeviceByKey,
  getPlanBySlug,
  getSectorBySlug,
} from "./catalogService.js";
import { createNotification } from "./runtimeService.js";
import { getRuntimeState, updateRuntimeState } from "./runtimeStore.js";
import {
  createHttpError,
  createId,
  sanitizeText,
} from "./serviceHelpers.js";

const validActivationStatuses = new Set(["queued", "provisioning", "live"]);

export function getActivations() {
  return getRuntimeState().activations;
}

export function createActivation(payload) {
  const company = sanitizeText(payload.company);
  const sector = sanitizeText(payload.sector).toLowerCase();
  const deviceKey = sanitizeText(payload.deviceKey);
  const plan = sanitizeText(payload.plan).toLowerCase();
  const site = sanitizeText(payload.site);

  const sectorRecord = getSectorBySlug(sector);
  const deviceRecord = getDeviceByKey(deviceKey);
  const planRecord = getPlanBySlug(plan);

  if (!company || !sector || !deviceKey || !plan || !site) {
    throw createHttpError(
      "Company, sector, device, plan, and installation site are required.",
    );
  }

  if (!sectorRecord || !deviceRecord || !planRecord) {
    throw createHttpError("Choose a valid sector, device, and plan.");
  }

  if (deviceRecord.sectorSlug !== sector) {
    throw createHttpError(
      "The selected device does not belong to the chosen sector.",
    );
  }

  const activation = updateRuntimeState((state) => {
    const nextActivation = {
      id: createId(),
      company,
      sector,
      sectorLabel: sectorRecord.name,
      deviceKey,
      deviceName: deviceRecord.name,
      plan,
      planName: planRecord.name,
      site,
      status: "queued",
      createdAt: new Date().toISOString(),
    };

    state.activations.unshift(nextActivation);
    state.activations = state.activations.slice(0, 20);

    return nextActivation;
  });

  incrementAccountDevices(company, 1);
  createNotification(
    "Activation queued",
    `${company} queued ${deviceRecord.name} for ${site}.`,
    "success",
  );
  broadcastActivationUpdate(activation);

  return activation;
}

export function updateActivationStatus(id, status) {
  const normalizedStatus = sanitizeText(status).toLowerCase();

  const activation = updateRuntimeState((state) => {
    const matchedActivation = state.activations.find((item) => item.id === id);

    if (!matchedActivation) {
      throw createHttpError("Activation not found.", 404);
    }

    if (!validActivationStatuses.has(normalizedStatus)) {
      throw createHttpError("Choose a valid activation status.");
    }

    matchedActivation.status = normalizedStatus;
    return matchedActivation;
  });

  createNotification(
    "Activation updated",
    `${activation.company} activation is now ${normalizedStatus}.`,
    normalizedStatus === "live" ? "success" : "info",
  );
  broadcastActivationUpdate(activation);

  return activation;
}
