import { fallbackContent } from "../data/landingData.js";

const sectorMap = new Map(
  fallbackContent.sectors.map((sector) => [sector.slug, sector]),
);

const deviceMap = new Map(
  fallbackContent.devices.map((device) => [device.deviceKey, device]),
);

const planMap = new Map(
  fallbackContent.plans.map((plan) => [plan.slug, plan]),
);

export function getSectorBySlug(slug) {
  return sectorMap.get(slug) ?? null;
}

export function getDeviceByKey(deviceKey) {
  return deviceMap.get(deviceKey) ?? null;
}

export function getPlanBySlug(slug) {
  return planMap.get(slug) ?? null;
}
