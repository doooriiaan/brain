/**
 * Scratch Card Controller
 * Handles card reveal and validation endpoints
 */

import {
  revealScratchCard,
  validateScratchCard,
  getUserScratchCardStatus,
  getScratchCardReveals,
  getScratchCardStats,
} from "../services/scratchCardService.js";
import {
  controller,
  limitItems,
  readParamText,
  readQueryNumber,
  sendList,
} from "./controllerUtils.js";
import { createHttpError } from "../services/serviceHelpers.js";

export const revealScratchCardRequest = controller((request, response) => {
  if (
    request.authSession?.user.role === "client" &&
    request.body?.userId !== request.authSession.user.id
  ) {
    throw createHttpError(
      "Scratch-card reveal can only be requested for the active client session.",
      403,
    );
  }

  const result = revealScratchCard(request.body ?? {});
  response.status(201).json(result);
});

export const validateScratchCardRequest = controller((request, response) => {
  if (
    request.authSession?.user.role === "client" &&
    request.body?.userId !== request.authSession.user.id
  ) {
    throw createHttpError(
      "Scratch-card validation can only be requested for the active client session.",
      403,
    );
  }

  const result = validateScratchCard(request.body ?? {});
  response.status(200).json(result);
});

export const getUserScratchCardStatusRequest = controller((request, response) => {
  const userId = readParamText(request, "userId", "User id");

  if (
    request.authSession?.user.role === "client" &&
    userId !== request.authSession.user.id
  ) {
    throw createHttpError(
      "Scratch-card status can only be read for the active client session.",
      403,
    );
  }

  const status = getUserScratchCardStatus(userId);
  response.json(status);
});

export const getScratchCardRevealsRequest = controller((request, response) => {
  const limit = readQueryNumber(request, "limit", {
    min: 1,
    max: 50,
  });
  const reveals = getScratchCardReveals();
  const total = reveals.length;

  sendList(response, "reveals", limitItems(reveals, limit), {
    total,
    filters: {
      limit,
    },
  });
});

export const getScratchCardStatsRequest = controller((_request, response) => {
  const stats = getScratchCardStats();
  response.json(stats);
});
