import { useState } from "react";
import {
  ArrowRight,
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
  { label: "Sectors", value: "04 live" },
  { label: "Plans", value: "5 tiers" },
  { label: "Access", value: "SC ready" },
] as const;

const deploymentSteps = [
  "Pick sector",
  "Choose plan",
  "Open access",
] as const;

const productTabs = [
  {
    key: "stick",
    label: "AI Stick",
    sector: "Commercial",
    value: "Retail screens",
    copy: "Plug-in AI for stores, kiosks, and hospitality displays.",
    gradient: "from-amber-300/25 to-orange-500/10",
  },
  {
    key: "hub",
    label: "brAIn Hub",
    sector: "Business",
    value: "Automation desk",
    copy: "A clean workspace for calls, tasks, dashboards, and sales flow.",
    gradient: "from-cyan-300/25 to-blue-500/10",
  },
  {
    key: "med",
    label: "MED Assistant",
    sector: "Healthcare",
    value: "Clinic support",
    copy: "Patient, pharmacy, appointment, and secure staff workflows.",
    gradient: "from-emerald-300/25 to-teal-500/10",
  },
  {
    key: "edge",
    label: "Edge Box",
    sector: "Industry 4.0",
    value: "Machine signals",
    copy: "Factory monitoring, predictive alerts, and live device telemetry.",
    gradient: "from-violet-300/25 to-fuchsia-500/10",
  },
] as const;

const proofItems = [
  "Device + cloud control",
  "Multi-language launch",
  "VPN route toggle",
  "Admin-managed plans",
  "Smart card validation",
] as const;

type ProductTabKey = (typeof productTabs)[number]["key"];

export function BrandShowcase({
  currentCountry,
  currentLanguage,
  vpnActive,
}: BrandShowcaseProps) {
  const [activeProductKey, setActiveProductKey] = useState<ProductTabKey>(
    productTabs[0].key,
  );
  const activeProduct =
    productTabs.find((product) => product.key === activeProductKey) ??
    productTabs[0];

  return (
    <div className="showcase-stack">
      <div className="hero-copy-block">
        <span className="eyebrow">Device-first AI platform</span>
        <h1 className="hero-title">
          One structured launch page for every <span className="notranslate">brAIn</span> device.
        </h1>
        <p className="hero-text">
          Pick a sector, preview the hardware, choose a plan, then open access.
          Less text, clearer cards, and a live product selector inspired by
          modern SaaS landing pages.
        </p>

        <div className="hero-chip-row">
          {proofItems.map((item) => (
            <span className="hero-chip" key={item}>
              <ArrowRight size={14} />
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="showcase-proof-strip">
        {proofItems.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <div className="showcase-frame">
        <div className="showcase-header">
          <div>
            <span className="eyebrow eyebrow-tight">Interactive device selector</span>
            <h2 className="showcase-title">Choose a product, then continue the flow</h2>
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
            <div className="showcase-product-tabs">
              {productTabs.map((product) => (
                <button
                  className={`showcase-product-tab ${
                    activeProduct.key === product.key ? "showcase-product-tab-active" : ""
                  }`}
                  key={product.key}
                  onClick={() => setActiveProductKey(product.key)}
                  type="button"
                >
                  <span>{product.sector}</span>
                  <strong>{product.label}</strong>
                </button>
              ))}
            </div>

            <div className="showcase-stage-shell">
              <div className="showcase-stage-glow showcase-stage-glow-a" />
              <div className="showcase-stage-glow showcase-stage-glow-b" />

              <div className="showcase-device-shell">
                <div className="showcase-device-topline">
                  <span className="showcase-micro-pill">{activeProduct.sector}</span>
                  <span
                    className={`showcase-micro-pill ${vpnActive ? "showcase-micro-pill-active" : ""}`}
                  >
                    {vpnActive ? "private route" : "public route"}
                  </span>
                </div>

                <div className="showcase-device-core">
                  <div className="showcase-core-ring" />
                  <div className="showcase-core-ring showcase-core-ring-b" />
                  <div className={`showcase-core-chip bg-gradient-to-br ${activeProduct.gradient}`}>
                    <Cpu size={26} />
                  </div>
                </div>

                <div className="showcase-product-copy">
                  <span>{activeProduct.value}</span>
                  <h3>{activeProduct.label}</h3>
                  <p>{activeProduct.copy}</p>
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
                <p className="showcase-runtime-kicker">Flow</p>
                <h3>From preview to access</h3>
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
