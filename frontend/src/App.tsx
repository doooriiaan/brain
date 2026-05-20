import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
import { AuthPanel } from "./components/AuthPanel";
import { BrainScratchCard } from "./components/BrainScratchCard";
import { BrandShowcase } from "./components/BrandShowcase";
import { DevicePreviewStudio } from "./components/DevicePreviewStudio";
import { EmptyCard } from "./components/EmptyCard";
import { GoogleTranslateBridge } from "./components/GoogleTranslateBridge";
import { LandingTopBar } from "./components/LandingTopBar";
import { PeekBuddy } from "./components/PeekBuddy";
import { SectorLiveBoard, SectorLiveMiniBoard } from "./components/SectorLiveBoard";
import { SectorCinemaPage } from "./components/SectorCinemaPage";
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
type LandingView = "overview" | "sectors" | "device" | "plans" | "access";

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

type LandingSidebarItem = {
  key: LandingView;
  label: string;
  detail: string;
  icon: LucideIcon;
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
    eyebrow: "AI deployment platform",
    title: "Smarter business. Stronger results.",
    subtitle:
      "A dark, device-first access layer for brAIn hardware, cloud software, sector deployment, and workspace control.",
    badges: [
      "Commercial AI",
      "Business AI",
      "Healthcare AI",
      "Industry 4.0 AI",
    ],
    metrics: [
      { label: "Sectors ready", value: "4" },
      { label: "Products", value: "4 devices" },
      { label: "Cloud flow", value: "Live" },
    ],
    primaryCta: {
      label: "Open sectors",
      href: "#preweb-sectors",
    },
    secondaryCta: {
      label: "Open system",
      href: "#auth-access",
    },
    deviceImage: "/brand/brain-hero.svg",
    plansImage: "/brand/plans-main.png",
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
  sectors: "preweb-sectors",
  device: "landing-device-page",
  plans: "landing-plans",
  access: "auth-access",
};

const landingSidebarItems: LandingSidebarItem[] = [
  {
    key: "overview",
    label: "Overview",
    detail: "Hero, runtime, and launch controls.",
    icon: Sparkles,
  },
  {
    key: "sectors",
    label: "Sectors",
    detail: "Pick the live business deployment path.",
    icon: Layers3,
  },
  {
    key: "device",
    label: "Device page",
    detail: "3D hardware stage with live device switching.",
    icon: Cpu,
  },
  {
    key: "plans",
    label: "Plans",
    detail: "Choose the package that matches the rollout.",
    icon: CreditCard,
  },
  {
    key: "access",
    label: "Access",
    detail: "Jump straight into login or registration.",
    icon: ShieldCheck,
  },
];

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
    return "border-cyan-400/25 bg-cyan-400/12 text-cyan-200";
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

  return "border-cyan-400/25 bg-cyan-400/12 text-cyan-200";
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

  return "border-cyan-400/25 bg-cyan-400/12 text-cyan-200";
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

function getSectorBadgeStyle(accent?: string) {
  if (!accent) {
    return undefined;
  }

  return {
    borderColor: `${accent}55`,
    backgroundColor: `${accent}18`,
    color: "#fff7ed",
  };
}

function getSectorPanelStyle(accent?: string) {
  if (!accent) {
    return undefined;
  }

  return {
    borderColor: `${accent}44`,
    background: `linear-gradient(135deg, ${accent}18, rgba(255,255,255,0.04))`,
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
  const [landingView, setLandingView] = useState<LandingView>("overview");
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
  const [activeSectorSlug, setActiveSectorSlug] = useState("");
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
  const [activeDashboardSection, setActiveDashboardSection] =
    useState("system-overview");

  const selectedCountryOption =
    countryOptions.find((country) => country.code === selectedCountry) ??
    countryOptions[0];
  const selectedLanguageOption =
    languageOptions.find((language) => language.code === selectedLanguage) ??
    languageOptions[0];

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.country, selectedCountry);
  }, [selectedCountry]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.language, selectedLanguage);
  }, [selectedLanguage]);

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

    return `${authSession.user.name} is connected to the access layer.`;
  }, [authSession]);

  const currentUserLabel = authSession?.user.company || "Guest device route";
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


  const featuredPlan = useMemo(() => {
    return (
      landingContent.plans.find((plan) => plan.featured) ??
      landingContent.plans[1] ??
      landingContent.plans[0] ??
      null
    );
  }, [landingContent.plans]);

  const visiblePlans = useMemo(() => {
    if (!featuredPlan) {
      return landingContent.plans.slice(0, 3);
    }

    const remainingPlans = landingContent.plans
      .filter((plan) => plan.slug !== featuredPlan.slug)
      .slice(0, 2);

    return [featuredPlan, ...remainingPlans];
  }, [featuredPlan, landingContent.plans]);

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

  const planScopedPayment = useMemo(() => {
    if (!selectedClientPlan) {
      return clientOverview.payments[0] ?? null;
    }

    return (
      clientOverview.payments.find((payment) => payment.plan === selectedClientPlan.slug) ??
      clientOverview.payments[0] ??
      null
    );
  }, [clientOverview.payments, selectedClientPlan]);

  const pendingPlanPayment = useMemo(() => {
    if (!selectedClientPlan) {
      return null;
    }

    return (
      clientOverview.payments.find(
        (payment) =>
          payment.plan === selectedClientPlan.slug && payment.status === "pending",
      ) ??
      null
    );
  }, [clientOverview.payments, selectedClientPlan]);

  const clientAccessCardStyle = useMemo(() => {
    const accent = clientSector?.accent ?? activeSector?.accent ?? "#78d7ab";

    return {
      borderColor: `${accent}36`,
      background: `linear-gradient(180deg, ${accent}14 0%, rgba(5,11,21,0.94) 22%, rgba(4,10,8,0.96) 100%)`,
      boxShadow: `0 22px 65px ${accent}20`,
    };
  }, [activeSector?.accent, clientSector?.accent]);

  const activeScratchCode = (
    scratchCodeInput.trim() ||
    scratchStatus.code?.trim() ||
    ""
  ).toUpperCase();
  const freePlanCardRevealed = Boolean(activeScratchCode) || scratchBusy;
  const petAdviceCopy =
    selectedClientPlan?.slug === "free"
      ? activeScratchCode
        ? `Peti already prepared ${activeScratchCode} for this workspace. Validate it directly from the card.`
        : "Peti can generate the free SC code automatically here, so the client never needs to type it manually."
      : pendingPlanPayment
        ? "Your managed request is waiting for approval. Client view stays focused only on your own payment and access state."
        : planScopedPayment?.status === "approved"
          ? "This workspace already has approved access linked to it. Client view stays isolated from admin control boards."
          : "Managed plans stay in client view only as request status, payment state, and linked access.";

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

  const dashboardSidebarItems = useMemo<DashboardSidebarItem[]>(() => {
    if (!authSession) {
      return [];
    }

    if (authSession.user.role === "admin") {
      return [
        {
          target: "system-overview",
          label: "Overview",
          detail: "Status, quick actions, and live totals.",
          icon: Sparkles,
          meta: `${primaryMetrics.length} live tiles`,
        },
        {
          target: "system-operations",
          label: "Operations",
          detail: "Services, runtime flow, and broadcasts.",
          icon: Workflow,
          meta: `${operationsOverview.timeline.length} events`,
        },
        {
          target: "system-payments",
          label: "Payments",
          detail: "Approve or reject managed plan requests.",
          icon: CreditCard,
          meta: `${pendingAdminPayments.length} pending`,
        },
        {
          target: "system-cards",
          label: "SC cards",
          detail: "Inventory, assignment, and activation state.",
          icon: ShieldCheck,
          meta: `${adminOverview.smartCards.length} cards`,
        },
        {
          target: "system-device-control",
          label: "Devices",
          detail: "Control hardware rollout per sector.",
          icon: Cpu,
          meta: `${sectorControlRows.length} sectors`,
        },
        {
          target: "system-sectors",
          label: "Sectors",
          detail: "See the full deployment stack by lane.",
          icon: Layers3,
          meta: `${landingContent.sectors.length} lanes`,
        },
        {
          target: "system-role",
          label: "Support",
          detail: "Broadcasts, uploads, and ticket follow-up.",
          icon: Ticket,
          meta: `${adminOverview.tickets.length} tickets`,
        },
      ];
    }

    const pendingClientPayments = clientOverview.payments.filter(
      (payment) => payment.status === "pending",
    ).length;

    return [
      {
        target: "system-overview",
        label: "Overview",
        detail: "Workspace status and refresh actions.",
        icon: Sparkles,
        meta: `${primaryMetrics.length} live tiles`,
      },
      {
        target: "client-plan-board",
        label: "Plans",
        detail: "Choose free or managed access.",
        icon: Layers3,
        meta: selectedClientPlan?.name ?? "Choose plan",
      },
      {
        target: "client-validate",
        label: "Validation",
        detail: "Generate or confirm your SC code.",
        icon: ShieldCheck,
        meta:
          activeScratchCode ||
          (selectedClientPlan?.slug === "free" ? "Free lane" : "Managed request"),
      },
      {
        target: "client-billing",
        label: "Billing",
        detail: "Track payment requests and linked access.",
        icon: CreditCard,
        meta: `${pendingClientPayments} pending`,
      },
      {
        target: "client-sectors",
        label: "Sectors",
        detail: "See your active deployment lane.",
        icon: Cpu,
        meta: clientSector?.name ?? "Workspace lane",
      },
      {
        target: "system-role",
        label: "Support",
        detail: "Account snapshot and ticket history.",
        icon: Ticket,
        meta: `${clientOverview.tickets.length} tickets`,
      },
    ];
  }, [
    activeScratchCode,
    adminOverview.smartCards.length,
    adminOverview.tickets.length,
    authSession,
    clientOverview.payments,
    clientOverview.tickets.length,
    clientSector?.name,
    landingContent.sectors.length,
    operationsOverview.timeline.length,
    pendingAdminPayments.length,
    primaryMetrics.length,
    sectorControlRows.length,
    selectedClientPlan?.name,
    selectedClientPlan?.slug,
  ]);

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

    const pendingClientPayments = clientOverview.payments.filter(
      (payment) => payment.status === "pending",
    ).length;

    return [
      {
        target: "client-plan-board",
        title:
          selectedClientPlan?.slug === "free"
            ? "Open your access plan"
            : `Continue ${selectedClientPlan?.name ?? "managed"} request`,
        detail:
          selectedClientPlan?.slug === "free"
            ? "Free activation starts from the access card below."
            : pendingPlanPayment
              ? "Your managed request is waiting for admin approval."
              : "Pick a plan and send it for admin review.",
        icon: Layers3,
        status: selectedClientPlan?.slug === "free" ? "Instant path" : "Managed flow",
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
          pendingClientPayments > 0
            ? `${pendingClientPayments} payment request${
                pendingClientPayments === 1 ? "" : "s"
              } still waiting for admin action.`
            : "No billing requests are blocked right now.",
        icon: CreditCard,
        status: pendingClientPayments > 0 ? "Pending review" : "Clear",
      },
    ];
  }, [
    activeScratchCode,
    adminOverview.smartCardStats.available,
    adminOverview.smartCards.length,
    adminOverview.tickets.length,
    authSession,
    clientOverview.payments,
    operationsOverview.notifications.length,
    pendingAdminPayments.length,
    pendingPlanPayment,
    selectedClientPlan?.name,
    selectedClientPlan?.slug,
  ]);

  const dashboardHelpTitle =
    authSession?.user.role === "admin" ? "Control help" : "Workspace help";
  const dashboardHelpCopy =
    authSession?.user.role === "admin"
      ? "These shortcuts take you straight to the queues and boards that need attention."
      : "These shortcuts lead directly to the next client action without opening admin-style panels.";

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
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function openLandingView(view: LandingView) {
    setLandingView(view);
    scrollToSection(landingSectionMap[view]);
  }

  function openDevicePage(deviceKey?: string) {
    if (deviceKey) {
      const nextDevice = landingContent.devices.find(
        (device) => device.deviceKey === deviceKey,
      );

      if (nextDevice) {
        setActiveSectorSlug(nextDevice.sectorSlug);
      }
    }

    openLandingView("device");
  }

  function openSectorStory(sectorSlug: string) {
    setActiveSectorSlug(sectorSlug);
    setLandingView("sectors");
    scrollToSection("landing-sector-cinema");
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
    scrollToSection("auth-access");
  }

  function openRegisterForPlan(plan: Plan, sectorSlug?: string) {
    setLandingView("access");
    setAuthMode("register");
    setRegisterForm((current) => ({
      ...current,
      sector: sectorSlug || current.sector,
      plan: plan.slug,
    }));

    if (sectorSlug) {
      setActiveSectorSlug(sectorSlug);
    }

    scrollToSection("auth-access");
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
        text: "Free validation runs from the access card below. Generate the code and validate it from there.",
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
        className={`landing-shell ${authSession ? `theme-${authSession.user.role}` : "theme-landing"}`}
      >
        <div className="landing-aura landing-aura-blue" />
        <div className="landing-aura landing-aura-gold" />

        <div className="page-frame">
          <LandingTopBar
            countryOptions={countryOptions}
            currentUserLabel={currentUserLabel}
            languageOptions={languageOptions}
            onCountryChange={handleCountryChange}
            onLanguageChange={handleLanguageChange}
            onToggleVpn={handleVpnToggle}
            onVpnEndpointChange={setSelectedEndpointId}
            selectedCountry={selectedCountry}
            selectedEndpointId={selectedEndpointId}
            selectedLanguage={selectedLanguage}
            vpnActive={vpnActive}
            vpnBusy={vpnSubmitting}
            vpnEndpoints={vpnEndpoints}
            vpnMessage={vpnMessage}
          />

          {!authSession ? (
            <main
              className="landing-center-shell mt-4"
              id="landing-center"
            >
              <aside className="landing-sidebar-rail">
                <div className="landing-sidebar-shell landing-sidebar-frame">
                  <span className="landing-sidebar-pill">
                    <Cpu className="h-3.5 w-3.5" />
                    Live device navigation
                  </span>

                  <h2 className="landing-sidebar-title">brAIn launch map</h2>
                  <p className="landing-sidebar-copy">
                    Manual sidebar controls wired straight to the real sections,
                    with a dedicated device page and live device switching.
                  </p>

                  <div className="landing-sidebar-nav">
                    {landingSidebarItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = landingView === item.key;

                      return (
                        <button
                          className={`landing-nav-button ${isActive ? "landing-nav-button-active" : ""}`}
                          key={item.key}
                          onClick={() => openLandingView(item.key)}
                          type="button"
                        >
                          <span className="landing-nav-icon">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="landing-nav-copy">
                            <strong>{item.label}</strong>
                            <small>{item.detail}</small>
                          </span>
                          <ArrowRight className="landing-nav-arrow h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>

                  <div className="landing-sidebar-device-shell">
                    <div className="landing-sidebar-device-head">
                      <div>
                        <p className="landing-sidebar-device-kicker">Sector preview</p>
                        <h3>{activeSector?.name ?? "Loading sector"}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {activeDevice?.name ?? "Built-in AI device"} /{" "}
                          {activeSector?.statValue ?? "Standby"}
                        </p>
                      </div>
                      <span className="landing-sidebar-device-badge">
                        {activeDevice?.category ?? "Preview"}
                      </span>
                    </div>

                    {activeSector ? (
                      <SectorLiveMiniBoard
                        className="h-[12.75rem]"
                        dense
                        device={activeDevice}
                        plans={landingContent.plans}
                        sector={activeSector}
                      />
                    ) : null}

                    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Preview note
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        {activeDevice?.tagline ??
                          activeSector?.summary ??
                          "Select a sector to preview its built-in AI device story."}
                      </p>
                    </div>

                    <div className="landing-device-shortcuts">
                      {landingContent.sectors.map((sector) => (
                        <button
                          className={`landing-device-shortcut ${
                            activeSector?.slug === sector.slug
                              ? "landing-device-shortcut-active"
                              : ""
                          }`}
                          key={sector.slug}
                          onClick={() => openSectorStory(sector.slug)}
                          type="button"
                        >
                          <span>{sector.name}</span>
                          <small>{sector.statValue}</small>
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-3">
                      <button
                        className="landing-sidebar-cta"
                        onClick={() =>
                          openSectorStory(
                            activeSector?.slug ||
                              landingContent.sectors[0]?.slug ||
                              "business",
                          )
                        }
                        type="button"
                      >
                        Open sector preview
                      </button>
                      <button
                        className="device-preview-button-secondary"
                        onClick={() => openDevicePage(activeDevice?.deviceKey)}
                        type="button"
                      >
                        Open 3D device page
                      </button>
                    </div>

                    <div className="mt-auto grid gap-3">
                      <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Route profile
                        </p>
                        <div className="mt-3 space-y-3">
                          {[
                            ["Market", selectedCountryOption.label],
                            ["Language", selectedLanguageOption.label],
                            ["VPN", vpnActive ? vpnSession?.location || "Private route" : "Standby"],
                          ].map(([label, value]) => (
                            <div
                              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3"
                              key={label}
                            >
                              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                {label}
                              </span>
                              <span className="text-sm font-semibold text-white">
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Entry sequence
                        </p>
                        <h4 className="mt-2 text-xl font-black text-white">
                          Live deployment flow
                        </h4>
                        <div className="mt-4 space-y-3">
                          {[
                            ["01", "Choose country profile"],
                            ["02", "Sync language layer"],
                            ["03", "Validate secure access"],
                          ].map(([step, label]) => (
                            <div
                              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3"
                              key={step}
                            >
                              <span className="min-w-10 text-lg font-black text-cyan-300">
                                {step}
                              </span>
                              <span className="text-sm font-semibold text-white">
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="landing-center-content min-w-0 space-y-6">
              <section className="hero-layout redesigned-hero" id="auth-access">
                <motion.section
                  animate={{ opacity: 1, y: 0 }}
                  className="hero-panel hero-panel-brand"
                  initial={{ opacity: 0, y: 24 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <BrandShowcase
                    currentCountry={selectedCountryOption.label}
                    currentLanguage={selectedLanguageOption.label}
                    vpnActive={vpnActive}
                  />
                </motion.section>

                <motion.aside
                  animate={{ opacity: 1, y: 0 }}
                  className="hero-panel hero-panel-auth"
                  initial={{ opacity: 0, y: 32 }}
                  transition={{
                    delay: 0.1,
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <AuthPanel
                    authMessage={authMessage}
                    authMode={authMode}
                    authSession={authSession}
                    authStatusText={authStatusText}
                    authSubmitting={authSubmitting}
                    loginForm={loginForm}
                    onAuthModeChange={setAuthMode}
                    onLoginChange={setLoginForm}
                    onLoginSubmit={handleLoginSubmit}
                    onRegisterChange={setRegisterForm}
                    onRegisterSubmit={handleRegisterSubmit}
                    onRoleChange={(role) =>
                      setLoginForm((current) => ({ ...current, role }))
                    }
                    onSignOut={handleSignOut}
                    registerForm={registerForm}
                    selectedCountry={selectedCountryOption.label}
                    selectedLanguage={selectedLanguageOption.label}
                    vpnActive={vpnActive}
                  />
                </motion.aside>
              </section>

              <motion.section
                animate={{ opacity: 1, y: 0 }}
                className="landing-overview-panel"
                id="landing-overview"
                initial={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.08, duration: 0.52 }}
              >
                <div className="landing-overview-hero">
                  <div>
                    <span className="landing-section-pill">
                      <Sparkles className="h-3.5 w-3.5" />
                      {landingContent.hero.eyebrow}
                    </span>
                    <h2>{landingContent.hero.title}</h2>
                    <p>{landingContent.hero.subtitle}</p>
                  </div>

                  <div className="landing-overview-actions">
                    <button
                      className="landing-primary-button"
                      onClick={() => openLandingView("sectors")}
                      type="button"
                    >
                      Explore sectors
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      className="landing-secondary-button"
                      onClick={() => openLandingView("access")}
                      type="button"
                    >
                      Open access layer
                    </button>
                  </div>
                </div>

                <div className="landing-overview-grid">
                  <div className="landing-metric-grid">
                    {landingContent.hero.metrics.map((metric) => (
                      <article
                        className="landing-metric-tile"
                        key={metric.label}
                      >
                        <p>{metric.label}</p>
                        <h3>{metric.value}</h3>
                      </article>
                    ))}
                  </div>

                  <div className="landing-pulse-card">
                    <div className="landing-pulse-head">
                      <div>
                        <p>Live runtime</p>
                        <h3>Public system pulse</h3>
                      </div>
                      <button
                        className="landing-refresh-button"
                        onClick={() => void refreshPublicRuntime()}
                        type="button"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                      </button>
                    </div>

                    {contentLoading ? (
                      <p className="landing-loading-copy">
                        Loading sector boards and cloud runtime...
                      </p>
                    ) : null}

                    <div className="landing-service-grid">
                      {operationsOverview.services.slice(0, 4).map((service) => (
                        <div
                          className="landing-service-card"
                          key={service.key}
                        >
                          <div>
                            <p>{service.label}</p>
                            <span
                              className={`landing-service-status ${statusBadgeClass(service.status)}`}
                            >
                              {service.status}
                            </span>
                          </div>
                          <small>{service.detail}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>

              <section className="landing-sector-section" id="preweb-sectors">
                <div className="landing-section-head">
                  <span className="landing-section-pill">
                    <Cpu className="h-3.5 w-3.5" />
                    Product sectors
                  </span>
                  <h2>Four entry points, one clean flow</h2>
                  <p>
                    Cards are shorter and clickable: pick the sector, preview the
                    device, then continue to plan or access.
                  </p>
                </div>

                <div className="landing-sector-grid">
                {landingContent.sectors.map((sector, index) => {
                  const active = sector.slug === activeSector?.slug;

                  return (
                    <motion.button
                      className={`landing-sector-card ${active ? "landing-sector-card-active" : ""}`}
                      initial={{ opacity: 0, y: 18 }}
                      key={sector.slug}
                      onClick={() => openSectorStory(sector.slug)}
                      style={{
                        borderColor: active ? `${sector.accent}55` : `${sector.accent}24`,
                        "--sector-accent": sector.accent,
                      } as CSSProperties}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      type="button"
                      whileHover={{ y: -4 }}
                    >
                      <div className="landing-sector-card-head">
                        <div>
                          <p>Sector {index + 1}</p>
                          <h3>{sector.name}</h3>
                        </div>
                        <span />
                      </div>
                      <p>{sector.summary}</p>
                      <div className="landing-sector-card-foot">
                        <strong>{sector.statValue}</strong>
                        <span>Open preview</span>
                      </div>
                    </motion.button>
                  );
                })}
                </div>
              </section>

              {activeSector ? (
                <section className="space-y-6">
                  <SectorCinemaPage
                    activeDevice={activeDevice}
                    activeSector={activeSector}
                    onDeploy={openRegisterForSector}
                    onOpenDevice={openDevicePage}
                    onOpenSector={openSectorStory}
                    plans={landingContent.plans}
                    sectors={landingContent.sectors}
                  />
                  <DevicePreviewStudio
                    device={activeDevice}
                    onDeploy={() => openRegisterForSector(activeSector)}
                    onSelectDevice={openDevicePage}
                    plans={landingContent.plans}
                    relatedDevices={landingContent.devices}
                    sector={activeSector}
                  />
                </section>
              ) : null}

              <section
                className="landing-plans-panel"
                id="landing-plans"
              >
                <div className="landing-section-head landing-section-head-row">
                  <div>
                    <span className="landing-section-pill">
                      <Layers3 className="h-3.5 w-3.5" />
                      Simple plan selector
                    </span>
                    <h2>Pick a plan without scrolling through noise</h2>
                  </div>

                  <p>
                    Featured options are shown first. The full package list is still
                    available through the same backend data.
                  </p>
                </div>

                <div className="landing-plan-grid">
                  {visiblePlans.map((plan) => (
                    <article
                      className={`landing-plan-card ${plan.featured ? "landing-plan-card-featured" : ""}`}
                      key={plan.slug}
                    >
                      <div className="landing-plan-head">
                        <div>
                          <p>{plan.name}</p>
                          <h3>EUR {plan.annualPrice}</h3>
                        </div>
                        {plan.featured ? (
                          <span>Popular</span>
                        ) : null}
                      </div>
                      <p className="landing-plan-summary">{plan.summary}</p>
                      <div className="landing-plan-features">
                        {plan.features.slice(0, 3).map((feature) => (
                          <div key={feature}>
                            {feature}
                          </div>
                        ))}
                      </div>
                      <button
                        className="landing-primary-button landing-plan-button"
                        onClick={() =>
                          openRegisterForPlan(plan, activeSector?.slug || "business")
                        }
                        type="button"
                      >
                        Choose plan
                      </button>
                    </article>
                  ))}
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
                <article className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.24)] sm:p-6">
                  <div className="pointer-events-none absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                    <Workflow className="h-3.5 w-3.5" />
                    Support flow
                  </span>
                  <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Free validation first, managed plans after that
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                    The public entry stays simple now: pick a sector, validate the free
                    lane instantly, or send a paid plan request for admin approval and
                    SC card linking.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {[
                      [
                        "Step 1",
                        "Choose the sector",
                        "Open Commercial AI, Business AI, Healthcare AI, or Industry 4.0 and match the device story first.",
                      ],
                      [
                        "Step 2",
                        "Use free validation",
                        "Free access codes can be validated directly from the animated SC card without payment.",
                      ],
                      [
                        "Step 3",
                        "Request paid plan",
                        "Starter, Professional, Business, Platinum, and Platinum+ go through contact-admin approval.",
                      ],
                      [
                        "Step 4",
                        "Admin links the card",
                        "After approval, the admin board links the SC card and moves the workspace toward activation.",
                      ],
                    ].map(([step, title, detail]) => (
                      <div
                        className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4"
                        key={title}
                      >
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {step}
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-white">{title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{detail}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                      onClick={() => openLandingView("access")}
                      type="button"
                    >
                      Open access layer
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]"
                      onClick={() => openLandingView("plans")}
                      type="button"
                    >
                      Review plans
                    </button>
                  </div>
                </article>

                <div className="space-y-6">
                  <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,32,0.94),rgba(7,12,22,0.9))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Integrations
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-white">
                          Frontend + backend + hardware
                        </h3>
                      </div>
                      <Globe2 className="h-6 w-6 text-cyan-200" />
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {[
                        ...landingContent.integrations.protocols,
                        ...landingContent.integrations.platforms.slice(0, 3),
                        ...landingContent.integrations.cloudPartners.slice(0, 3),
                      ].map((item) => (
                        <div
                          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-slate-200"
                          key={item}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </article>

                </div>
              </section>
              </div>
            </main>
          ) : (
            <main
              className="system-center-shell mt-6"
              id="system-center"
            >
              <aside className="dashboard-sidebar-rail">
                <div className="dashboard-sidebar-shell flex flex-col gap-5 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {authSession.user.role === "admin"
                            ? "Admin control center"
                            : "Client live workspace"}
                        </span>
                        <h2 className="mt-4 break-words text-2xl font-black text-white">
                          {authSession.user.company}
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          {authStatusText}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-3 py-2 text-right">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200">
                          <span className="h-2 w-2 rounded-full bg-emerald-300" />
                          Live
                        </div>
                        <p className="mt-2 break-words text-sm font-semibold text-white">
                          {vpnActive ? vpnSession?.location : "Direct route"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Role
                        </p>
                        <p className="mt-2 break-words text-sm font-bold capitalize text-white">
                          {authSession.user.role}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Connected
                        </p>
                        <p className="mt-2 break-words text-xs font-bold leading-5 text-white">
                          {formatSystemDate(authSession.issuedAt)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Country
                        </p>
                        <p className="mt-2 break-words text-sm font-bold text-white">
                          {selectedCountryOption.label}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Language
                        </p>
                        <p className="mt-2 break-words text-sm font-bold text-white">
                          {selectedLanguageOption.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Sidebar
                        </p>
                        <h3 className="mt-2 text-lg font-black text-white">
                          Workspace navigation
                        </h3>
                      </div>
                      <Globe2 className="h-5 w-5 text-cyan-200" />
                    </div>

                    <div className="mt-4 space-y-3">
                      {dashboardSidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeDashboardSection === item.target;

                        return (
                          <button
                            className={`group flex w-full items-center gap-3 rounded-[24px] border px-4 py-3 text-left transition ${
                              isActive
                                ? "border-cyan-400/25 bg-cyan-400/10 shadow-[0_16px_35px_rgba(34,211,238,0.12)]"
                                : "border-white/10 bg-white/[0.04] hover:-translate-y-0.5 hover:bg-white/[0.07]"
                            }`}
                            key={item.target}
                            onClick={() => scrollToSection(item.target)}
                            type="button"
                          >
                            <span
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition ${
                                isActive
                                  ? "border-cyan-300/25 bg-cyan-400/12 text-cyan-100"
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
                                      ? "bg-cyan-300 text-slate-950"
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
                                  ? "translate-x-0 text-cyan-100"
                                  : "text-slate-500 group-hover:translate-x-0.5 group-hover:text-cyan-200"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-auto rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,45,33,0.38),rgba(5,11,21,0.94))] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Help
                        </p>
                        <h3 className="mt-2 text-lg font-black text-white">
                          {dashboardHelpTitle}
                        </h3>
                      </div>
                      <ServerCog className="h-5 w-5 text-cyan-200" />
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
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-100">
                              <Icon className="h-4 w-4" />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-3">
                                <strong className="min-w-0 pr-2 text-sm leading-5 text-white">
                                  {action.title}
                                </strong>
                                <span className="max-w-[7.5rem] truncate rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100">
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
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                        onClick={() => void loadSystemOverview()}
                        type="button"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {systemLoading ? "Refreshing..." : "Refresh"}
                      </button>
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
                        onClick={handleSignOut}
                        type="button"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="system-center-content min-w-0 space-y-6">
                <motion.section
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-7"
                  id="system-overview"
                  initial={{ opacity: 0, y: 22 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                      <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                        <Sparkles className="h-3.5 w-3.5" />
                        {authSession.user.role === "admin"
                          ? "Full system visibility"
                          : "Live workspace"}
                      </span>
                      <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                        {authSession.user.role === "admin"
                          ? "Dark control surface for brAIn operations."
                          : "Hardware, cloud, validation, and client activity in one system."}
                      </h1>
                      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                        {authSession.user.role === "admin"
                          ? "Manage notifications, accounts, payments, scratch-card activity, device rollout, tickets, and sector operations from one real dashboard."
                          : "Track your account, payments, activations, support, and access-code validation without leaving the same cloud workspace."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                        onClick={() => void loadSystemOverview()}
                        type="button"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {systemLoading ? "Refreshing..." : "Refresh system"}
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/15"
                        onClick={handleSignOut}
                        type="button"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
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
                    <article
                      className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,32,0.94),rgba(7,12,22,0.9))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]"
                      key={metric.key}
                    >
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

                {authSession.user.role === "admin" ? (
                  <>
                    <section
                      className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]"
                      id="system-operations"
                    >
                  <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Runtime modules
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-white">
                          Service health
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
                          Timeline
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-white">
                          Live event stream
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
                          Operations board
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-white">
                          Core metrics
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
                          Notifications
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-white">
                          Broadcast feed
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
                      className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-7"
                      id="system-sectors"
                    >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                        <Cpu className="h-3.5 w-3.5" />
                        Sector architecture
                      </span>
                      <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        1. Commercial AI, 2. Business AI, 3. Healthcare AI, 4.
                        Industry 4.0 AI
                      </h2>
                    </div>

                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]"
                      onClick={() => activeSector && setActiveSectorSlug(activeSector.slug)}
                      type="button"
                    >
                      Active sector: {activeSector?.name || "None"}
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
                            className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-[linear-gradient(135deg,rgba(214,154,47,0.94),rgba(255,215,122,0.96))] px-4 py-2 text-sm font-bold text-[#1b120d] shadow-[0_14px_30px_rgba(214,154,47,0.2)] transition hover:brightness-105"
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
                  <section className="space-y-6" id="system-role">
                    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                      <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Admin actions
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Broadcast notification
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
                              placeholder="Deployment update"
                              type="text"
                              value={broadcastTitle}
                            />
                          </label>

                          <label className="field-shell">
                            <span>Body</span>
                            <textarea
                              className="field-input min-h-32 resize-none"
                              onChange={(event) => setBroadcastBody(event.target.value)}
                              placeholder="Write the live admin message here."
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
                            {broadcastBusy ? "Sending..." : "Broadcast"}
                          </button>
                        </div>
                      </article>

                      <article
                        className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 xl:col-span-2"
                        id="system-device-control"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Device control
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

                        <div className="mt-5 space-y-3">
                          {sectorControlRows.map((sector) => (
                            <div
                              className="rounded-[26px] border p-4"
                              key={sector.slug}
                              style={{
                                borderColor: `${sector.accent}35`,
                                background: `linear-gradient(180deg, ${sector.accent}14, rgba(2,8,18,0.9))`,
                              }}
                            >
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                  <div className="flex flex-wrap items-center gap-3">
                                    <strong className="text-sm text-white">
                                      {sector.name}
                                    </strong>
                                    <span
                                      className="rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                                      style={{
                                        borderColor: `${sector.accent}45`,
                                        background: `${sector.accent}18`,
                                        color: "#f8fafc",
                                      }}
                                    >
                                      {sector.primaryDevice}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-sm leading-6 text-slate-300">
                                    {sector.accounts} accounts / {sector.devices} device views /
                                    {sector.activatedCards} live cards
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

                              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                    Available
                                  </p>
                                  <strong className="mt-2 block text-xl font-black text-white">
                                    {sector.availableCards}
                                  </strong>
                                </div>
                                <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                    Assigned
                                  </p>
                                  <strong className="mt-2 block text-xl font-black text-white">
                                    {sector.assignedCards}
                                  </strong>
                                </div>
                                <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                    Activated
                                  </p>
                                  <strong className="mt-2 block text-xl font-black text-white">
                                    {sector.activatedCards}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </article>

                      <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Control stats
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Cards, reveals, and account load
                            </h2>
                          </div>
                          <Ticket className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              Smart cards
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

                    <div className="grid gap-6 xl:grid-cols-2">
                      <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Accounts
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Client organizations
                            </h2>
                          </div>
                          <Users className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 space-y-3">
                          {adminOverview.accounts.map((account) => {
                            const actionKey = `assign-card-${account.id}`;

                            return (
                              <div
                                className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                                key={account.id}
                              >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                  <div>
                                    <strong className="text-sm text-white">
                                      {account.company}
                                    </strong>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                      {account.planName} / {account.sectorLabel} /{" "}
                                      {account.devices} devices / {account.smartCards} cards
                                    </p>
                                    <p className="mt-2 text-xs leading-6 text-slate-500">
                                      Quick admin action: assign one more SC card mapped to
                                      the same sector and plan.
                                    </p>
                                  </div>

                                  <div className="flex flex-col items-start gap-3 lg:items-end">
                                    <span className="text-sm font-bold text-cyan-200">
                                      {formatSystemMoney(account.salesToday)}
                                    </span>
                                    <button
                                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                                      disabled={actionBusyKey === actionKey}
                                      onClick={() => void handleAssignCardToAccount(account)}
                                      type="button"
                                    >
                                      {actionBusyKey === actionKey
                                        ? "Assigning"
                                        : "Assign SC card"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </article>

                      <article
                        className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6"
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
                        className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6"
                        id="system-cards"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              SC cards
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Activation board
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              Each plan keeps a 500-card board with admin sorting and direct
                              activation control.
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
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
                              board.
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

                      <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Activations
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Device rollout queue
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

                      <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Tickets
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Support escalation flow
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
                  <section className="space-y-6" id="system-role">
                    <div className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr]">
                      <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Account
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Workspace snapshot
                            </h2>
                          </div>
                          <HardDrive className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 grid gap-4">
                          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
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
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Sales today
                              </p>
                              <h3 className="mt-2 text-3xl font-black text-white">
                                {formatSystemMoney(clientOverview.account?.salesToday ?? 0)}
                              </h3>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Calls handled
                              </p>
                              <h3 className="mt-2 text-3xl font-black text-white">
                                {clientOverview.account?.callsHandled ?? 0}
                              </h3>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Tasks automated
                              </p>
                              <h3 className="mt-2 text-3xl font-black text-white">
                                {clientOverview.account?.tasksAutomated ?? 0}
                              </h3>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Credits remaining
                              </p>
                              <h3 className="mt-2 text-3xl font-black text-white">
                                {clientOverview.account?.creditsRemaining?.toLocaleString(
                                  "en-GB",
                                ) ?? 0}
                              </h3>
                            </div>
                          </div>
                          <div className="grid gap-4">
                            <div className="overflow-hidden rounded-[24px] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(28,79,56,0.92),rgba(5,11,21,0.96))] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
                              <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border border-white/10 bg-black/20">
                                  <div className="scale-[1.12]">
                                    <PeekBuddy />
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">
                                    Peti sugar glider
                                  </p>
                                  <h3 className="mt-2 text-lg font-black text-white">
                                    Live popup support
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
                                Open access card
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>

                      <article
                        className="rounded-[34px] border p-5 sm:p-6"
                        id="client-plan-board"
                        style={clientAccessCardStyle}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Plans + access
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Free validate or contact admin
                            </h2>
                          </div>
                          <Ticket className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                          {landingContent.plans.map((plan) => {
                            const selected = selectedClientPlan?.slug === plan.slug;
                            const isFreePlan = plan.slug === "free";

                            return (
                              <button
                                className={`group flex min-h-[18rem] flex-col rounded-[26px] border p-5 text-left transition ${
                                  selected
                                    ? "bg-black/30"
                                    : "border-white/10 bg-black/20 hover:-translate-y-1 hover:bg-white/[0.05]"
                                }`}
                                key={plan.slug}
                                onClick={() => handleClientPlanSelect(plan)}
                                style={selected ? getSectorPanelStyle(clientSector?.accent) : undefined}
                                type="button"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                      {isFreePlan
                                        ? "Free lane"
                                        : plan.featured
                                          ? "Recommended managed plan"
                                          : "Managed plan"}
                                    </p>
                                    <h3 className="mt-2 text-xl font-black text-white">
                                      {plan.name}
                                    </h3>
                                  </div>
                                  <span
                                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                                      isFreePlan
                                        ? "border border-emerald-400/25 bg-emerald-400/12 text-emerald-200"
                                        : "border border-amber-400/25 bg-amber-400/12 text-amber-100"
                                    }`}
                                  >
                                    {isFreePlan ? "Auto code" : "Admin flow"}
                                  </span>
                                </div>

                                <p className="mt-4 flex-1 text-sm leading-7 text-slate-300">
                                  {plan.summary}
                                </p>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                      Support
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-white">
                                      {plan.supportLabel}
                                    </p>
                                  </div>
                                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                      Automation
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-white">
                                      {plan.automationLabel}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 flex items-end justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-cyan-200">
                                      {isFreePlan
                                        ? "No payment required"
                                        : `${formatSystemMoney(plan.annualPrice)} / admin approval`}
                                    </p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                                      {selected ? "Selected now" : "Open plan card"}
                                    </p>
                                  </div>
                                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                                    {plan.deviceAllowance}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-5">
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
                                : paymentBusy
                                  ? "Sending request..."
                                  : "Contact admin"
                            }
                            backCopyOverride={
                              selectedClientPlan?.slug === "free"
                                ? freePlanCardRevealed
                                  ? "Generated automatically for this workspace. Validate it without manual typing."
                                  : "Generate a free SC code directly from this card. No manual input is required."
                                : planScopedPayment?.status === "approved"
                                  ? "Admin approved the plan. Linked access stays attached to this request."
                                  : pendingPlanPayment
                                    ? "Payment details were sent. Wait for admin approval before activation."
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
                                : planScopedPayment?.status === "approved"
                                  ? planScopedPayment.linkedCardCode || "APPROVED"
                                  : pendingPlanPayment
                                    ? "PENDING-ADMIN"
                                    : "CONTACT-ADMIN"
                            }
                            descriptionOverride={
                              selectedClientPlan?.slug === "free"
                                ? "One generated code. One validation. Zero manual typing."
                                : "One request. One review. One managed cloud entry."
                            }
                            lockedLabelOverride={
                              selectedClientPlan?.slug === "free"
                                ? "AUTO READY"
                                : "ADMIN REVIEW"
                            }
                            mode={selectedClientPlan?.slug === "free" ? "validate" : "reveal"}
                            onAction={() =>
                              void (
                                selectedClientPlan?.slug === "free"
                                  ? handleScratchAccessCard()
                                  : handleClientPlanRequest()
                              )
                            }
                            planLabel={
                              selectedClientPlan?.name ||
                              clientOverview.account?.planName ||
                              "Free"
                            }
                            pillLabelOverride={
                              selectedClientPlan?.slug === "free"
                                ? "brAIn auto validation"
                                : "brAIn payment approval"
                            }
                            revealed={
                              selectedClientPlan?.slug === "free"
                                ? freePlanCardRevealed
                                : Boolean(planScopedPayment) || paymentBusy
                            }
                            sectorLabel={
                              scratchStatus.sector ||
                              clientOverview.account?.sectorLabel ||
                              "brAIn"
                            }
                            titleOverride={
                              selectedClientPlan?.slug === "free"
                                ? "Private AI Auto-Validation Card"
                                : "Private AI Payment Card"
                            }
                          />
                        </div>

                        <div
                          className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4"
                          id="client-validate"
                        >
                          <p className="text-sm leading-7 text-slate-300">
                            {selectedClientPlan?.slug === "free"
                              ? "Free plan now generates the SC code automatically from this animated card. Reveal it here, then validate it without typing."
                              : "This plan stays under admin control. Send the request and wait for approval before SC card linking or activation."}
                          </p>
                          {selectedClientPlan?.slug === "free" && scratchStatus.hasActiveReservation ? (
                            <p className="mt-3 text-sm text-cyan-200">
                              Active reservation / {activeScratchCode || "SC code ready"} /
                              {" "}Sector {scratchStatus.sector} / Plan {scratchStatus.plan}
                            </p>
                          ) : null}
                          {selectedClientPlan?.slug !== "free" && planScopedPayment ? (
                            <p className="mt-3 text-sm text-cyan-200">
                              Latest request / {paymentStatusCopy(planScopedPayment.status)} /{" "}
                              {paymentMethodLabel(planScopedPayment.paymentMethod)}
                            </p>
                          ) : null}
                        </div>

                        {selectedClientPlan?.slug === "free" ? (
                          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
                            <div className="rounded-[24px] border border-cyan-400/15 bg-cyan-500/5 p-4">
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

                            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
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
                          <div className="mt-5 space-y-4">
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
                                PayPal requests go straight to admin review and return as pending
                                until approval.
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
                        )}

                        {(selectedClientPlan?.slug === "free" ? scratchMessage : paymentMessage) ? (
                          <p
                            className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
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
                      </article>

                      {landingContent.sectors.length > 0 && activeSector ? (
                        <article
                          className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 xl:col-span-2"
                          id="client-sectors"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                Sector explorer
                              </p>
                              <h2 className="mt-2 text-2xl font-black text-white">
                                All 4 sectors / animated stack
                              </h2>
                              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                                Pick a sector, let the board animate in, and keep the advice
                                stack visible on the side for device fit, rollout cues, and
                                brand-ready guidance.
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <span
                                className="rounded-full border px-4 py-2 text-sm font-semibold"
                                style={getSectorBadgeStyle(activeSector.accent)}
                              >
                                Active sector: {activeSector.name}
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
                                  style={selected ? getSectorPanelStyle(sector.accent) : undefined}
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
                                style={getSectorPanelStyle(activeSector.accent)}
                              >
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                                  Advice panel
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
                                    Device anchor
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

                    <div className="grid gap-6 xl:grid-cols-2">
                      <article
                        className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6"
                        id="client-billing"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Billing
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Payment requests and linked access
                            </h2>
                          </div>
                          <CreditCard className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 space-y-3">
                          <div className="rounded-[24px] border border-cyan-400/15 bg-cyan-500/5 p-4">
                            <p className="text-sm leading-7 text-slate-300">
                              Free validation runs here instantly. Paid plans stay pending until
                              admin approves the request and links the SC card.
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

                      <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              SC cards
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Access kit status
                            </h2>
                          </div>
                          <ShieldCheck className="h-6 w-6 text-cyan-200" />
                        </div>

                        <div className="mt-5 space-y-3">
                          {clientOverview.smartCards.length > 0 ? (
                            clientOverview.smartCards.slice(0, 6).map((card) => (
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
                                No SC card is attached to this client yet. Once payment or
                                assignment completes, the card will appear here and can be
                                validated from the animated access block above.
                              </p>
                            </div>
                          )}
                        </div>
                      </article>

                      <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Activations
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Device rollout
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

                      <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.22)] sm:p-6 xl:col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Support
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              Tickets
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
        </div>
      </div>
    </>
  );
}

export default App;
