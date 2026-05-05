import { broadcastTicketUpdate } from "./realtimeService.js";
import { createNotification } from "./runtimeService.js";
import { getRuntimeState, updateRuntimeState } from "./runtimeStore.js";
import {
  createHttpError,
  createId,
  sanitizeText,
} from "./serviceHelpers.js";

const validPriorities = new Set(["critical", "priority", "standard"]);
const validCategories = new Set(["automation", "integration", "support"]);
const validTicketStatuses = new Set(["open", "investigating", "resolved"]);

export function getTickets() {
  return getRuntimeState().tickets;
}

export function createTicket(payload) {
  const company = sanitizeText(payload.company);
  const contactEmail = sanitizeText(payload.contactEmail).toLowerCase();
  const priority = sanitizeText(payload.priority).toLowerCase();
  const category = sanitizeText(payload.category).toLowerCase();
  const summary = sanitizeText(payload.summary);

  if (!company || !contactEmail || !priority || !category || !summary) {
    throw createHttpError(
      "Company, contact email, priority, category, and summary are required.",
    );
  }

  if (!validPriorities.has(priority) || !validCategories.has(category)) {
    throw createHttpError("Choose a valid priority and ticket category.");
  }

  if (summary.length > 280) {
    throw createHttpError("Summary must stay under 280 characters.");
  }

  const ticket = updateRuntimeState((state) => {
    const nextTicket = {
      id: createId(),
      company,
      contactEmail,
      priority,
      category,
      summary,
      status: priority === "critical" ? "investigating" : "open",
      createdAt: new Date().toISOString(),
    };

    state.tickets.unshift(nextTicket);
    state.tickets = state.tickets.slice(0, 20);

    return nextTicket;
  });

  createNotification(
    "Support workflow opened",
    `${company} opened a ${priority} ${category} ticket.`,
    priority === "critical" ? "warning" : "info",
  );
  broadcastTicketUpdate(ticket);

  return ticket;
}

export function updateTicketStatus(id, status) {
  const normalizedStatus = sanitizeText(status).toLowerCase();

  const ticket = updateRuntimeState((state) => {
    const matchedTicket = state.tickets.find((item) => item.id === id);

    if (!matchedTicket) {
      throw createHttpError("Ticket not found.", 404);
    }

    if (!validTicketStatuses.has(normalizedStatus)) {
      throw createHttpError("Choose a valid ticket status.");
    }

    matchedTicket.status = normalizedStatus;
    return matchedTicket;
  });

  createNotification(
    "Ticket updated",
    `${ticket.company} ticket moved to ${normalizedStatus}.`,
    normalizedStatus === "resolved" ? "success" : "info",
  );
  broadcastTicketUpdate(ticket);

  return ticket;
}
