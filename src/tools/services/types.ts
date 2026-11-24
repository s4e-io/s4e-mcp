/**
 * Service Manager types (asset service tracking)
 */

// active: seen in the latest port scan, passive: no longer seen
export type PresenceState = "active" | "passive";

interface ServiceFilterParams {
  ports?: number[];
  ports_exclude?: number[];
  protocol_ids?: number[];
  protocol_ids_exclude?: number[];
  presence_state?: PresenceState;
  asset_ids?: number[];
  assets?: string[];
  page?: number;
  per_page?: number;
  order_type?: "asc" | "desc";
}

export interface ListServicesParams extends ServiceFilterParams {
  tag_ids?: number[];
  seen_count?: number;
  missing_count?: number;
  order_by?:
    | "port"
    | "protocol_id"
    | "seen_count"
    | "missing_count"
    | "first_seen_at"
    | "last_seen_at"
    | "last_updated_at";
}

export interface ServiceItem {
  id: number;
  asset_id: number;
  asset: string;
  port: number;
  protocol_id: number | null;
  protocol_name: string | null;
  transport_protocol: string | null;
  presence_state: PresenceState;
  seen_count: number;
  missing_count: number;
  if_scan_enabled: boolean | null;
  if_premium: boolean | null;
  latest_scan_output_slug: string | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
  last_updated_at: string | null;
  [key: string]: unknown;
}

export interface CountServicesByPortParams extends ServiceFilterParams {
  order_by?: "port" | "asset_count";
}

export interface ServicePortCount {
  port: number;
  asset_count: number;
  protocol_name: string | null;
}

export interface CountServicesByProtocolParams extends ServiceFilterParams {
  tag_ids?: number[];
  order_by?: "protocol_name" | "count";
}

export interface ServiceProtocolCount {
  protocol_id: number | null;
  protocol_name: string | null;
  count: number;
}

export interface ServiceListResponse<T> {
  data: T[];
  count: number;
}

export interface SetServiceScanEnabledParams {
  if_scan_enabled: boolean;
  asset_ids?: number[];
  ports?: number[];
  protocol_ids?: number[];
  presence_state?: PresenceState;
  tag_ids?: number[];
}

export interface SetServiceScanEnabledResponse {
  success: boolean;
  updated: number;
}
