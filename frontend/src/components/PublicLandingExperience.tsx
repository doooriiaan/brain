import { motion } from "framer-motion";
import {
  Cable,
  Cloud,
  Cpu,
  Sparkles,
  Star,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AuthPanel } from "./AuthPanel";
import { BrandShowcase } from "./BrandShowcase";
import { DevicePreviewStudio } from "./DevicePreviewStudio";
import { FrontPageChatPopup } from "./FrontPageChatPopup";
import type { Device, LandingContent, Sector } from "../types";

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
  onOpenAccess: () => void;
  onRegisterChange: (
    nextState:
      | RegisterFormState
      | ((currentState: RegisterFormState) => RegisterFormState),
  ) => void;
  onRegisterSubmit: () => void;
  onRoleChange: (role: AuthRole) => void;
  onSectorSelect: (sectorSlug: string) => void;
  onSignOut: () => void;
  registerForm: RegisterFormState;
  selectedCountryLabel: string;
  selectedLanguageLabel: string;
  showAccessPage: boolean;
  vpnActive: boolean;
};

const heroTitles: Record<string, string> = {
  commercial: "Turn any screen into a selling AI assistant.",
  business: "Put a real AI operator on the front desk.",
  healthcare: "Give clinics a calmer, guided AI front desk.",
  industry: "Bring machine signals into one AI control layer.",
};

const heroHighlights = [
  {
    icon: Zap,
    title: "Fast to explain",
    copy: "The buyer sees a real device, not an abstract AI promise.",
  },
  {
    icon: Users,
    title: "Easy to place",
    copy: "Install it in retail, reception, healthcare, or industrial environments.",
  },
  {
    icon: Star,
    title: "Built to scale",
    copy: "Plans, cards, rollout, and reporting grow from the same platform.",
  },
];

const commercialPlanOrder = ["free", "starter", "business", "platinum-plus"];

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
  onOpenAccess,
  onRegisterChange,
  onRegisterSubmit,
  onRoleChange,
  onSectorSelect,
  onSignOut,
  registerForm,
  selectedCountryLabel,
  selectedLanguageLabel,
  showAccessPage,
  vpnActive,
}: PublicLandingExperienceProps) {
  const resolvedSector = activeSector ?? landingContent.sectors[0] ?? null;
  const resolvedDevice =
    activeDevice ??
    (resolvedSector
      ? landingContent.devices.find((device) => device.sectorSlug === resolvedSector.slug) ?? null
      : null);
  const featuredPlan =
    landingContent.plans.find((plan) => plan.featured) ?? landingContent.plans[0] ?? null;
  const orderedPlans = commercialPlanOrder
    .map((slug) => landingContent.plans.find((plan) => plan.slug === slug))
    .filter((plan): plan is NonNullable<typeof featuredPlan> => Boolean(plan));
  const remainingPlans = landingContent.plans.filter(
    (plan) => !commercialPlanOrder.includes(plan.slug),
  );
  const highlightedPlans = [...orderedPlans, ...remainingPlans];

  const heroTitle =
    (resolvedSector && heroTitles[resolvedSector.slug]) ||
    "AI devices built for the places where work really happens.";

  const heroSubtitle =
    resolvedDevice && resolvedSector
      ? `${resolvedDevice.name} is the hardware layer for ${resolvedSector.name}. It adds a visible AI experience, a faster sales story, and a managed rollout path from the first install.`
      : landingContent.hero.subtitle;
  const featuredPlanPrice =
    featuredPlan?.monthlyPrice === 0
      ? "Free validation"
      : featuredPlan
        ? `EUR ${featuredPlan.monthlyPrice}/mo`
        : "Managed plan";
  const contextSnapshots = [
    {
      copy: resolvedDevice?.tagline ?? "Customer-facing AI device",
      label: "Active device",
      value: resolvedDevice?.name ?? "brAIn device",
    },
    {
      copy: resolvedSector?.audience ?? "Retail, business, healthcare, industry",
      label: "Sector lane",
      value: resolvedSector?.name ?? "Managed rollout",
    },
    {
      copy: featuredPlan?.supportLabel ?? "Priority support + onboarding",
      label: "Plan ready",
      value: featuredPlanPrice,
    },
  ];

  // Shorten long hero subtitle to the first sentence for a concise hero
  const shortHeroSubtitle = (heroSubtitle || "").split(".")[0] + ((heroSubtitle || "").includes(".") ? "." : "");
  const scrollToLandingSection = (sectionId: string) => {
    if (typeof document === "undefined") {
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleFrontChatNavigate = (target: "devices" | "access" | "help" | "sectors") => {
    if (target === "access") {
      onOpenAccess();
      return;
    }

    if (target === "devices") {
      scrollToLandingSection("landing-devices");
      return;
    }

    if (target === "sectors") {
      scrollToLandingSection("landing-overview");
      return;
    }

    if (typeof window !== "undefined") {
      window.location.assign("/help");
    }
  };

  return (
    <>
      <main className="brain-public-main" id="landing-center">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="brain-hero-shell executive-surface executive-surface-strong"
          id="landing-overview"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div aria-hidden="true" className="brain-hero-animated-backdrop">
            <div className="brain-hero-orb brain-hero-orb-left" />
            <div className="brain-hero-orb brain-hero-orb-right" />
            <div className="brain-hero-orb brain-hero-orb-bottom" />
            <div className="brain-hero-grid-glow" />
            <div className="brain-hero-data-stream brain-hero-data-stream-one" />
            <div className="brain-hero-data-stream brain-hero-data-stream-two" />
          </div>

          <div className="brain-hero-grid">
            <div className="brain-hero-copy-column">
              <BrandShowcase
                heroBadges={heroBadges}
                heroEyebrow={landingContent.hero.eyebrow}
                heroMetrics={heroMetrics}
                heroSubtitle={shortHeroSubtitle}
                heroTitle={heroTitle}
              />

              <div className="brain-hero-actions">
                <button className="executive-button-primary" onClick={onOpenAccess} type="button">
                  Open buyer access
                </button>
                <a className="executive-button-secondary" href="/about">
                  About the platform
                </a>
                <a className="executive-button-secondary" href="/help">
                  Help
                </a>
              </div>

              <div className="brain-hero-highlight-row">
                {heroHighlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div className="brain-hero-highlight-card" key={item.title}>
                      <div className="brain-hero-highlight-icon">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.copy}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="landing-hero-context-note">
                <span>Why this sells</span>
                The homepage now leads with the device, the use case, and the deployment outcome
                before asking the buyer to log in.
              </p>
            </div>

            <div className="brain-hero-stage-column">
              <div className="brain-hero-stage-card">
                <div className="brain-hero-stage-head">
                  <div>
                    <span className="landing-inline-label">Selected device</span>
                    <h2 className="landing-side-title">
                      {resolvedDevice?.name ?? "Choose a sector to review the device"}
                    </h2>
                    <p className="landing-side-copy">
                      {resolvedDevice?.description ??
                        "Pick the sector and the right device story becomes clearer on the right."}
                    </p>
                  </div>

                  {resolvedSector ? (
                    <span className="landing-selected-pill">{resolvedSector.name}</span>
                  ) : null}
                </div>

                <div className="brain-help-overview-grid brain-hero-stage-summary-grid">
                  <div className="brain-help-overview-card">
                    <div className="brain-help-overview-head">
                      <strong>Sector fit</strong>
                      <Cable className="brain-help-overview-icon h-4 w-4" />
                    </div>
                    <p>{resolvedSector?.audience ?? "Retail, business, healthcare, industry"}</p>
                    <div className="brain-help-overview-metric">
                      <span>Launch style</span>
                      <strong>{resolvedSector?.statValue ?? "Managed rollout"}</strong>
                    </div>
                  </div>

                  <div className="brain-help-overview-card">
                    <div className="brain-help-overview-head">
                      <strong>Best for</strong>
                      <Cpu className="brain-help-overview-icon h-4 w-4" />
                    </div>
                    <p>{resolvedDevice?.tagline ?? "Customer or operator interaction"}</p>
                    <div className="brain-help-overview-metric">
                      <span>Primary device</span>
                      <strong>{resolvedDevice?.name ?? "Managed AI device"}</strong>
                    </div>
                  </div>

                  <div className="brain-help-overview-card">
                    <div className="brain-help-overview-head">
                      <strong>Commercial path</strong>
                      <Cloud className="brain-help-overview-icon h-4 w-4" />
                    </div>
                    <p>{featuredPlan?.summary ?? "Choose the right plan and scale from there."}</p>
                    <div className="brain-help-overview-metric">
                      <span>Recommended</span>
                      <strong>{featuredPlan?.name ?? "Business"}</strong>
                    </div>
                  </div>
                </div>

                <div className="brain-proof-band">
                  {(resolvedDevice?.suitedFor ?? heroBadges).slice(0, 4).map((item) => (
                    <span className="brain-proof-chip" key={item}>
                      {item}
                    </span>
                  ))}
                </div>

                <div className="landing-device-shortcuts brain-hero-device-shortcuts">
                  {landingContent.sectors.map((sector) => {
                    const selected = sector.slug === resolvedSector?.slug;

                    return (
                      <button
                        className={`landing-device-shortcut ${
                          selected ? "landing-device-shortcut-active" : ""
                        }`}
                        key={sector.slug}
                        onClick={() => onSectorSelect(sector.slug)}
                        type="button"
                      >
                        <span>{sector.name}</span>
                        <small>{sector.statValue}</small>
                      </button>
                    );
                  })}
                </div>

                <p className="brain-hero-stage-note">
                  {contentLoading
                    ? "Refreshing content and runtime context..."
                    : "The first scan stays on the device, the audience, and the rollout fit."}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="brain-public-section executive-surface"
          id="landing-devices"
          initial={{ opacity: 0, y: 16 }}
          transition={{ delay: 0.05, duration: 0.42 }}
        >
          <div className="brain-section-heading">
            <div>
              <span className="landing-inline-label">Live product view</span>
              <h2 className="landing-section-title">
                Keep the active device visible before the buyer goes deeper
              </h2>
              <p className="landing-section-copy">
                This is the concrete product section from the preview flow, now brought back into
                the landing page in a clean light-mode layout.
              </p>
            </div>
          </div>

          <DevicePreviewStudio
            device={resolvedDevice}
            lightMode
            onSelectDevice={(deviceKey) => {
              const nextDevice =
                landingContent.devices.find((item) => item.deviceKey === deviceKey) ?? null;

              if (nextDevice?.sectorSlug) {
                onSectorSelect(nextDevice.sectorSlug);
              }
            }}
            plans={landingContent.plans}
            relatedDevices={landingContent.devices.slice(0, 4)}
            sector={resolvedSector}
          />
        </motion.section>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="brain-public-section executive-surface"
          id="landing-plans"
          initial={{ opacity: 0, y: 16 }}
          transition={{ delay: 0.08, duration: 0.42 }}
        >
          <div className="brain-plan-layout">
            <div>
              <div className="brain-section-heading">
                <div>
                  <span className="landing-inline-label">Prices</span>
                  <h2 className="landing-section-title">Clear pricing back on the landing page</h2>
                  <p className="landing-section-copy">
                    The buyer can now scan the device and the commercial path in one flow without
                    losing the cleaner landing structure.
                  </p>
                </div>
              </div>

              <div className="brain-plan-grid">
                {highlightedPlans.map((plan) => (
                  <article
                    className={`brain-plan-card ${plan.featured ? "brain-plan-card-featured" : ""}`}
                    key={plan.slug}
                  >
                    <div className="brain-plan-card-top">
                      <div>
                        <span>
                          {plan.slug === "free"
                            ? "Free validation"
                            : plan.featured
                              ? "Recommended plan"
                              : "Managed plan"}
                        </span>
                        <h3>{plan.name}</h3>
                      </div>
                      <span className="workspace-summary-pill">{plan.deviceAllowance}</span>
                    </div>

                    <p className="brain-plan-summary">{plan.summary}</p>
                    <p className="brain-plan-price">
                      {plan.monthlyPrice === 0 ? "Free" : `EUR ${plan.monthlyPrice}/mo`}
                    </p>

                    <div className="brain-plan-features">
                      {plan.features.slice(0, 3).map((feature) => (
                        <div className="brain-plan-feature" key={feature}>
                          <Sparkles className="h-4 w-4" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button className="executive-button-primary brain-plan-action" onClick={onOpenAccess} type="button">
                      Open buyer access
                    </button>
                  </article>
                ))}
              </div>
            </div>

            <div className="brain-plan-side">
              <article className="brain-plan-side-card brain-plan-side-card-featured">
                <span className="landing-inline-label">Selected context</span>
                <h3>{resolvedDevice?.name ?? "brAIn device"} fits this pricing lane</h3>
                <p>
                  The active sector, visible hardware, and chosen plan now stay grouped together so
                  the landing page feels more like a real product sale and less like separate pages.
                </p>
                <div className="brain-plan-side-pills">
                  <span>{resolvedSector?.name ?? "Managed rollout"}</span>
                  <span>{featuredPlan?.supportLabel ?? "Priority support"}</span>
                  <span>{featuredPlan?.deviceAllowance ?? "Multiple devices"}</span>
                </div>

                <div className="brain-plan-side-insight-grid">
                  {contextSnapshots.map((item) => (
                    <article className="brain-plan-side-insight-card" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <p>{item.copy}</p>
                    </article>
                  ))}
                </div>

                <div className="brain-plan-side-flow">
                  <div className="brain-plan-side-flow-node">
                    <Cpu className="h-4 w-4" />
                    <div>
                      <span>Device</span>
                      <strong>{resolvedDevice?.name ?? "brAIn hardware"}</strong>
                    </div>
                  </div>
                  <div className="brain-plan-side-flow-link" aria-hidden="true" />
                  <div className="brain-plan-side-flow-node">
                    <Cable className="h-4 w-4" />
                    <div>
                      <span>Lane</span>
                      <strong>{resolvedSector?.statValue ?? "Plug + deploy"}</strong>
                    </div>
                  </div>
                  <div className="brain-plan-side-flow-link" aria-hidden="true" />
                  <div className="brain-plan-side-flow-node">
                    <Cloud className="h-4 w-4" />
                    <div>
                      <span>Plan</span>
                      <strong>{featuredPlan?.name ?? "Business"}</strong>
                    </div>
                  </div>
                </div>
              </article>

              <FrontPageChatPopup
                device={resolvedDevice}
                embedded
                onNavigate={handleFrontChatNavigate}
                plans={landingContent.plans}
                sector={resolvedSector}
              />
            </div>
          </div>
        </motion.section>
      </main>

      {showAccessPage ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="brain-access-modal-shell"
          initial={{ opacity: 0 }}
        >
          <button
            aria-label="Close buyer access"
            className="brain-access-modal-backdrop"
            onClick={onCloseAccess}
            type="button"
          />

          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="brain-access-modal-card executive-surface executive-surface-strong"
            initial={{ opacity: 0, scale: 0.98, y: 14 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="brain-access-modal-head">
              <div>
                <span className="landing-inline-label">Buyer access</span>
                <h2 className="landing-section-title">
                  Continue only when the product fit is already clear
                </h2>
                <p className="landing-section-copy">
                  Login and workspace creation live in their own focused window instead of taking
                  over the product story.
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

              <div className="brain-access-side">
                <article className="brain-access-context-card">
                  <span className="landing-inline-label">Selected context</span>
                  <h3>{resolvedDevice?.name ?? "brAIn workspace"}</h3>
                  <p>
                    {resolvedSector?.summary ??
                      "Open access only once the buyer already understands the device and the rollout lane."}
                  </p>

                  <div className="brain-access-context-grid">
                    <div>
                      <span>Sector</span>
                      <strong>{resolvedSector?.name ?? "Not selected"}</strong>
                    </div>
                    <div>
                      <span>Access</span>
                      <strong>Buyer login</strong>
                    </div>
                    <div>
                      <span>Country</span>
                      <strong>{selectedCountryLabel}</strong>
                    </div>
                    <div>
                      <span>Route</span>
                      <strong>{vpnActive ? "Protected" : "Standard"}</strong>
                    </div>
                  </div>
                </article>

                <article className="brain-access-context-card">
                  <span className="landing-inline-label">What happens next</span>
                  <h3>Plans, payment, cards, and activation stay inside the portal</h3>
                  <p>
                    The public landing now sells the product first. The authenticated portal handles
                    validation, managed approvals, billing, and deployment after that.
                  </p>
                </article>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </>
  );
}
