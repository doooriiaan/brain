import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Globe,
  Languages,
  Settings2,
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

type NavigationItem = {
  key: string;
  label: string;
};

type LandingTopBarProps = {
  activeNavigationKey?: string;
  countryOptions: CountryOption[];
  currentUserLabel: string;
  languageOptions: LanguageOption[];
  navigationItems?: NavigationItem[];
  onNavigate?: (key: string) => void;
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
  activeNavigationKey,
  countryOptions,
  currentUserLabel,
  languageOptions,
  navigationItems = [],
  onNavigate,
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isGuestLanding = navigationItems.length > 0;

  return (
    <header className="topbar-shell topbar-shell-lean">
      <div className="topbar-main-row">
        <div className="brand-lockup">
          <img
            alt="brAIn logo"
            className="brand-mark notranslate"
            src="/brand/brain-logo.svg"
            translate="no"
          />
          <div className="brand-copy">
            <span className="brand-pill">Device sales preweb</span>
            <p className="brand-helper">
              Sell the hardware first, then move buyers into login and rollout.
            </p>
          </div>
        </div>

        {isGuestLanding ? (
          <nav aria-label="Primary" className="topbar-nav">
            {navigationItems.map((item) => (
              <button
                className={`topbar-nav-button ${
                  activeNavigationKey === item.key ? "topbar-nav-button-active" : ""
                }`}
                key={item.key}
                onClick={() => onNavigate?.(item.key)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>
        ) : null}

        <div className="topbar-main-actions">
          {!isGuestLanding ? (
            <span className="topbar-account">{currentUserLabel}</span>
          ) : null}

          <button
            aria-expanded={settingsOpen}
            className="topbar-utility-trigger"
            onClick={() => setSettingsOpen((current) => !current)}
            type="button"
          >
            <Settings2 size={16} />
            {isGuestLanding ? "Settings" : "Region & access"}
            <ChevronDown
              className={settingsOpen ? "topbar-chevron-open" : ""}
              size={15}
            />
          </button>

          {isGuestLanding ? (
            <button
              className="topbar-primary-cta"
              onClick={() => onNavigate?.("access")}
              type="button"
            >
              Log in
              <ArrowRight size={16} />
            </button>
          ) : null}
        </div>
      </div>

      <div
        className={`topbar-utility-panel ${
          settingsOpen ? "topbar-utility-panel-open" : ""
        }`}
      >
        <div className="topbar-utility-grid">
          <div className="topbar-control-card topbar-control-card-vpn">
            <div className="topbar-control-header">
              <div className="control-heading">
                {vpnActive ? <ShieldCheck size={16} /> : <Shield size={16} />}
                <span>Route</span>
              </div>
              <span className={`route-chip ${vpnActive ? "route-chip-active" : ""}`}>
                {vpnActive ? "Protected" : "Standard"}
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
              {vpnBusy ? "Processing..." : vpnActive ? "Disable route" : "Enable route"}
            </button>

            {vpnMessage?.text ? (
              <p className={`topbar-note ${getMessageToneClass(vpnMessage?.tone)}`}>
                {vpnMessage.text}
              </p>
            ) : (
              <p className="topbar-subtle-text">
                Keep regional route controls here instead of the main landing header.
              </p>
            )}
          </div>

          <label className="topbar-control-card">
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
          </label>

          <label className="topbar-control-card">
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
          </label>
        </div>
      </div>
    </header>
  );
}
