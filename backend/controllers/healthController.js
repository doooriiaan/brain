import { controller } from "./controllerUtils.js";

export const getHealth = controller((request, response) => {
  const route = request.get("x-brain-network") ?? "live";
  const vpnActive = request.get("x-brain-vpn-active") === "true";

  response.json({
    status: "ok",
    service: "brain-backend",
    network: {
      language: request.get("x-brain-language") ?? "en",
      country: request.get("x-brain-country") ?? "XK",
      route,
      vpnActive,
      secureTransport: vpnActive
        ? "private"
        : route === "country-route"
          ? "regional"
          : "open",
      detectedAt: new Date().toISOString(),
    },
  });
});
