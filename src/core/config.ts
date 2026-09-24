/**
 * S4E.io Environment Configuration
 *
 * The API URL is supplied by the active `.env` file (copy from `.env.example`).
 *
 * S4E_API_URL is REQUIRED. S4E_ENV (or legacy ENV) is a free-form label
 * used for logging and for the /health response.
 *
 * APP_URL isteğe bağlıdır: araç çıktılarındaki dashboard linkleri için
 * (`resolveAppUrl`). Boş bırakılırsa https://app.s4e.io kullanılır.
 */

export interface ResolvedConfig {
  apiUrl: string;
  env: string;
}

/**
 * Web uygulaması kök adresi — tool çıktılarındaki dashboard / rapor linkleri için.
 * `.env` içinde APP_URL (örn. https://app.s4e.io). Boşsa prod kökü kullanılır.
 */
export function resolveAppUrl(appUrl?: string): string {
  const url = appUrl?.trim();
  if (!url) {
    return "https://app.s4e.io";
  }
  return url.replace(/\/+$/, "");
}

/** Uygulama kök URL — `.env` içindeki APP_URL (`resolveAppUrl(process.env.APP_URL)`). */
export const APP_ORIGIN = resolveAppUrl(process.env.APP_URL);

export function resolveApiConfig(apiUrl?: string, env?: string): ResolvedConfig {
  const url = apiUrl?.trim();

  if (!url) {
    throw new Error(
      "S4E_API_URL is required. Set it in your .env file " +
        "(e.g. S4E_API_URL=https://api.s4e.io/api)."
    );
  }

  return {
    apiUrl: url,
    env: env?.trim() || "unknown",
  };
}

export interface S4EConfig {
  apiUrl: string;
  token: string;
}
