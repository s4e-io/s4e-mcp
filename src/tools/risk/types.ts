/**
 * Risk score related types
 */

export interface AssetRiskParameters {
  domain?: number;
  open_ports?: string[];
  critical_count?: number;
  high_count?: number;
  medium_count?: number;
  low_count?: number;
  info_count?: number;
  ssl_expiry_days?: number;
  is_self_signed?: boolean;
  blacklist_count?: number;
  severities?: Record<string, number>;
  [key: string]: unknown;
}

export interface AssetRiskItem {
  asset_id: number;
  asset: string;
  risk_score: number;
  calculated_at: number;
  parameters?: AssetRiskParameters;
}

export interface AssetRiskScoreV2Response {
  asset_risk: AssetRiskItem[];
  count: number;
}

export interface GetAssetRiskScoreV2Params {
  asset_ids?: number[];
  assets?: string[];
  tag?: string;
  page?: number;
  per_page?: number;
  order_type?: "asc" | "desc";
  order_by?: "calculated_at" | "asset_id" | "risk_score";
  calculated_at_min?: number;
  calculated_at_max?: number;
  if_unique?: boolean;
}

export interface AssetScoreHistoryItem {
  asset_id: number;
  asset: string;
  risk_score: number;
  calculated_at: number;
}

export interface AssetScoreHistoryResponse {
  data: AssetScoreHistoryItem[];
  count: number;
}

export interface GetAssetScoreHistoryParams {
  asset_ids?: number[];
  assets?: string[];
  tag?: string;
  page?: number;
  per_page?: number;
  order_type?: "asc" | "desc";
  order_by?: "calculated_at" | "risk_score" | "asset_id";
}
