import { motion } from "framer-motion";
import { ArrowRight, Cpu, Play, ShieldCheck, Sparkles } from "lucide-react";
import type { Device, Plan, Sector } from "../types";
import { SectorLiveBoard } from "./SectorLiveBoard";

type SectorCinemaPageProps = {
  activeDevice: Device | null;
  activeSector: Sector;
  onDeploy: (sector: Sector, plan?: Plan) => void;
  onOpenDevice: (deviceKey?: string) => void;
  onOpenSector: (sectorSlug: string) => void;
  plans: Plan[];
  sectors: Sector[];
};

const sectorPlanMap: Record<string, string[]> = {
  commercial: ["starter", "professional"],
  business: ["business", "professional"],
  healthcare: ["professional", "business"],
  industry: ["platinum", "business"],
};

function getSectorPlans(sector: Sector, plans: Plan[]) {
  const preferredSlugs = sectorPlanMap[sector.slug] ?? [];
  const orderedPlans = preferredSlugs
    .map((slug) => plans.find((plan) => plan.slug === slug))
    .filter((plan): plan is Plan => Boolean(plan));

  return orderedPlans.length > 0
    ? orderedPlans
    : plans.filter((plan) => plan.featured).slice(0, 2);
}

function getPanelStyle(accent: string) {
  return {
    borderColor: `${accent}40`,
    background: `linear-gradient(145deg, ${accent}20 0%, rgba(9, 14, 24, 0.96) 28%, rgba(3, 7, 14, 0.98) 100%)`,
    boxShadow: `0 26px 90px ${accent}16`,
  };
}

function getGlassStyle(accent: string) {
  return {
    borderColor: `${accent}30`,
    background: `linear-gradient(180deg, ${accent}14 0%, rgba(255,255,255,0.04) 100%)`,
  };
}

export function SectorCinemaPage({
  activeDevice,
  activeSector,
  onDeploy,
  onOpenDevice,
  onOpenSector,
  plans,
  sectors,
}: SectorCinemaPageProps) {
  const preferredPlans = getSectorPlans(activeSector, plans);
  const primaryPlan = preferredPlans[0] ?? plans[0];
  const secondaryPlan = preferredPlans[1] ?? plans.find((plan) => plan !== primaryPlan);

  return (
    <section className="space-y-6" id="landing-sector-cinema">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/90"
            style={getGlassStyle(activeSector.accent)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Built-in AI device pages
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Each sector opens as its own cinematic device story
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            The product is positioned as a real embedded AI device with its own
            deployment environment, access flow, and cloud runtime around it.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {sectors.map((sector) => {
            const active = sector.slug === activeSector.slug;

            return (
              <button
                className="rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition hover:-translate-y-0.5"
                key={sector.slug}
                onClick={() => onOpenSector(sector.slug)}
                style={
                  active
                    ? getPanelStyle(sector.accent)
                    : {
                        borderColor: `${sector.accent}35`,
                        background: "rgba(255,255,255,0.04)",
                        color: "#f8fafc",
                      }
                }
                type="button"
              >
                {sector.name}
              </button>
            );
          })}
        </div>
      </div>

      <motion.article
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[40px] border p-6 sm:p-7"
        initial={{ opacity: 0, y: 18 }}
        key={activeSector.slug}
        style={getPanelStyle(activeSector.accent)}
        transition={{ duration: 0.42 }}
      >
        <div
          className="pointer-events-none absolute -left-12 top-10 h-40 w-40 rounded-full blur-3xl"
          style={{ background: `${activeSector.accent}32` }}
        />
        <div
          className="pointer-events-none absolute bottom-8 right-0 h-56 w-56 rounded-full blur-3xl"
          style={{ background: `${activeSector.accent}20` }}
        />

        <div className="relative grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                style={getGlassStyle(activeSector.accent)}
              >
                <Cpu className="h-3.5 w-3.5" />
                Built-in AI device
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                {activeSector.statValue}
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
                {activeSector.name}
              </p>
              <h3 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                {activeSector.title}
              </h3>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-200">
                {activeSector.summary}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div
                className="rounded-[26px] border p-4"
                style={getGlassStyle(activeSector.accent)}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Audience
                </p>
                <p className="mt-3 text-sm font-semibold leading-7 text-white">
                  {activeSector.audience}
                </p>
              </div>
              <div
                className="rounded-[26px] border p-4"
                style={getGlassStyle(activeSector.accent)}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Runtime fit
                </p>
                <p className="mt-3 text-sm font-semibold leading-7 text-white">
                  {activeSector.statLabel} / {activeSector.statValue}
                </p>
              </div>
              <div
                className="rounded-[26px] border p-4"
                style={getGlassStyle(activeSector.accent)}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Device anchor
                </p>
                <p className="mt-3 text-sm font-semibold leading-7 text-white">
                  {activeDevice?.name ?? "brAIn device"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-[#120d0a] transition hover:brightness-105"
                onClick={() => onDeploy(activeSector, primaryPlan)}
                style={{
                  background: `linear-gradient(135deg, ${activeSector.accent}, #f8f3ed)`,
                }}
                type="button"
              >
                Deploy this device
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
                onClick={() => onOpenDevice(activeDevice?.deviceKey)}
                type="button"
              >
                <Play className="h-4 w-4" />
                Open device stage
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {activeSector.capabilities.map((capability) => (
                <div
                  className="rounded-[24px] border p-4"
                  key={capability}
                  style={getGlassStyle(activeSector.accent)}
                >
                  <p className="text-sm font-semibold leading-7 text-white">
                    {capability}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <SectorLiveBoard
                compact
                device={activeDevice}
                plans={plans}
                sector={activeSector}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div
                className="rounded-[28px] border p-5"
                style={getGlassStyle(activeSector.accent)}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Device metrics
                </p>
                <div className="mt-4 space-y-3">
                  {(activeDevice?.metrics ?? []).map((metric) => (
                    <div
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                      key={metric.label}
                    >
                      <span className="text-sm text-slate-400">{metric.label}</span>
                      <strong className="text-sm text-white">{metric.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-[28px] border p-5"
                style={getGlassStyle(activeSector.accent)}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Recommended plan
                </p>
                <h4 className="mt-3 text-2xl font-black text-white">
                  {primaryPlan?.name ?? "Business"}
                </h4>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  {primaryPlan?.summary ??
                    "A commercial package matched to the embedded AI rollout."}
                </p>
                <div className="mt-4 space-y-2">
                  {primaryPlan?.features.slice(0, 3).map((feature) => (
                    <div
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200"
                      key={feature}
                    >
                      {feature}
                    </div>
                  ))}
                </div>
                {secondaryPlan ? (
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                    Also fits: {secondaryPlan.name}
                  </p>
                ) : null}
              </div>
            </div>

            <div
              className="rounded-[30px] border p-5"
              style={getGlassStyle(activeSector.accent)}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-white" />
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                  Ports and deployment fit
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(activeDevice?.ports ?? []).map((port) => (
                  <span
                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white"
                    key={port}
                  >
                    {port}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(activeDevice?.suitedFor ?? []).map((item) => (
                  <span
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-slate-200"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </section>
  );
}
