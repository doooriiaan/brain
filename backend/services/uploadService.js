import {
  createNotification,
  createUploadRecord,
  getUploads as getRuntimeUploads,
  storeRuntimeUploads,
} from "./runtimeService.js";

export function getUploads() {
  return getRuntimeUploads();
}

export function storeUploads(files) {
  const uploads = files.map((file) => createUploadRecord(file));

  storeRuntimeUploads(uploads);
  createNotification(
    "Upload completed",
    `${uploads.length} file(s) uploaded successfully to the live backend.`,
    "success",
  );

  return uploads;
}
