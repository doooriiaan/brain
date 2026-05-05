import { getSessionByToken } from "../services/authService.js";
import { createHttpError } from "../services/serviceHelpers.js";

function extractBearerToken(request) {
  const authorizationHeader = request.headers.authorization;

  if (typeof authorizationHeader !== "string") {
    return "";
  }

  return authorizationHeader.replace(/^Bearer\s+/i, "").trim();
}

export function verifySessionToken(request, _response, next) {
  const token = extractBearerToken(request);

  if (!token) {
    throw createHttpError("Authorization token is required.", 401);
  }

  const session = getSessionByToken(token);

  if (!session) {
    throw createHttpError("Session is invalid or expired.", 401);
  }

  request.authSession = session;
  next();
}

export function verifyAdminToken(request, response, next) {
  verifySessionToken(request, response, () => {
    if (request.authSession?.user.role !== "admin") {
      throw createHttpError("Admin authorization failed.", 403);
    }

    request.adminVerified = true;
    next();
  });
}

export function verifyClientToken(request, response, next) {
  verifySessionToken(request, response, () => {
    const role = request.authSession?.user.role;

    if (role !== "client" && role !== "admin") {
      throw createHttpError("Client authorization failed.", 403);
    }

    request.clientSession = request.authSession;
    next();
  });
}

export function verifyVpnMode(request, _response, next) {
  const vpnActive = request.headers["x-brain-vpn-active"] === "true";
  const networkMode = request.headers["x-brain-network"] || "public";

  if (vpnActive && networkMode === "private") {
    request.vpnAuthenticated = true;
  }

  request.networkMode = networkMode;
  next();
}

export function asyncHandler(fn) {
  return (request, response, next) => {
    Promise.resolve(fn(request, response, next)).catch(next);
  };
}
