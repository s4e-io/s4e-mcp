/**
 * Scan related types
 */

// Group scan slugs (per /scan/start-group-scan swagger enum)
export type ScanSlug = "full-scan" | "half-scan" | "crawl-only" | "fast-scan";

// Asset entry for the multi-asset `assets` array pattern.
// `port` and `protocol_id` MUST be sent (extension always sends them) — pass null
// when not specifying a service. `undefined` would be stripped by JSON.stringify
// and the API rejects the request with "Parameter error!".
export interface GroupScanAsset {
  id: number;
  port: number | null;
  protocol_id: number | null;
}

// Scan categories
export const SCAN_CATEGORY_SLUGS = [
  "dns-controls",
  "ssl-controls",
  "misconfiguration",
  "network-vulnerabilities",
  "web-vulnerabilities",
  "information-scans",
  "product-based-web-vulnerabilities",
  "product-based-network-vulnerabilities",
  "exposed-panels",
  "ai-generated",
] as const;

export type ScanCategory = (typeof SCAN_CATEGORY_SLUGS)[number];

// Full scan categories (all)
export const FULL_SCAN_CATEGORIES: ScanCategory[] = [...SCAN_CATEGORY_SLUGS];

// Light scan categories (basic checks)
export const LIGHT_SCAN_CATEGORIES: ScanCategory[] = [
  "dns-controls",
  "ssl-controls",
  "misconfiguration",
  "product-based-network-vulnerabilities",
];

// Crawler scan categories (discovery only)
export const CRAWLER_SCAN_CATEGORIES: ScanCategory[] = [
  "information-scans",
];

// Group scan request parameters
// Two input patterns (mutually exclusive):
//   1. Single asset string  — pass `asset`
//   2. Multi-asset array    — pass `assets` (each entry: id + optional port/protocol_id)
export interface GroupScanParams {
  slug: ScanSlug;
  category_slugs?: ScanCategory[];
  asset?: string;
  assets?: GroupScanAsset[];
  port?: number;
  protocol_id?: number;
}

// Group scan response
export interface GroupScanResponse {
  scan_id?: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// ============================================
// Single Scan Types
// ============================================

// Single scan request parameters
export interface SingleScanParams {
  asset: string;
  slug: string; // Specific scan slug (e.g. "txt-record-lookup", "cve-2021-44228")
  port?: number;
  protocol_id?: number;
}

// Single scan response
export interface SingleScanResponse {
  scan_id?: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// Scan list parameters
export interface ListScansParams {
  query?: string; // Search text
  scan_category_slug?: ScanCategory; // Category filter
  tag_slug?: string; // Tag filter
  min_score?: number; // Min CVSS score
  max_score?: number; // Max CVSS score
  page?: number;
  per_page?: number;
}

// Scan item (from list)
export interface ScanItem {
  id: number;
  slug: string;
  name: string;
  description?: string;
  category_slug?: string;
  severity?: number;
  cvss_score?: number;
  tags?: string[];
  [key: string]: unknown;
}

// Scan list response
export interface ListScansResponse {
  scans?: ScanItem[];
  data?: ScanItem[];
  total_count?: number;
  page?: number;
  per_page?: number;
}

// ============================================
// Activity logs
// ============================================

export interface ScanActivityLogEntry {
  desc?: string;
  message?: string;
  level?: string;
  timestamp?: number;
  [key: string]: unknown;
}
