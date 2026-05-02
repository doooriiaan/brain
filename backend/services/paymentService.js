import { recordAccountPayment, updateAccountPlan } from "./accountService.js";
import { getPlanBySlug } from "./catalogService.js";
import { createNotification } from "./runtimeService.js";
import {
  createHttpError,
  createId,
  sanitizeText,
} from "./serviceHelpers.js";

const runtimePayments = [
  {
    id: "payment-1",
    company: "Nova Market",
    plan: "business",
    planName: "Business",
    amount: 990,
    currency: "EUR",
    cardBrand: "visa",
    last4: "4812",
    status: "paid",
    createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
  },
  {
    id: "payment-2",
    company: "Helios Clinic",
    plan: "professional",
    planName: "Professional",
    amount: 490,
    currency: "EUR",
    cardBrand: "mastercard",
    last4: "5188",
    status: "paid",
    createdAt: new Date(Date.now() - 1000 * 60 * 144).toISOString(),
  },
  {
    id: "payment-3",
    company: "Astra Group",
    plan: "platinum",
    planName: "Platinum",
    amount: 1990,
    currency: "EUR",
    cardBrand: "amex",
    last4: "1008",
    status: "paid",
    createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
  },
];

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

export function getPayments() {
  return runtimePayments;
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
  };

  runtimePayments.unshift(payment);
  runtimePayments.splice(30);

  updateAccountPlan(company, plan);
  recordAccountPayment(company, amount);
  createNotification(
    "Payment received",
    `${company} paid EUR ${amount} with ${cardBrand.toUpperCase()}.`,
    "success",
  );

  return payment;
}
