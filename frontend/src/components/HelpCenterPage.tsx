import { ArrowRight, Bot, ChevronDown, CreditCard, Cpu, HelpCircle, KeyRound } from "lucide-react";
import { BrainBrand } from "./BrainBrand";
import type { Device, Plan, Sector } from "../types";

type HelpCenterPageProps = {
  device: Device | null;
  lightMode: boolean;
  onOpenLogin: () => void;
  onOpenProducts: () => void;
  plans: Plan[];
  sector: Sector | null;
};

const quickHelp = [
  {
    icon: Cpu,
    title: "Device",
    copy: "Hardware plus software device, chosen by sector.",
  },
  {
    icon: CreditCard,
    title: "Plans",
    copy: "Annual plans show devices, support, and token limits.",
  },
  {
    icon: KeyRound,
    title: "Login",
    copy: "Buyer access opens after the product lane is clear.",
  },
  {
    icon: Bot,
    title: "AI chat",
    copy: "Use the popup on the main page for quick answers.",
  },
];

const quickQuestions = [
  {
    answer:
      "Start with Starter for a small rollout, Professional when you need more automation, and Business or Platinum when multiple devices, workflows, or integrations are active.",
    question: "Which plan should I choose first?",
  },
  {
    answer:
      "The device is the on-site hardware. The software layer adds AI chat, voice support, cloud dashboards, tokens, activation, and admin approval.",
    question: "What does hardware plus software mean?",
  },
  {
    answer:
      "Use buyer login after the sector, device, and plan are clear. Free access can validate instantly, while managed plans wait for admin approval and SC card linking.",
    question: "When do I use buyer login?",
  },
];

const tokenFallbackBySlug: Record<string, string> = {
  starter: "600,000 tokens / year",
  professional: "2,400,000 tokens / year",
  business: "6,000,000 tokens / year",
  platinum: "18,000,000 tokens / year",
  "platinum-plus": "18,000,000 tokens included + usage packs",
};

function getTokenLabel(plan: Plan) {
  return (
    plan.features.find((feature) => /token/i.test(feature)) ??
    tokenFallbackBySlug[plan.slug] ??
    "Token usage by plan"
  );
}

export function HelpCenterPage({
  device,
  lightMode,
  onOpenLogin,
  onOpenProducts,
  plans,
  sector,
}: HelpCenterPageProps) {
  const publicPlans = plans.filter((plan) => plan.slug !== "free").slice(0, 5);

  return (
    <main className={`help-center-shell brain-help-shell brain-help-clean ${lightMode ? "light-mode" : ""}`}>
      <div className="brain-page-brand-bar">
        <a className="brain-page-brand-link" href="/">
          <BrainBrand showTagline subtitle="Managed AI devices" />
        </a>
        <a className="executive-button-secondary" href="/">
          Main page
        </a>
      </div>

      <section className="brain-help-hero-clean">
        <div>
          <span className="landing-inline-label">Help</span>
          <h1 className="brain-help-title">Quick answers, no overloaded page.</h1>
          <p className="brain-help-copy">
            Pick a sector on the top navigation, review plans and tokens, then open buyer login.
          </p>

          <div className="brain-help-actions">
            <button className="executive-button-primary" onClick={onOpenLogin} type="button">
              Open buyer login
              <ArrowRight className="h-4 w-4" />
            </button>
            <button className="executive-button-secondary" onClick={onOpenProducts} type="button">
              Main page sectors
            </button>
          </div>
        </div>

        <article className="brain-help-context-clean">
          <HelpCircle className="h-5 w-5" />
          <span>Current lane</span>
          <strong>{sector?.name ?? "Choose a sector"}</strong>
          <p>{device?.name ?? "Open a sector window from the top navigation."}</p>
        </article>
      </section>

      <section className="brain-help-quick-grid" aria-label="Quick help topics">
        {quickHelp.map((item) => {
          const Icon = item.icon;

          return (
            <article className="brain-help-quick-card" key={item.title}>
              <Icon className="h-5 w-5" />
              <strong>{item.title}</strong>
              <p>{item.copy}</p>
            </article>
          );
        })}
      </section>

      <section className="brain-help-faq-clean" aria-label="Quick questions">
        <div className="brain-plans-heading-clean">
          <span className="landing-inline-label">Quick questions</span>
          <h2 className="landing-section-title">Most asked before login</h2>
          <p className="landing-section-copy">
            Three short answers for plan choice, device setup, and buyer access.
          </p>
        </div>

        <div className="brain-help-faq-stack">
          {quickQuestions.map((item, index) => (
            <details className="brain-help-faq-item" key={item.question} open={index === 0}>
              <summary>
                <span>{item.question}</span>
                <ChevronDown className="h-4 w-4" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="brain-help-token-section">
        <div className="brain-plans-heading-clean">
          <span className="landing-inline-label">Token limits</span>
          <h2 className="landing-section-title">Usage by annual plan</h2>
        </div>

        <div className="brain-token-limit-grid">
          {publicPlans.map((plan) => (
            <article className="brain-token-limit-card" key={plan.slug}>
              <span>{plan.name}</span>
              <strong>{getTokenLabel(plan)}</strong>
              <p>{plan.deviceAllowance}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
