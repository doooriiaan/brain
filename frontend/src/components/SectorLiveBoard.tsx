import type { CSSProperties } from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";
import type { Device, Plan, Sector } from "../types";

type SectorLiveBoardProps = {
  compact?: boolean;
  device: Device | null;
  lightMode?: boolean;
  plans: Plan[];
  sector: Sector;
};

type SectorLiveMiniBoardProps = {
  className?: string;
  dense?: boolean;
  device: Device | null;
  lightMode?: boolean;
  mode?: "card" | "screen";
  plans?: Plan[];
  sector: Sector;
};

const LIGHT_MODE_ACCENT = "#d45a34";

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

function resolveBoardAccent(accent: string, lightMode = false) {
  return lightMode ? LIGHT_MODE_ACCENT : accent;
}

function getShellStyle(accent: string, lightMode = false): CSSProperties {
  if (lightMode) {
    return {
      borderColor: "rgba(0, 0, 0, 0.12)",
      background: `radial-gradient(circle at top right, ${hexToRgba(
        accent,
        0.1,
      )}, transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.99), rgba(255,255,255,0.97))`,
      boxShadow: "0 18px 44px rgba(0, 0, 0, 0.08)",
    };
  }

  return {
    borderColor: `${accent}3a`,
    background: `radial-gradient(circle at top right, ${hexToRgba(
      accent,
      0.2,
    )}, transparent 28%), linear-gradient(180deg, rgba(10,20,18,0.98), rgba(3,8,7,0.96))`,
    boxShadow: `0 20px 60px ${hexToRgba(accent, 0.14)}`,
  };
}

function getGlassStyle(accent: string, lightMode = false): CSSProperties {
  if (lightMode) {
    return {
      borderColor: `${accent}40`,
      background: `linear-gradient(180deg, ${hexToRgba(
        accent,
        0.08,
      )}, rgba(255,255,255,0.98))`,
    };
  }

  return {
    borderColor: `${accent}2f`,
    background: `linear-gradient(180deg, ${hexToRgba(
      accent,
      0.14,
    )}, rgba(255,255,255,0.03))`,
  };
}

function getMiniShellStyle(
  accent: string,
  mode: SectorLiveMiniBoardProps["mode"],
  lightMode = false,
): CSSProperties {
  if (lightMode) {
    return {
      borderColor: "rgba(0, 0, 0, 0.12)",
      background: `radial-gradient(circle at top right, ${hexToRgba(
        accent,
        0.12,
      )}, transparent 32%), linear-gradient(180deg, rgba(255,255,255,0.99), rgba(255,255,255,0.97))`,
      boxShadow: "0 14px 36px rgba(0, 0, 0, 0.08)",
    };
  }

  if (mode === "screen") {
    return {
      background: `radial-gradient(circle at top right, ${hexToRgba(
        accent,
        0.16,
      )}, transparent 32%), linear-gradient(180deg, rgba(7,16,27,0.98), rgba(3,8,16,0.96))`,
    };
  }

  return {
    borderColor: `${accent}30`,
    background: `radial-gradient(circle at top right, ${hexToRgba(
      accent,
      0.18,
    )}, transparent 34%), linear-gradient(180deg, rgba(8,18,16,0.98), rgba(3,8,7,0.96))`,
    boxShadow: `0 18px 44px ${hexToRgba(accent, 0.12)}`,
  };
}

function getBoardPalette(accent: string, lightMode = false) {
  if (lightMode) {
    return {
      body: "rgba(26, 38, 50, 0.8)",
      icon: accent,
      label: "rgba(26, 38, 50, 0.56)",
      panelAltBackground: "rgba(244, 236, 226, 0.88)",
      panelBackground: "rgba(255, 255, 255, 0.84)",
      panelBorder: "rgba(23, 33, 43, 0.08)",
      tagBackground: "rgba(255, 255, 255, 0.9)",
      tagText: "#223240",
      title: "#1a2632",
      track: "rgba(234, 224, 214, 0.86)",
    };
  }

  return {
    body: "rgba(214, 226, 241, 0.84)",
    icon: "#eef6ff",
    label: "rgba(210, 204, 194, 0.72)",
    panelAltBackground: "rgba(255, 255, 255, 0.04)",
    panelBackground: "rgba(0, 0, 0, 0.22)",
    panelBorder: "rgba(255, 255, 255, 0.10)",
    tagBackground: "rgba(255, 255, 255, 0.05)",
    tagText: "#eef6ff",
    title: "#f7fbff",
    track: "rgba(255, 255, 255, 0.08)",
  };
}

function getNeutralPanelStyle(
  palette: ReturnType<typeof getBoardPalette>,
): CSSProperties {
  return {
    borderColor: palette.panelBorder,
    background: palette.panelBackground,
  };
}

function getSoftPanelStyle(
  palette: ReturnType<typeof getBoardPalette>,
): CSSProperties {
  return {
    borderColor: palette.panelBorder,
    background: palette.panelAltBackground,
  };
}

function getTagStyle(
  palette: ReturnType<typeof getBoardPalette>,
): CSSProperties {
  return {
    borderColor: palette.panelBorder,
    background: palette.tagBackground,
    color: palette.tagText,
  };
}

function getTrackStyle(
  palette: ReturnType<typeof getBoardPalette>,
): CSSProperties {
  return {
    background: palette.track,
  };
}

export function SectorLiveMiniBoard({
  className = "",
  dense = false,
  device,
  lightMode = false,
  mode = "card",
  plans = [],
  sector,
}: SectorLiveMiniBoardProps) {
  const accent = resolveBoardAccent(sector.accent, lightMode);
  const palette = getBoardPalette(accent, lightMode);
  const isScreenMode = mode === "screen";
  const isCompactScreen = dense && isScreenMode;
  const metrics = device?.metrics.slice(0, isCompactScreen ? 2 : dense ? 2 : 3) ?? [
    { label: "Mode", value: sector.statValue },
    { label: "Focus", value: sector.capabilities[0] ?? "Live runtime" },
  ];
  const bars = isCompactScreen ? [30, 48, 70, 56] : dense ? [34, 58, 76, 52, 84] : [42, 60, 78, 56, 86];
  const portLabels = device?.ports.slice(0, isCompactScreen ? 2 : dense ? 2 : 3) ?? [
    "Cloud",
    "Sync",
  ];
  const capabilityLabels = sector.capabilities.slice(0, plans.length > 1 ? 2 : 1);
  const visibleCapabilityLabels = isCompactScreen
    ? capabilityLabels.slice(0, 1)
    : capabilityLabels.slice(0, 2);
  const shellClass = [
    "sector-live-mini-board relative overflow-hidden",
    `sector-live-mini-board-${mode}`,
    mode === "screen"
      ? "h-full rounded-[1.7rem] px-3 py-3"
      : "rounded-[24px] border p-4",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClass} style={getMiniShellStyle(accent, mode, lightMode)}>
      <div
        className="pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full blur-3xl"
        style={{ background: hexToRgba(accent, 0.18) }}
      />

      <div className="relative flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="text-[10px] uppercase tracking-[0.24em]"
              style={{ color: palette.label }}
            >
              Live runtime
            </p>
            <h4
              className={`mt-1 min-w-0 font-black leading-tight ${
                isCompactScreen ? "text-[13px]" : dense ? "text-sm" : "text-base"
              }`}
              style={{ color: palette.title }}
            >
              {device?.name ?? sector.name}
            </h4>
          </div>

          <span
            className="rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{
              ...getGlassStyle(accent, lightMode),
              color: palette.title,
            }}
          >
            {sector.statValue}
          </span>
        </div>

        <div className="sector-live-mini-layout grid flex-1 gap-2.5">
          <div
            className={`sector-live-mini-primary flex min-w-0 flex-col ${
              isCompactScreen ? "rounded-[16px] p-2.5" : "rounded-[18px] p-3"
            }`}
            style={getNeutralPanelStyle(palette)}
          >
            <div className="flex items-center justify-between gap-2">
              <p
                className="text-[10px] uppercase tracking-[0.18em]"
                style={{ color: palette.label }}
              >
                Runtime pulse
              </p>
              <Sparkles className="h-3.5 w-3.5" style={{ color: palette.icon }} />
            </div>

            <div
              className={`mt-3 grid items-end gap-1.5 ${
                isCompactScreen ? "h-10 grid-cols-4" : "h-11 grid-cols-5"
              }`}
            >
              {bars.map((height, index) => (
                <div
                  className="rounded-t-full"
                  key={`${sector.slug}-mini-${index}`}
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(180deg, ${hexToRgba(
                      accent,
                      0.95,
                    )}, ${hexToRgba(accent, 0.26)})`,
                  }}
                />
              ))}
            </div>

            <div className="mt-3 space-y-2">
              {metrics.map((metric) => (
                <div
                  className="flex min-w-0 items-center justify-between rounded-xl px-2.5 py-1.5"
                  key={metric.label}
                  style={getSoftPanelStyle(palette)}
                >
                  <span
                    className="truncate pr-2 text-[10px] uppercase tracking-[0.14em]"
                    style={{ color: palette.label }}
                  >
                    {metric.label}
                  </span>
                  <span
                    className={`truncate text-right font-semibold ${
                      isCompactScreen ? "text-[10px]" : "text-[11px]"
                    }`}
                    style={{ color: palette.title }}
                  >
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="sector-live-mini-secondary grid min-w-0 gap-2">
            <div
              className={`${isCompactScreen ? "rounded-[16px] p-2.5" : "rounded-[18px] p-3"}`}
              style={getNeutralPanelStyle(palette)}
            >
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" style={{ color: palette.icon }} />
                <p
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: palette.label }}
                >
                  Best fit
                </p>
              </div>
              <p
                className={`mt-2 min-w-0 font-semibold leading-5 ${
                  isCompactScreen ? "text-[11px]" : "text-xs"
                }`}
                style={{ color: palette.title }}
              >
                {device?.suitedFor[0] ?? sector.audience}
              </p>
            </div>

            <div
              className={`${isCompactScreen ? "rounded-[16px] p-2.5" : "rounded-[18px] p-3"}`}
              style={getNeutralPanelStyle(palette)}
            >
              <div className="flex items-center gap-2">
                <Wifi className="h-3.5 w-3.5" style={{ color: palette.icon }} />
                <p
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: palette.label }}
                >
                  Priority flows
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {visibleCapabilityLabels.map((label) => (
                  <span
                    className={`min-w-0 rounded-full border px-2 py-1 font-semibold ${
                      isCompactScreen ? "max-w-full text-[9px]" : "text-[10px]"
                    }`}
                    key={label}
                    style={getTagStyle(palette)}
                    title={label}
                  >
                    <span className="block truncate">{label}</span>
                  </span>
                ))}
              </div>
            </div>

            <div
              className={`${isCompactScreen ? "rounded-[16px] p-2.5" : "rounded-[18px] p-3"}`}
              style={getNeutralPanelStyle(palette)}
            >
              <div className="flex items-center gap-2">
                <HardDrive className="h-3.5 w-3.5" style={{ color: palette.icon }} />
                <p
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: palette.label }}
                >
                  Ports
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {portLabels.map((port) => (
                  <span
                    className={`rounded-full border px-2 py-1 font-semibold ${
                      isCompactScreen ? "text-[9px]" : "text-[10px]"
                    }`}
                    key={port}
                    style={getTagStyle(palette)}
                  >
                    {port}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectorLiveBoard({
  compact = false,
  device,
  lightMode = false,
  plans,
  sector,
}: SectorLiveBoardProps) {
  const accent = resolveBoardAccent(sector.accent, lightMode);
  const palette = getBoardPalette(accent, lightMode);
  const capabilityCards = sector.capabilities.slice(0, plans.length > 1 ? 2 : 1);
  const metrics = device?.metrics.slice(0, 3) ?? [
    { label: "Mode", value: sector.statValue },
    { label: "Audience", value: sector.audience },
    { label: "Focus", value: sector.capabilities[0] ?? "Live runtime" },
  ];
  const bars = [38, 54, 68, 82, 64, 74];
  const shellClass = compact
    ? "sector-live-board-shell relative overflow-hidden rounded-[28px] border p-4 sm:p-5"
    : "sector-live-board-shell relative h-full overflow-hidden rounded-[30px] border p-5 sm:p-6";
  const titleClass = compact
    ? "mt-2 text-2xl font-black leading-tight"
    : "mt-2 text-3xl font-black leading-tight";

  return (
    <div className={shellClass} style={getShellStyle(accent, lightMode)}>
      <div
        className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full blur-3xl"
        style={{ background: hexToRgba(accent, 0.22) }}
      />
      <div
        className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full blur-3xl"
        style={{ background: hexToRgba(accent, 0.16) }}
      />

      <div className="relative flex h-full flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              className="text-xs uppercase tracking-[0.22em]"
              style={{ color: palette.label }}
            >
              Live sector board
            </p>
            <h3 className={titleClass} style={{ color: palette.title }}>
              {device?.name ?? sector.name}
            </h3>
            <p
              className="mt-2 max-w-2xl text-sm leading-7"
              style={{ color: palette.body }}
            >
              {sector.title}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className="rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{
                ...getGlassStyle(accent, lightMode),
                color: palette.title,
              }}
            >
              {sector.name}
            </span>
            <span
              className="rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
              style={getTagStyle(palette)}
            >
              {sector.statValue}
            </span>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <div style={getNeutralPanelStyle(palette)} className="rounded-[24px] border p-4">
            <div
              className="rounded-[22px] border p-4"
              style={getGlassStyle(accent, lightMode)}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p
                    className="text-xs uppercase tracking-[0.18em]"
                    style={{ color: palette.label }}
                  >
                    Device anchor
                  </p>
                  <p className="mt-2 text-lg font-black" style={{ color: palette.title }}>
                    {device?.name ?? "brAIn runtime"}
                  </p>
                </div>
                <div
                  className="rounded-2xl border p-3"
                  style={{
                    ...getNeutralPanelStyle(palette),
                    color: palette.icon,
                  }}
                >
                  <Cpu className="h-5 w-5" />
                </div>
              </div>

              <div
                className="mt-4 rounded-[20px] border p-4"
                style={getNeutralPanelStyle(palette)}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="text-xs uppercase tracking-[0.18em]"
                    style={{ color: palette.label }}
                  >
                    Runtime chassis
                  </span>
                  <HardDrive className="h-4 w-4" style={{ color: palette.icon }} />
                </div>
                <div className="mt-4 grid grid-cols-[1fr_auto] gap-4">
                  <div className="space-y-3">
                    <div className="h-3 rounded-full" style={getTrackStyle(palette)} />
                    <div className="h-3 w-4/5 rounded-full" style={getTrackStyle(palette)} />
                    <div className="h-3 w-3/5 rounded-full" style={getTrackStyle(palette)} />
                  </div>
                  <div className="grid gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: accent }}
                    />
                    <span className="h-3 w-3 rounded-full bg-emerald-300" />
                    <span className="h-3 w-3 rounded-full bg-amber-300" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div
                  className="rounded-2xl border p-3"
                  style={getNeutralPanelStyle(palette)}
                >
                  <p
                    className="text-xs uppercase tracking-[0.18em]"
                    style={{ color: palette.label }}
                  >
                    Best fit
                  </p>
                  <p
                    className="mt-2 text-sm font-semibold leading-7"
                    style={{ color: palette.title }}
                  >
                    {device?.suitedFor[0] ?? sector.audience}
                  </p>
                </div>
                <div
                  className="rounded-2xl border p-3"
                  style={getNeutralPanelStyle(palette)}
                >
                  <p
                    className="text-xs uppercase tracking-[0.18em]"
                    style={{ color: palette.label }}
                  >
                    Ports
                  </p>
                  <p
                    className="mt-2 text-sm font-semibold leading-7"
                    style={{ color: palette.title }}
                  >
                    {device?.ports.slice(0, 3).join(" / ") ?? "Cloud runtime"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="rounded-[24px] border p-4"
              style={getGlassStyle(accent, lightMode)}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p
                    className="text-xs uppercase tracking-[0.18em]"
                    style={{ color: palette.label }}
                  >
                    Runtime pulse
                  </p>
                  <h4
                    className="mt-2 text-xl font-black leading-tight"
                    style={{ color: palette.title }}
                  >
                    {sector.summary}
                  </h4>
                </div>
                <Sparkles className="h-5 w-5" style={{ color: palette.icon }} />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {metrics.map((metric) => (
                  <div
                    className="rounded-2xl border p-3"
                    key={metric.label}
                    style={getNeutralPanelStyle(palette)}
                  >
                    <p
                      className="text-[11px] uppercase tracking-[0.18em]"
                      style={{ color: palette.label }}
                    >
                      {metric.label}
                    </p>
                    <p
                      className="mt-2 text-sm font-bold"
                      style={{ color: palette.title }}
                    >
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="mt-4 grid h-24 grid-cols-6 items-end gap-2 rounded-2xl border p-3"
                style={getNeutralPanelStyle(palette)}
              >
                {bars.map((height, index) => (
                  <div
                    className="rounded-t-full"
                    key={`${sector.slug}-${index}`}
                    style={{
                      height: `${height}%`,
                      background: `linear-gradient(180deg, ${hexToRgba(
                        accent,
                        0.95,
                      )}, ${hexToRgba(accent, 0.28)})`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div
                className="rounded-[22px] border p-4"
                style={getNeutralPanelStyle(palette)}
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" style={{ color: palette.icon }} />
                  <p
                    className="text-xs uppercase tracking-[0.18em]"
                    style={{ color: palette.label }}
                  >
                    Priority flows
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  {capabilityCards.map((capability) => (
                    <div
                      className="rounded-2xl border px-3 py-2 text-sm font-semibold"
                      key={capability}
                      style={getTagStyle(palette)}
                    >
                      {capability}
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-[22px] border p-4"
                style={getNeutralPanelStyle(palette)}
              >
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" style={{ color: palette.icon }} />
                  <p
                    className="text-xs uppercase tracking-[0.18em]"
                    style={{ color: palette.label }}
                  >
                    Deployment fit
                  </p>
                </div>
                <p
                  className="mt-3 text-sm font-semibold leading-7"
                  style={{ color: palette.title }}
                >
                  {sector.audience}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {sector.capabilities.slice(0, compact ? 3 : 4).map((capability) => (
            <div
              className="rounded-[20px] border px-4 py-3"
              key={capability}
              style={getNeutralPanelStyle(palette)}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4" style={{ color: palette.icon }} />
                <p className="text-sm font-semibold" style={{ color: palette.title }}>
                  {capability}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
