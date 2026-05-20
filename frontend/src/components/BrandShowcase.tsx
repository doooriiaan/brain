import { Languages, ScanSearch, ShieldCheck } from "lucide-react";

type BrandShowcaseProps = {
  currentCountry: string;
  currentLanguage: string;
  heroBadges: string[];
  heroEyebrow: string;
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
    label: "Device-first offer",
    icon: ShieldCheck,
  },
  {
    label: "Sector-ready setup",
    icon: ScanSearch,
  },
  {
    label: "Cloud control included",
    icon: Languages,
  },
] as const;

export function BrandShowcase({
  currentCountry,
  currentLanguage,
  heroBadges,
  heroEyebrow,
  heroMetrics,
  heroSubtitle,
  heroTitle,
  vpnActive,
}: BrandShowcaseProps) {
  return (
    <div className="landing-hero-copy">
      <span className="eyebrow">{heroEyebrow}</span>
      <h1 className="landing-hero-title">{heroTitle}</h1>
      <p className="landing-hero-text">{heroSubtitle}</p>

      <div className="landing-hero-badge-row">
        {heroBadges.slice(0, 4).map((badge) => (
          <span className="landing-hero-badge" key={badge}>
            {badge}
          </span>
        ))}
      </div>

      <div className="landing-hero-metrics">
        {heroMetrics.map((metric) => (
          <div className="landing-hero-metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
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

      <div className="landing-hero-context-note">
        <span>{currentCountry}</span>
        <span>{currentLanguage}</span>
        <span>{vpnActive ? "Protected route" : "Standard route"}</span>
      </div>
    </div>
  );
}
