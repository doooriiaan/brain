import type { LucideIcon } from "lucide-react";

type DashboardTab = {
  key: string;
  label: string;
  icon: LucideIcon;
};

type PortalSidebarProps = {
  activeCountryLabel: string;
  activeLanguageLabel: string;
  activeTab: string;
  dashboardSearch: string;
  networkMode: string;
  onSearchChange: (value: string) => void;
  onTabChange: (value: string) => void;
  searchPlaceholder: string;
  sectionLabel: string;
  tabs: readonly DashboardTab[];
  translate: (value: string) => string;
};

export function PortalSidebar({
  activeCountryLabel,
  activeLanguageLabel,
  activeTab,
  dashboardSearch,
  networkMode,
  onSearchChange,
  onTabChange,
  searchPlaceholder,
  sectionLabel,
  tabs,
  translate,
}: PortalSidebarProps) {
  return (
    <aside className="glass-card compact-card dashboard-sidebar">
      <p className="section-kicker">{sectionLabel}</p>
      <input
        className="input-shell mt-4"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        value={dashboardSearch}
      />

      <div className="mt-4 space-y-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              className={`portal-tab w-full justify-start ${isActive ? "portal-tab-active" : ""}`}
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              type="button"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-2 text-sm text-white/70">
        <p>
          {translate("VPN")}: <span className="text-white">{networkMode}</span>
        </p>
        <p>
          {translate("Language")}:{" "}
          <span className="text-white">{activeLanguageLabel}</span>
        </p>
        <p>
          {translate("Country")}:{" "}
          <span className="text-white">{activeCountryLabel}</span>
        </p>
      </div>
    </aside>
  );
}
