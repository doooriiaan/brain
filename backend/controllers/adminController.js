import {
  assignAdminSmartCards,
  broadcastAdminNotification,
  getAdminOverview,
  setAdminActivationStatus,
  setAdminTicketStatus,
} from "../services/adminService.js";
import {
  controller,
  limitItems,
  readBodyText,
  readParamText,
  readQueryNumber,
} from "./controllerUtils.js";

export const getAdminDashboard = controller((request, response) => {
  const paymentsLimit = readQueryNumber(request, "paymentsLimit", {
    min: 1,
    max: 30,
  });
  const accountsLimit = readQueryNumber(request, "accountsLimit", {
    min: 1,
    max: 30,
  });
  const cardsLimit = readQueryNumber(request, "cardsLimit", {
    min: 1,
    max: 80,
  });
  const activationsLimit = readQueryNumber(request, "activationsLimit", {
    min: 1,
    max: 30,
  });
  const ticketsLimit = readQueryNumber(request, "ticketsLimit", {
    min: 1,
    max: 30,
  });
  const leadsLimit = readQueryNumber(request, "leadsLimit", {
    min: 1,
    max: 30,
  });
  const timelineLimit = readQueryNumber(request, "timelineLimit", {
    min: 1,
    max: 20,
  });

  const overview = getAdminOverview();

  response.json({
    ...overview,
    payments: limitItems(overview.payments, paymentsLimit),
    smartCards: limitItems(overview.smartCards, cardsLimit),
    accounts: limitItems(overview.accounts, accountsLimit),
    activations: limitItems(overview.activations, activationsLimit),
    tickets: limitItems(overview.tickets, ticketsLimit),
    leads: limitItems(overview.leads, leadsLimit),
    timeline: limitItems(overview.timeline, timelineLimit),
    meta: {
      filters: {
        paymentsLimit,
        accountsLimit,
        cardsLimit,
        activationsLimit,
        ticketsLimit,
        leadsLimit,
        timelineLimit,
      },
    },
  });
});

export const broadcastNotificationRequest = controller((request, response) => {
  readBodyText(request, "title", "Notification title");
  readBodyText(request, "body", "Notification body");
  const notification = broadcastAdminNotification(request.body ?? {});

  response.status(201).json({
    message: "Admin notification broadcasted successfully.",
    notification,
  });
});

export const updateActivationStatusRequest = controller((request, response) => {
  const id = readParamText(request, "id", "Activation id");
  readBodyText(request, "status", "Activation status");
  const activation = setAdminActivationStatus(
    id,
    request.body?.status,
  );

  response.json({
    message: "Activation status updated successfully.",
    activation,
  });
});

export const updateTicketStatusRequest = controller((request, response) => {
  const id = readParamText(request, "id", "Ticket id");
  readBodyText(request, "status", "Ticket status");
  const ticket = setAdminTicketStatus(id, request.body?.status);

  response.json({
    message: "Ticket status updated successfully.",
    ticket,
  });
});

export const assignCardsAdminRequest = controller((request, response) => {
  readBodyText(request, "company", "Company");
  readBodyText(request, "sector", "Sector");
  readBodyText(request, "plan", "Plan");
  readBodyText(request, "deviceKey", "Device key");
  const cards = assignAdminSmartCards(request.body ?? {});

  response.status(201).json({
    message: `${cards.length} smart card(s) assigned successfully.`,
    cards,
  });
});
