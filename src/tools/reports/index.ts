/**
 * Reports Tools - Vulnerability reports
 */

import { S4EClient } from "../../core/client.js";
import { S4EApiResponse } from "../../core/types.js";
import {
  GetVulnerabilitiesParams,
  VulnerabilityListResponse,
  VulnerabilityReport,
  SeveritySummary,
  ExportReportParams,
  ExportReportResponse,
  ReportHistoryParams,
  ReportHistoryResponse,
  SEVERITY_LABELS,
  REPORT_STATUS_LABELS,
  Severity,
} from "./types.js";

export * from "./types.js";
export { REPORT_TOPICS } from "./topics.js";

/**
 * Get vulnerability list
 */
export async function getVulnerabilities(
  client: S4EClient,
  params: GetVulnerabilitiesParams = {}
): Promise<S4EApiResponse<VulnerabilityListResponse>> {
  const {
    asset,
    asset_id,
    severity,
    report_status,
    scan_category_slug,
    name,
    order_by = "severity",
    order_type = "desc",
    page = 1,
    per_page = 20,
  } = params;

  return client.request<VulnerabilityListResponse>("/report/list", {
    ...(asset && { asset }),
    ...(asset_id && { asset_id }),
    ...(severity && { severity }),
    ...(report_status && { report_status }),
    ...(scan_category_slug && { scan_category_slug }),
    ...(name && { name }),
    order_by,
    order_type,
    page,
    per_page,
  });
}

/**
 * Get severity summary
 */
export async function getSeveritySummary(
  client: S4EClient,
  asset?: string
): Promise<S4EApiResponse<SeveritySummary[]>> {
  return client.request<SeveritySummary[]>("/report/get-severities", {
    ...(asset && { asset }),
  });
}

/**
 * Export report
 */
export async function exportReport(
  client: S4EClient,
  params: ExportReportParams
): Promise<S4EApiResponse<ExportReportResponse>> {
  const {
    asset,
    asset_id,
    severity,
    report_status,
    output_type,
    template = "short",
    delimiter = ",",
  } = params;

  return client.request<ExportReportResponse>("/report/export", {
    ...(asset && { asset }),
    ...(asset_id && { asset_id }),
    ...(severity && { severity }),
    ...(report_status && { report_status }),
    output_type,
    template,
    delimiter,
  });
}

/**
 * Get report history for a single scan / asset.
 * Surfaces the timeline of finished reports — when a scan was run, its severity
 * and status — so the LLM can answer "when was the last scan", "is there a fix
 * regression" etc. Filter by `scan_slug`, `asset_id`/`asset`, or paginate raw.
 */
export async function getReportHistory(
  client: S4EClient,
  params: ReportHistoryParams = {}
): Promise<S4EApiResponse<ReportHistoryResponse>> {
  return client.request<ReportHistoryResponse>("/report/report-history", {
    ...(params.uniq_report_value && { uniq_report_value: params.uniq_report_value }),
    ...(params.scan_slug && { scan_slug: params.scan_slug }),
    ...(params.asset_id !== undefined && { asset_id: params.asset_id }),
    ...(params.asset && { asset: params.asset }),
    ...(params.port !== undefined && { port: params.port }),
    ...(params.scan_output_slug && { scan_output_slug: params.scan_output_slug }),
    ...(params.show_changes !== undefined && { show_changes: params.show_changes }),
    ...(params.order_by && { order_by: params.order_by }),
    ...(params.order_type && { order_type: params.order_type }),
    page: params.page ?? 1,
    per_page: params.per_page ?? 20,
  });
}

/**
 * Format vulnerability list
 */
export function formatVulnerabilityList(reports: VulnerabilityReport[]): string {
  if (!reports || reports.length === 0) {
    return "No vulnerabilities found.";
  }

  const lines = reports.map((r, i) => {
    const severityLabel = SEVERITY_LABELS[r.severity as Severity] || "Unknown";
    const statusLabel = REPORT_STATUS_LABELS[r.report_status as keyof typeof REPORT_STATUS_LABELS] || "Unknown";
    const severityIcon = getSeverityIcon(r.severity as Severity);
    return `${i + 1}. ${severityIcon} [${severityLabel}] ${r.name}\n   Asset: ${r.asset} | Status: ${statusLabel}`;
  });

  return lines.join("\n\n");
}

/**
 * Format severity summary
 */
export function formatSeveritySummary(summaries: SeveritySummary[]): string {
  if (!summaries || summaries.length === 0) {
    return "No vulnerability summary found.";
  }

  const total = summaries.reduce((acc, s) => acc + s.count, 0);

  const lines = summaries
    .sort((a, b) => b.severity - a.severity) // Critical first
    .map((s) => {
      const label = SEVERITY_LABELS[s.severity as Severity] || "Unknown";
      const icon = getSeverityIcon(s.severity as Severity);
      const percentage = total > 0 ? Math.round((s.count / total) * 100) : 0;
      return `${icon} ${label}: ${s.count} (${percentage}%)`;
    });

  return `Total Vulnerabilities: ${total}\n\n${lines.join("\n")}`;
}

/**
 * Severity emoji icon
 */
function getSeverityIcon(severity: Severity): string {
  switch (severity) {
    case 5:
      return "🔴"; // Critical
    case 4:
      return "🟠"; // High
    case 3:
      return "🟡"; // Medium
    case 2:
      return "🟢"; // Low
    case 1:
      return "🔵"; // Information
    default:
      return "⚪";
  }
}
