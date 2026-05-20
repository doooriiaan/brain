import { Activity, Cpu, HardDrive, Layers3, ShieldCheck } from "lucide-react";
import { SectorLiveMiniBoard } from "./SectorLiveBoard";
import type { Device, Plan, Sector } from "../types";

type DeviceHeroCollageProps = {
  device: Device | null;
  lightMode?: boolean;
  plans: Plan[];
  sector: Sector | null;
};

export function DeviceHeroCollage({
  device,
  lightMode = false,
  plans,
  sector,
}: DeviceHeroCollageProps) {
  const featuredPlan =
    plans.find((plan) => plan.featured) ??
    plans.find((plan) => plan.slug === "business") ??
    plans[0] ??
    null;

  if (!sector) {
    return (
      <div className="device-hero-collage device-hero-collage-empty">
        <div className="device-hero-card device-hero-card-runtime">
          <div className="device-hero-card-header">
            <span className="device-hero-card-kicker">Live stage</span>
            <Cpu className="h-4 w-4" />
          </div>
          <strong className="device-hero-card-title">Select a sector to open the live wall</strong>
          <p className="device-hero-card-copy">
            The hero stays dynamic and product-led. Once a sector is active, the cards
            update with live device context.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="device-hero-collage">
      <div className="device-hero-card device-hero-card-primary">
        <div className="device-hero-card-header">
          <span className="device-hero-card-kicker">Product</span>
          <Layers3 className="h-4 w-4" />
        </div>
        <strong className="device-hero-card-title">{device?.name ?? sector.name}</strong>
        <p className="device-hero-card-copy">
          {device?.tagline ?? sector.summary}
        </p>
      </div>

      <div className="device-hero-card device-hero-card-runtime">
        <SectorLiveMiniBoard
          dense
          device={device}
          lightMode={lightMode}
          mode="screen"
          plans={plans}
          sector={sector}
        />
      </div>

      <div className="device-hero-card device-hero-card-sector">
        <div className="device-hero-card-header">
          <span className="device-hero-card-kicker">Audience</span>
          <Activity className="h-4 w-4" />
        </div>
        <strong className="device-hero-card-title">{sector.audience}</strong>
        <p className="device-hero-card-copy">{sector.statValue}</p>
      </div>

      <div className="device-hero-card device-hero-card-ports">
        <div className="device-hero-card-header">
          <span className="device-hero-card-kicker">Ports</span>
          <HardDrive className="h-4 w-4" />
        </div>
        <div className="device-hero-pill-row">
          {(device?.ports.slice(0, 4) ?? ["Cloud", "Wi-Fi"]).map((port) => (
            <span className="device-hero-pill" key={port}>
              {port}
            </span>
          ))}
        </div>
      </div>

      <div className="device-hero-card device-hero-card-plan">
        <div className="device-hero-card-header">
          <span className="device-hero-card-kicker">Recommended plan</span>
          <ShieldCheck className="h-4 w-4" />
        </div>
        <strong className="device-hero-card-title">
          {featuredPlan?.name ?? "Business"}
        </strong>
        <p className="device-hero-card-copy">
          {featuredPlan?.summary ?? "Managed cloud rollout and guided onboarding."}
        </p>
      </div>
    </div>
  );
}
