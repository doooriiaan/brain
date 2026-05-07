import { getPlanBySlug, getSectorBySlug } from "./catalogService.js";
import { getRuntimeState, updateRuntimeState } from "./runtimeStore.js";
import { createId } from "./serviceHelpers.js";

const planCredits = {
  free: 25000,
  starter: 500000,
  professional: 500000,
  business: 500000,
  platinum: 500000,
  "platinum-plus": 500000,
};

function findAccount(state, company) {
  return (
    state.accounts.find(
      (account) => account.company.toLowerCase() === company.toLowerCase(),
    ) ?? null
  );
}

function ensureAccountRecord(state, { company, sector = "business", plan = "business" }) {
  const existingAccount = findAccount(state, company);

  if (existingAccount) {
    return existingAccount;
  }

  const sectorRecord = getSectorBySlug(sector);
  const planRecord = getPlanBySlug(plan);
  const nextAccount = {
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

  state.accounts.unshift(nextAccount);
  return nextAccount;
}

export function getAccounts() {
  return getRuntimeState().accounts;
}

export function ensureAccount({ company, sector = "business", plan = "business" }) {
  const state = getRuntimeState();
  const existingAccount = findAccount(state, company);

  if (existingAccount) {
    return existingAccount;
  }

  return updateRuntimeState((draft) =>
    ensureAccountRecord(draft, { company, sector, plan }),
  );
}

export function updateAccountPlan(company, plan) {
  return updateRuntimeState((state) => {
    const account = ensureAccountRecord(state, { company, plan });
    const planRecord = getPlanBySlug(plan);
    const creditsToAdd = planCredits[plan] ?? 500000;

    account.plan = plan;
    account.planName = planRecord?.name ?? plan;
    account.creditsRemaining += creditsToAdd;

    return account;
  });
}

export function incrementAccountCards(company, quantity) {
  return updateRuntimeState((state) => {
    const account = ensureAccountRecord(state, { company });
    account.smartCards += quantity;
    return account;
  });
}

export function incrementAccountDevices(company, quantity = 1) {
  return updateRuntimeState((state) => {
    const account = ensureAccountRecord(state, { company });
    account.devices += quantity;
    return account;
  });
}

export function recordAccountPayment(company, amount) {
  return updateRuntimeState((state) => {
    const account = ensureAccountRecord(state, { company });
    account.salesToday += amount;
    account.creditsRemaining += Math.round(amount * 1200);
    account.tasksAutomated += 2;
    return account;
  });
}
