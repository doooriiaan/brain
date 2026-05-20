import { motion } from "framer-motion";
import {
  ArrowRight,
  Cpu,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { AuthPanel } from "./AuthPanel";
import { BrandShowcase } from "./BrandShowcase";
import { DeviceHeroCollage } from "./DeviceHeroCollage";
import { DevicePreviewStudio } from "./DevicePreviewStudio";
import { FrontPageChatPopup } from "./FrontPageChatPopup";
import { SectionDropdown } from "./SectionDropdown";
import { SectorLiveBoard } from "./SectorLiveBoard";
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

type HighlightItem = {
  detail: string;
  icon: LucideIcon;
  title: string;
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
  featuredPlan: Plan | null;
  heroBadges: string[];
  heroMetrics: Array<{
    label: string;
    value: string;
  }>;
  lightMode: boolean;
  landingContent: LandingContent;
  landingPlanCards: Plan[];
  loginForm: LoginFormState;
  onAuthModeChange: (mode: AuthMode) => void;
  onDeviceSelect: (deviceKey: string) => void;
  onLoginChange: (
    nextState:
      | LoginFormState
      | ((currentState: LoginFormState) => LoginFormState),
  ) => void;
  onLoginSubmit: () => void;
  onOpenAccess: () => void;
  onCloseAccess: () => void;
  onOpenHelp: () => void;
  onOpenOverview: () => void;
  onOpenProducts: () => void;
  onOpenRegisterForSector: (sector: Sector, plan?: Plan) => void;
  onRegisterChange: (
    nextState:
      | RegisterFormState
      | ((currentState: RegisterFormState) => RegisterFormState),
  ) => void;
  onRegisterSubmit: () => void;
  onRoleChange: (role: AuthRole) => void;
  onSectorSelect: (sectorSlug: string) => void;
  onSignOut: () => void;
  partnerSignals: string[];
  registerForm: RegisterFormState;
  salesHighlights: HighlightItem[];
  selectedCountryLabel: string;
  selectedLanguageLabel: string;
  showAccessPage: boolean;
  vpnActive: boolean;
};

const LIGHT_MODE_ACCENT = "#d45a34";

const aboutBlueprint = [
  {
    title: "Device-first story",
    copy:
      "Every page starts with a physical product story, not a generic software landing.",
    icon: Cpu,
  },
  {
    title: "Guided cloud control",
    copy:
      "The buyer sees a clean path while operations, approvals, and rollout stay connected behind the scenes.",
    icon: Workflow,
  },
  {
    title: "Trusted activation",
    copy:
      "brAIn keeps plans, access, and device rollout in one structured flow instead of scattered steps.",
    icon: ShieldCheck,
  },
  {
    title: "Live planning lane",
    copy:
      "Pricing, setup, and rollout detail stay available without turning the homepage into noise.",
    icon: Sparkles,
  },
] as const;

const heroLogoBackdropCards: Array<{
  animate: {
    rotate: number[];
    scale: number[];
    x: number[];
    y: number[];
  };
  className: string;
  key: string;
  transition: {
    duration: number;
    ease: "easeInOut";
    repeat: number;
  };
}> = [
  {
    key: "main",
    className: "brain-hero-logo-card brain-hero-logo-card-main",
    animate: {
      x: [0, 22, 0],
      y: [0, -18, 0],
      rotate: [-8, -4, -8],
      scale: [1, 1.03, 1],
    },
    transition: {
      duration: 18,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
  {
    key: "north",
    className: "brain-hero-logo-card brain-hero-logo-card-north",
    animate: {
      x: [0, -18, 0],
      y: [0, 14, 0],
      rotate: [7, 11, 7],
      scale: [1, 1.05, 1],
    },
    transition: {
      duration: 16,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
  {
    key: "south",
    className: "brain-hero-logo-card brain-hero-logo-card-south",
    animate: {
      x: [0, 14, 0],
      y: [0, -12, 0],
      rotate: [-10, -6, -10],
      scale: [1, 1.04, 1],
    },
    transition: {
      duration: 20,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
];

export function PublicLandingExperience({
  activeDevice,
  activeSector,
  authMessage,
  authMode,
  authSession,
  authStatusText,
  authSubmitting,
  contentLoading,
  featuredPlan,
  heroBadges,
  heroMetrics,
  lightMode,
  landingContent,
  landingPlanCards,
  loginForm,
  onAuthModeChange,
  onDeviceSelect,
  onLoginChange,
  onLoginSubmit,
  onOpenAccess,
  onCloseAccess,
  onOpenHelp,
  onOpenOverview,
  onOpenProducts,
  onOpenRegisterForSector,
  onRegisterChange,
  onRegisterSubmit,
  onRoleChange,
  onSectorSelect,
  onSignOut,
  partnerSignals,
  registerForm,
  salesHighlights,
  selectedCountryLabel,
  selectedLanguageLabel,
  showAccessPage,
  vpnActive,
}: PublicLandingExperienceProps) {
  const resolvedSector = activeSector ?? landingContent.sectors[0] ?? null;
  const resolvedDevice =
    activeDevice ??
    (resolvedSector
      ? landingContent.devices.find(
          (device) => device.sectorSlug === resolvedSector.slug,
        ) ?? null
      : null);

  const spotlightNotes = [
    {
      label: "Selected lane",
      value: resolvedSector?.name ?? "Choose a sector",
      copy:
        resolvedSector?.audience ??
        "Commercial, business, healthcare, and industrial lanes stay separated clearly.",
    },
    {
      label: "Product focus",
      value: resolvedDevice?.name ?? "Live hardware preview",
      copy:
        resolvedDevice?.tagline ??
        "Use a real device stage instead of flat mockups or static placeholders.",
    },
    {
      label: "Next step",
      value: featuredPlan?.name ?? "Managed rollout",
      copy:
        "Plans and help open in a clean secondary flow, while login stays a deliberate buyer step.",
    },
  ];

  const journeyMap: Array<{
    active: boolean;
    detail: string;
    icon: LucideIcon;
    step: string;
    title: string;
    value: string;
  }> = [
    {
      active: Boolean(resolvedSector),
      detail: "Open with the audience fit so the homepage feels targeted instead of generic.",
      icon: Workflow,
      step: "01",
      title: "Sector lane",
      value: resolvedSector?.name ?? "Choose a solution lane",
    },
    {
      active: Boolean(resolvedDevice),
      detail: "Let the buyer see a real device stage, not a static brochure block.",
      icon: Cpu,
      step: "02",
      title: "Product proof",
      value: resolvedDevice?.name ?? "Preview the live hardware",
    },
    {
      active: Boolean(featuredPlan),
      detail: "Keep plan detail visible, but move the deeper comparison into a cleaner second step.",
      icon: ShieldCheck,
      step: "03",
      title: "Plan clarity",
      value: featuredPlan?.name ?? "Managed rollout plan",
    },
    {
      active: showAccessPage,
      detail: "Open buyer access only when the lane and product already make sense.",
      icon: Sparkles,
      step: "04",
      title: "Buyer access",
      value: showAccessPage ? "Access stage is open" : "Keep it in reserve",
    },
  ];

  const integrationGroups = [
    {
      label: "Protocols",
      items: landingContent.integrations.protocols.slice(0, 4),
    },
    {
      label: "Platforms",
      items: landingContent.integrations.platforms.slice(0, 4),
    },
    {
      label: "Cloud partners",
      items: landingContent.integrations.cloudPartners.slice(0, 4),
    },
  ].filter((group) => group.items.length > 0);

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
              <div className="brain-hero-data-stream brain-hero-data-stream-three" />

              {heroLogoBackdropCards.map((item) => (
                <motion.div
                  animate={item.animate}
                  className={item.className}
                  key={item.key}
                  transition={item.transition}
                >
                  <img
                    alt=""
                    className="brain-hero-logo-image"
                    loading="eager"
                    src="/brand/brain-logo-final.jpeg"
                  />
                </motion.div>
              ))}
            </div>

            <div className="brain-hero-grid">
              <div className="brain-hero-copy-column">
                <BrandShowcase
                  currentCountry={selectedCountryLabel}
                  currentLanguage={selectedLanguageLabel}
                  heroBadges={heroBadges}
                  heroEyebrow={landingContent.hero.eyebrow}
                  heroMetrics={heroMetrics}
                  heroSubtitle={
                    resolvedDevice && resolvedSector
                      ? `${resolvedDevice.tagline} Designed for ${resolvedSector.audience}.`
                      : landingContent.hero.subtitle
                  }
                  heroTitle={
                    resolvedDevice
                      ? `${resolvedDevice.name} makes brAIn feel real on-site.`
                      : landingContent.hero.title
                  }
                  vpnActive={vpnActive}
                />

                <div className="brain-hero-actions">
                  <button
                    className="executive-button-primary"
                    onClick={onOpenProducts}
                    type="button"
                  >
                    Explore products
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    className="executive-button-secondary"
                    onClick={onOpenHelp}
                    type="button"
                  >
                    Open pricing + help
                  </button>
                </div>

                <div className="brain-hero-spotlight-grid">
                  {spotlightNotes.map((item) => (
                    <article className="brain-hero-spotlight-card" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <p>{item.copy}</p>
                    </article>
                  ))}
                </div>

                <div className="brain-hero-highlight-row">
                  {salesHighlights.map((item) => {
                    const Icon = item.icon;

                    return (
                      <article className="brain-hero-highlight-card" key={item.title}>
                        <span className="brain-hero-highlight-icon">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.detail}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="brain-hero-stage-column">
                <div className="brain-hero-stage-card">
                  <div className="brain-hero-stage-head">
                    <div>
                      <span className="landing-inline-label">Live stage</span>
                      <h2 className="landing-side-title">
                        {resolvedDevice?.name ?? "Choose a lane to open the stage"}
                      </h2>
                      <p className="landing-side-copy">
                        {resolvedDevice?.description ??
                          "The right side stays alive with device context, sector logic, and product detail."}
                      </p>
                    </div>

                    {resolvedSector ? (
                      <span className="landing-selected-pill">{resolvedSector.name}</span>
                    ) : null}
                  </div>

                  <DeviceHeroCollage
                    device={resolvedDevice}
                    lightMode={lightMode}
                    plans={landingContent.plans}
                    sector={resolvedSector}
                  />

                  <p className="brain-hero-stage-note">
                    {contentLoading
                      ? "Refreshing content and runtime context..."
                      : "The homepage stays product-led, while help, pricing, and access remain structured in their own places."}
                  </p>
                </div>
              </div>
            </div>

            {partnerSignals.length > 0 ? (
              <div className="brain-proof-band">
                {partnerSignals.map((signal) => (
                  <span className="brain-proof-chip" key={signal}>
                    {signal}
                  </span>
                ))}
              </div>
            ) : null}
        </motion.section>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="brain-journey-shell executive-surface"
          id="landing-journey"
          initial={{ opacity: 0, y: 16 }}
          transition={{ delay: 0.02, duration: 0.4 }}
        >
          <div className="brain-section-heading">
            <div>
              <span className="landing-inline-label">Journey map</span>
              <h2 className="landing-section-title">
                Make the visitor flow obvious before asking for action
              </h2>
              <p className="landing-section-copy">
                The public story lands better when the visitor can read the order at a
                glance: solution fit, product proof, pricing clarity, then access.
              </p>
            </div>

            <button
              className="executive-button-secondary"
              onClick={showAccessPage ? onOpenOverview : onOpenAccess}
              type="button"
            >
              {showAccessPage ? "Keep story visible" : "Open buyer access"}
            </button>
          </div>

          <div className="brain-journey-grid">
            {journeyMap.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className={`brain-journey-card ${item.active ? "brain-journey-card-active" : ""}`}
                  key={item.step}
                >
                  <div className="brain-journey-card-head">
                    <span className="brain-journey-step">{item.step}</span>
                    <span className="brain-journey-icon">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="brain-journey-card-copy">
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <div className="brain-journey-value">
                    <span>Current state</span>
                    <strong>{item.value}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="brain-public-section executive-surface"
          id="preweb-sectors"
          initial={{ opacity: 0, y: 16 }}
          transition={{ delay: 0.04, duration: 0.42 }}
        >
          <div className="brain-section-heading">
            <div>
              <span className="landing-inline-label">Solutions</span>
              <h2 className="landing-section-title">
                One structure, four clear deployment lanes
              </h2>
              <p className="landing-section-copy">
                Each sector gets its own message, device logic, and rollout posture so
                the homepage feels intentional instead of crowded.
              </p>
            </div>

            <button
              className="executive-button-secondary"
              onClick={onOpenHelp}
              type="button"
            >
              Open help window
            </button>
          </div>

          <div className="brain-sector-layout">
            <div className="brain-sector-grid">
              {landingContent.sectors.map((sector, index) => {
                const accent = lightMode ? LIGHT_MODE_ACCENT : sector.accent;
                const selected = sector.slug === resolvedSector?.slug;

                return (
                  <motion.button
                    animate={{ opacity: 1, y: 0 }}
                    className={`brain-sector-card ${selected ? "brain-sector-card-active" : ""}`}
                    initial={{ opacity: 0, y: 18 }}
                    key={sector.slug}
                    onClick={() => onSectorSelect(sector.slug)}
                    style={selected ? { borderColor: `${accent}55` } : undefined}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    type="button"
                    whileHover={{ y: -4 }}
                  >
                    <div className="brain-sector-card-top">
                      <div>
                        <span>Lane {index + 1}</span>
                        <strong>{sector.name}</strong>
                      </div>
                      <span
                        className="brain-sector-accent"
                        style={{ backgroundColor: accent }}
                      />
                    </div>

                    <p>{sector.summary}</p>

                    <div className="brain-sector-card-footer">
                      <span>{sector.statValue}</span>
                      <span>{selected ? "Active" : "Open lane"}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="brain-sector-stage">
              {resolvedSector ? (
                <>
                  <SectorLiveBoard
                    compact
                    device={resolvedDevice}
                    lightMode={lightMode}
                    plans={landingContent.plans}
                    sector={resolvedSector}
                  />

                  <div className="brain-sector-story-grid">
                    {resolvedSector.capabilities.slice(0, 4).map((capability) => (
                      <div className="brain-sector-story-card" key={capability}>
                        <ShieldCheck className="h-4 w-4" />
                        <p>{capability}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </motion.section>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="brain-public-section executive-surface"
          id="landing-devices"
          initial={{ opacity: 0, y: 16 }}
          transition={{ delay: 0.08, duration: 0.42 }}
        >
          <SectionDropdown
            actions={
              resolvedSector ? (
                <button
                  className="executive-button-primary"
                  onClick={() => onOpenRegisterForSector(resolvedSector, featuredPlan ?? undefined)}
                  type="button"
                >
                  Start with this lane
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null
            }
            bodyClassName="mt-5"
            defaultOpen
            summary={
              <div>
                <span className="landing-inline-label">Products</span>
                <h2 className="landing-section-title">
                  Live hardware presentation instead of flat placeholders
                </h2>
                <p className="landing-section-copy">
                  Product proof stays visible, while the heavy detail only opens when
                  needed.
                </p>
              </div>
            }
            toggleLabel="products"
          >
            {resolvedSector && resolvedDevice ? (
              <DevicePreviewStudio
                device={resolvedDevice}
                lightMode={lightMode}
                onDeploy={() =>
                  onOpenRegisterForSector(resolvedSector, featuredPlan ?? undefined)
                }
                onSelectDevice={onDeviceSelect}
                plans={landingContent.plans}
                relatedDevices={landingContent.devices}
                sector={resolvedSector}
              />
            ) : null}
          </SectionDropdown>
        </motion.section>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="brain-public-section executive-surface"
          id="landing-platform"
          initial={{ opacity: 0, y: 16 }}
          transition={{ delay: 0.14, duration: 0.42 }}
        >
          <SectionDropdown
            actions={
              <button
                className="executive-button-secondary"
                onClick={onOpenProducts}
                type="button"
              >
                Revisit hardware stage
              </button>
            }
            bodyClassName="mt-5"
            summary={
              <div>
                <span className="landing-inline-label">Platform flow</span>
                <h2 className="landing-section-title">{landingContent.cloudSystem.title}</h2>
                <p className="landing-section-copy">
                  Open the rollout logic only when someone wants the full system view.
                </p>
              </div>
            }
            toggleLabel="platform"
          >
            <div className="brain-system-layout">
              <div className="brain-system-story">
                <article className="brain-system-story-card">
                  <span className="landing-inline-label">Why this adds structure</span>
                  <h3>Each visible page block now maps to a real deployment sequence.</h3>
                  <p>
                    The site no longer feels like separate cards placed side by side. It
                    reads as one progression from physical device to connected cloud
                    rollout.
                  </p>
                </article>

                <div className="brain-system-pill-groups">
                  {integrationGroups.map((group) => (
                    <article className="brain-system-pill-group" key={group.label}>
                      <span>{group.label}</span>
                      <div className="brain-system-pill-row">
                        {group.items.map((item) => (
                          <strong className="brain-system-pill" key={item}>
                            {item}
                          </strong>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="brain-system-step-grid">
                {landingContent.cloudSystem.steps.slice(0, 4).map((step, index) => (
                  <article className="brain-system-step-card" key={step.title}>
                    <span className="brain-system-step-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong>{step.title}</strong>
                    <p>{step.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </SectionDropdown>
        </motion.section>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="brain-public-section executive-surface"
          id="landing-values"
          initial={{ opacity: 0, y: 16 }}
          transition={{ delay: 0.18, duration: 0.42 }}
        >
          <SectionDropdown
            bodyClassName="mt-5"
            summary={
              <div>
                <span className="landing-inline-label">About brAIn</span>
                <h2 className="landing-section-title">
                  Structured like a serious product, not a rushed preweb
                </h2>
                <p className="landing-section-copy">
                  Keep the brand logic compact, then open the deeper story only when
                  needed.
                </p>
              </div>
            }
            toggleLabel="about"
          >
            <div className="brain-values-layout">
              <div className="brain-values-story">
                <div className="brain-values-stat-grid">
                  {landingContent.cloudSystem.highlights.slice(0, 3).map((highlight) => (
                    <div className="brain-values-stat-card" key={highlight}>
                      <strong>{highlight}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="brain-values-grid">
                {aboutBlueprint.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article className="brain-values-card" key={item.title}>
                      <span className="brain-values-icon">
                        <Icon className="h-4 w-4" />
                      </span>
                      <strong>{item.title}</strong>
                      <p>{item.copy}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </SectionDropdown>
        </motion.section>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="brain-public-section executive-surface"
          id="landing-plans"
          initial={{ opacity: 0, y: 16 }}
          transition={{ delay: 0.22, duration: 0.42 }}
        >
          <SectionDropdown
            actions={
              <button
                className="executive-button-secondary"
                onClick={onOpenHelp}
                type="button"
              >
                Open full pricing
              </button>
            }
            bodyClassName="mt-5"
            summary={
              <div>
                <span className="landing-inline-label">Pricing</span>
                <h2 className="landing-section-title">
                  Every plan visible here, full detail in its own window
                </h2>
                <p className="landing-section-copy">
                  Keep the first scan short, then open the full comparison only when the
                  buyer asks for it.
                </p>
              </div>
            }
            toggleLabel="pricing"
          >
            <div className="brain-plan-layout">
              <div className="brain-plan-grid">
                {landingPlanCards.map((plan) => (
                  <article
                    className={`brain-plan-card ${plan.featured ? "brain-plan-card-featured" : ""}`}
                    key={plan.slug}
                  >
                    <div className="brain-plan-card-top">
                      <div>
                        <span>
                          {plan.slug === "free"
                            ? "Free lane"
                            : plan.featured
                              ? "Recommended"
                              : "Managed rollout"}
                        </span>
                        <h3>{plan.name}</h3>
                      </div>
                      <strong className="brain-plan-price">
                        {plan.monthlyPrice === 0 ? "Free" : `EUR ${plan.monthlyPrice}/mo`}
                      </strong>
                    </div>

                    <p className="brain-plan-summary">{plan.summary}</p>

                    <div className="brain-plan-meta">
                      <span>{plan.deviceAllowance}</span>
                      <span>{plan.supportLabel}</span>
                    </div>

                    <div className="brain-plan-features">
                      {plan.features.slice(0, 4).map((feature) => (
                        <div className="brain-plan-feature" key={feature}>
                          <ShieldCheck className="h-4 w-4" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      className="executive-button-secondary brain-plan-action"
                      onClick={() =>
                        resolvedSector
                          ? onOpenRegisterForSector(resolvedSector, plan)
                          : onOpenAccess()
                      }
                      type="button"
                    >
                      Continue with {plan.name}
                    </button>
                  </article>
                ))}
              </div>

              <aside className="brain-plan-side">
                <div className="brain-plan-side-card brain-plan-side-card-featured">
                  <span className="landing-inline-label">Why this structure works</span>
                  <h3>Let the homepage sell the device. Let the help page close the detail.</h3>
                  <p>
                    This keeps the public experience cleaner, while buyers still have a
                    serious place for full pricing, comparison, and support.
                  </p>
                  <div className="brain-plan-side-pills">
                    {(partnerSignals.length > 0 ? partnerSignals : heroBadges)
                      .slice(0, 4)
                      .map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                  </div>
                </div>

                <div className="brain-plan-side-card">
                  <span className="landing-inline-label">Next move</span>
                  <h3>Open the full pricing and help page in a separate window.</h3>
                  <p>
                    Buyers who want more detail can compare plans and check the live
                    runtime context there, while the homepage stays sharper.
                  </p>
                  <div className="brain-plan-side-actions">
                    <button
                      className="executive-button-primary"
                      onClick={onOpenHelp}
                      type="button"
                    >
                      Open pricing window
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      className="executive-button-secondary"
                      onClick={onOpenAccess}
                      type="button"
                    >
                      Buyer login
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </SectionDropdown>
        </motion.section>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="brain-access-strip executive-surface"
          id="landing-access-page"
          initial={{ opacity: 0, y: 14 }}
          transition={{ delay: 0.24, duration: 0.4 }}
        >
          <div>
            <span className="landing-inline-label">Access</span>
            <h2 className="landing-section-title">
              Open buyer access in its own focused window
            </h2>
            <p className="landing-section-copy">
              Buyer access opens as its own focused window so the product, lane, and
              live hardware story stay visible in the main experience.
            </p>
          </div>

          <div className="brain-access-strip-actions">
            <button
              className="executive-button-primary"
              onClick={onOpenAccess}
              type="button"
            >
              Open buyer login
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              className="executive-button-secondary"
              onClick={onOpenHelp}
              type="button"
            >
              Open pricing window
            </button>
          </div>
        </motion.section>
      </main>

      {!showAccessPage ? (
        <FrontPageChatPopup
          device={resolvedDevice}
          onNavigate={(target) => {
            if (target === "devices") {
              onOpenProducts();
              return;
            }

            if (target === "access") {
              onOpenAccess();
              return;
            }

            if (target === "help") {
              onOpenHelp();
              return;
            }

            if (resolvedSector) {
              onSectorSelect(resolvedSector.slug);
              return;
            }

            onOpenOverview();
          }}
          plans={landingContent.plans}
          sector={resolvedSector}
        />
      ) : null}

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
                  Login and workspace creation live in their own focused window instead
                  of taking over the landing page.
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
                      "Use access when the buyer is already convinced about the device and the rollout lane."}
                  </p>

                  <div className="brain-access-context-grid">
                    <div>
                      <span>Sector</span>
                      <strong>{resolvedSector?.name ?? "Not selected"}</strong>
                    </div>
                    <div>
                      <span>Plan</span>
                      <strong>{featuredPlan?.name ?? "Managed rollout"}</strong>
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
                  <span className="landing-inline-label">Keep it real</span>
                  <h3>Use access only after the live lane feels right</h3>
                  <p>
                    Product proof stays on the homepage. Pricing and comparison stay in
                    the help window. Access opens here only when the buyer is ready to
                    continue.
                  </p>
                  <div className="brain-access-strip-actions">
                    <button
                      className="executive-button-secondary"
                      onClick={onOpenProducts}
                      type="button"
                    >
                      Review products
                    </button>
                    <button
                      className="executive-button-secondary"
                      onClick={onOpenHelp}
                      type="button"
                    >
                      Open pricing
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </>
  );
}
