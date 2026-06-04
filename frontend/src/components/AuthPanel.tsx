import { CheckCircle2, Lock, LogOut, UserRound } from "lucide-react";
import { planOptions, sectorOptions } from "../data/runtimeOptions";

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
  showHeader?: boolean;
  vpnActive: boolean;
};

const demoLoginOptions: Array<{
  email: string;
  label: string;
  password: string;
  role: AuthRole;
}> = [
  {
    email: "factory@brain-ai.com",
    label: "Demo client",
    password: "Client123!",
    role: "client",
  },
  {
    email: "admin@brain-ai.com",
    label: "Demo admin",
    password: "Admin123!",
    role: "admin",
  },
];

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
  showHeader = true,
  vpnActive,
}: AuthPanelProps) {
  return (
    <section className="auth-shell auth-shell-compact">
      {showHeader ? (
        <div className="auth-header auth-header-compact">
          <span className="eyebrow eyebrow-tight">Device access</span>
          <h2 className="auth-title">Log in or start a device order</h2>
          <p className="auth-copy">
            Keep the buying flow clean: use login for an existing account, or create
            a client workspace to configure sector, device, and rollout plan.
          </p>
        </div>
      ) : null}

      <div className="auth-status-grid auth-status-grid-compact">
        <div className="auth-status-card">
          <span>Market</span>
          <strong>{selectedCountry}</strong>
        </div>
        <div className="auth-status-card">
          <span>Language</span>
          <strong>{selectedLanguage}</strong>
        </div>
        <div className="auth-status-card">
          <span>Route</span>
          <strong>{vpnActive ? "Protected" : "Standard"}</strong>
        </div>
      </div>

      <div className="auth-toggle">
        <button
          className={authMode === "login" ? "auth-toggle-active" : ""}
          onClick={() => onAuthModeChange("login")}
          type="button"
        >
          Log in
        </button>
        <button
          className={authMode === "register" ? "auth-toggle-active" : ""}
          onClick={() => onAuthModeChange("register")}
          type="button"
        >
          Start order
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

          <div className="auth-demo-row" aria-label="Demo login shortcuts">
            {demoLoginOptions.map((option) => (
              <button
                className="auth-demo-button"
                key={option.email}
                onClick={() =>
                  onLoginChange({
                    email: option.email,
                    password: option.password,
                    role: option.role,
                  })
                }
                type="button"
              >
                {option.label}
              </button>
            ))}
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
            {authSubmitting ? "Signing in..." : "Log in"}
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
            {authSubmitting ? "Creating..." : "Create order workspace"}
          </button>
        </form>
      )}

      <p className={`message-shell ${getMessageToneClass(authMessage?.tone)}`}>
        {authMessage?.text ||
          "Existing accounts can log in here, while new buyers can create a workspace to continue the device order."}
      </p>
    </section>
  );
}
