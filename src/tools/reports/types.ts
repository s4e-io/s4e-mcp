/**
 * Report/Vulnerability related types
 */

// Severity levels
export type Severity = 1 | 2 | 3 | 4 | 5;

export const SEVERITY_LABELS: Record<Severity, string> = {
  1: "Information",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Critical",
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  1: "blue",
  2: "green",
  3: "yellow",
  4: "orange",
  5: "red",
};

// Report statuses
export type ReportStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  0: "Open",
  1: "Fixed",
  2: "Request for Approval",
  3: "Accepted Risk",
  4: "False Positive",
  5: "Support Ongoing",
  6: "No Action Required",
  7: "Reopened",
  8: "In Progress",
};

// Scan categories
export type ScanCategorySlug =
  | "dns-controls"
  | "ssl-controls"
  | "misconfiguration"
  | "network-vulnerabilities"
  | "web-vulnerabilities"
  | "information-scans"
  | "product-based-web-vulnerabilities"
  | "product-based-network-vulnerabilities"
  | "exposed-panels"
  | "ai-generated";

export const SCAN_CATEGORY_LABELS: Record<ScanCategorySlug, string> = {
  "dns-controls": "DNS Controls",
  "ssl-controls": "SSL/TLS Controls",
  "misconfiguration": "Misconfiguration",
  "network-vulnerabilities": "Network Vulnerabilities",
  "web-vulnerabilities": "Web Vulnerabilities",
  "information-scans": "Information Scans",
  "product-based-web-vulnerabilities": "Product-Based Web Vulnerabilities",
  "product-based-network-vulnerabilities": "Product-Based Network Vulnerabilities",
  "exposed-panels": "Exposed Panels",
  "ai-generated": "AI Generated",
};

// Vulnerability report
export interface VulnerabilityReport {
  id: number;
  name: string;
  slug: string;
  severity: Severity;
  report_status: ReportStatus;
  asset: string;
  asset_id: number;
  scan_category_slug: ScanCategorySlug;
  finished_at: number;
  description?: string;
  solution?: string;
  references?: string[];
  cvss_score?: number;
  cve_ids?: string[];
  port?: number;
  [key: string]: unknown;
}

// Vulnerability list parameters
export interface GetVulnerabilitiesParams {
  asset?: string;
  asset_id?: number[];
  severity?: Severity[];
  report_status?: ReportStatus[];
  scan_category_slug?: ScanCategorySlug[];
  name?: string;
  order_by?: "severity" | "finished_at" | "id";
  order_type?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

// Vulnerability list response
export interface VulnerabilityListResponse {
  report: VulnerabilityReport[];
  total_count?: number;
  page?: number;
  per_page?: number;
}

// Severity summary
export interface SeveritySummary {
  severity: Severity;
  count: number;
}

// Severity summary response
export interface SeveritySummaryResponse {
  severities: SeveritySummary[];
  total: number;
}

// Export parameters
export type ExportFormat = "csv" | "html" | "pdf" | "json";
export type ExportTemplate = "full" | "short";

export interface ExportReportParams {
  asset?: string;
  asset_id?: number[];
  severity?: Severity[];
  report_status?: ReportStatus[];
  output_type: ExportFormat;
  template?: ExportTemplate;
  delimiter?: "," | ";";
}

// Export response
export interface ExportReportResponse {
  download_url?: string;
  file_name?: string;
  [key: string]: unknown;
}

// ============================================
// Report history
// ============================================

export interface ReportHistoryParams {
  uniq_report_value?: string;
  scan_slug?: string;
  asset_id?: number;
  asset?: string;
  port?: number;
  scan_output_slug?: string;
  show_changes?: boolean;
  page?: number;
  per_page?: number;
  order_by?: "id" | "severity" | "finished_at";
  order_type?: "asc" | "desc";
}

export interface ReportHistoryEntry {
  finished_at?: number;
  started_at?: number;
  severity?: Severity;
  report_status?: ReportStatus;
  asset?: string;
  asset_id?: number;
  scan_slug?: string;
  [key: string]: unknown;
}

export interface ReportHistoryResponse {
  report: ReportHistoryEntry[];
  total_count?: number;
  page?: number;
  per_page?: number;
}
