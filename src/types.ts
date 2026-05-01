export interface HeroMetric {
  label: string;
  value: string;
}

export interface HeroCallToAction {
  label: string;
  href: string;
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  badges: string[];
  metrics: HeroMetric[];
  primaryCta: HeroCallToAction;
  secondaryCta: HeroCallToAction;
  deviceImage: string;
  plansImage: string;
}

export interface Sector {
  slug: string;
  name: string;
  title: string;
  summary: string;
  audience: string;
  statLabel: string;
  statValue: string;
  accent: string;
  deviceKey: string;
  imageUrl: string;
  capabilities: string[];
}

export interface DeviceMetric {
  label: string;
  value: string;
}

export interface Device {
  deviceKey: string;
  sectorSlug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  imageUrl: string;
  ports: string[];
  suitedFor: string[];
  metrics: DeviceMetric[];
}

export interface Plan {
  slug: string;
  name: string;
  summary: string;
  annualPrice: number;
  monthlyPrice: number;
  deviceAllowance: string;
  supportLabel: string;
  automationLabel: string;
  featured: boolean;
  features: string[];
}

export interface CloudStep {
  title: string;
  detail: string;
}

export interface CloudSystemContent {
  title: string;
  summary: string;
  highlights: string[];
  steps: CloudStep[];
}

export interface IntegrationsContent {
  protocols: string[];
  platforms: string[];
  cloudPartners: string[];
}

export interface LandingContent {
  source: "fallback" | "database";
  hero: HeroContent;
  sectors: Sector[];
  devices: Device[];
  plans: Plan[];
  cloudSystem: CloudSystemContent;
  integrations: IntegrationsContent;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  level: "info" | "success" | "warning";
  createdAt: string;
}

export interface ServiceStatus {
  key: string;
  label: string;
  status: "online" | "ready" | "setup";
  detail: string;
}

export interface UploadItem {
  id: string;
  fileName: string;
  sizeKb: number;
  uploadedAt: string;
  url: string;
}
