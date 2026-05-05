import { createHttpError, sanitizeText } from "../services/serviceHelpers.js";

function readRawValue(value) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function controller(handler) {
  return async function wrappedController(request, response, next) {
    try {
      await handler(request, response, next);
    } catch (error) {
      next(error);
    }
  };
}

export function readText(value) {
  return sanitizeText(readRawValue(value));
}

export function readQueryText(request, key) {
  return readText(request.query?.[key]);
}

export function readParamText(request, key, label = key) {
  const value = readText(request.params?.[key]);

  if (!value) {
    throw createHttpError(`${label} is required.`, 400);
  }

  return value;
}

export function readBodyText(request, key, label = key) {
  const value = readText(request.body?.[key]);

  if (!value) {
    throw createHttpError(`${label} is required.`, 400);
  }

  return value;
}

export function readQueryNumber(request, key, options = {}) {
  const {
    min = 1,
    max = 100,
    fallback = null,
  } = options;
  const rawValue = readQueryText(request, key);

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    throw createHttpError(`${key} must be a valid number.`, 400);
  }

  return Math.max(min, Math.min(max, Math.floor(parsedValue)));
}

export function readQueryBoolean(request, key, fallback = null) {
  const rawValue = readQueryText(request, key).toLowerCase();

  if (!rawValue) {
    return fallback;
  }

  if (["1", "true", "yes", "on"].includes(rawValue)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(rawValue)) {
    return false;
  }

  throw createHttpError(`${key} must be true or false.`, 400);
}

export function limitItems(items, limit) {
  if (!Number.isInteger(limit) || limit <= 0) {
    return items;
  }

  return items.slice(0, limit);
}

export function filterByExactText(items, value, getter) {
  if (!value) {
    return items;
  }

  const normalizedValue = value.toLowerCase();

  return items.filter((item) => {
    const currentValue = getter(item);
    return sanitizeText(String(currentValue ?? "")).toLowerCase() === normalizedValue;
  });
}

export function filterByContainsText(items, value, getter) {
  if (!value) {
    return items;
  }

  const normalizedValue = value.toLowerCase();

  return items.filter((item) =>
    sanitizeText(String(getter(item) ?? ""))
      .toLowerCase()
      .includes(normalizedValue),
  );
}

export function compactFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== null),
  );
}

export function sendList(response, key, items, options = {}) {
  const { status = 200, total = items.length, filters = {} } = options;

  response.status(status).json({
    [key]: items,
    total,
    returned: items.length,
    filters: compactFilters(filters),
  });
}
