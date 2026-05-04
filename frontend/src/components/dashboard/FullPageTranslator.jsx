import { useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  getMachineTranslationLanguageCode,
  MACHINE_TRANSLATION_LANGUAGE_CODES,
} from "../i18n/translations";

const TRANSLATE_SCRIPT_ID = "google-translate-script";
const TRANSLATE_CONTAINER_ID = "google_translate_element";
const TRANSLATE_COOKIE_NAME = "googtrans";
const SOURCE_LANGUAGE = "en";
const TRANSLATE_SCRIPT_URL =
  "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
const TRANSLATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const APPLY_RETRY_DELAY_MS = 250;
const APPLY_RETRY_LIMIT = 40;
const INCLUDED_LANGUAGES = MACHINE_TRANSLATION_LANGUAGE_CODES.filter(
  (code) => code !== SOURCE_LANGUAGE
).join(",");
const HIDDEN_TRANSLATE_BOX_STYLE = {
  position: "fixed",
  left: "-9999px",
  top: 0,
  opacity: 0,
  pointerEvents: "none",
};

let translateScriptPromise = null;

function isLocalHostname(hostname) {
  return (
    !hostname ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
  );
}

function getCookieDomain(hostname) {
  if (isLocalHostname(hostname)) {
    return null;
  }

  return `.${hostname}`;
}

function writeGoogleTranslateCookie(value, maxAge) {
  const domain = getCookieDomain(window.location.hostname);
  const baseCookie = `${TRANSLATE_COOKIE_NAME}=${value};path=/;max-age=${maxAge};SameSite=Lax`;

  document.cookie = baseCookie;

  if (domain) {
    document.cookie = `${baseCookie};domain=${domain}`;
  }
}

function setGoogleTranslateCookie(targetLanguage) {
  writeGoogleTranslateCookie(`/${SOURCE_LANGUAGE}/${targetLanguage}`, TRANSLATE_COOKIE_MAX_AGE);
}

function clearGoogleTranslateCookie() {
  writeGoogleTranslateCookie("", 0);
}

function ensureTranslateElement() {
  if (!window.google?.translate?.TranslateElement) {
    return;
  }

  const container = document.getElementById(TRANSLATE_CONTAINER_ID);

  if (!container || container.dataset.initialized === "true") {
    return;
  }

  new window.google.translate.TranslateElement(
    {
      pageLanguage: SOURCE_LANGUAGE,
      autoDisplay: false,
      includedLanguages: INCLUDED_LANGUAGES,
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
    },
    TRANSLATE_CONTAINER_ID
  );

  container.dataset.initialized = "true";
}

function loadGoogleTranslate() {
  if (window.google?.translate?.TranslateElement) {
    ensureTranslateElement();
    return Promise.resolve();
  }

  if (translateScriptPromise) {
    return translateScriptPromise;
  }

  translateScriptPromise = new Promise((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      try {
        ensureTranslateElement();
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    const existingScript = document.getElementById(TRANSLATE_SCRIPT_ID);

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.id = TRANSLATE_SCRIPT_ID;
    script.src = TRANSLATE_SCRIPT_URL;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Translate."));
    document.body.appendChild(script);
  });

  return translateScriptPromise;
}

function applyTranslatedLanguage(targetLanguage) {
  const languageSelect = document.querySelector(".goog-te-combo");

  if (!languageSelect) {
    return false;
  }

  setGoogleTranslateCookie(targetLanguage);
  languageSelect.value = targetLanguage;
  languageSelect.dispatchEvent(new Event("change"));
  return true;
}

export default function FullPageTranslator() {
  const { language } = useLanguage();
  const retryTimeoutRef = useRef(0);
  const targetLanguage = getMachineTranslationLanguageCode(language);

  useEffect(() => {
    window.clearTimeout(retryTimeoutRef.current);

    if (targetLanguage === SOURCE_LANGUAGE) {
      clearGoogleTranslateCookie();
      return undefined;
    }

    let isCancelled = false;

    const applyTranslation = (attempt = 0) => {
      if (isCancelled) {
        return;
      }

      if (applyTranslatedLanguage(targetLanguage)) {
        return;
      }

      if (attempt >= APPLY_RETRY_LIMIT) {
        return;
      }

      retryTimeoutRef.current = window.setTimeout(
        () => applyTranslation(attempt + 1),
        APPLY_RETRY_DELAY_MS
      );
    };

    setGoogleTranslateCookie(targetLanguage);
    loadGoogleTranslate()
      .then(() => {
        applyTranslation();
      })
      .catch(() => {
        clearGoogleTranslateCookie();
      });

    return () => {
      isCancelled = true;
      window.clearTimeout(retryTimeoutRef.current);
    };
  }, [targetLanguage]);

  return (
    <div
      id={TRANSLATE_CONTAINER_ID}
      aria-hidden="true"
      style={HIDDEN_TRANSLATE_BOX_STYLE}
    />
  );
}
