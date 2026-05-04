import { startTransition, useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CheckCheck,
  CreditCard,
  Factory,
  HeartPulse,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  Upload,
  UserRound,
  WalletCards,
  Workflow,
} from "lucide-react";
import type {
  ActivationItem,
  AdminOverview,
  AuthSession,
  ClientOverview,
  DemoCredential,
  HealthSnapshot,
  LandingContent,
  OperationsOverview,
  SmartCardItem,
  TicketItem,
} from "./types";
import {
  localizeAdminOverview,
  localizeClientOverview,
  localizeLandingContent,
  localizeOperationsOverview,
  translateAppText,
} from "./i18n/translations";
import { EmptyCard } from "./components/EmptyCard";
import { FeedItem } from "./components/FeedItem";
import { MetricCard } from "./components/MetricCard";
import { PeekBuddy } from "./components/PeekBuddy";
import { SectionHeading } from "./components/SectionHeading";
import { SectorSidebar } from "./components/SectorSidebar";
import { OperationsPulse } from "./components/dashboard/OperationsPulse";
import { PortalSidebar } from "./components/dashboard/PortalSidebar";
import { ClientDashboardOverview } from "./components/dashboard/ClientDashboardOverview";
import { getRequestErrorMessage, syncRuntimeHeaders } from "./services/api";

const sectionMotion: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardToneClasses = {
  info: "tone-info",
  success: "tone-success",
  warning: "tone-warning",
} as const;

const serviceToneClasses = {
  online: "tone-success",
  ready: "tone-info",
  setup: "tone-warning",
} as const;

const activationToneClasses = {
  queued: "tone-warning",
  provisioning: "tone-info",
  live: "tone-success",
} as const;

const ticketToneClasses = {
  open: "tone-warning",
  investigating: "tone-info",
  resolved: "tone-success",
} as const;

const smartCardToneClasses = {
  available: "tone-info",
  assigned: "tone-warning",
  activated: "tone-success",
} as const;

const sectorIcons = {
  commercial: Store,
  business: BriefcaseBusiness,
  healthcare: HeartPulse,
  industry: Factory,
} as const;

const paymentBrandLabels = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
} as const;

const acceptedTestCards = [
  { label: "Visa", cardNumber: "4242424242424242" },
  { label: "Mastercard", cardNumber: "5555555555554444" },
  { label: "American Express", cardNumber: "378282246310005" },
];

const adminTabs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "cards", label: "SC Cards", icon: WalletCards },
  { key: "ops", label: "Runtime Ops", icon: Workflow },
] as const;

const clientTabs = [
  { key: "overview", label: "Client Home", icon: LayoutDashboard },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "support", label: "Support + Deploy", icon: MessageSquareText },
] as const;

const siteTabs = [
  { key: "commercial", label: "Commercial" },
  { key: "business", label: "Business" },
  { key: "healthcare", label: "Healthcare" },
  { key: "industry", label: "Industry AI" },
  { key: "vpn", label: "VPN" },
  { key: "system", label: "Access" },
  { key: "client", label: "Client Page" },
  { key: "admin", label: "Admin Page" },
] as const;

const publicNavTabKeys = new Set([
  "commercial",
  "business",
  "healthcare",
  "industry",
  "vpn",
  "system",
]);
const sectorQuickTabKeys = new Set([
  "commercial",
  "business",
  "healthcare",
  "industry",
]);

type AuthRole = "admin" | "client";
type AuthMode = "login" | "register";
type SiteView = (typeof siteTabs)[number]["key"];
type AdminTabKey = (typeof adminTabs)[number]["key"];
type ClientTabKey = (typeof clientTabs)[number]["key"];

type LeadFormState = {
  name: string;
  email: string;
  company: string;
  sector: string;
  message: string;
};

type AuthFormState = {
  role: AuthRole;
  name: string;
  email: string;
  password: string;
  company: string;
  sector: string;
  plan: string;
};

type PaymentFormState = {
  company: string;
  plan: string;
  cardholder: string;
  cardNumber: string;
  expiry: string;
  amount: number;
};

type ActivationFormState = {
  company: string;
  sector: string;
  deviceKey: string;
  plan: string;
  site: string;
};

type TicketFormState = {
  company: string;
  contactEmail: string;
  priority: "critical" | "priority" | "standard";
  category: "automation" | "integration" | "support";
  summary: string;
};

type BroadcastFormState = {
  title: string;
  body: string;
  level: "info" | "success" | "warning";
};

type AssignCardsFormState = {
  company: string;
  sector: string;
  plan: string;
  deviceKey: string;
  quantity: number;
};

type DeviceRuntimeState = {
  uptimeMinutes: number;
  latencyMs: number;
  throughput: number;
  health: number;
};

const getRoleHomeView = (role: "admin" | "client"): SiteView =>
  role === "admin" ? "admin" : "client";

const emptyOperations: OperationsOverview = {
  services: [],
  notifications: [],
  uploads: [],
  leads: [],
  activations: [],
  tickets: [],
  metrics: [],
  timeline: [],
};

const emptyAdminOverview: AdminOverview = {
  ...emptyOperations,
  payments: [],
  smartCardStats: {
    total: 0,
    available: 0,
    assigned: 0,
    activated: 0,
  },
  smartCards: [],
  accounts: [],
  adminMetrics: [],
};

const emptyClientOverview: ClientOverview = {
  account: null,
  clients: [],
  payments: [],
  smartCards: [],
  activations: [],
  tickets: [],
  notifications: [],
  quickMetrics: [],
};

const initialLeadForm: LeadFormState = {
  name: "",
  email: "",
  company: "",
  sector: "commercial",
  message: "",
};

const initialAuthForm: AuthFormState = {
  role: "client",
  name: "",
  email: "",
  password: "",
  company: "",
  sector: "business",
  plan: "business",
};

const initialPaymentForm: PaymentFormState = {
  company: "",
  plan: "business",
  cardholder: "",
  cardNumber: "",
  expiry: "12/28",
  amount: 990,
};

const initialActivationForm: ActivationFormState = {
  company: "",
  sector: "business",
  deviceKey: "business-hub",
  plan: "business",
  site: "",
};

const initialTicketForm: TicketFormState = {
  company: "",
  contactEmail: "",
  priority: "priority",
  category: "support",
  summary: "",
};

const initialBroadcastForm: BroadcastFormState = {
  title: "",
  body: "",
  level: "info",
};

const initialAssignCardsForm: AssignCardsFormState = {
  company: "",
  sector: "business",
  plan: "business",
  deviceKey: "business-hub",
  quantity: 5,
};

const finalLogoAsset = "/brand/brain-logo-final.jpeg";
const planShowcaseAsset = "/brand/brain-plans-showcase.svg";
const smartCardsPerPlan = 500;
const translatedUiLanguages = new Set(["sq", "en", "de"]);

const languageOptions = [
  { code: "sq", locale: "sq-XK", label: "Shqip" },
  { code: "en", locale: "en-US", label: "English" },
  { code: "de", locale: "de-DE", label: "Deutsch" },
  { code: "fr", locale: "fr-FR", label: "Francais" },
  { code: "it", locale: "it-IT", label: "Italiano" },
  { code: "es", locale: "es-ES", label: "Espanol" },
  { code: "pt", locale: "pt-PT", label: "Portugues" },
  { code: "tr", locale: "tr-TR", label: "Turkce" },
  { code: "nl", locale: "nl-NL", label: "Nederlands" },
  { code: "sv", locale: "sv-SE", label: "Svenska" },
  { code: "no", locale: "nb-NO", label: "Norsk" },
  { code: "da", locale: "da-DK", label: "Dansk" },
  { code: "fi", locale: "fi-FI", label: "Suomi" },
  { code: "pl", locale: "pl-PL", label: "Polski" },
  { code: "cs", locale: "cs-CZ", label: "Cestina" },
  { code: "sk", locale: "sk-SK", label: "Slovencina" },
  { code: "hu", locale: "hu-HU", label: "Magyar" },
  { code: "ro", locale: "ro-RO", label: "Romana" },
  { code: "bg", locale: "bg-BG", label: "Bulgarski" },
  { code: "sr", locale: "sr-RS", label: "Srpski" },
  { code: "hr", locale: "hr-HR", label: "Hrvatski" },
  { code: "sl", locale: "sl-SI", label: "Slovenscina" },
  { code: "el", locale: "el-GR", label: "Ellinika" },
  { code: "uk", locale: "uk-UA", label: "Ukrainska" },
  { code: "ru", locale: "ru-RU", label: "Russkiy" },
  { code: "ar", locale: "ar-SA", label: "Arabic" },
  { code: "he", locale: "he-IL", label: "Hebrew" },
  { code: "fa", locale: "fa-IR", label: "Farsi" },
  { code: "hi", locale: "hi-IN", label: "Hindi" },
  { code: "bn", locale: "bn-BD", label: "Bangla" },
  { code: "ur", locale: "ur-PK", label: "Urdu" },
  { code: "zh", locale: "zh-CN", label: "Chinese" },
  { code: "ja", locale: "ja-JP", label: "Japanese" },
  { code: "ko", locale: "ko-KR", label: "Korean" },
  { code: "th", locale: "th-TH", label: "Thai" },
  { code: "vi", locale: "vi-VN", label: "Vietnamese" },
  { code: "id", locale: "id-ID", label: "Bahasa Indonesia" },
  { code: "ms", locale: "ms-MY", label: "Bahasa Melayu" },
  { code: "sw", locale: "sw-KE", label: "Swahili" },
  { code: "af", locale: "af-ZA", label: "Afrikaans" },
];

const countryOptions = [
  { code: "XK", label: "Kosovo", currency: "EUR" },
  { code: "AL", label: "Albania", currency: "ALL" },
  { code: "DE", label: "Germany", currency: "EUR" },
  { code: "CH", label: "Switzerland", currency: "CHF" },
  { code: "AT", label: "Austria", currency: "EUR" },
  { code: "IT", label: "Italy", currency: "EUR" },
  { code: "FR", label: "France", currency: "EUR" },
  { code: "ES", label: "Spain", currency: "EUR" },
  { code: "GB", label: "United Kingdom", currency: "GBP" },
  { code: "US", label: "United States", currency: "USD" },
  { code: "CA", label: "Canada", currency: "CAD" },
  { code: "AE", label: "United Arab Emirates", currency: "AED" },
  { code: "TR", label: "Turkey", currency: "TRY" },
  { code: "SA", label: "Saudi Arabia", currency: "SAR" },
  { code: "IN", label: "India", currency: "INR" },
  { code: "JP", label: "Japan", currency: "JPY" },
  { code: "KR", label: "South Korea", currency: "KRW" },
  { code: "CN", label: "China", currency: "CNY" },
  { code: "AU", label: "Australia", currency: "AUD" },
  { code: "BR", label: "Brazil", currency: "BRL" },
];

const dashboardTranslations = {
  sq: {
    dashboard: "Dashboard",
    search: "Kerko ne dashboard",
    vpn: "VPN",
    language: "Gjuha",
    country: "Shteti",
    refresh: "Rifresko",
    logout: "Dil",
    adminCenter: "Qendra Admin",
    clientWorkspace: "Hapesira Klient",
    inventory: "inventar",
    cardsPerPlan: "SC per plan",
    autoTranslate: "Auto-translate",
    tunnelPrivate: "Enkriptuar",
    tunnelRegional: "Rajonal",
    tunnelOpen: "Live",
  },
  en: {
    dashboard: "Dashboard",
    search: "Search dashboard",
    vpn: "VPN",
    language: "Language",
    country: "Country",
    refresh: "Refresh",
    logout: "Logout",
    adminCenter: "Admin command center",
    clientWorkspace: "Client workspace",
    inventory: "inventory",
    cardsPerPlan: "SC per plan",
    autoTranslate: "Auto translate",
    tunnelPrivate: "Encrypted",
    tunnelRegional: "Regional",
    tunnelOpen: "Live",
  },
  de: {
    dashboard: "Dashboard",
    search: "Dashboard durchsuchen",
    vpn: "VPN",
    language: "Sprache",
    country: "Land",
    refresh: "Aktualisieren",
    logout: "Abmelden",
    adminCenter: "Admin Zentrale",
    clientWorkspace: "Client Arbeitsbereich",
    inventory: "Inventar",
    cardsPerPlan: "SC pro Plan",
    autoTranslate: "Auto-Ubersetzung",
    tunnelPrivate: "Verschlusselt",
    tunnelRegional: "Regional",
    tunnelOpen: "Live",
  },
} as const;

const authStorageKey = "brain-auth-session";
const localeStorageKey = "brain-ui-locale";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number) {
  return `EUR ${value.toLocaleString("en-GB")}`;
}

function LoadingScreen() {
  return (
    <div className="page-center">
      <div className="glass-card max-w-md text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5"
        >
          <LoaderCircle className="h-7 w-7 text-[var(--accent)]" />
        </motion.div>
        <p className="section-kicker justify-center">Booting system</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Preparing sector-based brAIn experience
        </h1>
        <p className="mt-3 text-sm text-white/66">
          Loading commercial, business, healthcare, industry, payments, smart
          cards, notifications, and portal runtime.
        </p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="page-center">
      <div className="glass-card max-w-xl">
        <p className="section-kicker">Connection issue</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Frontend could not reach the brAIn API.
        </h1>
        <p className="mt-3 text-white/70">{message}</p>
        <button
          className="accent-button mt-6"
          onClick={() => window.location.reload()}
          type="button"
        >
          Retry now
        </button>
      </div>
    </div>
  );
}

function buildNetworkModeLabel(mode: "live" | "country" | "private") {
  if (mode === "private") {
    return "vpn-private";
  }

  if (mode === "country") {
    return "country-route";
  }

  return "live";
}

function maskCardCode(code: string) {
  if (code.length <= 8) {
    return code;
  }

  return `${code.slice(0, 7)}••${code.slice(-5)}`;
}

function App() {
  const [content, setContent] = useState<LandingContent | null>(null);
  const [operations, setOperations] = useState<OperationsOverview>(emptyOperations);
  const [adminOverview, setAdminOverview] =
    useState<AdminOverview>(emptyAdminOverview);
  const [clientOverview, setClientOverview] =
    useState<ClientOverview>(emptyClientOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteView, setSiteView] = useState<SiteView>("commercial");
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [selectedClientCompany, setSelectedClientCompany] = useState("");
  const [adminTab, setAdminTab] = useState<AdminTabKey>("overview");
  const [clientTab, setClientTab] = useState<ClientTabKey>("overview");
  const [leadForm, setLeadForm] = useState<LeadFormState>(initialLeadForm);
  const [authForm, setAuthForm] = useState<AuthFormState>(initialAuthForm);
  const [paymentForm, setPaymentForm] =
    useState<PaymentFormState>(initialPaymentForm);
  const [activationForm, setActivationForm] =
    useState<ActivationFormState>(initialActivationForm);
  const [ticketForm, setTicketForm] = useState<TicketFormState>(initialTicketForm);
  const [broadcastForm, setBroadcastForm] =
    useState<BroadcastFormState>(initialBroadcastForm);
  const [assignCardsForm, setAssignCardsForm] =
    useState<AssignCardsFormState>(initialAssignCardsForm);
  const [leadMessage, setLeadMessage] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [activationMessage, setActivationMessage] = useState<string | null>(null);
  const [ticketMessage, setTicketMessage] = useState<string | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);
  const [assignCardsMessage, setAssignCardsMessage] = useState<string | null>(null);
  const [adminCardMessage, setAdminCardMessage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [clientCardMessage, setClientCardMessage] = useState<string | null>(null);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [activationSubmitting, setActivationSubmitting] = useState(false);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);
  const [assigningCards, setAssigningCards] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validatingCardCode, setValidatingCardCode] = useState<string | null>(null);
  const [adminCardQuery, setAdminCardQuery] = useState("");
  const [adminCardFilter, setAdminCardFilter] = useState<
    SmartCardItem["status"] | "all"
  >("all");
  const [clientCardCode, setClientCardCode] = useState("");
  const [validatedClientCard, setValidatedClientCard] =
    useState<SmartCardItem | null>(null);
  const [clientCardBackVisible, setClientCardBackVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("sq");
  const [selectedCountry, setSelectedCountry] = useState("XK");
  const [networkMode, setNetworkMode] = useState<"live" | "country" | "private">(
    "private",
  );
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [selectedDeviceKey, setSelectedDeviceKey] = useState("business-hub");
  const [demoCredentials, setDemoCredentials] = useState<DemoCredential[]>([]);
  const [healthSnapshot, setHealthSnapshot] = useState<HealthSnapshot | null>(null);
  const [deviceRuntime, setDeviceRuntime] = useState<DeviceRuntimeState>({
    uptimeMinutes: 960,
    latencyMs: 18,
    throughput: 98,
    health: 99,
  });

  const localizedContent = useMemo(
    () => (content ? localizeLandingContent(content, selectedLanguage) : null),
    [content, selectedLanguage],
  );
  const localizedOperations = useMemo(
    () => localizeOperationsOverview(operations, selectedLanguage),
    [operations, selectedLanguage],
  );
  const localizedAdminOverview = useMemo(
    () => localizeAdminOverview(adminOverview, selectedLanguage),
    [adminOverview, selectedLanguage],
  );
  const localizedClientOverview = useMemo(
    () => localizeClientOverview(clientOverview, selectedLanguage),
    [clientOverview, selectedLanguage],
  );
  const sectors = localizedContent?.sectors ?? [];
  const devices = localizedContent?.devices ?? [];
  const plans = localizedContent?.plans ?? [];
  const activeLanguage =
    languageOptions.find((language) => language.code === selectedLanguage) ??
    languageOptions[0];
  const activeCountry =
    countryOptions.find((country) => country.code === selectedCountry) ??
    countryOptions[0];
  const currentLocale = activeLanguage.locale;
  const currentCurrency = activeCountry.currency;
  const languageCode = selectedLanguage as keyof typeof dashboardTranslations;
  const uiText = dashboardTranslations[languageCode] ?? dashboardTranslations.en;
  const t = (value: string) => translateAppText(value, selectedLanguage);
  const networkLabel = buildNetworkModeLabel(networkMode);
  const translatedUiReady = translatedUiLanguages.has(selectedLanguage);
  const totalSmartCardInventory = plans.length * smartCardsPerPlan;
  const heroMetrics = localizedContent?.hero.metrics.map((metric, index) =>
    index === 2
      ? {
          ...metric,
          value: `${totalSmartCardInventory.toLocaleString(currentLocale)} ${uiText.inventory}`,
        }
      : metric,
  ) ?? [];
  const sectorSlug =
    siteView === "commercial"
      ? "commercial"
      : siteView === "business" || siteView === "healthcare" || siteView === "industry"
        ? siteView
        : "business";
  const activeSector =
    sectors.find((sector) => sector.slug === sectorSlug) ?? sectors[0] ?? null;
  const sectorDevices = devices.filter((device) => device.sectorSlug === sectorSlug);
  const activeDevice =
    sectorDevices.find((device) => device.deviceKey === selectedDeviceKey) ??
    sectorDevices[0] ??
    devices.find((device) => device.deviceKey === activeSector?.deviceKey) ??
    devices[0] ??
    null;
  const adminVisibleCards = adminOverview.smartCards.filter((card) => {
    const matchesFilter =
      adminCardFilter === "all" ? true : card.status === adminCardFilter;
    const searchValue = adminCardQuery.trim().toLowerCase();
    const matchesQuery =
      searchValue.length === 0
        ? true
        : [
            card.code,
            card.planName,
            card.sectorLabel,
            card.ownerCompany ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(searchValue);

    return matchesFilter && matchesQuery;
  });
  const normalizedDashboardSearch = dashboardSearch.trim().toLowerCase();
  const filteredAdminAccounts = useMemo(
    () =>
      adminOverview.accounts.filter((account) =>
        normalizedDashboardSearch.length === 0
          ? true
          : [
              account.company,
              account.sectorLabel,
              account.planName,
              String(account.smartCards),
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedDashboardSearch),
      ),
    [adminOverview.accounts, normalizedDashboardSearch],
  );
  const filteredAdminPayments = useMemo(
    () =>
      adminOverview.payments.filter((payment) =>
        normalizedDashboardSearch.length === 0
          ? true
          : [payment.company, payment.planName, payment.last4]
              .join(" ")
              .toLowerCase()
              .includes(normalizedDashboardSearch),
      ),
    [adminOverview.payments, normalizedDashboardSearch],
  );
  const filteredClientCards = useMemo(
    () =>
      clientOverview.smartCards.filter((card) =>
        normalizedDashboardSearch.length === 0
          ? true
          : [card.code, card.planName, card.sectorLabel, card.status]
              .join(" ")
              .toLowerCase()
              .includes(normalizedDashboardSearch),
      ),
    [clientOverview.smartCards, normalizedDashboardSearch],
  );
  const filteredClientPayments = useMemo(
    () =>
      clientOverview.payments.filter((payment) =>
        normalizedDashboardSearch.length === 0
          ? true
          : [payment.planName, payment.last4, payment.cardBrand]
              .join(" ")
              .toLowerCase()
              .includes(normalizedDashboardSearch),
      ),
    [clientOverview.payments, normalizedDashboardSearch],
  );
  const activeClientCard = validatedClientCard ?? filteredClientCards[0] ?? null;
  const adminPlanCardStats = useMemo(
    () =>
      plans.map((plan) => {
        const planCards = adminOverview.smartCards.filter(
          (card) => card.plan === plan.slug,
        );

        return {
          slug: plan.slug,
          name: plan.name,
          total: planCards.length,
          available: planCards.filter((card) => card.status === "available").length,
          activated: planCards.filter((card) => card.status === "activated").length,
        };
      }),
    [adminOverview.smartCards, plans],
  );

  const resolvePlanPrice = (planSlug: string, currentBilling = billing) => {
    const match = plans.find((item) => item.slug === planSlug);

    if (!match) {
      return 0;
    }

    return currentBilling === "annual" ? match.annualPrice : match.monthlyPrice;
  };

  const getDeviceKeyForSector = (nextSector: string) => {
    const sector = sectors.find((item) => item.slug === nextSector);
    return sector?.deviceKey ?? "business-hub";
  };

  const formatMoney = (value: number) => {
    try {
      return new Intl.NumberFormat(currentLocale, {
        style: "currency",
        currency: currentCurrency,
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return formatCurrency(value);
    }
  };

  const formatLocalDate = (value: string) => {
    try {
      return new Date(value).toLocaleString(currentLocale, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return formatDate(value);
    }
  };

  const syncClientForms = ({
    company,
    sector,
    plan,
    email,
  }: {
    company: string;
    sector: string;
    plan: string;
    email: string;
  }) => {
    setSelectedClientCompany(company);
    setPaymentForm((current) => ({
      ...current,
      company,
      plan,
      cardholder: current.cardholder || authSession?.user.name || "",
      amount: resolvePlanPrice(plan) || current.amount,
    }));
    setActivationForm((current) => ({
      ...current,
      company,
      sector,
      plan,
      deviceKey: getDeviceKeyForSector(sector),
    }));
    setTicketForm((current) => ({
      ...current,
      company,
      contactEmail: email || current.contactEmail,
    }));
  };

  const openSiteView = (view: SiteView) => {
    if ((view === "admin" || view === "client") && !authSession) {
      setAuthMode("login");
      setAuthForm((current) => ({
        ...current,
        role: view === "admin" ? "admin" : "client",
      }));
      setSiteView("system");
      return;
    }

    setSiteView(view);

    if (
      view === "commercial" ||
      view === "business" ||
      view === "healthcare" ||
      view === "industry"
    ) {
      setLeadForm((current) => ({
        ...current,
        sector: view,
      }));
    }
  };

  const refreshOperations = async () => {
    const response = await axios.get<OperationsOverview>("/api/operations/overview");

    startTransition(() => {
      setOperations(response.data);
    });
  };

  const refreshAdminOverview = async () => {
    const response = await axios.get<AdminOverview>("/api/admin/overview");

    startTransition(() => {
      setAdminOverview(response.data);
    });
  };

  const refreshClientOverview = async (company?: string) => {
    const targetCompany =
      company || selectedClientCompany || authSession?.user.company || "";

    const response = await axios.get<ClientOverview>("/api/client/overview", {
      params: targetCompany ? { company: targetCompany } : undefined,
    });

    startTransition(() => {
      setClientOverview(response.data);
    });

    if (response.data.account) {
      syncClientForms({
        company: response.data.account.company,
        sector: response.data.account.sector,
        plan: response.data.account.plan,
        email: authSession?.user.email ?? ticketForm.contactEmail,
      });
    }
  };

  const refreshPortal = async (session = authSession) => {
    if (!session) {
      return;
    }

    if (session.user.role === "admin") {
      await refreshAdminOverview();
      return;
    }

    await refreshClientOverview(session.user.company);
  };

  const refreshHealth = async () => {
    const response = await axios.get<HealthSnapshot>("/api/health");

    startTransition(() => {
      setHealthSnapshot(response.data);
    });
  };

  useEffect(() => {
    const savedLocaleContext = window.localStorage.getItem(localeStorageKey);
    if (savedLocaleContext) {
      try {
        const parsed = JSON.parse(savedLocaleContext) as {
          language?: string;
          country?: string;
          network?: "live" | "country" | "private";
        };

        if (parsed.language) {
          setSelectedLanguage(parsed.language);
        }
        if (parsed.country) {
          setSelectedCountry(parsed.country);
        }
        if (parsed.network) {
          setNetworkMode(parsed.network);
        }
      } catch {
        window.localStorage.removeItem(localeStorageKey);
      }
    }

    const savedSession = window.localStorage.getItem(authStorageKey);

    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession) as AuthSession;
        setAuthSession(parsed);
        setSiteView(getRoleHomeView(parsed.user.role));
        setSelectedClientCompany(parsed.user.company);
        setAuthForm((current) => ({
          ...current,
          role: parsed.user.role,
          email: parsed.user.email,
          company: parsed.user.company,
          sector: parsed.user.sector ?? current.sector,
          plan: parsed.user.plan ?? current.plan,
          password: "",
        }));
      } catch {
        window.localStorage.removeItem(authStorageKey);
      }
    }

    const bootstrap = async () => {
      try {
        const [contentResponse, operationsResponse, demoResponse, healthResponse] =
          await Promise.all([
            axios.get<LandingContent>("/api/content"),
            axios.get<OperationsOverview>("/api/operations/overview"),
            axios.get<{ credentials: DemoCredential[] }>("/api/auth/demo"),
            axios.get<HealthSnapshot>("/api/health"),
          ]);

        startTransition(() => {
          setContent(contentResponse.data);
          setOperations(operationsResponse.data);
          setDemoCredentials(demoResponse.data.credentials);
          setHealthSnapshot(healthResponse.data);
        });
      } catch (requestError) {
        setError(
          getRequestErrorMessage(
            requestError,
            "Unable to load frontend bootstrap data.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);

  useEffect(() => {
    if (authMode !== "register" || authForm.role === "client") {
      return;
    }

    setAuthForm((current) => ({
      ...current,
      role: "client",
    }));
  }, [authForm.role, authMode]);

  useEffect(() => {
    if (sectorDevices.length === 0) {
      return;
    }

    if (!sectorDevices.some((device) => device.deviceKey === selectedDeviceKey)) {
      setSelectedDeviceKey(sectorDevices[0].deviceKey);
    }
  }, [sectorDevices, selectedDeviceKey]);

  useEffect(() => {
    syncRuntimeHeaders({
      language: selectedLanguage,
      country: selectedCountry,
      networkLabel,
      networkMode,
    });

    window.localStorage.setItem(
      localeStorageKey,
      JSON.stringify({
        language: selectedLanguage,
        country: selectedCountry,
        network: networkMode,
      }),
    );

    void refreshHealth().catch(() => {
      setHealthSnapshot(null);
    });
  }, [networkLabel, networkMode, selectedCountry, selectedLanguage]);

  useEffect(() => {
    if (!authSession) {
      return;
    }

    void refreshPortal(authSession);
  }, [authSession, selectedClientCompany]);

  useEffect(() => {
    if (!authSession) {
      return;
    }

    const roleHome = getRoleHomeView(authSession.user.role);
    if (siteView !== roleHome) {
      setSiteView(roleHome);
    }
  }, [authSession, siteView]);

  useEffect(() => {
    if (clientOverview.smartCards.length === 0) {
      setValidatedClientCard(null);
      setClientCardCode("");
      setClientCardBackVisible(false);
      return;
    }

    const nextCard =
      validatedClientCard &&
      clientOverview.smartCards.find((card) => card.code === validatedClientCard.code);

    const activeCard = nextCard ?? clientOverview.smartCards[0];
    setValidatedClientCard(activeCard);
    setClientCardCode((currentCode) => currentCode || activeCard.code);
  }, [clientOverview.smartCards, validatedClientCard]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshOperations();

      if (authSession) {
        void refreshPortal(authSession);
      }
    }, 12000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [authSession, selectedClientCompany]);

  useEffect(() => {
    if (siteView === "admin") {
      setAuthMode("login");
      setAdminTab("overview");
      setAuthForm((current) => ({ ...current, role: "admin" }));
    }

    if (siteView === "client") {
      setAuthMode("login");
      setClientTab("overview");
      setAuthForm((current) => ({ ...current, role: "client" }));
    }
  }, [siteView]);

  useEffect(() => {
    if (
      siteView !== "business" &&
      siteView !== "healthcare" &&
      siteView !== "industry"
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setDeviceRuntime((current) => ({
        uptimeMinutes: current.uptimeMinutes + 1,
        latencyMs: Math.max(7, Math.min(72, current.latencyMs + (Math.random() > 0.5 ? 1 : -1))),
        throughput: Math.max(
          72,
          Math.min(100, current.throughput + (Math.random() > 0.5 ? 1 : -1)),
        ),
        health: Math.max(85, Math.min(100, current.health + (Math.random() > 0.6 ? 1 : -1))),
      }));
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [siteView]);

  const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLeadSubmitting(true);
    setLeadMessage(null);

    try {
      await axios.post("/api/leads", leadForm);
      setLeadForm({
        ...initialLeadForm,
        sector: leadForm.sector,
      });
      setLeadMessage("Demo request captured and added to the live pipeline.");
      await refreshOperations();
      if (authSession?.user.role === "admin") {
        await refreshAdminOverview();
      }
    } catch (requestError) {
      setLeadMessage(
        getRequestErrorMessage(requestError, "Unable to send demo request."),
      );
    } finally {
      setLeadSubmitting(false);
    }
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthSubmitting(true);
    setAuthMessage(null);

    try {
      const endpoint =
        authMode === "login" ? "/api/auth/login" : "/api/auth/register";

      const payload =
        authMode === "login"
          ? {
              role: authForm.role,
              email: authForm.email,
              password: authForm.password,
            }
          : authForm;

      const response = await axios.post<{ session: AuthSession }>(
        endpoint,
        payload,
      );

      const nextSession = response.data.session;
      window.localStorage.setItem(authStorageKey, JSON.stringify(nextSession));
      setAuthSession(nextSession);
      setAuthMessage(
        authMode === "login"
          ? "Portal login successful."
          : "Portal account created successfully.",
      );
      setAdminTab("overview");
      setClientTab("overview");
      setSiteView(getRoleHomeView(nextSession.user.role));

      if (nextSession.user.role === "client") {
        syncClientForms({
          company: nextSession.user.company,
          sector: nextSession.user.sector ?? "business",
          plan: nextSession.user.plan ?? "business",
          email: nextSession.user.email,
        });
      }

      setAuthForm((current) => ({
        ...current,
        password: "",
      }));

      await refreshOperations();
      await refreshPortal(nextSession);
    } catch (requestError) {
      setAuthMessage(
        getRequestErrorMessage(requestError, "Unable to complete auth request."),
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem(authStorageKey);
    setAuthSession(null);
    setSelectedClientCompany("");
    setAdminOverview(emptyAdminOverview);
    setClientOverview(emptyClientOverview);
    setAuthForm((current) => ({
      ...current,
      password: "",
    }));
    setAuthMessage("Session closed.");
    setSiteView("system");
  };

  const handlePaymentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPaymentSubmitting(true);
    setPaymentMessage(null);

    try {
      const response = await axios.post("/api/payments", paymentForm);
      const linkedCardCode = response.data?.payment?.linkedCardCode as
        | string
        | undefined;
      setPaymentMessage(
        linkedCardCode
          ? `Payment captured live. ${linkedCardCode} is now linked to this plan.`
          : "Payment captured live and visible in the portal.",
      );
      setPaymentForm((current) => ({
        ...current,
        cardNumber: "",
        expiry: "12/28",
      }));
      await refreshOperations();
      await refreshPortal();
    } catch (requestError) {
      setPaymentMessage(
        getRequestErrorMessage(requestError, "Unable to process payment."),
      );
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleActivationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActivationSubmitting(true);
    setActivationMessage(null);

    try {
      await axios.post("/api/activations", activationForm);
      setActivationMessage("Activation request queued successfully.");
      setActivationForm((current) => ({
        ...current,
        site: "",
      }));
      await refreshOperations();
      await refreshPortal();
    } catch (requestError) {
      setActivationMessage(
        getRequestErrorMessage(requestError, "Unable to queue activation."),
      );
    } finally {
      setActivationSubmitting(false);
    }
  };

  const handleTicketSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTicketSubmitting(true);
    setTicketMessage(null);

    try {
      await axios.post("/api/tickets", ticketForm);
      setTicketMessage("Support ticket opened and added to live runtime.");
      setTicketForm((current) => ({
        ...current,
        summary: "",
      }));
      await refreshOperations();
      await refreshPortal();
    } catch (requestError) {
      setTicketMessage(
        getRequestErrorMessage(requestError, "Unable to open support ticket."),
      );
    } finally {
      setTicketSubmitting(false);
    }
  };

  const handleBroadcastSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBroadcastSubmitting(true);
    setBroadcastMessage(null);

    try {
      await axios.post("/api/admin/notifications", broadcastForm);
      setBroadcastForm(initialBroadcastForm);
      setBroadcastMessage("Admin notification broadcasted.");
      await refreshOperations();
      await refreshAdminOverview();
    } catch (requestError) {
      setBroadcastMessage(
        getRequestErrorMessage(
          requestError,
          "Unable to broadcast notification.",
        ),
      );
    } finally {
      setBroadcastSubmitting(false);
    }
  };

  const handleAssignCardsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAssigningCards(true);
    setAssignCardsMessage(null);

    try {
      await axios.post("/api/admin/cards/assign", assignCardsForm);
      setAssignCardsMessage("SC card allocation completed.");
      await refreshOperations();
      await refreshAdminOverview();
    } catch (requestError) {
      setAssignCardsMessage(
        getRequestErrorMessage(requestError, "Unable to assign smart cards."),
      );
    } finally {
      setAssigningCards(false);
    }
  };

  const handleAdminCardActivate = async (card: SmartCardItem) => {
    if (card.status === "activated") {
      return;
    }

    setValidatingCardCode(card.code);
    setAdminCardMessage(null);

    try {
      await axios.post("/api/cards/validate", {
        code: card.code,
        company: card.ownerCompany ?? undefined,
      });
      setAdminCardMessage(`${card.code} activated successfully.`);
      await refreshOperations();
      await refreshAdminOverview();
    } catch (requestError) {
      setAdminCardMessage(
        getRequestErrorMessage(requestError, `Unable to activate ${card.code}.`),
      );
    } finally {
      setValidatingCardCode(null);
    }
  };

  const handleUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const fileInput = formElement.elements.namedItem(
      "admin-files",
    ) as HTMLInputElement | null;
    const files = fileInput?.files;

    if (!files || files.length === 0) {
      setUploadMessage("Choose one or more files first.");
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      await axios.post("/api/uploads", formData);
      formElement.reset();
      setUploadMessage("Files uploaded and added to the runtime feed.");
      await refreshOperations();
      if (authSession?.user.role === "admin") {
        await refreshAdminOverview();
      }
    } catch (requestError) {
      setUploadMessage(
        getRequestErrorMessage(requestError, "Unable to upload files."),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleActivationStatusUpdate = async (
    activationId: string,
    status: ActivationItem["status"],
  ) => {
    try {
      await axios.patch(`/api/admin/activations/${activationId}`, { status });
      await refreshOperations();
      await refreshPortal();
    } catch (requestError) {
      setBroadcastMessage(
        getRequestErrorMessage(
          requestError,
          "Unable to update activation status.",
        ),
      );
    }
  };

  const handleTicketStatusUpdate = async (
    ticketId: string,
    status: TicketItem["status"],
  ) => {
    try {
      await axios.patch(`/api/admin/tickets/${ticketId}`, { status });
      await refreshOperations();
      await refreshPortal();
    } catch (requestError) {
      setBroadcastMessage(
        getRequestErrorMessage(requestError, "Unable to update ticket status."),
      );
    }
  };

  const applyDemoCredential = (credential: DemoCredential) => {
    setAuthMode("login");
    setAuthForm((current) => ({
      ...current,
      role: credential.role,
      name: credential.name,
      email: credential.email,
      password: credential.password,
      company: credential.company,
    }));
  };

  const applyPaymentTestCard = (cardNumber: string) => {
    setPaymentForm((current) => ({
      ...current,
      cardNumber,
      expiry: "12/28",
    }));
  };

  const openPlanActivation = (planSlug: string) => {
    const targetSector = activeSector?.slug ?? "business";
    const targetDeviceKey = getDeviceKeyForSector(targetSector);

    setAuthMode("register");
    setAuthForm((current) => ({
      ...current,
      role: "client",
      sector: targetSector,
      plan: planSlug,
    }));
    setPaymentForm((current) => ({
      ...current,
      plan: planSlug,
      amount: resolvePlanPrice(planSlug),
    }));
    setActivationForm((current) => ({
      ...current,
      company: authSession?.user.company ?? current.company,
      sector: targetSector,
      plan: planSlug,
      deviceKey: targetDeviceKey,
      site: `${activeCountry.label} site`,
    }));
    setActivationMessage(
      `Plan ${plans.find((plan) => plan.slug === planSlug)?.name ?? planSlug} selected. Continue with activation below.`,
    );

    if (authSession?.user.role === "client") {
      setClientTab("support");
      setSiteView("client");
      return;
    }

    setSiteView("system");
  };

  const handleClientCardReveal = (card: SmartCardItem) => {
    setValidatedClientCard(card);
    setClientCardCode(card.code);
    setClientCardBackVisible(false);
    setClientCardMessage(`${card.code} loaded. Flip or validate to deploy it.`);
  };

  const handleClientCardLookup = () => {
    const normalizedCode = clientCardCode.trim().toUpperCase();

    if (!normalizedCode) {
      setClientCardMessage("Enter an SC card code first.");
      return;
    }

    const matchedCard = clientOverview.smartCards.find(
      (card) => card.code.toUpperCase() === normalizedCode,
    );

    if (!matchedCard) {
      setValidatedClientCard(null);
      setClientCardBackVisible(false);
      setClientCardMessage(
        "This SC card is not linked to the selected client company yet.",
      );
      return;
    }

    setValidatedClientCard(matchedCard);
    setClientCardBackVisible(true);
    setClientCardMessage(`${matchedCard.code} revealed for ${matchedCard.ownerCompany}.`);
  };

  const handleClientCardValidate = async (card?: SmartCardItem) => {
    const targetCard =
      card ??
      validatedClientCard ??
      clientOverview.smartCards.find(
        (entry) => entry.code.toUpperCase() === clientCardCode.trim().toUpperCase(),
      );

    if (!targetCard) {
      setClientCardMessage("Select or enter an SC card before validation.");
      return;
    }

    setValidatingCardCode(targetCard.code);
    setClientCardMessage(null);

    try {
      const response = await axios.post<{ card: SmartCardItem }>("/api/cards/validate", {
        code: targetCard.code,
        company: clientOverview.account?.company ?? authSession?.user.company,
      });

      setValidatedClientCard(response.data.card);
      setClientCardCode(response.data.card.code);
      setClientCardBackVisible(true);
      setClientCardMessage(`${response.data.card.code} validated and ready.`);
      await refreshOperations();
      await refreshPortal();
    } catch (requestError) {
      setClientCardMessage(
        getRequestErrorMessage(requestError, "Unable to validate this smart card."),
      );
    } finally {
      setValidatingCardCode(null);
    }
  };

  const openActivationPrefill = () => {
    if (!activeDevice) {
      return;
    }

    setActivationForm((current) => ({
      ...current,
      company: authSession?.user.company ?? current.company,
      sector: activeSector?.slug ?? current.sector,
      plan: authSession?.user.plan ?? current.plan,
      deviceKey: activeDevice.deviceKey,
      site: `${activeCountry.label} site`,
    }));
    setSiteView("system");
    setActivationMessage("Device deployment prefilled. Continue in support + deploy.");
  };

  const openSupportPrefill = () => {
    if (!activeDevice) {
      return;
    }

    setTicketForm((current) => ({
      ...current,
      company: authSession?.user.company ?? current.company,
      contactEmail: authSession?.user.email ?? current.contactEmail,
      summary: `${activeDevice.name} rollout for ${activeSector?.name ?? "selected sector"} (${networkMode} mode)`,
    }));
    setSiteView("system");
    setTicketMessage("Support draft prepared. Continue in support + deploy.");
  };

  const accessView =
    siteView === "admin" ? "admin" : siteView === "client" ? "client" : "system";
  const publicNavTabs = siteTabs.filter((tab) => publicNavTabKeys.has(tab.key));
  const utilityNavTabs = publicNavTabs.filter(
    (tab) => tab.key === "vpn" || tab.key === "system",
  );
  const sectorQuickTabs = siteTabs.filter((tab) => sectorQuickTabKeys.has(tab.key));

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !localizedContent) {
    return (
      <ErrorScreen
        message={error ?? "Frontend content was not available from the API."}
      />
    );
  }

  return (
    <div className="brain-shell">
      <div className="ambient-orb ambient-orb-gold" />
      <div className="ambient-orb ambient-orb-blue" />

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(4,8,18,0.72)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <button
            className="peek-shell flex items-center gap-3"
            onClick={() => openSiteView("commercial")}
            type="button"
          >
            <motion.div
              animate={{ y: [0, -4, 0], scale: [1, 1.02, 1] }}
              className="flex items-center gap-3"
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="h-10 w-10 overflow-hidden rounded-2xl border border-[#e8b552]/60 bg-[#091225] md:h-11 md:w-11">
                <img
                  alt="brAIn mark"
                  className="h-full w-full object-cover object-left"
                  src="/brand/brain-logo.svg"
                />
              </div>
              <div className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.08em] text-white md:text-[2rem]">
                br<span className="text-[#e8b552]">AI</span>n
              </div>
            </motion.div>
            <PeekBuddy />
          </button>

          <nav className="hidden items-center gap-2 lg:flex">
            {utilityNavTabs.map((tab) => (
              <button
                className={`nav-chip ${siteView === tab.key ? "nav-chip-active" : ""}`}
                key={tab.key}
                onClick={() => openSiteView(tab.key)}
                type="button"
              >
                {t(tab.label)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1.5 lg:flex">
              <select
                className="topbar-select"
                onChange={(event) => setSelectedLanguage(event.target.value)}
                value={selectedLanguage}
              >
                {languageOptions.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
              <select
                className="topbar-select"
                onChange={(event) => setSelectedCountry(event.target.value)}
                value={selectedCountry}
              >
                {countryOptions.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.label}
                  </option>
                ))}
              </select>
              <div className="segmented-control nav-segmented-control">
                <button
                  className={networkMode === "country" ? "segment-active" : ""}
                  onClick={() => setNetworkMode("country")}
                  type="button"
                >
                  {t("Region")}
                </button>
                <button
                  className={networkMode === "private" ? "segment-active" : ""}
                  onClick={() => setNetworkMode("private")}
                  type="button"
                >
                  VPN
                </button>
              </div>
              <span className="outline-chip">
                {uiText.autoTranslate}: {translatedUiReady ? "ON" : "EN"}
              </span>
              <span className="outline-chip">
                VPN: {healthSnapshot?.network.vpnActive ? t("Active") : t("Standby")}
              </span>
            </div>

            {authSession ? (
              <button
                className="secondary-button"
                onClick={handleLogout}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                {t("Logout")}
              </button>
            ) : (
              <button
                className="accent-button"
                onClick={() => openSiteView("system")}
                type="button"
              >
                {t("Open portal")}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="app-shell">
        <SectorSidebar
          activeKey={siteView}
          icons={sectorIcons}
          onSelect={(view) => openSiteView(view as SiteView)}
          sectors={sectors}
          tabs={sectorQuickTabs}
          translate={t}
        />

      <main className="min-w-0 flex flex-col gap-7">
        {siteView === "commercial" ? (
          <>
            <motion.section
              className="section-shell"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionMotion}
            >
              <div className="sector-hero-grid">
                <div className="space-y-6">
                  <p className="section-kicker">Sector 1 / Commercial</p>
                  <h1 className="hero-title">{localizedContent.hero.title}</h1>
                  <p className="section-copy max-w-2xl">{localizedContent.hero.subtitle}</p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      className="accent-button"
                      onClick={() => openSiteView("system")}
                      type="button"
                    >
                      Open system center
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => openSiteView("business")}
                      type="button"
                    >
                      Open business sector
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {heroMetrics.map((metric) => (
                      <div className="data-card compact-card" key={metric.label}>
                        <p className="text-xs uppercase tracking-[0.26em] text-white/44">
                          {metric.label}
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {metric.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {sectorQuickTabs.map((tab) => {
                        const sector = sectors.find((item) => item.slug === tab.key);
                        const Icon =
                          sectorIcons[(sector?.slug ?? "commercial") as keyof typeof sectorIcons];

                        return (
                          <button
                            className={`mini-sector-card ${siteView === tab.key ? "mini-sector-card-active" : ""}`}
                            key={tab.key}
                            onClick={() => openSiteView(tab.key)}
                            type="button"
                          >
                            <div className="sector-icon-wrap">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                              <p className="text-[0.68rem] uppercase tracking-[0.3em] text-white/38">
                                Sector
                              </p>
                              <p className="mt-2 text-base font-semibold text-white">
                                {tab.label}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-white/58">
                                {sector?.summary ?? "Open sector page"}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="hero-visual-shell">
                    <img
                      src={planShowcaseAsset}
                      alt="Commercial overview"
                      className="sector-board-image"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="glass-card compact-card peek-shell">
                      <p className="section-kicker">Final identity</p>
                      <motion.img
                        animate={{ y: [0, -8, 0], scale: [1, 1.02, 1] }}
                        className="mt-4 w-full rounded-[1.4rem] border border-white/10"
                        src={finalLogoAsset}
                        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                        alt="Final brAIn logo"
                      />
                      <img
                        src="/brand/brain-logo.svg"
                        alt="brAIn wordmark"
                        className="mt-4 h-16 w-auto"
                      />
                      <PeekBuddy />
                    </div>
                    <div className="glass-card compact-card">
                      <p className="section-kicker">Commercial fit</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="outline-chip">Retail</span>
                        <span className="outline-chip">Kiosks</span>
                        <span className="outline-chip">Hospitality</span>
                        <span className="outline-chip">Promotions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              className="section-shell"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionMotion}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeading
                  eyebrow="Annual subscription plans"
                  title="Commercial page with plans, billing, and lead capture"
                  copy="This sector now behaves like a proper first page: pricing is clear, plans are structured, and the CTA feeds directly into the backend pipeline."
                />

                <div className="billing-toggle">
                  <button
                    className={billing === "annual" ? "billing-active" : ""}
                    onClick={() => setBilling("annual")}
                    type="button"
                  >
                    Annual
                  </button>
                  <button
                    className={billing === "monthly" ? "billing-active" : ""}
                    onClick={() => setBilling("monthly")}
                    type="button"
                  >
                    Monthly
                  </button>
                </div>
              </div>

              <div className="mt-7 grid gap-4 xl:grid-cols-5">
                {plans.map((plan) => (
                  <div
                    className={`plan-card-shell peek-shell ${plan.featured ? "plan-card-featured" : ""}`}
                    key={plan.slug}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-white/40">
                          {plan.name}
                        </p>
                        <h3 className="mt-3 text-3xl font-semibold text-white">
                          {formatMoney(
                            billing === "annual" ? plan.annualPrice : plan.monthlyPrice,
                          )}
                        </h3>
                        <p className="mt-2 text-sm text-white/56">
                          {billing === "annual" ? "/ year" : "/ month"}
                        </p>
                      </div>
                      {plan.featured ? (
                        <span className="status-pill tone-warning">Popular</span>
                      ) : null}
                    </div>

                    <p className="mt-5 text-sm leading-7 text-white/60">
                      {plan.summary}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="outline-chip">
                        {smartCardsPerPlan} {uiText.cardsPerPlan}
                      </span>
                      <span className="outline-chip">
                        {plan.deviceAllowance}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2">
                      {plan.features.map((feature) => (
                        <div
                          className="flex items-start gap-2 text-sm text-white/74"
                          key={feature}
                        >
                          <CheckCheck className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        className="accent-button"
                        onClick={() => openPlanActivation(plan.slug)}
                        type="button"
                      >
                        Activate
                      </button>
                      <span className="text-sm text-white/58">
                        Client access + SC reveal
                      </span>
                    </div>
                    <PeekBuddy />
                  </div>
                ))}
              </div>

              <div className="mt-7 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="glass-card compact-card">
                  <p className="section-kicker">Commercial advantages</p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="data-card compact-card">
                      <p className="text-sm font-semibold text-white">
                        Secure & private
                      </p>
                      <p className="mt-2 text-sm text-white/60">
                        Encrypted runtime, private smart-card activation, and
                        sector-aware onboarding.
                      </p>
                    </div>
                    <div className="data-card compact-card">
                      <p className="text-sm font-semibold text-white">
                        Scale without limits
                      </p>
                      <p className="mt-2 text-sm text-white/60">
                        Add devices, cards, automations, and payment-backed plan
                        upgrades anytime.
                      </p>
                    </div>
                    <div className="data-card compact-card">
                      <p className="text-sm font-semibold text-white">
                        All-in-one platform
                      </p>
                      <p className="mt-2 text-sm text-white/60">
                        Website, hardware, cloud runtime, cards, notifications,
                        payments, and portal in one flow.
                      </p>
                    </div>
                    <div className="data-card compact-card">
                      <p className="text-sm font-semibold text-white">
                        Human support
                      </p>
                      <p className="mt-2 text-sm text-white/60">
                        Client and admin areas are ready for activation requests,
                        support tickets, and live status changes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card compact-card">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="section-kicker">Lead capture</p>
                      <h3 className="mt-3 text-2xl font-semibold text-white">
                        Request the commercial walkthrough
                      </h3>
                    </div>
                    <BellRing className="h-6 w-6 text-[var(--accent)]" />
                  </div>

                  <form className="mt-5 grid gap-3" onSubmit={handleLeadSubmit}>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        className="input-shell"
                        onChange={(event) =>
                          setLeadForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Name"
                        value={leadForm.name}
                      />
                      <input
                        className="input-shell"
                        onChange={(event) =>
                          setLeadForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="Email"
                        value={leadForm.email}
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                      <input
                        className="input-shell"
                        onChange={(event) =>
                          setLeadForm((current) => ({
                            ...current,
                            company: event.target.value,
                          }))
                        }
                        placeholder="Company"
                        value={leadForm.company}
                      />
                      <select
                        className="select-shell"
                        onChange={(event) =>
                          setLeadForm((current) => ({
                            ...current,
                            sector: event.target.value,
                          }))
                        }
                        value={leadForm.sector}
                      >
                        {sectors.map((sector) => (
                          <option key={sector.slug} value={sector.slug}>
                            {sector.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      className="textarea-shell"
                      onChange={(event) =>
                        setLeadForm((current) => ({
                          ...current,
                          message: event.target.value,
                        }))
                      }
                      placeholder="Tell us what you want automated"
                      rows={3}
                      value={leadForm.message}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        className="accent-button"
                        disabled={leadSubmitting}
                        type="submit"
                      >
                        {leadSubmitting ? "Sending..." : "Send request"}
                      </button>
                      {leadMessage ? (
                        <p className="text-sm text-white/64">{leadMessage}</p>
                      ) : null}
                    </div>
                  </form>
                </div>
              </div>
            </motion.section>
          </>
        ) : null}

        {siteView === "business" ||
        siteView === "healthcare" ||
        siteView === "industry" ? (
          <>
            <motion.section
              className="section-shell"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionMotion}
            >
              <div className="sector-hero-grid">
                <div className="space-y-6">
                  <p className="section-kicker">
                    {siteView === "business"
                      ? "Sector 2 / Business"
                      : siteView === "healthcare"
                        ? "Sector 3 / Healthcare"
                        : "Sector 4 / Industry AI"}
                  </p>
                  <h1 className="hero-title">{activeSector?.title}</h1>
                  <p className="section-copy max-w-2xl">{activeSector?.summary}</p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      className="accent-button"
                      onClick={() => openSiteView("system")}
                      type="button"
                    >
                      Open system center
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => openSiteView("commercial")}
                      type="button"
                    >
                      Back to commercial
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(activeSector?.capabilities ?? []).map((capability) => (
                      <span className="outline-chip" key={capability}>
                        {capability}
                      </span>
                    ))}
                  </div>

                  <div className="device-switch-grid">
                    {sectorDevices.map((device) => (
                      <button
                        className={`nav-chip ${activeDevice?.deviceKey === device.deviceKey ? "nav-chip-active" : ""}`}
                        key={device.deviceKey}
                        onClick={() => setSelectedDeviceKey(device.deviceKey)}
                        type="button"
                      >
                        {device.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hero-visual-shell">
                  <img
                    src={activeDevice?.imageUrl}
                    alt={activeDevice?.name}
                    className="sector-board-image"
                  />
                </div>
              </div>
            </motion.section>

            <motion.section
              className="section-shell"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionMotion}
            >
              <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {activeDevice?.metrics.map((metric) => (
                      <div className="data-card compact-card" key={metric.label}>
                        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-white/38">
                          {metric.label}
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {metric.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="glass-card compact-card">
                    <p className="section-kicker">Device live runtime</p>
                    <div className="device-runtime-grid mt-5">
                      <div className="data-card compact-card">
                        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-white/38">
                          Uptime
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {Math.floor(deviceRuntime.uptimeMinutes / 60)}h{" "}
                          {deviceRuntime.uptimeMinutes % 60}m
                        </p>
                      </div>
                      <div className="data-card compact-card">
                        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-white/38">
                          Latency
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {deviceRuntime.latencyMs} ms
                        </p>
                      </div>
                      <div className="data-card compact-card">
                        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-white/38">
                          Throughput
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {deviceRuntime.throughput}%
                        </p>
                      </div>
                      <div className="data-card compact-card">
                        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-white/38">
                          Health
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {deviceRuntime.health}%
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-white/58">
                      Network profile:{" "}
                      <span className="font-semibold text-white/84">{networkMode}</span> /
                      region {activeCountry.code}
                    </p>
                  </div>

                  <div className="glass-card compact-card">
                    <p className="section-kicker">Ports and deployment</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {activeDevice?.ports.map((port) => (
                        <span className="outline-chip" key={port}>
                          {port}
                        </span>
                      ))}
                    </div>

                    <p className="section-kicker mt-7">Suited for</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {activeDevice?.suitedFor.map((item) => (
                        <span className="outline-chip" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <button
                        className="secondary-button"
                        onClick={openActivationPrefill}
                        type="button"
                      >
                        Prepare activation
                      </button>
                      <button
                        className="secondary-button"
                        onClick={openSupportPrefill}
                        type="button"
                      >
                        Open support draft
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="glass-card compact-card">
                    <p className="section-kicker">Live supporting signals</p>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {localizedOperations.metrics.slice(0, 4).map((metric) => (
                      <MetricCard key={metric.key} metric={metric} />
                    ))}
                    </div>
                  </div>

                  <div className="glass-card compact-card">
                    <p className="section-kicker">
                      {siteView === "business"
                        ? "Smart-card and dashboard story"
                        : siteView === "healthcare"
                          ? "Care, compliance, and monitoring"
                          : "Edge deployment and integrations"}
                    </p>
                    <div className="mt-5 space-y-3">
                      {localizedOperations.timeline.slice(0, 4).map((item) => (
                        <FeedItem
                          formatDate={formatLocalDate}
                          item={item}
                          key={item.id}
                          toneClassName={cardToneClasses[item.status]}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </>
        ) : null}

        {siteView === "system" || siteView === "admin" || siteView === "client" ? (
          <>
            {!authSession ? (
              <motion.section
                className="section-shell"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionMotion}
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <SectionHeading
                    eyebrow={t("System center")}
                    title={t("Login / register gates for admin and client")}
                    copy={t(
                      "Admin gets full control over runtime operations, payments, SC cards, uploads, notifications, and status changes. Client gets account metrics, payments, card visibility, activations, and support.",
                    )}
                  />

                  <div className="space-y-3">
                    <div className="segmented-control">
                      <button
                        className={authMode === "login" ? "segment-active" : ""}
                        onClick={() => setAuthMode("login")}
                        type="button"
                      >
                        {t("Login")}
                      </button>
                      <button
                        className={authMode === "register" ? "segment-active" : ""}
                        onClick={() => setAuthMode("register")}
                        type="button"
                      >
                        {t("Register")}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        className={`role-card ${authForm.role === "client" ? "role-card-active" : ""}`}
                        onClick={() =>
                          setAuthForm((current) => ({
                            ...current,
                            role: "client",
                          }))
                        }
                        type="button"
                      >
                        <UserRound className="h-4 w-4 text-[var(--accent)]" />
                        <span className="text-sm font-semibold text-white">
                          {t("Client")}
                        </span>
                      </button>
                      {authMode === "login" ? (
                        <button
                          className={`role-card ${authForm.role === "admin" ? "role-card-active" : ""}`}
                          onClick={() =>
                            setAuthForm((current) => ({
                              ...current,
                              role: "admin",
                            }))
                          }
                          type="button"
                        >
                          <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                          <span className="text-sm font-semibold text-white">
                            {t("Admin")}
                          </span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.section>
            ) : null}

            <OperationsPulse
              cardToneClasses={cardToneClasses}
              formatLocalDate={formatLocalDate}
              operations={localizedOperations}
              serviceToneClasses={serviceToneClasses}
              translate={t}
            />

            <motion.section
              className="section-shell"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={sectionMotion}
            >
              <SectionHeading
                eyebrow={
                  accessView === "admin"
                    ? t("Admin page")
                    : accessView === "client"
                      ? t("Client page")
                      : t("System center")
                }
                title={
                  accessView === "admin"
                    ? t("Admin control page with live operations and payment control")
                    : accessView === "client"
                      ? t("Client workspace page with payments, cards, and support")
                      : t("Login / register gates for admin and client")
                }
                copy={
                  accessView === "admin"
                    ? t(
                        "Use the admin page to monitor runtime, manage payments, assign smart cards, and control activation plus ticket status in real time.",
                      )
                    : accessView === "client"
                      ? t(
                          "Use the client page to check account metrics, complete payments, track smart cards, and request deployment support.",
                        )
                      : t(
                          "Admin gets full control over runtime operations, payments, SC cards, uploads, notifications, and status changes. Client gets account metrics, payments, card visibility, activations, and support.",
                        )
                }
              />

              {!authSession ? (
                <div className="mt-7 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="glass-card compact-card">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="section-kicker">{t("Portal roles")}</p>
                        <h3 className="mt-3 text-2xl font-semibold text-white">
                          {t("Choose who is entering the system")}
                        </h3>
                      </div>
                      <LockKeyhole className="h-6 w-6 text-[var(--accent)]" />
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <button
                        className={`role-card ${authForm.role === "client" ? "role-card-active" : ""}`}
                        onClick={() =>
                          setAuthForm((current) => ({
                            ...current,
                            role: "client",
                          }))
                        }
                        type="button"
                      >
                        <UserRound className="h-5 w-5 text-[var(--accent)]" />
                        <div className="text-left">
                          <p className="text-lg font-semibold text-white">{t("Client")}</p>
                          <p className="mt-2 text-sm leading-6 text-white/58">
                            {t(
                              "View company metrics, cards, payments, activations, and support.",
                            )}
                          </p>
                        </div>
                      </button>

                      {authMode === "login" ? (
                        <button
                          className={`role-card ${authForm.role === "admin" ? "role-card-active" : ""}`}
                          onClick={() =>
                            setAuthForm((current) => ({
                              ...current,
                              role: "admin",
                            }))
                          }
                          type="button"
                        >
                          <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
                          <div className="text-left">
                            <p className="text-lg font-semibold text-white">{t("Admin")}</p>
                            <p className="mt-2 text-sm leading-6 text-white/58">
                              {t(
                                "Control notifications, payments, smart cards, uploads, activations, tickets, and accounts.",
                              )}
                            </p>
                          </div>
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-6 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="section-kicker">{t("Demo credentials")}</p>
                          <p className="mt-2 text-sm text-white/58">
                            {t("Click one to prefill login instantly.")}
                          </p>
                        </div>
                        <Sparkles className="h-5 w-5 text-[var(--accent)]" />
                      </div>
                      <div className="mt-4 space-y-3">
                        {demoCredentials.map((credential) => (
                          <button
                            className="demo-credential"
                            key={credential.email}
                            onClick={() => applyDemoCredential(credential)}
                            type="button"
                          >
                            <div className="text-left">
                              <p className="text-sm font-semibold text-white">
                                {credential.name}
                              </p>
                              <p className="mt-1 text-xs text-white/50">
                                {credential.role} / {credential.company}
                              </p>
                            </div>
                            <div className="text-right text-xs text-white/54">
                              <p>{credential.email}</p>
                              <p>{credential.password}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                      {t("Target page")}:{" "}
                      <span className="font-semibold text-white">
                        {accessView === "admin"
                          ? t("Admin login")
                          : accessView === "client"
                            ? t("Client login")
                            : t("System access")}
                      </span>
                    </div>
                  </div>

                  <div className="glass-card compact-card">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="section-kicker">{t("Auth")}</p>
                        <h3 className="mt-3 text-2xl font-semibold text-white">
                          {authMode === "login"
                            ? t("Login to the portal")
                            : t("Register a new portal account")}
                        </h3>
                      </div>

                      <div className="segmented-control">
                        <button
                          className={authMode === "login" ? "segment-active" : ""}
                          onClick={() => setAuthMode("login")}
                          type="button"
                        >
                          {t("Login")}
                        </button>
                        <button
                          className={authMode === "register" ? "segment-active" : ""}
                          onClick={() => setAuthMode("register")}
                          type="button"
                        >
                          {t("Register")}
                        </button>
                      </div>
                    </div>

                    <form className="mt-6 grid gap-3" onSubmit={handleAuthSubmit}>
                      {authMode === "register" ? (
                        <input
                          className="input-shell"
                          onChange={(event) =>
                            setAuthForm((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                          placeholder="Full name"
                          value={authForm.name}
                        />
                      ) : null}

                      <div className="grid gap-3 md:grid-cols-2">
                        {authMode === "login" ? (
                          <select
                            className="select-shell"
                            onChange={(event) =>
                              setAuthForm((current) => ({
                                ...current,
                                role: event.target.value as AuthRole,
                              }))
                            }
                            value={authForm.role}
                          >
                            <option value="client">Client</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <div className="rounded-[1.1rem] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">
                            Client registration only
                          </div>
                        )}
                        <input
                          className="input-shell"
                          onChange={(event) =>
                            setAuthForm((current) => ({
                              ...current,
                              email: event.target.value,
                            }))
                          }
                          placeholder="Email"
                          value={authForm.email}
                        />
                      </div>

                      <input
                        className="input-shell"
                        onChange={(event) =>
                          setAuthForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        placeholder="Password"
                        type="password"
                        value={authForm.password}
                      />

                      {authMode === "register" && authForm.role === "client" ? (
                        <>
                          <input
                            className="input-shell"
                            onChange={(event) =>
                              setAuthForm((current) => ({
                                ...current,
                                company: event.target.value,
                              }))
                            }
                            placeholder="Company"
                            value={authForm.company}
                          />
                          <div className="grid gap-3 md:grid-cols-2">
                            <select
                              className="select-shell"
                              onChange={(event) =>
                                setAuthForm((current) => ({
                                  ...current,
                                  sector: event.target.value,
                                }))
                              }
                              value={authForm.sector}
                            >
                              {sectors.map((sector) => (
                                <option key={sector.slug} value={sector.slug}>
                                  {sector.name}
                                </option>
                              ))}
                            </select>
                            <select
                              className="select-shell"
                              onChange={(event) =>
                                setAuthForm((current) => ({
                                  ...current,
                                  plan: event.target.value,
                                }))
                              }
                              value={authForm.plan}
                            >
                              {plans.map((plan) => (
                                <option key={plan.slug} value={plan.slug}>
                                  {plan.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          className="accent-button"
                          disabled={authSubmitting}
                          type="submit"
                        >
                          {authSubmitting
                            ? "Processing..."
                            : authMode === "login"
                              ? "Login now"
                              : "Create account"}
                        </button>
                        {authMessage ? (
                          <p className="text-sm text-white/64">{authMessage}</p>
                        ) : null}
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="mt-7 dashboard-layout">
                  <PortalSidebar
                    activeCountryLabel={activeCountry.label}
                    activeLanguageLabel={activeLanguage.label}
                    activeTab={
                      authSession.user.role === "admin" ? adminTab : clientTab
                    }
                    dashboardSearch={dashboardSearch}
                    networkMode={networkMode}
                    onSearchChange={setDashboardSearch}
                    onTabChange={(value) =>
                      authSession.user.role === "admin"
                        ? setAdminTab(value as AdminTabKey)
                        : setClientTab(value as ClientTabKey)
                    }
                    searchPlaceholder={uiText.search}
                    sectionLabel={uiText.dashboard}
                    tabs={authSession.user.role === "admin" ? adminTabs : clientTabs}
                    translate={t}
                  />
                  <div className="space-y-4">
                  <div className="glass-card compact-card">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="section-kicker">Portal session</p>
                        <h3 className="mt-3 text-3xl font-semibold text-white">
                          {authSession.user.role === "admin"
                            ? uiText.adminCenter
                            : uiText.clientWorkspace}
                        </h3>
                        <p className="mt-3 text-sm text-white/62">
                          {authSession.user.name} / {authSession.user.email} /{" "}
                          {authSession.user.company}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          className="secondary-button"
                          onClick={() => {
                            void refreshOperations();
                            void refreshPortal();
                          }}
                          type="button"
                        >
                          <RefreshCw className="h-4 w-4" />
                          {uiText.refresh}
                        </button>
                        <button
                          className="secondary-button"
                          onClick={handleLogout}
                          type="button"
                        >
                          <LogOut className="h-4 w-4" />
                          {uiText.logout}
                        </button>
                      </div>
                    </div>
                  </div>

                  {authSession.user.role === "admin" ? (
                    <>
                      <div className="portal-tab-row">
                        {adminTabs.map((tab) => {
                          const Icon = tab.icon;

                          return (
                            <button
                              className={`portal-tab ${adminTab === tab.key ? "portal-tab-active" : ""}`}
                              key={tab.key}
                              onClick={() => setAdminTab(tab.key)}
                              type="button"
                            >
                              <Icon className="h-4 w-4" />
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>

                      {adminTab === "overview" ? (
                        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {localizedAdminOverview.adminMetrics.map((metric) => (
                                  <MetricCard key={metric.key} metric={metric} />
                                ))}
                            </div>

                            <div className="glass-card compact-card">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="section-kicker">Accounts</p>
                                  <h3 className="mt-3 text-2xl font-semibold text-white">
                                    Client organizations
                                  </h3>
                                </div>
                                <Building2 className="h-5 w-5 text-[var(--accent)]" />
                              </div>

                              <div className="mt-5 overflow-x-auto overflow-y-hidden rounded-[1.5rem] border border-white/8">
                                <div className="table-head grid-cols-[1.2fr_0.8fr_0.6fr_0.6fr_0.8fr]">
                                  <span>Company</span>
                                  <span>Sector</span>
                                  <span>Plan</span>
                                  <span>Cards</span>
                                  <span>Sales</span>
                                </div>
                                <div className="table-body">
                                  {filteredAdminAccounts.map((account) => (
                                    <div
                                      className="table-row grid-cols-[1.2fr_0.8fr_0.6fr_0.6fr_0.8fr]"
                                      key={account.id}
                                    >
                                      <span>{account.company}</span>
                                      <span>{account.sectorLabel}</span>
                                      <span>{account.planName}</span>
                                      <span>{account.smartCards}</span>
                                      <span>{formatMoney(account.salesToday)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="glass-card compact-card">
                              <p className="section-kicker">Payments snapshot</p>
                              <div className="mt-5 space-y-3">
                                {filteredAdminPayments.length > 0 ? (
                                  filteredAdminPayments.slice(0, 6).map((payment) => (
                                    <div className="feed-row" key={payment.id}>
                                      <div className="status-pill tone-success">
                                        {paymentBrandLabels[payment.cardBrand]}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-white">
                                          {payment.company}
                                        </p>
                                        <p className="mt-1 text-sm text-white/56">
                                          {payment.planName} / **** {payment.last4}
                                        </p>
                                      </div>
                                      <div className="text-sm font-semibold text-white">
                                        {formatMoney(payment.amount)}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <EmptyCard message="Payments will appear here once the first checkout lands." />
                                )}
                              </div>
                            </div>

                            <div className="glass-card compact-card">
                              <p className="section-kicker">Notifications</p>
                              <div className="mt-5 space-y-3">
                                {localizedAdminOverview.notifications.slice(0, 5).map((item) => (
                                  <div className="feed-row" key={item.id}>
                                    <div
                                      className={`status-pill ${cardToneClasses[item.level]}`}
                                    >
                                      {item.level}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-white">
                                        {item.title}
                                      </p>
                                      <p className="mt-1 text-sm text-white/56">
                                        {item.body}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {adminTab === "payments" ? (
                        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                          <div className="glass-card compact-card">
                            <p className="section-kicker">Accepted cards</p>
                            <h3 className="mt-3 text-2xl font-semibold text-white">
                              Visa, Mastercard, and American Express
                            </h3>
                            <div className="mt-5 flex flex-wrap gap-2">
                              {acceptedTestCards.map((card) => (
                                <span className="outline-chip" key={card.label}>
                                  {card.label}
                                </span>
                              ))}
                            </div>
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                              {adminOverview.payments.slice(0, 4).map((payment) => (
                                <div className="data-card compact-card" key={payment.id}>
                                  <p className="text-xs uppercase tracking-[0.28em] text-white/38">
                                    {paymentBrandLabels[payment.cardBrand]}
                                  </p>
                                  <p className="mt-3 text-xl font-semibold text-white">
                                    {formatMoney(payment.amount)}
                                  </p>
                                  <p className="mt-2 text-sm text-white/58">
                                    {payment.company} / {payment.planName}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="glass-card compact-card">
                            <p className="section-kicker">Payment records</p>
                            <div className="mt-5 overflow-x-auto overflow-y-hidden rounded-[1.5rem] border border-white/8">
                              <div className="table-head grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.8fr]">
                                <span>Company</span>
                                <span>Plan</span>
                                <span>Brand</span>
                                <span>Last 4</span>
                                <span>Amount</span>
                              </div>
                              <div className="table-body">
                                {filteredAdminPayments.map((payment) => (
                                  <div
                                    className="table-row grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.8fr]"
                                    key={payment.id}
                                  >
                                    <span>{payment.company}</span>
                                    <span>{payment.planName}</span>
                                    <span>{paymentBrandLabels[payment.cardBrand]}</span>
                                    <span>**** {payment.last4}</span>
                                    <span>{formatMoney(payment.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {adminTab === "cards" ? (
                        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                          <div className="space-y-4">
                            <div className="glass-card compact-card">
                              <p className="section-kicker">SC card control</p>
                              <h3 className="mt-3 text-2xl font-semibold text-white">
                                Assign from the {totalSmartCardInventory.toLocaleString(currentLocale)}-card inventory
                              </h3>

                              <div className="plan-breakdown-grid mt-5">
                                {adminPlanCardStats.map((planStat) => (
                                  <div className="plan-breakdown-card" key={planStat.slug}>
                                    <p className="text-xs uppercase tracking-[0.28em] text-white/38">
                                      {planStat.name}
                                    </p>
                                    <p className="mt-3 text-2xl font-semibold text-white">
                                      {planStat.total}
                                    </p>
                                    <p className="mt-2 text-sm text-white/58">
                                      {planStat.available} available / {planStat.activated} activated
                                    </p>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <div className="data-card compact-card">
                                  <p className="text-xs uppercase tracking-[0.3em] text-white/38">
                                    Total
                                  </p>
                                  <p className="mt-3 text-3xl font-semibold text-white">
                                    {adminOverview.smartCardStats.total}
                                  </p>
                                </div>
                                <div className="data-card compact-card">
                                  <p className="text-xs uppercase tracking-[0.3em] text-white/38">
                                    Available
                                  </p>
                                  <p className="mt-3 text-3xl font-semibold text-white">
                                    {adminOverview.smartCardStats.available}
                                  </p>
                                </div>
                                <div className="data-card compact-card">
                                  <p className="text-xs uppercase tracking-[0.3em] text-white/38">
                                    Activated
                                  </p>
                                  <p className="mt-3 text-3xl font-semibold text-white">
                                    {adminOverview.smartCardStats.activated}
                                  </p>
                                </div>
                              </div>

                              <form
                                className="mt-6 grid gap-3"
                                onSubmit={handleAssignCardsSubmit}
                              >
                                <input
                                  className="input-shell"
                                  onChange={(event) =>
                                    setAssignCardsForm((current) => ({
                                      ...current,
                                      company: event.target.value,
                                    }))
                                  }
                                  placeholder="Company"
                                  value={assignCardsForm.company}
                                />
                                <div className="grid gap-3 md:grid-cols-2">
                                  <select
                                    className="select-shell"
                                    onChange={(event) =>
                                      setAssignCardsForm((current) => ({
                                        ...current,
                                        sector: event.target.value,
                                        deviceKey: getDeviceKeyForSector(
                                          event.target.value,
                                        ),
                                      }))
                                    }
                                    value={assignCardsForm.sector}
                                  >
                                    {sectors.map((sector) => (
                                      <option key={sector.slug} value={sector.slug}>
                                        {sector.name}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    className="select-shell"
                                    onChange={(event) =>
                                      setAssignCardsForm((current) => ({
                                        ...current,
                                        plan: event.target.value,
                                      }))
                                    }
                                    value={assignCardsForm.plan}
                                  >
                                    {plans.map((plan) => (
                                      <option key={plan.slug} value={plan.slug}>
                                        {plan.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                  <select
                                    className="select-shell"
                                    onChange={(event) =>
                                      setAssignCardsForm((current) => ({
                                        ...current,
                                        deviceKey: event.target.value,
                                      }))
                                    }
                                    value={assignCardsForm.deviceKey}
                                  >
                                    {devices.map((device) => (
                                      <option
                                        key={device.deviceKey}
                                        value={device.deviceKey}
                                      >
                                        {device.name}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    className="input-shell"
                                    min={1}
                                    onChange={(event) =>
                                      setAssignCardsForm((current) => ({
                                        ...current,
                                        quantity: Number(event.target.value) || 1,
                                      }))
                                    }
                                    type="number"
                                    value={assignCardsForm.quantity}
                                  />
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                  <button
                                    className="accent-button"
                                    disabled={assigningCards}
                                    type="submit"
                                  >
                                    {assigningCards ? "Assigning..." : "Assign cards"}
                                  </button>
                                  {assignCardsMessage ? (
                                    <p className="text-sm text-white/64">
                                      {assignCardsMessage}
                                    </p>
                                  ) : null}
                                </div>
                              </form>
                            </div>
                          </div>

                          <div className="glass-card compact-card">
                            <p className="section-kicker">Inventory preview</p>
                            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.5fr]">
                              <input
                                className="input-shell"
                                onChange={(event) => setAdminCardQuery(event.target.value)}
                                placeholder="Search by code, sector, plan, owner"
                                value={adminCardQuery}
                              />
                              <select
                                className="select-shell"
                                onChange={(event) =>
                                  setAdminCardFilter(
                                    event.target.value as SmartCardItem["status"] | "all",
                                  )
                                }
                                value={adminCardFilter}
                              >
                                <option value="all">All statuses</option>
                                <option value="available">Available</option>
                                <option value="assigned">Assigned</option>
                                <option value="activated">Activated</option>
                              </select>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm text-white/62">
                                Showing {adminVisibleCards.length} of{" "}
                                {adminOverview.smartCardStats.total} SC cards
                              </p>
                              {adminCardMessage ? (
                                <p className="text-sm text-white/70">{adminCardMessage}</p>
                              ) : null}
                            </div>
                            <div className="mt-5 overflow-x-auto overflow-y-hidden rounded-[1.5rem] border border-white/8">
                              <div className="table-head grid-cols-[0.9fr_0.7fr_0.7fr_0.8fr_0.6fr_0.75fr]">
                                <span>Code</span>
                                <span>Sector</span>
                                <span>Plan</span>
                                <span>Owner</span>
                                <span>Status</span>
                                <span>Action</span>
                              </div>
                              <div className="table-body">
                                {adminVisibleCards.map((card) => (
                                  <div
                                    className="table-row grid-cols-[0.9fr_0.7fr_0.7fr_0.8fr_0.6fr_0.75fr]"
                                    key={card.id}
                                  >
                                    <span>{card.code}</span>
                                    <span>{card.sectorLabel}</span>
                                    <span>{card.planName}</span>
                                    <span>{card.ownerCompany ?? "Inventory"}</span>
                                    <span>
                                      <span
                                        className={`status-pill ${smartCardToneClasses[card.status]}`}
                                      >
                                        {card.status}
                                      </span>
                                    </span>
                                    <span>
                                      <button
                                        className="inline-action"
                                        disabled={
                                          card.status === "activated" ||
                                          validatingCardCode === card.code
                                        }
                                        onClick={() => void handleAdminCardActivate(card)}
                                        type="button"
                                      >
                                        {validatingCardCode === card.code
                                          ? "Activating..."
                                          : card.status === "activated"
                                            ? "Activated"
                                            : "Activate"}
                                      </button>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {adminTab === "ops" ? (
                        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                          <div className="space-y-4">
                            <div className="glass-card compact-card">
                              <p className="section-kicker">Broadcast</p>
                              <form
                                className="mt-5 grid gap-3"
                                onSubmit={handleBroadcastSubmit}
                              >
                                <input
                                  className="input-shell"
                                  onChange={(event) =>
                                    setBroadcastForm((current) => ({
                                      ...current,
                                      title: event.target.value,
                                    }))
                                  }
                                  placeholder="Notification title"
                                  value={broadcastForm.title}
                                />
                                <select
                                  className="select-shell"
                                  onChange={(event) =>
                                    setBroadcastForm((current) => ({
                                      ...current,
                                      level: event.target.value as BroadcastFormState["level"],
                                    }))
                                  }
                                  value={broadcastForm.level}
                                >
                                  <option value="info">Info</option>
                                  <option value="success">Success</option>
                                  <option value="warning">Warning</option>
                                </select>
                                <textarea
                                  className="textarea-shell"
                                  onChange={(event) =>
                                    setBroadcastForm((current) => ({
                                      ...current,
                                      body: event.target.value,
                                    }))
                                  }
                                  placeholder="Notification body"
                                  rows={3}
                                  value={broadcastForm.body}
                                />
                                <div className="flex flex-wrap items-center gap-3">
                                  <button
                                    className="accent-button"
                                    disabled={broadcastSubmitting}
                                    type="submit"
                                  >
                                    {broadcastSubmitting
                                      ? "Broadcasting..."
                                      : "Send broadcast"}
                                  </button>
                                  {broadcastMessage ? (
                                    <p className="text-sm text-white/64">
                                      {broadcastMessage}
                                    </p>
                                  ) : null}
                                </div>
                              </form>
                            </div>

                            <div className="glass-card compact-card">
                              <p className="section-kicker">Upload center</p>
                              <form className="mt-5 grid gap-3" onSubmit={handleUploadSubmit}>
                                <label className="upload-panel" htmlFor="admin-files">
                                  <Upload className="h-5 w-5 text-[var(--accent)]" />
                                  <span>Upload assets or docs into live runtime</span>
                                </label>
                                <input
                                  className="hidden"
                                  id="admin-files"
                                  multiple
                                  name="admin-files"
                                  type="file"
                                />
                                <div className="flex flex-wrap items-center gap-3">
                                  <button
                                    className="secondary-button"
                                    disabled={uploading}
                                    type="submit"
                                  >
                                    {uploading ? "Uploading..." : "Upload files"}
                                  </button>
                                  {uploadMessage ? (
                                    <p className="text-sm text-white/64">
                                      {uploadMessage}
                                    </p>
                                  ) : null}
                                </div>
                              </form>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="glass-card compact-card">
                              <p className="section-kicker">Activations</p>
                              <div className="mt-5 space-y-3">
                                {adminOverview.activations.map((activation) => (
                                  <div className="feed-row flex-col items-start" key={activation.id}>
                                    <div className="flex w-full items-start justify-between gap-3">
                                      <div>
                                        <p className="text-sm font-semibold text-white">
                                          {activation.company} / {activation.deviceName}
                                        </p>
                                        <p className="mt-1 text-sm text-white/56">
                                          {activation.site} / {activation.planName}
                                        </p>
                                      </div>
                                      <span
                                        className={`status-pill ${activationToneClasses[activation.status]}`}
                                      >
                                        {activation.status}
                                      </span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {(["queued", "provisioning", "live"] as const).map(
                                        (status) => (
                                          <button
                                            className="inline-action"
                                            key={status}
                                            onClick={() =>
                                              void handleActivationStatusUpdate(
                                                activation.id,
                                                status,
                                              )
                                            }
                                            type="button"
                                          >
                                            {status}
                                          </button>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="glass-card compact-card">
                              <p className="section-kicker">Support tickets</p>
                              <div className="mt-5 space-y-3">
                                {adminOverview.tickets.map((ticket) => (
                                  <div className="feed-row flex-col items-start" key={ticket.id}>
                                    <div className="flex w-full items-start justify-between gap-3">
                                      <div>
                                        <p className="text-sm font-semibold text-white">
                                          {ticket.company} / {ticket.category}
                                        </p>
                                        <p className="mt-1 text-sm text-white/56">
                                          {ticket.summary}
                                        </p>
                                      </div>
                                      <span
                                        className={`status-pill ${ticketToneClasses[ticket.status]}`}
                                      >
                                        {ticket.status}
                                      </span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {(["open", "investigating", "resolved"] as const).map(
                                        (status) => (
                                          <button
                                            className="inline-action"
                                            key={status}
                                            onClick={() =>
                                              void handleTicketStatusUpdate(
                                                ticket.id,
                                                status,
                                              )
                                            }
                                            type="button"
                                          >
                                            {status}
                                          </button>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <div className="portal-tab-row">
                        {clientTabs.map((tab) => {
                          const Icon = tab.icon;

                          return (
                            <button
                              className={`portal-tab ${clientTab === tab.key ? "portal-tab-active" : ""}`}
                              key={tab.key}
                              onClick={() => setClientTab(tab.key)}
                              type="button"
                            >
                              <Icon className="h-4 w-4" />
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>

                      {clientTab === "overview" ? (
                        <div className="space-y-4">
                          <ClientDashboardOverview
                            account={clientOverview.account}
                            activations={clientOverview.activations}
                            clients={clientOverview.clients}
                            company={selectedClientCompany || authSession.user.company}
                            formatMoney={formatMoney}
                            notifications={localizedClientOverview.notifications}
                            onOpenCards={() => {
                              if (filteredClientCards[0]) {
                                handleClientCardReveal(filteredClientCards[0]);
                              }
                            }}
                            onOpenPayments={() => setClientTab("payments")}
                            onOpenSupport={() => setClientTab("support")}
                            onSelectCompany={setSelectedClientCompany}
                            payments={filteredClientPayments}
                            smartCards={filteredClientCards}
                            userEmail={authSession.user.email}
                            userName={authSession.user.name}
                          />

                        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                          <div className="space-y-4">
                            <div className="glass-card compact-card">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="section-kicker">Company view</p>
                                  <h3 className="mt-3 text-2xl font-semibold text-white">
                                    {clientOverview.account?.company ?? authSession.user.company}
                                  </h3>
                                </div>
                                <select
                                  className="select-shell max-w-[16rem]"
                                  onChange={(event) =>
                                    setSelectedClientCompany(event.target.value)
                                  }
                                  value={selectedClientCompany}
                                >
                                  {clientOverview.clients.map((client) => (
                                    <option key={client.company} value={client.company}>
                                      {client.company} / {client.sectorLabel}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {localizedClientOverview.quickMetrics.map((metric) => (
                                  <MetricCard key={metric.key} metric={metric} />
                                ))}
                              </div>
                            </div>

                            <div className="glass-card compact-card">
                              <p className="section-kicker">Smart cards in use</p>
                              <div className="client-card-grid mt-5">
                                {filteredClientCards.length > 0 ? (
                                  filteredClientCards.slice(0, 6).map((card) => (
                                    <div
                                      className={`smart-card-mini ${activeClientCard?.id === card.id ? "smart-card-mini-active" : ""}`}
                                      key={card.id}
                                    >
                                      <div
                                        className={`status-pill ${smartCardToneClasses[card.status]}`}
                                      >
                                        {card.status}
                                      </div>
                                      <div className="mt-4">
                                        <p className="text-sm font-semibold text-white">
                                          {card.code}
                                        </p>
                                        <p className="mt-1 text-sm text-white/56">
                                          {card.planName} / {card.sectorLabel}
                                        </p>
                                      </div>
                                      <div className="mt-4 text-xs text-white/42">
                                        {formatLocalDate(card.updatedAt)}
                                      </div>
                                      <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                          className="inline-action"
                                          onClick={() => handleClientCardReveal(card)}
                                          type="button"
                                        >
                                          Reveal
                                        </button>
                                        <button
                                          className="inline-action"
                                          disabled={validatingCardCode === card.code}
                                          onClick={() => void handleClientCardValidate(card)}
                                          type="button"
                                        >
                                          {validatingCardCode === card.code
                                            ? "Activating..."
                                            : card.status === "activated"
                                              ? "Validated"
                                              : "Activate"}
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <EmptyCard message="No cards are assigned to this company yet." />
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="glass-card compact-card">
                              <p className="section-kicker">Latest notifications</p>
                              <div className="mt-5 space-y-3">
                                {localizedClientOverview.notifications.map((notification) => (
                                  <div className="feed-row" key={notification.id}>
                                    <div
                                      className={`status-pill ${cardToneClasses[notification.level]}`}
                                    >
                                      {notification.level}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-white">
                                        {notification.title}
                                      </p>
                                      <p className="mt-1 text-sm text-white/56">
                                        {notification.body}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="glass-card compact-card peek-shell">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="section-kicker">Card reveal studio</p>
                                  <h3 className="mt-3 text-2xl font-semibold text-white">
                                    Reveal and validate live client SC cards
                                  </h3>
                                </div>
                                <span className="outline-chip">
                                  {filteredClientCards.length} linked card(s)
                                </span>
                              </div>

                              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                                <input
                                  className="input-shell"
                                  onChange={(event) => setClientCardCode(event.target.value)}
                                  placeholder="Enter SC code"
                                  value={clientCardCode}
                                />
                                <button
                                  className="secondary-button"
                                  onClick={handleClientCardLookup}
                                  type="button"
                                >
                                  Reveal
                                </button>
                                <button
                                  className="accent-button"
                                  disabled={
                                    !activeClientCard ||
                                    validatingCardCode === activeClientCard.code
                                  }
                                  onClick={() => void handleClientCardValidate()}
                                  type="button"
                                >
                                  {activeClientCard &&
                                  validatingCardCode === activeClientCard.code
                                    ? "Validating..."
                                    : activeClientCard?.status === "activated"
                                      ? "Validated"
                                      : "Validate"}
                                </button>
                              </div>

                              {clientCardMessage ? (
                                <p className="mt-4 text-sm text-white/64">
                                  {clientCardMessage}
                                </p>
                              ) : null}

                              {activeClientCard ? (
                                <div className="smart-card-stage mt-5">
                                  <motion.div
                                    animate={{ rotateY: clientCardBackVisible ? 180 : 0 }}
                                    className="smart-card-scene"
                                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                  >
                                    <div className="smart-card-face smart-card-front">
                                      <div className="smart-card-glow" />
                                      <p className="section-kicker">Front side</p>
                                      <div className="mt-4 flex items-center gap-3">
                                        <div className="h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1.5">
                                          <img
                                            alt="brAIn logo"
                                            className="h-full w-full object-cover object-left"
                                            src="/brand/brain-logo.svg"
                                          />
                                        </div>
                                        <div>
                                          <p className="text-xs uppercase tracking-[0.24em] text-white/38">
                                            brAIn
                                          </p>
                                          <p className="mt-1 text-sm text-white/58">
                                            Client scratch reveal
                                          </p>
                                        </div>
                                      </div>
                                      <div className="mt-6 flex items-start justify-between gap-3">
                                        <div>
                                          <p className="text-sm uppercase tracking-[0.3em] text-white/45">
                                            brAIn SC
                                          </p>
                                          <p className="smart-card-code mt-6 text-2xl font-semibold text-white">
                                            {maskCardCode(activeClientCard.code)}
                                          </p>
                                        </div>
                                        <div
                                          className={`status-pill ${smartCardToneClasses[activeClientCard.status]}`}
                                        >
                                          {activeClientCard.status}
                                        </div>
                                      </div>
                                      <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                        <div>
                                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                                            Plan
                                          </p>
                                          <p className="mt-2 text-lg font-semibold text-white">
                                            {activeClientCard.planName}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                                            Company
                                          </p>
                                          <p className="mt-2 text-lg font-semibold text-white">
                                            {activeClientCard.ownerCompany ?? "Unassigned"}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="mt-8 flex flex-wrap gap-2">
                                        <button
                                          className="secondary-button"
                                          onClick={() =>
                                            setClientCardBackVisible((current) => !current)
                                          }
                                          type="button"
                                        >
                                          Flip card
                                        </button>
                                      </div>
                                    </div>

                                    <div className="smart-card-face smart-card-back">
                                      <div className="smart-card-glow smart-card-glow-secondary" />
                                      <p className="section-kicker">Back side</p>
                                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        <div>
                                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                                            Sector
                                          </p>
                                          <p className="mt-2 text-lg font-semibold text-white">
                                            {activeClientCard.sectorLabel}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                                            Device
                                          </p>
                                          <p className="mt-2 text-lg font-semibold text-white">
                                            {activeClientCard.deviceKey ?? "Pending device"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                                            Updated
                                          </p>
                                          <p className="mt-2 text-lg font-semibold text-white">
                                            {formatLocalDate(activeClientCard.updatedAt)}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                                            Route
                                          </p>
                                          <p className="mt-2 text-lg font-semibold text-white">
                                            {healthSnapshot?.network.route ?? networkLabel}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="mt-8 flex flex-wrap gap-2">
                                        <button
                                          className="secondary-button"
                                          onClick={() => setClientCardBackVisible(false)}
                                          type="button"
                                        >
                                          Front
                                        </button>
                                        <button
                                          className="accent-button"
                                          disabled={
                                            validatingCardCode === activeClientCard.code ||
                                            activeClientCard.status === "activated"
                                          }
                                          onClick={() =>
                                            void handleClientCardValidate(activeClientCard)
                                          }
                                          type="button"
                                        >
                                          {activeClientCard.status === "activated"
                                            ? "Already active"
                                            : "Validate now"}
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                  <PeekBuddy />
                                </div>
                              ) : (
                                <div className="mt-5">
                                  <EmptyCard message="Choose an assigned card to reveal it here." />
                                </div>
                              )}
                            </div>

                            <div className="glass-card compact-card">
                              <p className="section-kicker">Recent payments</p>
                              <div className="mt-5 space-y-3">
                                {filteredClientPayments.length > 0 ? (
                                  filteredClientPayments.map((payment) => (
                                    <div className="feed-row" key={payment.id}>
                                      <div className="status-pill tone-success">
                                        {paymentBrandLabels[payment.cardBrand]}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-white">
                                          {payment.planName}
                                        </p>
                                        <p className="mt-1 text-sm text-white/56">
                                          **** {payment.last4}
                                        </p>
                                      </div>
                                      <div className="text-sm font-semibold text-white">
                                        {formatMoney(payment.amount)}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <EmptyCard message="No payments have been captured yet." />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        </div>
                      ) : null}

                      {clientTab === "payments" ? (
                        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                          <div className="glass-card compact-card">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="section-kicker">Checkout</p>
                                <h3 className="mt-3 text-2xl font-semibold text-white">
                                  Live plan payment form
                                </h3>
                              </div>
                              <CreditCard className="h-5 w-5 text-[var(--accent)]" />
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                              {acceptedTestCards.map((card) => (
                                <button
                                  className="outline-chip"
                                  key={card.label}
                                  onClick={() => applyPaymentTestCard(card.cardNumber)}
                                  type="button"
                                >
                                  {card.label}
                                </button>
                              ))}
                            </div>

                            <form className="mt-6 grid gap-3" onSubmit={handlePaymentSubmit}>
                              <input
                                className="input-shell"
                                onChange={(event) =>
                                  setPaymentForm((current) => ({
                                    ...current,
                                    company: event.target.value,
                                  }))
                                }
                                placeholder="Company"
                                value={paymentForm.company}
                              />
                              <div className="grid gap-3 md:grid-cols-2">
                                <select
                                  className="select-shell"
                                  onChange={(event) =>
                                    setPaymentForm((current) => ({
                                      ...current,
                                      plan: event.target.value,
                                      amount:
                                        resolvePlanPrice(event.target.value) ||
                                        current.amount,
                                    }))
                                  }
                                  value={paymentForm.plan}
                                >
                                  {plans.map((plan) => (
                                    <option key={plan.slug} value={plan.slug}>
                                      {plan.name}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  className="input-shell"
                                  min={1}
                                  onChange={(event) =>
                                    setPaymentForm((current) => ({
                                      ...current,
                                      amount: Number(event.target.value) || 0,
                                    }))
                                  }
                                  type="number"
                                  value={paymentForm.amount}
                                />
                              </div>
                              <input
                                className="input-shell"
                                onChange={(event) =>
                                  setPaymentForm((current) => ({
                                    ...current,
                                    cardholder: event.target.value,
                                  }))
                                }
                                placeholder="Cardholder"
                                value={paymentForm.cardholder}
                              />
                              <div className="grid gap-3 md:grid-cols-2">
                                <input
                                  className="input-shell"
                                  onChange={(event) =>
                                    setPaymentForm((current) => ({
                                      ...current,
                                      cardNumber: event.target.value,
                                    }))
                                  }
                                  placeholder="Card number"
                                  value={paymentForm.cardNumber}
                                />
                                <input
                                  className="input-shell"
                                  onChange={(event) =>
                                    setPaymentForm((current) => ({
                                      ...current,
                                      expiry: event.target.value,
                                    }))
                                  }
                                  placeholder="MM/YY"
                                  value={paymentForm.expiry}
                                />
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <button
                                  className="accent-button"
                                  disabled={paymentSubmitting}
                                  type="submit"
                                >
                                  {paymentSubmitting ? "Processing..." : "Pay now"}
                                </button>
                                {paymentMessage ? (
                                  <p className="text-sm text-white/64">
                                    {paymentMessage}
                                  </p>
                                ) : null}
                              </div>
                            </form>
                          </div>

                          <div className="glass-card compact-card">
                            <p className="section-kicker">Payment history</p>
                            <div className="mt-5 overflow-x-auto overflow-y-hidden rounded-[1.5rem] border border-white/8">
                              <div className="table-head grid-cols-[0.8fr_0.8fr_0.8fr_0.8fr]">
                                <span>Plan</span>
                                <span>Brand</span>
                                <span>Last 4</span>
                                <span>Amount</span>
                              </div>
                              <div className="table-body">
                                {clientOverview.payments.map((payment) => (
                                  <div
                                    className="table-row grid-cols-[0.8fr_0.8fr_0.8fr_0.8fr]"
                                    key={payment.id}
                                  >
                                    <span>{payment.planName}</span>
                                    <span>{paymentBrandLabels[payment.cardBrand]}</span>
                                    <span>**** {payment.last4}</span>
                                    <span>{formatMoney(payment.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {clientTab === "support" ? (
                        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                          <div className="space-y-4">
                            <div className="glass-card compact-card">
                              <p className="section-kicker">Activation request</p>
                              <form
                                className="mt-5 grid gap-3"
                                onSubmit={handleActivationSubmit}
                              >
                                <input
                                  className="input-shell"
                                  onChange={(event) =>
                                    setActivationForm((current) => ({
                                      ...current,
                                      company: event.target.value,
                                    }))
                                  }
                                  placeholder="Company"
                                  value={activationForm.company}
                                />
                                <div className="grid gap-3 md:grid-cols-2">
                                  <select
                                    className="select-shell"
                                    onChange={(event) =>
                                      setActivationForm((current) => ({
                                        ...current,
                                        sector: event.target.value,
                                        deviceKey: getDeviceKeyForSector(
                                          event.target.value,
                                        ),
                                      }))
                                    }
                                    value={activationForm.sector}
                                  >
                                    {sectors.map((sector) => (
                                      <option key={sector.slug} value={sector.slug}>
                                        {sector.name}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    className="select-shell"
                                    onChange={(event) =>
                                      setActivationForm((current) => ({
                                        ...current,
                                        deviceKey: event.target.value,
                                      }))
                                    }
                                    value={activationForm.deviceKey}
                                  >
                                    {devices.map((device) => (
                                      <option
                                        key={device.deviceKey}
                                        value={device.deviceKey}
                                      >
                                        {device.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                  <select
                                    className="select-shell"
                                    onChange={(event) =>
                                      setActivationForm((current) => ({
                                        ...current,
                                        plan: event.target.value,
                                      }))
                                    }
                                    value={activationForm.plan}
                                  >
                                    {plans.map((plan) => (
                                      <option key={plan.slug} value={plan.slug}>
                                        {plan.name}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    className="input-shell"
                                    onChange={(event) =>
                                      setActivationForm((current) => ({
                                        ...current,
                                        site: event.target.value,
                                      }))
                                    }
                                    placeholder="Site / branch"
                                    value={activationForm.site}
                                  />
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                  <button
                                    className="accent-button"
                                    disabled={activationSubmitting}
                                    type="submit"
                                  >
                                    {activationSubmitting
                                      ? "Submitting..."
                                      : "Request activation"}
                                  </button>
                                  {activationMessage ? (
                                    <p className="text-sm text-white/64">
                                      {activationMessage}
                                    </p>
                                  ) : null}
                                </div>
                              </form>
                            </div>

                            <div className="glass-card compact-card">
                              <p className="section-kicker">Support ticket</p>
                              <form className="mt-5 grid gap-3" onSubmit={handleTicketSubmit}>
                                <input
                                  className="input-shell"
                                  onChange={(event) =>
                                    setTicketForm((current) => ({
                                      ...current,
                                      company: event.target.value,
                                    }))
                                  }
                                  placeholder="Company"
                                  value={ticketForm.company}
                                />
                                <div className="grid gap-3 md:grid-cols-2">
                                  <input
                                    className="input-shell"
                                    onChange={(event) =>
                                      setTicketForm((current) => ({
                                        ...current,
                                        contactEmail: event.target.value,
                                      }))
                                    }
                                    placeholder="Contact email"
                                    value={ticketForm.contactEmail}
                                  />
                                  <select
                                    className="select-shell"
                                    onChange={(event) =>
                                      setTicketForm((current) => ({
                                        ...current,
                                        priority: event.target.value as TicketFormState["priority"],
                                      }))
                                    }
                                    value={ticketForm.priority}
                                  >
                                    <option value="standard">Standard</option>
                                    <option value="priority">Priority</option>
                                    <option value="critical">Critical</option>
                                  </select>
                                </div>
                                <select
                                  className="select-shell"
                                  onChange={(event) =>
                                    setTicketForm((current) => ({
                                      ...current,
                                      category: event.target.value as TicketFormState["category"],
                                    }))
                                  }
                                  value={ticketForm.category}
                                >
                                  <option value="support">Support</option>
                                  <option value="automation">Automation</option>
                                  <option value="integration">Integration</option>
                                </select>
                                <textarea
                                  className="textarea-shell"
                                  onChange={(event) =>
                                    setTicketForm((current) => ({
                                      ...current,
                                      summary: event.target.value,
                                    }))
                                  }
                                  placeholder="What needs attention?"
                                  rows={3}
                                  value={ticketForm.summary}
                                />
                                <div className="flex flex-wrap items-center gap-3">
                                  <button
                                    className="secondary-button"
                                    disabled={ticketSubmitting}
                                    type="submit"
                                  >
                                    {ticketSubmitting ? "Opening..." : "Open ticket"}
                                  </button>
                                  {ticketMessage ? (
                                    <p className="text-sm text-white/64">
                                      {ticketMessage}
                                    </p>
                                  ) : null}
                                </div>
                              </form>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="glass-card compact-card">
                              <p className="section-kicker">Activation queue</p>
                              <div className="mt-5 space-y-3">
                                {clientOverview.activations.length > 0 ? (
                                  clientOverview.activations.map((activation) => (
                                    <div className="feed-row" key={activation.id}>
                                      <div
                                        className={`status-pill ${activationToneClasses[activation.status]}`}
                                      >
                                        {activation.status}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-white">
                                          {activation.deviceName}
                                        </p>
                                        <p className="mt-1 text-sm text-white/56">
                                          {activation.site} / {activation.planName}
                                        </p>
                                      </div>
                                      <div className="text-xs text-white/42">
                                        {formatLocalDate(activation.createdAt)}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <EmptyCard message="No activation requests yet." />
                                )}
                              </div>
                            </div>

                            <div className="glass-card compact-card">
                              <p className="section-kicker">Support queue</p>
                              <div className="mt-5 space-y-3">
                                {clientOverview.tickets.length > 0 ? (
                                  clientOverview.tickets.map((ticket) => (
                                    <div className="feed-row" key={ticket.id}>
                                      <div
                                        className={`status-pill ${ticketToneClasses[ticket.status]}`}
                                      >
                                        {ticket.status}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-white">
                                          {ticket.category}
                                        </p>
                                        <p className="mt-1 text-sm text-white/56">
                                          {ticket.summary}
                                        </p>
                                      </div>
                                      <div className="text-xs text-white/42">
                                        {formatLocalDate(ticket.createdAt)}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <EmptyCard message="No support tickets are open." />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                  </div>
                </div>
              )}
            </motion.section>
          </>
        ) : null}

        {siteView === "vpn" ? (
          <>
            <motion.section
              className="section-shell"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionMotion}
            >
              <SectionHeading
                eyebrow="VPN center"
                title="Dedicated VPN page for secure network routing"
                copy="This page isolates network controls in one place so VPN mode, region, and language flow are easy to manage before users enter admin or client operations."
              />

              <div className="mt-7 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="glass-card compact-card">
                  <p className="section-kicker">VPN routing profile</p>
                  <div className="mt-5 space-y-4">
                    <div className="segmented-control">
                      <button
                        className={networkMode === "live" ? "segment-active" : ""}
                        onClick={() => setNetworkMode("live")}
                        type="button"
                      >
                        Live
                      </button>
                      <button
                        className={networkMode === "country" ? "segment-active" : ""}
                        onClick={() => setNetworkMode("country")}
                        type="button"
                      >
                        Region route
                      </button>
                      <button
                        className={networkMode === "private" ? "segment-active" : ""}
                        onClick={() => setNetworkMode("private")}
                        type="button"
                      >
                        Private VPN
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <select
                        className="select-shell"
                        onChange={(event) => setSelectedCountry(event.target.value)}
                        value={selectedCountry}
                      >
                        {countryOptions.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.label} ({country.code})
                          </option>
                        ))}
                      </select>
                      <select
                        className="select-shell"
                        onChange={(event) => setSelectedLanguage(event.target.value)}
                        value={selectedLanguage}
                      >
                        {languageOptions.map((language) => (
                          <option key={language.code} value={language.code}>
                            {language.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-sm text-white/64">
                        Active route headers are automatically attached to every API request.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="outline-chip">x-brain-network: {networkMode}</span>
                        <span className="outline-chip">x-brain-country: {activeCountry.code}</span>
                        <span className="outline-chip">
                          x-brain-language: {activeLanguage.code}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="glass-card compact-card">
                    <p className="section-kicker">VPN readiness</p>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div className="data-card compact-card">
                        <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                          Tunnel
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {networkMode === "private" ? "Encrypted" : "Standard"}
                        </p>
                      </div>
                      <div className="data-card compact-card">
                        <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                          Region
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {activeCountry.label}
                        </p>
                      </div>
                      <div className="data-card compact-card">
                        <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                          Locale
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {activeLanguage.label}
                        </p>
                      </div>
                      <div className="data-card compact-card">
                        <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                          Access
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          Ready
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card compact-card">
                    <p className="section-kicker">Next step</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        className="accent-button"
                        onClick={() => openSiteView("system")}
                        type="button"
                      >
                        Open access login
                      </button>
                      {authSession ? (
                        <button
                          className="secondary-button"
                          onClick={() => openSiteView(getRoleHomeView(authSession.user.role))}
                          type="button"
                        >
                          Open my workspace
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </>
        ) : null}
      </main>
      </div>
    </div>
  );
}

export default App;
