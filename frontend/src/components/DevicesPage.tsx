import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Cpu, Layers3, Monitor, ShieldCheck, Volume2 } from "lucide-react";
import { BrainBrand } from "./BrainBrand";
import { FrontPageChatPopup } from "./FrontPageChatPopup";
import type { Device, LandingContent, Sector } from "../types";

type DevicesPageProps = {
  activeDevice: Device | null;
  activeSector: Sector | null;
  landingContent: LandingContent;
  lightMode: boolean;
  onOpenLogin: () => void;
};

type SectorWorkflowStory = {
  moment: string;
  assistantLine: string;
  voiceLine: string;
  workflow: string[];
  screenApps: string[];
};

type SectorMetric = {
  label: string;
  value: string;
};

type SectorBoardVisual = {
  badge: string;
  deviceLabel: string;
  panels: string[];
  accessories: string[];
};

const sectorWorkflowStories: Record<string, SectorWorkflowStory> = {
  commercial: {
    moment: "Retail assistant",
    assistantLine: "Hi, I can help you find the right product.",
    voiceLine: "Hello, I am brAIn AI Stick, your commercial screen assistant.",
    workflow: ["Product help", "Offer match", "Lead capture"],
    screenApps: ["Offers", "Products", "Help"],
  },
  business: {
    moment: "Office workflow",
    assistantLine: "Good morning, your sales recap is ready.",
    voiceLine: "Hello, I am brAIn Hub, your business workflow assistant.",
    workflow: ["Calls", "Tasks", "Analytics"],
    screenApps: ["Calls", "Tasks", "Reports"],
  },
  healthcare: {
    moment: "Clinic assistant",
    assistantLine: "Hey John, your therapy starts at 09:30.",
    voiceLine: "Hello, I am brAIn MED Assistant. Hey John, your therapy starts at 09:30.",
    workflow: ["Patient queue", "Therapy reminder", "Staff support"],
    screenApps: ["Queue", "Therapy", "Staff"],
  },
  industry: {
    moment: "Industrial monitor",
    assistantLine: "Line 2 needs inspection before the next cycle.",
    voiceLine: "Hello, I am brAIn Industry Edge, monitoring machines and alerts.",
    workflow: ["Sensor signal", "Alert routing", "Ops status"],
    screenApps: ["Sensors", "Alerts", "Uptime"],
  },
};

const defaultWorkflowStory: SectorWorkflowStory = {
  moment: "Live assistant",
  assistantLine: "How can I help today?",
  voiceLine: "Hello, I am your brAIn assistant.",
  workflow: ["Listen", "Assist", "Report"],
  screenApps: ["Assistant", "Insights", "Tasks"],
};

function getDeviceForSector(sector: Sector | null, devices: Device[]) {
  if (!sector) {
    return null;
  }

  return (
    devices.find((device) => device.deviceKey === sector.deviceKey) ??
    devices.find((device) => device.sectorSlug === sector.slug) ??
    null
  );
}

function getWorkflowStoryForSector(sector: Sector | null) {
  if (!sector) {
    return defaultWorkflowStory;
  }

  return sectorWorkflowStories[sector.slug] ?? defaultWorkflowStory;
}

function getSectorStyle(sector: Sector): CSSProperties {
  const projectAccents: Record<string, string> = {
    commercial: "var(--device-blue)",
    business: "var(--device-cyan)",
    healthcare: "var(--device-violet)",
    industry: "#0d63ce",
  };

  return {
    "--sector-accent": projectAccents[sector.slug] ?? sector.accent ?? "var(--device-blue)",
  } as CSSProperties;
}

function getSectorIcon(sector: Sector) {
  if (sector.slug === "commercial") {
    return Monitor;
  }

  if (sector.slug === "healthcare") {
    return ShieldCheck;
  }

  if (sector.slug === "industry") {
    return Layers3;
  }

  return Cpu;
}

function getSectorMetrics(sector: Sector, device: Device | null): SectorMetric[] {
  const metrics = device?.metrics.slice(0, 3) ?? [];

  if (metrics.length > 0) {
    return metrics;
  }

  return [
    { label: sector.statLabel, value: sector.statValue },
    { label: "Audience", value: sector.audience },
    { label: "Mode", value: "Ready" },
  ];
}

function getSectorBoardVisual(sector: Sector, device: Device | null): SectorBoardVisual {
  if (sector.slug === "commercial") {
    return {
      badge: "brAIn AI Stick",
      deviceLabel: "AI Stick",
      panels: ["Product finder", "Offer board", "Customer help"],
      accessories: device?.ports.slice(0, 4) ?? ["HDMI", "USB-C", "Wi-Fi", "Cloud"],
    };
  }

  if (sector.slug === "healthcare") {
    return {
      badge: "brAIn MED kit",
      deviceLabel: "MED",
      panels: ["Patient queue", "Therapy time", "Staff alert"],
      accessories: device?.ports.slice(0, 4) ?? ["Camera", "Cloud", "Voice", "Queue"],
    };
  }

  if (sector.slug === "industry") {
    return {
      badge: "brAIn Industry Edge",
      deviceLabel: "Edge",
      panels: ["Line status", "Sensor map", "Ops alerts"],
      accessories: device?.ports.slice(0, 4) ?? ["LAN", "RS-485", "Sensors", "Relay"],
    };
  }

  return {
    badge: "brAIn Business Hub",
    deviceLabel: "Hub",
    panels: ["Calls", "Tasks", "Analytics"],
    accessories: device?.ports.slice(0, 4) ?? ["Mic array", "Wi-Fi", "HD screen", "Cloud"],
  };
}

function GeneratedDeviceShowcase({ label, sector }: { label: string; sector: Sector }) {
  return (
    <div className={`brain-device-generated-showcase brain-device-generated-showcase-${sector.slug}`}>
      {sector.slug === "commercial" ? (
        <>
          <div className="brain-device-generated-stick brain-device-generated-stick-main">
            <span>brAIn</span>
            <strong>{label}</strong>
            <i />
          </div>
          <div className="brain-device-generated-stick brain-device-generated-stick-mini">
            <span>HDMI</span>
          </div>
          <div className="brain-device-generated-cable" />
        </>
      ) : sector.slug === "business" ? (
        <>
          <div className="brain-device-generated-hub-screen">
            <span>brAIn</span>
            <strong>{label}</strong>
            <i />
          </div>
          <div className="brain-device-generated-hub-side">
            <span>Voice</span>
          </div>
          <div className="brain-device-generated-hub-base" />
        </>
      ) : sector.slug === "healthcare" ? (
        <>
          <div className="brain-device-generated-med-device brain-device-generated-med-main">
            <span>brAIn</span>
            <strong>{label}</strong>
            <i />
          </div>
          <div className="brain-device-generated-med-device brain-device-generated-med-mini">
            <span>TV</span>
          </div>
          <div className="brain-device-generated-med-card">
            <span>SC</span>
          </div>
        </>
      ) : (
        <>
          <div className="brain-device-generated-edge-box">
            <span>brAIn</span>
            <strong>{label}</strong>
            <i />
          </div>
          <div className="brain-device-generated-edge-antenna brain-device-generated-edge-antenna-left" />
          <div className="brain-device-generated-edge-antenna brain-device-generated-edge-antenna-right" />
          <div className="brain-device-generated-edge-panel">
            <span>OPS</span>
          </div>
        </>
      )}
    </div>
  );
}

function SectorGeneratedBoard({
  device,
  metrics,
  sector,
  story,
}: {
  device: Device | null;
  metrics: SectorMetric[];
  sector: Sector;
  story: SectorWorkflowStory;
}) {
  const visual = getSectorBoardVisual(sector, device);

  return (
    <div className={`brain-device-generated-board brain-device-generated-board-${sector.slug}`}>
      <div className="brain-device-generated-header">
        <span>{visual.badge}</span>
        <strong>{device?.name ?? sector.name}</strong>
        <em>{story.moment}</em>
      </div>

      <div className="brain-device-generated-main">
        <div className="brain-device-generated-screen">
          <div className="brain-device-generated-screen-top">
            <strong>brAIn</strong>
            <span>Live</span>
            <span>Voice</span>
            <span>Cloud</span>
          </div>
          <div className="brain-device-generated-screen-body">
            <div className="brain-device-generated-assistant">
              <span />
              <strong>{story.assistantLine}</strong>
              <small>Voice ready</small>
            </div>
            <div className="brain-device-generated-panel-grid">
              {visual.panels.map((panel) => (
                <div key={panel}>
                  <span>{panel}</span>
                  <i />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="brain-device-generated-device-stage">
          <GeneratedDeviceShowcase label={visual.deviceLabel} sector={sector} />
        </div>
      </div>

      <div className="brain-device-generated-metrics">
        {metrics.slice(0, 3).map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>

      <div className="brain-device-generated-accessories">
        {visual.accessories.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

export function DevicesPage({
  activeDevice,
  activeSector,
  landingContent,
  lightMode,
  onOpenLogin,
}: DevicesPageProps) {
  const sectorSections = landingContent.sectors.slice(0, 4);
  const defaultSectorSlug = activeSector?.slug ?? sectorSections[0]?.slug ?? "";
  const [selectedSectorSlug, setSelectedSectorSlug] = useState(defaultSectorSlug);
  const [activeVoiceSectorSlug, setActiveVoiceSectorSlug] = useState<string | null>(null);
  const voiceStopTimerRef = useRef<number | null>(null);
  const selectedSector =
    sectorSections.find((sector) => sector.slug === selectedSectorSlug) ??
    activeSector ??
    sectorSections[0] ??
    null;
  const selectedDevice =
    getDeviceForSector(selectedSector, landingContent.devices) ?? activeDevice ?? null;

  useEffect(() => {
    if (activeSector?.slug) {
      setSelectedSectorSlug(activeSector.slug);
    }
  }, [activeSector?.slug]);

  useEffect(() => {
    if (
      sectorSections.length > 0 &&
      !sectorSections.some((sector) => sector.slug === selectedSectorSlug)
    ) {
      setSelectedSectorSlug(sectorSections[0].slug);
    }
  }, [sectorSections, selectedSectorSlug]);

  useEffect(() => {
    return () => {
      if (voiceStopTimerRef.current !== null) {
        window.clearTimeout(voiceStopTimerRef.current);
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function clearVoiceTimer() {
    if (voiceStopTimerRef.current !== null) {
      window.clearTimeout(voiceStopTimerRef.current);
      voiceStopTimerRef.current = null;
    }
  }

  function selectSector(sectorSlug: string) {
    setSelectedSectorSlug(sectorSlug);

    requestAnimationFrame(() => {
      document.getElementById(`device-sector-${sectorSlug}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function playSectorVoice(sector: Sector, story: SectorWorkflowStory) {
    setSelectedSectorSlug(sector.slug);
    clearVoiceTimer();
    setActiveVoiceSectorSlug(sector.slug);

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof SpeechSynthesisUtterance !== "undefined"
    ) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(story.voiceLine);
      utterance.rate = 0.94;
      utterance.pitch =
        sector.slug === "healthcare" ? 1.08 : sector.slug === "industry" ? 0.88 : 1;
      utterance.volume = 1;
      utterance.onend = () => {
        setActiveVoiceSectorSlug((current) => (current === sector.slug ? null : current));
        clearVoiceTimer();
      };

      window.speechSynthesis.speak(utterance);
    }

    voiceStopTimerRef.current = window.setTimeout(() => {
      setActiveVoiceSectorSlug((current) => (current === sector.slug ? null : current));
      voiceStopTimerRef.current = null;
    }, 11000);
  }

  return (
    <main
      className={`brain-help-shell brain-devices-shell brain-devices-page brain-devices-flow-page ${
        lightMode ? "light-mode" : ""
      }`}
    >
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

      <section className="brain-devices-flow-hero" aria-label="Devices by sector">
        <div className="brain-devices-flow-copy">
          <span className="landing-inline-label">Devices</span>
          <h1 className="brain-help-title">Four sectors, four devices.</h1>
          <p className="brain-help-copy">
            Each sector has its own brAIn device, live assistant moment, device metrics, and voice
            sample in one clean responsive page.
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
        </div>

        <div className="brain-devices-flow-summary" aria-label="Selected device summary">
          <span>Selected sector</span>
          <strong>{selectedSector?.name ?? "Sector device"}</strong>
          <p>{selectedDevice?.name ?? "brAIn device"}</p>
          <div>
            <span>{sectorSections.length || 4} sectors</span>
            <span>Voice ready</span>
          </div>
        </div>
      </section>

      <nav className="brain-device-sector-tabs" aria-label="Device sector navigation">
        {sectorSections.map((sector, index) => {
          const Icon = getSectorIcon(sector);
          const active = sector.slug === selectedSector?.slug;

          return (
            <button
              className={`brain-device-sector-tab ${
                active ? "brain-device-sector-tab-active" : ""
              }`}
              key={sector.slug}
              onClick={() => selectSector(sector.slug)}
              style={getSectorStyle(sector)}
              type="button"
            >
              <Icon className="h-4 w-4" />
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{sector.name}</strong>
            </button>
          );
        })}
      </nav>

      <section className="brain-device-sector-workflows" aria-label="Four sector device sections">
        <div className="brain-device-section-heading">
          <span className="landing-inline-label">Sector devices</span>
          <h2>Structured by sector.</h2>
        </div>

        <div className="brain-device-sector-workflow-list">
          {sectorSections.map((sector, index) => {
            const device = getDeviceForSector(sector, landingContent.devices);
            const story = getWorkflowStoryForSector(sector);
            const metrics = getSectorMetrics(sector, device);
            const active = sector.slug === selectedSector?.slug;
            const voiceActive = activeVoiceSectorSlug === sector.slug;
            const Icon = getSectorIcon(sector);
            const ports = device?.ports.slice(0, 4) ?? story.screenApps;

            return (
              <article
                className={`brain-device-sector-workflow-card ${
                  active ? "brain-device-sector-workflow-card-active" : ""
                } ${voiceActive ? "brain-device-sector-workflow-card-speaking" : ""}`}
                id={`device-sector-${sector.slug}`}
                key={sector.slug}
                style={getSectorStyle(sector)}
              >
                <div className="brain-device-sector-workflow-head">
                  <span>
                    <Icon className="h-4 w-4" />
                    Sector {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong>{sector.name}</strong>
                  <p>{sector.summary}</p>
                  <div className="brain-device-sector-capabilities">
                    {sector.capabilities.slice(0, 3).map((capability) => (
                      <em key={capability}>{capability}</em>
                    ))}
                  </div>
                </div>

                <div className="brain-device-sector-media">
                  <div className="brain-device-sector-image">
                    <SectorGeneratedBoard
                      device={device}
                      metrics={metrics}
                      sector={sector}
                      story={story}
                    />
                  </div>
                  <div className="brain-device-sector-live-card">
                    <span>{story.moment}</span>
                    <strong>{story.assistantLine}</strong>
                    <div className="brain-device-sector-apps">
                      {story.screenApps.map((app) => (
                        <small key={app}>{app}</small>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="brain-device-sector-detail">
                  <div className="brain-device-sector-device-name">
                    <span>Device</span>
                    <strong>{device?.name ?? "brAIn device"}</strong>
                    <p>{device?.tagline ?? sector.title}</p>
                  </div>

                  <div className="brain-device-sector-specs">
                    {metrics.map((metric) => (
                      <div key={metric.label}>
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="brain-device-sector-runtime">
                    <span>Workflow</span>
                    <ol className="brain-device-sector-flow-list">
                      {story.workflow.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="brain-device-sector-port-list" aria-label="Device ports">
                    {ports.map((port) => (
                      <span key={port}>{port}</span>
                    ))}
                  </div>

                  <button
                    className="brain-device-sector-voice"
                    onClick={() => playSectorVoice(sector, story)}
                    type="button"
                  >
                    <span className="brain-device-sector-voice-orb">
                      <Volume2 className="h-5 w-5" />
                    </span>
                    <span>
                      <small>{voiceActive ? "Playing voice" : "Voice sample"}</small>
                      <strong>Play device voice</strong>
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <FrontPageChatPopup
        device={selectedDevice}
        plans={landingContent.plans}
        sector={selectedSector}
      />
    </main>
  );
}

export default DevicesPage;
