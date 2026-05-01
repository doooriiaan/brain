import { getActivations } from "./activationService.js";
import { isDatabaseConfigured } from "../config/db.js";
import { getLeads } from "./leadService.js";
import { getNotifications, getUploads } from "./runtimeService.js";
import { getTickets } from "./ticketService.js";

export function getServiceStatuses() {
  return [
    {
      key: "api",
      label: "Express API",
      status: "online",
      detail: "Content, notifications, lead capture, status checks, and uploads are reachable.",
    },
    {
      key: "uploads",
      label: "Upload pipeline",
      status: "online",
      detail: `${getUploads().length} uploaded file(s) stored through the backend.`,
    },
    {
      key: "notifications",
      label: "Runtime notifications",
      status: "online",
      detail: `${getNotifications().length} notification items are available live.`,
    },
    {
      key: "leads",
      label: "Lead capture",
      status: "online",
      detail: `${getLeads().length} demo request(s) captured through the live consultation form.`,
    },
    {
      key: "activations",
      label: "Device activation",
      status: "online",
      detail: `${getActivations().length} activation workflow(s) are tracked for rollout and provisioning.`,
    },
    {
      key: "tickets",
      label: "Support workflows",
      status: "online",
      detail: `${getTickets().length} support or automation ticket(s) are available in the runtime desk.`,
    },
    {
      key: "database",
      label: "MySQL content layer",
      status: isDatabaseConfigured ? "online" : "setup",
      detail: isDatabaseConfigured
        ? "Database credentials detected. API can read structured content from MySQL."
        : "Add .env credentials to switch from local seed content to MySQL-backed content.",
    },
    {
      key: "automation",
      label: "Platform workflows",
      status: "online",
      detail: "Lead routing, activations, uploads, and support intake are now functional in the live runtime layer.",
    },
  ];
}
