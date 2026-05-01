import { isDatabaseConfigured } from "../config/db.js";
import { getNotifications, getUploads } from "./runtimeService.js";

export function getServiceStatuses() {
  return [
    {
      key: "api",
      label: "Express API",
      status: "online",
      detail: "Content, notifications, status checks, and uploads are reachable.",
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
      status: "ready",
      detail: "Prepared for forms, activation flows, admin actions, and future automation hooks.",
    },
  ];
}
