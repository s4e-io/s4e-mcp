/**
 * Asset related types
 */

import type { ScanCategory } from "../scans/types.js";

// Asset types
export type AssetType = "domain" | "subdomain" | "ipv4" | "ipv6" | "cidr" | "url";

// Asset source
export type AssetSource =
  | "manuel"
  | "s4e_subdomain_finder"
  | "s4e_iprange_extender"
  | "digitalocean_integration"
  | "cloudflare_integration"
  | "wordpress_integration";

// Asset description length constraints
export const ASSET_DESCRIPTION_MIN_LENGTH = 3;
export const ASSET_DESCRIPTION_MAX_LENGTH = 300;

// Asset info
export interface S4EAsset {
  id: number;
  asset: string;
  asset_type: AssetType;
  description?: string;
  if_verified: boolean;
  if_premium: boolean;
  if_local: boolean;
  if_srs: boolean;
  created_at: number;
  verify_date?: number;
  source?: number;
  [key: string]: unknown;
}

// Asset list response
export interface AssetListResponse {
  asset: S4EAsset[];
  count?: number;
  page?: number;
  per_page?: number;
}

// Asset list parameters
export interface ListAssetsParams {
  search_text?: string;
  if_verified?: boolean;
  if_premium?: boolean;
  asset_ids?: number[];
  order_by?: "created_at" | "asset" | "verify_date" | "if_verified" | "asset_type";
  order_type?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

// Asset detail parameters
export interface GetAssetDetailParams {
  asset_id?: number;
  asset?: string;
}

// Asset detail response
export interface AssetDetailResponse {
  id?: number;
  asset: string | S4EAsset;
  asset_type?: AssetType;
  description?: string;
  if_verified: boolean;
  if_premium: boolean;
  if_local: boolean;
  if_srs: boolean;
  created_at: number;
  verify_date?: number;
  source?: number;
  scan_categories?: {
    category_id: number;
    slug: string;
    name: string;
    status: boolean;
  }[];
  [key: string]: unknown;
}

// Add assets parameters
export interface AddAssetsParams {
  assets: string[];
  description?: string;
  source?: AssetSource;
}

// Add assets response
export interface AddAssetsResponse {
  added: string[];
  failed: string[];
  message?: string;
}

// Asset ownership check parameters
export interface CheckAssetOwnershipParams {
  assets: string[];
}

// Asset ownership check response
export interface AssetOwnershipResult {
  asset: string;
  available: boolean;
  owner?: string;
  reason?: string;
}

export interface CheckAssetOwnershipResponse {
  results: AssetOwnershipResult[];
}

// Asset type check parameters
export interface CheckAssetTypeParams {
  assets: string[];
}

// Asset type check response
export interface AssetTypeResult {
  asset: string;
  valid: boolean;
  type?: AssetType;
  error?: string;
}

export interface CheckAssetTypeResponse {
  results: AssetTypeResult[];
}

// ============================================
// Tags
// ============================================

export interface AssetTagItem {
  id?: number;
  name: string;
  asset_ids: number[];
  [key: string]: unknown;
}

// ============================================
// Per-asset scan category toggle
// ============================================

export interface ScanCategoryStatus {
  category_slug: ScanCategory;
  status: boolean;
}

export interface UpdateScanCategoriesParams {
  asset_id: number;
  status_list: ScanCategoryStatus[];
}

export interface UpdateAssetDescriptionParams {
  asset_id?: number;
  description: string;
}
