import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRuntimeSeed } from "../data/runtimeSeed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storeFilePath = process.env.VERCEL
  ? path.join("/tmp", "brain-runtime-store.json")
  : path.resolve(__dirname, "..", "data", "runtime-store.json");
const SMART_CARDS_PER_PLAN = 500;

let stateCache = null;

function ensureStoreDirectory() {
  fs.mkdirSync(path.dirname(storeFilePath), { recursive: true });
}

function normalizeCollection(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

function normalizeSectorLabel(label) {
  const sectorLabelMap = {
    Komercial: "Commercial AI",
    Commercial: "Commercial AI",
    Business: "Business AI",
    Healthcare: "Healthcare AI",
    "Industry 4.0": "Industry 4.0 AI",
    "Industry 4.0 AI": "Industry 4.0 AI",
  };

  return sectorLabelMap[label] ?? label;
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

function normalizePaymentStatus(status) {
  if (status === "paid") {
    return "approved";
  }

  if (status === "pending" || status === "approved" || status === "rejected") {
    return status;
  }

  return "pending";
}

function normalizePaymentMethod(method) {
  const normalizedMethod =
    typeof method === "string" ? method.toLowerCase().trim() : "";

  if (
    normalizedMethod === "visa" ||
    normalizedMethod === "mastercard" ||
    normalizedMethod === "amex" ||
    normalizedMethod === "paypal"
  ) {
    return normalizedMethod;
  }

  return "visa";
}

function normalizePayment(payment) {
  if (!payment || typeof payment !== "object") {
    return payment;
  }

  const paymentMethod = normalizePaymentMethod(
    payment.paymentMethod ?? payment.cardBrand,
  );
  const status = normalizePaymentStatus(payment.status);

  return {
    ...payment,
    paymentMethod,
    cardBrand: paymentMethod,
    status,
    last4:
      typeof payment.last4 === "string" && payment.last4.trim().length > 0
        ? payment.last4
        : paymentMethod === "paypal"
          ? "PPAL"
          : "0000",
    linkedCardCode: payment.linkedCardCode ?? null,
    approvalRequestedAt: payment.approvalRequestedAt ?? payment.createdAt ?? null,
    approvedAt:
      payment.approvedAt ?? (status === "approved" ? payment.createdAt ?? null : null),
    rejectedAt: payment.rejectedAt ?? null,
    approvalNote: payment.approvalNote ?? null,
  };
}

function mergeSmartCardsWithSeed(cards, seedCards) {
  const normalizedCards = normalizeCollection(cards, []).map(normalizeSmartCard);
  const existingCodes = new Set(
    normalizedCards.map((card) => card?.code).filter(Boolean),
  );
  const missingSeedCards = seedCards
    .filter((card) => !existingCodes.has(card.code))
    .map(normalizeSmartCard);

  return normalizeSmartCardInventory([...normalizedCards, ...missingSeedCards]);
}

function sortInventoryCards(left, right) {
  const statusRank = {
    activated: 0,
    assigned: 1,
    available: 2,
  };
  const statusGap = statusRank[left.status] - statusRank[right.status];

  if (statusGap !== 0) {
    return statusGap;
  }

  const ownedLeft = left.ownerCompany ? 0 : 1;
  const ownedRight = right.ownerCompany ? 0 : 1;
  const ownershipGap = ownedLeft - ownedRight;

  if (ownershipGap !== 0) {
    return ownershipGap;
  }

  const updatedGap = right.updatedAt.localeCompare(left.updatedAt);

  if (updatedGap !== 0) {
    return updatedGap;
  }

  return left.code.localeCompare(right.code);
}

function normalizeSmartCardInventory(cards) {
  const groupedCards = new Map();

  for (const card of cards) {
    const plan = card?.plan ?? "unknown";
    const currentGroup = groupedCards.get(plan) ?? [];
    currentGroup.push(card);
    groupedCards.set(plan, currentGroup);
  }

  const normalizedInventory = [];

  for (const cardsForPlan of groupedCards.values()) {
    normalizedInventory.push(
      ...cardsForPlan.sort(sortInventoryCards).slice(0, SMART_CARDS_PER_PLAN),
    );
  }

  return normalizedInventory;
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
    payments: normalizeCollection(input.payments, seed.payments).map(normalizePayment),
    smartCards: mergeSmartCardsWithSeed(input.smartCards, seed.smartCards),
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

  try {
    ensureStoreDirectory();
    stateCache.meta = {
      ...(stateCache.meta ?? {}),
      version: stateCache.meta?.version ?? 3,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(storeFilePath, JSON.stringify(stateCache, null, 2), "utf8");
  } catch (error) {
    console.warn("Runtime state could not be persisted. Using in-memory state only.", error);
  }

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
