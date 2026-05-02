import { getPlanBySlug, getSectorBySlug } from "./catalogService.js";
import { createId } from "./serviceHelpers.js";

const runtimeAccounts = [
  {
    id: "account-1",
    company: "Nova Market",
    sector: "commercial",
    sectorLabel: "Komercial",
    plan: "business",
    planName: "Business",
    status: "active",
    devices: 14,
    smartCards: 126,
    monthlyUsage: 2420000,
    creditsRemaining: 1860000,
    salesToday: 12450,
    callsHandled: 28,
    tasksAutomated: 56,
    newLeads: 14,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42).toISOString(),
  },
  {
    id: "account-2",
    company: "Helios Clinic",
    sector: "healthcare",
    sectorLabel: "Healthcare",
    plan: "professional",
    planName: "Professional",
    status: "active",
    devices: 9,
    smartCards: 84,
    monthlyUsage: 1180000,
    creditsRemaining: 920000,
    salesToday: 8250,
    callsHandled: 18,
    tasksAutomated: 34,
    newLeads: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 63).toISOString(),
  },
  {
    id: "account-3",
    company: "Astra Group",
    sector: "business",
    sectorLabel: "Business",
    plan: "platinum",
    planName: "Platinum",
    status: "active",
    devices: 22,
    smartCards: 140,
    monthlyUsage: 4820000,
    creditsRemaining: 4080000,
    salesToday: 19400,
    callsHandled: 41,
    tasksAutomated: 74,
    newLeads: 20,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 88).toISOString(),
  },
  {
    id: "account-4",
    company: "Factory One",
    sector: "industry",
    sectorLabel: "Industry 4.0 AI",
    plan: "business",
    planName: "Business",
    status: "active",
    devices: 11,
    smartCards: 92,
    monthlyUsage: 3560000,
    creditsRemaining: 2750000,
    salesToday: 16340,
    callsHandled: 24,
    tasksAutomated: 61,
    newLeads: 9,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 51).toISOString(),
  },
];

function findAccountIndex(company) {
  return runtimeAccounts.findIndex(
    (account) => account.company.toLowerCase() === company.toLowerCase(),
  );
}

export function getAccounts() {
  return runtimeAccounts;
}

export function ensureAccount({
  company,
  sector = "business",
  plan = "business",
}) {
  const existingIndex = findAccountIndex(company);

  if (existingIndex >= 0) {
    return runtimeAccounts[existingIndex];
  }

  const sectorRecord = getSectorBySlug(sector);
  const planRecord = getPlanBySlug(plan);

  const account = {
    id: createId(),
    company,
    sector,
    sectorLabel: sectorRecord?.name ?? sector,
    plan,
    planName: planRecord?.name ?? plan,
    status: "active",
    devices: 0,
    smartCards: 0,
    monthlyUsage: 0,
    creditsRemaining: 0,
    salesToday: 0,
    callsHandled: 0,
    tasksAutomated: 0,
    newLeads: 0,
    createdAt: new Date().toISOString(),
  };

  runtimeAccounts.unshift(account);
  return account;
}

export function updateAccountPlan(company, plan) {
  const account = ensureAccount({ company, plan });
  const planRecord = getPlanBySlug(plan);

  account.plan = plan;
  account.planName = planRecord?.name ?? plan;
  account.creditsRemaining += 500000;

  return account;
}

export function incrementAccountCards(company, quantity) {
  const account = ensureAccount({ company });
  account.smartCards += quantity;
  return account;
}

export function incrementAccountDevices(company, quantity = 1) {
  const account = ensureAccount({ company });
  account.devices += quantity;
  return account;
}

export function recordAccountPayment(company, amount) {
  const account = ensureAccount({ company });
  account.salesToday += amount;
  account.creditsRemaining += Math.round(amount * 1200);
  account.tasksAutomated += 2;
  return account;
}
