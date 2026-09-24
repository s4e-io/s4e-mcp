/**
 * Group Scan Tool
 * Start full scan, light scan, and crawler scan
 *
 * All three scan types use the same /scan/start-group-scan body shape that the
 * working browser extension uses:
 *   { slug: <scan-type>, category_slugs: [...], assets: [{id, port:null, protocol_id:null}] }
 *
 * The MCP tool surface accepts either an asset domain string (which we resolve
 * to asset_id at runtime) or a direct asset_id (skip lookup).
 */

import { S4EClient } from "../../core/client.js";
import { S4EApiResponse } from "../../core/types.js";
import { AssetListResponse, AssetDetailResponse } from "../assets/types.js";
import {
  GroupScanParams,
  GroupScanResponse,
  ScanSlug,
  ScanCategory,
  FULL_SCAN_CATEGORIES,
  LIGHT_SCAN_CATEGORIES,
} from "./types.js";

export type GroupScanInput =
  | string
  | { asset?: string; assetId?: number };

/**
 * Resolve a domain string to a numeric asset_id.
 * Tries: asset/info/detail → asset/info/list (asset filter) → asset/info/list (search_text).
 */
async function resolveAssetId(
  client: S4EClient,
  input: { asset?: string; assetId?: number }
): Promise<{ id: number } | { error: string }> {
  if (input.assetId) return { id: input.assetId };
  if (!input.asset) {
    return { error: "Either `asset` (domain) or `assetId` is required." };
  }

  const asset = input.asset;

  const detail = await client.request<AssetDetailResponse>(
    "/asset/info/detail",
    { asset }
  );
  if (detail.success && detail.data?.id) {
    return { id: detail.data.id };
  }

  const exact = await client.request<AssetListResponse>(
    "/asset/info/list",
    { asset, per_page: 5, page: 1 }
  );
  if (exact.success && exact.data?.asset?.length) {
    const m =
      exact.data.asset.find((a) => a.asset === asset) ?? exact.data.asset[0];
    if (m?.id) return { id: m.id };
  }

  const fuzzy = await client.request<AssetListResponse>(
    "/asset/info/list",
    { search_text: asset, per_page: 20, page: 1 }
  );
  if (fuzzy.success && fuzzy.data?.asset?.length) {
    const m =
      fuzzy.data.asset.find((a) => a.asset === asset) ??
      fuzzy.data.asset.find((a) => a.asset?.includes(asset)) ??
      fuzzy.data.asset[0];
    if (m?.id) return { id: m.id };
  }

  return {
    error:
      `Asset not found by lookup: "${asset}". ` +
      "Either pass assetId directly, or use list_assets to find the numeric id and retry.",
  };
}

/**
 * Raw group-scan request (advanced use). Most callers should prefer
 * startFullScan / startLightScan / startCrawlerScan.
 */
export async function startGroupScan(
  client: S4EClient,
  params: GroupScanParams
): Promise<S4EApiResponse<GroupScanResponse>> {
  return client.request<GroupScanResponse>("/scan/start-group-scan", {
    slug: params.slug,
    ...(params.assets && params.assets.length > 0
      ? { assets: params.assets }
      : params.asset
      ? { asset: params.asset }
      : {}),
    ...(params.category_slugs && params.category_slugs.length > 0 && {
      category_slugs: params.category_slugs,
    }),
    ...(params.port && { port: params.port }),
    ...(params.protocol_id && { protocol_id: params.protocol_id }),
  });
}

/**
 * Internal helper: resolve asset id, build extension-compatible body, fire request.
 */
async function startGroupScanByAsset(
  client: S4EClient,
  slug: ScanSlug,
  category_slugs: string[],
  input: GroupScanInput,
  failureLabel: string
): Promise<S4EApiResponse<GroupScanResponse>> {
  const normalized =
    typeof input === "string" ? { asset: input } : input;

  const resolved = await resolveAssetId(client, normalized);
  if ("error" in resolved) {
    return {
      success: false,
      message: `${failureLabel} could not be started`,
      error: resolved.error,
    };
  }

  return client.request<GroupScanResponse>("/scan/start-group-scan", {
    slug,
    category_slugs,
    assets: [
      {
        id: resolved.id,
        port: null,
        protocol_id: null,
      },
    ],
  });
}

/**
 * Start a full scan — comprehensive security scan (10,000+ checks, OWASP Top 10).
 * Body matches extension `full-scan` flow.
 */
export async function startFullScan(
  client: S4EClient,
  input: GroupScanInput
): Promise<S4EApiResponse<GroupScanResponse>> {
  return startGroupScanByAsset(
    client,
    "full-scan",
    FULL_SCAN_CATEGORIES,
    input,
    "Full scan"
  );
}

/**
 * Start a light scan (slug: "half-scan") — DNS/SSL/misconfiguration quick check.
 * Body matches extension `half-scan` flow.
 */
export async function startLightScan(
  client: S4EClient,
  input: GroupScanInput
): Promise<S4EApiResponse<GroupScanResponse>> {
  return startGroupScanByAsset(
    client,
    "half-scan",
    LIGHT_SCAN_CATEGORIES,
    input,
    "Light scan"
  );
}

/**
 * Start a crawler scan (slug: "crawl-only") — URL/link discovery.
 * Body matches extension `crawl-only` flow.
 */
export async function startCrawlerScan(
  client: S4EClient,
  input: GroupScanInput
): Promise<S4EApiResponse<GroupScanResponse>> {
  return startGroupScanByAsset(
    client,
    "crawl-only",
    ["ssl-controls"],
    input,
    "Crawler scan"
  );
}
