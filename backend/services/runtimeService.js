import { createId } from "./serviceHelpers.js";

const runtimeNotifications = [
  {
    id: "notification-1",
    title: "Platform ready",
    body: "Frontend, Express API, lead capture, activations, support tickets, and MySQL-ready content service are available.",
    level: "success",
    createdAt: new Date().toISOString(),
  },
  {
    id: "notification-2",
    title: "Uploads enabled",
    body: "Use the live upload panel to store files through the backend.",
    level: "info",
    createdAt: new Date(Date.now() - 1000 * 60 * 13).toISOString(),
  },
  {
    id: "notification-3",
    title: "MySQL mode",
    body: "Add .env credentials to switch from seed content to database content.",
    level: "warning",
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
  },
];

const runtimeUploads = [];

export function getNotifications() {
  return runtimeNotifications;
}

export function createNotification(title, body, level = "info") {
  runtimeNotifications.unshift({
    id: createId(),
    title,
    body,
    level,
    createdAt: new Date().toISOString(),
  });

  runtimeNotifications.splice(10);
}

export function getUploads() {
  return runtimeUploads;
}

export function storeRuntimeUploads(uploads) {
  runtimeUploads.unshift(...uploads);
  runtimeUploads.splice(8);
}

export function createUploadRecord(file) {
  return {
    id: createId(),
    fileName: file.originalname,
    sizeKb: Math.max(1, Math.round(file.size / 1024)),
    uploadedAt: new Date().toISOString(),
    url: `/uploads/${file.filename}`,
  };
}
