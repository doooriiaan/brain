import { ensureAccount, getAccounts } from "./accountService.js";
import { createNotification } from "./runtimeService.js";
import {
  createHttpError,
  createId,
  sanitizeText,
} from "./serviceHelpers.js";

const runtimeUsers = [
  {
    id: "user-admin-1",
    role: "admin",
    name: "System Admin",
    email: "admin@brain-ai.com",
    password: "Admin123!",
    company: "brAIn HQ",
    sector: null,
    plan: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
  },
  {
    id: "user-client-1",
    role: "client",
    name: "Nova Market Ops",
    email: "nova@brain-ai.com",
    password: "Client123!",
    company: "Nova Market",
    sector: "commercial",
    plan: "business",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 56).toISOString(),
  },
  {
    id: "user-client-2",
    role: "client",
    name: "Helios Clinic Team",
    email: "helios@brain-ai.com",
    password: "Client123!",
    company: "Helios Clinic",
    sector: "healthcare",
    plan: "professional",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 48).toISOString(),
  },
  {
    id: "user-client-3",
    role: "client",
    name: "Astra Group Lead",
    email: "astra@brain-ai.com",
    password: "Client123!",
    company: "Astra Group",
    sector: "business",
    plan: "platinum",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 37).toISOString(),
  },
  {
    id: "user-client-4",
    role: "client",
    name: "Factory One Control",
    email: "factory@brain-ai.com",
    password: "Client123!",
    company: "Factory One",
    sector: "industry",
    plan: "business",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
  },
];

const runtimeSessions = [];

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

function createSession(user) {
  const session = {
    token: `brain-${createId()}`,
    user: buildPublicUser(user),
    issuedAt: new Date().toISOString(),
  };

  runtimeSessions.unshift(session);
  runtimeSessions.splice(40);

  return session;
}

export function getDemoCredentials() {
  return runtimeUsers.map((user) => ({
    role: user.role,
    name: user.name,
    email: user.email,
    password: user.password,
    company: user.company,
  }));
}

export function loginUser(payload) {
  const email = sanitizeText(payload.email).toLowerCase();
  const password = sanitizeText(payload.password);
  const role = sanitizeText(payload.role).toLowerCase();

  if (!email || !password || !role) {
    throw createHttpError("Role, email, and password are required.");
  }

  const user = runtimeUsers.find(
    (item) =>
      item.email.toLowerCase() === email &&
      item.password === password &&
      item.role === role,
  );

  if (!user) {
    throw createHttpError("Invalid login credentials.", 401);
  }

  createNotification(
    "User login",
    `${user.name} opened the ${user.role} portal.`,
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
  const plan = sanitizeText(payload.plan).toLowerCase() || "starter";

  if (!role || !name || !email || !password) {
    throw createHttpError("Role, name, email, and password are required.");
  }

  if (role !== "client") {
    throw createHttpError("Only client registration is allowed from this portal.");
  }

  if (runtimeUsers.some((user) => user.email.toLowerCase() === email)) {
    throw createHttpError("An account with that email already exists.");
  }

  if (!companyInput) {
    throw createHttpError("Client registration requires a company name.");
  }

  const account = ensureAccount({
    company: companyInput,
    sector,
    plan,
  });
  const company = account.company;

  const user = {
    id: createId(),
    role,
    name,
    email,
    password,
    company,
    sector: account.sector ?? sector,
    plan: account.plan ?? plan,
    createdAt: new Date().toISOString(),
  };

  runtimeUsers.unshift(user);
  createNotification(
    "New portal account",
    `${name} registered as client for ${company}.`,
    "success",
  );

  return createSession(user);
}

export function getAuthSnapshot() {
  return {
    users: runtimeUsers.map(buildPublicUser),
    accounts: getAccounts(),
    sessions: runtimeSessions,
  };
}
