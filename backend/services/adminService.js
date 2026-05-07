import { getAccounts } from "./accountService.js";
import { getActivations, updateActivationStatus } from "./activationService.js";
import { getLeads } from "./leadService.js";
import { getOperationsOverview } from "./operationsService.js";
import { approvePayment, getPayments, rejectPayment } from "./paymentService.js";
import {
  clearNotifications,
  clearRuntimeHistory,
  createNotification,
  getNotifications,
} from "./runtimeService.js";
import {
  assignSmartCards,
  getSmartCards,
  getSmartCardStats,
} from "./smartCardService.js";
import { getTickets, updateTicketStatus } from "./ticketService.js";

export function getAdminOverview() {
  const operations = getOperationsOverview();
  const payments = getPayments();
  const approvedPayments = payments.filter((payment) => payment.status === "approved");
  const pendingPayments = payments.filter((payment) => payment.status === "pending");
  const smartCards = getSmartCards();
  const smartCardStats = getSmartCardStats();
  const accounts = getAccounts();
  const activations = getActivations();
  const tickets = getTickets();
  const leads = getLeads();

  return {
    ...operations,
    payments,
    smartCardStats,
    smartCards,
    accounts,
    activations,
    tickets,
    leads,
    adminMetrics: [
      {
        key: "cards",
        label: "SC cards",
        value: `${smartCardStats.total}`,
        detail: `${smartCardStats.available} available - ${smartCardStats.activated} activated`,
      },
      {
        key: "payments",
        label: "Payments",
        value: `EUR ${approvedPayments.reduce((sum, payment) => sum + payment.amount, 0)}`,
        detail: `${pendingPayments.length} pending approval / ${approvedPayments.length} approved.`,
      },
      {
        key: "accounts",
        label: "Accounts",
        value: `${accounts.length}`,
        detail: "Client organizations visible to the admin console.",
      },
      {
        key: "notifications",
        label: "Notifications",
        value: `${getNotifications().length}`,
        detail: "Broadcasts and workflow updates in live feed.",
      },
    ],
  };
}

export function broadcastAdminNotification(payload) {
  createNotification(payload.title, payload.body, payload.level);
  return getNotifications()[0];
}

export function clearAdminNotifications() {
  return clearNotifications();
}

export function clearAdminHistory() {
  return clearRuntimeHistory();
}

export function setAdminActivationStatus(id, status) {
  return updateActivationStatus(id, status);
}

export function setAdminTicketStatus(id, status) {
  return updateTicketStatus(id, status);
}

export function assignAdminSmartCards(payload) {
  return assignSmartCards(payload);
}

export function setAdminPaymentStatus(id, status, payload = {}) {
  if (status === "approved") {
    return approvePayment(id, payload);
  }

  if (status === "rejected") {
    return rejectPayment(id, payload);
  }

  throw new Error("Unsupported payment status action.");
}
