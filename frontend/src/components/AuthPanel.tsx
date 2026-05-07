import { CheckCircle2, Lock, LogOut, Sparkles, UserRound } from "lucide-react";
import { planOptions, sectorOptions } from "../data/runtimeOptions";
import { PeekBuddy } from "./PeekBuddy";

type AuthRole = "admin" | "client";
type AuthMode = "login" | "register";

type UiMessage = {
  tone: "success" | "error" | "info";
  text: string;
} | null;

type LoginFormState = {
  role: AuthRole;
  email: string;
  password: string;
};

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  company: string;
  sector: string;
  plan: string;
};

type AuthSession = {
  token: string;
  issuedAt: string;
  user: {
    id: string;
    role: AuthRole;
    name: string;
    email: string;
    company: string;
    sector: string | null;
    plan: string | null;
  };
};

type AuthPanelProps = {
  authMessage: UiMessage;
  authMode: AuthMode;
  authSession: AuthSession | null;
  authStatusText: string;
  authSubmitting: boolean;
  loginForm: LoginFormState;
  onAuthModeChange: (mode: AuthMode) => void;
  onLoginChange: (
    nextState:
      | LoginFormState
      | ((currentState: LoginFormState) => LoginFormState),
  ) => void;
  onLoginSubmit: () => void;
  onRegisterChange: (
    nextState:
      | RegisterFormState
      | ((currentState: RegisterFormState) => RegisterFormState),
  ) => void;
  onRegisterSubmit: () => void;
  onRoleChange: (role: AuthRole) => void;
  onSignOut: () => void;
  registerForm: RegisterFormState;
  selectedCountry: string;
  selectedLanguage: string;
  vpnActive: boolean;
};

function getMessageToneClass(tone?: "success" | "error" | "info") {
  if (tone === "success") {
    return "message-success";
  }

  if (tone === "error") {
    return "message-error";
  }

  return "message-info";
}

export function AuthPanel({
  authMessage,
  authMode,
  authSession,
  authStatusText,
  authSubmitting,
  loginForm,
  onAuthModeChange,
  onLoginChange,
  onLoginSubmit,
  onRegisterChange,
  onRegisterSubmit,
  onRoleChange,
  onSignOut,
  registerForm,
  selectedCountry,
  selectedLanguage,
  vpnActive,
}: AuthPanelProps) {
  const sectorHighlights = [
    { key: "commercial", label: "1. Commercial AI" },
    { key: "business", label: "2. Business AI" },
    { key: "healthcare", label: "3. Healthcare AI" },
    { key: "industry", label: "4. Industry 4.0 AI" },
  ];

  const workflowTips =
    authMode === "login"
        ? [
            "Client login opens payments, activations, and support in one page.",
            "Admin login keeps notifications, SC cards, and rollout controls centralized.",
          ]
      : [
          "Registration prepares the workspace with the right sector and plan from the start.",
          "Commercial AI, Business AI, Healthcare AI, and Industry 4.0 AI stay aligned to the same admin-managed access flow.",
        ];

  return (
    <section className="auth-shell">
      <div className="auth-header">
        <span className="eyebrow eyebrow-tight">Workspace access</span>
        <h2 className="auth-title">Login / Register</h2>
        <p className="auth-copy">
          Clean entry point for the device AI system. Admin access stays
          protected, while client onboarding stays fast and structured.
        </p>
      </div>

      <div className="auth-orbit-row">
        <div className="auth-guide-card">
          <span className="auth-guide-pill">
            <Sparkles size={13} />
            brAIn access guide
          </span>
          <p className="auth-guide-copy">
            {authMode === "login"
              ? "Use the same access layer for secure sign-in, linked payments, and SC card validation."
              : "Create the client workspace once, then let the sector, plan, and card flow continue inside the same system."}
          </p>

          <div className="auth-sector-pills">
            {sectorHighlights.map((sector) => (
              <span
                className={`auth-sector-pill auth-sector-pill-${sector.key}`}
                key={sector.key}
              >
                {sector.label}
              </span>
            ))}
          </div>
        </div>

        <div className="auth-pet-pop" aria-hidden="true">
          <div className="auth-pet-avatar">
            <PeekBuddy />
          </div>
          <div className="auth-pet-copy">
            <strong>brAIn sugar glider</strong>
            <p>Access is ready. Pick a sector and let Peti glide you into the workspace.</p>
          </div>
        </div>
      </div>

      <div className="auth-advice-grid">
        {workflowTips.map((tip) => (
          <div className="auth-advice-card" key={tip}>
            <p>{tip}</p>
          </div>
        ))}
      </div>

      <div className="auth-status-grid">
        <div className="auth-status-card">
          <span>Market</span>
          <strong>{selectedCountry}</strong>
        </div>
        <div className="auth-status-card">
          <span>Language</span>
          <strong>{selectedLanguage}</strong>
        </div>
        <div className="auth-status-card">
          <span>VPN</span>
          <strong>{vpnActive ? "Private" : "Standby"}</strong>
        </div>
      </div>

      <div className="auth-toggle">
        <button
          className={authMode === "login" ? "auth-toggle-active" : ""}
          onClick={() => onAuthModeChange("login")}
          type="button"
        >
          Login
        </button>
        <button
          className={authMode === "register" ? "auth-toggle-active" : ""}
          onClick={() => onAuthModeChange("register")}
          type="button"
        >
          Register
        </button>
      </div>

      {authSession ? (
        <div className="session-shell">
          <div className="session-topline">
            <CheckCircle2 size={20} />
            <span>Access granted</span>
          </div>
          <h3 className="session-title">{authSession.user.company}</h3>
          <p className="session-copy">{authStatusText}</p>

          <div className="session-grid">
            <div className="session-item">
              <span>Name</span>
              <strong>{authSession.user.name}</strong>
            </div>
            <div className="session-item">
              <span>Role</span>
              <strong>{authSession.user.role}</strong>
            </div>
            <div className="session-item">
              <span>Email</span>
              <strong>{authSession.user.email}</strong>
            </div>
            <div className="session-item">
              <span>Token</span>
              <strong>{authSession.token.slice(0, 16)}...</strong>
            </div>
          </div>

          <button className="secondary-action" onClick={onSignOut} type="button">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      ) : authMode === "login" ? (
        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault();
            void onLoginSubmit();
          }}
        >
          <div className="role-switch">
            <button
              className={loginForm.role === "client" ? "role-switch-active" : ""}
              onClick={() => onRoleChange("client")}
              type="button"
            >
              <UserRound size={15} />
              Client
            </button>
            <button
              className={loginForm.role === "admin" ? "role-switch-active" : ""}
              onClick={() => onRoleChange("admin")}
              type="button"
            >
              <Lock size={15} />
              Admin
            </button>
          </div>

          <label className="field-shell">
            <span>Email</span>
            <input
              className="field-input"
              onChange={(event) =>
                onLoginChange((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="name@company.com"
              type="email"
              value={loginForm.email}
            />
          </label>

          <label className="field-shell">
            <span>Password</span>
            <input
              className="field-input"
              onChange={(event) =>
                onLoginChange((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="Enter your password"
              type="password"
              value={loginForm.password}
            />
          </label>

          <button className="primary-action" disabled={authSubmitting} type="submit">
            {authSubmitting ? "Signing in..." : "Open workspace"}
          </button>
        </form>
      ) : (
        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault();
            void onRegisterSubmit();
          }}
        >
          <label className="field-shell">
            <span>Full name</span>
            <input
              className="field-input"
              onChange={(event) =>
                onRegisterChange((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Your full name"
              type="text"
              value={registerForm.name}
            />
          </label>

          <div className="field-grid">
            <label className="field-shell">
              <span>Email</span>
              <input
                className="field-input"
                onChange={(event) =>
                  onRegisterChange((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="name@company.com"
                type="email"
                value={registerForm.email}
              />
            </label>

            <label className="field-shell">
              <span>Password</span>
              <input
                className="field-input"
                onChange={(event) =>
                  onRegisterChange((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="At least 8 characters"
                type="password"
                value={registerForm.password}
              />
            </label>
          </div>

          <label className="field-shell">
            <span>Company</span>
            <input
              className="field-input"
              onChange={(event) =>
                onRegisterChange((current) => ({
                  ...current,
                  company: event.target.value,
                }))
              }
              placeholder="Business or organization name"
              type="text"
              value={registerForm.company}
            />
          </label>

          <div className="field-grid">
            <label className="field-shell">
              <span>Sector</span>
              <select
                className="field-input"
                onChange={(event) =>
                  onRegisterChange((current) => ({
                    ...current,
                    sector: event.target.value,
                  }))
                }
                value={registerForm.sector}
              >
                {sectorOptions.map((sector) => (
                  <option key={sector.value} value={sector.value}>
                    {sector.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-shell">
              <span>Plan</span>
              <select
                className="field-input"
                onChange={(event) =>
                  onRegisterChange((current) => ({
                    ...current,
                    plan: event.target.value,
                  }))
                }
                value={registerForm.plan}
              >
                {planOptions.map((plan) => (
                  <option key={plan.value} value={plan.value}>
                    {plan.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button className="primary-action" disabled={authSubmitting} type="submit">
            {authSubmitting ? "Creating..." : "Create client workspace"}
          </button>
        </form>
      )}

      <p className={`message-shell ${getMessageToneClass(authMessage?.tone)}`}>
        {authMessage?.text ||
          "Client accounts can be created here. Admin access stays controlled."}
      </p>
    </section>
  );
}
