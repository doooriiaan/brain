import { useEffect, useState, type FormEvent } from "react";
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
  Device,
  LandingContent,
  NotificationItem,
  Plan,
  Sector,
  ServiceStatus,
  UploadItem,
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
            Loading brAIn experience
          </p>
          <p className="text-sm text-white/68">
            Preparing sectors, devices, pricing plans, and cloud flow.
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

function App() {
  const [content, setContent] = useState<LandingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSectorIndex, setActiveSectorIndex] = useState(0);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState(0);
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [recentUploads, setRecentUploads] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [runtimeMessage, setRuntimeMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await axios.get<LandingContent>("/api/content");
        setContent(response.data);
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unknown API error";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadContent();
  }, []);

  useEffect(() => {
    let active = true;

    const loadRuntimeData = async () => {
      try {
        const [notificationResponse, statusResponse, uploadResponse] =
          await Promise.all([
            axios.get<{ notifications: NotificationItem[] }>("/api/notifications"),
            axios.get<{ services: ServiceStatus[] }>("/api/services/status"),
            axios.get<{ uploads: UploadItem[] }>("/api/uploads"),
          ]);

        if (!active) {
          return;
        }

        setNotifications(notificationResponse.data.notifications);
        setServiceStatuses(statusResponse.data.services);
        setRecentUploads(uploadResponse.data.uploads);
        setRuntimeMessage(null);
      } catch (runtimeError) {
        if (!active) {
          return;
        }

        const message =
          runtimeError instanceof Error
            ? runtimeError.message
            : "Live services are temporarily unavailable.";
        setRuntimeMessage(message);
      }
    };

    void loadRuntimeData();

    const intervalId = window.setInterval(() => {
      void loadRuntimeData();
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
      const uploadResponse = await axios.post<{ uploads: UploadItem[] }>(
        "/api/uploads",
        formData,
      );
      const [notificationResponse, statusResponse] = await Promise.all([
        axios.get<{ notifications: NotificationItem[] }>("/api/notifications"),
        axios.get<{ services: ServiceStatus[] }>("/api/services/status"),
      ]);

      setRecentUploads((currentUploads) => [
        ...uploadResponse.data.uploads,
        ...currentUploads,
      ].slice(0, 6));
      setNotifications(notificationResponse.data.notifications);
      setServiceStatuses(statusResponse.data.services);
      setRuntimeMessage("Upload completed successfully.");
      event.currentTarget.reset();
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed unexpectedly.";
      setRuntimeMessage(message);
    } finally {
      setUploading(false);
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
          <a href="#live-services">Live Services</a>
          <a href="#sectors">Sectors</a>
          <a href="#devices">Devices</a>
          <a href="#plans">Plans</a>
          <a href="#cloud-system">Platform</a>
        </nav>

        <a className="ghost-button hidden lg:inline-flex" href="#plans">
          Launch Pricing
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
              <a className="primary-button" href={content.hero.primaryCta.href}>
                {content.hero.primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a className="ghost-button" href={content.hero.secondaryCta.href}>
                {content.hero.secondaryCta.label}
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
                  Cloud linked
                </p>
                <p className="mt-2 font-display text-2xl font-semibold">
                  24/7 orchestration
                </p>
                <p className="mt-2 text-sm text-white/68">
                  Devices, dashboards, voice AI and workflows in one stack.
                </p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                className="floating-panel bottom-[-1.5rem] left-[-1rem] w-60"
                transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity }}
              >
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                  Plans preview
                </p>
                <img
                  alt="brAIn plans"
                  className="mt-3 rounded-[1.5rem] border border-white/10"
                  src={content.hero.plansImage}
                />
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
                The structure is cleaner now: first the sector, then the device,
                then the live platform services, and finally the pricing model.
                That keeps the idea focused and commercially easy to understand.
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
              Notifications, uploads, and service health are functional here too.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-white/72">
              This project stands on its own. The landing experience is paired
              with working backend services so uploads, runtime notifications,
              and platform status can be tested live instead of only shown as mockups.
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
                {serviceStatuses.map((service) => (
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
                {notifications.map((notification) => (
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
                ))}
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
                    Files are stored locally by the Express backend and exposed as live assets.
                  </span>
                </label>

                <button className="primary-button w-full justify-center" disabled={uploading} type="submit">
                  {uploading ? "Uploading..." : "Upload files"}
                </button>
              </form>

              <div className="space-y-3">
                {recentUploads.length === 0 ? (
                  <div className="rounded-[1.45rem] border border-dashed border-white/14 bg-white/3 p-4 text-sm text-white/58">
                    No uploads yet. Use the form above to test the service live.
                  </div>
                ) : (
                  recentUploads.map((uploadItem) => (
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
                The preweb now sells both the software and the physical product.
                That makes the concept stronger because every device now has a
                clear role inside the platform and the live services around it.
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
                The plans section is positioned after devices so the buyer first
                understands the product, then sees what subscription level fits.
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
          className="glass-panel grid gap-8 p-7 lg:grid-cols-[1fr_0.94fr] lg:p-9"
          initial="hidden"
          variants={sectionMotion}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="space-y-4">
            <p className="eyebrow">Why this structure works</p>
            <h2 className="font-display text-4xl font-semibold">
              Sectors first, device second, cloud proof third.
            </h2>
            <p className="text-base leading-8 text-white/70">
              This order makes your sales story easier to understand: who the
              solution is for, what physical product they get, and how the live
              backend services turn it into a scalable platform.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: ShieldCheck,
                  title: "Private by design",
                  body: "MySQL-backed content, secure APIs, and room for account-based access later.",
                },
                {
                  icon: Database,
                  title: "Ready for cloud sync",
                  body: "The frontend already consumes Express API data so we can later extend the platform with more service modules.",
                },
                {
                  icon: Activity,
                  title: "Better demos",
                  body: "Each vertical gets its own message, visuals, and hardware focus for clearer presentations.",
                },
                {
                  icon: Building2,
                  title: "Commercially stronger",
                  body: "Plans, devices, and integrations sit in one journey instead of feeling like separate ideas.",
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
              <p className="eyebrow">Next connection</p>
              <h2 className="font-display text-4xl font-semibold">
                Next step is linking real forms, account flows, and admin modules.
              </h2>
              <p className="text-base leading-8 text-white/72">
                The page is now structured to plug into lead capture,
                onboarding flows, admin dashboards, device activation, and richer
                service modules without changing the visual direction.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a className="primary-button" href="#cloud-system">
                Review architecture
                <ArrowRight className="h-4 w-4" />
              </a>
              <a className="ghost-button" href="#hero">
                Back to top
              </a>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

export default App;
