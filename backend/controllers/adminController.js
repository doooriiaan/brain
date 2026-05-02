import {
  assignAdminSmartCards,
  broadcastAdminNotification,
  getAdminOverview,
  setAdminActivationStatus,
  setAdminTicketStatus,
} from "../services/adminService.js";

export function getAdminDashboard(_request, response) {
  response.json(getAdminOverview());
}

export function broadcastNotificationRequest(request, response) {
  const notification = broadcastAdminNotification(request.body ?? {});

  response.status(201).json({
    notification,
  });
}

export function updateActivationStatusRequest(request, response) {
  const activation = setAdminActivationStatus(
    request.params.id,
    request.body?.status,
  );

  response.json({
    activation,
  });
}

export function updateTicketStatusRequest(request, response) {
  const ticket = setAdminTicketStatus(request.params.id, request.body?.status);

  response.json({
    ticket,
  });
}

export function assignCardsAdminRequest(request, response) {
  const cards = assignAdminSmartCards(request.body ?? {});

  response.status(201).json({
    cards,
  });
}
