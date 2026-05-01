import { getSectorBySlug } from "./catalogService.js";
import { createNotification } from "./runtimeService.js";
import {
  createHttpError,
  createId,
  sanitizeText,
} from "./serviceHelpers.js";

const runtimeLeads = [];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getLeads() {
  return runtimeLeads;
}

export function createLead(payload) {
  const name = sanitizeText(payload.name);
  const email = sanitizeText(payload.email).toLowerCase();
  const company = sanitizeText(payload.company);
  const sector = sanitizeText(payload.sector).toLowerCase();
  const message = sanitizeText(payload.message);
  const sectorRecord = getSectorBySlug(sector);

  if (!name || !email || !company || !sector) {
    throw createHttpError("Name, email, company, and sector are required.");
  }

  if (!emailPattern.test(email)) {
    throw createHttpError("Enter a valid email address.");
  }

  if (!sectorRecord) {
    throw createHttpError("Choose a valid sector for the demo request.");
  }

  if (message.length > 600) {
    throw createHttpError("Message must stay under 600 characters.");
  }

  const lead = {
    id: createId(),
    name,
    email,
    company,
    sector,
    sectorLabel: sectorRecord.name,
    message,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  runtimeLeads.unshift(lead);
  runtimeLeads.splice(25);

  createNotification(
    "New demo request",
    `${company} requested a ${lead.sectorLabel} walkthrough.`,
    "success",
  );

  return lead;
}
