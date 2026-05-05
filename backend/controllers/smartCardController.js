import {
  assignSmartCards,
  getSmartCards,
  getSmartCardStats,
  validateSmartCard,
} from "../services/smartCardService.js";
import {
  controller,
  filterByContainsText,
  filterByExactText,
  limitItems,
  readQueryBoolean,
  readQueryNumber,
  readQueryText,
  sendList,
} from "./controllerUtils.js";

export const getAllSmartCards = controller((request, response) => {
  const company = readQueryText(request, "company");
  const plan = readQueryText(request, "plan");
  const status = readQueryText(request, "status");
  const sector = readQueryText(request, "sector");
  const deviceKey = readQueryText(request, "deviceKey");
  const assignedOnly = readQueryBoolean(request, "assignedOnly", null);
  const limit = readQueryNumber(request, "limit", {
    min: 1,
    max: 120,
  });

  let cards = getSmartCards();
  cards = filterByContainsText(cards, company, (item) => item.ownerCompany ?? "");
  cards = filterByExactText(cards, plan, (item) => item.plan);
  cards = filterByExactText(cards, status, (item) => item.status);
  cards = filterByExactText(cards, sector, (item) => item.sector);
  cards = filterByExactText(cards, deviceKey, (item) => item.deviceKey ?? "");

  if (assignedOnly === true) {
    cards = cards.filter((card) => card.ownerCompany);
  }

  if (assignedOnly === false) {
    cards = cards.filter((card) => !card.ownerCompany);
  }

  const total = cards.length;
  cards = limitItems(cards, limit);

  response.json({
    ...sendListPayload("cards", cards, total, {
      company,
      plan,
      status,
      sector,
      deviceKey,
      assignedOnly,
      limit,
    }),
    stats: getSmartCardStats(),
  });
});

function sendListPayload(key, items, total, filters) {
  return {
    [key]: items,
    total,
    returned: items.length,
    filters,
  };
}

export const assignSmartCardsRequest = controller((request, response) => {
  const cards = assignSmartCards(request.body ?? {});

  response.status(201).json({
    message: `${cards.length} smart card(s) assigned successfully.`,
    cards,
  });
});

export const validateSmartCardRequest = controller((request, response) => {
  const card = validateSmartCard(request.body ?? {});

  response.json({
    message: `${card.code} validated successfully.`,
    card,
  });
});
