import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CreditCard,
  Layers3,
  ShieldCheck,
  SlidersHorizontal,
  Workflow,
} from "lucide-react";
import { BrainBrand } from "./BrainBrand";
import { SectionDropdown } from "./SectionDropdown";
import { SectorLiveMiniBoard } from "./SectorLiveBoard";
import type { Device, Plan, Sector } from "../types";
import {
  formatPlanLimit,
  formatTokenCount,
  getDeviceCountSliderMax,
  parsePlanDeviceLimit,
  parsePlanTokenLimit,
  resolveRecommendedPlan,
} from "../utils/planInsights";

type HelpCenterPageProps = {
  device: Device | null;
  lightMode: boolean;
  onOpenLogin: () => void;
  onOpenProducts: () => void;
  plans: Plan[];
  sector: Sector | null;
};

const faqItems = [
  {
    title: "How should buyers move through the site?",
    copy:
      "Start with sector fit and the real device story. Then open pricing, support, or login only when the visitor already understands the offer.",
  },
  {
    title: "Why is pricing in a separate window?",
    copy:
      "It keeps the homepage lighter and more premium, while still giving serious buyers a detailed page for plans, comparison, and questions.",
  },
  {
    title: "What happens with managed plans?",
    copy:
      "Managed plans keep the buyer journey clean while approvals, linked access, and rollout control continue behind the scenes.",
  },
] as const;

export function HelpCenterPage({
  device,
  lightMode,
  onOpenLogin,
  onOpenProducts,
  plans,
  sector,
}: HelpCenterPageProps) {
  const deviceSliderMax = useMemo(() => getDeviceCountSliderMax(plans), [plans]);
  const [deviceCount, setDeviceCount] = useState(() =>
    Math.max(1, Math.min(getDeviceCountSliderMax(plans), sector?.slug === "industry" ? 8 : 3)),
  );
  const [supportIntensity, setSupportIntensity] = useState(38);

  useEffect(() => {
    setDeviceCount((current) => Math.max(1, Math.min(current, deviceSliderMax)));
  }, [deviceSliderMax]);

  const { plan: recommendedPlan, estimatedYearlyTokens } = useMemo(
    () => resolveRecommendedPlan(plans, deviceCount, supportIntensity),
    [deviceCount, plans, supportIntensity],
  );

  const monthlyEstimate = useMemo(() => {
    return recommendedPlan?.monthlyPrice ?? 0;
  }, [recommendedPlan]);

  const annualEstimate = useMemo(() => {
    return recommendedPlan?.annualPrice ?? 0;
  }, [recommendedPlan]);

  const recommendedDeviceLimit = recommendedPlan
    ? parsePlanDeviceLimit(recommendedPlan)
    : 0;
  const recommendedTokenLimit = recommendedPlan
    ? parsePlanTokenLimit(recommendedPlan)
    : 0;

  const comparisonRows = useMemo(() => {
    const baseline = Math.max(annualEstimate, 96);

    return [
      {
        label: "brAIn",
        value: baseline,
        tone: "brain-help-bar-brain",
      },
      {
        label: "In-house rollout",
        value: Math.round(baseline * 1.58),
        tone: "brain-help-bar-alt-1",
      },
      {
        label: "Custom stack",
        value: Math.round(baseline * 1.92),
        tone: "brain-help-bar-alt-2",
      },
      {
        label: "Agency layer",
        value: Math.round(baseline * 1.42),
        tone: "brain-help-bar-alt-3",
      },
    ];
  }, [annualEstimate]);

  const maxComparisonValue = Math.max(...comparisonRows.map((row) => row.value), 1);
  const estimatedUsageLabel =
    recommendedPlan?.slug === "free"
      ? "1 guided validation"
      : `${formatTokenCount(estimatedYearlyTokens)}/yr`;
  const includedUsageLabel =
    recommendedPlan?.slug === "free"
      ? "1 secure validation"
      : formatPlanLimit(recommendedTokenLimit, "tokens");
  const includedDeviceLabel =
    recommendedPlan?.slug === "free"
      ? "1 validation lane"
      : formatPlanLimit(recommendedDeviceLimit, "devices");

  const helpModules = [
    {
      copy: "Adjust device count and support intensity to see the buyer lane tighten up.",
      icon: SlidersHorizontal,
      kicker: "Calculator",
      title: "Tune the pricing live",
      value: `${deviceCount} devices`,
    },
    {
      copy: "The current recommendation stays visible while yearly spend updates in real time.",
      icon: CreditCard,
      kicker: "Recommendation",
      title: recommendedPlan?.name ?? "Managed rollout",
      value: annualEstimate === 0 ? "Free access" : `EUR ${annualEstimate}/yr`,
    },
    {
      copy: "Keep a guided product conversation open while comparing plans and rollout detail.",
      icon: Activity,
      kicker: "Live board",
      title: sector?.name ?? "Product guidance",
      value: device?.name ?? "brAIn lineup",
    },
  ];

  const liveNotes = [
    {
      copy:
        sector?.audience ??
        "Pick a lane first so the device, rollout, and pricing stay connected.",
      label: "Selected lane",
      value: sector?.name ?? "Choose a sector",
    },
    {
      copy:
        device?.tagline ??
        "Keep the product visible with ports, metrics, and fit instead of static visuals.",
      label: "Device focus",
      value: device?.name ?? "Live hardware board",
    },
    {
      copy:
        recommendedPlan?.summary ??
        "Use the recommendation as the buyer lane, then move to access only when it is clear.",
      label: "Recommended plan",
      value: recommendedPlan?.name ?? "Managed rollout",
    },
  ];

  return (
    <main className={`help-center-shell brain-help-shell ${lightMode ? "light-mode" : ""}`}>
      <div className="brain-page-brand-bar">
        <a className="brain-page-brand-link" href="/">
          <BrainBrand showTagline subtitle="Managed AI devices" />
        </a>
        <a className="executive-button-secondary" href="/">
          Main page
        </a>
      </div>

      <section className="help-center-hero brain-help-hero executive-surface executive-surface-strong">
        <div className="help-center-hero-copy brain-help-hero-copy">
          <span className="landing-inline-label">Pricing + help</span>
          <h1 className="help-center-title brain-help-title">
            Keep the homepage focused. Put detail, comparison, and questions here.
          </h1>
          <p className="help-center-copy brain-help-copy">
            This page is the serious second step for buyers who want plan detail,
            device guidance, or live help without overloading the main preweb.
          </p>

          <div className="help-center-actions brain-help-actions">
            <button className="executive-button-secondary" onClick={onOpenProducts} type="button">
              Open live products
            </button>
            <button className="executive-button-primary" onClick={onOpenLogin} type="button">
              Open buyer login
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="help-center-summary-card brain-help-summary-card">
          <div className="help-center-summary-head brain-help-summary-head">
            <div>
              <p className="help-center-kicker">Selected context</p>
              <h2>{sector?.name ?? "Device guidance"}</h2>
            </div>
            <span className="help-center-summary-pill">
              {device?.name ?? "brAIn lineup"}
            </span>
          </div>

          <div className="help-center-summary-grid brain-help-summary-grid">
            <div className="help-center-summary-item">
              <span>Best fit</span>
              <strong>{sector?.audience ?? "Live customer environments"}</strong>
            </div>
            <div className="help-center-summary-item">
              <span>Recommended plan</span>
              <strong>{recommendedPlan?.name ?? "Managed rollout"}</strong>
            </div>
            <div className="help-center-summary-item">
              <span>Estimated spend</span>
              <strong>
                {annualEstimate === 0 ? "Free access" : `EUR ${annualEstimate}/yr`}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="brain-help-overview-grid" aria-label="Help center overview">
        {helpModules.map((item) => {
          const Icon = item.icon;

          return (
            <article className="brain-help-overview-card" key={item.kicker}>
              <div className="brain-help-overview-head">
                <div>
                  <span className="help-center-kicker">{item.kicker}</span>
                  <strong>{item.title}</strong>
                </div>
                <span className="brain-help-overview-icon">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p>{item.copy}</p>
              <div className="brain-help-overview-metric">
                <span>Current focus</span>
                <strong>{item.value}</strong>
              </div>
            </article>
          );
        })}
      </section>

      <section className="help-center-content brain-help-content">
        <div className="help-center-main brain-help-main">
          <section className="help-center-section brain-help-section executive-surface" id="help-pricing">
            <SectionDropdown
              actions={<SlidersHorizontal className="help-center-heading-icon h-5 w-5" />}
              bodyClassName="mt-5"
              defaultOpen
              summary={
                <div>
                  <span className="landing-inline-label">Interactive pricing</span>
                  <h2 className="landing-section-title">
                    Live calculator for device count and support intensity
                  </h2>
                  <p className="landing-section-copy">
                    Keep the calculator ready, but hide the heavier comparison until it is
                    actually needed.
                  </p>
                </div>
              }
              toggleLabel="pricing"
            >
              <div className="brain-help-pricing-layout">
              <article className="brain-help-pricing-card brain-help-pricing-card-primary">
                <span className="help-center-kicker">Estimated pricing</span>
                <div className="brain-help-estimate-stack">
                  <div>
                    <strong>
                      {monthlyEstimate === 0 ? "Free" : `EUR ${monthlyEstimate}`}
                    </strong>
                    <span>/per month</span>
                  </div>
                  <div>
                    <strong>
                      {annualEstimate === 0 ? "Free" : `EUR ${annualEstimate}`}
                    </strong>
                    <span>/per year</span>
                  </div>
                </div>

                <div className="brain-help-slider-group">
                  <label className="brain-help-slider">
                    <span>
                      Device count
                      <strong>{deviceCount}</strong>
                    </span>
                    <input
                      max={deviceSliderMax}
                      min={1}
                      onChange={(event) => setDeviceCount(Number(event.target.value))}
                      type="range"
                      value={deviceCount}
                    />
                  </label>

                  <label className="brain-help-slider">
                    <span>
                      Support intensity
                      <strong>{supportIntensity}%</strong>
                    </span>
                    <input
                      max={100}
                      min={0}
                      onChange={(event) => setSupportIntensity(Number(event.target.value))}
                      type="range"
                      value={supportIntensity}
                    />
                  </label>
                </div>

                <div className="brain-help-recommendation">
                  <span>Recommended plan</span>
                  <strong>{recommendedPlan?.name ?? "Choose a plan"}</strong>
                  <p>
                    {recommendedPlan?.summary ??
                      "Select the buyer lane and the calculator will suggest the cleanest fit."}
                  </p>
                  <div className="brain-help-recommendation-meta">
                    <div className="brain-help-recommendation-stat">
                      <span>Included devices</span>
                      <p className="brain-help-recommendation-value">{includedDeviceLabel}</p>
                    </div>
                    <div className="brain-help-recommendation-stat">
                      <span>Estimated usage</span>
                      <p className="brain-help-recommendation-value">{estimatedUsageLabel}</p>
                    </div>
                    <div className="brain-help-recommendation-stat">
                      <span>Included usage</span>
                      <p className="brain-help-recommendation-value">{includedUsageLabel}</p>
                    </div>
                  </div>
                </div>
              </article>

              <article className="brain-help-pricing-card brain-help-pricing-card-chart">
                <span className="help-center-kicker">Yearly comparison</span>
                <div className="brain-help-bar-chart">
                  {comparisonRows.map((row) => (
                    <div className="brain-help-bar-column" key={row.label}>
                      <span className="brain-help-bar-value">EUR {row.value}/yr</span>
                      <div
                        className={`brain-help-bar ${row.tone}`}
                        style={{
                          height: `${Math.max(24, (row.value / maxComparisonValue) * 100)}%`,
                        }}
                      />
                      <strong>{row.label}</strong>
                    </div>
                  ))}
                </div>
              </article>
              </div>
            </SectionDropdown>
          </section>

          <section className="help-center-section brain-help-section executive-surface">
            {/* Plans moved to preweb; keep help page focused on deeper pricing tools */}
          </section>

          <section className="help-center-section brain-help-section executive-surface">
            <SectionDropdown
              actions={<Layers3 className="help-center-heading-icon h-5 w-5" />}
              bodyClassName="mt-5"
              summary={
                <div>
                  <span className="landing-inline-label">Guidance</span>
                  <h2 className="landing-section-title">
                    Product-led navigation keeps the whole flow stronger
                  </h2>
                  <p className="landing-section-copy">
                    Keep the buyer guidance tucked away until someone wants the full explanation.
                  </p>
                </div>
              }
              toggleLabel="guidance"
            >
              <div className="help-center-faq-grid brain-help-faq-grid">
              {faqItems.map((item) => (
                <article className="help-center-faq-card" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.copy}</p>
                </article>
              ))}
              </div>
            </SectionDropdown>
          </section>
        </div>

        <aside className="help-center-side brain-help-side">
          <section className="help-center-section brain-help-section executive-surface">
            <SectionDropdown
              actions={<Activity className="help-center-heading-icon h-5 w-5" />}
              bodyClassName="mt-5"
              defaultOpen
              summary={
                <div>
                  <span className="landing-inline-label">Live board</span>
                  <h2 className="landing-section-title">See the current lane in runtime</h2>
                  <p className="landing-section-copy">
                    Keep the live lane ready, without forcing the whole block open all the time.
                  </p>
                </div>
              }
              toggleLabel="live board"
            >
              {sector ? (
                <SectorLiveMiniBoard
                  className="help-center-live-board"
                  device={device}
                  lightMode={lightMode}
                  mode="card"
                  plans={plans}
                  sector={sector}
                />
              ) : (
                <article className="brain-access-context-card">
                  <span className="landing-inline-label">Waiting for context</span>
                  <h3>Select a sector from the homepage</h3>
                  <p>
                    This side of the help page turns real once a lane is selected. Then the
                    runtime board, plan fit, and device context sync together.
                  </p>
                </article>
              )}

              <div className="brain-access-context-grid">
              {liveNotes.map((note) => (
                <div className="help-center-live-note" key={note.label}>
                  <span>{note.label}</span>
                  <strong>{note.value}</strong>
                  <p>{note.copy}</p>
                </div>
              ))}
              </div>
            </SectionDropdown>
          </section>

          <section className="help-center-section brain-help-section executive-surface">
            <SectionDropdown
              actions={<Workflow className="help-center-heading-icon h-5 w-5" />}
              bodyClassName="mt-5"
              summary={
                <div>
                  <span className="landing-inline-label">Next actions</span>
                  <h2 className="landing-section-title">Move forward without a detour</h2>
                  <p className="landing-section-copy">
                    Keep the CTA block there, but let it stay compact until the buyer is ready.
                  </p>
                </div>
              }
              toggleLabel="actions"
            >
              <div className="brain-access-side">
              <article className="brain-access-context-card">
                <span className="landing-inline-label">Buyer flow</span>
                <h3>Keep the path short and deliberate</h3>
                <p>
                  Use product view for hardware proof, keep pricing here for comparison,
                  then open login only when the setup already makes sense.
                </p>

                <div className="brain-help-actions">
                  <button
                    className="executive-button-primary"
                    onClick={onOpenLogin}
                    type="button"
                  >
                    Open buyer login
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    className="executive-button-secondary"
                    onClick={onOpenProducts}
                    type="button"
                  >
                    Open live products
                  </button>
                </div>
              </article>

              {recommendedPlan ? (
                <article className="brain-access-context-card">
                  <span className="landing-inline-label">Plan focus</span>
                  <h3>{recommendedPlan.name}</h3>
                  <p>{recommendedPlan.summary}</p>
                  <div className="help-center-plan-features">
                    {recommendedPlan.features.slice(0, 3).map((feature) => (
                      <div className="help-center-plan-feature" key={feature}>
                        <ShieldCheck className="h-4 w-4" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ) : null}
              </div>
            </SectionDropdown>
          </section>
        </aside>
      </section>
    </main>
  );
}
