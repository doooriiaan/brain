import { getServiceStatuses } from "../services/serviceStatusService.js";
import {
  controller,
  filterByContainsText,
  filterByExactText,
  limitItems,
  readQueryNumber,
  readQueryText,
  sendList,
} from "./controllerUtils.js";

export const getAllServiceStatuses = controller((request, response) => {
  const status = readQueryText(request, "status");
  const search = readQueryText(request, "search");
  const limit = readQueryNumber(request, "limit", {
    min: 1,
    max: 20,
  });

  let services = getServiceStatuses();
  services = filterByExactText(services, status, (item) => item.status);
  services = filterByContainsText(
    services,
    search,
    (item) => `${item.label} ${item.detail}`,
  );

  const total = services.length;
  services = limitItems(services, limit);

  sendList(response, "services", services, {
    total,
    filters: {
      status,
      search,
      limit,
    },
  });
});
