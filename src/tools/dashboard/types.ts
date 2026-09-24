/**
 * Dashboard related types
 */

// Group scan statuses (CstGroupScanStatus — history-group-scan API)
export type GroupScanStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const GROUP_SCAN_STATUS_LABELS: Record<GroupScanStatus, string> = {
  0: "ONGOING",
  1: "FINISHED",
  2: "ERROR (group scan did not finish successfully)",
  3: "DELAYED (waited too long in queue and was canceled)",
  4: "INCOMPLETED (some scans in the group did not finish successfully)",
  5: "CANCEL",
  6: "INACCESSIBLE",
  7: "TOO_MANY_INACCESSIBLE",
};

// Single / crawler scan history may use a different status set than group scans
export type ScanStatus = 0 | 1 | 2 | 3 | 4 | 5;

export const SCAN_STATUS_LABELS: Record<ScanStatus, string> = {
  0: "Queued",
  1: "Running",
  2: "Completed",
  3: "Failed",
  4: "Cancelled",
  5: "Timeout",
};

// Scan types
export type ScanType = 0 | 1 | 2 | 3 | 4 | 5;

export const SCAN_TYPE_LABELS: Record<ScanType, string> = {
  0: "Single Scan",
  1: "Full Scan",
  2: "Light Scan",
  3: "Continuous Scan",
  4: "API Scan",
  5: "Crawler",
};

// Scan history item
export interface ScanHistoryItem {
  slug: string;
  asset: string;
  asset_id: number;
  scan_type: ScanType;
  scan_status: ScanStatus;
  queued_at: number;
  started_at?: number;
  finished_at?: number;
  total_count?: number;
  category_slugs?: string[];
  [key: string]: unknown;
}

// Scan history parameters
export interface GetScanHistoryParams {
  asset_ids?: number[];
  scan_type?: ScanType[];
  scan_status?: ScanStatus[];
  order_by?: "queued_at" | "started_at" | "finished_at" | "scan_status";
  order_type?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

// Scan history response
export interface ScanHistoryResponse {
  data: ScanHistoryItem[];
  total_count?: number;
  page?: number;
  per_page?: number;
}

// Open port info
export interface OpenPort {
  port: number;
  count: number;
  service?: string;
}

// Security summary
export interface SecuritySummary {
  total_assets: number;
  verified_assets: number;
  total_vulnerabilities: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  open_ports: OpenPort[];
  recent_scans: ScanHistoryItem[];
  last_scan_date?: number;
}

// Dashboard statistics
export interface DashboardStats {
  scans_this_month: number;
  crawls_this_month: number;
  new_vulnerabilities_this_week: number;
  fixed_vulnerabilities_this_week: number;
}

// Monthly statistics
export interface MonthlyStats {
  month: number;
  total_scans: number;
  total_urls: number;
  unique_requests: number;
}

// User risk score entry (from /risk/user-score)
export interface UserRiskEntry {
  parameters: {
    asset_scores: Record<string, number>;
    calculation_method: string;
    total_assets: number;
  };
  calculated_at: number;
  user_id: number;
  risk_score: number;
}

// User risk score API response
export interface UserRiskScoreResponse {
  user_risk: UserRiskEntry[];
  count: number;
}

// Asset score with resolved name
export interface AssetRiskDetail {
  asset_id: number;
  asset_name: string;
  risk_score: number;
}
