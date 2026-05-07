import { useEffect, useMemo, useRef } from "react";
import {
  getTranslateLanguageCode,
  languageOptions,
} from "../data/runtimeOptions";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

const SCRIPT_ID = "brain-google-translate-script";
const CONTAINER_ID = "brain-google-translate-host";
const COOKIE_NAME = "googtrans";
const SOURCE_LANGUAGE = "en";
const RETRY_LIMIT = 30;
const RETRY_DELAY_MS = 250;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const HIDDEN_TRANSLATE_BOX_STYLE = {
  position: "fixed",
  left: "-9999px",
  top: 0,
  opacity: 0,
  pointerEvents: "none",
} as const;

let translateLoader: Promise<void> | null = null;

function isLocalHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
  );
}

function writeTranslateCookie(value: string, maxAge: number) {
  const domain = isLocalHost(window.location.hostname)
    ? ""
    : `;domain=.${window.location.hostname}`;
  const base = `${COOKIE_NAME}=${value};path=/;max-age=${maxAge};SameSite=Lax`;

  document.cookie = base;

  if (domain) {
    document.cookie = `${base}${domain}`;
  }
}

function clearTranslateCookie() {
  writeTranslateCookie("", 0);
}

function setTranslateCookie(targetLanguage: string) {
  writeTranslateCookie(`/${SOURCE_LANGUAGE}/${targetLanguage}`, COOKIE_MAX_AGE);
}

function ensureTranslateElement(includedLanguages: string) {
  const translateApi = window.google?.translate;
  const TranslateElement = translateApi?.TranslateElement;

  if (!TranslateElement) {
    return;
  }

  const container = document.getElementById(CONTAINER_ID);

  if (!container || container.dataset.ready === "true") {
    return;
  }

  const layout = translateApi.TranslateElement.InlineLayout.SIMPLE;

  new TranslateElement(
    {
      pageLanguage: SOURCE_LANGUAGE,
      autoDisplay: false,
      includedLanguages,
      layout,
    },
    CONTAINER_ID,
  );

  container.dataset.ready = "true";
}

function loadTranslateScript(includedLanguages: string) {
  if (window.google?.translate?.TranslateElement) {
    ensureTranslateElement(includedLanguages);
    return Promise.resolve();
  }

  if (translateLoader) {
    return translateLoader;
  }

  translateLoader = new Promise((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      try {
        ensureTranslateElement(includedLanguages);
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    const existingScript = document.getElementById(SCRIPT_ID);

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () =>
      reject(new Error("Google Translate could not be loaded."));
    document.body.appendChild(script);
  });

  return translateLoader;
}

function applyTranslatedLanguage(targetLanguage: string) {
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");

  if (!combo) {
    return false;
  }

  setTranslateCookie(targetLanguage);
  combo.value = targetLanguage;
  combo.dispatchEvent(new Event("change"));
  return true;
}

type GoogleTranslateBridgeProps = {
  languageCode: string;
};

export function GoogleTranslateBridge({
  languageCode,
}: GoogleTranslateBridgeProps) {
  const retryTimeoutRef = useRef<number | null>(null);
  const targetLanguage = getTranslateLanguageCode(languageCode);
  const includedLanguages = useMemo(
    () =>
      Array.from(
        new Set(
          languageOptions
            .map((language) => language.translateCode)
            .filter((code) => code !== SOURCE_LANGUAGE),
        ),
      ).join(","),
    [],
  );

  useEffect(() => {
    document.documentElement.lang = languageCode;

    if (retryTimeoutRef.current) {
      window.clearTimeout(retryTimeoutRef.current);
    }

    if (targetLanguage === SOURCE_LANGUAGE) {
      clearTranslateCookie();
      return undefined;
    }

    let cancelled = false;

    const applyWithRetry = (attempt = 0) => {
      if (cancelled) {
        return;
      }

      if (applyTranslatedLanguage(targetLanguage)) {
        return;
      }

      if (attempt >= RETRY_LIMIT) {
        return;
      }

      retryTimeoutRef.current = window.setTimeout(() => {
        applyWithRetry(attempt + 1);
      }, RETRY_DELAY_MS);
    };

    setTranslateCookie(targetLanguage);

    loadTranslateScript(includedLanguages)
      .then(() => {
        applyWithRetry();
      })
      .catch(() => {
        clearTranslateCookie();
      });

    return () => {
      cancelled = true;

      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [includedLanguages, languageCode, targetLanguage]);

  return (
    <div
      aria-hidden="true"
      className="translate-host"
      id={CONTAINER_ID}
      style={HIDDEN_TRANSLATE_BOX_STYLE}
    />
  );
}
