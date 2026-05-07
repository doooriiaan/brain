import {
  Cpu,
  Languages,
  LockKeyhole,
  ScanSearch,
  ServerCog,
  Workflow,
} from "lucide-react";

type BrandShowcaseProps = {
  currentCountry: string;
  currentLanguage: string;
  vpnActive: boolean;
};

const architectureCards = [
  {
    title: "Hardware layer",
    copy: "brAIn installs directly into business devices, hubs, sticks, and on-site boxes.",
    icon: Cpu,
  },
  {
    title: "Software layer",
    copy: "Cloud software controls access, automation, analytics, and ongoing device lifecycle.",
    icon: ServerCog,
  },
  {
    title: "Deployment flow",
    copy: "Country routing, language automation, and secure login stay inside one clean entry point.",
    icon: Workflow,
  },
] as const;

const liveSignals = [
  { label: "Device mesh", value: "04 nodes" },
  { label: "Runtime mode", value: "Cloud linked" },
  { label: "Validation", value: "Client ready" },
] as const;

const deploymentSteps = [
  "Choose country profile",
  "Sync language layer",
  "Validate secure access",
] as const;

export function BrandShowcase({
  currentCountry,
  currentLanguage,
  vpnActive,
}: BrandShowcaseProps) {
  return (
    <div className="showcase-stack">
      <div className="hero-copy-block">
        <span className="eyebrow">Device-first AI platform</span>
        <h1 className="hero-title">
          Install <span className="notranslate">brAIn</span> on every device.
        </h1>
        <p className="hero-text">
          This system installs AI through one coordinated hardware and software
          stack. Configure the market, switch the page language automatically,
          secure the route with VPN, and open the workspace from one structured
          access layer.
        </p>

        <div className="hero-chip-row">
          <span className="hero-chip">
            <Cpu size={15} />
            Hardware ready
          </span>
          <span className="hero-chip">
            <ServerCog size={15} />
            Software orchestrated
          </span>
          <span className="hero-chip">
            <Languages size={15} />
            Auto translated
          </span>
          <span className="hero-chip">
            <LockKeyhole size={15} />
            VPN secure
          </span>
        </div>
      </div>

      <div className="showcase-frame">
        <div className="showcase-header">
          <div>
            <span className="eyebrow eyebrow-tight">Current deployment profile</span>
            <h2 className="showcase-title">Hardware + software in one entry flow</h2>
          </div>
          <div className="profile-pills">
            <span className="profile-pill">
              <ScanSearch size={14} />
              {currentCountry}
            </span>
            <span className="profile-pill">
              <Languages size={14} />
              {currentLanguage}
            </span>
            <span className={`profile-pill ${vpnActive ? "profile-pill-active" : ""}`}>
              <LockKeyhole size={14} />
              {vpnActive ? "VPN locked" : "VPN standby"}
            </span>
          </div>
        </div>

        <div className="showcase-media">
          <div className="showcase-live-board">
            <div className="showcase-stage-shell">
              <div className="showcase-stage-glow showcase-stage-glow-a" />
              <div className="showcase-stage-glow showcase-stage-glow-b" />

              <div className="showcase-device-shell">
                <div className="showcase-device-topline">
                  <span className="showcase-micro-pill">brAIn node</span>
                  <span
                    className={`showcase-micro-pill ${vpnActive ? "showcase-micro-pill-active" : ""}`}
                  >
                    {vpnActive ? "private route" : "public route"}
                  </span>
                </div>

                <div className="showcase-device-core">
                  <div className="showcase-core-ring" />
                  <div className="showcase-core-ring showcase-core-ring-b" />
                  <div className="showcase-core-chip">
                    <Cpu size={26} />
                  </div>
                </div>

                <div className="showcase-device-grid">
                  {liveSignals.map((item) => (
                    <div className="showcase-device-metric" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="showcase-runtime-column">
              <article className="showcase-runtime-card">
                <p className="showcase-runtime-kicker">Runtime identity</p>
                <h3>Market, language, and secure state</h3>
                <div className="showcase-runtime-list">
                  <div className="showcase-runtime-row">
                    <span>Country</span>
                    <strong>{currentCountry}</strong>
                  </div>
                  <div className="showcase-runtime-row">
                    <span>Language</span>
                    <strong>{currentLanguage}</strong>
                  </div>
                  <div className="showcase-runtime-row">
                    <span>VPN</span>
                    <strong>{vpnActive ? "Locked" : "Standby"}</strong>
                  </div>
                </div>
              </article>

              <article className="showcase-runtime-card">
                <p className="showcase-runtime-kicker">Entry sequence</p>
                <h3>Live deployment flow</h3>
                <div className="showcase-step-stack">
                  {deploymentSteps.map((step, index) => (
                    <div className="showcase-step-row" key={step}>
                      <span>{`0${index + 1}`}</span>
                      <strong>{step}</strong>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>

        <div className="architecture-grid">
          {architectureCards.map((card) => {
            const Icon = card.icon;

            return (
              <article className="architecture-card" key={card.title}>
                <div className="architecture-icon">
                  <Icon size={18} />
                </div>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
