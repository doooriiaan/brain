import type {
  AdminOverview,
  ClientOverview,
  LandingContent,
  OperationsOverview,
} from "./types";

const contentTranslations = {
  sq: {
    "Komercial + Business + Healthcare + Industry 4.0":
      "Komercial + Biznes + Shendetesi + Industri 4.0",
    "Smarter business. Stronger results.":
      "Biznes me i zgjuar. Rezultate me te forta.",
    "brAIn turns the concept into a full product ecosystem: sector-ready devices, smart-card activation, payments, live services, and a compact high-energy preweb that flows into the real system.":
      "brAIn e kthen konceptin ne nje ekosistem te plote produkti: pajisje per sektore, aktivizim me smart-card, pagesa, sherbime live dhe nje preweb energjik qe lidhet direkt me sistemin real.",
    "Sectors ready": "Sektore gati",
    "Devices in lineup": "Pajisje ne linje",
    "SC cards live": "SC cards aktive",
    "4 verticals": "4 vertikale",
    "4 products": "4 produkte",
    "Open preweb": "Hap preweb",
    "Open system": "Hap sistemin",
    Commercial: "Komercial",
    Business: "Biznes",
    Healthcare: "Shendetesi",
    "Industry 4.0": "Industri 4.0",
    "AI Stick for retail, hospitality, kiosks, and smart displays":
      "AI Stick per retail, hospitality, kioska dhe ekrane inteligjente",
    "A compact plug-and-play device for customer-facing screens that adds voice AI, content suggestions, messaging flows, and branded experiences.":
      "Nje pajisje kompakte plug-and-play per ekrane klientesh qe shton AI me ze, sugjerime permbajtjeje, flukse komunikimi dhe eksperience te branduar.",
    "Retail stores, kiosks, hospitality, distributors":
      "Dyqane retail, kioska, hospitality, distributore",
    "Fast rollout": "Vendosje e shpejte",
    "Plug & play": "Plug & play",
    "Business Hub for automation, analytics, and communication":
      "Business Hub per automatizim, analitika dhe komunikim",
    "The core commercial package for companies that want a physical AI device plus a cloud dashboard for tasks, calls, insights, and workflow automation.":
      "Paketa kryesore komerciale per kompani qe duan nje pajisje fizike AI plus dashboard cloud per detyra, thirrje, analiza dhe automatizim te proceseve.",
    "SMBs, agencies, service companies, front desks":
      "SMB, agjenci, kompani sherbimesh, recepsione",
    "Realtime actions": "Veprime ne kohe reale",
    "Automation + voice": "Automatizim + ze",
    "brAIn MED for clinics, pharmacies, waiting rooms, and staff":
      "brAIn MED per klinika, farmaci, salle pritjeje dhe staf",
    "Healthcare-focused assistants for appointments, front desk support, patient information, and role-based access with a medical branding direction.":
      "Asistente te fokusuar ne shendetesi per termine, recepsion, informim pacientesh dhe akses sipas roleve me drejtim vizual mjekesor.",
    "Clinics, pharmacies, waiting rooms, medical teams":
      "Klinika, farmaci, salle pritjeje, ekipe mjekesore",
    "Compliance ready": "Gati per pajtueshmeri",
    "Secure workflow": "Workflow i sigurt",
    "Edge box for machine monitoring, predictive alerts, and AI ops":
      "Edge box per monitorim makinerish, alarme parashikuese dhe AI ops",
    "An industrial-grade device that connects to machines and sensors, then streams events into the cloud for dashboards, alerts, and AI recommendations.":
      "Nje pajisje industriale qe lidhet me makina dhe sensore, pastaj dergon ngjarje ne cloud per dashboarde, alarme dhe rekomandime AI.",
    "Factories, production lines, SCADA teams, operations leads":
      "Fabrika, linja prodhimi, ekipe SCADA, drejtues operacionesh",
    "Industrial fit": "Gati per industri",
    "PLC / SCADA ready": "PLC / SCADA gati",
    "Entry annual plan for small teams starting with AI.":
      "Plan vjetor hyrës per ekipe te vogla qe po fillojne me AI.",
    "For growing companies that need more automation and reporting.":
      "Per kompani ne rritje qe kerkojne me shume automatizim dhe raportim.",
    "The commercial sweet spot for scale, integrations, and voice.":
      "Zgjedhja ideale komerciale per shkallezim, integrime dhe ze.",
    "Enterprise power for unlimited devices and custom workflows.":
      "Fuqi enterprise per pajisje pa kufi dhe workflow te personalizuara.",
    "White-label deployments, usage add-ons, and dedicated management.":
      "Deploy white-label, shtesa sipas perdorimit dhe menaxhim i dedikuar.",
    "600,000 tokens per year": "600,000 token ne vit",
    "Basic AI tools and text workflows":
      "Vegla bazike AI dhe workflow tekstesh",
    "1 device connection": "1 lidhje pajisjeje",
    "Secure cloud account": "Llogari cloud e sigurt",
    "2,400,000 tokens per year": "2,400,000 token ne vit",
    "Advanced AI content + automation":
      "Permbajtje AI e avancuar + automatizim",
    "Analytics dashboard": "Dashboard analitike",
    "Priority support": "Support prioritar",
    "6,000,000 tokens per year": "6,000,000 token ne vit",
    "Voice + automation + analytics":
      "Ze + automatizim + analitika",
    "CRM and API integrations": "Integrime CRM dhe API",
    "Advanced insights and onboarding":
      "Analiza te avancuara dhe onboarding",
    "18,000,000 tokens per year": "18,000,000 token ne vit",
    "Unlimited devices": "Pajisje pa kufi",
    "AI voice and call automation":
      "AI voice dhe automatizim thirrjesh",
    "Custom workflows and API access":
      "Workflow te personalizuara dhe akses API",
    "18,000,000 base tokens included":
      "18,000,000 token baze te perfshire",
    "Extra token packs and usage billing":
      "Pako ekstra token dhe faturim sipas perdorimit",
    "White-label deployment option": "Opsion deploy white-label",
    "Priority 24/7 support": "Support prioritar 24/7",
    "Desk-ready AI assistant for daily operations and client workflows.":
      "Asistent AI i gatshem per tavoline per operacione ditore dhe workflow me kliente.",
    "Turn any TV or display into a customer-facing AI screen.":
      "Kthe cdo TV ose ekran ne nje pike AI per kliente.",
    "AI support device for clinics, pharmacies, and healthcare front desks.":
      "Pajisje AI per klinika, farmaci dhe recepsione shendetesore.",
    "Edge AI bridge between machines on-site and cloud insights.":
      "Ure Edge AI mes makinerive ne terren dhe analizave cloud.",
  },
  de: {
    "Smarter business. Stronger results.":
      "Intelligenteres Business. Starkere Ergebnisse.",
    "brAIn turns the concept into a full product ecosystem: sector-ready devices, smart-card activation, payments, live services, and a compact high-energy preweb that flows into the real system.":
      "brAIn macht aus dem Konzept ein vollstandiges Produktokosystem mit sektorfertigen Geraten, Smart-Card-Aktivierung, Zahlungen, Live-Services und einem kompakten Preweb, das direkt ins System fuhrt.",
    "Sectors ready": "Bereite Sektoren",
    "Devices in lineup": "Gerate im Sortiment",
    "SC cards live": "SC-Karten live",
    "4 verticals": "4 Vertikalen",
    "4 products": "4 Produkte",
    Commercial: "Handel",
    Healthcare: "Gesundheit",
    "Entry annual plan for small teams starting with AI.":
      "Jahresplan fur kleine Teams, die mit KI starten.",
    "For growing companies that need more automation and reporting.":
      "Fur wachsende Unternehmen mit mehr Automatisierung und Reporting.",
    "The commercial sweet spot for scale, integrations, and voice.":
      "Der passende Plan fur Skalierung, Integrationen und Voice.",
    "Enterprise power for unlimited devices and custom workflows.":
      "Enterprise-Leistung fur unbegrenzte Gerate und individuelle Workflows.",
    "White-label deployments, usage add-ons, and dedicated management.":
      "White-Label-Rollouts, Nutzungs-Add-ons und dediziertes Management.",
    "600,000 tokens per year": "600.000 Token pro Jahr",
    "2,400,000 tokens per year": "2.400.000 Token pro Jahr",
    "6,000,000 tokens per year": "6.000.000 Token pro Jahr",
    "18,000,000 tokens per year": "18.000.000 Token pro Jahr",
  },
} as const;

type SupportedLanguage = keyof typeof contentTranslations;

function translateValue(value: string, language: string) {
  if (language === "en") {
    return value;
  }

  const dictionary = contentTranslations[language as SupportedLanguage];
  return dictionary?.[value as keyof typeof dictionary] ?? value;
}

function localizeStringList(values: string[], language: string) {
  return values.map((value) => translateValue(value, language));
}

const uiTranslations = {
  sq: {
    Sector: "Sektor",
    Access: "Qasje",
    Region: "Rajoni",
    Active: "Aktiv",
    Standby: "Ne pritje",
    Logout: "Dil",
    "Live pulse": "Pulse live",
    "Notifications, services, uploads, leads, tickets, and activations in one place":
      "Njoftime, sherbime, uploads, leads, tickets dhe aktivizime ne nje vend",
    "This layer gives the product the cloud-system feel: runtime metrics update, timeline items roll in, and service readiness is visible before the user even enters the admin or client portal.":
      "Kjo shtrese ia jep produktit ndjesine e cloud-system: metrikat perditesohen, timeline leviz live dhe gatishmeria e sherbimeve shihet para se user-i te hyje ne portal.",
    Timeline: "Timeline",
    "Live runtime feed": "Feed live i runtime",
    "Runtime feed will appear here once the first live action lands.":
      "Feed-i live do te shfaqet ketu sapo te vije veprimi i pare.",
    "Service status": "Statusi i sherbimeve",
    "Live notifications": "Njoftime live",
    "No notifications have been emitted yet.": "Ende nuk ka njoftime.",
    "System center": "Qendra e sistemit",
    "Login / register gates for admin and client":
      "Hyrje / regjistrim per admin dhe client",
    "Admin page": "Faqja admin",
    "Client page": "Faqja klient",
    "Admin control page with live operations and payment control":
      "Faqe admin me operacione live dhe kontroll pagesash",
    "Client workspace page with payments, cards, and support":
      "Faqe klienti me pagesa, karta dhe support",
    "Use the admin page to monitor runtime, manage payments, assign smart cards, and control activation plus ticket status in real time.":
      "Përdor faqen admin per te monitoruar runtime, menaxhuar pagesat, ndare smart cards dhe kontrolluar aktivizimet dhe ticket status ne kohe reale.",
    "Use the client page to check account metrics, complete payments, track smart cards, and request deployment support.":
      "Përdor faqen klient per te pare metrikat, kryer pagesa, ndjekur smart cards dhe kerkuar support per deploy.",
    "Admin gets full control over runtime operations, payments, SC cards, uploads, notifications, and status changes. Client gets account metrics, payments, card visibility, activations, and support.":
      "Admin merr kontroll te plote mbi operacionet runtime, pagesat, SC cards, uploads, njoftimet dhe statuset. Client merr metrika, pagesa, karta, aktivizime dhe support.",
    "Portal roles": "Rolet e portalit",
    "Choose who is entering the system": "Zgjidh kush po hyn ne sistem",
    Client: "Klient",
    Admin: "Admin",
    "View company metrics, cards, payments, activations, and support.":
      "Shih metrikat e kompanise, kartat, pagesat, aktivizimet dhe support-in.",
    "Control notifications, payments, smart cards, uploads, activations, tickets, and accounts.":
      "Kontrollo njoftime, pagesa, smart cards, uploads, aktivizime, tickets dhe accounts.",
    "Demo credentials": "Kredenciale demo",
    "Click one to prefill login instantly.": "Kliko njeren per ta mbushur hyrjen menjehere.",
    "Target page": "Faqja target",
    "Admin login": "Hyrje admin",
    "Client login": "Hyrje klient",
    "System access": "Qasje ne sistem",
    Auth: "Auth",
    "Login to the portal": "Hyr ne portal",
    "Register a new portal account": "Regjistro nje account te ri",
    Login: "Hyr",
    Register: "Regjistrohu",
    "Open portal": "Hap portalin",
    "Open system center": "Hap qendren e sistemit",
    "Open business sector": "Hap sektorin business",
    "Back to commercial": "Kthehu te commercial",
    "Device live runtime": "Runtime live i pajisjes",
    Uptime: "Kohë aktive",
    Latency: "Vonesë",
    Throughput: "Kapacitet",
    Health: "Shendet",
    "Network profile:": "Profili i rrjetit:",
    "Ports and deployment": "Portet dhe deploy",
    "Suited for": "I pershtatshem per",
    "Prepare activation": "Pergatit aktivizimin",
    "Open support draft": "Hap draftin e support-it",
    "Live supporting signals": "Sinjale mbeshtetese live",
    "Smart-card and dashboard story": "Historia e smart-card dhe dashboard",
    "Care, compliance, and monitoring": "Kujdes, pajtueshmeri dhe monitorim",
    "Edge deployment and integrations": "Deploy edge dhe integrime",
    VPN: "VPN",
    REGION: "Rajoni",
  },
  de: {
    Sector: "Sektor",
    Access: "Zugang",
    Region: "Region",
    Active: "Aktiv",
    Standby: "Bereit",
    Logout: "Abmelden",
    "Live pulse": "Live-Pulse",
    "Notifications, services, uploads, leads, tickets, and activations in one place":
      "Benachrichtigungen, Services, Uploads, Leads, Tickets und Aktivierungen an einem Ort",
    "This layer gives the product the cloud-system feel: runtime metrics update, timeline items roll in, and service readiness is visible before the user even enters the admin or client portal.":
      "Diese Ebene gibt dem Produkt ein Cloud-System-Gefuhl: Runtime-Metriken aktualisieren sich, Timeline-Eintrage laufen live ein und die Service-Bereitschaft ist sichtbar, bevor jemand das Portal betritt.",
    Timeline: "Zeitleiste",
    "Live runtime feed": "Live-Runtime-Feed",
    "Runtime feed will appear here once the first live action lands.":
      "Der Runtime-Feed erscheint hier, sobald die erste Live-Aktion eintrifft.",
    "Service status": "Service-Status",
    "Live notifications": "Live-Benachrichtigungen",
    "No notifications have been emitted yet.": "Es wurden noch keine Benachrichtigungen gesendet.",
    "System center": "Systemzentrum",
    "Login / register gates for admin and client":
      "Login- und Registrierungszugang fur Admin und Client",
    "Admin page": "Admin-Seite",
    "Client page": "Client-Seite",
    "Admin control page with live operations and payment control":
      "Admin-Kontrollseite mit Live-Operationen und Zahlungssteuerung",
    "Client workspace page with payments, cards, and support":
      "Client-Arbeitsbereich mit Zahlungen, Karten und Support",
    "Use the admin page to monitor runtime, manage payments, assign smart cards, and control activation plus ticket status in real time.":
      "Nutze die Admin-Seite, um Runtime zu uberwachen, Zahlungen zu verwalten, Smart Cards zuzuweisen und Aktivierungen sowie Ticket-Status in Echtzeit zu steuern.",
    "Use the client page to check account metrics, complete payments, track smart cards, and request deployment support.":
      "Nutze die Client-Seite, um Kennzahlen zu sehen, Zahlungen abzuschliessen, Smart Cards zu verfolgen und Deployment-Support anzufordern.",
    "Admin gets full control over runtime operations, payments, SC cards, uploads, notifications, and status changes. Client gets account metrics, payments, card visibility, activations, and support.":
      "Admin erhalt die volle Kontrolle uber Runtime-Operationen, Zahlungen, SC-Karten, Uploads, Benachrichtigungen und Statusanderungen. Client erhalt Kennzahlen, Zahlungen, Kartenansicht, Aktivierungen und Support.",
    "Portal roles": "Portalrollen",
    "Choose who is entering the system": "Wahle, wer das System betritt",
    Client: "Client",
    Admin: "Admin",
    "View company metrics, cards, payments, activations, and support.":
      "Unternehmenskennzahlen, Karten, Zahlungen, Aktivierungen und Support anzeigen.",
    "Control notifications, payments, smart cards, uploads, activations, tickets, and accounts.":
      "Benachrichtigungen, Zahlungen, Smart Cards, Uploads, Aktivierungen, Tickets und Konten steuern.",
    "Demo credentials": "Demo-Zugangsdaten",
    "Click one to prefill login instantly.": "Klicke auf einen Eintrag, um den Login sofort vorauszufullen.",
    "Target page": "Zielseite",
    "Admin login": "Admin-Login",
    "Client login": "Client-Login",
    "System access": "Systemzugang",
    Auth: "Authentifizierung",
    "Login to the portal": "Im Portal anmelden",
    "Register a new portal account": "Neues Portal-Konto registrieren",
    Login: "Login",
    Register: "Registrieren",
    "Open portal": "Portal offnen",
    "Open system center": "Systemzentrum offnen",
    "Open business sector": "Business-Sektor offnen",
    "Back to commercial": "Zuruck zu Commercial",
    "Device live runtime": "Live-Runtime des Gerats",
    Uptime: "Laufzeit",
    Latency: "Latenz",
    Throughput: "Durchsatz",
    Health: "Gesundheit",
    "Network profile:": "Netzwerkprofil:",
    "Ports and deployment": "Ports und Deployment",
    "Suited for": "Geeignet fur",
    "Prepare activation": "Aktivierung vorbereiten",
    "Open support draft": "Support-Entwurf offnen",
    "Live supporting signals": "Live-Unterstutzungssignale",
    "Smart-card and dashboard story": "Smart-Card- und Dashboard-Story",
    "Care, compliance, and monitoring": "Versorgung, Compliance und Monitoring",
    "Edge deployment and integrations": "Edge-Deployment und Integrationen",
  },
} as const;

type RuntimePatternRule = {
  test: RegExp;
  replace: (value: string, ...groups: string[]) => string;
};

const runtimePatternTranslators: Record<string, RuntimePatternRule[]> = {
  sq: [
    {
      test: /^(\d+) uploaded file\(s\) stored through the backend\.$/,
      replace: (_value: string, count: string) =>
        `${count} file te ngarkuara te ruajtura permes backend-it.`,
    },
    {
      test: /^(\d+) notification items are available live\.$/,
      replace: (_value: string, count: string) =>
        `${count} njoftime jane aktive live.`,
    },
    {
      test: /^(\d+) demo request\(s\) captured through the live consultation form\.$/,
      replace: (_value: string, count: string) =>
        `${count} kerkesa demo jane kapur permes formes live.`,
    },
    {
      test: /^(\d+) activation workflow\(s\) are tracked for rollout and provisioning\.$/,
      replace: (_value: string, count: string) =>
        `${count} workflow aktivizimi po ndiqen per rollout dhe provisionim.`,
    },
    {
      test: /^(\d+) support or automation ticket\(s\) are available in the runtime desk\.$/,
      replace: (_value: string, count: string) =>
        `${count} support ose automation tickets jane ne runtime desk.`,
    },
    {
      test: /^(\d+) Visa, Mastercard, or Amex payment record\(s\) were processed in the live mock gateway\.$/,
      replace: (_value: string, count: string) =>
        `${count} pagesa Visa, Mastercard ose Amex jane procesuar ne gateway live.`,
    },
    {
      test: /^(\d+) SC cards tracked, with (\d+) available for assignment\.$/,
      replace: (_value: string, total: string, available: string) =>
        `${total} SC cards te gjurmuara, ${available} gati per caktim.`,
    },
    {
      test: /^(\d+) available and ready for assignment\.$/,
      replace: (_value: string, count: string) =>
        `${count} gati dhe ne dispozicion per caktim.`,
    },
    {
      test: /^Asset uploaded and ready at (.+)\.$/,
      replace: (_value: string, url: string) =>
        `Asseti u ngarkua dhe eshte gati te ${url}.`,
    },
    {
      test: /^(.+) requested a walkthrough$/,
      replace: (_value: string, company: string) =>
        `${company} kerkoi nje prezantim.`,
    },
    {
      test: /^(.+) sector selected by (.+)\.$/,
      replace: (_value: string, sector: string, name: string) =>
        `Sektori ${sector} u zgjodh nga ${name}.`,
    },
    {
      test: /^(.+) queued (.+)\.$/,
      replace: (_value: string, company: string, site: string) =>
        `${company} e ka future ne radhe ${site}.`,
    },
  ],
  de: [
    {
      test: /^(\d+) uploaded file\(s\) stored through the backend\.$/,
      replace: (_value: string, count: string) =>
        `${count} hochgeladene Datei(en) wurden uber das Backend gespeichert.`,
    },
    {
      test: /^(\d+) notification items are available live\.$/,
      replace: (_value: string, count: string) =>
        `${count} Benachrichtigungseintrage sind live verfugbar.`,
    },
    {
      test: /^(\d+) demo request\(s\) captured through the live consultation form\.$/,
      replace: (_value: string, count: string) =>
        `${count} Demo-Anfrage(n) wurden uber das Live-Formular erfasst.`,
    },
    {
      test: /^(\d+) activation workflow\(s\) are tracked for rollout and provisioning\.$/,
      replace: (_value: string, count: string) =>
        `${count} Aktivierungs-Workflow(s) werden fur Rollout und Provisionierung verfolgt.`,
    },
    {
      test: /^(\d+) support or automation ticket\(s\) are available in the runtime desk\.$/,
      replace: (_value: string, count: string) =>
        `${count} Support- oder Automatisierungs-Ticket(s) sind im Runtime-Desk verfugbar.`,
    },
    {
      test: /^(\d+) Visa, Mastercard, or Amex payment record\(s\) were processed in the live mock gateway\.$/,
      replace: (_value: string, count: string) =>
        `${count} Visa-, Mastercard- oder Amex-Zahlung(en) wurden im Live-Mock-Gateway verarbeitet.`,
    },
    {
      test: /^(\d+) SC cards tracked, with (\d+) available for assignment\.$/,
      replace: (_value: string, total: string, available: string) =>
        `${total} SC-Karten werden verfolgt, ${available} sind fur die Zuweisung verfugbar.`,
    },
    {
      test: /^(\d+) available and ready for assignment\.$/,
      replace: (_value: string, count: string) =>
        `${count} verfugbar und zur Zuweisung bereit.`,
    },
    {
      test: /^Asset uploaded and ready at (.+)\.$/,
      replace: (_value: string, url: string) =>
        `Asset hochgeladen und bereit unter ${url}.`,
    },
    {
      test: /^(.+) requested a walkthrough$/,
      replace: (_value: string, company: string) =>
        `${company} hat eine Einfuhrung angefordert.`,
    },
    {
      test: /^(.+) sector selected by (.+)\.$/,
      replace: (_value: string, sector: string, name: string) =>
        `Der Sektor ${sector} wurde von ${name} ausgewahlt.`,
    },
    {
      test: /^(.+) queued (.+)\.$/,
      replace: (_value: string, company: string, site: string) =>
        `${company} hat ${site} in die Warteschlange gestellt.`,
    },
  ],
} as const;

export function translateAppText(value: string, language: string) {
  if (language === "en") {
    return value;
  }

  const uiDictionary = uiTranslations[language as keyof typeof uiTranslations];
  const directMatch =
    uiDictionary?.[value as keyof typeof uiDictionary] ??
    translateValue(value, language);

  if (directMatch !== value) {
    return directMatch;
  }

  const patternRules =
    runtimePatternTranslators[
      language as keyof typeof runtimePatternTranslators
    ] ?? [];

  for (const rule of patternRules) {
    const matched = value.match(rule.test);

    if (matched) {
      return rule.replace(value, ...matched.slice(1));
    }
  }

  return value;
}

function localizeMetrics<T extends { label: string; detail: string }>(
  metrics: T[],
  language: string,
) {
  return metrics.map((metric) => ({
    ...metric,
    label: translateAppText(metric.label, language),
    detail: translateAppText(metric.detail, language),
  }));
}

export function localizeOperationsOverview(
  overview: OperationsOverview,
  language: string,
): OperationsOverview {
  return {
    ...overview,
    services: overview.services.map((service) => ({
      ...service,
      label: translateAppText(service.label, language),
      detail: translateAppText(service.detail, language),
    })),
    notifications: overview.notifications.map((notification) => ({
      ...notification,
      title: translateAppText(notification.title, language),
      body: translateAppText(notification.body, language),
    })),
    metrics: localizeMetrics(overview.metrics, language),
    timeline: overview.timeline.map((item) => ({
      ...item,
      title: translateAppText(item.title, language),
      detail: translateAppText(item.detail, language),
    })),
  };
}

export function localizeAdminOverview(
  overview: AdminOverview,
  language: string,
): AdminOverview {
  const localizedOperations = localizeOperationsOverview(overview, language);

  return {
    ...overview,
    ...localizedOperations,
    adminMetrics: localizeMetrics(overview.adminMetrics, language),
  };
}

export function localizeClientOverview(
  overview: ClientOverview,
  language: string,
): ClientOverview {
  return {
    ...overview,
    notifications: overview.notifications.map((notification) => ({
      ...notification,
      title: translateAppText(notification.title, language),
      body: translateAppText(notification.body, language),
    })),
    quickMetrics: localizeMetrics(overview.quickMetrics, language),
  };
}

export function localizeLandingContent(
  content: LandingContent,
  language: string,
): LandingContent {
  return {
    ...content,
    hero: {
      ...content.hero,
      eyebrow: translateValue(content.hero.eyebrow, language),
      title: translateValue(content.hero.title, language),
      subtitle: translateValue(content.hero.subtitle, language),
      badges: localizeStringList(content.hero.badges, language),
      metrics: content.hero.metrics.map((metric) => ({
        ...metric,
        label: translateValue(metric.label, language),
        value: translateValue(metric.value, language),
      })),
      primaryCta: {
        ...content.hero.primaryCta,
        label: translateValue(content.hero.primaryCta.label, language),
      },
      secondaryCta: {
        ...content.hero.secondaryCta,
        label: translateValue(content.hero.secondaryCta.label, language),
      },
    },
    sectors: content.sectors.map((sector) => ({
      ...sector,
      name: translateValue(sector.name, language),
      title: translateValue(sector.title, language),
      summary: translateValue(sector.summary, language),
      audience: translateValue(sector.audience, language),
      statLabel: translateValue(sector.statLabel, language),
      statValue: translateValue(sector.statValue, language),
      capabilities: localizeStringList(sector.capabilities, language),
    })),
    devices: content.devices.map((device) => ({
      ...device,
      tagline: translateValue(device.tagline, language),
      description: translateValue(device.description, language),
      suitedFor: localizeStringList(device.suitedFor, language),
      metrics: device.metrics.map((metric) => ({
        ...metric,
        label: translateValue(metric.label, language),
        value: translateValue(metric.value, language),
      })),
    })),
    plans: content.plans.map((plan) => ({
      ...plan,
      name: translateValue(plan.name, language),
      summary: translateValue(plan.summary, language),
      deviceAllowance: translateValue(plan.deviceAllowance, language),
      supportLabel: translateValue(plan.supportLabel, language),
      automationLabel: translateValue(plan.automationLabel, language),
      features: localizeStringList(plan.features, language),
    })),
    cloudSystem: {
      ...content.cloudSystem,
      title: translateValue(content.cloudSystem.title, language),
      summary: translateValue(content.cloudSystem.summary, language),
      highlights: localizeStringList(content.cloudSystem.highlights, language),
      steps: content.cloudSystem.steps.map((step) => ({
        ...step,
        title: translateValue(step.title, language),
        detail: translateValue(step.detail, language),
      })),
    },
    integrations: {
      ...content.integrations,
      protocols: localizeStringList(content.integrations.protocols, language),
      platforms: localizeStringList(content.integrations.platforms, language),
      cloudPartners: localizeStringList(
        content.integrations.cloudPartners,
        language,
      ),
    },
  };
}
