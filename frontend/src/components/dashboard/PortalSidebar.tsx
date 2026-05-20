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
    <aside
      className="workspace-runtime-theme glass-card compact-card dashboard-sidebar max-h-screen overflow-y-auto pr-1"
      style={{ scrollbarWidth: "thin" }}
    >
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
              className={`portal-tab w-full justify-start ${
                isActive ? "portal-tab-active" : ""
              }`}
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

      <div className="mt-6 space-y-4">
        {/* SYSTEM STATUS */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            System Status
          </p>

          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />

            <p className="text-sm font-medium text-white">
              All Systems Operational
            </p>
          </div>

          <p className="mt-2 text-xs text-white/60">
            Last updated: Just now
          </p>
        </div>

        {/* QUICK STATS */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Quick Stats
          </p>

          <div className="mt-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-white/70">Activity</span>

              <span className="text-sm font-semibold text-cyan-300">
                24 today
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-xs text-white/70">Uptime</span>

              <span className="text-sm font-semibold text-green-300">
                99.9%
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-xs text-white/70">Response</span>

              <span className="text-sm font-semibold text-blue-300">
                45ms
              </span>
            </div>
          </div>
        </div>

        {/* BRAIN LAUNCH MAP */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              brAIn Launch Map
            </p>

            <div className="flex items-center gap-2 text-[10px] text-green-300">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </div>
          </div>

          <div className="space-y-3">

            {/* AI CORE */}
            <div className="relative overflow-hidden rounded-md border border-cyan-400/20 bg-cyan-400/5 p-3">
              <div className="absolute left-0 top-0 h-full w-1 bg-cyan-400" />

              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-cyan-300">
                  AI Core Runtime
                </p>

                <span className="text-[10px] text-cyan-200">
                  ONLINE
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs text-white/60">
                <div className="flex justify-between">
                  <span>Admin Dashboard</span>

                  <span className="text-green-300">Active</span>
                </div>

                <div className="flex justify-between">
                  <span>Automation Engine</span>

                  <span className="text-green-300">Synced</span>
                </div>

                <div className="flex justify-between">
                  <span>Analytics Runtime</span>

                  <span className="text-green-300">Running</span>
                </div>
              </div>
            </div>

            {/* CLIENT DEPLOYMENT */}
            <div className="relative overflow-hidden rounded-md border border-green-400/20 bg-green-400/5 p-3">
              <div className="absolute left-0 top-0 h-full w-1 bg-green-400" />

              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-green-300">
                  Client Deployment
                </p>

                <span className="text-[10px] text-green-200">
                  SECURE
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs text-white/60">
                <div className="flex justify-between">
                  <span>Portal Access</span>

                  <span className="text-green-300">Enabled</span>
                </div>

                <div className="flex justify-between">
                  <span>Lead Capture</span>

                  <span className="text-green-300">Connected</span>
                </div>

                <div className="flex justify-between">
                  <span>Support Layer</span>

                  <span className="text-green-300">Ready</span>
                </div>
              </div>
            </div>

            {/* DEVICE NETWORK */}
            <div className="relative overflow-hidden rounded-md border border-blue-400/20 bg-blue-400/5 p-3">
              <div className="absolute left-0 top-0 h-full w-1 bg-blue-400" />

              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-blue-300">
                  Device Network
                </p>

                <span className="text-[10px] text-blue-200">
                  SYNCED
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs text-white/60">
                <div className="flex justify-between">
                  <span>3D Device Layer</span>

                  <span className="text-green-300">Live</span>
                </div>

                <div className="flex justify-between">
                  <span>Monitoring System</span>

                  <span className="text-green-300">Tracking</span>
                </div>

                <div className="flex justify-between">
                  <span>Cloud Routing</span>

                  <span className="text-green-300">Stable</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CONFIGURATION */}
      <div className="mt-6 space-y-3 border-t border-white/10 pt-4 text-sm text-white/70">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/50">
            Configuration
          </p>

          <div className="space-y-2">
            <p>
              <span className="text-white/50">
                {translate("VPN")}:
              </span>{" "}
              <span className="font-medium text-white">
                {networkMode}
              </span>
            </p>

            <p>
              <span className="text-white/50">
                {translate("Language")}:
              </span>{" "}
              <span className="font-medium text-white">
                {activeLanguageLabel}
              </span>
            </p>

            <p>
              <span className="text-white/50">
                {translate("Country")}:
              </span>{" "}
              <span className="font-medium text-white">
                {activeCountryLabel}
              </span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
