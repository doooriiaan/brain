import { getLandingContent } from "../services/contentService.js";
import { controller, readQueryBoolean } from "./controllerUtils.js";

export const getContent = controller(async (request, response) => {
  const includeMeta = readQueryBoolean(request, "includeMeta", false);
  const content = await getLandingContent();

  response.json(
    includeMeta
      ? {
          ...content,
          meta: {
            source: content.source,
            sectors: content.sectors.length,
            devices: content.devices.length,
            plans: content.plans.length,
          },
        }
      : content,
  );
});
