import { fallbackContent } from "./landingData.js";

function minutesAgo(value) {
  return new Date(Date.now() - value * 60 * 1000).toISOString();
}

function daysAgo(value) {
  return new Date(Date.now() - value * 24 * 60 * 60 * 1000).toISOString();
}

function getDeviceKeyForSector(sector) {
  if (sector === "commercial") {
    return "ai-stick";
  }

  if (sector === "healthcare") {
    return "med-assistant";
  }

  if (sector === "industry") {
    return "industry-edge";
  }

  return "business-hub";
}

export function createFreshSmartCardInventory() {
  const sectorMap = new Map(
    fallbackContent.sectors.map((sector) => [sector.slug, sector]),
  );
  const planMap = new Map(
    fallbackContent.plans.map((plan) => [plan.slug, plan]),
  );
  const planCycle = fallbackContent.plans.map((plan) => plan.slug);
  const sectorCycle = ["commercial", "business", "healthcare", "industry"];
  const smartCards = [];
  let sequence = 1;

  planCycle.forEach((plan, planIndex) => {
    const planRecord = planMap.get(plan);

    for (let index = 0; index < 500; index += 1) {
      const sector = sectorCycle[(index + planIndex) % sectorCycle.length];
      const sectorRecord = sectorMap.get(sector);

      smartCards.push({
        id: `card-${sequence}`,
        code: `SC-${String(sequence).padStart(5, "0")}-${plan.slice(0, 3).toUpperCase()}-${sector.slice(0, 3).toUpperCase()}`,
        sector,
        sectorLabel: sectorRecord?.name ?? sector,
        plan,
        planName: planRecord?.name ?? plan,
        status: "available",
        ownerCompany: null,
        deviceKey: null,
        issuedAt: minutesAgo(sequence * 8),
        updatedAt: minutesAgo(sequence * 4),
      });

      sequence += 1;
    }
  });

  return smartCards;
}

export function createRuntimeSeed() {
  const sectorMap = new Map(
    fallbackContent.sectors.map((sector) => [sector.slug, sector]),
  );
  const planMap = new Map(
    fallbackContent.plans.map((plan) => [plan.slug, plan]),
  );

  const users = [
    {
      id: "user-admin-1",
      role: "admin",
      name: "System Admin",
      email: "admin@brain-ai.com",
      password: "Admin123!",
      company: "brAIn HQ",
      sector: null,
      plan: null,
      createdAt: daysAgo(120),
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
      createdAt: daysAgo(56),
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
      createdAt: daysAgo(48),
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
      createdAt: daysAgo(37),
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
      createdAt: daysAgo(28),
    },
  ];

  const accounts = [
    {
      id: "account-1",
      company: "Nova Market",
      sector: "commercial",
      sectorLabel: "Commercial AI",
      plan: "business",
      planName: "Business",
      status: "active",
      devices: 14,
      smartCards: 0,
      monthlyUsage: 2420000,
      creditsRemaining: 1860000,
      salesToday: 12450,
      callsHandled: 28,
      tasksAutomated: 56,
      newLeads: 14,
      createdAt: daysAgo(42),
    },
    {
      id: "account-2",
      company: "Helios Clinic",
      sector: "healthcare",
      sectorLabel: "Healthcare AI",
      plan: "professional",
      planName: "Professional",
      status: "active",
      devices: 9,
      smartCards: 0,
      monthlyUsage: 1180000,
      creditsRemaining: 920000,
      salesToday: 8250,
      callsHandled: 18,
      tasksAutomated: 34,
      newLeads: 8,
      createdAt: daysAgo(63),
    },
    {
      id: "account-3",
      company: "Astra Group",
      sector: "business",
      sectorLabel: "Business AI",
      plan: "platinum",
      planName: "Platinum",
      status: "active",
      devices: 22,
      smartCards: 0,
      monthlyUsage: 4820000,
      creditsRemaining: 4080000,
      salesToday: 19400,
      callsHandled: 41,
      tasksAutomated: 74,
      newLeads: 20,
      createdAt: daysAgo(88),
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
      smartCards: 0,
      monthlyUsage: 3560000,
      creditsRemaining: 2750000,
      salesToday: 16340,
      callsHandled: 24,
      tasksAutomated: 61,
      newLeads: 9,
      createdAt: daysAgo(51),
    },
  ];

  const smartCards = createFreshSmartCardInventory();

  const paymentSeeds = [
    {
      id: "payment-1",
      company: "Nova Market",
      plan: "business",
      planName: "Business",
      amount: 990,
      currency: "EUR",
      cardBrand: "visa",
      paymentMethod: "visa",
      last4: "4812",
      status: "approved",
      approvalRequestedAt: minutesAgo(92),
      approvedAt: minutesAgo(80),
      rejectedAt: null,
      approvalNote: "Auto-seeded approved payment.",
      createdAt: minutesAgo(80),
    },
    {
      id: "payment-2",
      company: "Helios Clinic",
      plan: "professional",
      planName: "Professional",
      amount: 490,
      currency: "EUR",
      cardBrand: "mastercard",
      paymentMethod: "mastercard",
      last4: "5188",
      status: "approved",
      approvalRequestedAt: minutesAgo(166),
      approvedAt: minutesAgo(144),
      rejectedAt: null,
      approvalNote: "Auto-seeded approved payment.",
      createdAt: minutesAgo(144),
    },
    {
      id: "payment-3",
      company: "Astra Group",
      plan: "platinum",
      planName: "Platinum",
      amount: 1990,
      currency: "EUR",
      cardBrand: "amex",
      paymentMethod: "amex",
      last4: "1008",
      status: "pending",
      approvalRequestedAt: minutesAgo(200),
      approvedAt: null,
      rejectedAt: null,
      approvalNote: "Waiting for admin approval.",
      createdAt: minutesAgo(200),
    },
  ];

  const payments = paymentSeeds.map((payment) => ({
    ...payment,
    linkedCardCode: null,
  }));

  const activations = [
    {
      id: "activation-1",
      company: "Nova Market",
      sector: "commercial",
      sectorLabel: "Commercial AI",
      deviceKey: "ai-stick",
      deviceName: "brAIn AI Stick",
      plan: "business",
      planName: "Business",
      site: "Prishtine flagship wall",
      status: "provisioning",
      createdAt: minutesAgo(34),
    },
    {
      id: "activation-2",
      company: "Helios Clinic",
      sector: "healthcare",
      sectorLabel: "Healthcare AI",
      deviceKey: "med-assistant",
      deviceName: "brAIn MED Assistant",
      plan: "professional",
      planName: "Professional",
      site: "Reception desk A2",
      status: "live",
      createdAt: minutesAgo(82),
    },
  ];

  const tickets = [
    {
      id: "ticket-1",
      company: "Astra Group",
      contactEmail: "ops@astra-group.com",
      priority: "priority",
      category: "integration",
      summary: "Need CRM sync rules mapped for business hub deployments.",
      status: "investigating",
      createdAt: minutesAgo(21),
    },
    {
      id: "ticket-2",
      company: "Factory One",
      contactEmail: "maintenance@factory-one.eu",
      priority: "standard",
      category: "automation",
      summary: "Prepare anomaly alert routing for edge box proof-of-concept.",
      status: "open",
      createdAt: minutesAgo(67),
    },
  ];

  const notifications = [];

  const vpnEndpoints = [
    { id: "vpn-eu-1", location: "EU Central", country: "DE", status: "online" },
    { id: "vpn-us-1", location: "US East", country: "US", status: "online" },
    { id: "vpn-asia-1", location: "Asia Pacific", country: "SG", status: "online" },
    { id: "vpn-uk-1", location: "UK", country: "GB", status: "online" },
  ];

  return {
    meta: {
      version: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    users,
    sessions: [],
    accounts,
    notifications,
    uploads: [],
    leads: [],
    payments,
    smartCards,
    activations,
    tickets,
    scratchCardReveals: [],
    scratchCardReservations: [],
    vpnEndpoints,
    vpnSessions: [],
  };
}
