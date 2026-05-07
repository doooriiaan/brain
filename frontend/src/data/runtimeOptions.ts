export type LanguageOption = {
  code: string;
  label: string;
  translateCode: string;
};

export type CountryOption = {
  code: string;
  label: string;
  currency: string;
  region: string;
};

export const languageOptions: LanguageOption[] = [
  { code: "en", label: "English", translateCode: "en" },
  { code: "sq", label: "Shqip", translateCode: "sq" },
  { code: "de", label: "Deutsch", translateCode: "de" },
  { code: "fr", label: "Francais", translateCode: "fr" },
  { code: "it", label: "Italiano", translateCode: "it" },
  { code: "es", label: "Espanol", translateCode: "es" },
  { code: "pt", label: "Portugues", translateCode: "pt" },
  { code: "nl", label: "Nederlands", translateCode: "nl" },
  { code: "pl", label: "Polski", translateCode: "pl" },
  { code: "cs", label: "Cestina", translateCode: "cs" },
  { code: "ro", label: "Romana", translateCode: "ro" },
  { code: "hu", label: "Magyar", translateCode: "hu" },
  { code: "tr", label: "Turkce", translateCode: "tr" },
  { code: "el", label: "Ellinika", translateCode: "el" },
  { code: "sv", label: "Svenska", translateCode: "sv" },
  { code: "no", label: "Norsk", translateCode: "no" },
  { code: "da", label: "Dansk", translateCode: "da" },
  { code: "fi", label: "Suomi", translateCode: "fi" },
  { code: "uk", label: "Ukrainian", translateCode: "uk" },
  { code: "ru", label: "Russian", translateCode: "ru" },
  { code: "ar", label: "Arabic", translateCode: "ar" },
  { code: "he", label: "Hebrew", translateCode: "iw" },
  { code: "fa", label: "Farsi", translateCode: "fa" },
  { code: "hi", label: "Hindi", translateCode: "hi" },
  { code: "bn", label: "Bangla", translateCode: "bn" },
  { code: "ur", label: "Urdu", translateCode: "ur" },
  { code: "zh", label: "Chinese", translateCode: "zh-CN" },
  { code: "ja", label: "Japanese", translateCode: "ja" },
  { code: "ko", label: "Korean", translateCode: "ko" },
  { code: "th", label: "Thai", translateCode: "th" },
  { code: "vi", label: "Vietnamese", translateCode: "vi" },
  { code: "id", label: "Bahasa Indonesia", translateCode: "id" },
  { code: "ms", label: "Bahasa Melayu", translateCode: "ms" },
  { code: "tl", label: "Tagalog", translateCode: "tl" },
  { code: "bg", label: "Bulgarian", translateCode: "bg" },
  { code: "sk", label: "Slovak", translateCode: "sk" },
  { code: "lt", label: "Lithuanian", translateCode: "lt" },
  { code: "lv", label: "Latvian", translateCode: "lv" },
  { code: "et", label: "Estonian", translateCode: "et" },
  { code: "mk", label: "Macedonian", translateCode: "mk" },
  { code: "bs", label: "Bosnian", translateCode: "bs" },
  { code: "ca", label: "Catalan", translateCode: "ca" },
  { code: "ga", label: "Irish", translateCode: "ga" },
  { code: "is", label: "Icelandic", translateCode: "is" },
  { code: "mt", label: "Maltese", translateCode: "mt" },
  { code: "sw", label: "Swahili", translateCode: "sw" },
  { code: "af", label: "Afrikaans", translateCode: "af" },
  { code: "am", label: "Amharic", translateCode: "am" },
  { code: "hy", label: "Armenian", translateCode: "hy" },
  { code: "ka", label: "Georgian", translateCode: "ka" },
  { code: "az", label: "Azerbaijani", translateCode: "az" },
  { code: "kk", label: "Kazakh", translateCode: "kk" },
  { code: "uz", label: "Uzbek", translateCode: "uz" },
  { code: "ta", label: "Tamil", translateCode: "ta" },
  { code: "te", label: "Telugu", translateCode: "te" },
  { code: "ml", label: "Malayalam", translateCode: "ml" },
  { code: "mr", label: "Marathi", translateCode: "mr" },
  { code: "gu", label: "Gujarati", translateCode: "gu" },
  { code: "kn", label: "Kannada", translateCode: "kn" },
  { code: "pa", label: "Punjabi", translateCode: "pa" },
  { code: "ne", label: "Nepali", translateCode: "ne" },
  { code: "si", label: "Sinhala", translateCode: "si" },
  { code: "km", label: "Khmer", translateCode: "km" },
  { code: "lo", label: "Lao", translateCode: "lo" },
  { code: "my", label: "Myanmar", translateCode: "my" },
  { code: "sr", label: "Srpski", translateCode: "sr" },
  { code: "hr", label: "Hrvatski", translateCode: "hr" },
  { code: "sl", label: "Slovenscina", translateCode: "sl" },
];

export const countryOptions: CountryOption[] = [
  { code: "XK", label: "Kosovo", currency: "EUR", region: "Europe" },
  { code: "AL", label: "Albania", currency: "ALL", region: "Europe" },
  { code: "DE", label: "Germany", currency: "EUR", region: "Europe" },
  { code: "CH", label: "Switzerland", currency: "CHF", region: "Europe" },
  { code: "AT", label: "Austria", currency: "EUR", region: "Europe" },
  { code: "GB", label: "United Kingdom", currency: "GBP", region: "Europe" },
  { code: "FR", label: "France", currency: "EUR", region: "Europe" },
  { code: "IT", label: "Italy", currency: "EUR", region: "Europe" },
  { code: "ES", label: "Spain", currency: "EUR", region: "Europe" },
  { code: "NL", label: "Netherlands", currency: "EUR", region: "Europe" },
  { code: "SE", label: "Sweden", currency: "SEK", region: "Europe" },
  { code: "NO", label: "Norway", currency: "NOK", region: "Europe" },
  { code: "DK", label: "Denmark", currency: "DKK", region: "Europe" },
  { code: "PL", label: "Poland", currency: "PLN", region: "Europe" },
  { code: "RO", label: "Romania", currency: "RON", region: "Europe" },
  { code: "HU", label: "Hungary", currency: "HUF", region: "Europe" },
  { code: "US", label: "United States", currency: "USD", region: "Americas" },
  { code: "CA", label: "Canada", currency: "CAD", region: "Americas" },
  { code: "MX", label: "Mexico", currency: "MXN", region: "Americas" },
  { code: "BR", label: "Brazil", currency: "BRL", region: "Americas" },
  { code: "AR", label: "Argentina", currency: "ARS", region: "Americas" },
  { code: "AE", label: "United Arab Emirates", currency: "AED", region: "Middle East" },
  { code: "SA", label: "Saudi Arabia", currency: "SAR", region: "Middle East" },
  { code: "TR", label: "Turkey", currency: "TRY", region: "Middle East" },
  { code: "IL", label: "Israel", currency: "ILS", region: "Middle East" },
  { code: "IN", label: "India", currency: "INR", region: "Asia" },
  { code: "CN", label: "China", currency: "CNY", region: "Asia" },
  { code: "JP", label: "Japan", currency: "JPY", region: "Asia" },
  { code: "KR", label: "South Korea", currency: "KRW", region: "Asia" },
  { code: "TH", label: "Thailand", currency: "THB", region: "Asia" },
  { code: "VN", label: "Vietnam", currency: "VND", region: "Asia" },
  { code: "SG", label: "Singapore", currency: "SGD", region: "Asia" },
  { code: "MY", label: "Malaysia", currency: "MYR", region: "Asia" },
  { code: "AU", label: "Australia", currency: "AUD", region: "Oceania" },
  { code: "NZ", label: "New Zealand", currency: "NZD", region: "Oceania" },
  { code: "ZA", label: "South Africa", currency: "ZAR", region: "Africa" },
  { code: "EG", label: "Egypt", currency: "EGP", region: "Africa" },
  { code: "NG", label: "Nigeria", currency: "NGN", region: "Africa" },
];

export const sectorOptions = [
  { value: "commercial", label: "Commercial AI" },
  { value: "business", label: "Business AI" },
  { value: "healthcare", label: "Healthcare AI" },
  { value: "industry", label: "Industry 4.0 AI" },
] as const;

export const planOptions = [
  { value: "starter", label: "Starter" },
  { value: "professional", label: "Professional" },
  { value: "business", label: "Business" },
  { value: "platinum", label: "Platinum" },
  { value: "platinum-plus", label: "Platinum+" },
] as const;

export const deviceOptions = [
  {
    value: "ai-stick",
    label: "brAIn AI Stick",
    sector: "commercial",
  },
  {
    value: "business-hub",
    label: "brAIn Business Hub",
    sector: "business",
  },
  {
    value: "med-assistant",
    label: "brAIn MED Assistant",
    sector: "healthcare",
  },
  {
    value: "industry-edge",
    label: "brAIn Industry Edge",
    sector: "industry",
  },
] as const;

const countryLanguageFallbacks: Record<string, string> = {
  XK: "sq",
  AL: "sq",
  DE: "de",
  CH: "de",
  AT: "de",
  GB: "en",
  FR: "fr",
  IT: "it",
  ES: "es",
  NL: "nl",
  SE: "sv",
  NO: "no",
  DK: "da",
  PL: "pl",
  RO: "ro",
  HU: "hu",
  US: "en",
  CA: "en",
  MX: "es",
  BR: "pt",
  AR: "es",
  AE: "ar",
  SA: "ar",
  TR: "tr",
  IL: "he",
  IN: "hi",
  CN: "zh",
  JP: "ja",
  KR: "ko",
  TH: "th",
  VN: "vi",
  SG: "en",
  MY: "ms",
  AU: "en",
  NZ: "en",
  ZA: "en",
  EG: "ar",
  NG: "en",
};

export function getFallbackLanguageForCountry(countryCode: string) {
  return countryLanguageFallbacks[countryCode] || "en";
}

export function resolveLanguageCode(languageCode?: string | null) {
  if (!languageCode) {
    return null;
  }

  const normalizedCode = languageCode.toLowerCase();
  const directMatch = languageOptions.find(
    (language) =>
      language.code.toLowerCase() === normalizedCode ||
      language.translateCode.toLowerCase() === normalizedCode,
  );

  return directMatch?.code || null;
}

export function getTranslateLanguageCode(languageCode: string) {
  return (
    languageOptions.find((language) => language.code === languageCode)
      ?.translateCode || "en"
  );
}
