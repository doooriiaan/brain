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
  plans: Plan[];
  sector: Sector;
};

type SectorLiveMiniBoardProps = {
  className?: string;
  dense?: boolean;
  device: Device | null;
  mode?: "card" | "screen";
  plans?: Plan[];
  sector: Sector;
};

const sectorPlanMap: Record<string, string[]> = {
  commercial: ["starter", "professional"],
  business: ["business", "professional"],
  healthcare: ["professional", "business"],
  industry: ["platinum", "business"],
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

function getRecommendedPlans(sector: Sector, plans: Plan[]) {
  const preferred = sectorPlanMap[sector.slug] ?? [];
  const ordered = preferred
    .map((slug) => plans.find((plan) => plan.slug === slug))
    .filter((plan): plan is Plan => Boolean(plan));

  return ordered.length > 0 ? ordered : plans.filter((plan) => plan.featured).slice(0, 2);
}

function getShellStyle(accent: string): CSSProperties {
  return {
    borderColor: `${accent}3a`,
    background: `radial-gradient(circle at top right, ${hexToRgba(
      accent,
      0.2,
    )}, transparent 28%), linear-gradient(180deg, rgba(10,20,18,0.98), rgba(3,8,7,0.96))`,
    boxShadow: `0 20px 60px ${hexToRgba(accent, 0.14)}`,
  };
}

function getGlassStyle(accent: string): CSSProperties {
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
): CSSProperties {
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

export function SectorLiveMiniBoard({
  className = "",
  dense = false,
  device,
  mode = "card",
  plans = [],
  sector,
}: SectorLiveMiniBoardProps) {
  const recommendedPlans = getRecommendedPlans(sector, plans).slice(0, 2);
  const metrics = device?.metrics.slice(0, dense ? 2 : 3) ?? [
    { label: "Mode", value: sector.statValue },
    { label: "Focus", value: sector.capabilities[0] ?? "Live runtime" },
  ];
  const bars = dense ? [34, 58, 76, 52, 84] : [42, 60, 78, 56, 86];
  const portLabels = device?.ports.slice(0, dense ? 2 : 3) ?? ["Cloud", "Sync"];
  const planLabels =
    recommendedPlans.length > 0
      ? recommendedPlans.map((plan) => plan.name)
      : sector.capabilities.slice(0, 2);
  const shellClass = [
    "relative overflow-hidden",
    mode === "screen"
      ? "h-full rounded-[1.7rem] px-3 py-3"
      : "rounded-[24px] border p-4",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClass} style={getMiniShellStyle(sector.accent, mode)}>
      <div
        className="pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full blur-3xl"
        style={{ background: hexToRgba(sector.accent, 0.18) }}
      />

      <div className="relative flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
              Live runtime
            </p>
            <h4
              className={`mt-1 truncate font-black text-white ${
                dense ? "text-sm" : "text-base"
              }`}
            >
              {device?.name ?? sector.name}
            </h4>
          </div>

          <span
            className="rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white"
            style={getGlassStyle(sector.accent)}
          >
            {sector.statValue}
          </span>
        </div>

        <div className="grid flex-1 grid-cols-[1.08fr_0.92fr] gap-2.5">
          <div className="flex flex-col rounded-[18px] border border-white/10 bg-black/25 p-3">
            <div className="flex items-center justify-between gap-2 text-white">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Runtime pulse
              </p>
              <Sparkles className="h-3.5 w-3.5" />
            </div>

            <div className="mt-3 grid h-11 grid-cols-5 items-end gap-1.5">
              {bars.map((height, index) => (
                <div
                  className="rounded-t-full"
                  key={`${sector.slug}-mini-${index}`}
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(180deg, ${hexToRgba(
                      sector.accent,
                      0.95,
                    )}, ${hexToRgba(sector.accent, 0.26)})`,
                  }}
                />
              ))}
            </div>

            <div className="mt-3 space-y-2">
              {metrics.map((metric) => (
                <div
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1.5"
                  key={metric.label}
                >
                  <span className="truncate pr-3 text-[10px] uppercase tracking-[0.14em] text-slate-400">
                    {metric.label}
                  </span>
                  <span className="truncate text-[11px] font-semibold text-white">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="rounded-[18px] border border-white/10 bg-black/25 p-3">
              <div className="flex items-center gap-2 text-white">
                <Activity className="h-3.5 w-3.5" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Best fit
                </p>
              </div>
              <p className="mt-2 text-xs font-semibold leading-5 text-white">
                {device?.suitedFor[0] ?? sector.audience}
              </p>
            </div>

            <div className="rounded-[18px] border border-white/10 bg-black/25 p-3">
              <div className="flex items-center gap-2 text-white">
                <Wifi className="h-3.5 w-3.5" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Plan lane
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {planLabels.slice(0, 2).map((label) => (
                  <span
                    className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-semibold text-white"
                    key={label}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-white/10 bg-black/25 p-3">
              <div className="flex items-center gap-2 text-white">
                <HardDrive className="h-3.5 w-3.5" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Ports
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {portLabels.map((port) => (
                  <span
                    className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-semibold text-slate-200"
                    key={port}
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
  plans,
  sector,
}: SectorLiveBoardProps) {
  const recommendedPlans = getRecommendedPlans(sector, plans);
  const metrics = device?.metrics.slice(0, 3) ?? [
    { label: "Mode", value: sector.statValue },
    { label: "Audience", value: sector.audience },
    { label: "Focus", value: sector.capabilities[0] ?? "Live runtime" },
  ];
  const bars = [38, 54, 68, 82, 64, 74];
  const shellClass = compact
    ? "relative overflow-hidden rounded-[28px] border p-4 sm:p-5"
    : "relative h-full overflow-hidden rounded-[30px] border p-5 sm:p-6";
  const titleClass = compact
    ? "mt-2 text-2xl font-black text-white"
    : "mt-2 text-3xl font-black text-white";

  return (
    <div className={shellClass} style={getShellStyle(sector.accent)}>
      <div
        className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full blur-3xl"
        style={{ background: hexToRgba(sector.accent, 0.22) }}
      />
      <div
        className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full blur-3xl"
        style={{ background: hexToRgba(sector.accent, 0.16) }}
      />

      <div className="relative flex h-full flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Live sector board
            </p>
            <h3 className={titleClass}>{device?.name ?? sector.name}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              {sector.title}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className="rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white"
              style={getGlassStyle(sector.accent)}
            >
              {sector.name}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
              {sector.statValue}
            </span>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div
              className="rounded-[22px] border p-4"
              style={getGlassStyle(sector.accent)}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Device anchor
                  </p>
                  <p className="mt-2 text-lg font-black text-white">
                    {device?.name ?? "brAIn runtime"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white">
                  <Cpu className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.18))] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Runtime chassis
                  </span>
                  <HardDrive className="h-4 w-4 text-slate-300" />
                </div>
                <div className="mt-4 grid grid-cols-[1fr_auto] gap-4">
                  <div className="space-y-3">
                    <div className="h-3 rounded-full bg-white/[0.08]" />
                    <div className="h-3 w-4/5 rounded-full bg-white/[0.08]" />
                    <div className="h-3 w-3/5 rounded-full bg-white/[0.08]" />
                  </div>
                  <div className="grid gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: sector.accent }}
                    />
                    <span className="h-3 w-3 rounded-full bg-emerald-300" />
                    <span className="h-3 w-3 rounded-full bg-amber-300" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Best fit
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-7 text-white">
                    {device?.suitedFor[0] ?? sector.audience}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Ports
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-7 text-white">
                    {device?.ports.slice(0, 3).join(" / ") ?? "Cloud runtime"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="rounded-[24px] border p-4"
              style={getGlassStyle(sector.accent)}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Runtime pulse
                  </p>
                  <h4 className="mt-2 text-xl font-black text-white">
                    {sector.summary}
                  </h4>
                </div>
                <Sparkles className="h-5 w-5 text-white" />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {metrics.map((metric) => (
                  <div
                    className="rounded-2xl border border-white/10 bg-black/20 p-3"
                    key={metric.label}
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      {metric.label}
                    </p>
                    <p className="mt-2 text-sm font-bold text-white">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid h-24 grid-cols-6 items-end gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                {bars.map((height, index) => (
                  <div
                    className="rounded-t-full"
                    key={`${sector.slug}-${index}`}
                    style={{
                      height: `${height}%`,
                      background: `linear-gradient(180deg, ${hexToRgba(
                        sector.accent,
                        0.95,
                      )}, ${hexToRgba(sector.accent, 0.28)})`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-white">
                  <Activity className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Recommended plans
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  {recommendedPlans.slice(0, 2).map((plan) => (
                    <div
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white"
                      key={plan.slug}
                    >
                      {plan.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-white">
                  <Wifi className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Deployment fit
                  </p>
                </div>
                <p className="mt-3 text-sm font-semibold leading-7 text-white">
                  {sector.audience}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {sector.capabilities.slice(0, compact ? 3 : 4).map((capability) => (
            <div
              className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3"
              key={capability}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-white" />
                <p className="text-sm font-semibold text-white">{capability}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
