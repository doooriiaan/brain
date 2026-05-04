import axios from "axios";

type RuntimeHeaderConfig = {
  language: string;
  country: string;
  networkLabel: string;
  networkMode: "live" | "country" | "private";
};

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
