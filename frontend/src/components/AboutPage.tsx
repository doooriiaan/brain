import { ArrowRight, Cable, Cloud, Cpu, ShieldCheck } from "lucide-react";
import type { LandingContent } from "../types";
import { translateAppText } from "../localization";
import { BrainBrand } from "./BrainBrand";

type AboutPageProps = {
  landingContent: LandingContent;
  lightMode: boolean;
  selectedLanguage?: string;
  onOpenLogin?: () => void;
};

const aboutStory = [
  {
    step: "01",
    title: "Install the device where customers or teams already work",
    detail:
      "brAIn starts with a real physical device: on a TV, at a front desk, inside a clinic, or next to industrial equipment.",
    value: "Real hardware",
  },
  {
    step: "02",
    title: "Connect screen, network, and runtime",
    detail:
      "The device is plug-and-play first, then linked to the correct network, language, role, and deployment context.",
    value: "Minutes to setup",
  },
  {
    step: "03",
    title: "Run voice, guidance, and branded flows",
    detail:
      "Instead of a passive screen, the business gets a guided AI surface for customer questions, promotions, support, or operator workflows.",
    value: "Customer-facing AI",
  },
  {
    step: "04",
    title: "Manage everything from one cloud layer",
    detail:
      "Plans, cards, deployment, activation, billing, and reporting stay connected through the same brAIn control flow.",
    value: "Managed rollout",
  },
];

export function AboutPage({
  landingContent,
  lightMode,
  selectedLanguage = "en",
  onOpenLogin,
}: AboutPageProps) {
  const featuredDevice = landingContent.devices[0] ?? null;
  const highlightedSector = landingContent.sectors[0] ?? null;
  const featuredPlan =
    landingContent.plans.find((plan) => plan.featured) ?? landingContent.plans[0] ?? null;

  return (
    <main className={`brain-help-shell brain-about-shell ${lightMode ? "light-mode" : ""}`}>
      <div className="brain-page-brand-bar">
        <a className="brain-page-brand-link" href="/">
          <BrainBrand showTagline subtitle="Managed AI devices" />
        </a>
        <a className="executive-button-secondary" href="/">
          Main page
        </a>
      </div>

      <section className="brain-help-hero executive-surface executive-surface-strong">
        <div className="brain-hero-grid">
          <div className="brain-help-main">
            <span className="landing-inline-label">About brAIn</span>
            <h1 className="brain-help-title">
              A managed AI device platform built for places where the product must be seen, used,
              and explained fast.
            </h1>
            <p className="brain-help-copy">
              brAIn is not just software on a website. It is a physical AI device plus a managed
              platform that turns screens, desks, clinics, and edge environments into guided AI
              touchpoints with real deployment logic behind them.
            </p>

            <div className="brain-hero-actions">
              <button className="executive-button-primary" onClick={() => onOpenLogin?.()} type="button">
                {translateAppText("Login", selectedLanguage)}
              </button>
              <a className="executive-button-secondary" href="/">
                Return to landing
              </a>
            </div>

            <div className="brain-proof-band">
              <span className="brain-proof-chip">Physical device first</span>
              <span className="brain-proof-chip">Cloud-managed rollout</span>
              <span className="brain-proof-chip">Screen, voice, and workflow ready</span>
            </div>
          </div>

          <div className="brain-help-side">
            <article className="brain-help-pricing-card">
              <div className="brain-section-heading">
                <div>
                  <span className="landing-inline-label">What buyers understand fast</span>
                  <h2 className="landing-section-title">
                    One device, one platform, one clear operating story
                  </h2>
                </div>
                <ShieldCheck className="h-5 w-5 text-cyan-200" />
              </div>

              <div className="brain-help-overview-grid">
                <div className="brain-help-overview-card">
                  <div className="brain-help-overview-head">
                    <strong>Device</strong>
                    <Cpu className="brain-help-overview-icon h-4 w-4" />
                  </div>
                  <p>{featuredDevice?.name ?? "Managed AI device"}</p>
                  <div className="brain-help-overview-metric">
                    <span>Purpose</span>
                    <strong>{featuredDevice?.tagline ?? "Customer or operator interaction"}</strong>
                  </div>
                </div>

                <div className="brain-help-overview-card">
                  <div className="brain-help-overview-head">
                    <strong>Sector fit</strong>
                    <Cable className="brain-help-overview-icon h-4 w-4" />
                  </div>
                  <p>{highlightedSector?.audience ?? "Retail, business, healthcare, industry"}</p>
                  <div className="brain-help-overview-metric">
                    <span>Launch style</span>
                    <strong>{highlightedSector?.statValue ?? "Managed deployment"}</strong>
                  </div>
                </div>

                <div className="brain-help-overview-card">
                  <div className="brain-help-overview-head">
                    <strong>Commercial path</strong>
                    <Cloud className="brain-help-overview-icon h-4 w-4" />
                  </div>
                  <p>{featuredPlan?.summary ?? "Choose the right plan and scale from there."}</p>
                  <div className="brain-help-overview-metric">
                    <span>Featured plan</span>
                    <strong>{featuredPlan?.name ?? "Business"}</strong>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="brain-public-section executive-surface" id="about-how-it-works">
        <div className="brain-section-heading">
          <div>
            <span className="landing-inline-label">How It Works</span>
            <h2 className="landing-section-title">From device install to managed AI rollout</h2>
            <p className="landing-section-copy">
              A strong about page has to explain the operating logic, not just describe the brand.
              These are the steps buyers need to understand.
            </p>
          </div>
        </div>

        <div className="brain-journey-grid">
          {aboutStory.map((item) => (
            <article className="brain-journey-card brain-journey-card-active" key={item.step}>
              <div className="brain-journey-card-head">
                <span className="brain-journey-step">{item.step}</span>
                <ArrowRight className="brain-journey-icon h-4 w-4" />
              </div>
              <div className="brain-journey-card-copy">
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
              <div className="brain-journey-value">
                <span>Outcome</span>
                <strong>{item.value}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="brain-public-section executive-surface">
        <div className="brain-system-layout">
          <div className="brain-system-story">
            <div className="brain-section-heading">
              <div>
                <span className="landing-inline-label">Why It Matters</span>
                <h2 className="landing-section-title">Why a client would actually buy this</h2>
              </div>
            </div>

            <article className="brain-system-story-card">
              <span className="landing-inline-label">Product logic</span>
              <h3>brAIn makes AI visible, installable, and easier to sell</h3>
              <p>
                Buyers do not only want “AI somewhere in the cloud”. They want a device they can
                place in the real environment, demonstrate immediately, and connect to a managed
                service story with clear pricing and activation.
              </p>
            </article>

            <article className="brain-system-story-card">
              <span className="landing-inline-label">Business value</span>
              <h3>It turns passive hardware into active revenue or workflow surfaces</h3>
              <p>
                That means customer interaction on screens, better guidance at the front desk,
                clearer deployment for staff, and a platform layer that can scale after the first
                installation.
              </p>
            </article>
          </div>

          <div className="brain-system-pill-groups">
            <article className="brain-system-pill-group">
              <span>Protocols</span>
              <div className="brain-system-pill-row">
                {landingContent.integrations.protocols.map((item) => (
                  <span className="brain-system-pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
            <article className="brain-system-pill-group">
              <span>Platforms</span>
              <div className="brain-system-pill-row">
                {landingContent.integrations.platforms.map((item) => (
                  <span className="brain-system-pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
            <article className="brain-system-pill-group">
              <span>Cloud partners</span>
              <div className="brain-system-pill-row">
                {landingContent.integrations.cloudPartners.map((item) => (
                  <span className="brain-system-pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

    </main>
  );
}

export default AboutPage;
