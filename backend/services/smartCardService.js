import { createFreshSmartCardInventory } from "../data/runtimeSeed.js";
import { broadcastSmartCardUpdate } from "./realtimeService.js";
import { getPlanBySlug, getSectorBySlug } from "./catalogService.js";
import { incrementAccountCards, updateAccountPlan } from "./accountService.js";
import { createNotification } from "./runtimeService.js";
import { getRuntimeState, updateRuntimeState } from "./runtimeStore.js";
import {
  createHttpError,
  sanitizeText,
} from "./serviceHelpers.js";

const smartCardsPerPlan = 500;

export function getSmartCards() {
  return getRuntimeState().smartCards;
}

export function getSmartCardByCode(code) {
  const normalizedCode = sanitizeText(code).toUpperCase();

  if (!normalizedCode) {
    return null;
  }

  return (
    getSmartCards().find(
      (card) => card.code.toUpperCase() === normalizedCode,
    ) ?? null
  );
}

export function getSmartCardStats() {
  const smartCards = getSmartCards();

  return {
    total: smartCards.length,
    available: smartCards.filter((card) => card.status === "available").length,
    assigned: smartCards.filter((card) => card.status === "assigned").length,
    activated: smartCards.filter((card) => card.status === "activated").length,
  };
}

export function resetSmartCardInventory() {
  const nextSmartCards = createFreshSmartCardInventory();
  const cardsPerPlan = Array.from(
    nextSmartCards.reduce((planMap, card) => {
      planMap.set(card.plan, (planMap.get(card.plan) ?? 0) + 1);
      return planMap;
    }, new Map()),
    ([plan, count]) => ({ plan, count }),
  );

  updateRuntimeState((state) => {
    state.smartCards = nextSmartCards;
    state.accounts = state.accounts.map((account) => ({
      ...account,
      smartCards: 0,
    }));
    state.payments = state.payments.map((payment) => ({
      ...payment,
      linkedCardCode: null,
    }));
    state.scratchCardReservations = [];
    state.scratchCardReveals = [];
  });

  createNotification(
    "Smart card inventory reset",
    `${cardsPerPlan.length} plan board(s) were reset to 500 available cards each.`,
    "info",
  );

  return {
    totalCards: nextSmartCards.length,
    cardsPerPlan,
  };
}

export function assignSmartCards(payload) {
  const company = sanitizeText(payload.company);
  const sector = sanitizeText(payload.sector).toLowerCase();
  const plan = sanitizeText(payload.plan).toLowerCase();
  const deviceKey = sanitizeText(payload.deviceKey);
  const quantity = Math.max(1, Math.min(smartCardsPerPlan, Number(payload.quantity ?? 1)));

  if (!company || !sector || !plan || !deviceKey) {
    throw createHttpError(
      "Company, sector, plan, device key, and quantity are required.",
    );
  }

  const updatedCards = updateRuntimeState((state) => {
    const matchingCards = state.smartCards.filter(
      (card) =>
        card.status === "available" && card.sector === sector && card.plan === plan,
    );

    if (matchingCards.length < quantity) {
      throw createHttpError(
        `Only ${matchingCards.length} available smart card(s) match that sector and plan.`,
      );
    }

    return matchingCards.slice(0, quantity).map((card) => {
      card.status = "assigned";
      card.ownerCompany = company;
      card.deviceKey = deviceKey;
      card.updatedAt = new Date().toISOString();
      return card;
    });
  });

  incrementAccountCards(company, updatedCards.length);
  createNotification(
    "Smart cards assigned",
    `${updatedCards.length} smart card(s) assigned to ${company}.`,
    "success",
  );
  broadcastSmartCardUpdate(updatedCards);

  return updatedCards;
}

export function validateSmartCard(payload) {
  const code = sanitizeText(payload.code).toUpperCase();
  const company = sanitizeText(payload.company);

  if (!code) {
    throw createHttpError("Smart card code is required.");
  }

  const result = updateRuntimeState((state) => {
    const matchedCard = state.smartCards.find(
      (item) => item.code.toUpperCase() === code,
    );

    if (!matchedCard) {
      throw createHttpError("Smart card code was not found.", 404);
    }

    if (matchedCard.status === "activated") {
      throw createHttpError("Smart card is already validated or active.");
    }

    const previousStatus = matchedCard.status;
    matchedCard.status = "activated";
    matchedCard.ownerCompany = company || matchedCard.ownerCompany;
    matchedCard.updatedAt = new Date().toISOString();

    return {
      card: matchedCard,
      previousStatus,
    };
  });

  if (result.card.ownerCompany) {
    if (result.previousStatus === "available") {
      incrementAccountCards(result.card.ownerCompany, 1);
    }

    updateAccountPlan(result.card.ownerCompany, result.card.plan);
  }

  createNotification(
    "SC card validated",
    `${result.card.code} validated${result.card.ownerCompany ? ` for ${result.card.ownerCompany}` : ""}.`,
    "success",
  );
  broadcastSmartCardUpdate([result.card]);

  return result.card;
}

export function provisionSmartCardForPayment({ company, plan, sector }) {
  const normalizedCompany = sanitizeText(company);
  const normalizedPlan = sanitizeText(plan).toLowerCase();
  const normalizedSector = sanitizeText(sector).toLowerCase();

  if (!normalizedCompany || !normalizedPlan) {
    return null;
  }

  const matchedCard = updateRuntimeState((state) => {
    const nextCard =
      state.smartCards.find(
        (card) =>
          card.status === "available" &&
          card.plan === normalizedPlan &&
          (!normalizedSector || card.sector === normalizedSector),
      ) ??
      state.smartCards.find(
        (card) => card.status === "available" && card.plan === normalizedPlan,
      );

    if (!nextCard) {
      return null;
    }

    nextCard.status = "assigned";
    nextCard.ownerCompany = normalizedCompany;
    nextCard.deviceKey = nextCard.deviceKey || getDeviceKeyForSector(nextCard.sector);
    nextCard.updatedAt = new Date().toISOString();

    return nextCard;
  });

  if (!matchedCard) {
    return null;
  }

  incrementAccountCards(normalizedCompany, 1);
  createNotification(
    "Plan linked to SC card",
    `${matchedCard.code} was linked to ${normalizedCompany} after plan payment.`,
    "info",
  );
  broadcastSmartCardUpdate([matchedCard]);

  return matchedCard;
}

function getDeviceKeyForSector(sector) {
  if (sector === "commercial") {
    return "ai-stick";
  }

  if (sector === "healthcare") {
    return "med-assistant";
  }

  if (sector === "industry") {
    return "industry-edge";
  }

  return "business-hub";
}
