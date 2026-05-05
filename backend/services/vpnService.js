import { getRuntimeState, updateRuntimeState } from "./runtimeStore.js";
import { createHttpError, createId, sanitizeText } from "./serviceHelpers.js";

export function getVpnEndpoints() {
  return getRuntimeState().vpnEndpoints;
}

export function getVpnSessions() {
  return getRuntimeState().vpnSessions;
}

export function initiateVpnConnection(payload) {
  const userId = sanitizeText(payload.userId);
  const endpointId = sanitizeText(payload.endpointId) || "vpn-eu-1";
  const protocol = sanitizeText(payload.protocol) || "wireguard";

  if (!userId) {
    throw createHttpError("User ID is required for VPN connection.", 400);
  }

  const endpoint = getVpnEndpoints().find((item) => item.id === endpointId);

  if (!endpoint) {
    throw createHttpError("Invalid VPN endpoint.", 400);
  }

  if (endpoint.status !== "online") {
    throw createHttpError("Selected VPN endpoint is currently offline.", 503);
  }

  return updateRuntimeState((state) => {
    state.vpnSessions = state.vpnSessions.filter(
      (session) => !(session.userId === userId && session.status === "connected"),
    );

    const session = {
      id: createId(),
      userId,
      endpointId,
      location: endpoint.location,
      protocol,
      status: "connected",
      encryptionLevel: "256-bit AES",
      bandwidth: "Unlimited",
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    state.vpnSessions.unshift(session);
    state.vpnSessions = state.vpnSessions.slice(0, 100);

    return session;
  });
}

export function terminateVpnConnection(sessionId) {
  const normalizedSessionId = sanitizeText(sessionId);

  const session = updateRuntimeState((state) => {
    const index = state.vpnSessions.findIndex(
      (item) => item.id === normalizedSessionId,
    );

    if (index === -1) {
      throw createHttpError("VPN session not found.", 404);
    }

    const [removedSession] = state.vpnSessions.splice(index, 1);
    return removedSession;
  });

  return {
    message: "VPN connection terminated successfully.",
    session: {
      ...session,
      status: "disconnected",
    },
  };
}

export function getVpnStatus(userId) {
  const normalizedUserId = sanitizeText(userId);
  const activeSessions = getVpnSessions().filter(
    (session) =>
      session.userId === normalizedUserId && session.status === "connected",
  );

  return {
    userId: normalizedUserId,
    isVpnActive: activeSessions.length > 0,
    activeSessions,
    availableEndpoints: getVpnEndpoints().filter(
      (endpoint) => endpoint.status === "online",
    ),
  };
}

export function validateVpnAccess(request) {
  const vpnActive = request.headers["x-brain-vpn-active"] === "true";
  const networkMode = request.headers["x-brain-network"];

  if (vpnActive && networkMode === "private") {
    return {
      authorized: true,
      mode: "private",
      encrypted: true,
    };
  }

  return {
    authorized: false,
    mode: networkMode || "public",
    encrypted: false,
  };
}
