import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Send, Sparkles, X } from "lucide-react";
import { askFrontPageChat, getRequestErrorMessage } from "../services/api";
import type { Device, Plan, Sector } from "../types";
import {
  formatPlanLimit,
  parsePlanDeviceLimit,
  parsePlanTokenLimit,
  resolveRecommendedPlan,
} from "../utils/planInsights";

type MessageItem = {
  id: string;
  pending?: boolean;
  role: "assistant" | "user";
  text: string;
};

type FrontPageChatPopupProps = {
  device: Device | null;
  embedded?: boolean;
  plans: Plan[];
  sector: Sector | null;
};

type ChatReply = {
  nextAction: "devices" | "access" | "help" | "plans" | "sectors";
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
      nextAction: "plans",
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
      nextAction: "plans" as const,
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
      nextAction: "plans",
      reply:
        language === "sq"
          ? "Mund te pergjigjem ketu direkt. Per cmime, krahasim dhe token limits, hape pjesen e planeve ne landing ose help-in per pyetje me te gjata."
          : "I can answer directly here. For pricing, comparison, and token limits, open the plan section on the landing page or the help page for deeper questions.",
      suggestions:
        language === "sq"
          ? ["Hap planet", "Cili plan me pershtatet?", "Hap help"]
          : ["Open plans", "Which plan fits me?", "Open help"],
    };
  }

  if (
    normalized.includes("about") ||
    normalized.includes("company") ||
    normalized.includes("platform") ||
    normalized.includes("kush") ||
    normalized.includes("rreth")
  ) {
    return {
      nextAction: "help",
      reply:
        language === "sq"
          ? "brAIn eshte platforme me pajisje fizike plus software: e vendos pajisjen ne ambient, e lidh me cloud, pastaj menaxhon sektorin, planin, tokenat dhe aktivizimin prej portalit."
          : "brAIn is a hardware plus software platform: place the device on site, connect it to the cloud, then manage the sector, plan, tokens, and activation from the portal.",
      suggestions:
        language === "sq"
          ? ["Hap help", "Cfare ben pajisja?", "Hap buyer login"]
          : ["Open help", "What does the device do?", "Open buyer login"],
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
    nextAction: "help",
    reply:
      language === "sq"
        ? `Mund te pyesesh cfare te duash ketu. Nese pyetja lidhet me brAIn, e perdor kontekstin aktiv: ${device?.name ?? "pajisja"} / ${sector?.name ?? "sektori"}${
            recommendedPlan ? ` / ${recommendedPlan.name}` : ""
          }. Nese pyetja eshte jashte produktit, pergjigjem si asistent i lire dhe ta mbaj biseden ne kontekst.`
        : `You can ask anything here. If it is about brAIn, I will use the active context: ${device?.name ?? "device"} / ${sector?.name ?? "sector"}${
            recommendedPlan ? ` / ${recommendedPlan.name}` : ""
          }. If it is outside the product, I will answer like a free-form assistant and keep the conversation context.`,
    suggestions:
      language === "sq"
        ? ["Shpjegoje thjesht", "Me jep hapat", "Kthehu te brAIn"]
        : ["Explain it simply", "Give me the steps", "Back to brAIn"],
  };
}

export function FrontPageChatPopup({
  device,
  embedded = false,
  plans,
  sector,
}: FrontPageChatPopupProps) {
  const language = useMemo(() => getLanguage(), []);
  const [open, setOpen] = useState(embedded);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isOpen = embedded || open;

  const welcomeMessage = useMemo(() => {
    if (language === "sq") {
      return device && sector
        ? `${device.name} eshte hapur per ${sector.name}. Pyet cfare te duash — per brAIn, kod, ide, plan, ose hapa konkrete.`
        : "Jam ketu si chat i lire. Pyet cfare te duash dhe e mbaj biseden ne kontekst.";
    }

    return device && sector
      ? `${device.name} is open for ${sector.name}. Ask anything — brAIn, code, ideas, plans, or concrete next steps.`
      : "I am here as a free-form chat. Ask anything and I will keep the conversation in context.";
  }, [device, language, sector]);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome",
      role: "assistant",
      text: welcomeMessage,
    },
  ]);

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
  }, [device, language, sector, welcomeMessage]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, messages]);

  async function sendMessage(messageText: string) {
    const trimmed = messageText.trim();

    if (!trimmed || loading) {
      return;
    }

    const localReply = createReply(trimmed, language, device, sector, plans);
    const userMessage: MessageItem = {
      id: `${Date.now()}-user`,
      role: "user",
      text: trimmed,
    };
    const assistantMessageId = `${Date.now()}-assistant`;
    const pendingMessage: MessageItem = {
      id: assistantMessageId,
      pending: true,
      role: "assistant",
      text: language === "sq" ? "Po mendoj..." : "Thinking...",
    };
    const chatHistory = messages
      .filter((message) => !message.pending)
      .slice(-8)
      .map((message) => ({
        role: message.role,
        text: message.text,
      }));

    setMessages((current) => [
      ...current,
      userMessage,
      pendingMessage,
    ]);
    setStatusMessage("");
    setInput("");
    setLoading(true);

    try {
      const aiReply = await askFrontPageChat({
        context: {
          device,
          plans,
          sector,
        },
        history: chatHistory,
        language,
        message: trimmed,
      });

      const resolvedReply =
        aiReply.source === "setup" ? localReply.reply : aiReply.reply || localReply.reply;

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                pending: false,
                text: resolvedReply,
              }
            : message,
        ),
      );

      if (aiReply.source === "setup") {
        setStatusMessage(
          language === "sq"
            ? "Live AI nuk eshte lidhur ende, prandaj po perdor pergjigje lokale."
            : "Live AI is not connected yet, so local answers are active.",
        );
      }
    } catch (error) {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                pending: false,
                text: localReply.reply,
              }
            : message,
        ),
      );
      setStatusMessage(
        getRequestErrorMessage(
          error,
          language === "sq"
            ? "AI nuk u lidh tani, prandaj u perdor pergjigjja lokale."
            : "AI could not connect right now, so the local reply was used.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  const teaser = language === "sq"
    ? "Pyet cfare te duash"
    : "Ask anything";
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
                <strong>brAIn Chat</strong>
                <p>
                  {language === "sq"
                    ? "Asistent i lire, si ChatGPT"
                    : "Free-form assistant, ChatGPT-style"}
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

          <div className="support-agent-messages">
            {messages.map((message) => (
              <div
                className={`support-agent-bubble ${
                  message.role === "assistant"
                    ? "support-agent-bubble-assistant"
                    : "support-agent-bubble-user"
                } ${message.pending ? "support-agent-bubble-pending" : ""}`}
                key={message.id}
              >
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

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
                  ? "Pyet cfare te duash..."
                  : "Ask anything..."
              }
              disabled={loading}
              value={input}
            />
            <button className="support-agent-send" disabled={loading} type="submit">
              <Send className="h-4 w-4" />
            </button>
          </form>
          {statusMessage ? <p className="support-agent-status">{statusMessage}</p> : null}
        </div>
      )}
    </div>
  );
}
