import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bell,
  Cpu,
  CreditCard,
  Globe2,
  HardDrive,
  Layers3,
  LogOut,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trash2,
  type LucideIcon,
  Users,
  Workflow,
} from "lucide-react";
import { BrainBrand } from "./components/BrainBrand";
import { BrainScratchCard } from "./components/BrainScratchCard";
import { EmptyCard } from "./components/EmptyCard";
import { GoogleTranslateBridge } from "./components/GoogleTranslateBridge";
import { HelpCenterPage } from "./components/HelpCenterPage";
import { PublicLandingExperience } from "./components/PublicLandingExperience";
import AboutPage from "./components/AboutPage";
import { LandingTopBar } from "./components/LandingTopBar";
import PortalAccountCenter from "./components/PortalAccountCenter";
import { SectorLiveBoard } from "./components/SectorLiveBoard";
import { ClientDashboardOverview } from "./components/dashboard/ClientDashboardOverview";
import {
  countryOptions,
  getFallbackLanguageForCountry,
  languageOptions,
  resolveLanguageCode,
} from "./data/runtimeOptions";
import {
  getLanguageFromCountry,
  getRequestErrorMessage,
  revealScratchCard,
  getScratchCardStats,
  getScratchCardStatus,
  getVpnEndpoints,
  initiateVpnConnection,
  setAuthToken,
  syncRuntimeHeaders,
  terminateVpnConnection,
  updateAuthPassword,
  updateAuthProfile,
  validateScratchCard,
} from "./services/api";
import type {
  ActivationItem,
  AccountItem,
  AdminOverview,
  ClientOverview,
  Device,
  LandingContent,
  OperationsOverview,
  PaymentRecord,
  Plan,
  RuntimeEvent,
  RuntimeMetric,
  Sector,
  ServiceStatus,
  SmartCardItem,
  TicketItem,
} from "./types";

type AuthRole = "admin" | "client";
type AuthMode = "login" | "register";
type LandingView = "overview" | "access" | "sectors" | "devices";

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

type UiMessage = {
  tone: "success" | "error" | "info";
  text: string;
};

type DashboardSidebarItem = {
  target: string;
  label: string;
  detail: string;
  icon: LucideIcon;
  meta: string;
};

type DashboardHelpAction = {
  target: string;
  title: string;
  detail: string;
  icon: LucideIcon;
  status: string;
};

type AdminCardSort = "updated" | "code" | "status";

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

type VpnEndpoint = {
  id: string;
  location: string;
  country: string;
  status: string;
};

type VpnSession = {
  id: string;
  location: string;
  protocol: string;
  encryptionLevel: string;
  status: string;
  issuedAt: string;
};

type ScratchStatus = {
  hasActiveReservation: boolean;
  message: string;
  expiresIn?: number;
  sector?: string;
  plan?: string;
  code?: string;
};

type ScratchStats = {
  totalReveals: number;
  activeReservations: number;
  revealedThisSession: number;
};

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

const emptyLandingContent: LandingContent = {
  source: "fallback",
  hero: {
    eyebrow: "AI device preweb",
    title: "AI devices for retail, business, healthcare, and industry.",
    subtitle:
      "Choose the device, match it to the sector, and move the buyer into access only when the offer is clear.",
    badges: ["Retail", "Business", "Healthcare", "Industry"],
    metrics: [
      { label: "Sectors", value: "4 ready" },
      { label: "Devices", value: "4 models" },
      { label: "Control", value: "Cloud managed" },
    ],
    primaryCta: {
      label: "See devices",
      href: "#landing-devices",
    },
    secondaryCta: {
      label: "Buyer login",
      href: "#auth-access",
    },
    deviceImage: "/brand/brain-hero.svg",
    plansImage: "/brand/brain-plans-showcase.svg",
  },
  sectors: [],
  devices: [],
  plans: [],
  cloudSystem: {
    title: "Support flow",
    summary:
      "Frontend, backend, hardware activation, cards, payments, and service orchestration meet in one flow.",
    highlights: [],
    steps: [],
  },
  integrations: {
    protocols: [],
    platforms: [],
    cloudPartners: [],
  },
};

const emptyScratchStatus: ScratchStatus = {
  hasActiveReservation: false,
  message: "Reveal a scratch card to activate a live code.",
};

const emptyScratchStats: ScratchStats = {
  totalReveals: 0,
  activeReservations: 0,
  revealedThisSession: 0,
};

const STORAGE_KEYS = {
  auth: "brain-auth-session",
  country: "brain-landing-country",
  language: "brain-landing-language",
  guestId: "brain-guest-user-id",
} as const;

const clientPaymentMethods: Array<{
  label: string;
  value: PaymentRecord["paymentMethod"];
}> = [
  { label: "Visa", value: "visa" },
  { label: "Mastercard", value: "mastercard" },
  { label: "American Express", value: "amex" },
  { label: "PayPal", value: "paypal" },
];

const initialLoginForm: LoginFormState = {
  role: "client",
  email: "",
  password: "",
};

const initialRegisterForm: RegisterFormState = {
  name: "",
  email: "",
  password: "",
  company: "",
  sector: "business",
  plan: "free",
};

const activationStatusOrder: ActivationItem["status"][] = [
  "queued",
  "provisioning",
  "live",
];

const ticketStatusOrder: TicketItem["status"][] = [
  "open",
  "investigating",
  "resolved",
];

const landingSectionMap: Record<LandingView, string> = {
  overview: "landing-overview",
  access: "landing-access-page",
  sectors: "preweb-sectors",
  devices: "landing-devices",
};

function readStoredSession() {
  const stored = window.localStorage.getItem(STORAGE_KEYS.auth);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEYS.auth);
    return null;
  }
}

function readStoredCountry() {
  return window.localStorage.getItem(STORAGE_KEYS.country) || "XK";
}

function readStoredLanguage(countryCode: string) {
  return (
    window.localStorage.getItem(STORAGE_KEYS.language) ||
    getFallbackLanguageForCountry(countryCode)
  );
}

function readInitialPublicPath() {
  return window.location.pathname.toLowerCase() || "/";
}

function readInitialLandingView(): LandingView {
  const rawValue = new URLSearchParams(window.location.search).get("view");

  if (
    rawValue === "overview" ||
    rawValue === "access" ||
    rawValue === "sectors" ||
    rawValue === "devices"
  ) {
    return rawValue;
  }

  return "overview";
}

function readInitialSectorSlug() {
  return new URLSearchParams(window.location.search).get("sector") || "";
}

function ensureGuestUserId() {
  const stored = window.localStorage.getItem(STORAGE_KEYS.guestId);

  if (stored) {
    return stored;
  }

  const nextGuestId = `guest-${crypto.randomUUID()}`;
  window.localStorage.setItem(STORAGE_KEYS.guestId, nextGuestId);
  return nextGuestId;
}

function applyLanguageSelection(languageCode: string) {
  window.localStorage.setItem(STORAGE_KEYS.language, languageCode);
  document.documentElement.lang = languageCode;
}

function formatSystemDate(value?: string | null) {
  if (!value) {
    return "No timestamp";
  }

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSystemMoney(value: number) {
  return `EUR ${Number(value || 0).toLocaleString("en-GB")}`;
}

function formatScratchExpiry(expiresIn?: number) {
  if (!expiresIn || expiresIn <= 0) {
    return "Session code waits for validation.";
  }

  const minutes = Math.max(1, Math.ceil(expiresIn / 60000));
  return `Expires in about ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

function statusBadgeClass(status: ServiceStatus["status"]) {
  if (status === "online") {
    return "border-emerald-400/25 bg-emerald-400/12 text-emerald-200";
  }

  if (status === "ready") {
    return "border-slate-300/20 bg-slate-400/10 text-slate-100";
  }

  return "border-amber-400/25 bg-amber-400/12 text-amber-200";
}

function eventBadgeClass(status: RuntimeEvent["status"]) {
  if (status === "success") {
    return "border-emerald-400/25 bg-emerald-400/12 text-emerald-200";
  }

  if (status === "warning") {
    return "border-amber-400/25 bg-amber-400/12 text-amber-200";
  }

  return "border-slate-300/20 bg-slate-400/10 text-slate-100";
}

function smartCardStatusClass(
  status: SmartCardItem["status"] | PaymentRecord["linkedCardStatus"],
) {
  if (status === "activated") {
    return "border-emerald-400/25 bg-emerald-400/12 text-emerald-200";
  }

  if (status === "assigned") {
    return "border-amber-400/25 bg-amber-400/12 text-amber-200";
  }

  return "border-slate-300/20 bg-slate-400/10 text-slate-100";
}

function smartCardStatusCopy(
  status: SmartCardItem["status"] | PaymentRecord["linkedCardStatus"],
) {
  if (status === "activated") {
    return "Live in workspace";
  }

  if (status === "assigned") {
    return "Ready for activation";
  }

  return "Available for linking";
}

function paymentStatusClass(status: PaymentRecord["status"]) {
  if (status === "approved") {
    return "border-emerald-400/25 bg-emerald-400/12 text-emerald-200";
  }

  if (status === "rejected") {
    return "border-red-400/25 bg-red-500/12 text-red-200";
  }

  return "border-amber-400/25 bg-amber-400/12 text-amber-100";
}

function paymentStatusCopy(status: PaymentRecord["status"]) {
  if (status === "approved") {
    return "Approved";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  return "Pending admin";
}

function paymentMethodLabel(method: PaymentRecord["paymentMethod"]) {
  if (method === "mastercard") {
    return "Mastercard";
  }

  if (method === "amex") {
    return "American Express";
  }

  if (method === "paypal") {
    return "PayPal";
  }

  return "Visa";
}

function resolveDeviceKeyForSector(sector?: string | null) {
  if (sector === "commercial") {
    return "ai-stick";
  }

  if (sector === "healthcare") {
    return "med-assistant";
  }

  if (sector === "industry") {
    return "industry-edge";
  }

  return "business-hub";
}

const LIGHT_MODE_ACCENT = "#d45a34";

function getThemeAccent(accent?: string, lightMode = false) {
  if (lightMode) {
    return LIGHT_MODE_ACCENT;
  }

  return accent;
}

function getSectorBadgeStyle(accent?: string, lightMode = false) {
  const themeAccent = getThemeAccent(accent, lightMode);

  if (!themeAccent) {
    return undefined;
  }

  return {
    borderColor: `${themeAccent}55`,
    backgroundColor: lightMode ? `${themeAccent}14` : `${themeAccent}18`,
    color: lightMode ? "#111111" : "#ffe7dc",
  };
}

function getSectorPanelStyle(accent?: string, lightMode = false) {
  const themeAccent = getThemeAccent(accent, lightMode);

  if (!themeAccent) {
    return undefined;
  }

  return {
    borderColor: `${themeAccent}44`,
    backgroundColor: lightMode ? `${themeAccent}10` : `${themeAccent}12`,
  };
}

function nextActivationStatus(
  currentStatus: ActivationItem["status"],
): ActivationItem["status"] {
  const currentIndex = activationStatusOrder.indexOf(currentStatus);
  return activationStatusOrder[Math.min(currentIndex + 1, 2)] || "live";
}

function nextTicketStatus(
  currentStatus: TicketItem["status"],
): TicketItem["status"] {
  const currentIndex = ticketStatusOrder.indexOf(currentStatus);
  return ticketStatusOrder[Math.min(currentIndex + 1, 2)] || "resolved";
}

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [publicPath] = useState(() => readInitialPublicPath());
  const [landingView, setLandingView] = useState<LandingView>(() =>
    readInitialLandingView(),
  );
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginForm);
  const [registerForm, setRegisterForm] =
    useState<RegisterFormState>(initialRegisterForm);
  const [authSession, setAuthSession] = useState<AuthSession | null>(() =>
    readStoredSession(),
  );
  const [authMessage, setAuthMessage] = useState<UiMessage | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [vpnMessage, setVpnMessage] = useState<UiMessage | null>(null);
  const [vpnSubmitting, setVpnSubmitting] = useState(false);
  const [vpnEndpoints, setVpnEndpoints] = useState<VpnEndpoint[]>([]);
  const [vpnSession, setVpnSession] = useState<VpnSession | null>(null);
  const [selectedEndpointId, setSelectedEndpointId] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(() =>
    readStoredCountry(),
  );
  const [selectedLanguage, setSelectedLanguage] = useState(() =>
    readStoredLanguage(readStoredCountry()),
  );
  const [landingContent, setLandingContent] =
    useState<LandingContent>(emptyLandingContent);
  const [contentLoading, setContentLoading] = useState(false);
  const [activeSectorSlug, setActiveSectorSlug] = useState(() =>
    readInitialSectorSlug(),
  );
  const [systemLoading, setSystemLoading] = useState(false);
  const [systemMessage, setSystemMessage] = useState<UiMessage | null>(null);
  const [operationsOverview, setOperationsOverview] =
    useState<OperationsOverview>(emptyOperations);
  const [adminOverview, setAdminOverview] =
    useState<AdminOverview>(emptyAdminOverview);
  const [clientOverview, setClientOverview] =
    useState<ClientOverview>(emptyClientOverview);
  const [scratchStatus, setScratchStatus] =
    useState<ScratchStatus>(emptyScratchStatus);
  const [scratchStats, setScratchStats] =
    useState<ScratchStats>(emptyScratchStats);
  const [scratchCodeInput, setScratchCodeInput] = useState("");
  const [scratchBusy, setScratchBusy] = useState(false);
  const [scratchMessage, setScratchMessage] = useState<UiMessage | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastBusy, setBroadcastBusy] = useState(false);
  const [actionBusyKey, setActionBusyKey] = useState("");
  const [selectedAdminCardPlan, setSelectedAdminCardPlan] = useState("business");
  const [adminCardSort, setAdminCardSort] = useState<AdminCardSort>("updated");
  const [selectedClientPlanSlug, setSelectedClientPlanSlug] = useState("free");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentRecord["paymentMethod"]>("visa");
  const [paymentCardholder, setPaymentCardholder] = useState("");
  const [paymentCardNumber, setPaymentCardNumber] = useState("");
  const [paymentExpiry, setPaymentExpiry] = useState("");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<UiMessage | null>(null);
  const [profileSaveBusy, setProfileSaveBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState<UiMessage | null>(null);
  const [passwordSaveBusy, setPasswordSaveBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<UiMessage | null>(null);
  const [activeDashboardSection, setActiveDashboardSection] =
    useState("system-overview");
  // Force light mode only and remove dark mode from the public UI.
  const isDarkMode = false;
  const lastClientAccountKeyRef = useRef("");

  const selectedCountryOption =
    countryOptions.find((country) => country.code === selectedCountry) ??
    countryOptions[0];
  const selectedLanguageOption =
    languageOptions.find((language) => language.code === selectedLanguage) ??
    languageOptions[0];
  const isHelpCenterPage = !authSession && publicPath === "/help";
  const isAboutPage = !authSession && publicPath === "/about";
  const showLandingAccessPage = !authSession && landingView === "access";

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.country, selectedCountry);
  }, [selectedCountry]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.language, selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const themeClassNames = ["app-theme-landing", "app-theme-admin", "app-theme-client"];
    const nextThemeClass = authSession
      ? `app-theme-${authSession.user.role}`
      : "app-theme-landing";

    html.classList.toggle("app-light-mode", !isDarkMode);
    body.classList.toggle("app-light-mode", !isDarkMode);
    html.classList.remove(...themeClassNames);
    body.classList.remove(...themeClassNames);
    html.classList.add(nextThemeClass);
    body.classList.add(nextThemeClass);

    return () => {
      html.classList.remove("app-light-mode", ...themeClassNames);
      body.classList.remove("app-light-mode", ...themeClassNames);
    };
  }, [authSession, isDarkMode]);

  useEffect(() => {
    if (authSession) {
      window.localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(authSession));
      setAuthToken(authSession.token);
      return;
    }

    setAuthToken(null);
    window.localStorage.removeItem(STORAGE_KEYS.auth);
    setAdminOverview(emptyAdminOverview);
    setClientOverview(emptyClientOverview);
    setScratchCodeInput("");
    setScratchMessage(null);
    setPaymentMessage(null);
    setProfileMessage(null);
    setPasswordMessage(null);
    lastClientAccountKeyRef.current = "";
  }, [authSession]);

  useEffect(() => {
    if (!landingContent.plans.length) {
      return;
    }

    if (!landingContent.plans.some((plan) => plan.slug === selectedAdminCardPlan)) {
      setSelectedAdminCardPlan(landingContent.plans[0]?.slug || "business");
    }

    if (!landingContent.plans.some((plan) => plan.slug === selectedClientPlanSlug)) {
      setSelectedClientPlanSlug(
        clientOverview.account?.plan || landingContent.plans[0]?.slug || "free",
      );
    }
  }, [
    clientOverview.account?.plan,
    landingContent.plans,
    selectedAdminCardPlan,
    selectedClientPlanSlug,
  ]);

  useEffect(() => {
    const accountCompany = clientOverview.account?.company;
    const accountPlan = clientOverview.account?.plan;

    if (!accountCompany || !accountPlan) {
      return;
    }

    const nextAccountKey = `${accountCompany}:${accountPlan}`;

    if (lastClientAccountKeyRef.current === nextAccountKey) {
      return;
    }

    lastClientAccountKeyRef.current = nextAccountKey;
    setSelectedClientPlanSlug(accountPlan);
    setScratchMessage(null);
    setPaymentMessage(null);
  }, [clientOverview.account?.company, clientOverview.account?.plan]);

  useEffect(() => {
    const networkMode = vpnSession ? "private" : "country";
    const networkLabel = vpnSession
      ? `vpn:${vpnSession.location}`
      : `country:${selectedCountry}`;

    syncRuntimeHeaders({
      language: selectedLanguage,
      country: selectedCountry,
      networkLabel,
      networkMode,
    });
  }, [selectedCountry, selectedLanguage, vpnSession]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapRuntime() {
      try {
        const [vpnData, contentResponse, operationsResponse] = await Promise.all([
          getVpnEndpoints(),
          axios.get("/api/content"),
          axios.get("/api/operations/overview"),
        ]);

        if (cancelled) {
          return;
        }

        const endpoints = Array.isArray(vpnData.endpoints)
          ? (vpnData.endpoints as VpnEndpoint[])
          : [];

        const nextContent = (contentResponse.data ??
          emptyLandingContent) as LandingContent;

        setVpnEndpoints(endpoints);
        setSelectedEndpointId((current) => current || endpoints[0]?.id || "");
        setLandingContent(nextContent);
        setOperationsOverview(
          (operationsResponse.data ?? emptyOperations) as OperationsOverview,
        );
        setActiveSectorSlug((current) => current || nextContent.sectors[0]?.slug || "");
      } catch (error) {
        if (!cancelled) {
          setVpnMessage({
            tone: "error",
            text: getRequestErrorMessage(
              error,
              "Runtime endpoints could not be loaded.",
            ),
          });
        }
      } finally {
        if (!cancelled) {
          setContentLoading(false);
        }
      }
    }

    setContentLoading(true);
    void bootstrapRuntime();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authSession) {
      return;
    }

    void loadSystemOverview(authSession);
  }, [authSession]);

  useEffect(() => {
    setActiveDashboardSection("system-overview");
  }, [authSession?.user.role]);

  const authStatusText = useMemo(() => {
    if (!authSession) {
      return "No active workspace session.";
    }

    return `${authSession.user.name} is connected to the workspace.`;
  }, [authSession]);

  const currentUserLabel = authSession?.user.company || "Guest access route";
  const vpnActive = Boolean(vpnSession);

  const primaryMetrics = useMemo(() => {
    if (!authSession) {
      return operationsOverview.metrics.slice(0, 4);
    }

    const roleMetrics =
      authSession.user.role === "admin"
        ? adminOverview.adminMetrics
        : clientOverview.quickMetrics;

    return roleMetrics.length > 0 ? roleMetrics : operationsOverview.metrics.slice(0, 4);
  }, [adminOverview.adminMetrics, authSession, clientOverview.quickMetrics, operationsOverview.metrics]);

  const activeSector = useMemo(() => {
    return (
      landingContent.sectors.find((sector) => sector.slug === activeSectorSlug) ??
      landingContent.sectors[0] ??
      null
    );
  }, [activeSectorSlug, landingContent.sectors]);

  const activeDevice = useMemo(() => {
    if (!activeSector) {
      return null;
    }

    return (
      landingContent.devices.find(
        (device) => device.deviceKey === activeSector.deviceKey,
      ) ??
      landingContent.devices.find(
        (device) => device.sectorSlug === activeSector.slug,
      ) ??
      null
    );
  }, [activeSector, landingContent.devices]);

  const sectorRuntimeCards = useMemo(() => {
    if (!activeSector) {
      return [];
    }

    const matchingPlans = landingContent.plans.slice(0, 2);

    return [
      {
        label: "Audience",
        value: activeSector.audience,
      },
      {
        label: activeSector.statLabel,
        value: activeSector.statValue,
      },
      {
        label: "Recommended plans",
        value: matchingPlans.map((plan) => plan.name).join(" / ") || "Business",
      },
    ];
  }, [activeSector, landingContent.plans]);

  const heroBadges = useMemo(() => {
    if (landingContent.sectors.length > 0) {
      return landingContent.sectors.slice(0, 4).map((sector) => sector.name);
    }

    return landingContent.hero.badges.length > 0
      ? landingContent.hero.badges.slice(0, 4)
      : ["Retail", "Business", "Healthcare", "Industry"];
  }, [landingContent.hero.badges, landingContent.sectors]);

  const heroMetrics = useMemo(() => {
    if (activeDevice?.metrics.length) {
      return activeDevice.metrics.slice(0, 3);
    }

    if (landingContent.hero.metrics.length > 0) {
      return landingContent.hero.metrics.slice(0, 3);
    }

    return [
      { label: "Sectors", value: `${landingContent.sectors.length || 4} ready` },
      { label: "Devices", value: `${landingContent.devices.length || 4} models` },
      { label: "Control", value: "Cloud managed" },
    ];
  }, [activeDevice, landingContent.devices.length, landingContent.hero.metrics, landingContent.sectors.length]);

  const sectorSummaries = useMemo(() => {
    const accounts =
      authSession?.user.role === "admin"
        ? adminOverview.accounts
        : clientOverview.account
          ? [clientOverview.account]
          : [];

    return landingContent.sectors.map((sector) => {
      const linkedAccounts = accounts.filter((account) => account.sector === sector.slug);
      const sectorDevices = landingContent.devices.filter(
        (device) => device.sectorSlug === sector.slug,
      );

      return {
        slug: sector.slug,
        name: sector.name,
        accounts: linkedAccounts.length,
        devices: sectorDevices.length,
      };
    });
  }, [
    adminOverview.accounts,
    authSession?.user.role,
    clientOverview.account,
    landingContent.devices,
    landingContent.sectors,
  ]);

  const clientSector = useMemo(() => {
    const sectorSlug =
      clientOverview.account?.sector ??
      (authSession?.user.role === "client" ? authSession.user.sector : null) ??
      activeSector?.slug ??
      null;

    if (!sectorSlug) {
      return null;
    }

    return landingContent.sectors.find((sector) => sector.slug === sectorSlug) ?? null;
  }, [
    activeSector?.slug,
    authSession?.user.role,
    authSession?.user.sector,
    clientOverview.account?.sector,
    landingContent.sectors,
  ]);

  const selectedClientPlan = useMemo(() => {
    return (
      landingContent.plans.find((plan) => plan.slug === selectedClientPlanSlug) ??
      landingContent.plans.find((plan) => plan.slug === clientOverview.account?.plan) ??
      landingContent.plans.find((plan) => plan.slug === "free") ??
      landingContent.plans[0] ??
      null
    );
  }, [clientOverview.account?.plan, landingContent.plans, selectedClientPlanSlug]);

  const clientPlanPayments = useMemo(() => {
    if (!selectedClientPlan) {
      return [];
    }

    return clientOverview.payments.filter(
      (payment) => payment.plan === selectedClientPlan.slug,
    );
  }, [clientOverview.payments, selectedClientPlan]);

  const planScopedPayment = clientPlanPayments[0] ?? null;

  const pendingPlanPayment = useMemo(() => {
    return clientPlanPayments.find((payment) => payment.status === "pending") ?? null;
  }, [clientPlanPayments]);

  const approvedPlanPayment = useMemo(() => {
    return clientPlanPayments.find((payment) => payment.status === "approved") ?? null;
  }, [clientPlanPayments]);

  const latestRejectedPlanPayment =
    planScopedPayment?.status === "rejected" ? planScopedPayment : null;

  const clientCardsForSelectedPlan = useMemo(() => {
    const statusRank: Record<SmartCardItem["status"], number> = {
      activated: 0,
      assigned: 1,
      available: 2,
    };

    const sortedCards = [...clientOverview.smartCards].sort((left, right) => {
      const statusGap = statusRank[left.status] - statusRank[right.status];

      if (statusGap !== 0) {
        return statusGap;
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });

    if (!selectedClientPlan) {
      return sortedCards;
    }

    return sortedCards.filter((card) => card.plan === selectedClientPlan.slug);
  }, [clientOverview.smartCards, selectedClientPlan]);

  const selectedPlanSmartCard = clientCardsForSelectedPlan[0] ?? null;
  const hasLinkedSelectedPlanAccess = Boolean(approvedPlanPayment || selectedPlanSmartCard);

  const pendingClientPaymentsCount = useMemo(
    () => clientOverview.payments.filter((payment) => payment.status === "pending").length,
    [clientOverview.payments],
  );

  const clientAccessCardStyle = useMemo(() => {
    const accent = getThemeAccent(
      clientSector?.accent ?? activeSector?.accent ?? LIGHT_MODE_ACCENT,
      !isDarkMode,
    );

    return {
      borderColor: `${accent}36`,
      background: !isDarkMode
        ? `linear-gradient(180deg, ${accent}10 0%, rgba(255,255,255,0.98) 22%, rgba(255,255,255,0.96) 100%)`
        : `linear-gradient(180deg, ${accent}14 0%, rgba(5,11,21,0.94) 22%, rgba(4,10,8,0.96) 100%)`,
      boxShadow: !isDarkMode
        ? "0 18px 44px rgba(0,0,0,0.08)"
        : `0 22px 65px ${accent}20`,
    };
  }, [activeSector?.accent, clientSector?.accent, isDarkMode]);

  const activeScratchCode = (
    scratchCodeInput.trim() ||
    scratchStatus.code?.trim() ||
    ""
  ).toUpperCase();
  const freePlanCardRevealed = Boolean(activeScratchCode) || scratchBusy;
  const clientAccessStateLabel =
    selectedClientPlan?.slug === "free"
      ? activeScratchCode
        ? "Code ready"
        : "Free access"
      : pendingPlanPayment
        ? "Pending admin"
        : hasLinkedSelectedPlanAccess
          ? selectedPlanSmartCard?.status === "activated"
            ? "Card active"
            : "Access linked"
          : latestRejectedPlanPayment
            ? "Retry request"
            : "Request needed";
  const petAdviceCopy =
    selectedClientPlan?.slug === "free"
      ? activeScratchCode
        ? `${activeScratchCode} is ready for this workspace. Validate it directly from the card.`
        : "Generate the free access code here and validate it from the same workspace."
      : pendingPlanPayment
        ? "Your managed request is waiting for approval. This view stays focused on payment and access status."
      : hasLinkedSelectedPlanAccess
        ? "This plan already has linked SC access, so this view stays focused on status and activation."
        : latestRejectedPlanPayment
          ? "The latest managed request was rejected. Update the billing details and send it again."
          : "This view keeps request status, payment state, and linked access in one place.";

  const adminCardsForSelectedPlan = useMemo(() => {
    const filteredCards = adminOverview.smartCards.filter(
      (card) => card.plan === selectedAdminCardPlan,
    );

    const statusRank: Record<SmartCardItem["status"], number> = {
      assigned: 0,
      available: 1,
      activated: 2,
    };

    return [...filteredCards].sort((left, right) => {
      if (adminCardSort === "code") {
        return left.code.localeCompare(right.code);
      }

      if (adminCardSort === "status") {
        const statusGap = statusRank[left.status] - statusRank[right.status];
        return statusGap !== 0
          ? statusGap
          : right.updatedAt.localeCompare(left.updatedAt);
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });
  }, [adminCardSort, adminOverview.smartCards, selectedAdminCardPlan]);

  const adminPaymentsForReview = useMemo(() => {
    const statusRank: Record<PaymentRecord["status"], number> = {
      pending: 0,
      approved: 1,
      rejected: 2,
    };

    return [...adminOverview.payments].sort((left, right) => {
      const statusGap = statusRank[left.status] - statusRank[right.status];
      return statusGap !== 0
        ? statusGap
        : right.createdAt.localeCompare(left.createdAt);
    });
  }, [adminOverview.payments]);

  const approvedAdminPayments = useMemo(
    () => adminOverview.payments.filter((payment) => payment.status === "approved"),
    [adminOverview.payments],
  );

  const pendingAdminPayments = useMemo(
    () => adminOverview.payments.filter((payment) => payment.status === "pending"),
    [adminOverview.payments],
  );

  const rejectedAdminPayments = useMemo(
    () => adminOverview.payments.filter((payment) => payment.status === "rejected"),
    [adminOverview.payments],
  );

  const sectorControlRows = useMemo(() => {
    return landingContent.sectors.map((sector) => {
      const accounts = adminOverview.accounts.filter((account) => account.sector === sector.slug);
      const cards = adminOverview.smartCards.filter((card) => card.sector === sector.slug);
      const devices = landingContent.devices.filter(
        (device) => device.sectorSlug === sector.slug,
      );

      return {
        ...sector,
        accounts: accounts.length,
        devices: devices.length,
        availableCards: cards.filter((card) => card.status === "available").length,
        assignedCards: cards.filter((card) => card.status === "assigned").length,
        activatedCards: cards.filter((card) => card.status === "activated").length,
        primaryDevice: devices[0]?.name ?? "brAIn device",
      };
    });
  }, [adminOverview.accounts, adminOverview.smartCards, landingContent.devices, landingContent.sectors]);
  const adminRolloutTotals = useMemo(() => {
    return sectorControlRows.reduce(
      (totals, sector) => ({
        accounts: totals.accounts + sector.accounts,
        activatedCards: totals.activatedCards + sector.activatedCards,
        assignedCards: totals.assignedCards + sector.assignedCards,
        availableCards: totals.availableCards + sector.availableCards,
        devices: totals.devices + sector.devices,
      }),
      {
        accounts: 0,
        activatedCards: 0,
        assignedCards: 0,
        availableCards: 0,
        devices: 0,
      },
    );
  }, [sectorControlRows]);
  const adminRolloutRows = useMemo(() => {
    return sectorControlRows
      .map((sector) => {
        const stageLabel =
          sector.activatedCards > 0
            ? "Live lane"
            : sector.assignedCards > 0
              ? "Queued lane"
              : sector.availableCards > 0
                ? "Ready inventory"
                : "Monitor lane";

        return {
          ...sector,
          stageLabel,
        };
      })
      .sort((left, right) => {
        if (right.activatedCards !== left.activatedCards) {
          return right.activatedCards - left.activatedCards;
        }

        if (right.assignedCards !== left.assignedCards) {
          return right.assignedCards - left.assignedCards;
        }

        if (right.accounts !== left.accounts) {
          return right.accounts - left.accounts;
        }

        return left.name.localeCompare(right.name);
      });
  }, [sectorControlRows]);
  const adminRolloutSummaryCards = useMemo(
    () => [
      {
        detail: `${adminRolloutTotals.accounts} accounts in rollout scope`,
        label: "Lanes",
        value: String(sectorControlRows.length),
      },
      {
        detail: `${adminRolloutTotals.availableCards} cards ready for assignment`,
        label: "Inventory",
        value: `${adminRolloutTotals.availableCards} ready`,
      },
      {
        detail: `${adminRolloutTotals.assignedCards} cards already queued`,
        label: "Assigned",
        value: `${adminRolloutTotals.assignedCards} queued`,
      },
      {
        detail: `${adminRolloutTotals.devices} device views across sectors`,
        label: "Live cards",
        value: `${adminRolloutTotals.activatedCards} active`,
      },
    ],
    [adminRolloutTotals, sectorControlRows.length],
  );
  const adminOrganizationSummaryCards = useMemo(() => {
    const totalDevices = adminOverview.accounts.reduce((sum, account) => sum + account.devices, 0);
    const totalCards = adminOverview.accounts.reduce((sum, account) => sum + account.smartCards, 0);
    const totalSales = adminOverview.accounts.reduce((sum, account) => sum + account.salesToday, 0);
    const coverageGapAccounts = adminOverview.accounts.filter(
      (account) => account.smartCards < account.devices,
    ).length;

    return [
      {
        detail: `${coverageGapAccounts} accounts still need more SC coverage`,
        label: "Organizations",
        value: String(adminOverview.accounts.length),
      },
      {
        detail: `${totalCards} SC cards already linked across accounts`,
        label: "Devices",
        value: totalDevices.toLocaleString("en-GB"),
      },
      {
        detail: `${totalDevices} active device endpoints in scope`,
        label: "Linked cards",
        value: totalCards.toLocaleString("en-GB"),
      },
      {
        detail: `${approvedAdminPayments.length} approved payments already live`,
        label: "Sales today",
        value: formatSystemMoney(totalSales),
      },
    ];
  }, [adminOverview.accounts, approvedAdminPayments.length]);
  const adminOrganizationPriorityAccounts = useMemo(() => {
    return adminOverview.accounts
      .map((account) => ({
        ...account,
        coverageGap: Math.max(account.devices - account.smartCards, 0),
      }))
      .sort((left, right) => {
        if (right.coverageGap !== left.coverageGap) {
          return right.coverageGap - left.coverageGap;
        }

        if (right.salesToday !== left.salesToday) {
          return right.salesToday - left.salesToday;
        }

        if (right.devices !== left.devices) {
          return right.devices - left.devices;
        }

        return left.company.localeCompare(right.company);
      })
      .slice(0, 6);
  }, [adminOverview.accounts]);
  const adminOrganizationPlanMix = useMemo(() => {
    return Object.entries(
      adminOverview.accounts.reduce<Record<string, number>>((accumulator, account) => {
        accumulator[account.planName] = (accumulator[account.planName] ?? 0) + 1;
        return accumulator;
      }, {}),
    )
      .map(([label, count]) => ({ count, label }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 4);
  }, [adminOverview.accounts]);
  const adminOrganizationSectorMix = useMemo(() => {
    return Object.entries(
      adminOverview.accounts.reduce<Record<string, number>>((accumulator, account) => {
        accumulator[account.sectorLabel] = (accumulator[account.sectorLabel] ?? 0) + 1;
        return accumulator;
      }, {}),
    )
      .map(([label, count]) => ({ count, label }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 4);
  }, [adminOverview.accounts]);

  const dashboardSidebarItems = useMemo<DashboardSidebarItem[]>(() => {
    if (!authSession) {
      return [];
    }

    if (authSession.user.role === "admin") {
      return [
        {
          target: "system-overview",
          label: "Overview",
          detail: "Current status, quick actions, and live totals.",
          icon: Sparkles,
          meta: `${primaryMetrics.length} live tiles`,
        },
        {
          target: "system-account",
          label: "Account",
          detail: "Profile, security, and workspace identity.",
          icon: Users,
          meta: authSession.user.name,
        },
        {
          target: "system-operations",
          label: "Operations",
          detail: "Runtime services, activity, and updates.",
          icon: Workflow,
          meta: `${operationsOverview.timeline.length} events`,
        },
        {
          target: "system-payments",
          label: "Payments",
          detail: "Review managed requests and unblock rollout.",
          icon: CreditCard,
          meta: `${pendingAdminPayments.length} pending`,
        },
        {
          target: "system-cards",
          label: "SC cards",
          detail: "Track inventory, assignment, and activation.",
          icon: ShieldCheck,
          meta: `${adminOverview.smartCards.length} cards`,
        },
        {
          target: "system-device-control",
          label: "Rollout",
          detail: "Review device rollout by sector.",
          icon: Cpu,
          meta: `${sectorControlRows.length} sectors`,
        },
        {
          target: "system-sectors",
          label: "Sectors",
          detail: "Compare sector fit and deployment context.",
          icon: Layers3,
          meta: `${landingContent.sectors.length} lanes`,
        },
        {
          target: "system-role",
          label: "Support",
          detail: "Manage tickets, uploads, and updates.",
          icon: Ticket,
          meta: `${adminOverview.tickets.length} tickets`,
        },
      ];
    }

    return [
      {
        target: "system-overview",
        label: "Overview",
        detail: "Workspace status and refresh actions.",
        icon: Sparkles,
        meta: `${primaryMetrics.length} live tiles`,
      },
      {
        target: "client-account",
        label: "Account",
        detail: "Profile, password, and plan controls.",
        icon: Users,
        meta: authSession.user.name,
      },
      {
        target: "client-plan-board",
        label: "Access",
        detail: "Choose plan and continue the access flow.",
        icon: Layers3,
        meta: selectedClientPlan?.name ?? "Choose plan",
      },
      {
        target: "client-validate",
        label: "Validation",
        detail: "Generate or validate the current SC code.",
        icon: ShieldCheck,
        meta:
          activeScratchCode ||
          (selectedClientPlan?.slug === "free" ? "Free access" : "Managed request"),
      },
      {
        target: "client-billing",
        label: "Billing",
        detail: "Track requests, payments, and linked access.",
        icon: CreditCard,
        meta: `${pendingClientPaymentsCount} pending`,
      },
      {
        target: "client-sectors",
        label: "Deployment",
        detail: "Review sector fit and device context.",
        icon: Cpu,
        meta: clientSector?.name ?? "Workspace lane",
      },
      {
        target: "system-role",
        label: "Support",
        detail: "Account summary and ticket history.",
        icon: Ticket,
        meta: `${clientOverview.tickets.length} tickets`,
      },
    ];
  }, [
    activeScratchCode,
    adminOverview.smartCards.length,
    adminOverview.tickets.length,
    authSession,
    clientOverview.tickets.length,
    clientSector?.name,
    landingContent.sectors.length,
    operationsOverview.timeline.length,
    pendingAdminPayments.length,
    pendingClientPaymentsCount,
    primaryMetrics.length,
    sectorControlRows.length,
    selectedClientPlan?.name,
    selectedClientPlan?.slug,
  ]);

  const activeDashboardItem = useMemo(() => {
    return (
      dashboardSidebarItems.find((item) => item.target === activeDashboardSection) ??
      dashboardSidebarItems[0] ??
      null
    );
  }, [activeDashboardSection, dashboardSidebarItems]);

  const showAdminOperationsPanel = activeDashboardSection === "system-operations";
  const showAdminRolloutPanel = activeDashboardSection === "system-device-control";
  const showAdminPaymentsPanel = activeDashboardSection === "system-payments";
  const showAdminCardsPanel = activeDashboardSection === "system-cards";
  const showAdminSectorsPanel = activeDashboardSection === "system-sectors";
  const showAdminAccountPanel = activeDashboardSection === "system-account";
  const showAdminSupportPanel = activeDashboardSection === "system-role";
  const showClientAccountPanel = activeDashboardSection === "client-account";
  const showClientAccessPanel =
    activeDashboardSection === "client-plan-board" ||
    activeDashboardSection === "client-validate";
  const showClientBillingPanel = activeDashboardSection === "client-billing";
  const showClientDeploymentPanel = activeDashboardSection === "client-sectors";
  const showClientSupportPanel = activeDashboardSection === "system-role";

  const dashboardHelpActions = useMemo<DashboardHelpAction[]>(() => {
    if (!authSession) {
      return [];
    }

    if (authSession.user.role === "admin") {
      return [
        {
          target: "system-payments",
          title:
            pendingAdminPayments.length > 0
              ? `Review ${pendingAdminPayments.length} pending payment${
                  pendingAdminPayments.length === 1 ? "" : "s"
                }`
              : "Payment queue is clear",
          detail:
            pendingAdminPayments.length > 0
              ? "Managed requests are waiting for approval or rejection."
              : "No approvals are waiting right now.",
          icon: CreditCard,
          status: pendingAdminPayments.length > 0 ? "Needs action" : "Up to date",
        },
        {
          target: "system-cards",
          title: "Check SC inventory",
          detail: `${adminOverview.smartCardStats.available} cards are still available for linking.`,
          icon: ShieldCheck,
          status: adminOverview.smartCards.length > 0 ? "Live stock" : "No cards",
        },
        {
          target: "system-role",
          title: "Follow support and broadcasts",
          detail: `${adminOverview.tickets.length} tickets and ${operationsOverview.notifications.length} notifications are visible.`,
          icon: Ticket,
          status: adminOverview.tickets.length > 0 ? "Open tickets" : "Stable",
        },
      ];
    }

    return [
      {
        target: "client-plan-board",
        title:
          selectedClientPlan?.slug === "free"
            ? "Open your access plan"
            : hasLinkedSelectedPlanAccess
              ? `${selectedClientPlan?.name ?? "Managed"} access linked`
              : latestRejectedPlanPayment
                ? `Retry ${selectedClientPlan?.name ?? "managed"} request`
                : `Continue ${selectedClientPlan?.name ?? "managed"} request`,
        detail:
          selectedClientPlan?.slug === "free"
            ? "Free activation starts from the access card below."
            : pendingPlanPayment
              ? "Your managed request is waiting for admin approval."
              : hasLinkedSelectedPlanAccess
                ? "A linked SC card is already attached to this plan for the current workspace."
                : latestRejectedPlanPayment
                  ? "The latest request was rejected, so you can review details and send it again."
                  : "Pick a plan and send it for admin review.",
        icon: Layers3,
        status:
          selectedClientPlan?.slug === "free"
            ? "Instant path"
            : hasLinkedSelectedPlanAccess
              ? "Access linked"
              : latestRejectedPlanPayment
                ? "Retry ready"
                : "Managed flow",
      },
      {
        target: "client-validate",
        title: activeScratchCode ? `Validate ${activeScratchCode}` : "Generate SC code",
        detail:
          activeScratchCode
            ? "Your code is ready for validation."
            : "Use the validation card to generate or confirm access.",
        icon: ShieldCheck,
        status: activeScratchCode ? "Ready now" : "Waiting",
      },
      {
        target: "client-billing",
        title: "Review billing status",
        detail:
          pendingClientPaymentsCount > 0
            ? `${pendingClientPaymentsCount} payment request${
                pendingClientPaymentsCount === 1 ? "" : "s"
              } still waiting for admin action.`
            : "No billing requests are blocked right now.",
        icon: CreditCard,
        status: pendingClientPaymentsCount > 0 ? "Pending review" : "Clear",
      },
    ];
  }, [
    activeScratchCode,
    adminOverview.smartCardStats.available,
    adminOverview.smartCards.length,
    adminOverview.tickets.length,
    authSession,
    operationsOverview.notifications.length,
    pendingAdminPayments.length,
    pendingClientPaymentsCount,
    hasLinkedSelectedPlanAccess,
    latestRejectedPlanPayment,
    pendingPlanPayment,
    selectedClientPlan?.name,
    selectedClientPlan?.slug,
  ]);

  const workspaceSidebarStats = useMemo<Array<{ label: string; value: string }>>(() => {
    if (!authSession) {
      return [];
    }

    if (authSession.user.role === "admin") {
      return [
        {
          label: "Pending approvals",
          value: String(pendingAdminPayments.length),
        },
        {
          label: "Cards available",
          value: String(adminOverview.smartCardStats.available),
        },
        {
          label: "Open tickets",
          value: String(adminOverview.tickets.length),
        },
      ];
    }

    return [
      {
        label: "Active plan",
        value: selectedClientPlan?.name ?? "Free",
      },
      {
        label: "Access state",
        value: clientAccessStateLabel,
      },
      {
        label: "Open tickets",
        value: String(clientOverview.tickets.length),
      },
    ];
  }, [
    adminOverview.smartCardStats.available,
    adminOverview.tickets.length,
    authSession,
    clientAccessStateLabel,
    clientOverview.tickets.length,
    pendingAdminPayments.length,
    selectedClientPlan?.name,
  ]);

  const workspacePriorityCards = useMemo<
    Array<DashboardHelpAction & { label: string }>
  >(() => {
    if (!authSession) {
      return [];
    }

    if (authSession.user.role === "admin") {
      return [
        {
          target: "system-payments",
          label: "Queue",
          title:
            pendingAdminPayments.length > 0
              ? `${pendingAdminPayments.length} approvals waiting`
              : "Payment queue is clear",
          detail:
            pendingAdminPayments.length > 0
              ? "Review managed plan requests and unblock rollout."
              : "No managed payment requests need review right now.",
          icon: CreditCard,
          status: pendingAdminPayments.length > 0 ? "Needs action" : "Clear",
        },
        {
          target: "system-cards",
          label: "Inventory",
          title: `${adminOverview.smartCardStats.available} cards available`,
          detail: "Check stock, assignment state, and activations across all sectors.",
          icon: ShieldCheck,
          status: "Live stock",
        },
        {
          target: "system-device-control",
          label: "Rollout",
          title: `${sectorControlRows.length} sector lanes in control`,
          detail: "Open the device board and manage active deployment lanes.",
          icon: Cpu,
          status: "Manage",
        },
      ];
    }

    return [
      {
        target: "client-plan-board",
        label: "Access",
        title:
          selectedClientPlan?.slug === "free"
            ? "Free access ready"
            : hasLinkedSelectedPlanAccess
              ? `${selectedClientPlan?.name ?? "Managed"} access linked`
              : latestRejectedPlanPayment
                ? `${selectedClientPlan?.name ?? "Managed"} needs retry`
                : `${selectedClientPlan?.name ?? "Managed"} plan selected`,
        detail:
          selectedClientPlan?.slug === "free"
            ? "Generate access without payment and validate it in one place."
            : pendingPlanPayment
              ? "This managed request is waiting for admin approval."
              : hasLinkedSelectedPlanAccess
                ? "The selected plan already has a linked SC card in this workspace."
                : latestRejectedPlanPayment
                  ? "Review the rejected request and submit it again."
                  : "Review the plan card and continue the managed request.",
        icon: Layers3,
        status:
          selectedClientPlan?.slug === "free"
            ? "Instant"
            : hasLinkedSelectedPlanAccess
              ? "Linked"
              : latestRejectedPlanPayment
                ? "Retry"
                : "Managed",
      },
      {
        target: "client-validate",
        label: "Validation",
        title: activeScratchCode ? `${activeScratchCode} is ready` : "Validation card waiting",
        detail:
          activeScratchCode
            ? "Open the validation step and confirm access."
            : "Generate or review the access card for this workspace.",
        icon: ShieldCheck,
        status: activeScratchCode ? "Ready" : "Waiting",
      },
      {
        target: "client-billing",
        label: "Billing",
        title:
          pendingClientPaymentsCount > 0
            ? `${pendingClientPaymentsCount} payment request waiting`
            : "Billing status is clear",
        detail:
          pendingClientPaymentsCount > 0
            ? "Track request state and linked card access."
            : "No billing queue is blocking this workspace.",
        icon: CreditCard,
        status: pendingClientPaymentsCount > 0 ? "Pending" : "Clear",
      },
    ];
  }, [
    activeScratchCode,
    adminOverview.smartCardStats.available,
    authSession,
    hasLinkedSelectedPlanAccess,
    latestRejectedPlanPayment,
    pendingAdminPayments.length,
    pendingClientPaymentsCount,
    pendingPlanPayment,
    sectorControlRows.length,
    selectedClientPlan?.name,
    selectedClientPlan?.slug,
  ]);

  const dashboardHelpTitle =
    authSession?.user.role === "admin" ? "Priority actions" : "Next steps";
  const dashboardHelpCopy =
    authSession?.user.role === "admin"
      ? "Use these shortcuts to open the boards that need review first."
      : "Use these shortcuts to continue the current access flow without opening extra panels.";
  const workspaceProfileItems = authSession
    ? [
        {
          label: "User",
          value: authSession.user.name,
        },
        {
          label: "Email",
          value: authSession.user.email,
        },
        {
          label: "Route",
          value: vpnActive ? vpnSession?.location ?? "Protected route" : "Direct route",
        },
        {
          label: "Session",
          value: formatSystemDate(authSession.issuedAt),
        },
      ]
    : [];
  const workspaceOverviewCards = authSession
    ? authSession.user.role === "admin"
      ? [
          {
            label: "Approvals",
            value:
              pendingAdminPayments.length > 0
                ? `${pendingAdminPayments.length} waiting`
                : "Queue clear",
            detail: "Payment and access requests waiting for review.",
          },
          {
            label: "SC cards",
            value: `${adminOverview.smartCardStats.available} ready`,
            detail: "SC cards currently available for assignment.",
          },
          {
            label: "Tickets",
            value: `${adminOverview.tickets.length} open`,
            detail: "Support and follow-up items still open.",
          },
          {
            label: "Deployment",
            value: `${sectorControlRows.length} sectors`,
            detail: "Sector lanes currently in rollout scope.",
          },
        ]
      : [
          {
            label: "Access",
            value: clientAccessStateLabel,
            detail:
              selectedClientPlan?.slug === "free"
                ? "Free access can be generated instantly from this workspace."
                : pendingPlanPayment
                  ? "Managed request is waiting for admin approval."
                : hasLinkedSelectedPlanAccess
                    ? "Linked SC access is already attached to the selected plan."
                    : latestRejectedPlanPayment
                      ? "The latest managed request was rejected and can be retried."
                      : "Select a plan and continue through the managed access flow.",
          },
          {
            label: "Plan",
            value:
              selectedClientPlan?.name ?? clientOverview.account?.planName ?? "Free",
            detail: "Selected commercial path for this workspace.",
          },
          {
            label: "Billing",
            value:
              pendingClientPaymentsCount > 0
                ? `${pendingClientPaymentsCount} pending`
                : clientOverview.payments.length > 0
                  ? `${clientOverview.payments.length} recorded`
                  : "Clear",
            detail: "Requests and linked access status for this workspace.",
          },
          {
            label: "Deployment",
            value:
              clientSector?.name ??
              activeSector?.name ??
              clientOverview.account?.sectorLabel ??
              "Workspace lane",
            detail: "Current sector and device context for this account.",
          },
        ]
    : [];
  const workspaceSidebarSignalCopy = authSession
    ? authSession.user.role === "admin"
      ? "Keep the review queue, live card inventory, and rollout context visible while moving across the admin boards."
      : "Keep access, billing, and deployment context visible while you continue through the workspace flow."
    : "";
  const workspaceSidebarSignalRows = authSession
    ? authSession.user.role === "admin"
      ? [
          {
            label: "Runtime events",
            value: `${operationsOverview.timeline.length} tracked`,
          },
          {
            label: "Cards live",
            value: `${adminOverview.smartCardStats.activated} activated`,
          },
          {
            label: "Session",
            value: formatSystemDate(authSession.issuedAt),
          },
        ]
      : [
          {
            label: "Support",
            value: `${clientOverview.tickets.length} tickets`,
          },
          {
            label: "SC card",
            value:
              selectedPlanSmartCard?.code ??
              activeScratchCode ??
              (selectedClientPlan?.slug === "free" ? "Generate card" : "Await request"),
          },
          {
            label: "Route",
            value: vpnActive ? vpnSession?.location ?? "Protected route" : "Direct route",
          },
        ]
    : [];

  async function refreshPublicRuntime() {
    try {
      const response = await axios.get("/api/operations/overview");
      setOperationsOverview((response.data ?? emptyOperations) as OperationsOverview);
    } catch (error) {
      setSystemMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Public runtime refresh failed."),
      });
    }
  }

  async function loadSystemOverview(session = authSession) {
    if (!session) {
      return;
    }

    setSystemLoading(true);

    try {
      const operationsRequest = axios.get("/api/operations/overview");

      if (session.user.role === "admin") {
        const [operationsResponse, adminResponse, nextScratchStats] =
          await Promise.all([
            operationsRequest,
            axios.get("/api/admin/overview", {
              params: {
                cardsLimit: 4000,
                paymentsLimit: 80,
              },
            }),
            getScratchCardStats(),
          ]);

        setOperationsOverview(
          (operationsResponse.data ?? emptyOperations) as OperationsOverview,
        );
        setAdminOverview(
          (adminResponse.data ?? emptyAdminOverview) as AdminOverview,
        );
        setScratchStats((nextScratchStats ?? emptyScratchStats) as ScratchStats);
        setScratchStatus(emptyScratchStatus);
        setScratchCodeInput("");
        return;
      }

      const [clientResponse, nextScratchStatus] = await Promise.all([
        axios.get("/api/client/overview", {
          params: {
            company: session.user.company,
          },
        }),
        getScratchCardStatus(session.user.id),
      ]);

      setOperationsOverview(emptyOperations);
      setClientOverview(
        (clientResponse.data ?? emptyClientOverview) as ClientOverview,
      );
      const resolvedScratchStatus = (nextScratchStatus ??
        emptyScratchStatus) as ScratchStatus;
      setScratchStatus(resolvedScratchStatus);
      setScratchCodeInput(resolvedScratchStatus.code ?? "");
      setScratchStats(emptyScratchStats);
    } catch (error) {
      setSystemMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "System overview failed to load."),
      });
    } finally {
      setSystemLoading(false);
    }
  }

  async function handleLoginSubmit() {
    setAuthSubmitting(true);
    setAuthMessage(null);

    try {
      const response = await axios.post("/api/auth/login", loginForm);
      const nextSession = response.data.session as AuthSession;

      setAuthSession(nextSession);
      setAuthMessage({
        tone: "success",
        text: `Login complete for ${nextSession.user.company}.`,
      });
      setSystemMessage({
        tone: "success",
        text: `System access opened for ${nextSession.user.role}.`,
      });
    } catch (error) {
      setAuthMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Login failed."),
      });
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleRegisterSubmit() {
    setAuthSubmitting(true);
    setAuthMessage(null);

    try {
      const response = await axios.post("/api/auth/register", {
        ...registerForm,
        role: "client",
      });
      const nextSession = response.data.session as AuthSession;

      setAuthSession(nextSession);
      setAuthMessage({
        tone: "success",
        text: `Client workspace created for ${nextSession.user.company}.`,
      });
      setSystemMessage({
        tone: "success",
        text: `System workspace created for ${nextSession.user.company}.`,
      });
    } catch (error) {
      setAuthMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Registration failed."),
      });
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleVpnToggle() {
    if (!selectedEndpointId && !vpnActive) {
      setVpnMessage({
        tone: "error",
        text: "Choose a VPN endpoint before connecting.",
      });
      return;
    }

    setVpnSubmitting(true);
    setVpnMessage(null);

    try {
      if (vpnSession) {
        await terminateVpnConnection(vpnSession.id);
        setVpnSession(null);
        setVpnMessage({
          tone: "info",
          text: "Private VPN route disconnected.",
        });
        return;
      }

      const userId = authSession?.user.id || ensureGuestUserId();
      const response = await initiateVpnConnection(
        userId,
        selectedEndpointId,
        "wireguard",
      );
      const nextSession = response.connection as VpnSession;

      setVpnSession(nextSession);
      setVpnMessage({
        tone: "success",
        text: `${nextSession.location} secure route is active.`,
      });
    } catch (error) {
      setVpnMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "VPN action failed."),
      });
    } finally {
      setVpnSubmitting(false);
    }
  }

  function handleSignOut() {
    setAuthSession(null);
    setAuthMessage({
      tone: "info",
      text: "Workspace session closed.",
    });
    setSystemMessage({
      tone: "info",
      text: "Returned to the public device deployment view.",
    });
    void refreshPublicRuntime();
  }

  async function handleProfileSave(payload: { name: string; email: string }) {
    if (!authSession) {
      return;
    }

    setProfileSaveBusy(true);
    setProfileMessage(null);

    try {
      const response = await updateAuthProfile(payload);
      const nextSession = response.session as AuthSession;

      if (nextSession) {
        setAuthSession(nextSession);
        await loadSystemOverview(nextSession);
      }

      setProfileMessage({
        tone: "success",
        text:
          typeof response.message === "string"
            ? response.message
            : "Workspace profile updated successfully.",
      });
    } catch (error) {
      setProfileMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Profile update failed."),
      });
    } finally {
      setProfileSaveBusy(false);
    }
  }

  async function handlePasswordSave(payload: {
    currentPassword: string;
    nextPassword: string;
    confirmPassword: string;
  }) {
    if (!authSession) {
      return;
    }

    if (!payload.currentPassword || !payload.nextPassword || !payload.confirmPassword) {
      setPasswordMessage({
        tone: "error",
        text: "Fill in the current password, new password, and confirmation.",
      });
      return;
    }

    if (payload.nextPassword !== payload.confirmPassword) {
      setPasswordMessage({
        tone: "error",
        text: "New password and confirmation do not match.",
      });
      return;
    }

    setPasswordSaveBusy(true);
    setPasswordMessage(null);

    try {
      const response = await updateAuthPassword({
        currentPassword: payload.currentPassword,
        nextPassword: payload.nextPassword,
      });
      const nextSession = response.session as AuthSession;

      if (nextSession) {
        setAuthSession(nextSession);
      }

      setPasswordMessage({
        tone: "success",
        text:
          typeof response.message === "string"
            ? response.message
            : "Workspace password updated successfully.",
      });
    } catch (error) {
      setPasswordMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Password update failed."),
      });
    } finally {
      setPasswordSaveBusy(false);
    }
  }

  function handleLanguageChange(nextLanguage: string) {
    if (nextLanguage === selectedLanguage) {
      return;
    }

    applyLanguageSelection(nextLanguage);
    setSelectedLanguage(nextLanguage);
    window.location.reload();
  }

  async function handleCountryChange(nextCountry: string) {
    if (!nextCountry) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.country, nextCountry);
    setSelectedCountry(nextCountry);

    let nextLanguage = getFallbackLanguageForCountry(nextCountry);

    try {
      const result = await getLanguageFromCountry(nextCountry);
      nextLanguage = resolveLanguageCode(result.languageCode) ?? nextLanguage;
    } catch {
      nextLanguage = getFallbackLanguageForCountry(nextCountry);
    }

    applyLanguageSelection(nextLanguage);
    setSelectedLanguage(nextLanguage);
    window.location.reload();
  }

  function scrollToSection(sectionId: string) {
    if (sectionId.startsWith("system-") || sectionId.startsWith("client-")) {
      setActiveDashboardSection(sectionId);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          document.getElementById(sectionId)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      });
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function scheduleLandingScroll(sectionId: string) {
    window.setTimeout(() => {
      if (sectionId === "landing-access-page") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      scrollToSection(sectionId);
    }, 40);
  }

  function openLandingView(view: LandingView) {
    setLandingView(view);
    scheduleLandingScroll(landingSectionMap[view]);
  }

  function openAbout() {
    window.location.assign("/about");
  }

  function openHelp() {
    window.location.assign("/help");
  }

  function handleLandingTopbarNavigation(key: string) {
    if (key === "overview") {
      openLandingView("overview");
      return;
    }

    if (key === "access") {
      setAuthMode("login");
      openLandingView("access");
      return;
    }

    const landingTargets: Record<string, string> = {
      devices: "landing-devices",
      story: "landing-how-it-works",
      plans: "landing-plans",
      solutions: "preweb-sectors",
    };

    const targetSection = landingTargets[key];

    if (targetSection) {
      scheduleLandingScroll(targetSection);
    }
  }

  function openSectorStory(sectorSlug: string) {
    setActiveSectorSlug(sectorSlug);
    setRegisterForm((current) => ({
      ...current,
      sector: sectorSlug,
    }));
    setLandingView("sectors");
    scheduleLandingScroll("preweb-sectors");
  }

  function openRegisterForSector(sector: Sector, plan?: Plan) {
    setActiveSectorSlug(sector.slug);
    setLandingView("access");
    setAuthMode("register");
    setRegisterForm((current) => ({
      ...current,
      sector: sector.slug,
      plan: plan?.slug || current.plan,
    }));
    scheduleLandingScroll("landing-access-page");
  }

  async function handleBroadcastNotification() {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      setSystemMessage({
        tone: "error",
        text: "Notification title and body are required.",
      });
      return;
    }

    setBroadcastBusy(true);

    try {
      await axios.post("/api/admin/notifications", {
        title: broadcastTitle.trim(),
        body: broadcastBody.trim(),
        level: "info",
      });

      setBroadcastTitle("");
      setBroadcastBody("");
      setSystemMessage({
        tone: "success",
        text: "Admin notification broadcasted.",
      });
      await loadSystemOverview();
    } catch (error) {
      setSystemMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Broadcast failed."),
      });
    } finally {
      setBroadcastBusy(false);
    }
  }

  async function handleClearNotifications() {
    const actionKey = "clear-notifications";
    setActionBusyKey(actionKey);

    try {
      const response = await axios.delete("/api/admin/notifications");
      const deletedCount = Number(response.data?.deletedCount ?? 0);

      setSystemMessage({
        tone: deletedCount > 0 ? "success" : "info",
        text:
          deletedCount > 0
            ? `${deletedCount} notification item${deletedCount === 1 ? "" : "s"} removed permanently.`
            : "Notifications feed is already clean.",
      });
      await loadSystemOverview();
    } catch (error) {
      setSystemMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Notification cleanup failed."),
      });
    } finally {
      setActionBusyKey("");
    }
  }

  async function handleClearHistory() {
    const actionKey = "clear-history";
    setActionBusyKey(actionKey);

    try {
      const response = await axios.delete("/api/admin/history");
      const deletedCount = Number(response.data?.deletedCount ?? 0);

      setSystemMessage({
        tone: deletedCount > 0 ? "success" : "info",
        text:
          deletedCount > 0
            ? `${deletedCount} runtime history item${deletedCount === 1 ? "" : "s"} deleted permanently.`
            : "Runtime history is already empty.",
      });
      await loadSystemOverview();
    } catch (error) {
      setSystemMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "History cleanup failed."),
      });
    } finally {
      setActionBusyKey("");
    }
  }

  async function handleResetSmartCards() {
    const actionKey = "reset-smart-cards";
    setActionBusyKey(actionKey);

    try {
      const response = await axios.post("/api/admin/cards/reset");
      const totalCards = Number(response.data?.totalCards ?? 0);
      const planBoards = Array.isArray(response.data?.cardsPerPlan)
        ? response.data.cardsPerPlan.length
        : 0;

      setSystemMessage({
        tone: "success",
        text:
          totalCards > 0
            ? `${totalCards} SC cards were reset. ${planBoards} plan board${planBoards === 1 ? "" : "s"} now hold 500 cards each.`
            : "SC card inventory reset completed.",
      });
      await loadSystemOverview();
    } catch (error) {
      setSystemMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "SC card reset failed."),
      });
    } finally {
      setActionBusyKey("");
    }
  }

  async function handleAdvanceActivation(activation: ActivationItem) {
    const nextStatus = nextActivationStatus(activation.status);
    const actionKey = `activation-${activation.id}`;

    setActionBusyKey(actionKey);

    try {
      await axios.patch(`/api/admin/activations/${activation.id}`, {
        status: nextStatus,
      });

      setSystemMessage({
        tone: "success",
        text: `${activation.deviceName} moved to ${nextStatus}.`,
      });
      await loadSystemOverview();
    } catch (error) {
      setSystemMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Activation update failed."),
      });
    } finally {
      setActionBusyKey("");
    }
  }

  async function handleAdvanceTicket(ticket: TicketItem) {
    const nextStatus = nextTicketStatus(ticket.status);
    const actionKey = `ticket-${ticket.id}`;

    setActionBusyKey(actionKey);

    try {
      await axios.patch(`/api/admin/tickets/${ticket.id}`, {
        status: nextStatus,
      });

      setSystemMessage({
        tone: "success",
        text: `${ticket.company} ticket moved to ${nextStatus}.`,
      });
      await loadSystemOverview();
    } catch (error) {
      setSystemMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Ticket update failed."),
      });
    } finally {
      setActionBusyKey("");
    }
  }

  async function handleAssignCardToAccount(account: AccountItem) {
    const actionKey = `assign-card-${account.id}`;

    setActionBusyKey(actionKey);

    try {
      await axios.post("/api/admin/cards/assign", {
        company: account.company,
        sector: account.sector,
        plan: account.plan,
        deviceKey: resolveDeviceKeyForSector(account.sector),
        quantity: 1,
      });

      setSystemMessage({
        tone: "success",
        text: `SC card assigned to ${account.company}.`,
      });
      await loadSystemOverview();
    } catch (error) {
      setSystemMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Card assignment failed."),
      });
    } finally {
      setActionBusyKey("");
    }
  }

  async function handleAdminActivateCard(
    code?: string | null,
    company?: string | null,
  ) {
    if (!code) {
      setSystemMessage({
        tone: "error",
        text: "No linked card code is available for activation.",
      });
      return;
    }

    const actionKey = `validate-card-${code}`;

    setActionBusyKey(actionKey);

    try {
      await axios.post("/api/cards/validate", {
        code,
        company: company ?? undefined,
      });

      setSystemMessage({
        tone: "success",
        text: `${code} activated successfully.`,
      });
      await loadSystemOverview();
    } catch (error) {
      setSystemMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Card activation failed."),
      });
    } finally {
      setActionBusyKey("");
    }
  }

  async function handleScratchAccessCard() {
    if (!authSession) {
      return;
    }

    setScratchBusy(true);
    setScratchMessage(null);

    try {
      if (!activeScratchCode) {
        const revealResult = await revealScratchCard(
          authSession.user.id,
          authSession.user.company,
        );
        const nextCode =
          typeof revealResult.code === "string"
            ? revealResult.code.trim().toUpperCase()
            : "";

        setScratchCodeInput(nextCode);
        setScratchStatus({
          hasActiveReservation: true,
          message:
            typeof revealResult.message === "string"
              ? revealResult.message
              : "Scratch card generated.",
          expiresIn:
            typeof revealResult.expiresIn === "number"
              ? revealResult.expiresIn
              : undefined,
          sector:
            typeof revealResult.sector === "string"
              ? revealResult.sector
              : undefined,
          plan:
            typeof revealResult.plan === "string" ? revealResult.plan : undefined,
          code: nextCode,
        });
        setScratchMessage({
          tone: "info",
          text: nextCode
            ? `SC code ${nextCode} was generated automatically. Click once more to validate it.`
            : "SC card was generated automatically for this workspace.",
        });
        return;
      }

      const result = await validateScratchCard(
        authSession.user.id,
        authSession.user.company,
        activeScratchCode,
      );

      setScratchCodeInput("");
      setScratchStatus(emptyScratchStatus);
      setScratchMessage({
        tone: "success",
        text:
          typeof result.message === "string"
            ? result.message
            : "Scratch card validated.",
      });
      await loadSystemOverview();
    } catch (error) {
      setScratchMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Scratch validation failed."),
      });
    } finally {
      setScratchBusy(false);
    }
  }

  function handleClientPlanSelect(plan: Plan) {
    setSelectedClientPlanSlug(plan.slug);
    setPaymentMessage(null);

    if (plan.slug === "free") {
      setScratchMessage({
        tone: "info",
        text: "Free plan now generates the SC code automatically below. No manual typing is required.",
      });
      return;
    }

    setScratchMessage({
      tone: "info",
      text: `${plan.name} is a managed plan. Send the request to admin for approval.`,
    });
  }

  async function handleClientPlanRequest() {
    if (!authSession || !selectedClientPlan) {
      return;
    }

    if (selectedClientPlan.slug === "free") {
      setScratchMessage({
        tone: "info",
        text: "Free access runs from the card below. Generate the code and validate it from there.",
      });
      return;
    }

    setPaymentBusy(true);
    setPaymentMessage(null);

    try {
      const response = await axios.post("/api/payments", {
        company: authSession.user.company,
        plan: selectedClientPlan.slug,
        amount: selectedClientPlan.annualPrice,
        paymentMethod: selectedPaymentMethod,
        cardholder: paymentCardholder || authSession.user.name,
        cardNumber: selectedPaymentMethod === "paypal" ? "" : paymentCardNumber,
        expiry: selectedPaymentMethod === "paypal" ? "" : paymentExpiry,
      });

      setPaymentCardNumber("");
      setPaymentExpiry("");
      setPaymentMessage({
        tone: "success",
        text:
          typeof response.data?.message === "string"
            ? response.data.message
            : `${selectedClientPlan.name} request is pending admin approval.`,
      });
      await loadSystemOverview();
    } catch (error) {
      setPaymentMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Plan request failed."),
      });
    } finally {
      setPaymentBusy(false);
    }
  }

  async function handleAdminPaymentAction(
    payment: PaymentRecord,
    status: PaymentRecord["status"],
  ) {
    const actionKey = `${status}-payment-${payment.id}`;
    setActionBusyKey(actionKey);

    try {
      await axios.patch(`/api/admin/payments/${payment.id}`, {
        status,
      });

      setSystemMessage({
        tone: status === "approved" ? "success" : "info",
        text:
          status === "approved"
            ? `${payment.company} payment approved.`
            : `${payment.company} payment rejected.`,
      });
      await loadSystemOverview();
    } catch (error) {
      setSystemMessage({
        tone: "error",
        text: getRequestErrorMessage(error, "Payment update failed."),
      });
    } finally {
      setActionBusyKey("");
    }
  }

  return (
    <>
      <GoogleTranslateBridge languageCode={selectedLanguage} />
      <div
        className={`landing-shell ${!isDarkMode ? "light-mode" : ""} ${authSession ? `theme-${authSession.user.role}` : "theme-landing"}`}
      >
        <div className="landing-aura landing-aura-blue" />
        <div className="landing-aura landing-aura-gold" />

        <div className={`page-frame ${authSession ? "page-frame-workspace" : ""}`}>
          {!authSession && isHelpCenterPage ? (
            <HelpCenterPage
              device={activeDevice}
              lightMode={!isDarkMode}
              onOpenLogin={() => window.location.assign("/?view=access")}
              onOpenProducts={() => window.location.assign("/?view=devices")}
              plans={landingContent.plans}
              sector={activeSector}
            />
          ) : isAboutPage ? (
            <AboutPage
              landingContent={landingContent}
              lightMode={!isDarkMode}
              selectedLanguage={selectedLanguage}
              onOpenLogin={() => {
                setAuthMode("login");
                openLandingView("access");
              }}
            />
          ) : (
            <>
              <LandingTopBar
                activeNavigationKey={landingView === "access" ? "access" : "overview"}
                countryOptions={countryOptions}
                currentUserLabel={currentUserLabel}
                languageOptions={languageOptions}
                navigationItems={[
                  { key: "overview", label: "Overview" },
                  { key: "devices", label: "Preview" },
                  { key: "plans", label: "Prices" },
                ]}
                onNavigate={handleLandingTopbarNavigation}
                onAboutAction={openAbout}
                onHelpAction={openHelp}
                onSecondaryAction={() => {
                  setAuthMode("login");
                  openLandingView("access");
                }}
                onCountryChange={handleCountryChange}
                onLanguageChange={handleLanguageChange}
                onToggleVpn={handleVpnToggle}
                onVpnEndpointChange={setSelectedEndpointId}
                selectedCountry={selectedCountry}
                selectedEndpointId={selectedEndpointId}
                selectedLanguage={selectedLanguage}
                publicMode={!authSession}
                vpnActive={vpnActive}
                vpnBusy={vpnSubmitting}
                vpnEndpoints={vpnEndpoints}
                vpnMessage={vpnMessage}
              />

              {!authSession ? (
                <>
                <PublicLandingExperience
                  activeDevice={activeDevice}
                  activeSector={activeSector}
                  authMessage={authMessage}
                  authMode={authMode}
                  authSession={authSession}
                  authStatusText={authStatusText}
                  authSubmitting={authSubmitting}
                  contentLoading={contentLoading}
                  heroBadges={heroBadges}
                  heroMetrics={heroMetrics}
                  landingContent={landingContent}
                  loginForm={loginForm}
                  onAuthModeChange={setAuthMode}
                  onLoginChange={setLoginForm}
                  onLoginSubmit={handleLoginSubmit}
                  onCloseAccess={() => openLandingView("overview")}
                  onOpenAccess={() => {
                    setAuthMode("login");
                    openLandingView("access");
                  }}
                  onRegisterChange={setRegisterForm}
                  onRegisterSubmit={handleRegisterSubmit}
                  onRoleChange={(role) =>
                    setLoginForm((current) => ({ ...current, role }))
                  }
                  onSectorSelect={openSectorStory}
                  onSignOut={handleSignOut}
                  registerForm={registerForm}
                  selectedCountryLabel={selectedCountryOption.label}
                  selectedLanguageLabel={selectedLanguageOption.label}
                  showAccessPage={showLandingAccessPage}
                  vpnActive={vpnActive}
                />
                </>
          ) : (
            <main
              className="system-center-shell workspace-runtime-theme mt-6"
              id="system-center"
            >
              <aside className="dashboard-sidebar-rail">
                <div className="dashboard-sidebar-shell workspace-sidebar-shell flex flex-col gap-5 rounded-[32px] p-5 backdrop-blur-xl">
                  <div className="workspace-summary-card">
                    <div className="flex flex-col gap-4">
                      <div className="workspace-brand-strip">
                        <BrainBrand compact subtitle="Workspace portal" />
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="workspace-summary-kicker">Managed workspace</p>
                          <span className="mt-3 inline-flex workspace-badge">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {authSession.user.role === "admin"
                              ? "Admin workspace"
                              : "Client workspace"}
                          </span>
                          <h2 className="mt-4 break-words text-2xl font-black text-white">
                            {authSession.user.company}
                          </h2>
                          <p className="workspace-summary-copy">{authStatusText}</p>
                        </div>

                        <div className="workspace-route-card min-w-[10.5rem] sm:text-right">
                          <p className="workspace-route-kicker">Current route</p>
                          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-100 sm:justify-end">
                            <span className="h-2 w-2 rounded-full bg-[#d45a34]" />
                            Live
                          </div>
                          <p className="break-words text-sm font-semibold text-white">
                            {vpnActive ? vpnSession?.location : "Direct route"}
                          </p>
                        </div>
                      </div>

                      <div className="workspace-summary-pill-row">
                        <span className="workspace-summary-pill">
                          {authSession.user.role}
                        </span>
                        <span className="workspace-summary-pill">
                          {vpnActive ? "VPN route" : "Direct route"}
                        </span>
                        <span className="workspace-summary-pill">
                          {selectedCountryOption.label} / {selectedLanguageOption.label}
                        </span>
                      </div>

                      <div className="workspace-detail-grid">
                        {workspaceProfileItems.map((item) => (
                          <div className="workspace-detail-item" key={item.label}>
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {activeDashboardItem ? (
                    <div className="workspace-focus-card">
                      <div className="workspace-focus-head">
                        <div>
                          <p className="workspace-focus-kicker">Current section</p>
                          <h3 className="workspace-focus-title">{activeDashboardItem.label}</h3>
                        </div>
                        <span className="workspace-focus-meta">
                          {activeDashboardItem.meta}
                        </span>
                      </div>

                      <p className="workspace-focus-copy">{activeDashboardItem.detail}</p>

                      <div className="workspace-stat-grid">
                        {workspaceSidebarStats.map((item) => (
                          <div className="workspace-stat-card" key={item.label}>
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="workspace-nav-card rounded-[28px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Sections
                        </p>
                        <h3 className="mt-2 text-lg font-black text-white">
                          Workspace map
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="workspace-focus-meta">
                          {dashboardSidebarItems.length} sections
                        </span>
                        <Globe2 className="workspace-icon h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {dashboardSidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeDashboardSection === item.target;

                        return (
                          <button
                            className={`group flex w-full items-center gap-3 rounded-[24px] border px-4 py-3 text-left transition ${
                              isActive
                                ? "workspace-nav-button-active"
                                : "border-white/10 bg-white/[0.04] hover:-translate-y-0.5 hover:bg-white/[0.07]"
                            }`}
                            key={item.target}
                            onClick={() => scrollToSection(item.target)}
                            type="button"
                          >
                            <span
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition ${
                                isActive
                                  ? "workspace-nav-icon-active"
                                  : "border-white/10 bg-black/20 text-slate-300 group-hover:text-white"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-3">
                                <strong className="min-w-0 pr-2 text-sm text-white">
                                  {item.label}
                                </strong>
                                <span
                                  className={`max-w-[8.5rem] truncate rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                    isActive
                                      ? "workspace-nav-meta-active"
                                      : "bg-white/[0.06] text-slate-300"
                                  }`}
                                >
                                  {item.meta}
                                </span>
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-slate-400">
                                {item.detail}
                              </span>
                            </span>

                            <ArrowRight
                              className={`h-4 w-4 shrink-0 transition ${
                                isActive
                                  ? "workspace-nav-arrow-active translate-x-0"
                                  : "text-slate-500 group-hover:translate-x-0.5 group-hover:text-slate-200"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="workspace-help-card rounded-[28px] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Shortcuts
                        </p>
                        <h3 className="mt-2 text-lg font-black text-white">
                          {dashboardHelpTitle}
                        </h3>
                      </div>
                      <ServerCog className="workspace-help-icon h-5 w-5" />
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {dashboardHelpCopy}
                    </p>

                    <div className="mt-4 space-y-3">
                      {dashboardHelpActions.map((action) => {
                        const Icon = action.icon;

                        return (
                          <button
                            className="flex w-full items-start gap-3 rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
                            key={`${action.target}-${action.title}`}
                            onClick={() => scrollToSection(action.target)}
                            type="button"
                          >
                            <span className="workspace-help-icon-shell flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                              <Icon className="h-4 w-4" />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-3">
                                <strong className="min-w-0 pr-2 text-sm leading-5 text-white">
                                  {action.title}
                                </strong>
                                  <span className="workspace-help-status max-w-[7.5rem] truncate rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
                                    {action.status}
                                  </span>
                                </span>
                              <span className="mt-1 block text-xs leading-5 text-slate-400">
                                {action.detail}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        className="executive-button-primary"
                        onClick={() => void loadSystemOverview()}
                        type="button"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {systemLoading ? "Refreshing..." : "Refresh"}
                      </button>
                      <button
                        className="executive-button-secondary"
                        onClick={handleSignOut}
                        type="button"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>

                  {authSession.user.role === "admin" && (
                    <div className="workspace-focus-card">
                      <div className="workspace-focus-head">
                        <div>
                          <p className="workspace-focus-kicker">Admin summary</p>
                          <h3 className="workspace-focus-title">System overview</h3>
                        </div>
                        <span className="workspace-focus-meta">Live</span>
                      </div>

                      <p className="workspace-focus-copy">
                        Key metrics and status indicators for admin operations, accounts, and card inventory.
                      </p>

                      <div className="workspace-stat-grid">
                        <div className="workspace-stat-card">
                          <span>Total accounts</span>
                          <strong>{adminOverview.accounts.length}</strong>
                        </div>
                        <div className="workspace-stat-card">
                          <span>Total payments</span>
                          <strong>{adminOverview.payments.length}</strong>
                        </div>
                        <div className="workspace-stat-card">
                          <span>Pending approvals</span>
                          <strong>{pendingAdminPayments.length}</strong>
                        </div>
                        <div className="workspace-stat-card">
                          <span>Cards live</span>
                          <strong>{adminOverview.smartCardStats.activated}</strong>
                        </div>
                        <div className="workspace-stat-card">
                          <span>Open tickets</span>
                          <strong>{adminOverview.tickets.length}</strong>
                        </div>
                        <div className="workspace-stat-card">
                          <span>Metrics</span>
                          <strong>{adminOverview.adminMetrics.length}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {authSession.user.role === "admin" && (
                    <div className="workspace-focus-card">
                      <div className="workspace-focus-head">
                        <div>
                          <p className="workspace-focus-kicker">Payment queue</p>
                          <h3 className="workspace-focus-title">Request status</h3>
                        </div>
                        <span className="workspace-focus-meta">Queue</span>
                      </div>

                      <p className="workspace-focus-copy">
                        Payment request breakdown showing pending, approved, and rejected items in the workflow.
                      </p>

                      <div className="workspace-stat-grid">
                        <div className="workspace-stat-card">
                          <span>Pending requests</span>
                          <strong>{pendingAdminPayments.length}</strong>
                        </div>
                        <div className="workspace-stat-card">
                          <span>Approved</span>
                          <strong>{approvedAdminPayments.length}</strong>
                        </div>
                        <div className="workspace-stat-card">
                          <span>Rejected</span>
                          <strong>{rejectedAdminPayments.length}</strong>
                        </div>
                        <div className="workspace-stat-card">
                          <span>Smart cards</span>
                          <strong>{adminOverview.smartCards.length}</strong>
                        </div>
                        <div className="workspace-stat-card">
                          <span>Available cards</span>
                          <strong>{adminOverview.smartCardStats.available}</strong>
                        </div>
                        <div className="workspace-stat-card">
                          <span>Sectors</span>
                          <strong>{sectorControlRows.length}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="workspace-signal-card">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="workspace-focus-kicker">Signal lane</p>
                        <h3 className="workspace-focus-title">Workspace signals</h3>
                      </div>
                      <span className="workspace-focus-meta">
                        {workspaceOverviewCards.length} items
                      </span>
                    </div>

                    <p className="workspace-signal-copy">{workspaceSidebarSignalCopy}</p>

                    <div className="workspace-signal-grid">
                      {workspaceOverviewCards.map((card) => (
                        <article className="workspace-signal-tile" key={card.label}>
                          <span className="workspace-signal-label">{card.label}</span>
                          <strong className="workspace-signal-value">{card.value}</strong>
                          <p className="workspace-signal-detail">{card.detail}</p>
                        </article>
                      ))}
                    </div>

                    <div className="workspace-signal-list">
                      {workspaceSidebarSignalRows.map((item) => (
                        <div className="workspace-signal-row" key={item.label}>
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              <div className="system-center-content min-w-0 space-y-6">
                <motion.section
                  animate={{ opacity: 1, y: 0 }}
                  className="executive-surface workspace-overview-shell p-6 sm:p-7"
                  id="system-overview"
                  initial={{ opacity: 0, y: 22 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                      <span className="workspace-badge">
                        <Sparkles className="h-3.5 w-3.5" />
                        {authSession.user.role === "admin"
                          ? "Admin workspace"
                          : "Current workspace"}
                      </span>
                      <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                        {authSession.user.role === "admin"
                          ? "Review payments, rollout, cards, and support."
                          : "Manage access, billing, deployment, and support."}
                      </h1>
                      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                        {authSession.user.role === "admin"
                          ? "Keep the priority queues visible first, then move into operations without losing the main view."
                          : "Keep access, billing, deployment, and support in one clear workspace without jumping between pages."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        className="executive-button-primary"
                        onClick={() => void loadSystemOverview()}
                        type="button"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {systemLoading ? "Refreshing..." : "Refresh system"}
                      </button>
                      <button
                        className="executive-button-secondary border-red-400/20 bg-red-500/10 text-red-100 hover:bg-red-500/15"
                        onClick={handleSignOut}
                        type="button"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>

                  <div className="workspace-overview-strip">
                    {workspaceOverviewCards.map((card) => (
                      <article className="workspace-overview-card" key={card.label}>
                        <span className="workspace-overview-label">{card.label}</span>
                        <strong className="workspace-overview-value">{card.value}</strong>
                        <p className="workspace-overview-copy">{card.detail}</p>
                      </article>
                    ))}
                  </div>

                  <div className="workspace-priority-grid">
                    {workspacePriorityCards.map((card) => {
                      const Icon = card.icon;

                      return (
                        <button
                          className="workspace-priority-card"
                          key={`${card.target}-${card.label}`}
                          onClick={() => scrollToSection(card.target)}
                          type="button"
                        >
                          <div className="workspace-priority-head">
                            <span className="workspace-priority-label">{card.label}</span>
                            <span className="workspace-priority-status">{card.status}</span>
                          </div>
                          <div className="workspace-priority-icon">
                            <Icon className="h-4 w-4" />
                          </div>
                          <strong className="workspace-priority-title">{card.title}</strong>
                          <p className="workspace-priority-copy">{card.detail}</p>
                        </button>
                      );
                    })}
                  </div>
                </motion.section>

                {systemMessage ? (
                  <div
                    className={`message-shell ${
                      systemMessage.tone === "error"
                        ? "message-error"
                        : systemMessage.tone === "success"
                          ? "message-success"
                          : "message-info"
                    }`}
                  >
                    {systemMessage.text}
                  </div>
                ) : null}

                <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                  {primaryMetrics.map((metric) => (
                    <article className="executive-metric-card" key={metric.key}>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {metric.label}
                      </p>
                      <h3 className="mt-3 text-4xl font-black text-white">
                        {metric.value}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-400">
                        {metric.detail}
                      </p>
                    </article>
                  ))}
                </section>

                {activeDashboardItem ? (
                  <section className="workspace-section-shell rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.96),rgba(5,11,21,0.92))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Current workspace section
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-white">
                          {activeDashboardItem.label}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                          {activeDashboardSection === "system-overview"
                            ? "Use the switcher below to open one focused board at a time and keep the workspace lighter to scan."
                            : activeDashboardItem.detail}
                        </p>
                      </div>

                      {activeDashboardSection !== "system-overview" ? (
                        <button
                          className="executive-button-secondary"
                          onClick={() => scrollToSection("system-overview")}
                          type="button"
                        >
                          Back to overview
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {dashboardSidebarItems.map((item) => {
                        const active = activeDashboardSection === item.target;

                        return (
                          <button
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                              active
                                ? "border-[rgba(212,90,52,0.28)] bg-[rgba(212,90,52,0.12)] text-[#ffe7dc]"
                                : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                            }`}
                            key={item.target}
                            onClick={() => scrollToSection(item.target)}
                            type="button"
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                {authSession.user.role === "client" ? (
                  <section className={activeDashboardSection === "system-overview" ? "" : "hidden"}>
                    <ClientDashboardOverview
                      account={clientOverview.account}
                      activations={clientOverview.activations}
                      clients={clientOverview.clients}
                      company={clientOverview.account?.company ?? authSession.user.company}
                      notifications={clientOverview.notifications}
                      onOpenCards={() => scrollToSection("client-validate")}
                      onOpenPayments={() => scrollToSection("client-billing")}
                      onOpenSupport={() => scrollToSection("system-role")}
                      onSelectCompany={(company) => {
                        void loadSystemOverview({
                          ...authSession,
                          user: {
                            ...authSession.user,
                            company,
                          },
                        });
                      }}
                      payments={clientOverview.payments}
                      smartCards={clientOverview.smartCards}
                      onOpenAccount={() => scrollToSection("client-account")}
                      userEmail={authSession.user.email}
                      userName={authSession.user.name}
                      formatMoney={formatSystemMoney}
                    />
                  </section>
                ) : null}

                {authSession.user.role === "admin" ? (
                  <>
                    <section
                      className={showAdminAccountPanel ? "" : "hidden"}
                      id="system-account"
                    >
                      <PortalAccountCenter
                        availablePlans={landingContent.plans}
                        company={authSession.user.company}
                        linkedCardsCount={adminOverview.smartCards.length}
                        onChangePassword={handlePasswordSave}
                        onPrimaryAction={() => scrollToSection("system-payments")}
                        onSaveProfile={handleProfileSave}
                        onSecondaryAction={() => scrollToSection("system-device-control")}
                        openTicketsCount={adminOverview.tickets.length}
                        passwordBusy={passwordSaveBusy}
                        passwordMessage={passwordMessage}
                        pendingPaymentsCount={pendingAdminPayments.length}
                        planName="Admin control workspace"
                        primaryActionLabel="Open payment queue"
                        role="admin"
                        routeLabel={vpnActive ? vpnSession?.location ?? "Protected route" : "Direct route"}
                        saveBusy={profileSaveBusy}
                        saveMessage={profileMessage}
                        secondaryActionLabel="Open rollout board"
                        sectorLabel="All sectors"
                        selectedPlanSlug={selectedClientPlan?.slug}
                        sessionLabel={formatSystemDate(authSession.issuedAt)}
                        userEmail={authSession.user.email}
                        userName={authSession.user.name}
                      />
                    </section>

                    <section
                      className={`grid gap-6 2xl:grid-cols-[0.9fr_1.1fr] ${
                        showAdminOperationsPanel ? "" : "hidden"
                      }`}
                      id="system-operations"
                    >
                  <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Runtime
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-white">
                          Service status
                        </h2>
                      </div>
                      <ServerCog className="h-6 w-6 text-cyan-200" />
                    </div>

                    <div className="mt-5 grid gap-3">
                      {operationsOverview.services.map((service) => (
                        <div
                          className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                          key={service.key}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <strong className="text-sm text-white">
                              {service.label}
                            </strong>
                            <span
                              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${statusBadgeClass(service.status)}`}
                            >
                              {service.status}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-400">
                            {service.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Activity
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-white">
                          Event log
                        </h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-100 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={actionBusyKey === "clear-history"}
                          onClick={() => void handleClearHistory()}
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {actionBusyKey === "clear-history"
                            ? "Deleting..."
                            : "Permanent delete"}
                        </button>
                        <Activity className="h-6 w-6 text-cyan-200" />
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {operationsOverview.timeline.length > 0 ? (
                        operationsOverview.timeline.map((event) => (
                          <div
                            className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                            key={event.id}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <strong className="text-sm text-white">
                                {event.title}
                              </strong>
                              <span
                                className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${eventBadgeClass(event.status)}`}
                              >
                                {event.type}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                              {event.detail}
                            </p>
                            <p className="mt-3 text-xs text-slate-500">
                              {formatSystemDate(event.createdAt)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <EmptyCard message="History is clean. New activations, tickets, uploads, and payments will appear here when they happen." />
                      )}
                    </div>
                  </article>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
                  <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Operations
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-white">
                          Core status
                        </h2>
                      </div>
                      <Workflow className="h-6 w-6 text-cyan-200" />
                    </div>

                    <div className="mt-5 grid gap-3">
                      {operationsOverview.metrics.map((metric: RuntimeMetric) => (
                        <div
                          className="flex items-start justify-between gap-4 rounded-[24px] border border-white/10 bg-black/20 p-4"
                          key={metric.key}
                        >
                          <div>
                            <strong className="text-sm text-white">
                              {metric.label}
                            </strong>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {metric.detail}
                            </p>
                          </div>
                          <span className="text-lg font-black text-cyan-200">
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Updates
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-white">
                          Notification log
                        </h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={actionBusyKey === "clear-notifications"}
                          onClick={() => void handleClearNotifications()}
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {actionBusyKey === "clear-notifications"
                            ? "Clearing..."
                            : "Clear feed"}
                        </button>
                        <Bell className="h-6 w-6 text-cyan-200" />
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {operationsOverview.notifications.length > 0 ? (
                        operationsOverview.notifications.map((notification) => (
                          <div
                            className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                            key={notification.id}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <strong className="text-sm text-white">
                                {notification.title}
                              </strong>
                              <span
                                className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                  notification.level === "success"
                                    ? "border-emerald-400/25 bg-emerald-400/12 text-emerald-200"
                                    : notification.level === "warning"
                                      ? "border-amber-400/25 bg-amber-400/12 text-amber-200"
                                      : "border-cyan-400/25 bg-cyan-400/12 text-cyan-200"
                                }`}
                              >
                                {notification.level}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                              {notification.body}
                            </p>
                            <p className="mt-3 text-xs text-slate-500">
                              {formatSystemDate(notification.createdAt)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <EmptyCard message="No notifications are live right now. Admin broadcasts and workflow updates will land here." />
                      )}
                    </div>
                  </article>
                    </section>

                    <section
                      className={`rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-7 ${
                        showAdminSectorsPanel ? "" : "hidden"
                      }`}
                      id="system-sectors"
                    >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                        <Cpu className="h-3.5 w-3.5" />
                        Sector view
                      </span>
                      <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Sector fit and rollout
                      </h2>
                    </div>

                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]"
                      onClick={() => activeSector && setActiveSectorSlug(activeSector.slug)}
                      type="button"
                    >
                      Selected sector: {activeSector?.name || "None"}
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-4">
                    {sectorSummaries.map((sector) => (
                      <button
                        className={`rounded-[28px] border p-5 text-left transition ${
                          sector.slug === activeSector?.slug
                            ? "border-cyan-400/25 bg-cyan-400/10"
                            : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
                        }`}
                        key={sector.slug}
                        onClick={() => setActiveSectorSlug(sector.slug)}
                        type="button"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Sector
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-white">
                          {sector.name}
                        </h3>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs text-slate-500">Accounts</p>
                            <p className="mt-2 text-lg font-black text-white">
                              {sector.accounts}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-xs text-slate-500">Devices</p>
                            <p className="mt-2 text-lg font-black text-white">
                              {sector.devices}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {activeSector ? (
                    <div className="mt-6 grid gap-6 xl:items-start xl:grid-cols-[1.05fr_0.95fr]">
                      <div className="h-fit rounded-[32px] border border-white/10 bg-black/20 p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Selected sector
                            </p>
                            <h3 className="mt-2 text-3xl font-black text-white">
                              {activeSector.name}
                            </h3>
                          </div>
                          <button
                            className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,90,52,0.24)] bg-[linear-gradient(135deg,rgba(212,90,52,0.96),rgba(201,138,60,0.96))] px-4 py-2 text-sm font-bold text-[#170f0a] shadow-[0_14px_30px_rgba(180,82,47,0.24)] transition hover:brightness-105"
                            onClick={() =>
                              openRegisterForSector(
                                activeSector,
                                landingContent.plans.find((plan) => plan.featured),
                              )
                            }
                            type="button"
                          >
                            Use this stack
                          </button>
                        </div>
                        <p className="mt-4 text-base leading-8 text-slate-300">
                          {activeSector.summary}
                        </p>
                        <div className="mt-5">
                          <SectorLiveBoard
                            compact
                            device={activeDevice}
                            lightMode={!isDarkMode}
                            plans={landingContent.plans}
                            sector={activeSector}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        {landingContent.devices
                          .filter((device) => device.sectorSlug === activeSector.slug)
                          .map((device: Device) => (
                            <div
                              className="rounded-[28px] border border-white/10 bg-black/20 p-5"
                              key={device.deviceKey}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                    {device.category}
                                  </p>
                                  <h3 className="mt-2 text-2xl font-black text-white">
                                    {device.name}
                                  </h3>
                                </div>
                                <HardDrive className="h-6 w-6 text-cyan-200" />
                              </div>
                              <p className="mt-3 text-sm leading-7 text-slate-300">
                                {device.description}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {device.ports.map((port) => (
                                  <span
                                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-200"
                                    key={port}
                                  >
                                    {port}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : null}
                    </section>
                  </>
                ) : null}

                {authSession.user.role === "admin" ? (
                  <section
                    className={`space-y-6 ${
                      showAdminSupportPanel ||
                      showAdminRolloutPanel ||
                      showAdminPaymentsPanel ||
                      showAdminCardsPanel
                        ? ""
                        : "hidden"
                    }`}
                    id="system-role"
                  >
                    <div
                      className={`grid gap-6 xl:grid-cols-[0.95fr_1.05fr] ${
                        showAdminSupportPanel || showAdminRolloutPanel ? "" : "hidden"
                      }`}
                    >
                      <article
                        className={`rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 ${
                          showAdminSupportPanel ? "" : "hidden"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Updates
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Publish workspace update
                            </h2>
                          </div>
                          <Bell className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 space-y-4">
                          <label className="field-shell">
                            <span>Title</span>
                            <input
                              className="field-input"
                              onChange={(event) => setBroadcastTitle(event.target.value)}
                              placeholder="Workspace update"
                              type="text"
                              value={broadcastTitle}
                            />
                          </label>

                          <label className="field-shell">
                            <span>Body</span>
                            <textarea
                              className="field-input min-h-32 resize-none"
                              onChange={(event) => setBroadcastBody(event.target.value)}
                              placeholder="Write the workspace update here."
                              value={broadcastBody}
                            />
                          </label>

                          <button
                            className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                            disabled={broadcastBusy}
                            onClick={() => void handleBroadcastNotification()}
                            type="button"
                          >
                            <Bell className="h-4 w-4" />
                            {broadcastBusy ? "Sending..." : "Send update"}
                          </button>
                        </div>
                      </article>

                      <article
                        className={`rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 xl:col-span-2 ${
                          showAdminRolloutPanel ? "" : "hidden"
                        }`}
                        id="system-device-control"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Rollout
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Sector device board
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              Control cards, deployments, and workspace volume per sector
                              without leaving the admin page.
                            </p>
                          </div>
                          <Cpu className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="admin-rollout-board mt-5">
                          <div className="admin-rollout-summary-grid">
                            {adminRolloutSummaryCards.map((card) => (
                              <article
                                className="admin-rollout-summary-card rounded-[22px] border border-white/10 bg-black/20 p-4"
                                key={card.label}
                              >
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                  {card.label}
                                </p>
                                <strong className="mt-2 block text-2xl font-black text-white">
                                  {card.value}
                                </strong>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                  {card.detail}
                                </p>
                              </article>
                            ))}
                          </div>

                          <div className="admin-rollout-grid">
                            {adminRolloutRows.map((sector) => (
                              <article
                                className="admin-rollout-card rounded-[26px] border p-4"
                                key={sector.slug}
                                style={{
                                  borderColor: `${getThemeAccent(sector.accent, !isDarkMode)}35`,
                                  background: !isDarkMode
                                    ? `linear-gradient(180deg, ${getThemeAccent(sector.accent, true)}10, rgba(255,255,255,0.98))`
                                    : `linear-gradient(180deg, ${sector.accent}14, rgba(2,8,18,0.9))`,
                                }}
                              >
                                <div className="admin-rollout-card-head">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-3">
                                      <strong className="text-base font-black text-white">
                                        {sector.name}
                                      </strong>
                                      <span
                                        className="rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                                        style={{
                                          borderColor: `${getThemeAccent(sector.accent, !isDarkMode)}45`,
                                          background: !isDarkMode
                                            ? `${getThemeAccent(sector.accent, true)}14`
                                            : `${sector.accent}18`,
                                          color: !isDarkMode ? "#111111" : "#fef1ea",
                                        }}
                                      >
                                        {sector.stageLabel}
                                      </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                      {sector.audience}
                                    </p>
                                  </div>

                                  <button
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/[0.1]"
                                    onClick={() => {
                                      setActiveSectorSlug(sector.slug);
                                      scrollToSection("system-sectors");
                                    }}
                                    type="button"
                                  >
                                    Manage sector
                                    <ArrowRight className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="admin-rollout-chip-row">
                                  <span
                                    className="rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                                    style={{
                                      borderColor: `${getThemeAccent(sector.accent, !isDarkMode)}45`,
                                      background: !isDarkMode
                                        ? `${getThemeAccent(sector.accent, true)}14`
                                        : `${sector.accent}18`,
                                      color: !isDarkMode ? "#111111" : "#fef1ea",
                                    }}
                                  >
                                    {sector.primaryDevice}
                                  </span>
                                  <span className="admin-rollout-chip">{sector.title}</span>
                                  <span className="admin-rollout-chip">{sector.statValue}</span>
                                </div>

                                <div className="admin-rollout-metrics">
                                  <div className="admin-rollout-metric rounded-[20px] border border-white/10 bg-black/20 p-3">
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                      Accounts
                                    </p>
                                    <strong className="mt-2 block text-xl font-black text-white">
                                      {sector.accounts}
                                    </strong>
                                  </div>
                                  <div className="admin-rollout-metric rounded-[20px] border border-white/10 bg-black/20 p-3">
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                      Device views
                                    </p>
                                    <strong className="mt-2 block text-xl font-black text-white">
                                      {sector.devices}
                                    </strong>
                                  </div>
                                  <div className="admin-rollout-metric rounded-[20px] border border-white/10 bg-black/20 p-3">
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                      Available
                                    </p>
                                    <strong className="mt-2 block text-xl font-black text-white">
                                      {sector.availableCards}
                                    </strong>
                                  </div>
                                  <div className="admin-rollout-metric rounded-[20px] border border-white/10 bg-black/20 p-3">
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                      Assigned
                                    </p>
                                    <strong className="mt-2 block text-xl font-black text-white">
                                      {sector.assignedCards}
                                    </strong>
                                  </div>
                                  <div className="admin-rollout-metric rounded-[20px] border border-white/10 bg-black/20 p-3">
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                      Activated
                                    </p>
                                    <strong className="mt-2 block text-xl font-black text-white">
                                      {sector.activatedCards}
                                    </strong>
                                  </div>
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>
                      </article>

                      <article
                        className={`rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 ${
                          showAdminRolloutPanel ? "xl:col-span-2" : "hidden"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Rollout totals
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Cards, reveals, and account scope
                            </h2>
                          </div>
                          <Ticket className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              SC cards
                            </p>
                            <h3 className="mt-2 text-3xl font-black text-white">
                              {adminOverview.smartCardStats.total}
                            </h3>
                            <p className="mt-2 text-sm text-slate-400">
                              {adminOverview.smartCardStats.available} available and{" "}
                              {adminOverview.smartCardStats.activated} activated
                            </p>
                          </div>
                          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              Scratch reveals
                            </p>
                            <h3 className="mt-2 text-3xl font-black text-white">
                              {scratchStats.totalReveals}
                            </h3>
                            <p className="mt-2 text-sm text-slate-400">
                              {scratchStats.activeReservations} active reservations in runtime
                            </p>
                          </div>
                          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              Accounts
                            </p>
                            <h3 className="mt-2 text-3xl font-black text-white">
                              {adminOverview.accounts.length}
                            </h3>
                            <p className="mt-2 text-sm text-slate-400">
                              Client organizations in admin scope
                            </p>
                          </div>
                          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              Revenue flow
                            </p>
                            <h3 className="mt-2 text-3xl font-black text-white">
                              {formatSystemMoney(
                                approvedAdminPayments.reduce(
                                  (sum, payment) => sum + payment.amount,
                                  0,
                                ),
                              )}
                            </h3>
                            <p className="mt-2 text-sm text-slate-400">
                              {pendingAdminPayments.length} pending approvals in the admin queue
                            </p>
                          </div>
                        </div>
                      </article>
                    </div>

                    <div
                      className={`grid gap-6 xl:grid-cols-2 ${
                        showAdminSupportPanel ||
                        showAdminRolloutPanel ||
                        showAdminPaymentsPanel ||
                        showAdminCardsPanel
                          ? ""
                          : "hidden"
                      }`}
                    >
                      <article
                        className={`rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 ${
                          showAdminRolloutPanel ? "xl:col-span-2" : "hidden"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Accounts
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Client organizations
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              A compact admin view of the organizations that need rollout
                              attention first, instead of a long full list.
                            </p>
                          </div>
                          <Users className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="admin-rollout-summary-grid mt-5">
                          {adminOrganizationSummaryCards.map((card) => (
                            <article
                              className="admin-rollout-summary-card rounded-[22px] border border-white/10 bg-black/20 p-4"
                              key={card.label}
                            >
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                {card.label}
                              </p>
                              <strong className="mt-2 block text-2xl font-black text-white">
                                {card.value}
                              </strong>
                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                {card.detail}
                              </p>
                            </article>
                          ))}
                        </div>

                        <div className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                          <div className="executive-status-panel">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                  Priority accounts
                                </p>
                                <h3 className="mt-2 text-xl font-black text-white">
                                  Rollout actions first
                                </h3>
                              </div>
                              <span className="workspace-focus-meta">
                                {adminOrganizationPriorityAccounts.length} shown
                              </span>
                            </div>

                            <div className="mt-4 grid gap-3">
                              {adminOrganizationPriorityAccounts.map((account) => {
                                const actionKey = `assign-card-${account.id}`;

                                return (
                                  <div className="executive-status-item" key={account.id}>
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <strong className="text-sm text-white">
                                            {account.company}
                                          </strong>
                                          <span className="workspace-help-status rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
                                            {account.coverageGap > 0
                                              ? `${account.coverageGap} cards needed`
                                              : "Covered"}
                                          </span>
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                          {account.planName} / {account.sectorLabel}
                                        </p>
                                        <p className="mt-2 text-xs leading-6 text-slate-500">
                                          {account.devices} devices / {account.smartCards} linked
                                          cards / {formatSystemMoney(account.salesToday)} today
                                        </p>
                                      </div>

                                      <button
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={actionBusyKey === actionKey}
                                        onClick={() => void handleAssignCardToAccount(account)}
                                        type="button"
                                      >
                                        {actionBusyKey === actionKey ? "Assigning" : "Assign SC card"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grid gap-4">
                            <div className="executive-status-panel">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Plan mix
                              </p>
                              <div className="mt-4 grid gap-3">
                                {adminOrganizationPlanMix.map((item) => (
                                  <div
                                    className="executive-status-item flex items-center justify-between gap-3"
                                    key={item.label}
                                  >
                                    <span className="text-sm text-slate-300">{item.label}</span>
                                    <strong className="text-sm text-white">{item.count}</strong>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="executive-status-panel">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Sector mix
                              </p>
                              <div className="mt-4 grid gap-3">
                                {adminOrganizationSectorMix.map((item) => (
                                  <div
                                    className="executive-status-item flex items-center justify-between gap-3"
                                    key={item.label}
                                  >
                                    <span className="text-sm text-slate-300">{item.label}</span>
                                    <strong className="text-sm text-white">{item.count}</strong>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>

                      <article
                        className={`rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 ${
                          showAdminPaymentsPanel ? "xl:col-span-2" : "hidden"
                        }`}
                        id="system-payments"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Payments
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Payment approvals
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              Managed plans stay pending until admin approves or rejects the
                              request.
                            </p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Pending
                              </p>
                              <strong className="mt-2 block text-2xl font-black text-white">
                                {pendingAdminPayments.length}
                              </strong>
                            </div>
                            <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Approved
                              </p>
                              <strong className="mt-2 block text-2xl font-black text-white">
                                {approvedAdminPayments.length}
                              </strong>
                            </div>
                            <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Rejected
                              </p>
                              <strong className="mt-2 block text-2xl font-black text-white">
                                {rejectedAdminPayments.length}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 space-y-3">
                          {adminPaymentsForReview.length > 0 ? (
                            adminPaymentsForReview.map((payment) => {
                              const approveActionKey = `approved-payment-${payment.id}`;
                              const rejectActionKey = `rejected-payment-${payment.id}`;
                              const activationActionKey = payment.linkedCardCode
                                ? `validate-card-${payment.linkedCardCode}`
                                : "";
                              const canActivateLinkedCard =
                                Boolean(payment.linkedCardCode) &&
                                payment.linkedCardStatus === "assigned";

                              return (
                                <div
                                  className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                                  key={payment.id}
                                >
                                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-3">
                                        <strong className="text-sm text-white">
                                          {payment.company}
                                        </strong>
                                        <span
                                          className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${paymentStatusClass(
                                            payment.status,
                                          )}`}
                                        >
                                          {paymentStatusCopy(payment.status)}
                                        </span>
                                        {payment.linkedCardStatus ? (
                                          <span
                                            className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${smartCardStatusClass(
                                              payment.linkedCardStatus,
                                            )}`}
                                          >
                                            {smartCardStatusCopy(payment.linkedCardStatus)}
                                          </span>
                                        ) : null}
                                      </div>
                                      <p className="mt-2 text-sm leading-6 text-slate-400">
                                        {payment.planName} /{" "}
                                        {paymentMethodLabel(payment.paymentMethod)} / ****{" "}
                                        {payment.last4}
                                      </p>
                                      <p className="mt-2 text-xs leading-6 text-cyan-200">
                                        {payment.linkedCardCode
                                          ? `Linked SC card / ${payment.linkedCardCode}${
                                              payment.linkedCardSectorLabel
                                                ? ` / ${payment.linkedCardSectorLabel}`
                                                : ""
                                            }`
                                          : payment.status === "pending"
                                            ? "Awaiting admin decision before SC card linking."
                                            : payment.status === "rejected"
                                              ? "Request was stopped before SC card assignment."
                                              : "Approval completed. Linked card will appear here."}
                                      </p>
                                      {payment.approvalNote ? (
                                        <p className="mt-2 text-xs leading-6 text-slate-500">
                                          Note / {payment.approvalNote}
                                        </p>
                                      ) : null}
                                    </div>

                                    <div className="flex flex-col items-start gap-3 lg:items-end">
                                      <span className="text-sm font-bold text-cyan-200">
                                        {formatSystemMoney(payment.amount)}
                                      </span>
                                      <p className="text-xs text-slate-500">
                                        {formatSystemDate(
                                          payment.approvalRequestedAt || payment.createdAt,
                                        )}
                                      </p>
                                      <div className="flex flex-wrap gap-2 lg:justify-end">
                                        {payment.status === "pending" ? (
                                          <>
                                            <button
                                              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                                              disabled={actionBusyKey === approveActionKey}
                                              onClick={() =>
                                                void handleAdminPaymentAction(
                                                  payment,
                                                  "approved",
                                                )
                                              }
                                              type="button"
                                            >
                                              {actionBusyKey === approveActionKey
                                                ? "Approving"
                                                : "Approve"}
                                            </button>
                                            <button
                                              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-red-100 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                                              disabled={actionBusyKey === rejectActionKey}
                                              onClick={() =>
                                                void handleAdminPaymentAction(
                                                  payment,
                                                  "rejected",
                                                )
                                              }
                                              type="button"
                                            >
                                              {actionBusyKey === rejectActionKey
                                                ? "Rejecting"
                                                : "Reject"}
                                            </button>
                                          </>
                                        ) : null}
                                        {canActivateLinkedCard ? (
                                          <button
                                            className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled={actionBusyKey === activationActionKey}
                                            onClick={() =>
                                              void handleAdminActivateCard(
                                                payment.linkedCardCode,
                                                payment.company,
                                              )
                                            }
                                            type="button"
                                          >
                                            {actionBusyKey === activationActionKey
                                              ? "Activating"
                                              : "Activate linked card"}
                                          </button>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <EmptyCard message="No payment approvals are waiting right now. New plan requests will appear here as pending." />
                          )}
                        </div>
                      </article>

                      <article
                        className={`rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 ${
                          showAdminCardsPanel ? "" : "hidden"
                        }`}
                        id="system-cards"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              SC cards
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              SC card inventory
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              Review plan-linked SC cards with sorting and direct activation
                              control.
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={actionBusyKey === "reset-smart-cards"}
                              onClick={() => void handleResetSmartCards()}
                              type="button"
                            >
                              {actionBusyKey === "reset-smart-cards"
                                ? "Resetting..."
                                : "Reset 500/plan"}
                            </button>
                            {[
                              ["updated", "Latest"],
                              ["code", "Code"],
                              ["status", "Status"],
                            ].map(([value, label]) => {
                              const active = adminCardSort === value;

                              return (
                                <button
                                  className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
                                    active
                                      ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                                      : "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                                  }`}
                                  key={value}
                                  onClick={() => setAdminCardSort(value as AdminCardSort)}
                                  type="button"
                                >
                                  Sort {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {landingContent.plans.map((plan) => {
                            const active = selectedAdminCardPlan === plan.slug;
                            const count = adminOverview.smartCards.filter(
                              (card) => card.plan === plan.slug,
                            ).length;

                            return (
                              <button
                                className={`rounded-full border px-4 py-2 text-left transition ${
                                  active
                                    ? "border-cyan-400/20 bg-cyan-400/10 text-white"
                                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]"
                                }`}
                                key={plan.slug}
                                onClick={() => setSelectedAdminCardPlan(plan.slug)}
                                type="button"
                              >
                                <span className="block text-sm font-bold">{plan.name}</span>
                                <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                  {count} cards
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-4">
                          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              In plan
                            </p>
                            <h3 className="mt-2 text-2xl font-black text-white">
                              {adminCardsForSelectedPlan.length}
                            </h3>
                          </div>
                          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              Available
                            </p>
                            <h3 className="mt-2 text-2xl font-black text-white">
                              {
                                adminCardsForSelectedPlan.filter(
                                  (card) => card.status === "available",
                                ).length
                              }
                            </h3>
                          </div>
                          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              Assigned
                            </p>
                            <h3 className="mt-2 text-2xl font-black text-white">
                              {
                                adminCardsForSelectedPlan.filter(
                                  (card) => card.status === "assigned",
                                ).length
                              }
                            </h3>
                          </div>
                          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              Activated
                            </p>
                            <h3 className="mt-2 text-2xl font-black text-white">
                              {
                                adminCardsForSelectedPlan.filter(
                                  (card) => card.status === "activated",
                                ).length
                              }
                            </h3>
                          </div>
                        </div>

                        <div className="mt-5 rounded-[26px] border border-white/10 bg-black/10 p-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-300">
                              Showing{" "}
                              <strong className="text-white">
                                {landingContent.plans.find(
                                  (plan) => plan.slug === selectedAdminCardPlan,
                                )?.name ?? "Selected"}
                              </strong>{" "}
                              inventory.
                            </p>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              500 cards per plan
                            </p>
                          </div>
                          <div className="mt-4 max-h-[44rem] space-y-3 overflow-auto pr-1">
                            {adminCardsForSelectedPlan.length > 0 ? (
                              adminCardsForSelectedPlan.map((card) => {
                                const actionKey = `validate-card-${card.code}`;
                                const canActivate = card.status === "assigned";

                                return (
                                  <div
                                    className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                                    key={card.id}
                                  >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                      <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                          <strong className="text-sm text-white">
                                            {card.code}
                                          </strong>
                                          <span
                                            className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${smartCardStatusClass(
                                              card.status,
                                            )}`}
                                          >
                                            {smartCardStatusCopy(card.status)}
                                          </span>
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                          {card.planName} / {card.sectorLabel} /{" "}
                                          {card.ownerCompany || "No company yet"}
                                        </p>
                                        <p className="mt-2 text-xs leading-6 text-slate-500">
                                          Last update {formatSystemDate(card.updatedAt)}
                                        </p>
                                      </div>

                                      <button
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={!canActivate || actionBusyKey === actionKey}
                                        onClick={() =>
                                          void handleAdminActivateCard(
                                            card.code,
                                            card.ownerCompany,
                                          )
                                        }
                                        type="button"
                                      >
                                        {actionBusyKey === actionKey
                                          ? "Activating"
                                          : canActivate
                                            ? "Activate now"
                                            : card.status === "available"
                                              ? "Awaiting assign"
                                              : "Already live"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <EmptyCard message="No SC cards are loaded for this plan yet. The board will fill as soon as the runtime inventory syncs." />
                            )}
                          </div>
                        </div>
                      </article>

                      <article
                        className={`rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 ${
                          showAdminCardsPanel ? "" : "hidden"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Activations
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Activation history
                            </h2>
                          </div>
                          <Activity className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 space-y-3">
                          {adminOverview.activations.length > 0 ? (
                            adminOverview.activations.map((activation) => {
                              const actionKey = `activation-${activation.id}`;
                              const canAdvance = activation.status !== "live";

                              return (
                                <div
                                  className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                                  key={activation.id}
                                >
                                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                      <strong className="text-sm text-white">
                                        {activation.deviceName}
                                      </strong>
                                      <p className="mt-2 text-sm leading-6 text-slate-400">
                                        {activation.company} / {activation.site} /{" "}
                                        {activation.status}
                                      </p>
                                    </div>
                                    <button
                                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                                      disabled={!canAdvance || actionBusyKey === actionKey}
                                      onClick={() => void handleAdvanceActivation(activation)}
                                      type="button"
                                    >
                                      {actionBusyKey === actionKey
                                        ? "Updating"
                                        : canAdvance
                                          ? `Move to ${nextActivationStatus(activation.status)}`
                                          : "Completed"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <EmptyCard message="No rollout history is active right now. New deployment requests will show up here." />
                          )}
                        </div>
                      </article>

                      <article
                        className={`rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 xl:col-span-2 ${
                          showAdminSupportPanel ? "" : "hidden"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Tickets
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Support workflow
                            </h2>
                          </div>
                          <Ticket className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 space-y-3">
                          {adminOverview.tickets.length > 0 ? (
                            adminOverview.tickets.map((ticket) => {
                              const actionKey = `ticket-${ticket.id}`;
                              const canAdvance = ticket.status !== "resolved";

                              return (
                                <div
                                  className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                                  key={ticket.id}
                                >
                                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                      <strong className="text-sm text-white">
                                        {ticket.company}
                                      </strong>
                                      <p className="mt-2 text-sm leading-6 text-slate-400">
                                        {ticket.category} / {ticket.priority} / {ticket.status}
                                      </p>
                                    </div>
                                    <button
                                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                                      disabled={!canAdvance || actionBusyKey === actionKey}
                                      onClick={() => void handleAdvanceTicket(ticket)}
                                      type="button"
                                    >
                                      {actionBusyKey === actionKey
                                        ? "Updating"
                                        : canAdvance
                                          ? `Move to ${nextTicketStatus(ticket.status)}`
                                          : "Resolved"}
                                    </button>
                                  </div>
                                  <p className="mt-3 text-sm leading-6 text-slate-300">
                                    {ticket.summary}
                                  </p>
                                </div>
                              );
                            })
                          ) : (
                            <EmptyCard message="Support history is empty. Escalations and follow-up tickets will surface here later." />
                          )}
                        </div>
                      </article>
                    </div>
                  </section>
                ) : (
                  <section
                    className={`space-y-6 ${
                      showClientAccountPanel ||
                      showClientAccessPanel ||
                      showClientBillingPanel ||
                      showClientDeploymentPanel ||
                      showClientSupportPanel
                        ? ""
                        : "hidden"
                    }`}
                    id="system-role"
                  >
                    <section
                      className={showClientAccountPanel ? "" : "hidden"}
                      id="client-account"
                    >
                      <PortalAccountCenter
                        availablePlans={landingContent.plans}
                        company={clientOverview.account?.company ?? authSession.user.company}
                        linkedCardsCount={clientOverview.smartCards.length}
                        onChangePassword={handlePasswordSave}
                        onPickPlan={(planSlug) => setSelectedClientPlanSlug(planSlug)}
                        onPrimaryAction={() => scrollToSection("client-plan-board")}
                        onSaveProfile={handleProfileSave}
                        onSecondaryAction={() => scrollToSection("client-billing")}
                        openTicketsCount={clientOverview.tickets.length}
                        passwordBusy={passwordSaveBusy}
                        passwordMessage={passwordMessage}
                        pendingPaymentsCount={pendingClientPaymentsCount}
                        planName={
                          selectedClientPlan?.name ??
                          clientOverview.account?.planName ??
                          "Free"
                        }
                        primaryActionLabel="Open access board"
                        role="client"
                        routeLabel={vpnActive ? vpnSession?.location ?? "Protected route" : "Direct route"}
                        saveBusy={profileSaveBusy}
                        saveMessage={profileMessage}
                        secondaryActionLabel="Open billing"
                        sectorLabel={
                          clientOverview.account?.sectorLabel ??
                          activeSector?.name ??
                          "Workspace lane"
                        }
                        selectedPlanSlug={selectedClientPlan?.slug}
                        sessionLabel={formatSystemDate(authSession.issuedAt)}
                        userEmail={authSession.user.email}
                        userName={authSession.user.name}
                      />
                    </section>

                    <div
                      className={`workspace-client-grid grid gap-6 xl:grid-cols-[0.8fr_1.2fr] ${
                        showClientAccessPanel || showClientSupportPanel ? "" : "hidden"
                      }`}
                    >
                      <article
                        className={`workspace-client-sidebar-card rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 xl:col-span-2 ${
                          showClientAccessPanel || showClientSupportPanel ? "" : "hidden"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Account
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Workspace summary
                            </h2>
                          </div>
                          <HardDrive className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 grid gap-4">
                          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                  Company
                                </p>
                                <h3 className="mt-2 text-2xl font-black text-white">
                                  {clientOverview.account?.company ?? authSession.user.company}
                                </h3>
                                <p className="mt-2 text-sm text-slate-400">
                                  {clientOverview.account?.planName ?? "No active plan"}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="workspace-summary-pill">
                                  {clientAccessStateLabel}
                                </span>
                                <span className="workspace-summary-pill">
                                  {clientOverview.account?.sectorLabel ??
                                    activeSector?.name ??
                                    "brAIn workspace"}
                                </span>
                                <span className="workspace-summary-pill">
                                  {clientOverview.payments.length} payments
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="workspace-overview-strip workspace-overview-strip-compact">
                            <article className="workspace-overview-card">
                              <span className="workspace-overview-label">Sales today</span>
                              <strong className="workspace-overview-value">
                                {formatSystemMoney(clientOverview.account?.salesToday ?? 0)}
                              </strong>
                              <p className="workspace-overview-copy">
                                Commercial activity captured in the current client window.
                              </p>
                            </article>
                            <article className="workspace-overview-card">
                              <span className="workspace-overview-label">Calls handled</span>
                              <strong className="workspace-overview-value">
                                {String(clientOverview.account?.callsHandled ?? 0)}
                              </strong>
                              <p className="workspace-overview-copy">
                                Voice and support interactions processed through brAIn.
                              </p>
                            </article>
                            <article className="workspace-overview-card">
                              <span className="workspace-overview-label">Tasks automated</span>
                              <strong className="workspace-overview-value">
                                {String(clientOverview.account?.tasksAutomated ?? 0)}
                              </strong>
                              <p className="workspace-overview-copy">
                                Automated flows completed for this workspace account.
                              </p>
                            </article>
                            <article className="workspace-overview-card">
                              <span className="workspace-overview-label">
                                Credits remaining
                              </span>
                              <strong className="workspace-overview-value">
                                {clientOverview.account?.creditsRemaining?.toLocaleString(
                                  "en-GB",
                                ) ?? 0}
                              </strong>
                              <p className="workspace-overview-copy">
                                Available usage capacity left in the current cycle.
                              </p>
                            </article>
                          </div>
                          <div className="grid gap-4">
                            <div className="overflow-hidden rounded-[24px] border border-[rgba(212,90,52,0.18)] bg-[linear-gradient(135deg,rgba(84,49,32,0.96),rgba(8,14,22,0.97))] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
                              <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border border-white/10 bg-black/20">
                                  <ShieldCheck className="h-9 w-9 text-[#ffe7dc]" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs uppercase tracking-[0.2em] text-[#f0cdb8]/70">
                                    Recommended action
                                  </p>
                                  <h3 className="mt-2 text-lg font-black text-white">
                                    Next step
                                  </h3>
                                  <p className="mt-2 text-sm leading-7 text-slate-200">
                                    {petAdviceCopy}
                                  </p>
                                </div>
                              </div>
                              <button
                                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.12]"
                                onClick={() => scrollToSection("client-plan-board")}
                                type="button"
                              >
                                Open access board
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>

                      <article
                        className={`client-access-board workspace-client-main-card rounded-[34px] border p-5 sm:p-6 xl:col-span-2 ${
                          showClientAccessPanel ? "" : "hidden"
                        }`}
                        id="client-plan-board"
                        style={clientAccessCardStyle}
                      >
                        <div className="client-access-board-head">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Access
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Choose plan and continue access
                            </h2>
                            <p className="client-access-board-copy">
                              Keep the selected lane, SC card flow, and approval state grouped in
                              one cleaner workspace block.
                            </p>
                          </div>
                          <div className="client-access-board-icon">
                            <Ticket className="h-6 w-6 text-cyan-200" />
                          </div>
                        </div>

                        <div className="client-access-summary-row">
                          <div className="client-access-summary-card">
                            <div className="flex flex-wrap gap-2">
                              <span className="workspace-summary-pill">
                                {selectedClientPlan?.name ??
                                  clientOverview.account?.planName ??
                                  "Free"}
                              </span>
                              <span className="workspace-summary-pill">
                                {selectedClientPlan?.slug === "free"
                                  ? "Instant validation"
                                  : "Managed approval"}
                              </span>
                              <span className="workspace-summary-pill">
                                {clientOverview.account?.company ?? authSession.user.company}
                              </span>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-slate-300">
                              {selectedClientPlan?.slug === "free"
                                ? "Choose the lane, generate the SC code, and validate it from the same workspace."
                                : pendingPlanPayment
                                  ? "This request is already in admin review. Keep approval, payment, and linked access together below."
                                  : hasLinkedSelectedPlanAccess
                                    ? "This plan already has linked SC access. Use the cards below to follow its current status."
                                    : latestRejectedPlanPayment
                                      ? "The latest request for this plan was rejected. Review the billing details and send it again from here."
                                      : "Pick a managed plan, send the request, and track approval without leaving this view."}
                            </p>
                          </div>
                          <article className="workspace-overview-card client-access-step-card">
                            <span className="workspace-overview-label">Current step</span>
                            <strong className="workspace-overview-value">
                              {selectedClientPlan?.slug === "free"
                                ? activeScratchCode
                                  ? "Validate code"
                                  : "Generate code"
                                : pendingPlanPayment
                                  ? "Await approval"
                                  : hasLinkedSelectedPlanAccess
                                    ? selectedPlanSmartCard?.status === "activated"
                                      ? "Card active"
                                      : "Use linked card"
                                    : latestRejectedPlanPayment
                                      ? "Retry request"
                                      : "Send request"}
                            </strong>
                            <p className="workspace-overview-copy">
                              {selectedClientPlan?.slug === "free"
                                ? "The animated card below creates the SC code and keeps validation in the same flow."
                                : pendingPlanPayment
                                  ? "Admin has the request in queue, so the next visible update will be approval or rejection."
                                  : hasLinkedSelectedPlanAccess
                                    ? "The selected plan already has a linked SC card, so the next step is to track its live status."
                                    : latestRejectedPlanPayment
                                      ? "The previous request was rejected, so the next step is to review and resend it."
                                      : "Once submitted, the request stays linked to billing and SC card assignment."}
                            </p>
                          </article>
                        </div>

                        <div className="client-access-board-body">
                          <section className="client-access-plan-column">
                            <div className="client-access-section-head">
                              <div>
                                <p className="client-access-section-kicker">Plan lane</p>
                                <h3 className="client-access-section-title">
                                  Select the access path
                                </h3>
                              </div>
                              <span className="workspace-summary-pill">
                                {landingContent.plans.length} plans
                              </span>
                            </div>

                            <div className="client-plan-grid client-plan-grid-compact mt-4">
                              {landingContent.plans.map((plan) => {
                                const selected = selectedClientPlan?.slug === plan.slug;
                                const isFreePlan = plan.slug === "free";

                                return (
                                  <button
                                    className={`client-plan-card ${
                                      selected ? "client-plan-card-selected" : ""
                                    }`}
                                    key={plan.slug}
                                    onClick={() => handleClientPlanSelect(plan)}
                                    style={
                                      selected
                                        ? getSectorPanelStyle(clientSector?.accent, !isDarkMode)
                                        : undefined
                                    }
                                    type="button"
                                  >
                                    <div className="client-plan-card-head">
                                      <div>
                                        <p className="client-plan-card-kicker">
                                          {isFreePlan
                                            ? "Free access"
                                            : plan.featured
                                              ? "Recommended managed plan"
                                              : "Managed plan"}
                                        </p>
                                        <h3 className="client-plan-card-title">{plan.name}</h3>
                                      </div>
                                      <span
                                        className={`client-plan-card-badge ${
                                          isFreePlan
                                            ? "client-plan-card-badge-free"
                                            : "client-plan-card-badge-managed"
                                        }`}
                                      >
                                        {isFreePlan ? "Auto code" : "Admin flow"}
                                      </span>
                                    </div>

                                    <p className="client-plan-card-summary">{plan.summary}</p>

                                    <div className="client-plan-card-pills">
                                      <span>{plan.supportLabel}</span>
                                      <span>
                                        {isFreePlan ? "Instant validation" : "Admin approval"}
                                      </span>
                                    </div>

                                    <div className="client-plan-card-footer">
                                      <div className="client-plan-card-price">
                                        <strong>
                                          {isFreePlan
                                            ? "No payment required"
                                            : `${formatSystemMoney(plan.annualPrice)} / admin approval`}
                                        </strong>
                                        <span>{selected ? "Selected now" : "Choose plan"}</span>
                                      </div>
                                      <span className="client-plan-card-device">
                                        {plan.deviceAllowance}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </section>

                          <section className="client-access-workspace-column">
                            <article className="client-access-preview-card">
                              <div className="client-access-section-head client-access-section-head-tight">
                                <div>
                                  <p className="client-access-section-kicker">SC card preview</p>
                                  <h3 className="client-access-section-title">
                                    {selectedClientPlan?.slug === "free"
                                      ? "Workspace access card"
                                      : "Managed access request"}
                                  </h3>
                                </div>
                                <span className="workspace-summary-pill">
                                  {selectedClientPlan?.slug === "free"
                                    ? activeScratchCode
                                      ? "Code ready"
                                      : "Auto code"
                                    : pendingPlanPayment
                                      ? "Pending admin"
                                      : hasLinkedSelectedPlanAccess
                                        ? "Linked access"
                                        : "Await request"}
                                </span>
                              </div>

                              <div className="client-access-scratch-wrap">
                                <BrainScratchCard
                                  actionLabelOverride={
                                    selectedClientPlan?.slug === "free"
                                      ? scratchBusy
                                        ? activeScratchCode
                                          ? "Validating..."
                                          : "Generating..."
                                        : activeScratchCode
                                          ? "Validate Card"
                                          : "Generate Card"
                                      : pendingPlanPayment
                                        ? "Request pending"
                                        : hasLinkedSelectedPlanAccess
                                          ? selectedPlanSmartCard?.status === "activated"
                                            ? "Card active"
                                            : "Access linked"
                                          : paymentBusy
                                            ? "Sending request..."
                                            : latestRejectedPlanPayment
                                              ? "Send again"
                                              : "Contact admin"
                                  }
                                  backCopyOverride={
                                    selectedClientPlan?.slug === "free"
                                      ? freePlanCardRevealed
                                        ? "Generated automatically for this workspace. Validate it without manual typing."
                                        : "Generate a free SC code directly from this card. No manual input is required."
                                      : pendingPlanPayment
                                        ? "Payment details were sent. Wait for admin approval before activation."
                                        : hasLinkedSelectedPlanAccess
                                          ? "This plan already has linked SC access in the current workspace."
                                          : latestRejectedPlanPayment
                                            ? "The latest request was rejected. Review the details and send a fresh request."
                                            : "Paid plans stay managed. Send the request and let admin approve it."
                                  }
                                  backLabelOverride={
                                    selectedClientPlan?.slug === "free"
                                      ? "Generated code"
                                      : "Approval state"
                                  }
                                  busy={
                                    selectedClientPlan?.slug === "free" ? scratchBusy : paymentBusy
                                  }
                                  code={
                                    selectedClientPlan?.slug === "free"
                                      ? activeScratchCode || "AUTO-CODE"
                                      : hasLinkedSelectedPlanAccess
                                        ? approvedPlanPayment?.linkedCardCode ||
                                          selectedPlanSmartCard?.code ||
                                          "APPROVED"
                                        : pendingPlanPayment
                                          ? "PENDING-ADMIN"
                                          : latestRejectedPlanPayment
                                            ? "RETRY-REQUEST"
                                            : "CONTACT-ADMIN"
                                  }
                                  compact
                                  descriptionOverride={
                                    selectedClientPlan?.slug === "free"
                                      ? "Generate one workspace code here, then validate it in the same step."
                                      : "Send one managed request here, then continue after approval."
                                  }
                                  lockedLabelOverride={
                                    selectedClientPlan?.slug === "free"
                                      ? "AUTO READY"
                                      : "ADMIN REVIEW"
                                  }
                                  mode={selectedClientPlan?.slug === "free" ? "validate" : "reveal"}
                                  onAction={
                                    selectedClientPlan?.slug === "free"
                                      ? () => void handleScratchAccessCard()
                                      : !pendingPlanPayment && !hasLinkedSelectedPlanAccess
                                        ? () => void handleClientPlanRequest()
                                        : undefined
                                  }
                                  planLabel={
                                    selectedClientPlan?.name ||
                                    clientOverview.account?.planName ||
                                    "Free"
                                  }
                                  pillLabelOverride={
                                    selectedClientPlan?.slug === "free"
                                      ? "brAIn workspace access"
                                      : "brAIn managed approval"
                                  }
                                  revealed={
                                    selectedClientPlan?.slug === "free"
                                      ? freePlanCardRevealed
                                      : Boolean(planScopedPayment) ||
                                        Boolean(selectedPlanSmartCard) ||
                                        paymentBusy
                                  }
                                  sectorLabel={
                                    selectedPlanSmartCard?.sectorLabel ||
                                    scratchStatus.sector ||
                                    clientOverview.account?.sectorLabel ||
                                    "brAIn"
                                  }
                                  titleOverride={
                                    selectedClientPlan?.slug === "free"
                                      ? "Workspace Access Card"
                                      : "Managed Access Request"
                                  }
                                  tone="light"
                                />
                              </div>
                            </article>

                            <div
                              className={`client-plan-note client-access-note ${
                                selectedClientPlan?.slug === "free"
                                  ? "client-plan-note-free"
                                  : "client-plan-note-managed"
                              }`}
                              id="client-validate"
                            >
                              <p
                                className={`client-plan-note-copy ${
                                  selectedClientPlan?.slug === "free"
                                    ? "client-plan-note-copy-dark"
                                    : "client-plan-note-copy-light"
                                }`}
                              >
                                {selectedClientPlan?.slug === "free"
                                  ? "Free plan now generates the SC code automatically from this animated card. Reveal it here, then validate it without typing."
                                  : hasLinkedSelectedPlanAccess
                                    ? "This managed plan already has linked SC access. Track the latest card status and billing state from the same workspace."
                                    : "This plan stays under admin control. Send the request and wait for approval before SC card linking or activation."}
                              </p>
                              {selectedClientPlan?.slug === "free" && scratchStatus.hasActiveReservation ? (
                                <p className="client-plan-note-meta client-plan-note-meta-dark mt-3">
                                  Active reservation / {activeScratchCode || "SC code ready"} /
                                  {" "}Sector {scratchStatus.sector} / Plan {scratchStatus.plan}
                                </p>
                              ) : null}
                              {selectedClientPlan?.slug !== "free" && planScopedPayment ? (
                                <p className="client-plan-note-meta client-plan-note-meta-light mt-3">
                                  Latest request / {paymentStatusCopy(planScopedPayment.status)} /{" "}
                                  {paymentMethodLabel(planScopedPayment.paymentMethod)}
                                </p>
                              ) : null}
                              {selectedClientPlan?.slug !== "free" &&
                              !planScopedPayment &&
                              selectedPlanSmartCard ? (
                                <p className="client-plan-note-meta client-plan-note-meta-light mt-3">
                                  Linked SC card / {selectedPlanSmartCard.code} /{" "}
                                  {smartCardStatusCopy(selectedPlanSmartCard.status)}
                                </p>
                              ) : null}
                            </div>

                            {selectedClientPlan?.slug === "free" ? (
                              <div className="client-access-meta-grid">
                                <div className="client-access-mini-card client-access-mini-card-highlight">
                                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                    Generated SC code
                                  </p>
                                  <p className="mt-3 text-2xl font-black tracking-[0.24em] text-white">
                                    {activeScratchCode || "AUTO-CODE"}
                                  </p>
                                  <p className="mt-3 text-sm leading-7 text-slate-300">
                                    {activeScratchCode
                                      ? "This code was prepared automatically for the current client session."
                                      : "The system will reveal a free SC code automatically after you press Generate Card."}
                                  </p>
                                </div>

                                <div className="client-access-mini-card">
                                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                    Session status
                                  </p>
                                  <p className="mt-3 text-sm font-semibold text-white">
                                    {scratchStatus.hasActiveReservation
                                      ? "Ready for validation"
                                      : "Waiting for generated card"}
                                  </p>
                                  <p className="mt-3 text-sm leading-7 text-slate-300">
                                    {formatScratchExpiry(scratchStatus.expiresIn)}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="client-access-payment-card">
                                <div className="client-access-section-head client-access-section-head-tight">
                                  <div>
                                    <p className="client-access-section-kicker">
                                      Payment + approval
                                    </p>
                                    <h3 className="client-access-section-title">
                                      Send the managed request
                                    </h3>
                                  </div>
                                  <span className="workspace-summary-pill">
                                    {paymentMethodLabel(selectedPaymentMethod)}
                                  </span>
                                </div>
                                <div className="mt-4 space-y-4">
                                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    {clientPaymentMethods.map((method) => {
                                      const active = selectedPaymentMethod === method.value;

                                      return (
                                        <button
                                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                            active
                                              ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                                              : "border-white/10 bg-black/20 text-slate-200 hover:bg-white/[0.05]"
                                          }`}
                                          key={method.value}
                                          onClick={() => setSelectedPaymentMethod(method.value)}
                                          type="button"
                                        >
                                          {method.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <label className="field-shell">
                                    <span>Contact name</span>
                                    <input
                                      className="field-input"
                                      onChange={(event) => setPaymentCardholder(event.target.value)}
                                      placeholder="Admin contact for approval"
                                      type="text"
                                      value={paymentCardholder}
                                    />
                                  </label>
                                  {selectedPaymentMethod === "paypal" ? (
                                    <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/5 px-4 py-3 text-sm text-slate-300">
                                      PayPal requests go straight to admin review and return as
                                      pending until approval.
                                    </div>
                                  ) : (
                                    <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
                                      <label className="field-shell">
                                        <span>Card number</span>
                                        <input
                                          className="field-input"
                                          onChange={(event) => setPaymentCardNumber(event.target.value)}
                                          placeholder="4111 1111 1111 1111"
                                          type="text"
                                          value={paymentCardNumber}
                                        />
                                      </label>
                                      <label className="field-shell">
                                        <span>Expiry</span>
                                        <input
                                          className="field-input"
                                          onChange={(event) => setPaymentExpiry(event.target.value)}
                                          placeholder="MM/YY"
                                          type="text"
                                          value={paymentExpiry}
                                        />
                                      </label>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {(selectedClientPlan?.slug === "free"
                              ? scratchMessage
                              : paymentMessage) ? (
                              <p
                                className={`client-access-feedback rounded-2xl px-4 py-3 text-sm ${
                                  (selectedClientPlan?.slug === "free"
                                    ? scratchMessage?.tone
                                    : paymentMessage?.tone) === "error"
                                    ? "bg-red-500/10 text-red-200"
                                    : (selectedClientPlan?.slug === "free"
                                          ? scratchMessage?.tone
                                          : paymentMessage?.tone) === "success"
                                      ? "bg-emerald-500/10 text-emerald-200"
                                      : "bg-cyan-500/10 text-cyan-200"
                                }`}
                              >
                                {selectedClientPlan?.slug === "free"
                                  ? scratchMessage?.text
                                  : paymentMessage?.text}
                              </p>
                            ) : null}
                          </section>
                        </div>
                      </article>

                      {landingContent.sectors.length > 0 &&
                      activeSector &&
                      showClientDeploymentPanel ? (
                        <article
                          className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 xl:col-span-2"
                          id="client-sectors"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                Sector
                              </p>
                              <h2 className="mt-2 text-2xl font-black text-white">
                                Sector fit and rollout
                              </h2>
                              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                                Compare each deployment lane, keep the active device in
                                view, and review rollout fit with sector-specific context.
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <span
                                className="rounded-full border px-4 py-2 text-sm font-semibold"
                                style={getSectorBadgeStyle(activeSector.accent, !isDarkMode)}
                              >
                                Selected sector: {activeSector.name}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200">
                                {clientOverview.account?.planName ?? "Client plan"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                            {landingContent.sectors.map((sector, index) => {
                              const selected = sector.slug === activeSector.slug;
                              const clientMatch = sector.slug === clientSector?.slug;

                              return (
                                <motion.button
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`rounded-[28px] border p-4 text-left transition ${
                                    selected
                                      ? "bg-black/30"
                                      : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                                  }`}
                                  initial={{ opacity: 0, y: 18 }}
                                  key={sector.slug}
                                  onClick={() => setActiveSectorSlug(sector.slug)}
                                  style={
                                    selected
                                      ? getSectorPanelStyle(sector.accent, !isDarkMode)
                                      : undefined
                                  }
                                  transition={{ delay: index * 0.05, duration: 0.35 }}
                                  type="button"
                                  whileHover={{ y: -4 }}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                        Sector {index + 1}
                                      </p>
                                      <h3 className="mt-2 text-xl font-black text-white">
                                        {sector.name}
                                      </h3>
                                    </div>
                                    {clientMatch ? (
                                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                                        Client match
                                      </span>
                                    ) : null}
                                  </div>

                                  <p className="mt-4 text-sm leading-7 text-slate-300">
                                    {sector.summary}
                                  </p>

                                  <div className="mt-4 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-cyan-200">
                                      {sector.statValue}
                                    </span>
                                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                      {selected ? "Viewing" : "Open sector"}
                                    </span>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>

                          <div className="mt-6 grid gap-5 xl:grid-cols-[1.16fr_0.84fr]">
                            <motion.div
                              animate={{ opacity: 1, x: 0 }}
                              className="h-full"
                              initial={{ opacity: 0, x: -18 }}
                              key={activeSector.slug}
                              transition={{ duration: 0.4 }}
                            >
                              <SectorLiveBoard
                                device={activeDevice}
                                lightMode={!isDarkMode}
                                plans={landingContent.plans}
                                sector={activeSector}
                              />
                            </motion.div>

                            <motion.div
                              animate={{ opacity: 1, x: 0 }}
                              className="space-y-4"
                              initial={{ opacity: 0, x: 18 }}
                              key={`${activeSector.slug}-advice`}
                              transition={{ duration: 0.4 }}
                            >
                              <div
                                className="rounded-[28px] border p-5"
                                style={getSectorPanelStyle(activeSector.accent, !isDarkMode)}
                              >
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                                  Selected lane
                                </p>
                                <h3 className="mt-3 text-2xl font-black text-white">
                                  {activeSector.title}
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-slate-300">
                                  {activeSector.summary}
                                </p>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                    Best fit
                                  </p>
                                  <p className="mt-3 text-sm font-semibold leading-7 text-white">
                                    {activeSector.audience}
                                  </p>
                                </div>
                                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                    Device
                                  </p>
                                  <p className="mt-3 text-sm font-semibold leading-7 text-white">
                                    {activeDevice?.name ?? "brAIn device"}
                                  </p>
                                  <p className="mt-2 text-xs leading-6 text-slate-400">
                                    {activeDevice?.tagline ?? activeSector.statValue}
                                  </p>
                                </div>
                              </div>

                              {sectorRuntimeCards.map((card, index) => (
                                <motion.div
                                  animate={{ opacity: 1, y: 0 }}
                                  className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                                  initial={{ opacity: 0, y: 14 }}
                                  key={`${activeSector.slug}-${card.label}`}
                                  transition={{ delay: index * 0.05, duration: 0.28 }}
                                >
                                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                    {card.label}
                                  </p>
                                  <p className="mt-2 text-sm font-semibold leading-7 text-white">
                                    {card.value}
                                  </p>
                                </motion.div>
                              ))}

                              {activeSector.capabilities.map((capability, index) => (
                                <motion.div
                                  animate={{ opacity: 1, y: 0 }}
                                  className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                                  initial={{ opacity: 0, y: 14 }}
                                  key={capability}
                                  transition={{ delay: index * 0.06, duration: 0.28 }}
                                >
                                  <p className="text-sm font-semibold text-white">
                                    {capability}
                                  </p>
                                </motion.div>
                              ))}

                              {activeDevice ? (
                                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                    Device ports
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {activeDevice.ports.slice(0, 6).map((port) => (
                                      <span
                                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-200"
                                        key={port}
                                      >
                                        {port}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </motion.div>
                          </div>
                        </article>
                      ) : null}
                    </div>

                    <div
                      className={`grid gap-6 xl:grid-cols-2 ${
                        showClientBillingPanel || showClientSupportPanel ? "" : "hidden"
                      }`}
                    >
                      <article
                        className={`rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 ${
                          showClientBillingPanel ? "" : "hidden"
                        }`}
                        id="client-billing"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Billing
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Billing and linked access
                            </h2>
                          </div>
                          <CreditCard className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 space-y-3">
                          <div className="rounded-[24px] border border-cyan-400/15 bg-cyan-500/5 p-4">
                            <p className="text-sm leading-7 text-slate-300">
                              Free access runs here immediately. Managed plans stay pending
                              until admin approval and SC card linking are complete.
                            </p>
                          </div>

                          {clientOverview.payments.length > 0 ? (
                            clientOverview.payments.map((payment) => (
                              <div
                                className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                                key={payment.id}
                              >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <strong className="text-sm text-white">
                                        {payment.planName}
                                      </strong>
                                      <span
                                        className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${paymentStatusClass(
                                          payment.status,
                                        )}`}
                                      >
                                        {paymentStatusCopy(payment.status)}
                                      </span>
                                      {payment.linkedCardStatus ? (
                                        <span
                                          className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${smartCardStatusClass(
                                            payment.linkedCardStatus,
                                          )}`}
                                        >
                                          {smartCardStatusCopy(payment.linkedCardStatus)}
                                        </span>
                                      ) : null}
                                    </div>
                                    <p className="mt-2 text-sm text-slate-400">
                                      {paymentMethodLabel(payment.paymentMethod)} / ****{" "}
                                      {payment.last4}
                                    </p>
                                    <p className="mt-2 text-xs leading-6 text-cyan-200">
                                      {payment.linkedCardCode
                                        ? `SC linked / ${payment.linkedCardCode}${
                                            payment.linkedCardSectorLabel
                                              ? ` / ${payment.linkedCardSectorLabel}`
                                              : ""
                                          }`
                                        : payment.status === "pending"
                                          ? "Request is pending admin approval."
                                          : payment.status === "rejected"
                                            ? "Request was rejected. Contact admin."
                                            : "Awaiting SC card link from admin flow."}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-bold text-cyan-200">
                                      {formatSystemMoney(payment.amount)}
                                    </span>
                                    <p className="mt-2 text-xs text-slate-500">
                                      {formatSystemDate(payment.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <EmptyCard message="No billing history is visible yet. Once a payment is captured, it will appear here with the linked access path." />
                          )}
                        </div>
                      </article>

                      <article
                        className={`rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 ${
                          showClientBillingPanel ? "" : "hidden"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              SC cards
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Linked SC cards
                            </h2>
                          </div>
                          <ShieldCheck className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 space-y-3">
                          <div className="rounded-[24px] border border-cyan-400/15 bg-cyan-500/5 p-4">
                            <div className="flex flex-wrap gap-2">
                              <span className="workspace-summary-pill">
                                {selectedClientPlan?.name ?? "Selected plan"}
                              </span>
                              <span className="workspace-summary-pill">
                                {clientCardsForSelectedPlan.length} linked card
                                {clientCardsForSelectedPlan.length === 1 ? "" : "s"}
                              </span>
                              <span className="workspace-summary-pill">
                                {selectedPlanSmartCard
                                  ? smartCardStatusCopy(selectedPlanSmartCard.status)
                                  : "No linked card"}
                              </span>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-slate-300">
                              Only SC cards linked to the selected plan are shown here, so the
                              plan board and access kit stay in sync.
                            </p>
                          </div>

                          {clientCardsForSelectedPlan.length > 0 ? (
                            clientCardsForSelectedPlan.slice(0, 6).map((card) => (
                              <div
                                className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                                key={card.id}
                              >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <strong className="text-sm text-white">
                                        {card.code}
                                      </strong>
                                      <span
                                        className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${smartCardStatusClass(
                                          card.status,
                                        )}`}
                                      >
                                        {smartCardStatusCopy(card.status)}
                                      </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                      {card.planName} / {card.sectorLabel}
                                    </p>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    Updated {formatSystemDate(card.updatedAt)}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                              <p className="text-sm leading-7 text-slate-300">
                                No SC card is linked to{" "}
                                <strong className="text-white">
                                  {selectedClientPlan?.name ?? "this plan"}
                                </strong>{" "}
                                yet. Once approval or assignment completes, the card will appear
                                here and stay aligned with the selected plan above.
                              </p>
                            </div>
                          )}
                        </div>
                      </article>

                      <article
                        className={`rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 ${
                          showClientBillingPanel ? "" : "hidden"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Activations
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Activation history
                            </h2>
                          </div>
                          <Activity className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 space-y-3">
                          {clientOverview.activations.length > 0 ? (
                            clientOverview.activations.map((activation) => (
                              <div
                                className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                                key={activation.id}
                              >
                                <strong className="text-sm text-white">
                                  {activation.deviceName}
                                </strong>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                  {activation.site} / {activation.status}
                                </p>
                                <p className="mt-3 text-xs text-slate-500">
                                  {formatSystemDate(activation.createdAt)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <EmptyCard message="No rollout requests are active. New provisioning jobs will appear here after the next deployment starts." />
                          )}
                        </div>
                      </article>

                      <article
                        className={`rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 xl:col-span-2 ${
                          showClientSupportPanel ? "" : "hidden"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Support
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Ticket history
                            </h2>
                          </div>
                          <Ticket className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 space-y-3">
                          {clientOverview.tickets.length > 0 ? (
                            clientOverview.tickets.map((ticket) => (
                              <div
                                className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                                key={ticket.id}
                              >
                                <strong className="text-sm text-white">
                                  {ticket.category}
                                </strong>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                  {ticket.summary}
                                </p>
                                <p className="mt-3 text-xs text-slate-500">
                                  {ticket.priority} / {ticket.status}
                                </p>
                              </div>
                            ))
                          ) : (
                            <EmptyCard message="Support history is clear. When a new issue or deployment request is opened, it will show here." />
                          )}
                        </div>
                      </article>
                    </div>
                  </section>
                )}
              </div>
            </main>
          )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
