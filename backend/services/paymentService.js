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

const supportedPaymentMethods = new Set([
  "visa",
  "mastercard",
  "amex",
  "paypal",
]);

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

function normalizePaymentMethod(value) {
  const normalizedValue = sanitizeText(value).toLowerCase();
  return supportedPaymentMethods.has(normalizedValue) ? normalizedValue : null;
}

function getPaymentMethodLabel(method) {
  if (method === "mastercard") {
    return "Mastercard";
  }

  if (method === "amex") {
    return "American Express";
  }

  if (method === "paypal") {
    return "PayPal";
  }

  return "Visa";
}

function buildPaymentRecord(payment) {
  const linkedCard = payment?.linkedCardCode
    ? getSmartCardByCode(payment.linkedCardCode)
    : null;
  const paymentMethod = normalizePaymentMethod(
    payment?.paymentMethod ?? payment?.cardBrand,
  ) ?? "visa";

  return {
    ...payment,
    paymentMethod,
    cardBrand: paymentMethod,
    linkedCardCode: linkedCard?.code ?? payment?.linkedCardCode ?? null,
    linkedCardStatus: linkedCard?.status ?? null,
    linkedCardSector: linkedCard?.sector ?? null,
    linkedCardSectorLabel: linkedCard?.sectorLabel ?? null,
    linkedDeviceKey: linkedCard?.deviceKey ?? null,
    linkedCardUpdatedAt: linkedCard?.updatedAt ?? null,
  };
}

function getPaymentOrThrow(state, id) {
  const payment = state.payments.find((item) => item.id === id);

  if (!payment) {
    throw createHttpError("Payment request was not found.", 404);
  }

  return payment;
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
  const selectedPaymentMethod = normalizePaymentMethod(payload.paymentMethod);

  if (!company || !plan || !amount) {
    throw createHttpError(
      "Company, plan, payment method, and amount are required.",
    );
  }

  const planRecord = getPlanBySlug(plan);

  if (!planRecord) {
    throw createHttpError("Choose a valid subscription plan.");
  }

  if (plan === "free") {
    throw createHttpError(
      "Free plan uses direct validation. No payment request is needed for that plan.",
    );
  }

  const detectedCardBrand = cardNumber ? detectCardBrand(cardNumber) : null;
  const paymentMethod =
    selectedPaymentMethod ??
    (detectedCardBrand && supportedPaymentMethods.has(detectedCardBrand)
      ? detectedCardBrand
      : null);

  if (!paymentMethod) {
    throw createHttpError(
      "Choose Visa, Mastercard, American Express, or PayPal for this request.",
    );
  }

  if (paymentMethod !== "paypal") {
    if (!cardholder || !cardNumber || !expiry) {
      throw createHttpError(
        "Cardholder, card number, and expiry are required for card payments.",
      );
    }

    if (!detectedCardBrand || detectedCardBrand !== paymentMethod) {
      throw createHttpError(
        "The card number does not match the selected payment method.",
      );
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      throw createHttpError("Expiry must use MM/YY format.");
    }
  }

  const payment = {
    id: createId(),
    company,
    plan,
    planName: planRecord.name,
    amount,
    currency: "EUR",
    paymentMethod,
    cardBrand: paymentMethod,
    last4: paymentMethod === "paypal" ? "PPAL" : cardNumber.slice(-4),
    status: "pending",
    approvalRequestedAt: new Date().toISOString(),
    approvedAt: null,
    rejectedAt: null,
    approvalNote: null,
    createdAt: new Date().toISOString(),
    linkedCardCode: null,
  };

  updateRuntimeState((state) => {
    state.payments.unshift(payment);
    state.payments = state.payments.slice(0, 60);
  });

  createNotification(
    "Payment approval requested",
    `${company} requested ${planRecord.name} via ${getPaymentMethodLabel(paymentMethod)} and is waiting for admin approval.`,
    "warning",
  );
  broadcastPaymentUpdate(buildPaymentRecord(payment));

  return buildPaymentRecord(payment);
}

export function approvePayment(id, payload = {}) {
  const paymentId = sanitizeText(id);
  const note = sanitizeText(payload.note);

  if (!paymentId) {
    throw createHttpError("Payment id is required.");
  }

  updateRuntimeState((state) => {
    const payment = getPaymentOrThrow(state, paymentId);

    if (payment.status === "approved") {
      throw createHttpError("Payment is already approved.", 409);
    }

    if (payment.status === "rejected") {
      throw createHttpError("Rejected payments cannot be approved.", 409);
    }

    payment.status = "approved";
    payment.approvedAt = new Date().toISOString();
    payment.rejectedAt = null;
    payment.approvalNote = note || "Approved by admin.";
  });

  const payment = getRuntimeState().payments.find((item) => item.id === paymentId);

  if (!payment) {
    throw createHttpError("Payment request was not found after approval.", 404);
  }

  const account = updateAccountPlan(payment.company, payment.plan);
  recordAccountPayment(payment.company, payment.amount);
  const linkedCard = provisionSmartCardForPayment({
    company: payment.company,
    plan: payment.plan,
    sector: account.sector,
  });

  if (linkedCard) {
    updateRuntimeState((state) => {
      const currentPayment = getPaymentOrThrow(state, paymentId);
      currentPayment.linkedCardCode = linkedCard.code;
    });
  }

  const paymentRecord = buildPaymentRecord(
    getRuntimeState().payments.find((item) => item.id === paymentId),
  );

  createNotification(
    "Payment approved",
    `${payment.company} was approved for ${payment.planName}.`,
    "success",
  );
  broadcastPaymentUpdate(paymentRecord);

  return paymentRecord;
}

export function rejectPayment(id, payload = {}) {
  const paymentId = sanitizeText(id);
  const note = sanitizeText(payload.note);

  if (!paymentId) {
    throw createHttpError("Payment id is required.");
  }

  const payment = updateRuntimeState((state) => {
    const currentPayment = getPaymentOrThrow(state, paymentId);

    if (currentPayment.status === "approved") {
      throw createHttpError("Approved payments cannot be rejected.", 409);
    }

    if (currentPayment.status === "rejected") {
      throw createHttpError("Payment is already rejected.", 409);
    }

    currentPayment.status = "rejected";
    currentPayment.rejectedAt = new Date().toISOString();
    currentPayment.approvalNote = note || "Rejected by admin.";

    return currentPayment;
  });

  const paymentRecord = buildPaymentRecord(payment);

  createNotification(
    "Payment rejected",
    `${payment.company} payment request for ${payment.planName} was rejected.`,
    "warning",
  );
  broadcastPaymentUpdate(paymentRecord);

  return paymentRecord;
}
