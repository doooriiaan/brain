import { getOperationsOverview } from "../services/operationsService.js";

export function getOverview(_request, response) {
  response.json(getOperationsOverview());
}
