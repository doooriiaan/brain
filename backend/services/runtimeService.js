import {
  broadcastNotification,
  broadcastUploadComplete,
} from "./realtimeService.js";
import { getRuntimeState, updateRuntimeState } from "./runtimeStore.js";
import { createId } from "./serviceHelpers.js";

export function getNotifications() {
  return getRuntimeState().notifications;
}

export function createNotification(title, body, level = "info") {
  const notification = updateRuntimeState((state) => {
    const nextNotification = {
      id: createId(),
      title,
      body,
      level,
      createdAt: new Date().toISOString(),
    };

    state.notifications.unshift(nextNotification);
    state.notifications = state.notifications.slice(0, 10);

    return nextNotification;
  });

  broadcastNotification(notification);
  return notification;
}

export function getUploads() {
  return getRuntimeState().uploads;
}

export function storeRuntimeUploads(uploads) {
  updateRuntimeState((state) => {
    state.uploads.unshift(...uploads);
    state.uploads = state.uploads.slice(0, 8);
  });

  uploads.forEach((upload) => {
    broadcastUploadComplete(upload);
  });

  return uploads;
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
