/**
 * Dashboard Tools - Security summary and scan history
 */

import { S4EClient } from "../../core/client.js";
import { APP_ORIGIN } from "../../core/config.js";
import { S4EApiResponse } from "../../core/types.js";
import {
  GetScanHistoryParams,
  ScanHistoryResponse,
  ScanHistoryItem,
  OpenPort,
  SCAN_STATUS_LABELS,
  SCAN_TYPE_LABELS,
  GROUP_SCAN_STATUS_LABELS,
  GroupScanStatus,
  ScanStatus,
  ScanType,
  UserRiskScoreResponse,
  UserRiskEntry,
  AssetRiskDetail,
} from "./types.js";
import { SeveritySummary, SEVERITY_LABELS, Severity } from "../reports/types.js";

export * from "./types.js";
export { DASHBOARD_TOPICS } from "./topics.js";

/**
 * Get group scan history
 */
export async function getScanHistoryGroup(
  client: S4EClient,
  params: GetScanHistoryParams = {}
): Promise<S4EApiResponse<ScanHistoryResponse>> {
  const {
    asset_ids,
    scan_type,
    scan_status,
    order_by = "queued_at",
    order_type = "desc",
    page = 1,
    per_page = 10,
  } = params;

  return client.request<ScanHistoryResponse>("/scan/history-group-scan", {
    ...(asset_ids && { asset_ids }),
    ...(scan_type && { scan_type }),
    ...(scan_status && { scan_status }),
    order_by,
    order_type,
    page,
    per_page,
  });
}

/**
 * Get single scan history
 */
export async function getScanHistorySingle(
  client: S4EClient,
  params: GetScanHistoryParams = {}
): Promise<S4EApiResponse<ScanHistoryResponse>> {
  const {
    scan_status,
    order_by = "finished_at",
    order_type = "desc",
    page = 1,
    per_page = 10,
  } = params;

  return client.request<ScanHistoryResponse>("/scan/history-single-scan", {
    ...(scan_status && { scan_status }),
    order_by,
    order_type,
    page,
    per_page,
  });
}

/**
 * Get crawler history.
 * `scan_type` defaults to [5] (Crawler) but the caller may override it.
 */
export async function getCrawlerHistory(
  client: S4EClient,
  params: GetScanHistoryParams = {}
): Promise<S4EApiResponse<ScanHistoryResponse>> {
  const {
    asset_ids,
    scan_status,
    scan_type,
    order_by = "finished_at",
    order_type = "desc",
    page = 1,
    per_page = 10,
  } = params;

  return client.request<ScanHistoryResponse>("/scan/history-crawler", {
    ...(asset_ids && { asset_ids }),
    ...(scan_status && { scan_status }),
    order_by,
    order_type,
    page,
    per_page,
    scan_type: scan_type ?? [5],
  });
}

/**
 * Get open ports
 */
export async function getOpenPorts(
  client: S4EClient
): Promise<S4EApiResponse<OpenPort[]>> {
  return client.request<OpenPort[]>("/dashboard/get-open-ports", {});
}

/**
 * Get monthly statistics
 */
export async function getMonthlyStats(
  client: S4EClient,
  month?: number
): Promise<S4EApiResponse<{ total_scans: number; total_urls: number }>> {
  return client.request("/dashboard/latest-scans-info-a-month", {
    ...(month && { month }),
  });
}

/**
 * Get user risk score from /risk/user-score
 */
export async function getUserRiskScore(
  client: S4EClient,
  params: {
    page?: number;
    per_page?: number;
    order_by?: "calculated_at" | "risk_score";
    order_type?: "asc" | "desc";
  } = {}
): Promise<S4EApiResponse<UserRiskScoreResponse>> {
  const {
    page = 1,
    per_page = 1,
    order_by = "calculated_at",
    order_type = "desc",
  } = params;

  return client.request<UserRiskScoreResponse>("/risk/user-score", {
    page,
    per_page,
    order_by,
    order_type,
  });
}

/**
 * Get combined scan history (all types)
 */
export async function getCombinedScanHistory(
  client: S4EClient,
  params: GetScanHistoryParams = {}
): Promise<{
  groupScans: ScanHistoryItem[];
  singleScans: ScanHistoryItem[];
  crawlerScans: ScanHistoryItem[];
}> {
  const [groupResult, singleResult, crawlerResult] = await Promise.all([
    getScanHistoryGroup(client, params),
    getScanHistorySingle(client, params),
    getCrawlerHistory(client, params),
  ]);

  return {
    groupScans: groupResult.success ? groupResult.data?.data || [] : [],
    singleScans: singleResult.success ? singleResult.data?.data || [] : [],
    crawlerScans: crawlerResult.success ? crawlerResult.data?.data || [] : [],
  };
}

/**
 * Format scan history
 */
export function formatScanHistory(scans: ScanHistoryItem[]): string {
  if (!scans || scans.length === 0) {
    return "No scan history found.";
  }

  const lines = scans.map((s, i) => {
    const statusLabel = SCAN_STATUS_LABELS[s.scan_status as ScanStatus] || "Unknown";
    const typeLabel = SCAN_TYPE_LABELS[s.scan_type as ScanType] || "Unknown";
    const statusIcon = getScanStatusIcon(s.scan_status as ScanStatus);
    const date = s.finished_at
      ? new Date(s.finished_at ).toLocaleString("en-US", { timeZone: "UTC" })
      : s.started_at
      ? new Date(s.started_at ).toLocaleString("en-US", { timeZone: "UTC" })
      : "Pending";

    return `${i + 1}. ${statusIcon} [${typeLabel}] ${s.asset}\n   Status: ${statusLabel} | Date: ${date}`;
  });

  return lines.join("\n\n");
}

/**
 * Format group scan history (`CstGroupScanStatus` — see GROUP_SCAN_STATUS_LABELS).
 */
export function formatGroupScanHistory(scans: ScanHistoryItem[]): string {
  if (!scans || scans.length === 0) {
    return "No scan history found.";
  }

  const lines = scans.map((s, i) => {
    const status = s.scan_status as GroupScanStatus;
    const statusLabel =
      status in GROUP_SCAN_STATUS_LABELS
        ? GROUP_SCAN_STATUS_LABELS[status]
        : "Unknown";
    const typeLabel = SCAN_TYPE_LABELS[s.scan_type as ScanType] || "Unknown";
    const statusIcon = getGroupScanStatusIcon(status);
    const date = s.finished_at
      ? new Date(s.finished_at ).toLocaleString("en-US", { timeZone: "UTC" })
      : s.started_at
        ? new Date(s.started_at ).toLocaleString("en-US", { timeZone: "UTC" })
        : "Pending";

    return `${i + 1}. ${statusIcon} [${typeLabel}] ${s.asset}\n   Status: ${statusLabel} | Date: ${date}`;
  });

  return lines.join("\n\n");
}

/**
 * Format open ports
 */
export function formatOpenPorts(ports: OpenPort[]): string {
  if (!ports || ports.length === 0) {
    return "No open ports found.";
  }

  const lines = ports
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((p, i) => {
      const service = p.service || getCommonService(p.port);
      const riskIcon = getPortRiskIcon(p.port);
      return `${i + 1}. ${riskIcon} Port ${p.port} (${service}): ${p.count} asset(s)`;
    });

  return `Most Common Open Ports:\n\n${lines.join("\n")}`;
}

/**
 * Format security summary with risk score
 */
export function formatSecuritySummary(
  severities: SeveritySummary[],
  totalAssets: number,
  openPorts: OpenPort[],
  riskEntry?: UserRiskEntry | null,
  assetRiskDetails?: AssetRiskDetail[]
): string {
  const total = severities.reduce((acc, s) => acc + s.count, 0);

  const severityLines = severities
    .sort((a, b) => b.severity - a.severity)
    .map((s) => {
      const label = SEVERITY_LABELS[s.severity as Severity] || "Unknown";
      const icon = getSeverityIcon(s.severity as Severity);
      return `${icon} ${label}: ${s.count}`;
    });

  const topPorts = openPorts
    .slice(0, 5)
    .map((p) => `  - Port ${p.port}: ${p.count} asset(s)`)
    .join("\n");

  let riskSection = "";
  if (riskEntry) {
    const score = riskEntry.risk_score;
    const riskIcon = getRiskScoreIcon(score);
    const riskLevel = getRiskScoreLevel(score);
    const calcDate = new Date(riskEntry.calculated_at).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

    riskSection = `\nOverall Security Score: ${riskIcon} ${score}/100 (${riskLevel})
Calculation Method: ${riskEntry.parameters.calculation_method}
Last Calculated: ${calcDate}`;

    if (assetRiskDetails && assetRiskDetails.length > 0) {
      const sorted = [...assetRiskDetails].sort((a, b) => a.risk_score - b.risk_score);
      const assetLines = sorted
        .slice(0, 10)
        .map((a) => {
          const icon = getRiskScoreIcon(a.risk_score);
          return `  ${icon} ${a.asset_name}: ${a.risk_score}/100`;
        })
        .join("\n");
      riskSection += `\n\nAsset Risk Scores (${riskEntry.parameters.total_assets} total):
${assetLines}`;
      if (sorted.length > 10) {
        riskSection += `\n  ... and ${sorted.length - 10} more`;
      }
    }
  }

  return `=== Security Summary ===
${riskSection}

Total Assets: ${totalAssets}
Total Vulnerabilities: ${total}

Severity Distribution:
${severityLines.join("\n")}

Open Ports (Top 5):
${topPorts || "  No data"}

Dashboard: ${APP_ORIGIN}`;
}

function getRiskScoreIcon(score: number): string {
  if (score === 0) return "⚪";
  if (score >= 80) return "🟢";
  if (score >= 60) return "🟡";
  if (score >= 40) return "🟠";
  return "🔴";
}

function getRiskScoreLevel(score: number): string {
  if (score === 0) return "Not Scanned";
  if (score >= 80) return "Low Risk";
  if (score >= 60) return "Medium Risk";
  if (score >= 40) return "High Risk";
  return "Critical Risk";
}

// Helper functions
function getScanStatusIcon(status: ScanStatus): string {
  switch (status) {
    case 0:
      return "⏳"; // Queued
    case 1:
      return "🔄"; // Running
    case 2:
      return "✅"; // Completed
    case 3:
      return "❌"; // Failed
    case 4:
      return "🚫"; // Cancelled
    case 5:
      return "⏱️"; // Timeout
    default:
      return "❓";
  }
}

function getGroupScanStatusIcon(status: GroupScanStatus): string {
  switch (status) {
    case 0:
      return "🔄"; // ONGOING
    case 1:
      return "✅"; // FINISHED
    case 2:
      return "❌"; // ERROR
    case 3:
      return "⏱️"; // DELAYED
    case 4:
      return "⚠️"; // INCOMPLETED
    case 5:
      return "🚫"; // CANCEL
    case 6:
      return "🔒"; // INACCESSIBLE
    case 7:
      return "⛔"; // TOO_MANY_INACCESSIBLE
    default:
      return "❓";
  }
}

function getSeverityIcon(severity: Severity): string {
  switch (severity) {
    case 5:
      return "🔴";
    case 4:
      return "🟠";
    case 3:
      return "🟡";
    case 2:
      return "🟢";
    case 1:
      return "🔵";
    default:
      return "⚪";
  }
}

function getPortRiskIcon(port: number): string {
  const highRiskPorts = [21, 23, 445, 3389, 5900];
  const mediumRiskPorts = [22, 25, 110, 143, 3306, 5432, 27017];

  if (highRiskPorts.includes(port)) return "🔴";
  if (mediumRiskPorts.includes(port)) return "🟡";
  return "🟢";
}

function getCommonService(port: number): string {
  const services: Record<number, string> = {
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    5900: "VNC",
    8080: "HTTP-Alt",
    8443: "HTTPS-Alt",
    27017: "MongoDB",
  };
  return services[port] || "Unknown";
}
