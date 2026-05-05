/**
 * Country-to-language mapping service
 * Automatically suggests language based on country selection
 */

export const countryLanguageMap = {
  GB: "en",
  DE: "de",
  FR: "fr",
  ES: "es",
  IT: "it",
  NL: "nl",
  BE: "nl",
  PT: "pt",
  GR: "el",
  PL: "pl",
  SE: "sv",
  NO: "no",
  DK: "da",
  FI: "fi",
  CZ: "cs",
  RO: "ro",
  HU: "hu",
  AT: "de",
  CH: "de",
  XK: "sq",
  AL: "sq",
  US: "en",
  CA: "en",
  MX: "es",
  BR: "pt",
  AR: "es",
  CO: "es",
  PE: "es",
  CL: "es",
  CN: "zh",
  JP: "ja",
  KR: "ko",
  IN: "hi",
  ID: "id",
  TH: "th",
  VN: "vi",
  PH: "tl",
  SG: "en",
  MY: "ms",
  SA: "ar",
  AE: "ar",
  IL: "he",
  TR: "tr",
  EG: "ar",
  ZA: "en",
  NG: "en",
  AU: "en",
  NZ: "en",
};

export const languageToNativeNames = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
  pt: "Português",
  el: "Ελληνικά",
  pl: "Polski",
  sv: "Svenska",
  no: "Norsk",
  da: "Dansk",
  fi: "Suomi",
  cs: "Čeština",
  ro: "Română",
  hu: "Magyar",
  sq: "Shqip",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  hi: "हिन्दी",
  id: "Bahasa Indonesia",
  th: "ไทย",
  vi: "Tiếng Việt",
  tl: "Tagalog",
  ms: "Bahasa Melayu",
  ar: "العربية",
  he: "עברית",
  tr: "Türkçe",
};

export function getLanguageFromCountry(countryCode) {
  return countryLanguageMap[countryCode] || "en";
}

export function getLanguageNativeName(languageCode) {
  return languageToNativeNames[languageCode] || languageCode.toUpperCase();
}

export function isValidCountryCode(code) {
  return code in countryLanguageMap;
}

export function getCountriesByRegion() {
  return {
    europe: [
      { code: "GB", name: "United Kingdom", language: "English" },
      { code: "DE", name: "Germany", language: "Deutsch" },
      { code: "FR", name: "France", language: "Français" },
      { code: "ES", name: "Spain", language: "Español" },
      { code: "IT", name: "Italy", language: "Italiano" },
      { code: "NL", name: "Netherlands", language: "Nederlands" },
      { code: "BE", name: "Belgium", language: "Nederlands" },
      { code: "PT", name: "Portugal", language: "Português" },
      { code: "GR", name: "Greece", language: "Ελληνικά" },
      { code: "PL", name: "Poland", language: "Polski" },
      { code: "SE", name: "Sweden", language: "Svenska" },
      { code: "NO", name: "Norway", language: "Norsk" },
      { code: "DK", name: "Denmark", language: "Dansk" },
      { code: "FI", name: "Finland", language: "Suomi" },
      { code: "CZ", name: "Czech Republic", language: "Čeština" },
      { code: "RO", name: "Romania", language: "Română" },
      { code: "HU", name: "Hungary", language: "Magyar" },
      { code: "AT", name: "Austria", language: "Deutsch" },
      { code: "CH", name: "Switzerland", language: "Deutsch" },
      { code: "XK", name: "Kosovo", language: "Shqip" },
      { code: "AL", name: "Albania", language: "Shqip" },
    ],
    americas: [
      { code: "US", name: "United States", language: "English" },
      { code: "CA", name: "Canada", language: "English" },
      { code: "MX", name: "Mexico", language: "Español" },
      { code: "BR", name: "Brazil", language: "Português" },
      { code: "AR", name: "Argentina", language: "Español" },
      { code: "CO", name: "Colombia", language: "Español" },
      { code: "PE", name: "Peru", language: "Español" },
      { code: "CL", name: "Chile", language: "Español" },
    ],
    asia: [
      { code: "CN", name: "China", language: "中文" },
      { code: "JP", name: "Japan", language: "日本語" },
      { code: "KR", name: "South Korea", language: "한국어" },
      { code: "IN", name: "India", language: "हिन्दी" },
      { code: "ID", name: "Indonesia", language: "Bahasa Indonesia" },
      { code: "TH", name: "Thailand", language: "ไทย" },
      { code: "VN", name: "Vietnam", language: "Tiếng Việt" },
      { code: "PH", name: "Philippines", language: "Tagalog" },
      { code: "SG", name: "Singapore", language: "English" },
      { code: "MY", name: "Malaysia", language: "Bahasa Melayu" },
    ],
    middleEast: [
      { code: "SA", name: "Saudi Arabia", language: "العربية" },
      { code: "AE", name: "United Arab Emirates", language: "العربية" },
      { code: "IL", name: "Israel", language: "עברית" },
      { code: "TR", name: "Turkey", language: "Türkçe" },
    ],
    africa: [
      { code: "EG", name: "Egypt", language: "العربية" },
      { code: "ZA", name: "South Africa", language: "English" },
      { code: "NG", name: "Nigeria", language: "English" },
    ],
    oceania: [
      { code: "AU", name: "Australia", language: "English" },
      { code: "NZ", name: "New Zealand", language: "English" },
    ],
  };
}
