import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Cpu, HardDrive, Sparkles, Wifi } from "lucide-react";
import type { Device, Plan, Sector } from "../types";
import { SectorLiveMiniBoard } from "./SectorLiveBoard";

type DevicePreviewStudioProps = {
  device: Device | null;
  onSelectDevice: (deviceKey: string) => void;
  sector: Sector | null;
  onDeploy: () => void;
  plans: Plan[];
  relatedDevices: Device[];
};

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return `rgba(120, 215, 171, ${alpha})`;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildSectorPreviewVars(accent: string): CSSProperties {
  return {
    "--accent": accent,
    "--accent-strong": "#f4fff8",
    "--accent-soft": hexToRgba(accent, 0.18),
    "--accent-secondary": accent,
    "--accent-secondary-soft": hexToRgba(accent, 0.12),
    "--aura-primary": hexToRgba(accent, 0.28),
    "--aura-secondary": hexToRgba(accent, 0.2),
    "--line": hexToRgba(accent, 0.18),
    "--panel-line": hexToRgba(accent, 0.24),
    "--panel-top": "rgba(8, 23, 17, 0.96)",
    "--panel-bottom": "rgba(4, 10, 8, 0.94)",
  } as CSSProperties;
}

export function DevicePreviewStudio({
  device,
  onSelectDevice,
  sector,
  onDeploy,
  plans,
  relatedDevices,
}: DevicePreviewStudioProps) {
  if (!device || !sector) {
    return null;
  }

  return (
    <section
      className="device-preview-shell"
      id="landing-device-page"
      style={buildSectorPreviewVars(sector.accent)}
    >
      <div className="device-preview-copy">
        <span className="device-preview-pill">
          <Sparkles size={15} />
          Hero device stage
        </span>
        <h2>{device.name} preview studio</h2>
        <p>
          A luxury 3D hardware stage for the {sector.name} offer. The active
          device, sector fit, and rollout posture stay live in one polished
          surface before the buyer moves into login or configuration.
        </p>

        <div className="device-preview-insight-grid">
          <div className="device-preview-insight-card">
            <span>Sector fit</span>
            <strong>{sector.audience}</strong>
            <p>{device.tagline}</p>
          </div>
          <div className="device-preview-insight-card">
            <span>Best for</span>
            <strong>{device.suitedFor[0] || "On-site deployment"}</strong>
            <p>{device.description}</p>
          </div>
        </div>

        <div className="device-preview-stats">
          {device.metrics.map((metric) => (
            <div className="device-preview-stat" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>

        <div className="device-preview-ports">
          {device.ports.slice(0, 6).map((port) => (
            <span key={port}>{port}</span>
          ))}
        </div>

        <div className="device-preview-switcher">
          {relatedDevices.map((item) => (
            <button
              className={`device-preview-switcher-button ${
                item.deviceKey === device.deviceKey
                  ? "device-preview-switcher-button-active"
                  : ""
              }`}
              key={item.deviceKey}
              onClick={() => onSelectDevice(item.deviceKey)}
              type="button"
            >
              <strong>{item.name}</strong>
              <small>{item.category}</small>
            </button>
          ))}
        </div>

        <div className="device-preview-actions">
          <button className="device-preview-button" onClick={onDeploy} type="button">
            Start with this device
            <ArrowUpRight size={16} />
          </button>

          <button
            className="device-preview-button-secondary"
            onClick={() => onSelectDevice(device.deviceKey)}
            type="button"
          >
            Keep this device live
          </button>
        </div>
      </div>

      <div className="device-preview-stage">
        <div className="device-preview-stage-glow device-preview-stage-glow-a" />
        <div className="device-preview-stage-glow device-preview-stage-glow-b" />
        <div className="device-preview-orbit device-preview-orbit-a" />
        <div className="device-preview-orbit device-preview-orbit-b" />
        <div className="device-preview-platform" />
        <motion.div
          animate={{
            rotateY: [-20, 14, -20],
            rotateX: [10, 3, 10],
            y: [0, -18, 0],
          }}
          className="device-preview-cube"
          transition={{
            rotateY: { duration: 8.2, repeat: Infinity, ease: "easeInOut" },
            rotateX: { duration: 6.8, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 5.1, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div className="device-preview-face device-preview-front">
            <SectorLiveMiniBoard
              className="h-full"
              dense
              device={device}
              mode="screen"
              plans={plans}
              sector={sector}
            />
          </div>
          <div className="device-preview-face device-preview-back" />
          <div className="device-preview-face device-preview-top" />
          <div className="device-preview-face device-preview-side" />
        </motion.div>
        <div className="device-preview-reflection" />

        <div className="device-preview-hud">
          <div className="device-preview-hud-item">
            <Cpu size={16} />
            <span>{device.category}</span>
          </div>
          <div className="device-preview-hud-item">
            <Wifi size={16} />
            <span>{sector.statValue}</span>
          </div>
          <div className="device-preview-hud-item">
            <HardDrive size={16} />
            <span>{device.suitedFor[0] || "On-site deployment"}</span>
          </div>
        </div>

        <div className="device-preview-side-panel">
          <p className="device-preview-side-kicker">Active device</p>
          <h3>{device.name}</h3>
          <p>{sector.summary}</p>
        </div>
      </div>
    </section>
  );
}
