import {
  assignSmartCards,
  getSmartCards,
  getSmartCardStats,
  validateSmartCard,
} from "../services/smartCardService.js";

export function getAllSmartCards(_request, response) {
  response.json({
    cards: getSmartCards(),
    stats: getSmartCardStats(),
  });
}

export function assignSmartCardsRequest(request, response) {
  const cards = assignSmartCards(request.body ?? {});

  response.status(201).json({
    cards,
  });
}

export function validateSmartCardRequest(request, response) {
  const card = validateSmartCard(request.body ?? {});

  response.json({
    card,
  });
}
