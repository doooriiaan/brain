import { broadcastSmartCardUpdate } from "./realtimeService.js";
import { incrementAccountCards, updateAccountPlan } from "./accountService.js";
import { createNotification } from "./runtimeService.js";
import { getRuntimeState, updateRuntimeState } from "./runtimeStore.js";
import { createHttpError, createId, sanitizeText } from "./serviceHelpers.js";

const FREE_PLAN_SLUG = "free";

function purgeExpiredReservations(state) {
  const now = Date.now();
  state.scratchCardReservations = state.scratchCardReservations.filter(
    (reservation) => reservation.expiresAt > now,
  );
}

function findReservation(state, userId) {
  return (
    state.scratchCardReservations.find(
      (reservation) => reservation.userId === userId,
    ) ?? null
  );
}

export function revealScratchCard(payload) {
  const userId = sanitizeText(payload.userId);
  const company = sanitizeText(payload.company);

  if (!userId || !company) {
    throw createHttpError("User ID and company are required.", 400);
  }

  const reservation = updateRuntimeState((state) => {
    purgeExpiredReservations(state);

    const existingReservation = findReservation(state, userId);

    if (existingReservation) {
      return existingReservation;
    }

    const reservedCardIds = new Set(
      state.scratchCardReservations.map((item) => item.cardId),
    );
    const availableCards = state.smartCards.filter(
      (card) =>
        card.status === "available" &&
        card.plan === FREE_PLAN_SLUG &&
        card.ownerCompany === null &&
        !reservedCardIds.has(card.id),
    );

    if (availableCards.length === 0) {
      throw createHttpError(
        "No available scratch cards at the moment. Please try again later.",
        503,
      );
    }

    const randomCard =
      availableCards[Math.floor(Math.random() * availableCards.length)];

    const nextReservation = {
      id: createId(),
      userId,
      company,
      cardId: randomCard.id,
      code: randomCard.code,
      sector: randomCard.sector,
      plan: randomCard.plan,
      expiresAt: Date.now() + 15 * 60 * 1000,
      createdAt: new Date().toISOString(),
    };

    state.scratchCardReservations.unshift(nextReservation);
    state.scratchCardReservations = state.scratchCardReservations.slice(0, 250);
    state.scratchCardReveals.unshift(nextReservation);
    state.scratchCardReveals = state.scratchCardReveals.slice(0, 250);

    return nextReservation;
  });

  if (reservation.company !== company) {
    throw createHttpError("Scratch card reservation belongs to another workspace.", 403);
  }

  if (reservation.expiresAt > Date.now()) {
    return {
      id: reservation.id,
      code: reservation.code,
      sector: reservation.sector,
      plan: reservation.plan,
      status: "revealed",
      expiresIn: Math.max(reservation.expiresAt - Date.now(), 0),
      message: "Scratch card revealed! Code expires in 15 minutes.",
    };
  }

  throw createHttpError("Scratch card reservation expired. Please reveal a new card.", 410);
}

export function validateScratchCard(payload) {
  const userId = sanitizeText(payload.userId);
  const code = sanitizeText(payload.code).toUpperCase();
  const company = sanitizeText(payload.company);

  if (!userId || !code || !company) {
    throw createHttpError("User ID, code, and company are required.", 400);
  }

  const result = updateRuntimeState((state) => {
    purgeExpiredReservations(state);

    const reservation = findReservation(state, userId);

    if (!reservation) {
      throw createHttpError(
        "No active scratch card reservation found. Reveal a card first.",
        404,
      );
    }

    if (reservation.code !== code) {
      throw createHttpError("Invalid scratch card code.", 401);
    }

    if (reservation.plan !== FREE_PLAN_SLUG) {
      throw createHttpError(
        "Only the Free validation flow can be completed here. Paid plans require admin approval.",
        403,
      );
    }

    const card = state.smartCards.find((item) => item.id === reservation.cardId);

    if (!card) {
      throw createHttpError("Reserved scratch card could not be found.", 404);
    }

    card.status = "activated";
    card.ownerCompany = company;
    card.updatedAt = new Date().toISOString();

    state.scratchCardReservations = state.scratchCardReservations.filter(
      (item) => item.userId !== userId,
    );

    return {
      reservation,
      card,
      validatedAt: new Date().toISOString(),
    };
  });

  incrementAccountCards(company, 1);
  if (result.card.plan !== FREE_PLAN_SLUG) {
    updateAccountPlan(company, result.card.plan);
  }
  createNotification(
    "Scratch card activated",
    `${result.card.code} was activated for ${company}.`,
    "success",
  );
  broadcastSmartCardUpdate([result.card]);

  return {
    success: true,
    message:
      result.card.plan === FREE_PLAN_SLUG
        ? `Free validation activated for ${company}.`
        : `Scratch card activated for ${company}!`,
    card: {
      id: result.reservation.cardId,
      code: result.reservation.code,
      sector: result.reservation.sector,
      plan: result.reservation.plan,
    },
    validatedAt: result.validatedAt,
  };
}

export function getScratchCardReveals() {
  return getRuntimeState().scratchCardReveals;
}

export function getUserScratchCardStatus(userId) {
  const normalizedUserId = sanitizeText(userId);
  const state = getRuntimeState();

  if (!normalizedUserId) {
    return {
      hasActiveReservation: false,
      message: "No active scratch card. Reveal a card to get started.",
    };
  }

  let reservation = findReservation(state, normalizedUserId);

  if (reservation && reservation.expiresAt < Date.now()) {
    updateRuntimeState((draft) => {
      purgeExpiredReservations(draft);
    });
    reservation = null;
  }

  if (!reservation) {
    return {
      hasActiveReservation: false,
      message: "No active scratch card. Reveal a card to get started.",
    };
  }

  return {
    hasActiveReservation: true,
    expiresIn: Math.max(reservation.expiresAt - Date.now(), 0),
    sector: reservation.sector,
    plan: reservation.plan,
    code: reservation.code,
    message: "Scratch card is ready for validation.",
  };
}

export function getScratchCardStats() {
  const state = getRuntimeState();
  const now = Date.now();
  const activeReservations = state.scratchCardReservations.filter(
    (reservation) => reservation.expiresAt > now,
  ).length;

  return {
    totalReveals: state.scratchCardReveals.length,
    activeReservations,
    revealedThisSession: state.scratchCardReveals.filter(
      (reveal) => new Date(reveal.createdAt).getTime() > now - 60 * 60 * 1000,
    ).length,
  };
}
