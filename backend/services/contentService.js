import { getPool, isDatabaseConfigured } from "../config/db.js";
import { fallbackContent } from "../data/landingData.js";

function parseJsonField(value, fallback = []) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  if (value && typeof value === "object") {
    return value;
  }

  return fallback;
}

export async function getLandingContent() {
  if (!isDatabaseConfigured) {
    return fallbackContent;
  }

  try {
    const pool = getPool();

    if (!pool) {
      return fallbackContent;
    }

    const [sectorRows] = await pool.query(`
      SELECT
        slug,
        name,
        title,
        summary,
        audience,
        stat_label AS statLabel,
        stat_value AS statValue,
        accent,
        device_key AS deviceKey,
        image_url AS imageUrl,
        capabilities_json AS capabilities
      FROM sectors
      ORDER BY sort_order ASC
    `);

    const [deviceRows] = await pool.query(`
      SELECT
        device_key AS deviceKey,
        sector_slug AS sectorSlug,
        name,
        category,
        tagline,
        description,
        image_url AS imageUrl,
        ports_json AS ports,
        suited_for_json AS suitedFor,
        metrics_json AS metrics
      FROM devices
      ORDER BY sort_order ASC
    `);

    const [planRows] = await pool.query(`
      SELECT
        slug,
        name,
        summary,
        annual_price AS annualPrice,
        monthly_price AS monthlyPrice,
        device_allowance AS deviceAllowance,
        support_label AS supportLabel,
        automation_label AS automationLabel,
        featured,
        features_json AS features
      FROM plans
      ORDER BY sort_order ASC
    `);

    return {
      ...fallbackContent,
      source: "database",
      sectors: sectorRows.map((sector) => ({
        ...sector,
        capabilities: parseJsonField(sector.capabilities, []),
      })),
      devices: deviceRows.map((device) => ({
        ...device,
        ports: parseJsonField(device.ports, []),
        suitedFor: parseJsonField(device.suitedFor, []),
        metrics: parseJsonField(device.metrics, []),
      })),
      plans: planRows.map((plan) => ({
        ...plan,
        featured: Boolean(plan.featured),
        features: parseJsonField(plan.features, []),
      })),
    };
  } catch (error) {
    console.warn("MySQL read failed, using fallback content.", error);
    return fallbackContent;
  }
}
