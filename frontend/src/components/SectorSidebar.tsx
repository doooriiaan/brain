import type { LucideIcon } from "lucide-react";
import type { Sector } from "../types";

type SectorTab = {
  key: string;
  label: string;
};

type SectorSidebarProps = {
  activeKey: string;
  icons: Record<string, LucideIcon>;
  onSelect: (view: string) => void;
  sectors: Sector[];
  tabs: SectorTab[];
  translate: (value: string) => string;
};

export function SectorSidebar({
  activeKey,
  icons,
  onSelect,
  sectors,
  tabs,
  translate,
}: SectorSidebarProps) {
  const renderSectorButton = (tab: SectorTab, compact = false) => {
    const sector = sectors.find((item) => item.slug === tab.key);
    const Icon = icons[sector?.slug ?? "commercial"] ?? icons.commercial;

    return (
      <button
        className={`sector-side-item ${activeKey === tab.key ? "sector-side-item-active" : ""} ${compact ? "sector-side-item-compact" : ""}`}
        key={tab.key}
        onClick={() => onSelect(tab.key)}
        type="button"
      >
        <div className="sector-icon-wrap">
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-left">
          <p className="text-xs uppercase tracking-[0.24em] text-white/38">
            {translate("Sector")}
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            {sector?.name ?? translate(tab.label)}
          </p>
        </div>
      </button>
    );
  };

  const activeSector = sectors.find((item) => item.slug === activeKey);

  return (
    <>
      <div className="sector-mobile-strip lg:hidden">
        <div className="workspace-runtime-theme glass-card compact-card">
          <p className="section-kicker">{translate("Sector navigation")}</p>
          <div className="sector-mobile-grid mt-4">
            {tabs.map((tab) => renderSectorButton(tab, true))}
          </div>
        </div>
      </div>

      <aside className="sector-side-rail hidden lg:flex workspace-runtime-theme">
        <div className="w-full space-y-4">
          {tabs.map((tab) => renderSectorButton(tab))}
          
          {activeSector && (
            <div className="mt-6 space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Active Sector Info</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/70 font-semibold">{activeSector.title}</p>
                  <p className="mt-1 text-xs text-white/60 leading-relaxed">{activeSector.summary}</p>
                </div>
                {activeSector.capabilities && activeSector.capabilities.length > 0 && (
                  <div>
                    <p className="text-xs text-white/50 mb-2">Capabilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {activeSector.capabilities.slice(0, 5).map((cap) => (
                        <span key={cap} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-cyan-300 border border-cyan-400/20">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="rounded-md border border-white/10 bg-white/5 p-2">
                  <p className="text-xs text-white/50">Status</p>
                  <p className="mt-1 text-xs text-green-300 font-semibold">✓ Ready to Deploy</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
