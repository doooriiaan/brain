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
  type: "notification" | "upload" | "lead" | "payment" | "activation" | "ticket";
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

export interface PaymentRecord {
  id: string;
  company: string;
  plan: string;
  planName: string;
  amount: number;
  currency: string;
  cardBrand: "visa" | "mastercard" | "amex" | "paypal";
  paymentMethod: "visa" | "mastercard" | "amex" | "paypal";
  last4: string;
  status: "pending" | "approved" | "rejected";
  approvalRequestedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  approvalNote: string | null;
  createdAt: string;
  linkedCardCode: string | null;
  linkedCardStatus: "available" | "assigned" | "activated" | null;
  linkedCardSector: string | null;
  linkedCardSectorLabel: string | null;
  linkedDeviceKey: string | null;
  linkedCardUpdatedAt: string | null;
}

export interface SmartCardItem {
  id: string;
  code: string;
  sector: string;
  sectorLabel: string;
  plan: string;
  planName: string;
  status: "available" | "assigned" | "activated";
  ownerCompany: string | null;
  deviceKey: string | null;
  issuedAt: string;
  updatedAt: string;
}

export interface SmartCardStats {
  total: number;
  available: number;
  assigned: number;
  activated: number;
}

export interface AccountItem {
  id: string;
  company: string;
  sector: string;
  sectorLabel: string;
  plan: string;
  planName: string;
  status: "active";
  devices: number;
  smartCards: number;
  monthlyUsage: number;
  creditsRemaining: number;
  salesToday: number;
  callsHandled: number;
  tasksAutomated: number;
  newLeads: number;
  createdAt: string;
}

export interface AdminOverview extends OperationsOverview {
  payments: PaymentRecord[];
  smartCardStats: SmartCardStats;
  smartCards: SmartCardItem[];
  accounts: AccountItem[];
  adminMetrics: RuntimeMetric[];
}

export interface ClientPickerItem {
  company: string;
  sectorLabel: string;
}

export interface ClientOverview {
  account: AccountItem | null;
  clients: ClientPickerItem[];
  payments: PaymentRecord[];
  smartCards: SmartCardItem[];
  activations: ActivationItem[];
  tickets: TicketItem[];
  notifications: NotificationItem[];
  quickMetrics: RuntimeMetric[];
}

export interface PortalUser {
  id: string;
  role: "admin" | "client";
  name: string;
  email: string;
  company: string;
  sector: string | null;
  plan: string | null;
}

export interface AuthSession {
  token: string;
  user: PortalUser;
  issuedAt: string;
}

export interface DemoCredential {
  role: "admin" | "client";
  name: string;
  email: string;
  password: string;
  company: string;
}

export interface NetworkSnapshot {
  language: string;
  country: string;
  route: string;
  vpnActive: boolean;
  secureTransport: "open" | "regional" | "private";
  detectedAt: string;
}

export interface HealthSnapshot {
  status: "ok";
  service: string;
  network: NetworkSnapshot;
}
