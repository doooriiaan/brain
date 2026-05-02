import { getClientOverview } from "../services/clientPortalService.js";

export function getClientDashboard(request, response) {
  response.json(
    getClientOverview(request.query.company?.toString() ?? ""),
  );
}
