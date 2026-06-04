import {
  ArrowRight,
  Cable,
  Cpu,
  Layers3,
  MessageSquare,
  Mic,
  Monitor,
  Plug,
  Sparkles,
  Usb,
  Wifi,
} from "lucide-react";
import { BrainBrand } from "./BrainBrand";
import { DevicePreviewStudio } from "./DevicePreviewStudio";
import { FrontPageChatPopup } from "./FrontPageChatPopup";
import type { Device, LandingContent, Sector } from "../types";

type DevicesPageProps = {
  activeDevice: Device | null;
  activeSector: Sector | null;
  landingContent: LandingContent;
  lightMode: boolean;
  onOpenLogin: () => void;
};

function getDeviceForSector(sector: Sector, devices: Device[]) {
  return (
    devices.find((device) => device.deviceKey === sector.deviceKey) ??
    devices.find((device) => device.sectorSlug === sector.slug) ??
    null
  );
}

const hdmiSetupSteps = [
  {
    icon: Cable,
    label: "HDMI",
    text: "Plug into the TV or display input.",
  },
  {
    icon: Usb,
    label: "USB power",
    text: "Power the stick from USB or adapter.",
  },
  {
    icon: Wifi,
    label: "Wi-Fi",
    text: "Connect the screen to brAIn cloud.",
  },
];

export function DevicesPage({
  activeDevice,
  activeSector,
  landingContent,
  lightMode,
  onOpenLogin,
}: DevicesPageProps) {
  const resolvedSector = activeSector ?? landingContent.sectors[0] ?? null;
  const resolvedDevice =
    activeDevice ??
    (resolvedSector ? getDeviceForSector(resolvedSector, landingContent.devices) : null);

  return (
    <main className={`brain-help-shell brain-devices-shell brain-devices-page ${lightMode ? "light-mode" : ""}`}>
      <div className="brain-page-brand-bar">
        <a className="brain-page-brand-link" href="/">
          <BrainBrand showTagline subtitle="Managed AI devices" />
        </a>
        <div className="brain-page-brand-actions">
          <a className="executive-button-secondary" href="/">
            Main page
          </a>
          <a className="executive-button-secondary" href="/help">
            Help
          </a>
        </div>
      </div>

      <section className="brain-devices-hero-text">
        <span className="landing-inline-label">Devices</span>
        <h1 className="brain-help-title">Hardware plus software, shown clearly.</h1>
        <p className="brain-help-copy">
          Choose the sector, see the matching physical device, then continue to buyer login only
          when the product lane is clear.
        </p>

        <div className="brain-help-actions">
          <button className="executive-button-primary" onClick={onOpenLogin} type="button">
            Buyer login
            <ArrowRight className="h-4 w-4" />
          </button>
          <a className="executive-button-secondary" href="/#landing-plans">
            View plans
          </a>
        </div>
      </section>

      <section className="brain-hdmi-showcase" aria-label="brAIn AI Stick HDMI TV setup">
        <div className="brain-hdmi-copy">
          <span className="landing-inline-label">HDMI AI Stick</span>
          <h2>Turn any TV into an AI-powered smart screen.</h2>
          <p>
            For TVs, monitors, kiosks, and screens that do not already have the brAIn layer,
            the AI Stick plugs into HDMI, takes USB power, and brings voice, apps, suggestions,
            and buyer-ready messaging to the display.
          </p>

          <div className="brain-hdmi-steps">
            {hdmiSetupSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div className="brain-hdmi-step" key={step.label}>
                  <Icon className="h-4 w-4" />
                  <span>{step.label}</span>
                  <strong>{step.text}</strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className="brain-tv-setup" aria-hidden="true">
          <div className="brain-tv-frame">
            <div className="brain-tv-screen">
              <div className="brain-tv-topline">
                <strong>brAIn</strong>
                <span>Home</span>
                <span>Apps</span>
                <span>Media</span>
                <span>Settings</span>
              </div>

              <div className="brain-tv-interface">
                <div className="brain-tv-assistant">
                  <span>Hello!</span>
                  <strong>How can I help you today?</strong>
                  <div className="brain-tv-wave" />
                  <div className="brain-tv-mic">
                    <Mic className="h-7 w-7" />
                  </div>
                </div>

                <div className="brain-tv-prompts">
                  <p>Ask me anything</p>
                  <div>
                    <span>Latest news</span>
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <span>Weather</span>
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <span>Find movies</span>
                    <Monitor className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="brain-tv-apps">
                {["YouTube", "Netflix", "Prime", "Disney+", "Spotify"].map((app) => (
                  <span key={app}>{app}</span>
                ))}
              </div>
            </div>

            <div className="brain-tv-side-panel">
              <span>HDMI</span>
              <span>USB</span>
              <span>LAN</span>
            </div>

            <div className="brain-hdmi-stick">
              <div className="brain-hdmi-plug" />
              <div className="brain-hdmi-stick-body">
                <strong>brAIn</strong>
                <span>AI STICK</span>
                <i />
              </div>
            </div>
          </div>

          <div className="brain-tv-stand" />
          <div className="brain-tv-console">
            <span>
              <Plug className="h-4 w-4" />
              Plug. Connect. Talk.
            </span>
          </div>
        </div>
      </section>

      <DevicePreviewStudio device={resolvedDevice} lightMode={lightMode} sector={resolvedSector} />

      <section className="brain-devices-text-grid" aria-label="Device lanes">
        {landingContent.sectors.slice(0, 4).map((sector) => {
          const device = getDeviceForSector(sector, landingContent.devices);
          const active = sector.slug === resolvedSector?.slug;

          return (
            <a
              className={`brain-devices-text-link ${active ? "brain-devices-text-link-active" : ""}`}
              href={`/devices?sector=${sector.slug}`}
              key={sector.slug}
            >
              <span>
                <Cpu className="h-4 w-4" />
                {sector.name}
              </span>
              <strong>{device?.name ?? "brAIn device"}</strong>
              <p>{device?.tagline ?? sector.summary}</p>
            </a>
          );
        })}
      </section>

      <section className="brain-devices-bottom-text">
        <div>
          <Sparkles className="h-5 w-5" />
          <strong>Physical device</strong>
          <p>Screen, desk, clinic, or edge-ready hardware selected by sector.</p>
        </div>
        <div>
          <Layers3 className="h-5 w-5" />
          <strong>Software layer</strong>
          <p>AI chat, cloud control, plans, tokens, activation, and buyer flow.</p>
        </div>
      </section>

      <FrontPageChatPopup
        device={resolvedDevice}
        plans={landingContent.plans}
        sector={resolvedSector}
      />
    </main>
  );
}

export default DevicesPage;
