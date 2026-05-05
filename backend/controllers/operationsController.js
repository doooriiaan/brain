import { getOperationsOverview } from "../services/operationsService.js";
import { controller, limitItems, readQueryNumber } from "./controllerUtils.js";

export const getOverview = controller((request, response) => {
  const timelineLimit = readQueryNumber(request, "timelineLimit", {
    min: 1,
    max: 20,
  });
  const metricsLimit = readQueryNumber(request, "metricsLimit", {
    min: 1,
    max: 12,
  });
  const servicesLimit = readQueryNumber(request, "servicesLimit", {
    min: 1,
    max: 20,
  });
  const notificationsLimit = readQueryNumber(request, "notificationsLimit", {
    min: 1,
    max: 20,
  });

  const overview = getOperationsOverview();

  response.json({
    ...overview,
    timeline: limitItems(overview.timeline, timelineLimit),
    metrics: limitItems(overview.metrics, metricsLimit),
    services: limitItems(overview.services, servicesLimit),
    notifications: limitItems(overview.notifications, notificationsLimit),
    meta: {
      filters: {
        timelineLimit,
        metricsLimit,
        servicesLimit,
        notificationsLimit,
      },
    },
  });
});
