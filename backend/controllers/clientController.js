import { getClientOverview } from "../services/clientPortalService.js";
import {
  controller,
  limitItems,
  readQueryNumber,
  readQueryText,
} from "./controllerUtils.js";

export const getClientDashboard = controller((request, response) => {
  const requestedCompany = readQueryText(request, "company");
  const paymentsLimit = readQueryNumber(request, "paymentsLimit", {
    min: 1,
    max: 20,
  });
  const cardsLimit = readQueryNumber(request, "cardsLimit", {
    min: 1,
    max: 50,
  });
  const activationsLimit = readQueryNumber(request, "activationsLimit", {
    min: 1,
    max: 20,
  });
  const ticketsLimit = readQueryNumber(request, "ticketsLimit", {
    min: 1,
    max: 20,
  });
  const notificationsLimit = readQueryNumber(request, "notificationsLimit", {
    min: 1,
    max: 20,
  });

  const company =
    request.authSession?.user.role === "client"
      ? request.authSession.user.company
      : requestedCompany;

  const isClientSession = request.authSession?.user.role === "client";
  const overview = getClientOverview(company, {
    includeClients: !isClientSession,
  });

  response.json({
    ...overview,
    payments: limitItems(overview.payments, paymentsLimit),
    smartCards: limitItems(overview.smartCards, cardsLimit),
    activations: limitItems(overview.activations, activationsLimit),
    tickets: limitItems(overview.tickets, ticketsLimit),
    notifications: limitItems(overview.notifications, notificationsLimit),
    meta: {
      selectedCompany: overview.account?.company ?? company ?? null,
      filters: {
        company,
        paymentsLimit,
        cardsLimit,
        activationsLimit,
        ticketsLimit,
        notificationsLimit,
      },
    },
  });
});
