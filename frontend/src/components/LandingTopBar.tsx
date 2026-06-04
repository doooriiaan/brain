import { useState } from "react";
import {
  ChevronDown,
  Globe,
  Languages,
  Settings2,
  Shield,
  ShieldCheck,
  Wifi,
  Briefcase,
  Zap,
  Heart,
  Cog,
} from "lucide-react";
import type { CountryOption, LanguageOption } from "../data/runtimeOptions";
import { BrainBrand } from "./BrainBrand";
import { HamburgerMenu } from "./HamburgerMenu";

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

const SECTOR_ITEMS = [
  { key: "business", label: "Business", icon: <Briefcase size={18} /> },
  { key: "commercial", label: "Commercial", icon: <Zap size={18} /> },
  { key: "healthcare", label: "Healthcare", icon: <Heart size={18} /> },
  { key: "industry", label: "Industry", icon: <Cog size={18} /> },
];

type LandingTopBarProps = {
  activeNavigationKey?: string;
  countryOptions: CountryOption[];
  currentUserLabel: string;
  languageOptions: LanguageOption[];
  navigationItems?: NavigationItem[];
  onNavigate?: (key: string) => void;
  onSecondaryAction?: () => void;
  onAboutAction?: () => void;
  onHelpAction?: () => void;
  onCountryChange: (countryCode: string) => void;
  onLanguageChange: (languageCode: string) => void;
  onToggleVpn: () => void;
  onVpnEndpointChange: (endpointId: string) => void;
  selectedCountry: string;
  selectedEndpointId: string;
  selectedLanguage: string;
  publicMode?: boolean;
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
  onAboutAction,
  onHelpAction,
  onSecondaryAction,
  onCountryChange,
  onLanguageChange,
  onToggleVpn,
  onVpnEndpointChange,
  selectedCountry,
  selectedEndpointId,
  selectedLanguage,
  publicMode = false,
  vpnActive,
  vpnBusy,
  vpnEndpoints,
  vpnMessage,
}: LandingTopBarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hasNavigation = publicMode && navigationItems.length > 0;

  return (
    <header
      className={`topbar-shell topbar-shell-lean brain-topbar-shell ${
        publicMode ? "brain-topbar-shell-public" : ""
      }`}
    >
      <div className="topbar-main-row brain-topbar-row">
        <button
          className="brain-topbar-brand"
          onClick={() => onNavigate?.("overview")}
          translate="no"
          type="button"
        >
          <BrainBrand compact subtitle="Managed AI devices" />
        </button>

        {hasNavigation ? (
          <nav aria-label="Primary" className="topbar-nav brain-topbar-nav">
            {navigationItems.map((item) => (
              <button
                className={`topbar-nav-button brain-topbar-nav-button ${
                  activeNavigationKey === item.key
                    ? "topbar-nav-button-active brain-topbar-nav-button-active"
                    : ""
                }`}
                key={item.key}
                onClick={() => onNavigate?.(item.key)}
                type="button"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        ) : null}

        <div className="topbar-main-actions brain-topbar-actions">
          {!publicMode ? (
            <span className="topbar-account brain-topbar-account">{currentUserLabel}</span>
          ) : null}

          {publicMode ? (
            <>
              <HamburgerMenu
                sectors={SECTOR_ITEMS}
                onNavigate={(sectorKey) => onNavigate?.(`sector:${sectorKey}`)}
                showLabel={true}
              />

              <button
                className="brain-topbar-secondary-cta"
                onClick={() => onAboutAction?.()}
                type="button"
              >
                About
              </button>
              <button
                className="brain-topbar-secondary-cta"
                onClick={() => onHelpAction?.()}
                type="button"
              >
                Help
              </button>
              <button
                className="topbar-primary-cta brain-topbar-primary-cta"
                onClick={() => onSecondaryAction?.()}
                type="button"
              >
                Buyer login
              </button>

              <button
                aria-label="Open region settings"
                className="topbar-utility-trigger brain-topbar-utility-trigger"
                onClick={() => setSettingsOpen((s) => !s)}
                type="button"
              >
                <Settings2 size={16} />
              </button>
            </>
          ) : (
            <button
              aria-expanded={settingsOpen}
              className="topbar-utility-trigger brain-topbar-utility-trigger"
              onClick={() => setSettingsOpen((current) => !current)}
              type="button"
            >
              <Settings2 size={16} />
              Region
              <ChevronDown
                className={settingsOpen ? "topbar-chevron-open" : ""}
                size={15}
              />
            </button>
          )}
        </div>
      </div>

      {settingsOpen ? (
        <div
          className={`topbar-utility-panel brain-topbar-utility-panel ${
            settingsOpen ? "topbar-utility-panel-open" : ""
          }`}
        >
          <div className="topbar-utility-grid brain-topbar-utility-grid">
            <div className="topbar-control-card topbar-control-card-vpn brain-topbar-control-card">
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
                  Keep region, language, and route controls tucked into one clean place.
                </p>
              )}
            </div>

            <label className="topbar-control-card brain-topbar-control-card">
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

            <label className="topbar-control-card brain-topbar-control-card">
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
      ) : null}
    </header>
  );
}
