/**
 * Crawler Tools - Crawler configuration
 */

import { S4EClient } from "../../core/client.js";
import { S4EApiResponse } from "../../core/types.js";
import {
  GetCrawlerSettingsParams,
  CrawlerSettingsResponse,
  AddExcludedUrlsParams,
  AddIncludedUrlsParams,
  UpdateCrawlerHeaderParams,
  CrawlerUrlResponse,
  CrawlerHeaderResponse,
} from "./types.js";

export * from "./types.js";
export { CRAWLER_TOPICS } from "./topics.js";

/**
 * Get crawler settings
 */
export async function getCrawlerSettings(
  client: S4EClient,
  params: GetCrawlerSettingsParams
): Promise<S4EApiResponse<CrawlerSettingsResponse>> {
  const { asset_id } = params;

  if (!asset_id) {
    return {
      success: false,
      data: null as unknown as CrawlerSettingsResponse,
      message: "asset_id is required",
      error: "asset_id is required",
    };
  }

  return client.request<CrawlerSettingsResponse>("/crawler/get-settings", {
    asset_id,
  });
}

/**
 * Add URLs to exclude from crawler
 */
export async function addExcludedUrls(
  client: S4EClient,
  params: AddExcludedUrlsParams
): Promise<S4EApiResponse<CrawlerUrlResponse>> {
  const { asset_id, urls } = params;

  if (!asset_id) {
    return {
      success: false,
      data: null as unknown as CrawlerUrlResponse,
      message: "asset_id is required",
      error: "asset_id is required",
    };
  }

  if (!urls || urls.length === 0) {
    return {
      success: false,
      data: null as unknown as CrawlerUrlResponse,
      message: "At least one URL is required",
      error: "At least one URL is required",
    };
  }

  return client.request<CrawlerUrlResponse>("/crawler/add-excluded-urls", {
    asset_id,
    urls,
  });
}

/**
 * Add URLs to include in crawler
 */
export async function addIncludedUrls(
  client: S4EClient,
  params: AddIncludedUrlsParams
): Promise<S4EApiResponse<CrawlerUrlResponse>> {
  const { asset_id, urls } = params;

  if (!asset_id) {
    return {
      success: false,
      data: null as unknown as CrawlerUrlResponse,
      message: "asset_id is required",
      error: "asset_id is required",
    };
  }

  if (!urls || urls.length === 0) {
    return {
      success: false,
      data: null as unknown as CrawlerUrlResponse,
      message: "At least one URL is required",
      error: "At least one URL is required",
    };
  }

  return client.request<CrawlerUrlResponse>("/crawler/add-included-urls", {
    asset_id,
    urls,
  });
}

/**
 * Set custom HTTP headers for crawler
 */
export async function updateCrawlerHeader(
  client: S4EClient,
  params: UpdateCrawlerHeaderParams
): Promise<S4EApiResponse<CrawlerHeaderResponse>> {
  const { asset_id, headers } = params;

  if (!asset_id) {
    return {
      success: false,
      data: null as unknown as CrawlerHeaderResponse,
      message: "asset_id is required",
      error: "asset_id is required",
    };
  }

  if (!headers || Object.keys(headers).length === 0) {
    return {
      success: false,
      data: null as unknown as CrawlerHeaderResponse,
      message: "At least one header is required",
      error: "At least one header is required",
    };
  }

  return client.request<CrawlerHeaderResponse>("/crawler/update-header", {
    asset_id,
    headers,
  });
}

/**
 * Format crawler settings
 */
export function formatCrawlerSettings(settings: CrawlerSettingsResponse["data"]): string {
  const lines: string[] = ["=== Crawler Settings ===", ""];
  const excludeUrls = parseUrlList(settings.exclude_urls);
  const includeUrls = parseUrlList(settings.include_urls);
  const headers = parseHeaderMap(settings.headers);

  if (excludeUrls.length > 0) {
    lines.push("Excluded URLs:");
    excludeUrls.forEach((url) => {
      lines.push(`  - ${url}`);
    });
    lines.push("");
  }

  if (includeUrls.length > 0) {
    lines.push("Included URLs:");
    includeUrls.forEach((url) => {
      lines.push(`  - ${url}`);
    });
    lines.push("");
  }

  if (Object.keys(headers).length > 0) {
    lines.push("Custom Headers:");
    Object.entries(headers).forEach(([key, value]) => {
      lines.push(`  - ${key}: ${value}`);
    });
    lines.push("");
  }

  if (settings.max_depth != null) {
    lines.push(`Max Depth: ${settings.max_depth}`);
  }

  if (settings.max_pages != null) {
    lines.push(`Max Pages: ${settings.max_pages}`);
  }
  if (settings.headers_updated != null) {
    const headersUpdated = new Date(settings.headers_updated)
      .toISOString()
      .replace("T", " ")
      .replace("Z", "");
    lines.push(`Headers Updated: ${headersUpdated} (according to UTC+0)`);
  }

  return lines.join("\n");
}

function parseUrlList(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter((url): url is string => typeof url === "string")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
  } catch {
    return [];
  }
}

function parseHeaderMap(value: string | null | undefined): Record<string, string> {
  if (!value) {
    return {};
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string"
      )
    );
  } catch {
    return {};
  }
}
