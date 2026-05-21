import axios from "axios";
import io from "socket.io-client";

type RuntimeHeaderConfig = {
  language: string;
  country: string;
  networkLabel: string;
  networkMode: "live" | "country" | "private";
};

let socket: ReturnType<typeof io> | null = null;

export function setAuthToken(token: string | null) {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete axios.defaults.headers.common.Authorization;
}

export function getRequestErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }

    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export async function updateAuthProfile(payload: {
  name: string;
  email: string;
}) {
  const response = await axios.patch("/api/auth/profile", payload);
  return response.data;
}

export async function updateAuthPassword(payload: {
  currentPassword: string;
  nextPassword: string;
}) {
  const response = await axios.patch("/api/auth/password", payload);
  return response.data;
}

export function syncRuntimeHeaders({
  language,
  country,
  networkLabel,
  networkMode,
}: RuntimeHeaderConfig) {
  axios.defaults.headers.common["x-brain-language"] = language;
  axios.defaults.headers.common["x-brain-country"] = country;
  axios.defaults.headers.common["x-brain-network"] = networkLabel;
  axios.defaults.headers.common["x-brain-vpn-active"] =
    networkMode === "private" ? "true" : "false";
}

/**
 * Get language recommendation from country code
 */
export async function getLanguageFromCountry(countryCode: string) {
  try {
    const response = await axios.get(
      `/api/localization/language/${countryCode}`,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get language for country:", error);
    throw error;
  }
}

/**
 * Get all available countries grouped by region
 */
export async function getCountriesByRegion() {
  try {
    const response = await axios.get("/api/localization/countries");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch countries:", error);
    throw error;
  }
}

/**
 * Validate localization configuration
 */
export async function validateLocalization(
  countryCode?: string,
  languageCode?: string,
) {
  try {
    const response = await axios.post("/api/localization/validate", {
      countryCode,
      languageCode,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to validate localization:", error);
    throw error;
  }
}

/**
 * Initialize real-time WebSocket connection
 */
export function initializeRealtime(userId: string) {
  if (socket) {
    return socket;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "";

  socket = io(apiUrl, {
    query: { userId },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("Connected to real-time server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from real-time server");
  });

  return socket;
}

/**
 * Get real-time socket instance
 */
export function getRealtimeSocket() {
  return socket;
}

/**
 * Subscribe to real-time updates
 */
export function subscribeToUpdates(
  eventName: string,
  callback: (data: unknown) => void,
) {
  if (!socket) {
    console.warn("Real-time socket not initialized");
    return;
  }

  socket.on(eventName, callback);

  return () => {
    socket?.off(eventName, callback);
  };
}

/**
 * Get VPN endpoints
 */
export async function getVpnEndpoints() {
  try {
    const response = await axios.get("/api/vpn/endpoints");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch VPN endpoints:", error);
    throw error;
  }
}

/**
 * Initiate VPN connection
 */
export async function initiateVpnConnection(
  userId: string,
  endpointId?: string,
  protocol?: string,
) {
  try {
    const response = await axios.post("/api/vpn/connect", {
      userId,
      endpointId,
      protocol,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to initiate VPN connection:", error);
    throw error;
  }
}

/**
 * Terminate VPN connection
 */
export async function terminateVpnConnection(sessionId: string) {
  try {
    const response = await axios.post(`/api/vpn/disconnect/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to terminate VPN connection:", error);
    throw error;
  }
}

/**
 * Get VPN status for user
 */
export async function getVpnStatus(userId: string) {
  try {
    const response = await axios.get(`/api/vpn/status/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get VPN status:", error);
    throw error;
  }
}

/**
 * Reveal scratch card
 */
export async function revealScratchCard(userId: string, company: string) {
  try {
    const response = await axios.post("/api/scratch/reveal", {
      userId,
      company,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to reveal scratch card:", error);
    throw error;
  }
}

/**
 * Validate scratch card code
 */
export async function validateScratchCard(
  userId: string,
  company: string,
  code: string,
) {
  try {
    const response = await axios.post("/api/scratch/validate", {
      userId,
      company,
      code,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to validate scratch card:", error);
    throw error;
  }
}

/**
 * Get scratch card status for user
 */
export async function getScratchCardStatus(userId: string) {
  try {
    const response = await axios.get(`/api/scratch/status/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get scratch card status:", error);
    throw error;
  }
}

/**
 * Get all scratch card reveals (admin)
 */
export async function getScratchCardReveals() {
  try {
    const response = await axios.get("/api/scratch/reveals");
    return response.data;
  } catch (error) {
    console.error("Failed to get scratch card reveals:", error);
    throw error;
  }
}

/**
 * Get scratch card statistics
 */
export async function getScratchCardStats() {
  try {
    const response = await axios.get("/api/scratch/stats");
    return response.data;
  } catch (error) {
    console.error("Failed to get scratch card stats:", error);
    throw error;
  }
}

/**
 * Disconnect real-time socket
 */
export function disconnectRealtime() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
