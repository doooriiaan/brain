import { getUploads, storeUploads } from "../services/uploadService.js";
import {
  controller,
  filterByContainsText,
  limitItems,
  readQueryNumber,
  readQueryText,
  sendList,
} from "./controllerUtils.js";

export const getAllUploads = controller((request, response) => {
  const search = readQueryText(request, "search");
  const limit = readQueryNumber(request, "limit", {
    min: 1,
    max: 40,
  });

  let uploads = getUploads();
  uploads = filterByContainsText(
    uploads,
    search,
    (item) => `${item.fileName} ${item.url}`,
  );

  const total = uploads.length;
  uploads = limitItems(uploads, limit);

  sendList(response, "uploads", uploads, {
    total,
    filters: {
      search,
      limit,
    },
  });
});

export const createUploads = controller((request, response) => {
  const files = Array.isArray(request.files) ? request.files : [];
  const uploads = storeUploads(files);

  response.status(201).json({
    message: `${uploads.length} upload(s) stored successfully.`,
    uploads,
  });
});
