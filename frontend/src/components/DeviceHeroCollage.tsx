import { Cpu, Layers3, ShieldCheck } from "lucide-react";
import { SectorLiveMiniBoard } from "./SectorLiveBoard";
import type { Device, Sector } from "../types";

type DeviceHeroCollageProps = {
  device: Device | null;
  lightMode?: boolean;
  sector: Sector | null;
};

export function DeviceHeroCollage({
  device,
  lightMode = false,
  sector,
}: DeviceHeroCollageProps) {
  if (!sector) {
    return (
      <div className="device-hero-collage device-hero-collage-empty">
        <div className="device-hero-card device-hero-card-runtime">
          <div className="device-hero-card-header">
            <span className="device-hero-card-kicker">Selected device</span>
            <Cpu className="h-4 w-4" />
          </div>
          <strong className="device-hero-card-title">Select a sector to open the live wall</strong>
          <p className="device-hero-card-copy">
            The hero stays product-led. Once a sector is active, the live device context
            updates here.
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
        <p className="device-hero-card-copy">{device?.tagline ?? sector.summary}</p>
      </div>

      <div className="device-hero-card device-hero-card-runtime">
        <SectorLiveMiniBoard
          dense
          device={device}
          lightMode={lightMode}
          mode="screen"
          sector={sector}
        />
      </div>

      <div className="device-hero-card device-hero-card-summary">
        <div className="device-hero-card-header">
          <span className="device-hero-card-kicker">Selected fit</span>
          <ShieldCheck className="h-4 w-4" />
        </div>
        <strong className="device-hero-card-title">{sector.audience}</strong>
        <p className="device-hero-card-copy">
          {sector.capabilities[0] ?? "Managed deployment with clear product context."}
        </p>
        <div className="device-hero-pill-row">
          {(device?.ports.slice(0, 4) ?? ["Cloud", "Wi-Fi"]).map((port) => (
            <span className="device-hero-pill" key={port}>
              {port}
            </span>
          ))}
        </div>
        <p className="device-hero-card-copy device-hero-card-copy-compact">
          {sector.statValue}
        </p>
      </div>
    </div>
  );
}
