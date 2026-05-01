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

export interface LeadItem {
  id: string;
  name: string;
  email: string;
  company: string;
  sector: string;
  sectorLabel: string;
  message: string;
  status: "new";
  createdAt: string;
}

export interface ActivationItem {
  id: string;
  company: string;
  sector: string;
  sectorLabel: string;
  deviceKey: string;
  deviceName: string;
  plan: string;
  planName: string;
  site: string;
  status: "queued" | "provisioning" | "live";
  createdAt: string;
}

export interface TicketItem {
  id: string;
  company: string;
  contactEmail: string;
  priority: "critical" | "priority" | "standard";
  category: "automation" | "integration" | "support";
  summary: string;
  status: "open" | "investigating" | "resolved";
  createdAt: string;
}

export interface RuntimeMetric {
  key: string;
  label: string;
  value: string;
  detail: string;
}

export interface RuntimeEvent {
  id: string;
  type: "notification" | "upload" | "lead" | "activation" | "ticket";
  title: string;
  detail: string;
  status: "info" | "success" | "warning";
  createdAt: string;
}

export interface OperationsOverview {
  services: ServiceStatus[];
  notifications: NotificationItem[];
  uploads: UploadItem[];
  leads: LeadItem[];
  activations: ActivationItem[];
  tickets: TicketItem[];
  metrics: RuntimeMetric[];
  timeline: RuntimeEvent[];
}
