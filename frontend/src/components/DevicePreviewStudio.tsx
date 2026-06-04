import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Device, Sector } from "../types";

type DevicePreviewStudioProps = {
  device: Device | null;
  lightMode?: boolean;
  sector: Sector | null;
};

type DeviceLiveModelProps = {
  compact?: boolean;
  device: Device | null;
  sector: Sector;
};

const LIGHT_MODE_ACCENT = "#2368ff";

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return `rgba(212, 90, 52, ${alpha})`;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildSectorPreviewVars(accent: string, lightMode = false): CSSProperties {
  const themeAccent = lightMode ? LIGHT_MODE_ACCENT : accent;

  if (lightMode) {
    return {
      "--accent": themeAccent,
      "--accent-strong": "#111111",
      "--accent-soft": hexToRgba(themeAccent, 0.12),
      "--accent-secondary": themeAccent,
      "--accent-secondary-soft": hexToRgba(themeAccent, 0.08),
      "--aura-primary": hexToRgba(themeAccent, 0.16),
      "--aura-secondary": hexToRgba(themeAccent, 0.1),
      "--line": "rgba(0, 0, 0, 0.12)",
      "--panel-line": hexToRgba(themeAccent, 0.26),
      "--panel-top": "rgba(255, 255, 255, 0.99)",
      "--panel-bottom": "rgba(255, 255, 255, 0.97)",
      "--panel-alt-top": "rgba(255, 255, 255, 0.99)",
      "--panel-alt-bottom": "rgba(255, 255, 255, 0.97)",
    } as CSSProperties;
  }

  return {
    "--accent": themeAccent,
    "--accent-strong": "#f4fff8",
    "--accent-soft": hexToRgba(themeAccent, 0.18),
    "--accent-secondary": themeAccent,
    "--accent-secondary-soft": hexToRgba(themeAccent, 0.12),
    "--aura-primary": hexToRgba(themeAccent, 0.28),
    "--aura-secondary": hexToRgba(themeAccent, 0.2),
    "--line": hexToRgba(themeAccent, 0.18),
    "--panel-line": hexToRgba(themeAccent, 0.24),
    "--panel-top": "rgba(8, 23, 17, 0.96)",
    "--panel-bottom": "rgba(4, 10, 8, 0.94)",
  } as CSSProperties;
}

function resolveDeviceModelVariant(sectorSlug: string) {
  if (sectorSlug === "commercial") {
    return "stick";
  }

  if (sectorSlug === "healthcare") {
    return "med";
  }

  if (sectorSlug === "industry") {
    return "edge";
  }

  return "hub";
}

export function DeviceLiveModel({ compact = false, device, sector }: DeviceLiveModelProps) {
  const variant = resolveDeviceModelVariant(sector.slug);

  return (
    <div
      className={`brain-device-live-model brain-device-live-model-${variant} ${
        compact ? "brain-device-live-model-compact" : ""
      }`}
      aria-label={device?.name ?? sector.name}
    >
      {variant === "stick" ? (
        <>
          <div className="brain-device-live-stick-cap" />
          <div className="brain-device-live-stick-body">
            <div className="brain-device-live-stick-screen">
              <span>{device?.name ?? "brAIn AI Stick"}</span>
              <strong>Plug & Play</strong>
            </div>
            <div className="brain-device-live-stick-led" />
          </div>
          <div className="brain-device-live-stick-plug" />
        </>
      ) : variant === "med" ? (
        <>
          <div className="brain-device-live-med-body">
            <div className="brain-device-live-med-camera" />
            <div className="brain-device-live-med-status" />
            <strong>{device?.name ?? "brAIn MED"}</strong>
            <div className="brain-device-live-med-speaker" />
          </div>
          <div className="brain-device-live-med-base" />
        </>
      ) : variant === "edge" ? (
        <>
          <div className="brain-device-live-edge-antenna brain-device-live-edge-antenna-left" />
          <div className="brain-device-live-edge-antenna brain-device-live-edge-antenna-right" />
          <div className="brain-device-live-edge-box">
            <div className="brain-device-live-edge-ridges" />
            <strong>{device?.name ?? "brAIn Edge Box"}</strong>
            <div className="brain-device-live-edge-ports">
              <span />
              <span />
              <span />
            </div>
            <div className="brain-device-live-edge-lights">
              <span />
              <span />
              <span />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="brain-device-live-hub-screen">
            <strong>{device?.name ?? "brAIn Hub"}</strong>
            <div className="brain-device-live-hub-grid">
              <span />
              <span />
              <span />
              <span />
            </div>
            <p>{sector.statValue}</p>
          </div>
          <div className="brain-device-live-hub-speaker" />
          <div className="brain-device-live-hub-stand" />
        </>
      )}

      <div className="brain-device-live-shadow" />
    </div>
  );
}

export function DevicePreviewStudio({
  device,
  lightMode = false,
  sector,
}: DevicePreviewStudioProps) {
  if (!device || !sector) {
    return null;
  }

  return (
    <section
      className="device-preview-shell"
      id="landing-device-page"
      style={buildSectorPreviewVars(sector.accent, lightMode)}
    >
      <div className="device-preview-copy">
        <span className="device-preview-pill">
          <Sparkles size={15} />
          Hardware + software
        </span>
        <h2>{device.name}</h2>
        <p>
          Clean device page for the {sector.name} lane, showing the physical setup and the cloud
          software layer without extra framed blocks.
        </p>

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
            <DeviceLiveModel device={device} sector={sector} />
          </div>
          <div className="device-preview-face device-preview-back" />
          <div className="device-preview-face device-preview-top" />
          <div className="device-preview-face device-preview-side" />
        </motion.div>
        <div className="device-preview-reflection" />
      </div>
    </section>
  );
}
