import { getActivations } from "./activationService.js";
import { getLeads } from "./leadService.js";
import { getPayments } from "./paymentService.js";
import { getNotifications, getUploads } from "./runtimeService.js";
import { getServiceStatuses } from "./serviceStatusService.js";
import { getSmartCardStats } from "./smartCardService.js";
import { sortByCreatedAtDesc } from "./serviceHelpers.js";
import { getTickets } from "./ticketService.js";

function buildTimeline({
  notifications,
  uploads,
  leads,
  payments,
  activations,
  tickets,
}) {
  return sortByCreatedAtDesc([
    ...notifications.map((notification) => ({
      id: `notification-${notification.id}`,
      type: "notification",
      title: notification.title,
      detail: notification.body,
      status: notification.level,
      createdAt: notification.createdAt,
    })),
    ...uploads.map((upload) => ({
      id: `upload-${upload.id}`,
      type: "upload",
      title: upload.fileName,
      detail: `Asset uploaded and ready at ${upload.url}.`,
      status: "success",
      createdAt: upload.uploadedAt,
    })),
    ...leads.map((lead) => ({
      id: `lead-${lead.id}`,
      type: "lead",
      title: `${lead.company} requested a walkthrough`,
      detail: `${lead.sectorLabel} sector selected by ${lead.name}.`,
      status: "info",
      createdAt: lead.createdAt,
    })),
    ...payments.map((payment) => ({
      id: `payment-${payment.id}`,
      type: "payment",
      title: `${payment.company} payment received`,
      detail: `${payment.planName} / EUR ${payment.amount}${payment.linkedCardCode ? ` / linked ${payment.linkedCardCode}` : ""}.`,
      status: "success",
      createdAt: payment.createdAt,
    })),
    ...activations.map((activation) => ({
      id: `activation-${activation.id}`,
      type: "activation",
      title: `${activation.deviceName} activation`,
      detail: `${activation.company} queued ${activation.site}.`,
      status: activation.status === "live" ? "success" : "warning",
      createdAt: activation.createdAt,
    })),
    ...tickets.map((ticket) => ({
      id: `ticket-${ticket.id}`,
      type: "ticket",
      title: `${ticket.company} ${ticket.category} request`,
      detail: ticket.summary,
      status: ticket.priority === "critical" ? "warning" : "info",
      createdAt: ticket.createdAt,
    })),
  ]).slice(0, 8);
}

export function getOperationsOverview() {
  const notifications = getNotifications();
  const uploads = getUploads();
  const leads = getLeads();
  const activations = getActivations();
  const tickets = getTickets();
  const services = getServiceStatuses();
  const payments = getPayments();
  const smartCardStats = getSmartCardStats();

  return {
    services,
    notifications: notifications.slice(0, 6),
    uploads: uploads.slice(0, 6),
    leads: leads.slice(0, 6),
    activations: activations.slice(0, 6),
    tickets: tickets.slice(0, 6),
    metrics: [
      {
        key: "services-online",
        label: "Services online",
        value: `${services.filter((service) => service.status === "online").length}/${services.length}`,
        detail: "Runtime modules currently responding.",
      },
      {
        key: "demo-pipeline",
        label: "Demo pipeline",
        value: `${leads.length}`,
        detail: "Leads captured through the live request form.",
      },
      {
        key: "device-rollouts",
        label: "Device rollouts",
        value: `${activations.length}`,
        detail: "Activation workflows tracked by the backend.",
      },
      {
        key: "support-desk",
        label: "Support desk",
        value: `${tickets.filter((ticket) => ticket.status !== "resolved").length}`,
        detail: "Open or active support workflows in queue.",
      },
      {
        key: "payment-flow",
        label: "Payments",
        value: `${payments.length}`,
        detail: "Visa, Mastercard, and Amex mock payments captured live.",
      },
      {
        key: "smart-cards",
        label: "SC cards",
        value: `${smartCardStats.total}`,
        detail: `${smartCardStats.available} available and ready for assignment.`,
      },
    ],
    timeline: buildTimeline({
      notifications,
      uploads,
      leads,
      payments,
      activations,
      tickets,
    }),
  };
}
