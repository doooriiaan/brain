import { createNotification } from "./runtimeService.js";
import {
  createHttpError,
  createId,
  sanitizeText,
} from "./serviceHelpers.js";

const validPriorities = new Set(["critical", "priority", "standard"]);
const validCategories = new Set(["automation", "integration", "support"]);

const runtimeTickets = [
  {
    id: "ticket-1",
    company: "Astra Group",
    contactEmail: "ops@astra-group.com",
    priority: "priority",
    category: "integration",
    summary: "Need CRM sync rules mapped for business hub deployments.",
    status: "investigating",
    createdAt: new Date(Date.now() - 1000 * 60 * 21).toISOString(),
  },
  {
    id: "ticket-2",
    company: "Factory One",
    contactEmail: "maintenance@factory-one.eu",
    priority: "standard",
    category: "automation",
    summary: "Prepare anomaly alert routing for edge box proof-of-concept.",
    status: "open",
    createdAt: new Date(Date.now() - 1000 * 60 * 67).toISOString(),
  },
];

export function getTickets() {
  return runtimeTickets;
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

  const ticket = {
    id: createId(),
    company,
    contactEmail,
    priority,
    category,
    summary,
    status: priority === "critical" ? "investigating" : "open",
    createdAt: new Date().toISOString(),
  };

  runtimeTickets.unshift(ticket);
  runtimeTickets.splice(12);

  createNotification(
    "Support workflow opened",
    `${company} opened a ${priority} ${category} ticket.`,
    priority === "critical" ? "warning" : "info",
  );

  return ticket;
}
