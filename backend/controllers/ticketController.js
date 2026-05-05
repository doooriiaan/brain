import { createTicket, getTickets } from "../services/ticketService.js";
import {
  controller,
  filterByContainsText,
  filterByExactText,
  limitItems,
  readQueryNumber,
  readQueryText,
  sendList,
} from "./controllerUtils.js";

export const getAllTickets = controller((request, response) => {
  const company = readQueryText(request, "company");
  const priority = readQueryText(request, "priority");
  const category = readQueryText(request, "category");
  const status = readQueryText(request, "status");
  const limit = readQueryNumber(request, "limit", {
    min: 1,
    max: 30,
  });

  let tickets = getTickets();
  tickets = filterByContainsText(tickets, company, (item) => item.company);
  tickets = filterByExactText(tickets, priority, (item) => item.priority);
  tickets = filterByExactText(tickets, category, (item) => item.category);
  tickets = filterByExactText(tickets, status, (item) => item.status);

  const total = tickets.length;
  tickets = limitItems(tickets, limit);

  sendList(response, "tickets", tickets, {
    total,
    filters: {
      company,
      priority,
      category,
      status,
      limit,
    },
  });
});

export const createTicketRequest = controller((request, response) => {
  const ticket = createTicket(request.body ?? {});

  response.status(201).json({
    message: "Ticket created successfully.",
    ticket,
  });
});
