import { createHttpError, sanitizeText } from "./serviceHelpers.js";

const CHAT_TARGETS = ["devices", "access", "help", "plans", "sectors"];
const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_HISTORY_ITEMS = 10;
const MAX_MESSAGE_LENGTH = 1400;
const MAX_REPLY_LENGTH = 2200;

function clampText(value, maxLength = MAX_MESSAGE_LENGTH) {
  return sanitizeText(value).slice(0, maxLength);
}

function resolveLanguage(value) {
  return sanitizeText(value).toLowerCase().startsWith("sq") ? "sq" : "en";
}

function readList(value) {
  return Array.isArray(value) ? value : [];
}

function formatPrice(value, suffix) {
  const amount = Number(value ?? 0);
  return amount > 0 ? `EUR ${amount}/${suffix}` : "Free";
}

function summarizePlan(plan) {
  return [
    clampText(plan?.name, 80),
    clampText(plan?.summary, 220),
    `monthly: ${formatPrice(plan?.monthlyPrice, "mo")}`,
    `annual: ${formatPrice(plan?.annualPrice, "yr")}`,
    `devices: ${clampText(plan?.deviceAllowance, 80)}`,
    `support: ${clampText(plan?.supportLabel, 80)}`,
    `automation: ${clampText(plan?.automationLabel, 80)}`,
  ]
    .filter(Boolean)
    .join(" | ");
}

function summarizeContext(context = {}) {
  const device = context.device ?? {};
  const sector = context.sector ?? {};
  const plans = readList(context.plans).slice(0, 6);
  const devicePorts = readList(device.ports).slice(0, 5).join(", ");
  const deviceFit = readList(device.suitedFor).slice(0, 4).join(", ");
  const sectorCapabilities = readList(sector.capabilities).slice(0, 6).join(", ");
  const planLines = plans.map((plan) => `- ${summarizePlan(plan)}`).join("\n");

  return [
    `Active sector: ${clampText(sector.name, 80) || "not selected"}`,
    `Sector summary: ${clampText(sector.summary, 260) || "n/a"}`,
    `Sector audience: ${clampText(sector.audience, 180) || "n/a"}`,
    `Sector capabilities: ${sectorCapabilities || "n/a"}`,
    `Active device: ${clampText(device.name, 80) || "not selected"}`,
    `Device category: ${clampText(device.category, 80) || "n/a"}`,
    `Device tagline: ${clampText(device.tagline, 180) || "n/a"}`,
    `Device description: ${clampText(device.description, 320) || "n/a"}`,
    `Device ports: ${devicePorts || "n/a"}`,
    `Device fit: ${deviceFit || "n/a"}`,
    `Plans:\n${planLines || "- No plans loaded"}`,
  ].join("\n");
}

function toOpenAiHistory(history) {
  return readList(history)
    .filter((message) => message?.role === "user" || message?.role === "assistant")
    .slice(-MAX_HISTORY_ITEMS)
    .map((message) => ({
      role: message.role,
      content: clampText(message.text, 900),
    }))
    .filter((message) => message.content);
}

function inferNextAction(message) {
  const normalized = message.toLowerCase();

  if (/(login|access|account|hyr|kyc|buyer)/.test(normalized)) {
    return "access";
  }

  if (/(plan|price|pricing|cost|cmim|pages|token|starter|professional|enterprise)/.test(normalized)) {
    return "plans";
  }

  if (/(sector|solution|lane|business|health|commercial|industry|sektor)/.test(normalized)) {
    return "sectors";
  }

  if (/(device|product|setup|install|port|pajis|hardware)/.test(normalized)) {
    return "devices";
  }

  return "help";
}

function createSuggestions(language, nextAction) {
  const suggestionsByTarget = {
    sq: {
      devices: ["Cka ben pajisja?", "A pershtatet per sektorin?", "Hap produktet"],
      access: ["Si hapet buyer login?", "A me duhet llogari?", "Hap buyer login"],
      help: ["Me shpjego brAIn", "Cili hap vjen tani?", "Hap help"],
      plans: ["Cili plan me pershtatet?", "Krahaso planet", "Hap pricing"],
      sectors: ["Cili sektor me pershtatet?", "Shfaq solutions", "Cila pajisje shkon ketu?"],
    },
    en: {
      devices: ["What does the device do?", "Does it fit this sector?", "Open products"],
      access: ["How does buyer login work?", "Do I need an account?", "Open buyer login"],
      help: ["Explain brAIn", "What comes next?", "Open help"],
      plans: ["Which plan fits me?", "Compare plans", "Open pricing"],
      sectors: ["Which sector fits me?", "Show solutions", "Which device fits here?"],
    },
  };

  return suggestionsByTarget[language][CHAT_TARGETS.includes(nextAction) ? nextAction : "help"];
}

function createSetupReply(language) {
  return language === "sq"
    ? "AI real eshte gati ne kod, por mungon OPENAI_API_KEY ne backend. Shto celesin ne .env dhe une do te pergjigjem me model real per cdo pyetje."
    : "The real AI path is ready in the code, but OPENAI_API_KEY is missing on the backend. Add it to .env and I will answer with a real model for any question.";
}

function createSystemPrompt(language, context) {
  const languageName = language === "sq" ? "Albanian" : "English";

  return [
    "You are the brAIn AI assistant, a general helpful chat assistant inside the brAIn website.",
    "Respond naturally like a modern ChatGPT-style assistant: answer the user's actual question, keep context, and ask a short clarifying question only when needed.",
    `Use ${languageName} unless the user clearly switches language.`,
    "Use the product context when relevant, but do not force every answer into plans, tokens, devices, or login.",
    "Do not invent unavailable facts. If a specific price, feature, contact detail, or policy is not in context, say what is known and what is missing.",
    "Use plain text only. Keep answers useful and conversational, not button-like or scripted.",
    "",
    "Current brAIn context:",
    context,
  ].join("\n");
}

function extractOpenAiText(payload) {
  return clampText(payload?.choices?.[0]?.message?.content, MAX_REPLY_LENGTH);
}

export async function createFrontPageChatReply(payload = {}) {
  const message = clampText(payload.message);
  const language = resolveLanguage(payload.language);
  const nextAction = inferNextAction(message);
  const suggestions = createSuggestions(language, nextAction);

  if (!message) {
    throw createHttpError("Message is required.", 400);
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      nextAction,
      reply: createSetupReply(language),
      source: "setup",
      suggestions,
    };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: createSystemPrompt(language, summarizeContext(payload.context)),
        },
        ...toOpenAiHistory(payload.history),
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 650,
      temperature: 0.45,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const providerMessage = clampText(data?.error?.message, 180);
    throw createHttpError(
      providerMessage
        ? `AI provider error: ${providerMessage}`
        : "AI provider did not return a valid response.",
      response.status === 401 ? 500 : 502,
    );
  }

  return {
    nextAction,
    reply: extractOpenAiText(data) || createSetupReply(language),
    source: "openai",
    suggestions,
  };
}
