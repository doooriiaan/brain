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

  return (
    <>
      <div className="sector-mobile-strip lg:hidden">
        <div className="glass-card compact-card">
          <p className="section-kicker">{translate("Sector navigation")}</p>
          <div className="sector-mobile-grid mt-4">
            {tabs.map((tab) => renderSectorButton(tab, true))}
          </div>
        </div>
      </div>

      <aside className="sector-side-rail hidden lg:flex">
        {tabs.map((tab) => renderSectorButton(tab))}
      </aside>
    </>
  );
}
