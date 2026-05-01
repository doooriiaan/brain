import { startTransition, useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  Building2,
  Cable,
  Check,
  Cloud,
  Cpu,
  Database,
  Factory,
  HeartPulse,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Store,
  Upload,
  Workflow,
} from "lucide-react";
import type {
  ActivationItem,
  Device,
  LandingContent,
  LeadItem,
  OperationsOverview,
  Plan,
  RuntimeEvent,
  RuntimeMetric,
  Sector,
  TicketItem,
} from "./types";

const sectionMotion = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const sectorIcons = {
  commercial: Store,
  business: BriefcaseBusiness,
  healthcare: HeartPulse,
  industry: Factory,
} as const;

const architectureIcons = [Cpu, Cable, Cloud, Workflow];

const runtimeToneClasses = {
  info: "bg-sky-400/12 text-sky-200",
  success: "bg-emerald-400/12 text-emerald-200",
  warning: "bg-amber-300/12 text-amber-100",
} as const;

const activationToneClasses = {
  queued: "bg-amber-300/12 text-amber-100",
  provisioning: "bg-sky-400/12 text-sky-200",
  live: "bg-emerald-400/12 text-emerald-200",
} as const;

const ticketPriorityClasses = {
  critical: "bg-amber-300/14 text-amber-100",
  priority: "bg-sky-400/14 text-sky-200",
  standard: "bg-white/10 text-white/72",
} as const;

const opsTabs = [
  { key: "timeline", label: "Live pulse", icon: Activity },
  { key: "activations", label: "Activations", icon: Cpu },
  { key: "tickets", label: "Support desk", icon: Workflow },
  { key: "leads", label: "Leads", icon: BellRing },
] as const;

type OpsTabKey = (typeof opsTabs)[number]["key"];

type LeadFormState = {
  name: string;
  email: string;
  company: string;
  sector: string;
  message: string;
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

const initialLeadForm: LeadFormState = {
  name: "",
  email: "",
  company: "",
  sector: "business",
  message: "",
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
  category: "automation",
  summary: "",
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

const formatPrice = (plan: Plan, billing: "annual" | "monthly") =>
  billing === "annual" ? plan.annualPrice : plan.monthlyPrice;

const formatCycle = (billing: "annual" | "monthly") =>
  billing === "annual" ? "/ year" : "/ month";

const formatTime = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const getSectorDeviceIndex = (devices: Device[], sector: Sector) => {
  const matchedIndex = devices.findIndex(
    (device) => device.deviceKey === sector.deviceKey,
  );

  return matchedIndex >= 0 ? matchedIndex : 0;
};

async function fetchOperationsOverview() {
  const response = await axios.get<OperationsOverview>("/api/operations/overview");
  return response.data;
}

function getRequestErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.message;

    if (typeof apiMessage === "string") {
      return apiMessage;
    }

    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-6 text-white">
      <div className="glass-panel flex max-w-md flex-col items-center gap-5 p-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
        >
          <LoaderCircle className="h-10 w-10 text-[var(--accent)]" />
        </motion.div>
        <div className="space-y-2">
          <p className="font-display text-2xl font-semibold">
            Loading brAIn system
          </p>
          <p className="text-sm text-white/68">
            Preparing devices, services, workflows, and runtime signal flow.
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-6 text-white">
      <div className="glass-panel max-w-xl space-y-5 p-8">
        <p className="eyebrow">Connection issue</p>
        <h1 className="font-display text-4xl font-semibold">
          The frontend could not reach the brAIn API.
        </h1>
        <p className="text-white/72">{message}</p>
        <button
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
          onClick={() => window.location.reload()}
          type="button"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function EmptyRuntimeCard({ message }: { message: string }) {
  return (
    <div className="rounded-[1.45rem] border border-dashed border-white/14 bg-white/3 p-4 text-sm text-white/58">
      {message}
    </div>
  );
}

function App() {
  const [content, setContent] = useState<LandingContent | null>(null);
  const [operations, setOperations] = useState<OperationsOverview>(emptyOperations);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSectorIndex, setActiveSectorIndex] = useState(0);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState(0);
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");
  const [opsTab, setOpsTab] = useState<OpsTabKey>("timeline");
  const [uploading, setUploading] = useState(false);
  const [runtimeMessage, setRuntimeMessage] = useState<string | null>(null);
  const [leadForm, setLeadForm] = useState<LeadFormState>(initialLeadForm);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadMessage, setLeadMessage] = useState<string | null>(null);
  const [activationForm, setActivationForm] =
    useState<ActivationFormState>(initialActivationForm);
  const [activationSubmitting, setActivationSubmitting] = useState(false);
  const [activationMessage, setActivationMessage] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState<TicketFormState>(initialTicketForm);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketMessage, setTicketMessage] = useState<string | null>(null);

  const refreshOperations = async () => {
    const overview = await fetchOperationsOverview();
    startTransition(() => {
      setOperations(overview);
    });
    return overview;
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const contentResponse = await axios.get<LandingContent>("/api/content");

        if (!active) {
          return;
        }

        setContent(contentResponse.data);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(getRequestErrorMessage(requestError, "Unknown API error"));
      } finally {
        if (active) {
          setLoading(false);
        }
      }

      try {
        await refreshOperations();

        if (!active) {
          return;
        }

        setRuntimeMessage(null);
      } catch (runtimeError) {
        if (!active) {
          return;
        }

        setRuntimeMessage(
          getRequestErrorMessage(
            runtimeError,
            "Live services are temporarily unavailable.",
          ),
        );
      }
    };

    void bootstrap();

    const intervalId = window.setInterval(() => {
      void refreshOperations().catch((runtimeError) => {
        if (!active) {
          return;
        }

        setRuntimeMessage(
          getRequestErrorMessage(
            runtimeError,
            "Live services are temporarily unavailable.",
          ),
        );
      });
    }, 12000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!content) {
      return;
    }

    setActiveDeviceIndex(
      getSectorDeviceIndex(content.devices, content.sectors[activeSectorIndex]),
    );
  }, [activeSectorIndex, content]);

  useEffect(() => {
    if (!content) {
      return;
    }

    const matchingDevices = content.devices.filter(
      (device) => device.sectorSlug === activationForm.sector,
    );

    if (
      matchingDevices.length > 0 &&
      !matchingDevices.some(
        (device) => device.deviceKey === activationForm.deviceKey,
      )
    ) {
      setActivationForm((current) => ({
        ...current,
        deviceKey: matchingDevices[0].deviceKey,
      }));
    }
  }, [activationForm.deviceKey, activationForm.sector, content]);

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fileInput = event.currentTarget.elements.namedItem(
      "files",
    ) as HTMLInputElement | null;
    const files = fileInput?.files;

    if (!files?.length) {
      setRuntimeMessage("Choose at least one file before uploading.");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      setUploading(true);
      await axios.post("/api/uploads", formData);
      await refreshOperations();
      setRuntimeMessage("Upload completed successfully.");
      event.currentTarget.reset();
      setOpsTab("timeline");
    } catch (uploadError) {
      setRuntimeMessage(
        getRequestErrorMessage(uploadError, "Upload failed unexpectedly."),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLeadSubmitting(true);
      const leadResponse = await axios.post<{ lead: LeadItem }>(
        "/api/leads",
        leadForm,
      );

      await refreshOperations();
      setLeadForm({ ...initialLeadForm });
      setLeadMessage(
        `Demo request saved for ${leadResponse.data.lead.company} under ${leadResponse.data.lead.sectorLabel}.`,
      );
      setOpsTab("leads");
    } catch (leadError) {
      setLeadMessage(
        getRequestErrorMessage(
          leadError,
          "Could not send the demo request right now.",
        ),
      );
    } finally {
      setLeadSubmitting(false);
    }
  };

  const handleActivationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setActivationSubmitting(true);
      const activationResponse = await axios.post<{ activation: ActivationItem }>(
        "/api/activations",
        activationForm,
      );

      await refreshOperations();
      setActivationForm({
        ...initialActivationForm,
        sector: activationForm.sector,
        deviceKey: activationForm.deviceKey,
        plan: activationForm.plan,
      });
      setActivationMessage(
        `${activationResponse.data.activation.deviceName} is queued for ${activationResponse.data.activation.site}.`,
      );
      setOpsTab("activations");
    } catch (activationError) {
      setActivationMessage(
        getRequestErrorMessage(
          activationError,
          "Could not queue the activation workflow.",
        ),
      );
    } finally {
      setActivationSubmitting(false);
    }
  };

  const handleTicketSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setTicketSubmitting(true);
      const ticketResponse = await axios.post<{ ticket: TicketItem }>(
        "/api/tickets",
        ticketForm,
      );

      await refreshOperations();
      setTicketForm({ ...initialTicketForm });
      setTicketMessage(
        `${ticketResponse.data.ticket.company} ticket opened with ${ticketResponse.data.ticket.priority} priority.`,
      );
      setOpsTab("tickets");
    } catch (ticketError) {
      setTicketMessage(
        getRequestErrorMessage(
          ticketError,
          "Could not open the support workflow right now.",
        ),
      );
    } finally {
      setTicketSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !content) {
    return <ErrorScreen message={error ?? "Content was empty."} />;
  }

  const activeSector = content.sectors[activeSectorIndex] ?? content.sectors[0];
  const activeDevice = content.devices[activeDeviceIndex] ?? content.devices[0];
  const activationDevices = content.devices.filter(
    (device) => device.sectorSlug === activationForm.sector,
  );

  const renderTimeline = (timeline: RuntimeEvent[]) => {
    if (timeline.length === 0) {
      return <EmptyRuntimeCard message="No live events yet. Trigger a form or upload to populate the system pulse." />;
    }

    return timeline.map((event, index) => (
      <motion.div
        className="timeline-card"
        initial={{ opacity: 0, x: 18 }}
        key={event.id}
        transition={{ delay: index * 0.05, duration: 0.28 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-start gap-4">
          <div className="timeline-dot" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-white">{event.title}</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${runtimeToneClasses[event.status]}`}
              >
                {event.type}
              </span>
            </div>
            <p className="mt-2 text-sm leading-7 text-white/68">{event.detail}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/36">
              {formatTime(event.createdAt)}
            </p>
          </div>
        </div>
      </motion.div>
    ));
  };

  const renderActivations = (activations: ActivationItem[]) => {
    if (activations.length === 0) {
      return <EmptyRuntimeCard message="No activations queued yet. Use the workflow studio below to start one." />;
    }

    return activations.map((activation) => (
      <div className="timeline-card" key={activation.id}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-white">{activation.company}</p>
            <p className="mt-1 text-sm text-white/66">
              {activation.deviceName} for {activation.site}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${activationToneClasses[activation.status]}`}
          >
            {activation.status}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="soft-chip">{activation.sectorLabel}</span>
          <span className="soft-chip">{activation.planName}</span>
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/36">
          {formatTime(activation.createdAt)}
        </p>
      </div>
    ));
  };

  const renderTickets = (tickets: TicketItem[]) => {
    if (tickets.length === 0) {
      return <EmptyRuntimeCard message="No support workflows open yet. Submit one to test the help-desk runtime." />;
    }

    return tickets.map((ticket) => (
      <div className="timeline-card" key={ticket.id}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-white">{ticket.company}</p>
            <p className="mt-1 text-sm leading-7 text-white/66">{ticket.summary}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${ticketPriorityClasses[ticket.priority]}`}
          >
            {ticket.priority}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="soft-chip">{ticket.category}</span>
          <span className="soft-chip">{ticket.status}</span>
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/36">
          {formatTime(ticket.createdAt)}
        </p>
      </div>
    ));
  };

  const renderLeads = (leads: LeadItem[]) => {
    if (leads.length === 0) {
      return <EmptyRuntimeCard message="No demo requests yet. The consultation form is ready when you want to test it." />;
    }

    return leads.map((lead) => (
      <div className="timeline-card" key={lead.id}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-white">{lead.company}</p>
            <p className="mt-1 text-sm text-white/66">
              {lead.name} requested a {lead.sectorLabel} walkthrough
            </p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/72">
            {lead.status}
          </span>
        </div>
        {lead.message ? (
          <p className="mt-3 text-sm leading-7 text-white/68">{lead.message}</p>
        ) : null}
        <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/36">
          {formatTime(lead.createdAt)}
        </p>
      </div>
    ));
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg)] text-white">
      <div className="page-grid" />
      <div className="orb orb-left" />
      <div className="orb orb-right" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a className="flex items-center gap-3" href="#hero">
          <div className="logo-chip">br</div>
          <div>
            <p className="font-display text-xl font-semibold tracking-[0.2em] text-white">
              brAIn
            </p>
            <p className="text-xs uppercase tracking-[0.32em] text-white/45">
              AI powered business ecosystem
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-7 text-sm text-white/68 lg:flex">
          <a href="#cloud-system">Platform</a>
          <a href="#sectors">Sectors</a>
          <a href="#live-services">Live Services</a>
          <a href="#operations-center">Operations</a>
          <a href="#devices">Devices</a>
          <a href="#workflow-studio">Workflows</a>
          <a href="#lead-capture">Demo</a>
        </nav>

        <a className="ghost-button hidden lg:inline-flex" href="#operations-center">
          View System
        </a>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 lg:px-10">
        <motion.section
          animate="visible"
          className="grid gap-10 pb-10 pt-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pb-16 lg:pt-10"
          id="hero"
          initial="hidden"
          variants={sectionMotion}
        >
          <div className="space-y-7">
            <div className="space-y-5">
              <p className="eyebrow">{content.hero.eyebrow}</p>
              <h1 className="font-display text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl">
                {content.hero.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/72">
                {content.hero.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {content.hero.badges.map((badge) => (
                <span className="metric-chip" key={badge}>
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <a className="primary-button" href="#operations-center">
                Launch command center
                <ArrowRight className="h-4 w-4" />
              </a>
              <a className="ghost-button" href="#workflow-studio">
                Activate workflows
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {content.hero.metrics.map((metric) => (
                <div className="glass-panel p-5" key={metric.label}>
                  <p className="text-sm uppercase tracking-[0.24em] text-white/45">
                    {metric.label}
                  </p>
                  <p className="mt-3 font-display text-3xl font-semibold text-white">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              className="hero-frame"
              transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,208,122,0.18),transparent_44%)]" />
              <img
                alt="brAIn main business hub"
                className="hero-image"
                src={content.hero.deviceImage}
              />

              <motion.div
                animate={{ y: [0, -6, 0] }}
                className="floating-panel right-[-1rem] top-6 w-52"
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
              >
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                  Runtime linked
                </p>
                <p className="mt-2 font-display text-2xl font-semibold">
                  Live operations
                </p>
                <p className="mt-2 text-sm text-white/68">
                  Leads, activations, uploads, and tickets run through one product flow.
                </p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                className="floating-panel bottom-[-1.5rem] left-[-1rem] w-60"
                transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity }}
              >
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                  Services online
                </p>
                <div className="mt-3 grid gap-2">
                  {operations.metrics.slice(0, 2).map((metric) => (
                    <div
                      className="rounded-[1.2rem] border border-white/10 bg-white/4 px-4 py-3"
                      key={metric.key}
                    >
                      <p className="text-xs uppercase tracking-[0.22em] text-white/38">
                        {metric.label}
                      </p>
                      <p className="mt-2 font-display text-2xl font-semibold">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="glass-panel grid gap-8 overflow-hidden p-7 lg:grid-cols-[0.95fr_1.05fr] lg:p-9"
          id="cloud-system"
          initial="hidden"
          variants={sectionMotion}
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="space-y-5">
            <p className="eyebrow">Cloud system ready</p>
            <h2 className="font-display text-4xl font-semibold">
              {content.cloudSystem.title}
            </h2>
            <p className="text-base leading-8 text-white/70">
              {content.cloudSystem.summary}
            </p>

            <div className="space-y-3">
              {content.cloudSystem.highlights.map((highlight) => (
                <div className="flex items-center gap-3 text-sm text-white/72" key={highlight}>
                  <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Protocols",
                  values: content.integrations.protocols,
                },
                {
                  label: "Platforms",
                  values: content.integrations.platforms,
                },
                {
                  label: "Cloud",
                  values: content.integrations.cloudPartners,
                },
              ].map((group) => (
                <div className="rounded-[1.75rem] border border-white/10 bg-white/4 p-4" key={group.label}>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                    {group.label}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.values.map((value) => (
                      <span className="soft-chip" key={value}>
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {content.cloudSystem.steps.map((step, index) => {
              const StepIcon = architectureIcons[index] ?? Activity;

              return (
                <motion.div
                  className="architecture-card"
                  initial={{ opacity: 0, x: 18 }}
                  key={step.title}
                  transition={{ delay: index * 0.08, duration: 0.45 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <div className="architecture-icon">
                    <StepIcon className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-white/40">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-white/68">
                      {step.detail}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          className="space-y-8 pt-6"
          id="sectors"
          initial="hidden"
          variants={sectionMotion}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <p className="eyebrow">Sector focus</p>
              <h2 className="font-display text-4xl font-semibold lg:text-5xl">
                One product story, four market-ready verticals.
              </h2>
              <p className="max-w-3xl text-base leading-8 text-white/72">
                The structure stays clear: sector message first, device second,
                then live workflows, automation, and commercial model.
              </p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-4 py-2 text-sm text-emerald-200">
              {content.source === "database"
                ? "Synced from MySQL"
                : "Fallback data until MySQL credentials are added"}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="grid gap-4">
              {content.sectors.map((sector, index) => {
                const SectorIcon =
                  sectorIcons[sector.slug as keyof typeof sectorIcons] ?? Building2;
                const isActive = index === activeSectorIndex;

                return (
                  <button
                    className={`sector-card ${isActive ? "sector-card-active" : ""}`}
                    key={sector.slug}
                    onClick={() => setActiveSectorIndex(index)}
                    type="button"
                  >
                    <div
                      className="sector-icon"
                      style={{ boxShadow: `0 0 0 1px ${sector.accent}33 inset` }}
                    >
                      <SectorIcon
                        className="h-5 w-5"
                        style={{ color: sector.accent }}
                      />
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.26em] text-white/40">
                            {sector.name}
                          </p>
                          <h3 className="mt-2 font-display text-2xl font-semibold">
                            {sector.title}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                            {sector.statLabel}
                          </p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {sector.statValue}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-white/66">
                        {sector.summary}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="glass-panel overflow-hidden p-5 md:p-7">
              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="grid gap-6 lg:grid-cols-[1fr_0.88fr]"
                  exit={{ opacity: 0, y: -18 }}
                  initial={{ opacity: 0, y: 18 }}
                  key={activeSector.slug}
                  transition={{ duration: 0.35 }}
                >
                  <div className="space-y-5">
                    <div
                      className="inline-flex rounded-full px-4 py-2 text-xs uppercase tracking-[0.28em]"
                      style={{
                        backgroundColor: `${activeSector.accent}18`,
                        color: activeSector.accent,
                      }}
                    >
                      {activeSector.name}
                    </div>
                    <h3 className="font-display text-4xl font-semibold">
                      {activeSector.title}
                    </h3>
                    <p className="text-base leading-8 text-white/70">
                      {activeSector.summary}
                    </p>
                    <p className="text-sm uppercase tracking-[0.28em] text-white/40">
                      Best fit: {activeSector.audience}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {activeSector.capabilities.map((capability) => (
                        <div className="capability-chip" key={capability}>
                          <Check className="h-4 w-4 text-[var(--accent)]" />
                          <span>{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="preview-frame">
                      <img
                        alt={activeSector.title}
                        className="h-full w-full object-cover"
                        src={activeSector.imageUrl}
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="space-y-8 pt-6"
          id="live-services"
          initial="hidden"
          variants={sectionMotion}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="space-y-4">
            <p className="eyebrow">Live services</p>
            <h2 className="font-display text-4xl font-semibold lg:text-5xl">
              Uploads, notifications, activations, tickets, and service health are functional here too.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-white/72">
              The experience now behaves like a system: users can trigger runtime
              events and the backend responds immediately with updated states and queues.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.05fr_1.05fr]">
            <div className="glass-panel space-y-5 p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="font-display text-2xl font-semibold">
                  Service health
                </h3>
              </div>
              <div className="space-y-3">
                {operations.services.map((service) => (
                  <div
                    className="rounded-[1.45rem] border border-white/10 bg-white/4 p-4"
                    key={service.key}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{service.label}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          service.status === "online"
                            ? "bg-emerald-400/12 text-emerald-200"
                            : service.status === "ready"
                              ? "bg-sky-400/12 text-sky-200"
                              : "bg-amber-300/12 text-amber-100"
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/66">
                      {service.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel space-y-5 p-6">
              <div className="flex items-center gap-3">
                <BellRing className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="font-display text-2xl font-semibold">
                  Live notifications
                </h3>
              </div>
              <div className="space-y-3">
                {operations.notifications.length === 0 ? (
                  <EmptyRuntimeCard message="Notifications will appear here as workflows fire." />
                ) : (
                  operations.notifications.map((notification) => (
                    <div
                      className="rounded-[1.45rem] border border-white/10 bg-white/4 p-4"
                      key={notification.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">
                          {notification.title}
                        </p>
                        <span className="text-xs uppercase tracking-[0.24em] text-white/40">
                          {notification.level}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-white/68">
                        {notification.body}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/36">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-panel space-y-5 p-6">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="font-display text-2xl font-semibold">
                  Upload tester
                </h3>
              </div>

              <form className="space-y-4" onSubmit={handleUpload}>
                <label className="upload-zone">
                  <input className="hidden" multiple name="files" type="file" />
                  <span className="font-semibold text-white">
                    Drop files here or click to upload
                  </span>
                  <span className="mt-2 text-sm text-white/60">
                    Assets are stored by the Express backend and instantly reflected in the runtime pulse.
                  </span>
                </label>

                <button
                  className="primary-button w-full justify-center"
                  disabled={uploading}
                  type="submit"
                >
                  {uploading ? "Uploading..." : "Upload files"}
                </button>
              </form>

              <div className="space-y-3">
                {operations.uploads.length === 0 ? (
                  <EmptyRuntimeCard message="No uploads yet. Use the panel above to test the storage service live." />
                ) : (
                  operations.uploads.map((uploadItem) => (
                    <div
                      className="rounded-[1.45rem] border border-white/10 bg-white/4 p-4"
                      key={uploadItem.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">
                          {uploadItem.fileName}
                        </p>
                        <span className="text-xs uppercase tracking-[0.24em] text-white/40">
                          {uploadItem.sizeKb} KB
                        </span>
                      </div>
                      <a
                        className="mt-2 inline-flex text-sm text-[var(--accent)] underline decoration-transparent transition hover:decoration-[var(--accent)]"
                        href={uploadItem.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open uploaded file
                      </a>
                      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/36">
                        {formatTime(uploadItem.uploadedAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {runtimeMessage ? (
            <p className="text-sm text-white/64">{runtimeMessage}</p>
          ) : null}
        </motion.section>

        <motion.section
          className="space-y-8 pt-6"
          id="operations-center"
          initial="hidden"
          variants={sectionMotion}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <p className="eyebrow">Operations center</p>
              <h2 className="font-display text-4xl font-semibold lg:text-5xl">
                One animated runtime console for the whole product story.
              </h2>
              <p className="max-w-3xl text-base leading-8 text-white/72">
                Instead of spreading state across isolated sections, the frontend now consumes one
                aggregated operations overview and turns it into a live command center.
              </p>
            </div>
            <a className="ghost-button" href="#workflow-studio">
              Trigger workflows
            </a>
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="glass-panel overflow-hidden p-6">
              <div className="command-stage">
                <motion.div
                  animate={{ rotate: 360 }}
                  className="command-ring command-ring-primary"
                  transition={{ duration: 32, ease: "linear", repeat: Infinity }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  className="command-ring command-ring-secondary"
                  transition={{ duration: 28, ease: "linear", repeat: Infinity }}
                />
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  className="command-core"
                  transition={{ duration: 4.2, ease: "easeInOut", repeat: Infinity }}
                />
                <motion.div
                  animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                  className="command-node command-node-top"
                  transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }}
                />
                <motion.div
                  animate={{ x: [0, 8, 0], opacity: [0.45, 0.9, 0.45] }}
                  className="command-node command-node-right"
                  transition={{ duration: 4.1, ease: "easeInOut", repeat: Infinity }}
                />
                <motion.div
                  animate={{ y: [0, 9, 0], opacity: [0.4, 0.95, 0.4] }}
                  className="command-node command-node-bottom"
                  transition={{ duration: 4.8, ease: "easeInOut", repeat: Infinity }}
                />
                <motion.div
                  animate={{ x: [0, -9, 0], opacity: [0.45, 1, 0.45] }}
                  className="command-node command-node-left"
                  transition={{ duration: 4.4, ease: "easeInOut", repeat: Infinity }}
                />

                <div className="command-copy">
                  <p className="eyebrow">Runtime orchestration</p>
                  <h3 className="mt-4 font-display text-4xl font-semibold">
                    Signals move through leads, uploads, activations, and support.
                  </h3>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-white/70">
                    This module behaves like a live console: forms below generate backend events,
                    and the overview updates into a single operational pulse.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {operations.metrics.map((metric: RuntimeMetric) => (
                  <motion.div
                    className="metric-card"
                    key={metric.key}
                    transition={{ duration: 0.2 }}
                    whileHover={{ y: -4 }}
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                      {metric.label}
                    </p>
                    <p className="mt-3 font-display text-4xl font-semibold">
                      {metric.value}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/62">
                      {metric.detail}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass-panel space-y-6 p-6">
              <div className="command-tabs">
                {opsTabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = opsTab === tab.key;

                  return (
                    <button
                      className={`command-tab ${isActive ? "command-tab-active" : ""}`}
                      key={tab.key}
                      onClick={() => setOpsTab(tab.key)}
                      type="button"
                    >
                      <TabIcon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                  exit={{ opacity: 0, y: -14 }}
                  initial={{ opacity: 0, y: 14 }}
                  key={opsTab}
                  transition={{ duration: 0.25 }}
                >
                  {opsTab === "timeline" ? renderTimeline(operations.timeline) : null}
                  {opsTab === "activations"
                    ? renderActivations(operations.activations)
                    : null}
                  {opsTab === "tickets" ? renderTickets(operations.tickets) : null}
                  {opsTab === "leads" ? renderLeads(operations.leads) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="space-y-8 pt-6"
          id="devices"
          initial="hidden"
          variants={sectionMotion}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="space-y-4">
            <p className="eyebrow">Device lineup</p>
            <h2 className="font-display text-4xl font-semibold lg:text-5xl">
              Hardware that makes the platform tangible.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-white/72">
              The software story is now paired with live activation workflows, so each
              device has an operational path from demo to deployment.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="grid gap-3">
              {content.devices.map((device, index) => {
                const isActive = index === activeDeviceIndex;

                return (
                  <button
                    className={`device-tab ${isActive ? "device-tab-active" : ""}`}
                    key={device.deviceKey}
                    onClick={() => setActiveDeviceIndex(index)}
                    type="button"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-white/40">
                        {device.category}
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-semibold">
                        {device.name}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-white/64">
                        {device.tagline}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/35" />
                  </button>
                );
              })}
            </div>

            <div className="glass-panel overflow-hidden p-5 md:p-7">
              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]"
                  exit={{ opacity: 0, y: -18 }}
                  initial={{ opacity: 0, y: 18 }}
                  key={activeDevice.deviceKey}
                  transition={{ duration: 0.35 }}
                >
                  <div className="preview-frame h-full min-h-[320px]">
                    <img
                      alt={activeDevice.name}
                      className="h-full w-full object-cover"
                      src={activeDevice.imageUrl}
                    />
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="eyebrow">Device details</p>
                      <h3 className="mt-4 font-display text-4xl font-semibold">
                        {activeDevice.name}
                      </h3>
                      <p className="mt-3 text-base leading-8 text-white/70">
                        {activeDevice.description}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {activeDevice.metrics.map((metric) => (
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4" key={metric.label}>
                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                            {metric.label}
                          </p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {metric.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                          Ports & connectivity
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {activeDevice.ports.map((port) => (
                            <span className="soft-chip" key={port}>
                              {port}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                          Suited for
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {activeDevice.suitedFor.map((target) => (
                            <span className="soft-chip" key={target}>
                              {target}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="space-y-8 pt-6"
          id="plans"
          initial="hidden"
          variants={sectionMotion}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <p className="eyebrow">Commercial model</p>
              <h2 className="font-display text-4xl font-semibold lg:text-5xl">
                Pricing plans that match device scale and cloud power.
              </h2>
              <p className="max-w-3xl text-base leading-8 text-white/72">
                The plans come after devices so buyers understand the hardware, then
                choose the subscription layer that fits activation and workflow depth.
              </p>
            </div>

            <div className="billing-switch">
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

          <div className="grid gap-5 xl:grid-cols-4">
            {content.plans.map((plan) => (
              <motion.div
                className={`plan-card ${plan.featured ? "plan-card-featured" : ""}`}
                key={plan.slug}
                whileHover={{ y: -8 }}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                        {plan.name}
                      </p>
                      <h3 className="mt-3 font-display text-3xl font-semibold">
                        EUR {formatPrice(plan, billing)}
                      </h3>
                    </div>
                    {plan.featured ? (
                      <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-slate-950">
                        Most popular
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-white/72">{formatCycle(billing)}</p>
                    <p className="text-base leading-7 text-white/68">{plan.summary}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                        Devices
                      </p>
                      <p className="mt-2 text-sm text-white">{plan.deviceAllowance}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                        Support
                      </p>
                      <p className="mt-2 text-sm text-white">{plan.supportLabel}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] border border-white/10 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                      Automation level
                    </p>
                    <p className="mt-2 text-sm text-white">{plan.automationLabel}</p>
                  </div>

                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div className="flex gap-3 text-sm text-white/74" key={feature}>
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="space-y-8 pt-6"
          id="workflow-studio"
          initial="hidden"
          variants={sectionMotion}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="space-y-4">
            <p className="eyebrow">Workflow studio</p>
            <h2 className="font-display text-4xl font-semibold lg:text-5xl">
              Device rollout and support intake now work as live services.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-white/72">
              These flows make the product feel operational: activation routes hardware into rollout,
              while support tickets simulate ongoing automation and integration work.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="glass-panel p-6">
              <div className="space-y-4">
                <p className="eyebrow">Activation workflow</p>
                <h3 className="font-display text-3xl font-semibold">
                  Queue a device rollout
                </h3>
                <p className="text-sm leading-7 text-white/66">
                  Choose the sector, device, and plan, then attach an installation site to create
                  a provisioning event in the live runtime system.
                </p>
              </div>

              <form className="mt-8 space-y-4" onSubmit={handleActivationSubmit}>
                <label>
                  <span className="form-label">Company</span>
                  <input
                    className="form-input"
                    maxLength={120}
                    onChange={(event) =>
                      setActivationForm((current) => ({
                        ...current,
                        company: event.target.value,
                      }))
                    }
                    placeholder="Client or partner name"
                    required
                    type="text"
                    value={activationForm.company}
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="form-label">Sector</span>
                    <select
                      className="form-select"
                      onChange={(event) =>
                        setActivationForm((current) => ({
                          ...current,
                          sector: event.target.value,
                        }))
                      }
                      value={activationForm.sector}
                    >
                      {content.sectors.map((sector) => (
                        <option key={sector.slug} value={sector.slug}>
                          {sector.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="form-label">Plan</span>
                    <select
                      className="form-select"
                      onChange={(event) =>
                        setActivationForm((current) => ({
                          ...current,
                          plan: event.target.value,
                        }))
                      }
                      value={activationForm.plan}
                    >
                      {content.plans.map((plan) => (
                        <option key={plan.slug} value={plan.slug}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-[0.92fr_1.08fr]">
                  <label>
                    <span className="form-label">Device</span>
                    <select
                      className="form-select"
                      onChange={(event) =>
                        setActivationForm((current) => ({
                          ...current,
                          deviceKey: event.target.value,
                        }))
                      }
                      value={activationForm.deviceKey}
                    >
                      {activationDevices.map((device) => (
                        <option key={device.deviceKey} value={device.deviceKey}>
                          {device.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="form-label">Installation site</span>
                    <input
                      className="form-input"
                      maxLength={160}
                      onChange={(event) =>
                        setActivationForm((current) => ({
                          ...current,
                          site: event.target.value,
                        }))
                      }
                      placeholder="Storefront, clinic desk, factory line..."
                      required
                      type="text"
                      value={activationForm.site}
                    />
                  </label>
                </div>

                <button
                  className="primary-button w-full justify-center"
                  disabled={activationSubmitting}
                  type="submit"
                >
                  {activationSubmitting ? "Queueing..." : "Queue activation"}
                </button>
              </form>

              {activationMessage ? (
                <p className="mt-4 text-sm text-white/70">{activationMessage}</p>
              ) : null}
            </div>

            <div className="glass-panel p-6">
              <div className="space-y-4">
                <p className="eyebrow">Support workflow</p>
                <h3 className="font-display text-3xl font-semibold">
                  Open an automation or integration ticket
                </h3>
                <p className="text-sm leading-7 text-white/66">
                  Create a support workflow with priority and category so the desk above shows
                  how operational follow-up would look in the real product.
                </p>
              </div>

              <form className="mt-8 space-y-4" onSubmit={handleTicketSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="form-label">Company</span>
                    <input
                      className="form-input"
                      maxLength={120}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          company: event.target.value,
                        }))
                      }
                      placeholder="Company or operator"
                      required
                      type="text"
                      value={ticketForm.company}
                    />
                  </label>

                  <label>
                    <span className="form-label">Contact email</span>
                    <input
                      className="form-input"
                      maxLength={120}
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          contactEmail: event.target.value,
                        }))
                      }
                      placeholder="ops@company.com"
                      required
                      type="email"
                      value={ticketForm.contactEmail}
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="form-label">Priority</span>
                    <select
                      className="form-select"
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          priority: event.target.value as TicketFormState["priority"],
                        }))
                      }
                      value={ticketForm.priority}
                    >
                      <option value="critical">Critical</option>
                      <option value="priority">Priority</option>
                      <option value="standard">Standard</option>
                    </select>
                  </label>

                  <label>
                    <span className="form-label">Category</span>
                    <select
                      className="form-select"
                      onChange={(event) =>
                        setTicketForm((current) => ({
                          ...current,
                          category: event.target.value as TicketFormState["category"],
                        }))
                      }
                      value={ticketForm.category}
                    >
                      <option value="automation">Automation</option>
                      <option value="integration">Integration</option>
                      <option value="support">Support</option>
                    </select>
                  </label>
                </div>

                <label>
                  <span className="form-label">Summary</span>
                  <textarea
                    className="form-textarea"
                    maxLength={280}
                    onChange={(event) =>
                      setTicketForm((current) => ({
                        ...current,
                        summary: event.target.value,
                      }))
                    }
                    placeholder="Describe the workflow, issue, or integration that needs attention."
                    required
                    rows={5}
                    value={ticketForm.summary}
                  />
                </label>

                <button
                  className="primary-button w-full justify-center"
                  disabled={ticketSubmitting}
                  type="submit"
                >
                  {ticketSubmitting ? "Opening workflow..." : "Open support workflow"}
                </button>
              </form>

              {ticketMessage ? (
                <p className="mt-4 text-sm text-white/70">{ticketMessage}</p>
              ) : null}
            </div>
          </div>
        </motion.section>

        <motion.section
          className="glass-panel grid gap-8 p-7 lg:grid-cols-[1fr_0.94fr] lg:p-9"
          id="lead-capture"
          initial="hidden"
          variants={sectionMotion}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="space-y-4">
            <p className="eyebrow">Conversion flow</p>
            <h2 className="font-display text-4xl font-semibold">
              Sales intake now feeds the same operational layer as the product workflows.
            </h2>
            <p className="text-base leading-8 text-white/70">
              The landing no longer stops at storytelling. Demo requests, device rollouts,
              support intake, notifications, and uploads now live in one coherent runtime model.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: ShieldCheck,
                  title: "Sector-specific intake",
                  body: "Demo requests already carry sector context so the follow-up path can stay commercial and focused.",
                },
                {
                  icon: Database,
                  title: "One runtime overview",
                  body: "Frontend sections refresh from the same operations endpoint instead of stitching state from scattered calls.",
                },
                {
                  icon: BellRing,
                  title: "Instant visibility",
                  body: "Every new action triggers notifications and appears inside the animated operations center immediately.",
                },
                {
                  icon: Workflow,
                  title: "Ready for admin next",
                  body: "The current service model can be extended into CRM sync, device onboarding, and internal dashboards later.",
                },
              ].map((item) => (
                <div className="rounded-[1.75rem] border border-white/10 bg-white/4 p-5" key={item.title}>
                  <item.icon className="h-5 w-5 text-[var(--accent)]" />
                  <h3 className="mt-4 font-display text-2xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/68">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="cta-frame">
            <div className="space-y-5">
              <p className="eyebrow">Request a walkthrough</p>
              <h2 className="font-display text-4xl font-semibold">
                Send a live demo request straight into brAIn.
              </h2>
              <p className="text-base leading-8 text-white/72">
                Pick the sector, add company context, and the request will be stored by the backend
                and reflected in the command center above.
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleLeadSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="form-label">Name</span>
                  <input
                    className="form-input"
                    maxLength={80}
                    onChange={(event) =>
                      setLeadForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Your name"
                    required
                    type="text"
                    value={leadForm.name}
                  />
                </label>

                <label>
                  <span className="form-label">Work email</span>
                  <input
                    className="form-input"
                    maxLength={120}
                    onChange={(event) =>
                      setLeadForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="name@company.com"
                    required
                    type="email"
                    value={leadForm.email}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_0.72fr]">
                <label>
                  <span className="form-label">Company</span>
                  <input
                    className="form-input"
                    maxLength={120}
                    onChange={(event) =>
                      setLeadForm((current) => ({
                        ...current,
                        company: event.target.value,
                      }))
                    }
                    placeholder="Company or organization"
                    required
                    type="text"
                    value={leadForm.company}
                  />
                </label>

                <label>
                  <span className="form-label">Sector</span>
                  <select
                    className="form-select"
                    onChange={(event) =>
                      setLeadForm((current) => ({
                        ...current,
                        sector: event.target.value,
                      }))
                    }
                    value={leadForm.sector}
                  >
                    {content.sectors.map((sector) => (
                      <option key={sector.slug} value={sector.slug}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span className="form-label">Context</span>
                <textarea
                  className="form-textarea"
                  maxLength={600}
                  onChange={(event) =>
                    setLeadForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  placeholder="Tell us which device, workflow, or use case you want to present."
                  rows={5}
                  value={leadForm.message}
                />
              </label>

              <button
                className="primary-button w-full justify-center"
                disabled={leadSubmitting}
                type="submit"
              >
                {leadSubmitting ? "Sending request..." : "Request live demo"}
              </button>
            </form>

            {leadMessage ? (
              <p className="mt-4 text-sm text-white/70">{leadMessage}</p>
            ) : null}
          </div>
        </motion.section>
      </main>
    </div>
  );
}

export default App;
