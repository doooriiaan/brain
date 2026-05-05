import {
  getCountriesByRegion,
  getLanguageFromCountry,
  getLanguageNativeName,
  isValidCountryCode,
} from "../services/localizationService.js";
import { createHttpError } from "../services/serviceHelpers.js";
import {
  controller,
  readBodyText,
  readParamText,
} from "./controllerUtils.js";

export const getCountriesByRegionRequest = controller((_request, response) => {
  response.json({
    countries: getCountriesByRegion(),
  });
});

export const getLanguageFromCountryRequest = controller((request, response) => {
  const countryCode = readParamText(request, "countryCode", "Country code");

  if (!isValidCountryCode(countryCode)) {
    throw createHttpError(`Country code '${countryCode}' not found.`, 404);
  }

  const languageCode = getLanguageFromCountry(countryCode);
  const languageName = getLanguageNativeName(languageCode);

  response.json({
    countryCode,
    languageCode,
    languageName,
    message: `Language for ${countryCode} is ${languageName}`,
  });
});

export const validateLocalizationRequest = controller((request, response) => {
  const countryCode = request.body?.countryCode
    ? readBodyText(request, "countryCode", "Country code")
    : "";
  const languageCode = request.body?.languageCode
    ? readBodyText(request, "languageCode", "Language code")
    : "";

  if (!countryCode && !languageCode) {
    throw createHttpError("Country code or language code is required.", 400);
  }

  const validCountry = !countryCode || isValidCountryCode(countryCode);
  let suggestionLanguage = null;

  if (countryCode && validCountry) {
    suggestionLanguage = getLanguageFromCountry(countryCode);
  }

  response.json({
    isValid: validCountry,
    countryCode,
    languageCode,
    suggestion: suggestionLanguage,
    message: validCountry
      ? `Configuration valid for ${countryCode}`
      : `Country ${countryCode} not recognized`,
  });
});
