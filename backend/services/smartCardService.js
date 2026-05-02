import { getPlanBySlug, getSectorBySlug } from "./catalogService.js";
import { incrementAccountCards, updateAccountPlan } from "./accountService.js";
import { createNotification } from "./runtimeService.js";
import {
  createHttpError,
  sanitizeText,
} from "./serviceHelpers.js";

const sectorCycle = ["commercial", "business", "healthcare", "industry"];
const planCycle = ["starter", "professional", "business", "platinum"];
const assignedPools = [
  { company: "Nova Market", sector: "commercial", plan: "business", count: 126 },
  { company: "Helios Clinic", sector: "healthcare", plan: "professional", count: 84 },
  { company: "Astra Group", sector: "business", plan: "platinum", count: 140 },
  { company: "Factory One", sector: "industry", plan: "business", count: 92 },
];

function buildSeedCards() {
  const cards = [];
  let sequence = 1;

  assignedPools.forEach((pool) => {
    const sectorRecord = getSectorBySlug(pool.sector);
    const planRecord = getPlanBySlug(pool.plan);

    for (let index = 0; index < pool.count; index += 1) {
      cards.push({
        id: `card-${sequence}`,
        code: `SC-${String(sequence).padStart(4, "0")}-${pool.sector.slice(0, 3).toUpperCase()}`,
        sector: pool.sector,
        sectorLabel: sectorRecord?.name ?? pool.sector,
        plan: pool.plan,
        planName: planRecord?.name ?? pool.plan,
        status: index % 3 === 0 ? "assigned" : "activated",
        ownerCompany: pool.company,
        deviceKey: pool.sector === "commercial"
          ? "ai-stick"
          : pool.sector === "healthcare"
            ? "med-assistant"
            : pool.sector === "industry"
              ? "industry-edge"
              : "business-hub",
        issuedAt: new Date(Date.now() - sequence * 1000 * 60 * 8).toISOString(),
        updatedAt: new Date(Date.now() - sequence * 1000 * 60 * 4).toISOString(),
      });
      sequence += 1;
    }
  });

  while (cards.length < 500) {
    const sector = sectorCycle[cards.length % sectorCycle.length];
    const plan = planCycle[cards.length % planCycle.length];
    const sectorRecord = getSectorBySlug(sector);
    const planRecord = getPlanBySlug(plan);

    cards.push({
      id: `card-${sequence}`,
      code: `SC-${String(sequence).padStart(4, "0")}-${sector.slice(0, 3).toUpperCase()}`,
      sector,
      sectorLabel: sectorRecord?.name ?? sector,
      plan,
      planName: planRecord?.name ?? plan,
      status: "available",
      ownerCompany: null,
      deviceKey: null,
      issuedAt: new Date(Date.now() - sequence * 1000 * 60 * 8).toISOString(),
      updatedAt: new Date(Date.now() - sequence * 1000 * 60 * 4).toISOString(),
    });
    sequence += 1;
  }

  return cards;
}

const runtimeSmartCards = buildSeedCards();

export function getSmartCards() {
  return runtimeSmartCards;
}

export function getSmartCardStats() {
  return {
    total: runtimeSmartCards.length,
    available: runtimeSmartCards.filter((card) => card.status === "available").length,
    assigned: runtimeSmartCards.filter((card) => card.status === "assigned").length,
    activated: runtimeSmartCards.filter((card) => card.status === "activated").length,
  };
}

export function assignSmartCards(payload) {
  const company = sanitizeText(payload.company);
  const sector = sanitizeText(payload.sector).toLowerCase();
  const plan = sanitizeText(payload.plan).toLowerCase();
  const deviceKey = sanitizeText(payload.deviceKey);
  const quantity = Math.max(1, Math.min(100, Number(payload.quantity ?? 1)));

  if (!company || !sector || !plan || !deviceKey) {
    throw createHttpError(
      "Company, sector, plan, device key, and quantity are required.",
    );
  }

  const matchingCards = runtimeSmartCards.filter(
    (card) =>
      card.status === "available" && card.sector === sector && card.plan === plan,
  );

  if (matchingCards.length < quantity) {
    throw createHttpError(
      `Only ${matchingCards.length} available smart card(s) match that sector and plan.`,
    );
  }

  const updatedCards = matchingCards.slice(0, quantity).map((card) => {
    card.status = "assigned";
    card.ownerCompany = company;
    card.deviceKey = deviceKey;
    card.updatedAt = new Date().toISOString();
    return card;
  });

  incrementAccountCards(company, updatedCards.length);
  createNotification(
    "Smart cards assigned",
    `${updatedCards.length} smart card(s) assigned to ${company}.`,
    "success",
  );

  return updatedCards;
}

export function validateSmartCard(payload) {
  const code = sanitizeText(payload.code).toUpperCase();
  const company = sanitizeText(payload.company);

  if (!code) {
    throw createHttpError("Smart card code is required.");
  }

  const card = runtimeSmartCards.find(
    (item) => item.code.toUpperCase() === code,
  );

  if (!card) {
    throw createHttpError("Smart card code was not found.", 404);
  }

  if (card.status === "activated") {
    throw createHttpError("Smart card is already validated or active.");
  }

  const nextCompany = company || card.ownerCompany || null;
  const previousStatus = card.status;

  card.status = "activated";
  card.ownerCompany = nextCompany;
  card.updatedAt = new Date().toISOString();

  if (nextCompany) {
    if (previousStatus === "available") {
      incrementAccountCards(nextCompany, 1);
    }

    updateAccountPlan(nextCompany, card.plan);
  }

  createNotification(
    "SC card validated",
    `${card.code} validated${nextCompany ? ` for ${nextCompany}` : ""}.`,
    "success",
  );

  return card;
}
