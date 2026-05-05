import {
  getVpnEndpoints,
  getVpnSessions,
  initiateVpnConnection,
  terminateVpnConnection,
  getVpnStatus,
} from "../services/vpnService.js";
import {
  controller,
  filterByExactText,
  limitItems,
  readParamText,
  readQueryNumber,
  readQueryText,
  sendList,
} from "./controllerUtils.js";

export const getVpnEndpointsRequest = controller((request, response) => {
  const country = readQueryText(request, "country");
  const status = readQueryText(request, "status");
  const limit = readQueryNumber(request, "limit", {
    min: 1,
    max: 20,
  });

  let endpoints = getVpnEndpoints();
  endpoints = filterByExactText(endpoints, country, (item) => item.country);
  endpoints = filterByExactText(endpoints, status, (item) => item.status);

  const total = endpoints.length;
  endpoints = limitItems(endpoints, limit);

  sendList(response, "endpoints", endpoints, {
    total,
    filters: {
      country,
      status,
      limit,
    },
  });
});

export const getVpnSessionsRequest = controller((request, response) => {
  const userId = readQueryText(request, "userId");
  const status = readQueryText(request, "status");
  const limit = readQueryNumber(request, "limit", {
    min: 1,
    max: 100,
  });

  let sessions = getVpnSessions();
  sessions = filterByExactText(sessions, userId, (item) => item.userId);
  sessions = filterByExactText(sessions, status, (item) => item.status);

  const total = sessions.length;
  sessions = limitItems(sessions, limit);

  sendList(response, "sessions", sessions, {
    total,
    filters: {
      userId,
      status,
      limit,
    },
  });
});

export const initiateVpnConnectionRequest = controller((request, response) => {
  const connection = initiateVpnConnection(request.body ?? {});

  response.status(201).json({
    connection,
    message: `Connected to ${connection.location} VPN endpoint`,
  });
});

export const terminateVpnConnectionRequest = controller((request, response) => {
  const sessionId = readParamText(request, "sessionId", "VPN session id");
  const result = terminateVpnConnection(sessionId);

  response.json(result);
});

export const getVpnStatusRequest = controller((request, response) => {
  const userId = readParamText(request, "userId", "User id");
  const status = getVpnStatus(userId);

  response.json(status);
});
