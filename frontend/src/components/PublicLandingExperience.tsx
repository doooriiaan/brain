import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  Mail,
  MapPin,
  PhoneCall,
  Sparkles,
  X,
} from "lucide-react";
import { AuthPanel } from "./AuthPanel";
import { BrainBrand } from "./BrainBrand";
import { DeviceLiveModel } from "./DevicePreviewStudio";
import { FrontPageChatPopup } from "./FrontPageChatPopup";
import type { Device, LandingContent, Plan, Sector } from "../types";

type AuthRole = "admin" | "client";
type AuthMode = "login" | "register";

type UiMessage = {
  tone: "success" | "error" | "info";
  text: string;
} | null;

type LoginFormState = {
  role: AuthRole;
  email: string;
  password: string;
};

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  company: string;
  sector: string;
  plan: string;
};

type AuthSession = {
  token: string;
  issuedAt: string;
  user: {
    id: string;
    role: AuthRole;
    name: string;
    email: string;
    company: string;
    sector: string | null;
    plan: string | null;
  };
};

type PublicLandingExperienceProps = {
  activeDevice: Device | null;
  activeSector: Sector | null;
  authMessage: UiMessage;
  authMode: AuthMode;
  authSession: AuthSession | null;
  authStatusText: string;
  authSubmitting: boolean;
  contentLoading: boolean;
  heroBadges: string[];
  heroMetrics: Array<{
    label: string;
    value: string;
  }>;
  landingContent: LandingContent;
  loginForm: LoginFormState;
  onAuthModeChange: (mode: AuthMode) => void;
  onLoginChange: (
    nextState:
      | LoginFormState
      | ((currentState: LoginFormState) => LoginFormState),
  ) => void;
  onLoginSubmit: () => void;
  onCloseAccess: () => void;
  onCloseSectorWindow: () => void;
  onOpenAccess: () => void;
  onRegisterChange: (
    nextState:
      | RegisterFormState
      | ((currentState: RegisterFormState) => RegisterFormState),
  ) => void;
  onRegisterSubmit: () => void;
  onRoleChange: (role: AuthRole) => void;
  onSignOut: () => void;
  registerForm: RegisterFormState;
  selectedCountryLabel: string;
  selectedLanguageLabel: string;
  showAccessPage: boolean;
  showSectorWindow: boolean;
  vpnActive: boolean;
};

const publicPlanOrder = ["starter", "professional", "business", "platinum", "platinum-plus"];

const planToneBySlug: Record<string, string> = {
  starter: "starter",
  professional: "professional",
  business: "business",
  platinum: "platinum",
  "platinum-plus": "platinum-plus",
};

const planAudienceBySlug: Record<string, string> = {
  starter: "Ideal for small businesses starting with AI.",
  professional: "For growing companies.",
  business: "For scaling operations.",
  platinum: "Maximum power. No limits.",
  "platinum-plus": "For agencies and enterprises.",
};

const tokenFallbackBySlug: Record<string, string> = {
  free: "1 secure validation",
  starter: "600,000 tokens / year",
  professional: "2,400,000 tokens / year",
  business: "6,000,000 tokens / year",
  platinum: "18,000,000 tokens / year",
  "platinum-plus": "18,000,000 base tokens included",
};

const sectorHardwareSoftware = {
  hardware: ["HDMI or display output", "Wi-Fi / Ethernet", "Secure device identity"],
  software: ["AI chat + voice layer", "Cloud dashboard", "Plans, tokens, and activation"],
};

const landingContactItems = [
  {
    icon: MapPin,
    label: "Address",
    value: "New York",
  },
  {
    icon: Mail,
    label: "Contact",
    value: "hello@brain-ai.com",
  },
  {
    icon: PhoneCall,
    label: "Support",
    value: "Buyer and admin portal",
  },
];

function getOrderedPublicPlans(plans: Plan[]) {
  const ordered = publicPlanOrder
    .map((slug) => plans.find((plan) => plan.slug === slug))
    .filter((plan): plan is Plan => Boolean(plan));
  const rest = plans.filter(
    (plan) => !publicPlanOrder.includes(plan.slug) && plan.slug !== "free",
  );

  return [...ordered, ...rest].slice(0, 5);
}

function getPlanTokenLabel(plan: Plan) {
  return (
    plan.features.find((feature) => /token/i.test(feature)) ??
    tokenFallbackBySlug[plan.slug] ??
    "Token usage by plan"
  );
}

function getAnnualMonthPrice(plan: Plan) {
  if (plan.annualPrice <= 0) {
    return "Free";
  }

  return `EUR ${Math.floor(plan.annualPrice / 12)}/month`;
}

function getPlanPriceLabel(plan: Plan) {
  if (plan.annualPrice <= 0) {
    return "Free";
  }

  return `EUR ${plan.annualPrice.toLocaleString("en-GB")}`;
}

function getPlanFeatureList(plan: Plan) {
  const tokenLabel = getPlanTokenLabel(plan);
  const coreFeatures = [tokenLabel, plan.automationLabel, plan.deviceAllowance, plan.supportLabel];

  return Array.from(new Set(coreFeatures.filter(Boolean))).slice(0, 4);
}

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

function scrollToLandingSection(sectionId: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function PublicLandingExperience({
  activeDevice,
  activeSector,
  authMessage,
  authMode,
  authSession,
  authStatusText,
  authSubmitting,
  contentLoading,
  heroBadges,
  heroMetrics,
  landingContent,
  loginForm,
  onAuthModeChange,
  onLoginChange,
  onLoginSubmit,
  onCloseAccess,
  onCloseSectorWindow,
  onOpenAccess,
  onRegisterChange,
  onRegisterSubmit,
  onRoleChange,
  onSignOut,
  registerForm,
  selectedCountryLabel,
  selectedLanguageLabel,
  showAccessPage,
  showSectorWindow,
  vpnActive,
}: PublicLandingExperienceProps) {
  const resolvedSector = activeSector ?? landingContent.sectors[0] ?? null;
  const resolvedDevice =
    activeDevice ?? getDeviceForSector(resolvedSector, landingContent.devices);
  const publicPlans = getOrderedPublicPlans(landingContent.plans);
  const popularPlan =
    publicPlans.find((plan) => plan.slug === "platinum") ??
    publicPlans.find((plan) => plan.featured) ??
    publicPlans[0] ??
    null;
  const sectorWindowDevice = getDeviceForSector(resolvedSector, landingContent.devices);

  return (
    <>
      <main className="brain-public-main brain-public-main-clean" id="landing-center">
        <section className="brain-landing-hero-plain" id="landing-overview">
          <div aria-hidden="true" className="brain-hero-cinema-backdrop" />

          <div className="brain-clean-hero-grid">
            <div className="brain-clean-hero-copy">
              <BrainBrand showTagline subtitle="Managed AI devices" />
              <h1 className="brain-clean-hero-title">brAIn managed AI devices</h1>
              <p className="brain-clean-hero-text">
                Hardware plus software for Commercial, Business, Healthcare, and Industry AI.
              </p>

              <div className="brain-clean-hero-actions">
                <button className="executive-button-primary" onClick={onOpenAccess} type="button">
                  Buyer login
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  className="executive-button-secondary"
                  onClick={() => scrollToLandingSection("landing-plans")}
                  type="button"
                >
                  View plans
                </button>
              </div>

              <div className="brain-clean-hero-metrics">
                {(heroMetrics.length > 0
                  ? heroMetrics
                  : [
                      { label: "Sectors", value: `${heroBadges.length || 4}` },
                      { label: "Devices", value: `${landingContent.devices.length || 4}` },
                      { label: "Tokens", value: "Plan based" },
                    ]
                )
                  .slice(0, 3)
                  .map((metric) => (
                    <span key={metric.label}>
                      <strong>{metric.value}</strong>
                      {metric.label}
                    </span>
                  ))}
              </div>
            </div>

            <div className="brain-clean-hero-text-panel">
              <span>Devices now open on their own page</span>
              <strong>{resolvedDevice?.name ?? "brAIn device"}</strong>
              <p>{resolvedSector?.summary ?? "Pick a sector to preview the matching device."}</p>
            </div>
          </div>
        </section>

        <section className="brain-landing-plans-plain" id="landing-plans">
          <div className="brain-plans-heading-clean">
            <span className="landing-inline-label">Annual subscription plans</span>
            <h2 className="landing-section-title">Plans first. Tokens right under them.</h2>
            <p className="landing-section-copy">
              Clean annual pricing with device allowance, support, and yearly token limits.
            </p>
          </div>

          <div className="brain-annual-plan-grid">
            {publicPlans.map((plan) => {
              const isPopular = popularPlan?.slug === plan.slug;

              return (
                <article
                  className={`brain-annual-plan-card brain-annual-plan-card-${
                    planToneBySlug[plan.slug] ?? "default"
                  } ${isPopular ? "brain-annual-plan-card-popular" : ""}`}
                  key={plan.slug}
                >
                  {isPopular ? <span className="brain-plan-popular-badge">Most popular</span> : null}

                  <div className="brain-plan-orb" aria-hidden="true">
                    <Sparkles className="h-7 w-7" />
                  </div>

                  <h3>{plan.name}</h3>
                  <p className="brain-annual-plan-price">{getPlanPriceLabel(plan)}</p>
                  <span className="brain-annual-plan-period">/ year</span>
                  <span className="brain-annual-plan-month">({getAnnualMonthPrice(plan)})</span>

                  <div className="brain-annual-plan-features">
                    {getPlanFeatureList(plan).map((feature) => (
                      <p key={feature}>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{feature}</span>
                      </p>
                    ))}
                  </div>

                  <strong className="brain-annual-plan-audience">
                    {planAudienceBySlug[plan.slug] ?? plan.summary}
                  </strong>
                </article>
              );
            })}
          </div>

          <div className="brain-token-limit-board" aria-label="Token limits by plan">
            <div className="brain-token-limit-head">
              <span className="landing-inline-label">Token limits</span>
              <strong>Usage stays visible before login</strong>
            </div>

            <div className="brain-token-limit-grid">
              {publicPlans.map((plan) => (
                <article className="brain-token-limit-card" key={plan.slug}>
                  <span>{plan.name}</span>
                  <strong>{getPlanTokenLabel(plan)}</strong>
                  <p>{plan.deviceAllowance}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="brain-contact-strip" aria-label="Contact information">
            <div className="brain-contact-copy">
              <span className="landing-inline-label">Contact</span>
              <strong>Need a device rollout or a custom setup?</strong>
              <p>Reach out for buyer access, sector setup, device delivery, and admin approval.</p>
            </div>

            <div className="brain-contact-grid">
              {landingContactItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div className="brain-contact-item" key={item.label}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {showSectorWindow && resolvedSector ? (
        <div className="brain-sector-window-shell">
          <button
            aria-label="Close sector window"
            className="brain-sector-window-backdrop"
            onClick={onCloseSectorWindow}
            type="button"
          />

          <article className="brain-sector-window">
            <button
              aria-label="Close sector window"
              className="brain-sector-window-close"
              onClick={onCloseSectorWindow}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="brain-sector-window-copy">
              <span className="landing-inline-label">Hardware + software device</span>
              <h2>{resolvedSector.name}</h2>
              <p>{sectorWindowDevice?.tagline ?? resolvedSector.summary}</p>

              <div className="brain-sector-window-device-name">
                <Cpu className="h-5 w-5" />
                <strong>{sectorWindowDevice?.name ?? "brAIn device"}</strong>
              </div>

              <div className="brain-sector-window-lists">
                <div>
                  <span>Hardware</span>
                  {sectorHardwareSoftware.hardware.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
                <div>
                  <span>Software</span>
                  {sectorHardwareSoftware.software.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>

              <div className="brain-sector-window-actions">
                <button className="executive-button-primary" onClick={onOpenAccess} type="button">
                  Open buyer login
                </button>
                <button
                  className="executive-button-secondary"
                  onClick={() => {
                    onCloseSectorWindow();
                    scrollToLandingSection("landing-plans");
                  }}
                  type="button"
                >
                  See plans
                </button>
              </div>
            </div>

            <div className="brain-sector-3d-stage" data-sector={resolvedSector.slug}>
              <div className="brain-sector-3d-platform" />
              <div className="brain-sector-3d-device">
                <DeviceLiveModel compact device={sectorWindowDevice} sector={resolvedSector} />
              </div>
            </div>
          </article>
        </div>
      ) : null}

      <FrontPageChatPopup
        device={resolvedDevice}
        plans={landingContent.plans}
        sector={resolvedSector}
      />

      {showAccessPage ? (
        <div className="brain-access-modal-shell">
          <button
            aria-label="Close buyer access"
            className="brain-access-modal-backdrop"
            onClick={onCloseAccess}
            type="button"
          />

          <div className="brain-access-modal-card executive-surface executive-surface-strong">
            <div className="brain-access-modal-head">
              <div>
                <span className="landing-inline-label">Buyer access</span>
                <h2 className="landing-section-title">Login after product and plan are clear</h2>
                <p className="landing-section-copy">
                  Access stays in its own window so the main landing remains light.
                </p>
              </div>

              <button
                aria-label="Close buyer access"
                className="brain-access-modal-close"
                onClick={onCloseAccess}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="brain-access-layout">
              <AuthPanel
                authMessage={authMessage}
                authMode={authMode}
                authSession={authSession}
                authStatusText={authStatusText}
                authSubmitting={authSubmitting}
                loginForm={loginForm}
                onAuthModeChange={onAuthModeChange}
                onLoginChange={onLoginChange}
                onLoginSubmit={onLoginSubmit}
                onRegisterChange={onRegisterChange}
                onRegisterSubmit={onRegisterSubmit}
                onRoleChange={onRoleChange}
                onSignOut={onSignOut}
                registerForm={registerForm}
                selectedCountry={selectedCountryLabel}
                selectedLanguage={selectedLanguageLabel}
                showHeader={false}
                vpnActive={vpnActive}
              />

              <div className="brain-access-side brain-access-side-clean">
                <article className="brain-access-context-card">
                  <span className="landing-inline-label">Selected setup</span>
                  <h3>{resolvedDevice?.name ?? "brAIn workspace"}</h3>
                  <p>{resolvedSector?.name ?? "Managed AI lane"}</p>

                  <div className="brain-access-context-grid">
                    <div>
                      <span>Country</span>
                      <strong>{selectedCountryLabel}</strong>
                    </div>
                    <div>
                      <span>Route</span>
                      <strong>{vpnActive ? "Protected" : "Standard"}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{contentLoading ? "Syncing" : "Ready"}</strong>
                    </div>
                    <div>
                      <span>Flow</span>
                      <strong>Plans + tokens</strong>
                    </div>
                  </div>
                </article>

                <article className="brain-access-context-card">
                  <span className="landing-inline-label">AI assistant</span>
                  <h3>Ask before logging in</h3>
                  <p>
                    The popup chat answers product, plan, token, and login questions from the front
                    page.
                  </p>
                  <Bot className="brain-access-clean-icon h-7 w-7" />
                </article>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
