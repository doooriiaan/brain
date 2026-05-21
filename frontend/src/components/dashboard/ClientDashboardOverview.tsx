import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
  Wallet,
} from "lucide-react";
import type {
  ActivationItem,
  ClientPickerItem,
  NotificationItem,
  PaymentRecord,
  SmartCardItem,
  AccountItem,
} from "../../types";

function DashboardStatCard({
  accentClass,
  hint,
  icon,
  title,
  value,
}: {
  accentClass: string;
  hint: string;
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="h-full rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-300">{title}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
        </div>

        <div className={`rounded-2xl border border-white/10 p-3 ${accentClass}`}>
          {icon}
        </div>
      </div>

      <p className="text-sm text-slate-400">{hint}</p>
    </motion.div>
  );
}

function QuickActionCard({
  body,
  icon,
  onClick,
  title,
  toneClass,
}: {
  body: string;
  icon: ReactNode;
  onClick: () => void;
  title: string;
  toneClass: string;
}) {
  return (
    <button
      className="group h-full rounded-[30px] border border-white/10 bg-white/[0.04] p-6 text-left transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
      onClick={onClick}
      type="button"
    >
      <div
        className={`mb-4 inline-flex rounded-2xl border border-white/10 p-3 ${toneClass}`}
      >
        {icon}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-400">{body}</p>
        </div>

        <ArrowUpRight className="mt-1 h-5 w-5 text-slate-500 transition group-hover:text-cyan-300" />
      </div>
    </button>
  );
}

function SignalBars({ values }: { values: number[] }) {
  return (
    <div className="flex h-36 items-end gap-2">
      {values.map((value, index) => (
        <motion.div
          key={`${value}-${index}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${value}%`, opacity: 1 }}
          transition={{ delay: index * 0.04, duration: 0.45 }}
          className="flex-1 rounded-t-[18px] bg-gradient-to-t from-blue-600/80 via-cyan-400/80 to-sky-300/90"
        />
      ))}
    </div>
  );
}

type ClientDashboardOverviewProps = {
  account: AccountItem | null;
  activations: ActivationItem[];
  clients: ClientPickerItem[];
  company: string;
  notifications: NotificationItem[];
  onOpenAccount: () => void;
  onOpenCards: () => void;
  onOpenPayments: () => void;
  onOpenSupport: () => void;
  onSelectCompany: (company: string) => void;
  payments: PaymentRecord[];
  smartCards: SmartCardItem[];
  userEmail: string;
  userName: string;
  formatMoney: (value: number) => string;
};

export function ClientDashboardOverview({
  account,
  activations,
  clients,
  company,
  notifications,
  onOpenAccount,
  onOpenCards,
  onOpenPayments,
  onOpenSupport,
  onSelectCompany,
  payments,
  smartCards,
  userEmail,
  userName,
  formatMoney,
}: ClientDashboardOverviewProps) {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const planName = account?.planName ?? "No active plan";
  const creditsRemaining = account?.creditsRemaining ?? 0;
  const usagePercent =
    creditsRemaining > 0 && account
      ? Math.min((account.monthlyUsage / Math.max(creditsRemaining, 1)) * 100, 100)
      : 0;
  const usageState =
    smartCards.length === 0
      ? "Prepare activation"
      : usagePercent >= 85
        ? "Watch capacity"
        : usagePercent >= 45
          ? "Balanced usage"
          : "Healthy usage";
  const paymentState =
    payments.length > 0 ? `${payments.length} captured` : "No payments yet";
  const latestNotification = notifications[0];
  const signalValues = Array.from({ length: 11 }, (_, index) =>
    Math.max(
      22,
      Math.min(
        88,
        Math.round(
          24 +
            smartCards.length * 3 +
            activations.length * 4 +
            payments.length * 5 +
            index * 4 -
            usagePercent * 0.18,
        ),
      ),
    ),
  );

  return (
    <div className="workspace-runtime-theme space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-[36px] border border-cyan-400/10 bg-white/5 p-8 shadow-[0_20px_80px_rgba(2,12,27,0.55)] backdrop-blur-xl"
      >
        <div className="grid gap-8 xl:grid-cols-[1.18fr_0.82fr]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cyan-200">
              <ShieldCheck size={16} />
              Client Workspace
            </div>

            <h1 className="text-4xl font-black leading-tight md:text-5xl">
              Welcome back{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                {userName || "Client"}
              </span>
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Keep your plan, payments, SC cards, activations, and support in one
              calm live view built around the brAIn system.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                <Sparkles size={16} />
                CLIENT
              </span>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                {account?.status ?? "active"}
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-white">
                {planName}
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-slate-300">
                {usageState}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                onClick={onOpenCards}
                type="button"
              >
                <Ticket size={18} />
                Open SC Cards
              </button>

              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 font-semibold text-white transition hover:bg-white/[0.1]"
                onClick={onOpenPayments}
                type="button"
              >
                <ArrowUpRight size={18} />
                Open Payments
              </button>

              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 font-semibold text-white transition hover:bg-white/[0.08]"
                onClick={onOpenAccount}
                type="button"
              >
                <UserRound size={18} />
                Profile + password
              </button>
            </div>
          </div>

          <div className="h-full rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(15,23,42,0.92))] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Workspace brief
                </p>
                <h2 className="mt-2 text-3xl font-black text-white">
                  Live account status
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  A compact read on plan health, billing state, and client access.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-300">
                <Activity size={24} />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                {
                  label: "Mode",
                  value: "Live workspace",
                  hint: "Plan, cards, and support stay connected here.",
                  toneClass: "bg-cyan-400/10 text-cyan-200",
                },
                {
                  label: "Health",
                  value: usageState,
                  hint: "Current readiness based on usage and linked assets.",
                  toneClass: "bg-emerald-400/10 text-emerald-200",
                },
                {
                  label: "Plan",
                  value: planName,
                  hint: "Current commercial package tied to this company.",
                  toneClass: "bg-indigo-400/10 text-indigo-200",
                },
                {
                  label: "Payments",
                  value: paymentState,
                  hint: "Latest payment posture for this workspace.",
                  toneClass: "bg-violet-400/10 text-violet-200",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-black/10 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-xl font-bold text-white">
                        {item.value}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${item.toneClass}`}
                    >
                      Live
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {item.hint}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-500/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {account?.company ?? company}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {userEmail || "Client email"} / {account?.sectorLabel ?? "brAIn workspace"}
                  </p>
                </div>

                <select
                  className="select-shell max-w-[16rem]"
                  onChange={(event) => onSelectCompany(event.target.value)}
                  value={company}
                >
                  {clients.map((client) => (
                    <option key={client.company} value={client.company}>
                      {client.company} / {client.sectorLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          accentClass="bg-cyan-400/10"
          hint="The active commercial plan tied to this client workspace."
          icon={<ShieldCheck className="h-6 w-6 text-cyan-200" />}
          title="Plan"
          value={planName}
        />
        <DashboardStatCard
          accentClass="bg-sky-400/10"
          hint="Assigned and active smart cards connected to this workspace."
          icon={<Ticket className="h-6 w-6 text-sky-200" />}
          title="SC Cards"
          value={String(smartCards.length)}
        />
        <DashboardStatCard
          accentClass="bg-indigo-400/10"
          hint="Provisioning and deployment requests tracked by the client portal."
          icon={<CheckCircle2 className="h-6 w-6 text-indigo-200" />}
          title="Activations"
          value={String(activations.length)}
        />
        <DashboardStatCard
          accentClass="bg-emerald-400/10"
          hint="Approved payment value captured for this account."
          icon={<Wallet className="h-6 w-6 text-emerald-200" />}
          title="Payments"
          value={formatMoney(totalPaid)}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <QuickActionCard
          body="Open the live payment form and review recent payment activity."
          icon={<CreditCard className="h-7 w-7 text-cyan-200" />}
          onClick={onOpenPayments}
          title="Payments"
          toneClass="bg-cyan-400/10"
        />
        <QuickActionCard
          body="Reveal, validate, and activate assigned smart cards from one place."
          icon={<Ticket className="h-7 w-7 text-emerald-200" />}
          onClick={onOpenCards}
          title="SC Reveal"
          toneClass="bg-emerald-400/10"
        />
        <QuickActionCard
          body="Queue deployment support, installation requests, and activation follow-ups."
          icon={<ShieldCheck className="h-7 w-7 text-amber-200" />}
          onClick={onOpenSupport}
          title="Support + Deploy"
          toneClass="bg-amber-400/10"
        />
        <QuickActionCard
          body={
            latestNotification?.title ??
            "Keep the latest portal signals and company updates close."
          }
          icon={<Sparkles className="h-7 w-7 text-violet-200" />}
          onClick={onOpenSupport}
          title="Latest Signal"
          toneClass="bg-violet-400/10"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Client signal</h2>
              <p className="mt-1 text-sm text-slate-400">
                A compact visual pulse for plan usage, payments, SC cards, and
                deployment activity.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <SignalBars values={signalValues} />

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="text-sm text-slate-400">Plan</p>
              <p className="mt-2 text-lg font-semibold text-white">{planName}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="text-sm text-slate-400">Credits</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {creditsRemaining.toLocaleString("en-GB")}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="text-sm text-slate-400">Billing</p>
              <p className="mt-2 text-lg font-semibold text-white">{paymentState}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white">Client direction</h2>
          <p className="mt-1 text-sm text-slate-400">
            The client dashboard now centers the real brAIn flow instead of
            isolated stats.
          </p>

          <div className="mt-5 space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-300" />
              <div>
                <p className="font-semibold text-white">Plan first</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Every client company keeps its active plan visible at the top.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
              <div>
                <p className="font-semibold text-white">Payment to SC card</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Billing, linked card inventory, and activation now stay in the
                  same dashboard story.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-violet-300" />
              <div>
                <p className="font-semibold text-white">Reveal and support</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Smart-card reveal and deploy support remain one click away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
