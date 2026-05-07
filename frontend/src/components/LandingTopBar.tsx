import {
  Globe,
  Languages,
  Shield,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import type { CountryOption, LanguageOption } from "../data/runtimeOptions";

type VpnEndpoint = {
  id: string;
  location: string;
  country: string;
  status: string;
};

type UiMessage = {
  tone: "success" | "error" | "info";
  text: string;
} | null;

type LandingTopBarProps = {
  countryOptions: CountryOption[];
  currentUserLabel: string;
  languageOptions: LanguageOption[];
  onCountryChange: (countryCode: string) => void;
  onLanguageChange: (languageCode: string) => void;
  onToggleVpn: () => void;
  onVpnEndpointChange: (endpointId: string) => void;
  selectedCountry: string;
  selectedEndpointId: string;
  selectedLanguage: string;
  vpnActive: boolean;
  vpnBusy: boolean;
  vpnEndpoints: VpnEndpoint[];
  vpnMessage: UiMessage;
};

function getMessageToneClass(tone?: "success" | "error" | "info") {
  if (tone === "success") {
    return "status-text-success";
  }

  if (tone === "error") {
    return "status-text-error";
  }

  return "status-text-muted";
}

export function LandingTopBar({
  countryOptions,
  currentUserLabel,
  languageOptions,
  onCountryChange,
  onLanguageChange,
  onToggleVpn,
  onVpnEndpointChange,
  selectedCountry,
  selectedEndpointId,
  selectedLanguage,
  vpnActive,
  vpnBusy,
  vpnEndpoints,
  vpnMessage,
}: LandingTopBarProps) {
  return (
    <header className="topbar-shell">
      <div className="brand-lockup">
        <img
          alt="brAIn logo"
          className="brand-mark notranslate"
          src="/brand/brain-logo.svg"
          translate="no"
        />
        <div className="brand-copy">
          <span className="brand-pill">HW + SW AI deployment</span>
          <p className="brand-helper">
            One access layer for device rollout, routing, and workspace entry.
          </p>
        </div>
      </div>

      <div className="topbar-grid">
        <div className="topbar-card topbar-card-vpn">
          <div className="control-heading-row">
            <div className="control-heading">
              {vpnActive ? <ShieldCheck size={16} /> : <Shield size={16} />}
              <span>VPN</span>
            </div>
            <span className={`route-chip ${vpnActive ? "route-chip-active" : ""}`}>
              {vpnActive ? "Private route" : "Public route"}
            </span>
          </div>

          <select
            className="topbar-select"
            onChange={(event) => onVpnEndpointChange(event.target.value)}
            value={selectedEndpointId}
          >
            {vpnEndpoints.length > 0 ? (
              vpnEndpoints.map((endpoint) => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpoint.location} ({endpoint.country})
                </option>
              ))
            ) : (
              <option value="">No VPN endpoints</option>
            )}
          </select>

          <button
            className="topbar-button"
            disabled={vpnBusy || (!selectedEndpointId && !vpnActive)}
            onClick={onToggleVpn}
            type="button"
          >
            <Wifi size={16} />
            {vpnBusy ? "Processing..." : vpnActive ? "Disconnect" : "Connect"}
          </button>

          <p className={`topbar-status ${getMessageToneClass(vpnMessage?.tone)}`}>
            {vpnMessage?.text || currentUserLabel}
          </p>
        </div>

        <label className="topbar-card">
          <span className="control-heading">
            <Globe size={16} />
            <span>Country</span>
          </span>
          <select
            className="topbar-select"
            onChange={(event) => onCountryChange(event.target.value)}
            value={selectedCountry}
          >
            {countryOptions.map((country) => (
              <option key={country.code} value={country.code}>
                {country.label} ({country.code})
              </option>
            ))}
          </select>
          <p className="topbar-status status-text-muted">
            Auto-maps the language profile for the selected market.
          </p>
        </label>

        <label className="topbar-card">
          <span className="control-heading">
            <Languages size={16} />
            <span>Language</span>
          </span>
          <select
            className="topbar-select"
            onChange={(event) => onLanguageChange(event.target.value)}
            value={selectedLanguage}
          >
            {languageOptions.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>
          <p className="topbar-status status-text-muted">
            Full-page translation is ready across global languages.
          </p>
        </label>
      </div>
    </header>
  );
}
