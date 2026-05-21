type BrandShowcaseProps = {
  heroBadges: string[];
  heroEyebrow: string;
  heroMetrics: Array<{
    label: string;
    value: string;
  }>;
  heroSubtitle: string;
  heroTitle: string;
};

export function BrandShowcase({
  heroBadges,
  heroEyebrow,
  heroMetrics,
  heroSubtitle,
  heroTitle,
}: BrandShowcaseProps) {
  return (
    <div className="landing-hero-copy">
      <span className="eyebrow">{heroEyebrow}</span>
      <h1 className="landing-hero-title">{heroTitle}</h1>
      <p className="landing-hero-text">{heroSubtitle}</p>

      <div className="landing-hero-badge-row">
        {heroBadges.slice(0, 2).map((badge) => (
          <span className="landing-hero-badge" key={badge}>
            {badge}
          </span>
        ))}
      </div>

      <div className="landing-hero-metrics">
        {heroMetrics.slice(0, 2).map((metric) => (
          <div className="landing-hero-metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
