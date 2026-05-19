import { Languages, ScanSearch, ShieldCheck } from "lucide-react";

type BrandShowcaseProps = {
  currentCountry: string;
  currentLanguage: string;
  heroBadges: string[];
  heroMetrics: Array<{
    label: string;
    value: string;
  }>;
  heroSubtitle: string;
  heroTitle: string;
  vpnActive: boolean;
};

const proofPoints = [
  {
    label: "Show the device first so the offer feels real.",
    icon: ShieldCheck,
  },
  {
    label: "Match the hardware to the buyer in seconds.",
    icon: ScanSearch,
  },
  {
    label: "Keep demos clean with live region controls.",
    icon: Languages,
  },
] as const;

export function BrandShowcase({
  currentCountry,
  currentLanguage,
  heroBadges,
  heroMetrics,
  heroSubtitle,
  heroTitle,
  vpnActive,
}: BrandShowcaseProps) {
  return (
    <div className="landing-hero-copy">
      <span className="eyebrow">Device-first preweb</span>
      <h1 className="landing-hero-title">{heroTitle}</h1>
      <p className="landing-hero-text">{heroSubtitle}</p>

      <div className="landing-hero-badge-row">
        {heroBadges.slice(0, 3).map((badge) => (
          <span className="landing-hero-badge" key={badge}>
            {badge}
          </span>
        ))}
      </div>

      <div className="landing-hero-proof-list">
        {proofPoints.map((item) => {
          const Icon = item.icon;

          return (
            <div className="landing-hero-proof-item" key={item.label}>
              <span className="landing-hero-proof-icon">
                <Icon size={16} />
              </span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="landing-hero-metrics">
        {heroMetrics.map((metric) => (
          <div className="landing-hero-metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>

      <div className="landing-hero-context">
        <span className="landing-context-pill">{currentCountry}</span>
        <span className="landing-context-pill">{currentLanguage}</span>
        <span className="landing-context-pill">
          {vpnActive ? "Protected route" : "Standard route"}
        </span>
      </div>
    </div>
  );
}
