import { getAccounts } from "./accountService.js";
import { getActivations } from "./activationService.js";
import { getNotifications } from "./runtimeService.js";
import { getPayments } from "./paymentService.js";
import { getSmartCards } from "./smartCardService.js";
import { getTickets } from "./ticketService.js";

export function getClientOverview(company) {
  const accounts = getAccounts();
  const account =
    accounts.find((item) => item.company === company) ?? accounts[0] ?? null;

  if (!account) {
    return {
      account: null,
      payments: [],
      smartCards: [],
      activations: [],
      tickets: [],
      notifications: [],
      quickMetrics: [],
      clients: accounts,
    };
  }

  const payments = getPayments().filter(
    (payment) => payment.company === account.company,
  );
  const smartCards = getSmartCards().filter(
    (card) => card.ownerCompany === account.company,
  );
  const activations = getActivations().filter(
    (activation) => activation.company === account.company,
  );
  const tickets = getTickets().filter(
    (ticket) => ticket.company === account.company,
  );
  const notifications = getNotifications().slice(0, 8);

  return {
    account,
    clients: accounts.map((item) => ({
      company: item.company,
      sectorLabel: item.sectorLabel,
    })),
    payments: payments.slice(0, 8),
    smartCards: smartCards.slice(0, 20),
    activations: activations.slice(0, 8),
    tickets: tickets.slice(0, 8),
    notifications,
    quickMetrics: [
      {
        key: "sales",
        label: "Sales today",
        value: `EUR ${account.salesToday.toLocaleString("en-GB")}`,
        detail: "Live mock revenue visible to the client dashboard.",
      },
      {
        key: "calls",
        label: "Calls handled",
        value: `${account.callsHandled}`,
        detail: "AI voice interactions handled in runtime.",
      },
      {
        key: "tasks",
        label: "Tasks automated",
        value: `${account.tasksAutomated}`,
        detail: "Automations executed this cycle.",
      },
      {
        key: "credits",
        label: "Credits remaining",
        value: `${account.creditsRemaining.toLocaleString("en-GB")}`,
        detail: "Available tokens and processing headroom.",
      },
    ],
  };
}
