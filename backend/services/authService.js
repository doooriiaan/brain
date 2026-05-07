import { ensureAccount, getAccounts } from "./accountService.js";
import { createNotification } from "./runtimeService.js";
import { getRuntimeState, updateRuntimeState } from "./runtimeStore.js";
import {
  createHttpError,
  createId,
  sanitizeText,
} from "./serviceHelpers.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildPublicUser(user) {
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    company: user.company,
    sector: user.sector,
    plan: user.plan,
  };
}

function getUsers() {
  return getRuntimeState().users;
}

function getSessions() {
  return getRuntimeState().sessions;
}

function createSession(user) {
  return updateRuntimeState((state) => {
    const session = {
      token: `brain-${createId()}`,
      user: buildPublicUser(user),
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    state.sessions.unshift(session);
    state.sessions = state.sessions.slice(0, 100);

    return session;
  });
}

function getAdminCredential() {
  return (
    getUsers().find((user) => user.role === "admin") ?? null
  );
}

export function getDemoCredentials() {
  return getUsers().map((user) => ({
    role: user.role,
    name: user.name,
    email: user.email,
    password: user.password,
    company: user.company,
  }));
}

export function getSessionByToken(token) {
  const normalizedToken = sanitizeText(token);

  if (!normalizedToken) {
    return null;
  }

  const session = getSessions().find((item) => item.token === normalizedToken) ?? null;

  if (!session) {
    return null;
  }

  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    updateRuntimeState((state) => {
      state.sessions = state.sessions.filter((item) => item.token !== normalizedToken);
    });
    return null;
  }

  return session;
}

export function loginUser(payload) {
  const email = sanitizeText(payload.email).toLowerCase();
  const password = sanitizeText(payload.password);
  const role = sanitizeText(payload.role).toLowerCase();

  if (!email || !password || !role) {
    throw createHttpError("Role, email, and password are required.");
  }

  if (role === "admin") {
    const adminCredential = getAdminCredential();

    if (!adminCredential || adminCredential.email.toLowerCase() !== email) {
      throw createHttpError("Admin credentials not found.", 401);
    }

    if (adminCredential.password !== password) {
      throw createHttpError("Invalid admin password.", 401);
    }

    createNotification(
      "Admin login",
      `${adminCredential.name} logged into the admin portal.`,
      "warning",
    );

    return createSession(adminCredential);
  }

  if (role !== "client") {
    throw createHttpError("Invalid role. Only 'client' or 'admin' are allowed.");
  }

  const user = getUsers().find(
    (item) =>
      item.email.toLowerCase() === email &&
      item.password === password &&
      item.role === role,
  );

  if (!user) {
    throw createHttpError("Invalid client credentials.", 401);
  }

  createNotification(
    "Client login",
    `${user.name} (${user.company}) opened the client portal.`,
    "info",
  );

  return createSession(user);
}

export function registerUser(payload) {
  const role = sanitizeText(payload.role).toLowerCase();
  const name = sanitizeText(payload.name);
  const email = sanitizeText(payload.email).toLowerCase();
  const password = sanitizeText(payload.password);
  const companyInput = sanitizeText(payload.company);
  const sector = sanitizeText(payload.sector).toLowerCase() || "business";
  const plan = sanitizeText(payload.plan).toLowerCase() || "free";

  if (role === "admin") {
    throw createHttpError(
      "Admin registration is not allowed. Contact system administrator.",
      403,
    );
  }

  if (!role || !name || !email || !password) {
    throw createHttpError("Role, name, email, and password are required.");
  }

  if (role !== "client") {
    throw createHttpError("Only client registration is allowed from this portal.", 400);
  }

  if (getUsers().some((user) => user.email.toLowerCase() === email)) {
    throw createHttpError("An account with that email already exists.", 409);
  }

  if (!companyInput) {
    throw createHttpError("Client registration requires a company name.", 400);
  }

  if (password.length < 8) {
    throw createHttpError("Password must be at least 8 characters long.", 400);
  }

  if (!emailPattern.test(email)) {
    throw createHttpError("Please enter a valid email address.", 400);
  }

  const account = ensureAccount({
    company: companyInput,
    sector,
    plan,
  });

  const user = updateRuntimeState((state) => {
    const nextUser = {
      id: createId(),
      role,
      name,
      email,
      password,
      company: account.company,
      sector: account.sector ?? sector,
      plan: account.plan ?? plan,
      createdAt: new Date().toISOString(),
    };

    state.users.unshift(nextUser);
    return nextUser;
  });

  createNotification(
    "New portal account",
    `${name} registered as client for ${account.company}.`,
    "success",
  );

  return createSession(user);
}

export function getAuthSnapshot() {
  return {
    users: getUsers().map(buildPublicUser),
    accounts: getAccounts(),
    sessions: getSessions(),
  };
}
