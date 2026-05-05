import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRuntimeSeed } from "../data/runtimeSeed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storeFilePath = path.resolve(__dirname, "..", "data", "runtime-store.json");

let stateCache = null;

function ensureStoreDirectory() {
  fs.mkdirSync(path.dirname(storeFilePath), { recursive: true });
}

function normalizeCollection(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

function normalizeSectorLabel(label) {
  return label === "Industry 4.0 AI" ? "Industry 4.0" : label;
}

function normalizeAccount(account) {
  if (!account || typeof account !== "object") {
    return account;
  }

  return {
    ...account,
    sectorLabel: normalizeSectorLabel(account.sectorLabel),
  };
}

function normalizeSmartCard(card) {
  if (!card || typeof card !== "object") {
    return card;
  }

  return {
    ...card,
    sectorLabel: normalizeSectorLabel(card.sectorLabel),
  };
}

function normalizeState(value) {
  const seed = createRuntimeSeed();
  const input = value && typeof value === "object" ? value : {};

  return {
    meta: {
      ...seed.meta,
      ...(input.meta && typeof input.meta === "object" ? input.meta : {}),
      version: seed.meta.version,
      updatedAt: new Date().toISOString(),
    },
    users: normalizeCollection(input.users, seed.users),
    sessions: normalizeCollection(input.sessions, seed.sessions),
    accounts: normalizeCollection(input.accounts, seed.accounts).map(normalizeAccount),
    notifications: normalizeCollection(input.notifications, seed.notifications),
    uploads: normalizeCollection(input.uploads, seed.uploads),
    leads: normalizeCollection(input.leads, seed.leads),
    payments: normalizeCollection(input.payments, seed.payments),
    smartCards: normalizeCollection(input.smartCards, seed.smartCards).map(
      normalizeSmartCard,
    ),
    activations: normalizeCollection(input.activations, seed.activations),
    tickets: normalizeCollection(input.tickets, seed.tickets),
    scratchCardReveals: normalizeCollection(
      input.scratchCardReveals,
      seed.scratchCardReveals,
    ),
    scratchCardReservations: normalizeCollection(
      input.scratchCardReservations,
      seed.scratchCardReservations,
    ),
    vpnEndpoints: normalizeCollection(input.vpnEndpoints, seed.vpnEndpoints),
    vpnSessions: normalizeCollection(input.vpnSessions, seed.vpnSessions),
  };
}

export function getRuntimeStorePath() {
  return storeFilePath;
}

export function getRuntimeState() {
  if (stateCache) {
    return stateCache;
  }

  ensureStoreDirectory();

  if (!fs.existsSync(storeFilePath)) {
    stateCache = createRuntimeSeed();
    saveRuntimeState();
    return stateCache;
  }

  try {
    const raw = fs.readFileSync(storeFilePath, "utf8");
    stateCache = normalizeState(JSON.parse(raw));
  } catch (error) {
    console.warn("Runtime store could not be read. Re-seeding local state.", error);
    stateCache = createRuntimeSeed();
    saveRuntimeState();
  }

  return stateCache;
}

export function saveRuntimeState() {
  if (!stateCache) {
    return null;
  }

  ensureStoreDirectory();
  stateCache.meta = {
    ...(stateCache.meta ?? {}),
    version: stateCache.meta?.version ?? 2,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(storeFilePath, JSON.stringify(stateCache, null, 2), "utf8");
  return stateCache;
}

export function updateRuntimeState(updater) {
  const state = getRuntimeState();
  const result = updater(state);
  saveRuntimeState();
  return result;
}

export function resetRuntimeState() {
  stateCache = createRuntimeSeed();
  saveRuntimeState();
  return stateCache;
}
