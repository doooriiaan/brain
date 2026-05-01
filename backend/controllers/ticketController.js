import { createTicket, getTickets } from "../services/ticketService.js";

export function getAllTickets(_request, response) {
  response.json({
    tickets: getTickets(),
  });
}

export function createTicketRequest(request, response) {
  const ticket = createTicket(request.body ?? {});

  response.status(201).json({
    ticket,
  });
}
