import {
  getDeviceByKey,
  getPlanBySlug,
  getSectorBySlug,
} from "./catalogService.js";
import { createNotification } from "./runtimeService.js";
import {
  createHttpError,
  createId,
  sanitizeText,
} from "./serviceHelpers.js";

const runtimeActivations = [
  {
    id: "activation-1",
    company: "Nova Market",
    sector: "commercial",
    sectorLabel: "Commercial",
    deviceKey: "ai-stick",
    deviceName: "brAIn AI Stick",
    plan: "business",
    planName: "Business",
    site: "Prishtine flagship wall",
    status: "provisioning",
    createdAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
  },
  {
    id: "activation-2",
    company: "Helios Clinic",
    sector: "healthcare",
    sectorLabel: "Healthcare",
    deviceKey: "med-assistant",
    deviceName: "brAIn MED Assistant",
    plan: "professional",
    planName: "Professional",
    site: "Reception desk A2",
    status: "live",
    createdAt: new Date(Date.now() - 1000 * 60 * 82).toISOString(),
  },
];

export function getActivations() {
  return runtimeActivations;
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

  const activation = {
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

  runtimeActivations.unshift(activation);
  runtimeActivations.splice(12);

  createNotification(
    "Activation queued",
    `${company} queued ${deviceRecord.name} for ${site}.`,
    "success",
  );

  return activation;
}
