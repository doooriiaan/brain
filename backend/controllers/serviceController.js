import { getServiceStatuses } from "../services/serviceStatusService.js";

export function getAllServiceStatuses(_request, response) {
  response.json({
    services: getServiceStatuses(),
  });
}
