import type { Plan } from "../types";

const YEARLY_BASE_TOKENS_PER_DEVICE = 240_000;
const YEARLY_SUPPORT_TOKEN_STEP = 12_000;

function parsePlainNumber(value: string) {
  const match = value.match(/[\d,.]+/);

  if (!match) {
    return 0;
  }

  return Number(match[0].replace(/[^\d]/g, "")) || 0;
}

export function parsePlanDeviceLimit(plan: Plan) {
  const normalized = plan.deviceAllowance.toLowerCase();

  if (normalized.includes("unlimited")) {
    return Number.POSITIVE_INFINITY;
  }

  const count = parsePlainNumber(normalized);
  return count > 0 ? count : 1;
}

export function parsePlanTokenLimit(plan: Plan) {
  const tokenFeature = plan.features.find((feature) => /token/i.test(feature));

  if (!tokenFeature) {
    return 0;
  }

  if (tokenFeature.toLowerCase().includes("unlimited")) {
    return Number.POSITIVE_INFINITY;
  }

  return parsePlainNumber(tokenFeature);
}

export function formatTokenCount(value: number) {
  if (!Number.isFinite(value)) {
    return "Unlimited";
  }

  return `${Math.max(0, Math.round(value)).toLocaleString("en-GB")} tokens`;
}

export function formatPlanLimit(value: number, unit: "devices" | "tokens") {
  if (!Number.isFinite(value)) {
    return unit === "devices" ? "Unlimited devices" : "Unlimited usage";
  }

  if (unit === "tokens") {
    return `${formatTokenCount(value)}/yr`;
  }

  return `${value} device${value === 1 ? "" : "s"}`;
}

export function estimateYearlyTokenDemand(deviceCount: number, supportIntensity: number) {
  const normalizedDevices = Math.max(1, Math.round(deviceCount));
  const normalizedSupport = Math.min(100, Math.max(0, supportIntensity));

  return Math.round(
    normalizedDevices *
      (YEARLY_BASE_TOKENS_PER_DEVICE + normalizedSupport * YEARLY_SUPPORT_TOKEN_STEP),
  );
}

export function getDeviceCountSliderMax(plans: Plan[]) {
  const finiteLimits = plans
    .map((plan) => parsePlanDeviceLimit(plan))
    .filter((limit) => Number.isFinite(limit)) as number[];

  const maxFiniteLimit = finiteLimits.length > 0 ? Math.max(...finiteLimits) : 12;
  const hasUnlimitedPlan = plans.some(
    (plan) => !Number.isFinite(parsePlanDeviceLimit(plan)),
  );

  return hasUnlimitedPlan ? Math.max(24, maxFiniteLimit * 2) : maxFiniteLimit;
}

export function resolveRecommendedPlan(
  plans: Plan[],
  deviceCount: number,
  supportIntensity: number,
) {
  const estimatedYearlyTokens = estimateYearlyTokenDemand(deviceCount, supportIntensity);

  if (plans.length === 0) {
    return {
      estimatedYearlyTokens,
      plan: null,
    };
  }

  const freePlan = plans.find((plan) => plan.slug === "free") ?? null;

  if (freePlan && deviceCount <= 1 && supportIntensity <= 12) {
    return {
      estimatedYearlyTokens,
      plan: freePlan,
    };
  }

  const sortedPlans = [...plans]
    .filter((plan) => plan.slug !== "free")
    .sort(
      (left, right) =>
        left.annualPrice - right.annualPrice || left.monthlyPrice - right.monthlyPrice,
    );

  const matchingPlan =
    sortedPlans.find((plan) => {
      const deviceLimit = parsePlanDeviceLimit(plan);
      const tokenLimit = parsePlanTokenLimit(plan);

      return deviceLimit >= deviceCount && tokenLimit >= estimatedYearlyTokens;
    }) ??
    sortedPlans[sortedPlans.length - 1] ??
    freePlan ??
    plans[0];

  return {
    estimatedYearlyTokens,
    plan: matchingPlan,
  };
}
