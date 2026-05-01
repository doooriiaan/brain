import { getUploads, storeUploads } from "../services/uploadService.js";

export function getAllUploads(_request, response) {
  response.json({
    uploads: getUploads(),
  });
}

export function createUploads(request, response) {
  const files = Array.isArray(request.files) ? request.files : [];
  const uploads = storeUploads(files);

  response.status(201).json({
    uploads,
  });
}
