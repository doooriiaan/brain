import { ArrowRight, Bot, Cpu, Layers3, MonitorPlay, ShieldCheck } from "lucide-react";
import type { LandingContent } from "../types";
import { BrainBrand } from "./BrainBrand";

type AboutPageProps = {
  landingContent: LandingContent;
  lightMode: boolean;
  selectedLanguage?: string;
  onOpenLogin?: () => void;
};

const aboutPillars = [
  {
    icon: Cpu,
    title: "Hardware",
    copy: "A real device for screens, desks, clinics, and edge environments.",
  },
  {
    icon: Bot,
    title: "Software",
    copy: "AI chat, voice, content, workflow, dashboard, and cloud control.",
  },
  {
    icon: ShieldCheck,
    title: "Managed access",
    copy: "Plans, tokens, cards, payments, and activation stay connected.",
  },
];

export function AboutPage({
  landingContent,
  lightMode,
  onOpenLogin,
}: AboutPageProps) {
  const publicPlans = landingContent.plans.filter((plan) => plan.slug !== "free").slice(0, 5);

  return (
    <main className={`brain-help-shell brain-about-shell brain-about-clean ${lightMode ? "light-mode" : ""}`}>
      <div className="brain-page-brand-bar">
        <a className="brain-page-brand-link" href="/">
          <BrainBrand showTagline subtitle="Managed AI devices" />
        </a>
        <a className="executive-button-secondary" href="/">
          Main page
        </a>
      </div>

      <section className="brain-about-hero-clean">
        <div className="brain-about-hero-copy">
          <span className="landing-inline-label">About brAIn</span>
          <h1 className="brain-help-title">Hardware + software AI devices.</h1>
          <p className="brain-help-copy">
            brAIn turns a physical device into a managed AI touchpoint with plans, tokens, and
            activation handled in one flow.
          </p>

          <div className="brain-help-actions">
            <button className="executive-button-primary" onClick={() => onOpenLogin?.()} type="button">
              Buyer login
              <ArrowRight className="h-4 w-4" />
            </button>
            <a className="executive-button-secondary" href="/help">
              Help
            </a>
          </div>
        </div>

        <div className="brain-about-logo-cinema" aria-hidden="true">
          <img src="/brand/brain-logo-final.jpeg" alt="" />
        </div>
      </section>

      <section className="brain-about-pillar-grid" aria-label="Platform pillars">
        {aboutPillars.map((item) => {
          const Icon = item.icon;

          return (
            <article className="brain-about-pillar-card" key={item.title}>
              <Icon className="h-5 w-5" />
              <strong>{item.title}</strong>
              <p>{item.copy}</p>
            </article>
          );
        })}
      </section>

      <section className="brain-about-section-clean">
        <div className="brain-plans-heading-clean">
          <span className="landing-inline-label">4 sectors</span>
          <h2 className="landing-section-title">One model per sector</h2>
        </div>

        <div className="brain-about-sector-grid">
          {landingContent.sectors.slice(0, 4).map((sector) => {
            const device =
              landingContent.devices.find((item) => item.deviceKey === sector.deviceKey) ??
              landingContent.devices.find((item) => item.sectorSlug === sector.slug);

            return (
              <article className="brain-about-sector-card" key={sector.slug}>
                <MonitorPlay className="h-5 w-5" />
                <span>{sector.name}</span>
                <strong>{device?.name ?? "brAIn device"}</strong>
                <p>{sector.statValue}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="brain-about-section-clean">
        <div className="brain-plans-heading-clean">
          <span className="landing-inline-label">Plans + tokens</span>
          <h2 className="landing-section-title">Pricing is simple before login</h2>
        </div>

        <div className="brain-about-plan-strip">
          {publicPlans.map((plan) => (
            <article className="brain-about-plan-pill" key={plan.slug}>
              <Layers3 className="h-4 w-4" />
              <span>{plan.name}</span>
              <strong>{plan.annualPrice > 0 ? `EUR ${plan.annualPrice}/yr` : "Free"}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default AboutPage;
