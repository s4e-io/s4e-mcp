/**
 * S4E.io API Client
 */

import { Agent } from "undici";

import { S4EConfig } from "./config.js";
import { S4ERawApiResponse, S4EApiResponse } from "./types.js";

function isEnvFlagTrue(name: string): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  return Boolean(v && !["0", "false", "no", "off"].includes(v));
}

/** When S4E_TLS_INSECURE=1, skip TLS verification for S4E API (trusted local dev only). */
export function isS4eTlsInsecure(): boolean {
  return isEnvFlagTrue("S4E_TLS_INSECURE");
}

let insecureAgent: Agent | undefined;

function getTlsInsecureDispatcher(): Agent | undefined {
  if (!isS4eTlsInsecure()) return undefined;
  if (!insecureAgent) {
    insecureAgent = new Agent({
      connect: { rejectUnauthorized: false },
    });
  }
  return insecureAgent;
}

let warnedInsecureTls = false;

export function warnOnceIfS4eTlsInsecure(): void {
  if (!isS4eTlsInsecure() || warnedInsecureTls) return;
  warnedInsecureTls = true;
  console.warn(
    "[mcp] WARNING: S4E_TLS_INSECURE is enabled — TLS verification is off for S4E API HTTP calls. " +
      "Local/dev only; do not use against production."
  );
}

function describeFetchFailure(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const parts: string[] = [err.message];
  let cur: unknown = err.cause;
  for (let i = 0; i < 6 && cur != null; i++) {
    if (cur instanceof Error) {
      parts.push(cur.message);
      cur = cur.cause;
      continue;
    }
    if (cur && typeof cur === "object") {
      const o = cur as { code?: unknown; errno?: unknown; syscall?: unknown };
      const bit = [o.syscall, o.code, o.errno].filter(Boolean).join(" ");
      parts.push(bit ? `(${bit})` : JSON.stringify(cur));
      break;
    }
    parts.push(String(cur));
    break;
  }
  return parts.join(" ← ");
}

export class S4EClient {
  private apiUrl: string;
  private token: string;

  constructor(config: S4EConfig) {
    this.apiUrl = config.apiUrl;
    this.token = config.token;
  }

  // Endpoints that accept the is_extension parameter
  private static readonly EXTENSION_ENDPOINTS = [
    "/user/info",
  ];

  private normalizeResponse<T>(raw: S4ERawApiResponse<T>): S4EApiResponse<T> {
    return {
      success: !raw.error && raw.code === 200,
      data: raw.value as T,
      message: raw.message || "",
      error: raw.error ? raw.message : undefined,
    };
  }

  async request<T>(
    endpoint: string,
    body: Record<string, unknown> = {}
  ): Promise<S4EApiResponse<T>> {
    // Only send is_extension to supported endpoints
    const supportsExtension = S4EClient.EXTENSION_ENDPOINTS.includes(endpoint);

    const url = `${this.apiUrl}${endpoint}`;
    try {
      const dispatcher = getTlsInsecureDispatcher();
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...body,
          token: this.token,
          ...(supportsExtension ? { is_extension: true } : {}),
        }),
        ...(dispatcher ? { dispatcher } : {}),
      });

      const raw = (await response.json()) as S4ERawApiResponse<T>;
      return this.normalizeResponse(raw);
    } catch (err) {
      console.error(
        "[mcp] S4E API request threw (network/parse):",
        endpoint,
        "|",
        url,
        "|",
        describeFetchFailure(err)
      );
      throw err;
    }
  }

  async requestGet<T>(
    endpoint: string,
    params: Record<string, unknown> = {}
  ): Promise<S4EApiResponse<T>> {
    const query = new URLSearchParams();
    query.set("token", this.token);

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        query.set(key, value.map(String).join(","));
      } else {
        query.set(key, String(value));
      }
    }

    const url = `${this.apiUrl}${endpoint}?${query.toString()}`;
    try {
      const dispatcher = getTlsInsecureDispatcher();
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        ...(dispatcher ? { dispatcher } : {}),
      });

      const raw = (await response.json()) as S4ERawApiResponse<T>;
      return this.normalizeResponse(raw);
    } catch (err) {
      console.error(
        "[mcp] S4E API GET request threw (network/parse):",
        endpoint,
        "|",
        url.replace(this.token, "***"),
        "|",
        describeFetchFailure(err)
      );
      throw err;
    }
  }
}
