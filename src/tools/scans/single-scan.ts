/**
 * Single Scan Tool
 * Start a single vulnerability check
 */

import { S4EClient } from "../../core/client.js";
import { S4EApiResponse } from "../../core/types.js";
import {
  SingleScanParams,
  SingleScanResponse,
  ListScansParams,
  ListScansResponse,
  ScanActivityLogEntry,
} from "./types.js";

/**
 * Start a single scan - Specific vulnerability check
 */
export async function startSingleScan(
  client: S4EClient,
  params: SingleScanParams
): Promise<S4EApiResponse<SingleScanResponse>> {
  return client.request<SingleScanResponse>("/scan/start-single-scan", {
    asset: params.asset,
    slug: params.slug,
    ...(params.port && { port: params.port }),
    ...(params.protocol_id && { protocol_id: params.protocol_id }),
  });
}

/**
 * List available scans
 * Can be filtered by category or search query
 */
export async function listScans(
  client: S4EClient,
  params: ListScansParams = {}
): Promise<S4EApiResponse<ListScansResponse>> {
  return client.request<ListScansResponse>("/scan/list", {
    ...(params.query && { query: params.query }),
    ...(params.scan_category_slug && { scan_category_slug: params.scan_category_slug }),
    ...(params.tag_slug && { tag_slug: params.tag_slug }),
    ...(params.min_score !== undefined && { min_score: params.min_score }),
    ...(params.max_score !== undefined && { max_score: params.max_score }),
    page: params.page || 1,
    per_page: params.per_page || 30,
  });
}

/**
 * Format scan list
 */
export function formatScanList(scans: { slug: string; name: string; description?: string; cvss_score?: number }[]): string {
  if (!scans || scans.length === 0) {
    return "No scans found.";
  }

  const lines: string[] = ["# Available Scans", ""];

  for (const scan of scans) {
    const score = scan.cvss_score !== undefined ? ` (CVSS: ${scan.cvss_score})` : "";
    lines.push(`- **${scan.name}**${score}`);
    lines.push(`  Slug: \`${scan.slug}\``);
    if (scan.description) {
      lines.push(`  ${scan.description.substring(0, 100)}...`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Fetch live activity logs / progress entries for a scan by slug.
 * Returns lines of progress, findings, errors and completion as the scan runs.
 */
export async function getScanActivityLogs(
  client: S4EClient,
  slug: string
): Promise<S4EApiResponse<ScanActivityLogEntry[]>> {
  if (!slug) {
    return {
      success: false,
      message: "Failed to fetch activity logs",
      error: "scan slug is required",
    };
  }
  return client.request<ScanActivityLogEntry[]>(
    "/scan/get-activity-logs",
    { slug }
  );
}

