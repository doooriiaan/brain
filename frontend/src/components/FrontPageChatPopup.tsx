import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Send, Sparkles, X } from "lucide-react";
import type { Device, Plan, Sector } from "../types";
import {
  formatPlanLimit,
  parsePlanDeviceLimit,
  parsePlanTokenLimit,
  resolveRecommendedPlan,
} from "../utils/planInsights";

type MessageItem = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type FrontPageChatPopupProps = {
  device: Device | null;
  embedded?: boolean;
  onNavigate: (target: "devices" | "access" | "help" | "sectors") => void;
  plans: Plan[];
  sector: Sector | null;
};

type ChatReply = {
  nextAction: "devices" | "access" | "help" | "sectors";
  reply: string;
  suggestions: string[];
};

function getLanguage() {
  if (typeof document !== "undefined") {
    const docLanguage = document.documentElement.lang?.toLowerCase();

    if (docLanguage?.startsWith("sq")) {
      return "sq";
    }
  }

  if (typeof navigator !== "undefined") {
    return navigator.language.toLowerCase().startsWith("sq") ? "sq" : "en";
  }

  return "en";
}

function getDefaultSuggestions(
  language: "sq" | "en",
  device: Device | null,
  sector: Sector | null,
) {
  if (language === "sq") {
    return [
      device ? `Cka ben ${device.name}?` : "Cilin produkt te hap?",
      sector ? `Cili plan per ${sector.name}?` : "Cili plan me pershtatet?",
      "Hap pricing",
    ];
  }

  return [
    device ? `What does ${device.name} do?` : "Which product should I open?",
    sector ? `Which plan fits ${sector.name}?` : "Which plan fits me?",
    "Open pricing",
  ];
}

function formatPlanPrice(plan: Plan) {
  return plan.monthlyPrice === 0 ? "Free" : `EUR ${plan.monthlyPrice}/mo`;
}

function formatPlanYear(plan: Plan) {
  return plan.annualPrice === 0 ? "Free" : `EUR ${plan.annualPrice}/yr`;
}

function findMentionedPlan(message: string, plans: Plan[]) {
  const normalized = message.toLowerCase();

  return plans.find((plan) => {
    const aliases = [plan.name.toLowerCase(), plan.slug, plan.slug.replace(/-/g, " ")];
    return aliases.some((alias) => normalized.includes(alias));
  });
}

function getContextRecommendation(plans: Plan[], sector: Sector | null) {
  const defaultDeviceCount = sector?.slug === "industry" ? 8 : sector?.slug === "commercial" ? 3 : 4;
  const defaultSupportIntensity =
    sector?.slug === "commercial"
      ? 28
      : sector?.slug === "business"
        ? 44
        : sector?.slug === "healthcare"
          ? 52
          : sector?.slug === "industry"
            ? 64
            : 40;

  return resolveRecommendedPlan(plans, defaultDeviceCount, defaultSupportIntensity).plan;
}

function createReply(
  message: string,
  language: "sq" | "en",
  device: Device | null,
  sector: Sector | null,
  plans: Plan[],
): ChatReply {
  const normalized = message.toLowerCase();
  const mentionedPlan = findMentionedPlan(message, plans);
  const recommendedPlan =
    getContextRecommendation(plans, sector) ??
    plans.find((plan) => plan.featured) ??
    plans[0] ??
    null;

  if (
    normalized.includes("hello") ||
    normalized.includes("hi") ||
    normalized.includes("tung") ||
    normalized.includes("persh")
  ) {
    return {
      nextAction: device ? "devices" : "help",
      reply:
        language === "sq"
          ? `Jam gati. Mund te ta shpjegoj ${device?.name ?? "produktin"}, sektorin ${sector?.name ?? "aktiv"}, ose planin qe te pershtatet me mire.`
          : `I am ready. I can walk you through ${device?.name ?? "the product"}, the ${sector?.name ?? "active"} sector, or the best plan fit.`,
      suggestions: getDefaultSuggestions(language, device, sector),
    };
  }

  if (mentionedPlan) {
    const deviceLimit =
      mentionedPlan.slug === "free"
        ? language === "sq"
          ? "1 validim i sigurt"
          : "1 secure validation"
        : formatPlanLimit(parsePlanDeviceLimit(mentionedPlan), "devices");
    const tokenLimit =
      mentionedPlan.slug === "free"
        ? language === "sq"
          ? "pa pagese per 1 hyrje"
          : "free for 1 access check"
        : formatPlanLimit(parsePlanTokenLimit(mentionedPlan), "tokens");

    return {
      nextAction: "help",
      reply:
        language === "sq"
          ? `${mentionedPlan.name} eshte ${formatPlanPrice(mentionedPlan)} dhe ${formatPlanYear(
              mentionedPlan,
            )}. Perfshin ${deviceLimit}, ${tokenLimit}, dhe vjen me kete lane: ${mentionedPlan.summary}`
          : `${mentionedPlan.name} is ${formatPlanPrice(mentionedPlan)} and ${formatPlanYear(
              mentionedPlan,
            )}. It covers ${deviceLimit}, ${tokenLimit}, and is positioned like this: ${mentionedPlan.summary}`,
      suggestions:
        language === "sq"
          ? ["Hap pricing", "Krahasoje me plan tjeter", "A me duhet login?"]
          : ["Open pricing", "Compare it with another plan", "Do I need login?"],
    };
  }

  if (
    normalized.includes("plan") ||
    normalized.includes("price") ||
    normalized.includes("pricing") ||
    normalized.includes("cost") ||
    normalized.includes("cmim") ||
    normalized.includes("compare") ||
    normalized.includes("krahas")
  ) {
    return {
      nextAction: "help" as const,
      reply:
        language === "sq"
          ? recommendedPlan
            ? `Pricing tani duhet te ndjeke planet reale. Per kontekstin tend do nisja me ${recommendedPlan.name} te ${formatPlanPrice(
                recommendedPlan,
              )}. Nese don, ta hap pricing-un ku e sheh krahasimin e plote.`
            : "Per planin dhe cmimin, hape pricing window. Aty e ke krahasimin me te qarte."
          : recommendedPlan
            ? `Pricing now follows the real plan cards. For your current context I would start with ${recommendedPlan.name} at ${formatPlanPrice(
                recommendedPlan,
              )}. If you want, I can open pricing so you see the full comparison.`
            : "For plan and pricing detail, open the pricing window. That is where the comparison is clearest.",
      suggestions:
        language === "sq"
          ? ["Hap pricing", "Cili plan me pershtatet?", "Krahaso Starter dhe Professional"]
          : ["Open pricing", "Which plan fits me?", "Compare Starter and Professional"],
    };
  }

  if (
    normalized.includes("login") ||
    normalized.includes("access") ||
    normalized.includes("account") ||
    normalized.includes("log in") ||
    normalized.includes("hyr")
  ) {
    return {
      nextAction: "access" as const,
      reply:
        language === "sq"
          ? "Login ka me shume kuptim pasi ta kesh te qarte pajisjen dhe planin. Kur je gati, hape buyer login si hap i vecante dhe vazhdo me lane-in qe e zgjodhem."
          : "Login makes the most sense once the device and plan are already clear. When you are ready, open buyer login as a separate step and continue with the lane we selected.",
      suggestions:
        language === "sq"
          ? ["Hap buyer login", "Shfaq produktet", "Hap pricing"]
          : ["Open buyer login", "Show products", "Open pricing"],
    };
  }

  if (
    normalized.includes("sector") ||
    normalized.includes("lane") ||
    normalized.includes("business") ||
    normalized.includes("health") ||
    normalized.includes("commercial") ||
    normalized.includes("industry") ||
    normalized.includes("sektor")
  ) {
    return {
      nextAction: "sectors" as const,
      reply:
        language === "sq"
          ? `Sektori aktiv tani eshte ${sector?.name ?? "i pa zgjedhur"}. Ketu ka rendesi me lidh pajisjen, buyer flow dhe planin ne te njejtin lane para se te vazhdosh.`
          : `The active sector right now is ${sector?.name ?? "not selected"}. Here it matters to keep the device, buyer flow, and plan inside the same lane before moving on.`,
      suggestions:
        language === "sq"
          ? ["Hap solutions", "Cila pajisje shkon ketu?", "Hap pricing"]
          : ["Open solutions", "Which device fits here?", "Open pricing"],
    };
  }

  if (
    normalized.includes("device") ||
    normalized.includes("product") ||
    normalized.includes("setup") ||
    normalized.includes("install") ||
    normalized.includes("port") ||
    normalized.includes("pajis")
  ) {
    const portPreview = device?.ports.slice(0, 3).join(", ");

    return {
      nextAction: "devices" as const,
      reply:
        language === "sq"
          ? `${device?.name ?? "Pajisja aktive"} eshte vendi i duhur nese don proof real. ${
              portPreview ? `Ka portat ${portPreview}. ` : ""
            }Hape product stage dhe shiko runtime board-in, audience fit dhe setup-in.`
          : `${device?.name ?? "The active device"} is the right place if you want more concrete proof. ${
              portPreview ? `It exposes ${portPreview}. ` : ""
            }Open the product stage and review the runtime board, audience fit, and setup.`,
      suggestions:
        language === "sq"
          ? ["Hap produktet", "A pershtatet per sektorin?", "Hap pricing"]
          : ["Open products", "Does it fit this sector?", "Open pricing"],
    };
  }

  if (
    normalized.includes("support") ||
    normalized.includes("help") ||
    normalized.includes("ndihm") ||
    normalized.includes("kontakt")
  ) {
    return {
      nextAction: "help",
      reply:
        language === "sq"
          ? "Mund te rrim ketu per pyetje te shpejta, por pricing/help window eshte vendi ku e sheh krahasimin, limitet e planeve dhe guidat me qarte."
          : "I can stay here for quick guidance, but the pricing/help window is where you see the comparison, plan limits, and rollout guidance more clearly.",
      suggestions:
        language === "sq"
          ? ["Hap pricing", "Cili plan me pershtatet?", "Hap buyer login"]
          : ["Open pricing", "Which plan fits me?", "Open buyer login"],
    };
  }

  if (
    normalized.includes("thanks") ||
    normalized.includes("thank you") ||
    normalized.includes("flm") ||
    normalized.includes("falem")
  ) {
    return {
      nextAction: recommendedPlan ? "help" : "devices",
      reply:
        language === "sq"
          ? "Gjithmone. Nese don, vazhdojme me produktin, me krahasimin e planeve, ose e hapim login-in kur je gati."
          : "Any time. If you want, we can continue with the product, compare plans, or open login when you are ready.",
      suggestions: getDefaultSuggestions(language, device, sector),
    };
  }

  return {
    nextAction: recommendedPlan ? "help" : "devices",
    reply:
      language === "sq"
        ? recommendedPlan
          ? `Per kete kontekst, me duket mire me nis me ${recommendedPlan.name}, me pa ${device?.name ?? "pajisjen"} live, dhe pastaj me kalu ne pricing ose login.`
          : "Mund te te drejtoj te produktet, pricing, ose buyer login. Nise me pajisjen nese don me e pa faqen me real."
        : recommendedPlan
          ? `For this context, I would start with ${recommendedPlan.name}, keep ${device?.name ?? "the device"} visible, and then move into pricing or login.`
          : "I can point you to products, pricing, or buyer login. Start with the device view if you want the page to feel more concrete.",
    suggestions: getDefaultSuggestions(language, device, sector),
  };
}

export function FrontPageChatPopup({
  device,
  embedded = false,
  onNavigate,
  plans,
  sector,
}: FrontPageChatPopupProps) {
  const language = useMemo(() => getLanguage(), []);
  const [open, setOpen] = useState(embedded);
  const [input, setInput] = useState("");
  const [nextAction, setNextAction] = useState<
    "devices" | "access" | "help" | "sectors" | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isOpen = embedded || open;

  const welcomeMessage = useMemo(() => {
    if (language === "sq") {
      return device && sector
        ? `${device.name} eshte hapur per ${sector.name}. Mund te te ndihmoj me produktin, pricing ose buyer login.`
        : "Jam ne front page per me te drejtu te produktet, pricing ose buyer login.";
    }

    return device && sector
      ? `${device.name} is open for ${sector.name}. I can guide you to the product view, pricing, or buyer login.`
      : "I am here on the front page to guide you to products, pricing, or buyer login.";
  }, [device, language, sector]);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome",
      role: "assistant",
      text: welcomeMessage,
    },
  ]);

  const [suggestions, setSuggestions] = useState<string[]>(
    getDefaultSuggestions(language, device, sector),
  );

  useEffect(() => {
    setMessages((current) => {
      if (current.length !== 1 || current[0]?.id !== "welcome") {
        return current;
      }

      if (current[0].text === welcomeMessage) {
        return current;
      }

      return [{ ...current[0], text: welcomeMessage }];
    });
    setSuggestions(getDefaultSuggestions(language, device, sector));
  }, [device, language, sector, welcomeMessage]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, messages]);

  function handleNavigate(target: "devices" | "access" | "help" | "sectors") {
    onNavigate(target);
    setNextAction(null);
  }

  function sendMessage(messageText: string) {
    const trimmed = messageText.trim();

    if (!trimmed) {
      return;
    }

    const reply = createReply(trimmed, language, device, sector, plans);

    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-user`,
        role: "user",
        text: trimmed,
      },
      {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: reply.reply,
      },
    ]);
    setSuggestions(reply.suggestions);
    setNextAction(reply.nextAction);
    setInput("");
  }

  const teaser = language === "sq"
    ? "Pyet per produktin, planin ose login"
    : "Ask about product, plan, or login";
  const shellClassName = embedded
    ? "support-agent-shell support-agent-shell-embedded"
    : "support-agent-shell";
  const panelClassName = embedded
    ? "support-agent-panel support-agent-panel-embedded"
    : "support-agent-panel";

  return (
    <div className={shellClassName}>
      {!isOpen ? (
        <button
          className="support-agent-teaser"
          onClick={() => setOpen(true)}
          type="button"
        >
          <span className="support-agent-teaser-avatar">
            <MessageSquare className="h-4 w-4" />
          </span>
          <span className="support-agent-teaser-copy">
            <strong>{language === "sq" ? "brAIn front chat" : "brAIn front chat"}</strong>
            <span>{teaser}</span>
          </span>
        </button>
      ) : (
        <div className={panelClassName}>
          <div className="support-agent-header">
            <div className="support-agent-header-copy">
              <span className="support-agent-header-avatar">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <strong>brAIn front page chat</strong>
                <p>
                  {language === "sq"
                    ? "Pergjigje te shpejta per produktin, pricing dhe buyer flow"
                    : "Quick answers for product, pricing, and buyer flow"}
                </p>
              </div>
            </div>

            {!embedded ? (
              <button
                aria-label="Close front page chat"
                className="support-agent-close"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="support-agent-context">
            {sector?.name ? (
              <span className="support-agent-context-chip">{sector.name}</span>
            ) : null}
            {device?.name ? (
              <span className="support-agent-context-chip">{device.name}</span>
            ) : null}
            <span className="support-agent-context-chip">
              {language === "sq" ? "Front page" : "Front page"}
            </span>
          </div>

          <div className="support-agent-messages">
            {messages.map((message) => (
              <div
                className={`support-agent-bubble ${
                  message.role === "assistant"
                    ? "support-agent-bubble-assistant"
                    : "support-agent-bubble-user"
                }`}
                key={message.id}
              >
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="support-agent-chip-row">
            {suggestions.map((suggestion) => (
              <button
                className="support-agent-chip"
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {nextAction ? (
            <button
              className="support-agent-next-action"
              onClick={() => handleNavigate(nextAction)}
              type="button"
            >
              {nextAction === "devices"
                ? language === "sq"
                  ? "Hap produktet"
                  : "Open products"
                : nextAction === "access"
                  ? language === "sq"
                    ? "Hap buyer login"
                    : "Open buyer login"
                : nextAction === "sectors"
                    ? language === "sq"
                      ? "Hap solutions"
                      : "Open solutions"
                    : language === "sq"
                      ? embedded
                        ? "Hap help page"
                        : "Hap pricing"
                      : embedded
                        ? "Open help page"
                        : "Open pricing"}
            </button>
          ) : null}

          <form
            className="support-agent-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              className="support-agent-input"
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                language === "sq"
                  ? "Pyet cfare plani, cila pajisje, ose si vazhdohet..."
                  : "Ask which plan, which device, or how to continue..."
              }
              value={input}
            />
            <button className="support-agent-send" type="submit">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
