import { broadcastPaymentUpdate } from "./realtimeService.js";
import { recordAccountPayment, updateAccountPlan } from "./accountService.js";
import { getPlanBySlug } from "./catalogService.js";
import { createNotification } from "./runtimeService.js";
import { getRuntimeState, updateRuntimeState } from "./runtimeStore.js";
import {
  createHttpError,
  createId,
  sanitizeText,
  sortByCreatedAtDesc,
} from "./serviceHelpers.js";
import {
  getSmartCardByCode,
  provisionSmartCardForPayment,
} from "./smartCardService.js";

function detectCardBrand(cardNumber) {
  if (/^4\d{12}(\d{3})?$/.test(cardNumber)) {
    return "visa";
  }

  if (/^(5[1-5]\d{14}|2(2[2-9]|[3-6]\d|7[01])\d{12})$/.test(cardNumber)) {
    return "mastercard";
  }

  if (/^3[47]\d{13}$/.test(cardNumber)) {
    return "amex";
  }

  return null;
}

function buildPaymentRecord(payment) {
  const linkedCard = payment.linkedCardCode
    ? getSmartCardByCode(payment.linkedCardCode)
    : null;

  return {
    ...payment,
    linkedCardCode: linkedCard?.code ?? payment.linkedCardCode ?? null,
    linkedCardStatus: linkedCard?.status ?? null,
    linkedCardSector: linkedCard?.sector ?? null,
    linkedCardSectorLabel: linkedCard?.sectorLabel ?? null,
    linkedDeviceKey: linkedCard?.deviceKey ?? null,
    linkedCardUpdatedAt: linkedCard?.updatedAt ?? null,
  };
}

export function getPayments(options = {}) {
  const company =
    typeof options === "string"
      ? sanitizeText(options)
      : sanitizeText(options.company);

  const filteredPayments = company
    ? getRuntimeState().payments.filter(
        (payment) => payment.company.toLowerCase() === company.toLowerCase(),
      )
    : getRuntimeState().payments;

  return sortByCreatedAtDesc(filteredPayments).map(buildPaymentRecord);
}

export function createPayment(payload) {
  const company = sanitizeText(payload.company);
  const plan = sanitizeText(payload.plan).toLowerCase();
  const cardholder = sanitizeText(payload.cardholder);
  const cardNumber = sanitizeText(payload.cardNumber).replace(/\s+/g, "");
  const expiry = sanitizeText(payload.expiry);
  const amount = Number(payload.amount);

  if (!company || !plan || !cardholder || !cardNumber || !expiry || !amount) {
    throw createHttpError(
      "Company, plan, cardholder, card number, expiry, and amount are required.",
    );
  }

  const planRecord = getPlanBySlug(plan);

  if (!planRecord) {
    throw createHttpError("Choose a valid subscription plan.");
  }

  const cardBrand = detectCardBrand(cardNumber);

  if (!cardBrand) {
    throw createHttpError(
      "Only Visa, Mastercard, and American Express are supported in this payment flow.",
    );
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    throw createHttpError("Expiry must use MM/YY format.");
  }

  const payment = {
    id: createId(),
    company,
    plan,
    planName: planRecord.name,
    amount,
    currency: "EUR",
    cardBrand,
    last4: cardNumber.slice(-4),
    status: "paid",
    createdAt: new Date().toISOString(),
    linkedCardCode: null,
  };

  const account = updateAccountPlan(company, plan);
  recordAccountPayment(company, amount);
  const linkedCard = provisionSmartCardForPayment({
    company,
    plan,
    sector: account.sector,
  });
  payment.linkedCardCode = linkedCard?.code ?? null;

  updateRuntimeState((state) => {
    state.payments.unshift(payment);
    state.payments = state.payments.slice(0, 40);
  });

  createNotification(
    "Payment received",
    `${company} paid EUR ${amount} with ${cardBrand.toUpperCase()}${linkedCard ? ` and received ${linkedCard.code}.` : "."}`,
    "success",
  );
  broadcastPaymentUpdate(buildPaymentRecord(payment));

  return buildPaymentRecord(payment);
}
