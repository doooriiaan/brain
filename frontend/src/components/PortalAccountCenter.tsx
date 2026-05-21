import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  KeyRound,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { Plan } from "../types";

type UiMessage = {
  tone: "success" | "error" | "info";
  text: string;
} | null;

type PortalAccountCenterProps = {
  role: "admin" | "client";
  userName: string;
  userEmail: string;
  company: string;
  sessionLabel: string;
  sectorLabel: string;
  planName: string;
  routeLabel: string;
  availablePlans: Plan[];
  selectedPlanSlug?: string | null;
  pendingPaymentsCount: number;
  openTicketsCount: number;
  linkedCardsCount: number;
  saveBusy: boolean;
  passwordBusy: boolean;
  saveMessage: UiMessage;
  passwordMessage: UiMessage;
  onSaveProfile: (payload: { name: string; email: string }) => void;
  onChangePassword: (payload: {
    currentPassword: string;
    nextPassword: string;
    confirmPassword: string;
  }) => void;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  onPickPlan?: (planSlug: string) => void;
};

function AccountMessage({ message }: { message: UiMessage }) {
  if (!message) {
    return null;
  }

  const toneClass =
    message.tone === "success"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : message.tone === "error"
        ? "border-rose-400/20 bg-rose-400/10 text-rose-100"
        : "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${toneClass}`}>
      {message.text}
    </div>
  );
}

export function PortalAccountCenter({
  role,
  userName,
  userEmail,
  company,
  sessionLabel,
  sectorLabel,
  planName,
  routeLabel,
  availablePlans,
  selectedPlanSlug,
  pendingPaymentsCount,
  openTicketsCount,
  linkedCardsCount,
  saveBusy,
  passwordBusy,
  saveMessage,
  passwordMessage,
  onSaveProfile,
  onChangePassword,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
  onPickPlan,
}: PortalAccountCenterProps) {
  const [profileForm, setProfileForm] = useState({
    name: userName,
    email: userEmail,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    nextPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setProfileForm({
      name: userName,
      email: userEmail,
    });
  }, [userEmail, userName]);

  useEffect(() => {
    if (passwordMessage?.tone === "success") {
      setPasswordForm({
        currentPassword: "",
        nextPassword: "",
        confirmPassword: "",
      });
    }
  }, [passwordMessage]);

  const initials = useMemo(() => {
    const source = userName || company || "B";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [company, userName]);

  const featuredPlans = useMemo(() => {
    const preferredOrder = ["free", "starter", "business", "platinum-plus"];
    const filtered = availablePlans.filter((plan) =>
      preferredOrder.includes(plan.slug) || plan.featured,
    );

    return preferredOrder
      .map((slug) => filtered.find((plan) => plan.slug === slug))
      .filter((plan): plan is Plan => Boolean(plan))
      .slice(0, 4);
  }, [availablePlans]);

  const accountCards = [
    {
      label: "Workspace",
      value: company,
      copy: role === "admin" ? "Admin control layer" : "Active client company",
    },
    {
      label: "Plan",
      value: planName,
      copy:
        role === "admin"
          ? "Commercial queues and rollout stay visible here."
          : "Current commercial package attached to this account.",
    },
    {
      label: "Route",
      value: routeLabel,
      copy: "Current network path for the active session.",
    },
    {
      label: "Session",
      value: sessionLabel,
      copy: "Latest authenticated workspace session.",
    },
  ];

  const actionCopy =
    role === "admin"
      ? "Keep identity, queue visibility, and rollout shortcuts together so the workspace feels managed end to end."
      : "Update your profile here, then jump directly into plan, billing, or support without hunting through the portal.";

  return (
    <div className="workspace-runtime-theme grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-6 shadow-[0_22px_65px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.06] text-2xl font-black text-white shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
                {initials || "B"}
              </div>
              <div className="min-w-0">
                <span className="workspace-badge">
                  <Sparkles className="h-3.5 w-3.5" />
                  {role === "admin" ? "Admin account center" : "Client account center"}
                </span>
                <h2 className="mt-4 text-3xl font-black text-white">
                  {userName || "Workspace user"}
                </h2>
                <p className="mt-2 break-all text-sm leading-7 text-slate-300">
                  {userEmail}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="workspace-summary-pill">{sectorLabel}</span>
              <span className="workspace-summary-pill">{planName}</span>
              <span className="workspace-summary-pill">{routeLabel}</span>
            </div>
          </div>

          <p className="text-sm leading-7 text-slate-300">{actionCopy}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {accountCards.map((card) => (
              <div
                className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                key={card.label}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {card.label}
                </p>
                <strong className="mt-2 block text-lg font-black text-white">
                  {card.value}
                </strong>
                <p className="mt-2 text-sm leading-6 text-slate-400">{card.copy}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Pending payments
              </p>
              <strong className="mt-2 block text-2xl font-black text-white">
                {pendingPaymentsCount}
              </strong>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Linked access
              </p>
              <strong className="mt-2 block text-2xl font-black text-white">
                {linkedCardsCount}
              </strong>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Open tickets
              </p>
              <strong className="mt-2 block text-2xl font-black text-white">
                {openTicketsCount}
              </strong>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="executive-button-primary inline-flex items-center justify-center gap-2"
              onClick={onPrimaryAction}
              type="button"
            >
              <ArrowRight className="h-4 w-4" />
              {primaryActionLabel}
            </button>
            <button
              className="executive-button-secondary inline-flex items-center justify-center gap-2"
              onClick={onSecondaryAction}
              type="button"
            >
              <CreditCard className="h-4 w-4" />
              {secondaryActionLabel}
            </button>
          </div>
        </div>
      </article>

      <div className="grid gap-6">
        <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-6 shadow-[0_22px_65px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Profile
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                Update your user details
              </h3>
            </div>
            <UserRound className="h-6 w-6 text-cyan-200" />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="field-shell">
              <span>Name</span>
              <input
                className="field-input"
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Your name"
                type="text"
                value={profileForm.name}
              />
            </label>
            <label className="field-shell">
              <span>Email</span>
              <input
                className="field-input"
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="you@company.com"
                type="email"
                value={profileForm.email}
              />
            </label>
            <label className="field-shell md:col-span-2">
              <span>Company / workspace</span>
              <input className="field-input opacity-80" disabled type="text" value={company} />
            </label>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-400">
            Workspace company remains locked here so linked plans, cards, tickets, and rollout
            history stay consistent.
          </p>

          <div className="mt-4">
            <AccountMessage message={saveMessage} />
          </div>

          <button
            className="executive-button-primary mt-5 inline-flex items-center gap-2"
            disabled={saveBusy}
            onClick={() => onSaveProfile(profileForm)}
            type="button"
          >
            <CheckCircle2 className="h-4 w-4" />
            {saveBusy ? "Saving profile..." : "Save profile"}
          </button>
        </article>

        <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-6 shadow-[0_22px_65px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Security
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  Change password
                </h3>
              </div>
              <KeyRound className="h-6 w-6 text-cyan-200" />
            </div>

            <div className="mt-5 grid gap-4">
              <label className="field-shell">
                <span>Current password</span>
                <input
                  className="field-input"
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  placeholder="Current password"
                  type="password"
                  value={passwordForm.currentPassword}
                />
              </label>
              <label className="field-shell">
                <span>New password</span>
                <input
                  className="field-input"
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      nextPassword: event.target.value,
                    }))
                  }
                  placeholder="At least 8 characters"
                  type="password"
                  value={passwordForm.nextPassword}
                />
              </label>
              <label className="field-shell">
                <span>Confirm new password</span>
                <input
                  className="field-input"
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder="Repeat the new password"
                  type="password"
                  value={passwordForm.confirmPassword}
                />
              </label>
            </div>

            <div className="mt-4">
              <AccountMessage message={passwordMessage} />
            </div>

            <button
              className="executive-button-secondary mt-5 inline-flex items-center gap-2"
              disabled={passwordBusy}
              onClick={() => onChangePassword(passwordForm)}
              type="button"
            >
              <ShieldCheck className="h-4 w-4" />
              {passwordBusy ? "Updating password..." : "Update password"}
            </button>
          </article>

          <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(5,11,21,0.94))] p-6 shadow-[0_22px_65px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {role === "admin" ? "Controls" : "Plan control"}
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {role === "admin"
                    ? "Open the boards that need attention"
                    : "Choose the commercial path that fits"}
                </h3>
              </div>
              <CreditCard className="h-6 w-6 text-cyan-200" />
            </div>

            {role === "client" ? (
              <>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Pick a plan here, then jump straight into the access or billing board to continue
                  the upgrade flow.
                </p>

                <div className="mt-5 grid gap-3">
                  {featuredPlans.map((plan) => {
                    const selected = selectedPlanSlug === plan.slug;

                    return (
                      <button
                        className={`rounded-[24px] border px-4 py-4 text-left transition ${
                          selected
                            ? "border-[rgba(212,90,52,0.3)] bg-[rgba(212,90,52,0.12)]"
                            : "border-white/10 bg-black/20 hover:-translate-y-0.5 hover:bg-white/[0.05]"
                        }`}
                        key={plan.slug}
                        onClick={() => onPickPlan?.(plan.slug)}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              {plan.featured ? "Recommended" : plan.slug === "free" ? "Free" : "Managed"}
                            </p>
                            <strong className="mt-2 block text-lg font-black text-white">
                              {plan.name}
                            </strong>
                          </div>
                          <span className="workspace-summary-pill">{plan.deviceAllowance}</span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">{plan.summary}</p>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="mt-5 grid gap-3">
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Payment queue
                  </p>
                  <strong className="mt-2 block text-lg font-black text-white">
                    {pendingPaymentsCount} requests waiting
                  </strong>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Review pending upgrades and unblock the rollout path.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Support signal
                  </p>
                  <strong className="mt-2 block text-lg font-black text-white">
                    {openTicketsCount} open tickets
                  </strong>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Keep identity and operational follow-up in one clean admin view.
                  </p>
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}

export default PortalAccountCenter;
