import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Cable,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Cpu,
  CreditCard,
  KeyRound,
  Layers3,
  MessageSquare,
  Mic,
  Monitor,
  ShieldCheck,
  Sparkles,
  Usb,
  Wifi,
  Zap,
} from "lucide-react";
import { BrainBrand } from "./BrainBrand";
import { FrontPageChatPopup } from "./FrontPageChatPopup";
import type { Device, LandingContent, Plan, Sector } from "../types";

type DevicesPageProps = {
  activeDevice: Device | null;
  activeSector: Sector | null;
  landingContent: LandingContent;
  lightMode: boolean;
  onOpenLogin: () => void;
};

const devicePlanOrder = ["starter", "professional", "business", "platinum", "platinum-plus"];

const deviceFlowSteps = [
  {
    key: "plan",
    icon: CreditCard,
    kicker: "Step 01",
    title: "Choose the plan",
    detail:
      "The buyer starts from the plan board, picks the annual package, and sees the matching device lane before logging in.",
  },
  {
    key: "payment",
    icon: CircleDollarSign,
    kicker: "Step 02",
    title: "Payment request",
    detail:
      "The selected plan moves through buyer login, payment details, and admin approval so the rollout stays controlled.",
  },
  {
    key: "card",
    icon: KeyRound,
    kicker: "Step 03",
    title: "SC card is linked",
    detail:
      "After approval, an SC code is assigned to the plan, sector, and device. This is the secure bridge between payment and activation.",
  },
  {
    key: "connect",
    icon: Cable,
    kicker: "Step 04",
    title: "Plug in the AI Stick",
    detail:
      "The HDMI stick connects to the TV, takes USB power, and joins Wi-Fi so the screen can reach the brAIn cloud.",
  },
  {
    key: "live",
    icon: Monitor,
    kicker: "Step 05",
    title: "TV becomes an AI screen",
    detail:
      "The display opens the brAIn assistant layer with voice, apps, suggestions, and buyer-ready messaging on the screen.",
  },
] as const;

type DeviceFlowKey = (typeof deviceFlowSteps)[number]["key"];

const connectionChecklist = [
  { icon: Cable, label: "HDMI", text: "Stick into TV input" },
  { icon: Usb, label: "USB power", text: "Power from adapter or TV" },
  { icon: Wifi, label: "Wi-Fi", text: "Connect to brAIn cloud" },
];

function getDeviceForSector(sector: Sector | null, devices: Device[]) {
  if (!sector) {
    return null;
  }

  return (
    devices.find((device) => device.deviceKey === sector.deviceKey) ??
    devices.find((device) => device.sectorSlug === sector.slug) ??
    null
  );
}

function getOrderedDevicePlans(plans: Plan[]) {
  const ordered = devicePlanOrder
    .map((slug) => plans.find((plan) => plan.slug === slug))
    .filter((plan): plan is Plan => Boolean(plan));
  const rest = plans.filter(
    (plan) => plan.slug !== "free" && !devicePlanOrder.includes(plan.slug),
  );

  return [...ordered, ...rest];
}

function getDefaultPlanSlug(plans: Plan[]) {
  return (
    plans.find((plan) => plan.slug === "business")?.slug ??
    plans.find((plan) => plan.slug !== "free")?.slug ??
    plans[0]?.slug ??
    ""
  );
}

function getPlanTokenLabel(plan: Plan | null) {
  if (!plan) {
    return "Plan-based tokens";
  }

  return plan.features.find((feature) => /token/i.test(feature)) ?? "Plan-based tokens";
}

function getPlanPriceLabel(plan: Plan | null) {
  if (!plan) {
    return "Choose plan";
  }

  if (plan.annualPrice <= 0) {
    return "Free";
  }

  return `EUR ${plan.annualPrice.toLocaleString("en-GB")}`;
}

function getPlanMonthLabel(plan: Plan | null) {
  if (!plan) {
    return "Annual";
  }

  if (plan.monthlyPrice <= 0) {
    return "Validation";
  }

  return `EUR ${plan.monthlyPrice}/month`;
}

function getSmartCardCode(plan: Plan | null, sector: Sector | null) {
  const planCode = (plan?.slug ?? "plan").replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase();
  const sectorCode = (sector?.slug ?? "tv").replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase();

  return `SC-${planCode || "BIZ"}-${sectorCode || "TV"}-248`;
}

type DeviceFlowVisualProps = {
  activeStep: DeviceFlowKey;
  device: Device | null;
  plan: Plan | null;
  sector: Sector | null;
};

function DeviceFlowVisual({ activeStep, device, plan, sector }: DeviceFlowVisualProps) {
  const smartCardCode = getSmartCardCode(plan, sector);
  const sceneCopy: Record<DeviceFlowKey, { title: string; prompt: string; secondary: string }> = {
    plan: {
      title: plan?.name ?? "Choose plan",
      prompt: "Pick the package",
      secondary: plan?.deviceAllowance ?? "Device allowance",
    },
    payment: {
      title: "Request pending",
      prompt: "Confirm details",
      secondary: "Admin approval",
    },
    card: {
      title: smartCardCode,
      prompt: "Link card",
      secondary: sector?.name ?? "Device lane",
    },
    connect: {
      title: "HDMI + USB + Wi-Fi",
      prompt: "Plug and pair",
      secondary: "Cloud handshake",
    },
    live: {
      title: "How can I help today?",
      prompt: "Ask anything",
      secondary: "Apps + assistant",
    },
  };
  const copy = sceneCopy[activeStep];
  const tvMetrics = [
    { label: "Plan value", value: getPlanPriceLabel(plan), tone: "blue" },
    { label: "Calls handled", value: activeStep === "live" ? "28" : "Ready", tone: "green" },
    { label: "Tasks automated", value: activeStep === "connect" ? "Pairing" : "56", tone: "violet" },
    { label: "New leads", value: activeStep === "card" ? "Linked" : "14", tone: "gold" },
  ];
  const quickActions = ["Create content", "Analyze data", "Automate task", "Answer calls"];

  return (
    <div className={`brain-device-flow-scene brain-device-flow-scene-${activeStep}`}>
      <div className="brain-device-cloud-node brain-device-cloud-node-plan">
        <CreditCard className="h-4 w-4" />
        <span>{plan?.name ?? "Plan"}</span>
      </div>

      <div className="brain-device-cloud-node brain-device-cloud-node-card">
        <KeyRound className="h-4 w-4" />
        <span>{smartCardCode}</span>
      </div>

      <div className="brain-device-tv-wrap" aria-hidden="true">
        <div className="brain-device-tv-frame">
          <div className="brain-device-tv-screen">
            <div className="brain-device-tv-topbar">
              <strong>
                <span className="brain-device-tv-logo-mark" />
                brAIn
              </strong>
              <span>Home</span>
              <span>Analytics</span>
              <span>Automation</span>
              <span>Communication</span>
              <span>Settings</span>
              <Wifi className="h-4 w-4" />
              <span>10:30 AM</span>
            </div>

            <div className="brain-device-tv-grid">
              <div className="brain-device-tv-assistant">
                <div className="brain-device-tv-wave-large" />
                <span>Hello!</span>
                <strong>{copy.title}</strong>
                <div className="brain-device-tv-mic">
                  <Mic className="h-6 w-6" />
                </div>
                <p>Press the mic and speak</p>
              </div>

              <div className="brain-device-tv-dashboard">
                <span className="brain-device-tv-overview-label">Overview</span>

                <div className="brain-device-tv-metrics-row">
                  {tvMetrics.map((metric) => (
                    <div
                      className={`brain-device-tv-metric brain-device-tv-metric-${metric.tone}`}
                      key={metric.label}
                    >
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                      <i />
                    </div>
                  ))}
                </div>

                <div className="brain-device-tv-actions-row">
                  {quickActions.map((action) => (
                    <span key={action}>
                      <Zap className="h-4 w-4" />
                      {action}
                    </span>
                  ))}
                </div>

                <div className="brain-device-tv-lower-row">
                  <div className="brain-device-tv-activity">
                    <span>Recent activity</span>
                    <p>AI assistant is online</p>
                    <p>{smartCardCode} linked</p>
                    <p>{device?.name ?? "AI Stick"} handshake ready</p>
                  </div>

                  <div className="brain-device-tv-suggestion">
                    <span>AI suggestion</span>
                    <strong>{copy.prompt}</strong>
                    <p>{copy.secondary}</p>
                  </div>

                  <div className="brain-device-tv-upgrade">
                    <Sparkles className="h-5 w-5" />
                    <span>Active plan</span>
                    <strong>{plan?.name ?? "Business"}</strong>
                    <p>{getPlanTokenLabel(plan)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="brain-device-tv-footer">
              <MessageSquare className="h-4 w-4" />
              <span>Try saying: "Show today status" or "Summarize new leads."</span>
            </div>
          </div>

          <div className="brain-device-tv-ports">
            <span>HDMI</span>
            <span>USB</span>
            <span>LAN</span>
          </div>

          <div className="brain-device-hdmi-stick">
            <div className="brain-device-hdmi-plug" />
            <div className="brain-device-hdmi-body">
              <strong>brAIn</strong>
              <span>AI STICK</span>
              <i />
            </div>
          </div>
        </div>

        <div className="brain-device-tv-stand" />

        <div className="brain-device-payment-card">
          <span>Plan payment</span>
          <strong>{getPlanPriceLabel(plan)}</strong>
          <i>{getPlanMonthLabel(plan)}</i>
        </div>

        <div className="brain-device-smart-card">
          <div className="brain-device-card-chip" />
          <span>Secure card</span>
          <strong>{smartCardCode}</strong>
        </div>
      </div>
    </div>
  );
}

export function DevicesPage({
  activeDevice,
  activeSector,
  landingContent,
  lightMode,
  onOpenLogin,
}: DevicesPageProps) {
  const defaultSectorSlug = activeSector?.slug ?? landingContent.sectors[0]?.slug ?? "";
  const [selectedSectorSlug, setSelectedSectorSlug] = useState(defaultSectorSlug);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState(() =>
    getDefaultPlanSlug(landingContent.plans),
  );
  const [activeStep, setActiveStep] = useState<DeviceFlowKey>("plan");

  const devicePlans = useMemo(
    () => getOrderedDevicePlans(landingContent.plans),
    [landingContent.plans],
  );
  const selectedSector =
    landingContent.sectors.find((sector) => sector.slug === selectedSectorSlug) ??
    activeSector ??
    landingContent.sectors[0] ??
    null;
  const selectedDevice =
    getDeviceForSector(selectedSector, landingContent.devices) ?? activeDevice ?? null;
  const selectedPlan =
    landingContent.plans.find((plan) => plan.slug === selectedPlanSlug) ??
    devicePlans[0] ??
    landingContent.plans[0] ??
    null;
  const activeStepIndex = deviceFlowSteps.findIndex((step) => step.key === activeStep);
  const activeFlowStep = deviceFlowSteps[activeStepIndex] ?? deviceFlowSteps[0];
  const smartCardCode = getSmartCardCode(selectedPlan, selectedSector);

  useEffect(() => {
    if (activeSector?.slug) {
      setSelectedSectorSlug(activeSector.slug);
    }
  }, [activeSector?.slug]);

  useEffect(() => {
    if (
      landingContent.sectors.length > 0 &&
      !landingContent.sectors.some((sector) => sector.slug === selectedSectorSlug)
    ) {
      setSelectedSectorSlug(landingContent.sectors[0].slug);
    }
  }, [landingContent.sectors, selectedSectorSlug]);

  useEffect(() => {
    if (
      landingContent.plans.length > 0 &&
      !landingContent.plans.some((plan) => plan.slug === selectedPlanSlug)
    ) {
      setSelectedPlanSlug(getDefaultPlanSlug(landingContent.plans));
    }
  }, [landingContent.plans, selectedPlanSlug]);

  function moveToNextStep() {
    const nextStep = deviceFlowSteps[Math.min(activeStepIndex + 1, deviceFlowSteps.length - 1)];
    setActiveStep(nextStep.key);
  }

  return (
    <main
      className={`brain-help-shell brain-devices-shell brain-devices-page brain-devices-flow-page ${
        lightMode ? "light-mode" : ""
      }`}
    >
      <div className="brain-page-brand-bar">
        <a className="brain-page-brand-link" href="/">
          <BrainBrand showTagline subtitle="Managed AI devices" />
        </a>
        <div className="brain-page-brand-actions">
          <a className="executive-button-secondary" href="/">
            Main page
          </a>
          <a className="executive-button-secondary" href="/help">
            Help
          </a>
        </div>
      </div>

      <section className="brain-devices-flow-hero" aria-label="Devices activation flow">
        <div className="brain-devices-flow-copy">
          <span className="landing-inline-label">Devices</span>
          <h1 className="brain-help-title">Plan, SC card, HDMI stick, live AI screen.</h1>
          <p className="brain-help-copy">
            This is the full device flow: choose a plan, send the payment request, link the secure
            SC card, plug the HDMI stick into the TV, and bring the brAIn assistant layer live.
          </p>

          <div className="brain-help-actions">
            <button className="executive-button-primary" onClick={onOpenLogin} type="button">
              Buyer login
              <ArrowRight className="h-4 w-4" />
            </button>
            <a className="executive-button-secondary" href="/#landing-plans">
              View plans
            </a>
          </div>
        </div>

        <div className="brain-devices-flow-summary" aria-label="Selected device summary">
          <span>Selected setup</span>
          <strong>{selectedDevice?.name ?? "brAIn AI Stick"}</strong>
          <p>{selectedDevice?.tagline ?? "A managed AI device connected through plan and SC card."}</p>
          <div>
            <span>{selectedPlan?.name ?? "Plan"}</span>
            <span>{smartCardCode}</span>
          </div>
        </div>
      </section>

      <section className="brain-device-switchboard" aria-label="Choose device lane">
        <div className="brain-device-section-heading">
          <span className="landing-inline-label">Device lanes</span>
          <h2>Pick the sector, then watch the same activation flow.</h2>
        </div>

        <div className="brain-device-lane-grid">
          {landingContent.sectors.map((sector) => {
            const device = getDeviceForSector(sector, landingContent.devices);
            const active = sector.slug === selectedSector?.slug;

            return (
              <button
                className={`brain-device-lane-card ${active ? "brain-device-lane-card-active" : ""}`}
                key={sector.slug}
                onClick={() => {
                  setSelectedSectorSlug(sector.slug);
                  setActiveStep("plan");
                }}
                type="button"
              >
                <span>
                  <Cpu className="h-4 w-4" />
                  {sector.name}
                </span>
                <strong>{device?.name ?? "brAIn device"}</strong>
                <p>{device?.tagline ?? sector.summary}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="brain-device-flow-stage" aria-label="Interactive device flow">
        <div className="brain-device-flow-rail">
          {deviceFlowSteps.map((step, index) => {
            const Icon = step.icon;
            const active = step.key === activeStep;
            const done = index < activeStepIndex;

            return (
              <button
                className={`brain-device-flow-step ${active ? "brain-device-flow-step-active" : ""} ${
                  done ? "brain-device-flow-step-done" : ""
                }`}
                key={step.key}
                onClick={() => setActiveStep(step.key)}
                type="button"
              >
                <span className="brain-device-flow-step-icon">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <small>{step.kicker}</small>
                  <strong>{step.title}</strong>
                </span>
              </button>
            );
          })}
        </div>

        <DeviceFlowVisual
          activeStep={activeStep}
          device={selectedDevice}
          plan={selectedPlan}
          sector={selectedSector}
        />

        <aside className="brain-device-flow-inspector">
          <span className="landing-inline-label">{activeFlowStep.kicker}</span>
          <h2>{activeFlowStep.title}</h2>
          <p>{activeFlowStep.detail}</p>

          <div className="brain-device-inspector-grid">
            <div>
              <span>Plan</span>
              <strong>{selectedPlan?.name ?? "Choose plan"}</strong>
            </div>
            <div>
              <span>SC card</span>
              <strong>{smartCardCode}</strong>
            </div>
            <div>
              <span>Device</span>
              <strong>{selectedDevice?.name ?? "brAIn AI Stick"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{activeStep === "live" ? "Live screen" : "In flow"}</strong>
            </div>
          </div>

          <button
            className="executive-button-primary brain-device-next-step"
            disabled={activeStepIndex === deviceFlowSteps.length - 1}
            onClick={moveToNextStep}
            type="button"
          >
            Next step
            <ChevronRight className="h-4 w-4" />
          </button>
        </aside>
      </section>

      <section className="brain-device-plan-board" aria-label="Plan cards for device flow">
        <div className="brain-device-section-heading">
          <span className="landing-inline-label">Plans + payment</span>
          <h2>Plans drive payment, payment releases the SC card.</h2>
        </div>

        <div className="brain-device-plan-grid">
          {devicePlans.map((plan) => {
            const active = plan.slug === selectedPlan?.slug;

            return (
              <button
                className={`brain-device-plan-card ${active ? "brain-device-plan-card-active" : ""}`}
                key={plan.slug}
                onClick={() => {
                  setSelectedPlanSlug(plan.slug);
                  setActiveStep("payment");
                }}
                type="button"
              >
                <span className="brain-device-plan-icon">
                  {active ? <CheckCircle2 className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                </span>
                <span className="brain-device-plan-name">{plan.name}</span>
                <strong>{getPlanPriceLabel(plan)}</strong>
                <small>{getPlanMonthLabel(plan)}</small>
                <p>{plan.deviceAllowance}</p>
                <em>{getPlanTokenLabel(plan)}</em>
              </button>
            );
          })}
        </div>
      </section>

      <section className="brain-device-connection-board" aria-label="HDMI stick setup">
        <div className="brain-device-connection-copy">
          <span className="landing-inline-label">HDMI AI Stick</span>
          <h2>Any TV can become the device.</h2>
          <p>
            The physical part is simple: plug the stick into HDMI, power it through USB, connect it
            to the network, and the software layer appears on the display.
          </p>
        </div>

        <div className="brain-device-connection-list">
          {connectionChecklist.map((item) => {
            const Icon = item.icon;

            return (
              <div className="brain-device-connection-item" key={item.label}>
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                <strong>{item.text}</strong>
              </div>
            );
          })}
        </div>

        <div className="brain-device-layer-strip">
          <div>
            <Layers3 className="h-5 w-5" />
            <strong>Software layer</strong>
            <p>Plans, tokens, SC card activation, chat, apps, and cloud control.</p>
          </div>
          <div>
            <ShieldCheck className="h-5 w-5" />
            <strong>Managed rollout</strong>
            <p>Admin approval keeps paid devices, cards, and activations in sync.</p>
          </div>
          <div>
            <MessageSquare className="h-5 w-5" />
            <strong>Screen assistant</strong>
            <p>The TV becomes the customer-facing brAIn assistant surface.</p>
          </div>
        </div>
      </section>

      <FrontPageChatPopup
        device={selectedDevice}
        plans={landingContent.plans}
        sector={selectedSector}
      />
    </main>
  );
}

export default DevicesPage;
