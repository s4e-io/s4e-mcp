/**
 * Tool Registry - Central tool definitions
 * Used by the HTTP entry point (src/http.ts).
 */

import { z } from "zod";
import { S4EClient } from "../core/client.js";
import { APP_ORIGIN } from "../core/config.js";
import { createToolResult } from "../core/index.js";
import {
  // User tools
  verifyToken,
  getUserInfo,
  getPackageInfo,
  // Help tools
  getHelp,
  listTopics,
  HelpTopic,
  // Scan tools
  startFullScan,
  startLightScan,
  startCrawlerScan,
  startSingleScan,
  listScans,
  formatScanList,
  getScanActivityLogs,
  SCAN_CATEGORY_SLUGS,
  ScanCategory,
  // Asset tools
  listAssets,
  getAssetDetail,
  addAssets,
  checkAssetOwnership,
  checkAssetType,
  getTagsWithAssetIds,
  updateAssetScanCategories,
  updateAssetDescription,
  formatAssetList,
  ASSET_DESCRIPTION_MIN_LENGTH,
  ASSET_DESCRIPTION_MAX_LENGTH,
  // Risk tools
  getAssetRiskScoreV2,
  getAssetScoreHistory,
  AssetRiskItem,
  // Crawler tools
  getCrawlerSettings,
  addExcludedUrls,
  addIncludedUrls,
  updateCrawlerHeader,
  formatCrawlerSettings,
  // Report tools
  getVulnerabilities,
  getSeveritySummary,
  exportReport,
  getReportHistory,
  formatVulnerabilityList,
  formatSeveritySummary,
  Severity,
  ReportStatus,
  // Dashboard tools
  getScanHistoryGroup,
  getOpenPorts,
  getUserRiskScore,
  formatGroupScanHistory,
  formatOpenPorts,
  formatSecuritySummary,
  GROUP_SCAN_STATUS_LABELS,
  // Action tools
  listActionsCatalog,
  listMyActions,
  assignAction,
  triggerAction,
  deleteAction,
  formatActionCatalog,
  formatMyActions,
  ACTION_STATUS_LABELS,
} from "./index.js";
import type { AssetRiskDetail } from "./index.js";

// Tool definition type
export interface ToolDefinition {
  name: string;
  description: string;
  schema: z.ZodObject<z.ZodRawShape>;
  handler: (client: S4EClient, params: Record<string, unknown>) => Promise<unknown>;
}

// Risk Score interpretation
// High score = Secure (good), Low score = Risky (bad)
// 100 = Most secure, 0 = Not yet scanned, 1-39 = Critical risk
interface RiskInterpretation {
  level: string;
  emoji: string;
  description: string;
  color: "green" | "yellow" | "orange" | "red" | "gray";
}

function buildRiskAnalysis(riskItem?: AssetRiskItem | null) {
  const riskScore = riskItem?.risk_score ?? 0;
  const riskInterpretation = interpretRiskScore(riskScore);
  const params = riskItem?.parameters;

  return {
    score: riskScore,
    interpretation: `${riskInterpretation.emoji} ${riskInterpretation.level}`,
    description: riskInterpretation.description,
    calculated_at: riskItem?.calculated_at ?? null,
    severities: params
      ? {
          critical: params.critical_count ?? 0,
          high: params.high_count ?? 0,
          medium: params.medium_count ?? 0,
          low: params.low_count ?? 0,
          info: params.info_count ?? 0,
        }
      : null,
    parameters: params ?? null,
    note: "High score = Secure (100 is best), Low score = Risky (closer to 0 is worse)",
  };
}

function buildScanCategoryStatusHelp() {
  return {
    categories: [...SCAN_CATEGORY_SLUGS],
    status_meaning: {
      true: "Enables the scan category for the asset",
      false: "Disables the scan category for the asset",
    },
    example_status_list: [
      {
        category_slug: "dns-controls",
        status: true,
      },
      {
        category_slug: "ssl-controls",
        status: false,
      },
    ],
  };
}

async function fetchRiskScoresByAssetIds(
  client: S4EClient,
  assetIds: number[]
): Promise<Map<number, AssetRiskItem>> {
  const riskMap = new Map<number, AssetRiskItem>();
  if (assetIds.length === 0) return riskMap;

  const result = await getAssetRiskScoreV2(client, {
    asset_ids: assetIds,
    per_page: Math.min(assetIds.length, 50),
    page: 1,
    order_by: "calculated_at",
    order_type: "desc",
    if_unique: true,
  });

  if (result.success && result.data?.asset_risk) {
    for (const item of result.data.asset_risk) {
      riskMap.set(item.asset_id, item);
    }
  }

  return riskMap;
}

function interpretRiskScore(score: number): RiskInterpretation {
  if (score === 0) {
    return {
      level: "Not Scanned",
      emoji: "⚪",
      description: "No security scan has been performed yet",
      color: "gray",
    };
  }
  if (score >= 80) {
    return {
      level: "Low Risk",
      emoji: "🟢",
      description: "Security posture is good - No critical vulnerabilities",
      color: "green",
    };
  }
  if (score >= 60) {
    return {
      level: "Medium Risk",
      emoji: "🟡",
      description: "Some improvements recommended",
      color: "yellow",
    };
  }
  if (score >= 40) {
    return {
      level: "High Risk",
      emoji: "🟠",
      description: "Attention needed - Security vulnerabilities present",
      color: "orange",
    };
  }
  return {
    level: "Critical Risk",
    emoji: "🔴",
    description: "Urgent action required - Serious security vulnerabilities detected",
    color: "red",
  };
}

// ============================================
// Tool Definitions
// ============================================

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  // ==================== USER TOOLS ====================
  {
    name: "verify_token",
    description: "Verify if the S4E.io API token is valid",
    schema: z.object({}),
    handler: async (client) => {
      const result = await verifyToken(client);
      if (result.success && result.data) {
        return createToolResult({
          success: true,
          message: "Token is valid",
          user: result.data,
        });
      }
      return createToolResult({
        success: false,
        message: "Token is invalid",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "get_user_info",
    description: "Get S4E.io account information",
    schema: z.object({}),
    handler: async (client) => {
      const result = await getUserInfo(client);
      return createToolResult(result);
    },
  },

  // ==================== HELP TOOLS ====================
  {
    name: "get_help",
    description: `Get help about S4E.io. Topics: overview, quickstart, asset_guide, troubleshooting, about,
user:verify_token, user:info, user:api_token, scan:overview, scan:full_scan, scan:light_scan,
scan:crawler_scan, asset:overview, asset:list_assets, asset:asset_detail, asset:verify_asset,
asset:add_assets, asset:check_ownership, crawler:overview, crawler:get_settings, crawler:excluded_urls,
crawler:included_urls, crawler:custom_headers, report:overview, report:get_vulnerabilities,
report:severity_summary, report:export_report, report:vulnerability_categories, dashboard:overview,
dashboard:security_summary, dashboard:scan_history, dashboard:open_ports, dashboard:monthly_stats,
action:overview, action:catalog, action:assign, action:trigger, action:delete, action:list_my`,
    schema: z.object({
      topic: z.string().optional().default("overview").describe("Help topic"),
    }),
    handler: async (_client, params) => {
      const topic = (params.topic as string) || "overview";
      const helpText = getHelp(topic as HelpTopic);
      return { content: [{ type: "text" as const, text: helpText }] };
    },
  },
  {
    name: "list_help_topics",
    description: "List all available help topics",
    schema: z.object({}),
    handler: async () => {
      const topicList = listTopics();
      return { content: [{ type: "text" as const, text: topicList }] };
    },
  },

  // ==================== SCAN TOOLS ====================
  {
    name: "start_full_scan",
    description: `Start a comprehensive security scan (Full Scan).
10,000+ vulnerability checks: SQL Injection, XSS, SSRF, CSRF, XXE, DNS, SSL, misconfiguration.
Pass either 'asset' (domain — resolved to asset_id) OR 'asset_id' directly to skip lookup.`,
    schema: z.object({
      asset: z.string().optional().describe("Domain or IP (e.g. example.com). Server resolves to asset_id."),
      asset_id: z.number().optional().describe("Numeric asset id (from list_assets). Skips lookup."),
    }),
    handler: async (client, params) => {
      const asset = params.asset as string | undefined;
      const assetId = params.asset_id as number | undefined;
      const result = await startFullScan(client, { asset, assetId });
      const label = asset ?? `asset_id ${assetId}`;
      if (result.success && result.data) {
        const scanId = result.data.scan_id;
        return createToolResult({
          success: true,
          message: `Full scan started: ${label}`,
          data: result.data,
          info: {
            scan_type: "Full Scan",
            description: "Comprehensive security scan with 10,000+ vulnerability checks",
            scan_result_url: scanId ? `${APP_ORIGIN}/result/group-scan/${scanId}` : undefined,
            all_reports_url: `${APP_ORIGIN}/scan-reports`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to start full scan",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "start_light_scan",
    description: `Start a quick security scan (Light Scan).
Basic checks: DNS, SSL/TLS, misconfiguration, network vulnerabilities.
Pass either 'asset' (domain — resolved to asset_id) OR 'asset_id' directly to skip lookup.`,
    schema: z.object({
      asset: z.string().optional().describe("Domain or IP (e.g. example.com). Server resolves to asset_id."),
      asset_id: z.number().optional().describe("Numeric asset id (from list_assets). Skips lookup."),
    }),
    handler: async (client, params) => {
      const asset = params.asset as string | undefined;
      const assetId = params.asset_id as number | undefined;
      const result = await startLightScan(client, { asset, assetId });
      const label = asset ?? `asset_id ${assetId}`;
      if (result.success && result.data) {
        const scanId = result.data.scan_id;
        return createToolResult({
          success: true,
          message: `Light scan started: ${label}`,
          data: result.data,
          info: {
            scan_type: "Light Scan",
            description: "Quick scan with basic security checks",
            scan_result_url: scanId ? `${APP_ORIGIN}/result/group-scan/${scanId}` : undefined,
            all_reports_url: `${APP_ORIGIN}/scan-reports`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to start light scan",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "start_crawler_scan",
    description: `Discover URLs and links (Crawler Scan).
Does not perform security tests, only maps the site structure.
Pass either domain string in 'asset' (server resolves to asset_id) OR pass 'asset_id' directly to skip lookup.`,
    schema: z.object({
      asset: z.string().optional().describe("Domain to crawl (e.g. example.com). Server will resolve to asset_id."),
      asset_id: z.number().optional().describe("Numeric asset id (from list_assets). Skips the lookup step — use when you already know it."),
    }),
    handler: async (client, params) => {
      const asset = params.asset as string | undefined;
      const assetId = params.asset_id as number | undefined;
      const result = await startCrawlerScan(client, { asset, assetId });
      const label = asset ?? `asset_id ${assetId}`;
      if (result.success && result.data) {
        const scanId = result.data.scan_id;
        return createToolResult({
          success: true,
          message: `Crawler scan started: ${label}`,
          data: result.data,
          info: {
            scan_type: "Crawler Scan",
            description: "URL discovery scan that maps site structure",
            note: "This scan does NOT perform security tests",
            scan_result_url: scanId ? `${APP_ORIGIN}/result/crawl-only/${scanId}` : undefined,
            all_reports_url: `${APP_ORIGIN}/scan-reports`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to start crawler scan",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "check_capability",
    description: `Check if S4E can perform a specific security check.
Use this when users ask "Can S4E do this?" or "Can it scan for SQL injection?".
Examples: "sql injection", "xss", "ssl", "dns", "cve-2021-44228", "log4j", "subdomain", "port scan"`,
    schema: z.object({
      query: z.string().describe("Security feature to search for (e.g. 'sql injection', 'xss', 'ssl certificate', 'cve')"),
    }),
    handler: async (client, params) => {
      const query = params.query as string;

      // Try different search terms
      const searchTerms = [query];

      // Common mappings
      const mappings: Record<string, string[]> = {
        "sql": ["sql", "injection", "sqli"],
        "xss": ["xss", "cross-site", "script"],
        "ssl": ["ssl", "tls", "certificate", "https"],
        "dns": ["dns", "record", "zone"],
        "subdomain": ["subdomain", "dns", "enumeration"],
        "port": ["port", "network", "tcp", "udp"],
        "cve": ["cve"],
        "log4j": ["log4j", "cve-2021-44228"],
        "rce": ["rce", "remote", "command", "execution"],
        "lfi": ["lfi", "local", "file", "inclusion"],
        "ssrf": ["ssrf", "server-side", "request"],
        "xxe": ["xxe", "xml", "entity"],
        "csrf": ["csrf", "cross-site", "request", "forgery"],
      };

      // Add matching mappings
      for (const [key, values] of Object.entries(mappings)) {
        if (query.toLowerCase().includes(key)) {
          searchTerms.push(...values);
        }
      }

      // Run all searches and merge results
      const allScans: Array<{ slug: string; name: string; description?: string; cvss_score?: number }> = [];
      const seenSlugs = new Set<string>();

      for (const term of [...new Set(searchTerms)].slice(0, 3)) {
        const result = await listScans(client, { query: term, per_page: 10 });
        if (result.success && result.data) {
          const scans = result.data.scans || result.data.data || [];
          for (const scan of scans) {
            if (!seenSlugs.has(scan.slug)) {
              seenSlugs.add(scan.slug);
              allScans.push(scan);
            }
          }
        }
      }

      if (allScans.length > 0) {
        const scanList = allScans.slice(0, 10).map(s => {
          const score = s.cvss_score ? ` (CVSS: ${s.cvss_score})` : "";
          return `- **${s.name}**${score}\n  Slug: \`${s.slug}\``;
        }).join("\n");

        return createToolResult({
          success: true,
          message: `Yes! S4E can perform ${allScans.length} different checks related to "${query}"`,
          answer: `✅ S4E supports this feature!`,
          found_scans: allScans.slice(0, 10),
          formatted: `# Can S4E Check "${query}"?\n\n✅ **YES!** ${allScans.length} related scan(s) found:\n\n${scanList}`,
          info: {
            how_to_use: `To start one of these scans, use the start_single_scan tool`,
            example: `start_single_scan(asset: "example.com", slug: "${allScans[0].slug}")`,
          },
        });
      }

      // Try category-based search
      const categories: ScanCategory[] = [
        "dns-controls", "ssl-controls", "web-vulnerabilities",
        "network-vulnerabilities", "misconfiguration"
      ];

      let categoryMatch = null;
      if (query.toLowerCase().includes("dns")) categoryMatch = "dns-controls";
      else if (query.toLowerCase().includes("ssl") || query.toLowerCase().includes("tls")) categoryMatch = "ssl-controls";
      else if (query.toLowerCase().includes("web")) categoryMatch = "web-vulnerabilities";
      else if (query.toLowerCase().includes("network") || query.toLowerCase().includes("port")) categoryMatch = "network-vulnerabilities";

      if (categoryMatch) {
        const categoryResult = await listScans(client, { scan_category_slug: categoryMatch as ScanCategory, per_page: 5 });
        if (categoryResult.success && categoryResult.data) {
          const scans = categoryResult.data.scans || categoryResult.data.data || [];
          if (scans.length > 0) {
            return createToolResult({
              success: true,
              message: `No direct results for "${query}" but related scans found in "${categoryMatch}" category`,
              answer: `🔍 No direct match, but a related category was found`,
              found_scans: scans.slice(0, 5),
              info: {
                category: categoryMatch,
                suggestion: "Try a more specific term or use list_scans to see all scans",
              },
            });
          }
        }
      }

      return createToolResult({
        success: false,
        message: `No scan found related to "${query}"`,
        answer: `❌ This feature is not currently supported or may exist under a different name`,
        info: {
          suggestions: [
            "Try different keywords (e.g. 'injection' instead of 'sql')",
            "Use the list_scans tool to see all available scans",
            "Browse categories: dns-controls, ssl-controls, web-vulnerabilities",
          ],
          available_categories: categories,
        },
      });
    },
  },
  {
    name: "list_scans",
    description: `List available scan types.
Categories: dns-controls, ssl-controls, misconfiguration, network-vulnerabilities, web-vulnerabilities, information-scans, product-based-web-vulnerabilities, product-based-network-vulnerabilities, exposed-panels`,
    schema: z.object({
      query: z.string().optional().describe("Search text (e.g. 'cve', 'sql', 'xss')"),
      category: z.string().optional().describe("Category filter (e.g. 'dns-controls')"),
      page: z.number().optional().default(1).describe("Page number"),
      per_page: z.number().optional().default(20).describe("Results per page"),
    }),
    handler: async (client, params) => {
      const query = params.query as string | undefined;
      const category = params.category as ScanCategory | undefined;
      const page = (params.page as number) || 1;
      const per_page = (params.per_page as number) || 20;

      const result = await listScans(client, {
        query,
        scan_category_slug: category,
        page,
        per_page,
      });

      if (result.success && result.data) {
        const scans = result.data.scans || result.data.data || [];
        return createToolResult({
          success: true,
          message: `${scans.length} scan type(s) found`,
          formatted: formatScanList(scans),
          data: scans,
          info: {
            total_count: result.data.total_count,
            page,
            categories: [
              "dns-controls", "ssl-controls", "misconfiguration",
              "network-vulnerabilities", "web-vulnerabilities",
              "information-scans", "exposed-panels"
            ],
            usage: "To start a specific scan, use the start_single_scan tool",
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve scan list",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "start_single_scan",
    description: `Start a single vulnerability check (Single Scan).
Runs a specific security check. Find the slug using list_scans.
Examples: txt-record-lookup, ssl-certificate-check, cve-2021-44228`,
    schema: z.object({
      asset: z.string().describe("Domain or IP to scan (e.g. example.com)"),
      slug: z.string().describe("Scan slug (e.g. txt-record-lookup, ssl-certificate-check)"),
      port: z.number().optional().describe("Port number (optional)"),
    }),
    handler: async (client, params) => {
      const asset = params.asset as string;
      const slug = params.slug as string;
      const port = params.port as number | undefined;

      const result = await startSingleScan(client, {
        asset,
        slug,
        ...(port ? { port } : {}),
      });

      if (result.success && result.data) {
        const scanId = result.data.scan_id;
        return createToolResult({
          success: true,
          message: `Single scan started: ${slug} -> ${asset}`,
          data: result.data,
          info: {
            scan_type: "Single Scan",
            scan_slug: slug,
            asset,
            scan_result_url: scanId ? `${APP_ORIGIN}/result/single-scan/${scanId}` : undefined,
            all_reports_url: `${APP_ORIGIN}/scan-reports`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to start single scan",
        error: result.error || result.message,
      });
    },
  },

  // ==================== ASSET TOOLS ====================
  {
    name: "list_assets",
    description: "Get asset list. Lists domains, IPs and other digital assets in your account",
    schema: z.object({
      search: z.string().optional().describe("Search text"),
      verified: z.boolean().optional().describe("Only verified assets"),
      page: z.number().optional().default(1).describe("Page number"),
      per_page: z.number().optional().default(20).describe("Results per page"),
    }),
    handler: async (client, params) => {
      const search = params.search as string | undefined;
      const verified = params.verified as boolean | undefined;
      const page = (params.page as number) || 1;
      const per_page = (params.per_page as number) || 20;

      const result = await listAssets(client, {
        page,
        per_page,
        ...(search ? { search_text: search } : {}),
        ...(verified !== undefined ? { if_verified: verified } : {}),
      });

      if (result.success && result.data) {
        const assets = result.data.asset || [];
        const assetIds = assets.map((a: { id: number }) => a.id);
        const riskMap = await fetchRiskScoresByAssetIds(client, assetIds);
        const assetsWithRisk = assets.map((a: { id: number; [key: string]: unknown }) => {
          const riskItem = riskMap.get(a.id);
          const riskAnalysis = buildRiskAnalysis(riskItem);
          return {
            ...a,
            risk_score: riskItem?.risk_score ?? null,
            risk_interpretation: riskAnalysis.interpretation,
          };
        });
        return createToolResult({
          success: true,
          message: `${assets.length} asset(s) found`,
          formatted: formatAssetList(assets),
          data: assetsWithRisk,
          info: {
            total_count: result.data.count,
            page,
            per_page,
            risk_score_note: "High score = Secure (100 is best), Low score = Risky",
            dashboard_url: `${APP_ORIGIN}/asset-manager`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve asset list",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "get_asset_detail",
    description: "Get details of a specific asset",
    schema: z.object({
      asset: z.string().describe("Domain or IP address (e.g. example.com)"),
    }),
    handler: async (client, params) => {
      const asset = params.asset as string;
      const [result, riskResult] = await Promise.all([
        getAssetDetail(client, { asset }),
        getAssetRiskScoreV2(client, {
          assets: [asset],
          page: 1,
          per_page: 1,
          order_by: "calculated_at",
          order_type: "desc",
        }),
      ]);

      if (result.success && result.data) {
        const riskItem = riskResult.success ? riskResult.data?.asset_risk?.[0] : undefined;
        const riskAnalysis = buildRiskAnalysis(riskItem);

        return createToolResult({
          success: true,
          message: `Asset detail: ${asset}`,
          data: result.data,
          risk_analysis: riskAnalysis,
          info: {
            dashboard_url: `${APP_ORIGIN}/asset-manager`,
            risk_source: riskItem ? "/risk/asset-score" : null,
            actions: [
              "To start a scan: 'start full scan'",
              "To see vulnerabilities: 'list vulnerabilities'",
              "To see risk history: 'get asset risk history'",
            ],
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve asset detail",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "get_asset_risk_score",
    description: "Get detailed risk scores for assets (V2). Includes severity counts and risk parameters.",
    schema: z.object({
      asset: z.string().optional().describe("Single asset name (domain or IP)"),
      assets: z.string().optional().describe("Comma-separated asset names"),
      asset_ids: z.array(z.number()).optional().describe("Asset IDs to filter"),
      tag: z.string().optional().describe("Tag to filter assets"),
      page: z.number().optional().default(1).describe("Page number"),
      per_page: z.number().optional().default(20).describe("Results per page"),
      order_by: z.enum(["calculated_at", "asset_id", "risk_score"]).optional().default("calculated_at"),
      order_type: z.enum(["asc", "desc"]).optional().default("desc"),
      if_unique: z.boolean().optional().describe("Return only the latest score per asset"),
    }),
    handler: async (client, params) => {
      const asset = params.asset as string | undefined;
      const assetsStr = params.assets as string | undefined;
      const asset_ids = params.asset_ids as number[] | undefined;
      const tag = params.tag as string | undefined;
      const page = (params.page as number) || 1;
      const per_page = (params.per_page as number) || 20;
      const order_by = (params.order_by as "calculated_at" | "asset_id" | "risk_score") || "calculated_at";
      const order_type = (params.order_type as "asc" | "desc") || "desc";
      const if_unique = params.if_unique as boolean | undefined;

      const assetNames = [
        ...(asset ? [asset] : []),
        ...(assetsStr ? assetsStr.split(",").map((a) => a.trim()).filter(Boolean) : []),
      ];

      if (!asset_ids?.length && assetNames.length === 0 && !tag) {
        return createToolResult({
          success: false,
          message: "At least one filter is required",
          error: "Provide asset, assets, asset_ids, or tag",
        });
      }

      const result = await getAssetRiskScoreV2(client, {
        ...(asset_ids?.length ? { asset_ids } : {}),
        ...(assetNames.length ? { assets: assetNames } : {}),
        ...(tag ? { tag } : {}),
        page,
        per_page,
        order_by,
        order_type,
        ...(if_unique !== undefined ? { if_unique } : {}),
      });

      if (result.success && result.data) {
        const items = result.data.asset_risk || [];
        return createToolResult({
          success: true,
          message: `${items.length} asset risk score(s) found`,
          data: {
            asset_risk: items.map((item) => ({
              ...item,
              risk_analysis: buildRiskAnalysis(item),
            })),
            count: result.data.count,
          },
          info: {
            risk_score_note: "High score = Secure (100 is best), Low score = Risky",
            dashboard_url: `${APP_ORIGIN}/asset-manager`,
          },
        });
      }

      return createToolResult({
        success: false,
        message: "Failed to retrieve asset risk scores",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "get_asset_risk_history",
    description: "Get historical risk scores for assets. Shows how risk score changed over time.",
    schema: z.object({
      asset: z.string().optional().describe("Single asset name (domain or IP)"),
      assets: z.string().optional().describe("Comma-separated asset names"),
      asset_ids: z.array(z.number()).optional().describe("Asset IDs to filter"),
      tag: z.string().optional().describe("Tag to filter assets"),
      page: z.number().optional().default(1).describe("Page number"),
      per_page: z.number().optional().default(20).describe("Results per page"),
      order_by: z.enum(["calculated_at", "risk_score", "asset_id"]).optional().default("calculated_at"),
      order_type: z.enum(["asc", "desc"]).optional().default("desc"),
    }),
    handler: async (client, params) => {
      const asset = params.asset as string | undefined;
      const assetsStr = params.assets as string | undefined;
      const asset_ids = params.asset_ids as number[] | undefined;
      const tag = params.tag as string | undefined;
      const page = (params.page as number) || 1;
      const per_page = (params.per_page as number) || 20;
      const order_by = (params.order_by as "calculated_at" | "risk_score" | "asset_id") || "calculated_at";
      const order_type = (params.order_type as "asc" | "desc") || "desc";

      const assetNames = [
        ...(asset ? [asset] : []),
        ...(assetsStr ? assetsStr.split(",").map((a) => a.trim()).filter(Boolean) : []),
      ];

      if (!asset_ids?.length && assetNames.length === 0 && !tag) {
        return createToolResult({
          success: false,
          message: "At least one filter is required",
          error: "Provide asset, assets, asset_ids, or tag",
        });
      }

      const result = await getAssetScoreHistory(client, {
        ...(asset_ids?.length ? { asset_ids } : {}),
        ...(assetNames.length ? { assets: assetNames } : {}),
        ...(tag ? { tag } : {}),
        page,
        per_page,
        order_by,
        order_type,
      });

      if (result.success && result.data) {
        const history = result.data.data || [];
        return createToolResult({
          success: true,
          message: `${history.length} risk history record(s) found`,
          data: {
            history: history.map((entry) => ({
              ...entry,
              risk_analysis: buildRiskAnalysis(entry),
            })),
            count: result.data.count,
          },
          info: {
            risk_score_note: "High score = Secure (100 is best), Low score = Risky",
            dashboard_url: `${APP_ORIGIN}/asset-manager`,
          },
        });
      }

      return createToolResult({
        success: false,
        message: "Failed to retrieve asset risk history",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "add_assets",
    description: "Add new assets. Multiple domains, IPs or CIDRs can be added. Automatically checks ownership first.",
    schema: z.object({
      assets: z.string().describe("Assets to add (comma-separated, e.g. example.com,test.com)"),
      description: z.string().optional().describe("Asset description"),
    }),
    handler: async (client, params) => {
      const assetsStr = params.assets as string;
      const description = params.description as string | undefined;
      const assetList = assetsStr.split(",").map((a) => a.trim()).filter((a) => a.length > 0);

      if (assetList.length === 0) {
        return createToolResult({
          success: false,
          message: "At least one asset is required",
          error: "Asset list is empty",
        });
      }

      // 1. Check ownership first
      const ownershipResult = await checkAssetOwnership(client, { assets: assetList });

      if (!ownershipResult.success) {
        return createToolResult({
          success: false,
          message: "Ownership check failed",
          error: ownershipResult.error || ownershipResult.message,
        });
      }

      // 2. Analyze ownership results
      const ownershipData = ownershipResult.data as { results?: Array<{ asset: string; available: boolean; reason?: string }> } | null;
      const results = ownershipData?.results || [];

      const availableAssets: string[] = [];
      const unavailableAssets: Array<{ asset: string; reason: string }> = [];

      for (const assetToCheck of assetList) {
        const ownershipInfo = results.find((r) => r.asset === assetToCheck);
        if (ownershipInfo) {
          if (ownershipInfo.available) {
            availableAssets.push(assetToCheck);
          } else {
            unavailableAssets.push({
              asset: assetToCheck,
              reason: ownershipInfo.reason || "Already owned by another user",
            });
          }
        } else {
          // If no result from ownership API, try adding anyway
          availableAssets.push(assetToCheck);
        }
      }

      // 3. If no available assets, return error
      if (availableAssets.length === 0) {
        return createToolResult({
          success: false,
          message: "No assets could be added - all are already owned by others",
          data: {
            unavailable_assets: unavailableAssets,
          },
          info: {
            note: "These assets are already claimed by other users",
          },
        });
      }

      // 4. Add available assets
      const addResult = await addAssets(client, {
        assets: availableAssets,
        source: "manuel",
        ...(description ? { description } : {}),
      });

      if (addResult.success) {
        return createToolResult({
          success: true,
          message: `${availableAssets.length} asset addition request sent`,
          data: {
            added: addResult.data,
            available_assets: availableAssets,
            unavailable_assets: unavailableAssets.length > 0 ? unavailableAssets : undefined,
          },
          info: {
            assets_added: availableAssets,
            assets_skipped: unavailableAssets.length > 0
              ? `${unavailableAssets.length} asset(s) skipped because they are already owned by others`
              : undefined,
            next_step: "You need to verify your assets. Unverified assets are automatically deleted after 24 hours.",
            verify_url: `${APP_ORIGIN}/asset-manager`,
            verify_note: `To verify, go to S4E Dashboard: select your asset on ${APP_ORIGIN}/asset-manager and click 'Verify'.`,
            integrations: {
              description: "You can add and auto-verify assets faster using integrations",
              integrations_url: `${APP_ORIGIN}/integrations`,
              available: [
                {
                  name: "DigitalOcean",
                  description: "Effortlessly manage and import your domains via DigitalOcean. You can choose between automatic syncing or manual addition of domains.",
                },
                {
                  name: "Cloudflare",
                  description: "Easily import and manage your domains through Cloudflare. You can choose to sync domains automatically or add them manually.",
                },
              ],
            },
            dashboard_url: `${APP_ORIGIN}/asset-manager`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to add assets",
        error: addResult.error || addResult.message,
      });
    },
  },
  {
    name: "check_asset_ownership",
    description: "Check if assets are available. Verifies if they are already owned by someone else",
    schema: z.object({
      assets: z.string().describe("Assets to check (comma-separated)"),
    }),
    handler: async (client, params) => {
      const assetsStr = params.assets as string;
      const assetList = assetsStr.split(",").map((a) => a.trim()).filter((a) => a.length > 0);

      if (assetList.length === 0) {
        return createToolResult({
          success: false,
          message: "At least one asset is required",
          error: "Asset list is empty",
        });
      }

      const result = await checkAssetOwnership(client, { assets: assetList });

      if (result.success && result.data) {
        return createToolResult({
          success: true,
          message: `Ownership check completed for ${assetList.length} asset(s)`,
          data: result.data,
          info: {
            help: "Use 'add assets' to add available assets",
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Ownership check failed",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "check_asset_type",
    description: "Check if assets have valid format/type (domain, IP, CIDR)",
    schema: z.object({
      assets: z.string().describe("Assets to check (comma-separated)"),
    }),
    handler: async (client, params) => {
      const assetsStr = params.assets as string;
      const assetList = assetsStr.split(",").map((a) => a.trim()).filter((a) => a.length > 0);

      if (assetList.length === 0) {
        return createToolResult({
          success: false,
          message: "At least one asset is required",
          error: "Asset list is empty",
        });
      }

      const result = await checkAssetType(client, { assets: assetList });

      if (result.success && result.data) {
        return createToolResult({
          success: true,
          message: `Type check completed for ${assetList.length} asset(s)`,
          data: result.data,
          info: {
            valid_types: ["domain", "subdomain", "ipv4", "ipv6", "cidr"],
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Type check failed",
        error: result.error || result.message,
      });
    },
  },

  // ==================== CRAWLER TOOLS ====================
  {
    name: "get_crawler_settings",
    description: "Get crawler settings. Shows the crawler configuration for a specific asset",
    schema: z.object({
      asset_id: z.number().describe("Asset ID (number)"),
    }),
    handler: async (client, params) => {
      const asset_id = params.asset_id as number;
      const result = await getCrawlerSettings(client, { asset_id });
      
      if (result.success && result.data) {
        return createToolResult({
          success: true,
          message: `Crawler settings: Asset ID ${asset_id}`,
          formatted: formatCrawlerSettings(result.data.data),
          data: result.data,
          info: {
            dashboard_url: `${APP_ORIGIN}/asset-manager`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve crawler settings",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "add_excluded_urls",
    description: "Exclude URLs from crawler. Specified URL patterns will not be scanned",
    schema: z.object({
      asset_id: z.number().describe("Asset ID (number)"),
      urls: z.string().describe("URLs to exclude (comma-separated)"),
    }),
    handler: async (client, params) => {
      const asset_id = params.asset_id as number;
      const urlsStr = params.urls as string;
      const urlList = urlsStr.split(",").map((u) => u.trim()).filter((u) => u.length > 0);

      if (urlList.length === 0) {
        return createToolResult({
          success: false,
          message: "At least one URL is required",
          error: "URL list is empty",
        });
      }

      const result = await addExcludedUrls(client, { asset_id, urls: urlList });

      if (result.success) {
        return createToolResult({
          success: true,
          message: `${urlList.length} URL(s) added to exclusion list`,
          data: result.data,
          info: {
            excluded_urls: urlList,
            note: "These URLs will not be scanned by the crawler",
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to exclude URLs",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "add_included_urls",
    description: "Add URLs to crawler. Specified URLs will always be scanned",
    schema: z.object({
      asset_id: z.number().describe("Asset ID (number)"),
      urls: z.string().describe("URLs to include (comma-separated)"),
    }),
    handler: async (client, params) => {
      const asset_id = params.asset_id as number;
      const urlsStr = params.urls as string;
      const urlList = urlsStr.split(",").map((u) => u.trim()).filter((u) => u.length > 0);

      if (urlList.length === 0) {
        return createToolResult({
          success: false,
          message: "At least one URL is required",
          error: "URL list is empty",
        });
      }

      const result = await addIncludedUrls(client, { asset_id, urls: urlList });

      if (result.success) {
        return createToolResult({
          success: true,
          message: `${urlList.length} URL(s) added to inclusion list`,
          data: result.data,
          info: {
            included_urls: urlList,
            note: "These URLs will always be scanned by the crawler",
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to add URLs",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "update_crawler_header",
    description: "Update crawler headers. Add custom HTTP headers (Authentication, etc.)",
    schema: z.object({
      asset_id: z.number().describe("Asset ID (number)"),
      header_name: z.string().describe("Header name (e.g. Authorization)"),
      header_value: z.string().describe("Header value (e.g. Bearer token123)"),
    }),
    handler: async (client, params) => {
      const asset_id = params.asset_id as number;
      const header_name = params.header_name as string;
      const header_value = params.header_value as string;

      if (!header_name || !header_value) {
        return createToolResult({
          success: false,
          message: "Header name and value are required",
          error: "Missing parameter",
        });
      }

      const headers: Record<string, string> = {
        [header_name]: header_value,
      };

      const result = await updateCrawlerHeader(client, { asset_id, headers });

      if (result.success) {
        return createToolResult({
          success: true,
          message: "Crawler header updated",
          data: result.data,
          info: {
            header: { [header_name]: header_value },
            note: "Header will be added to crawler requests",
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to update header",
        error: result.error || result.message,
      });
    },
  },

  // ==================== REPORT TOOLS ====================
  {
    name: "get_vulnerabilities",
    description: `Get vulnerability list. Lists security vulnerabilities detected during scans.
Severity: 1=Info, 2=Low, 3=Medium, 4=High, 5=Critical
Status: 0=Open, 1=Fixed, 4=False Positive`,
    schema: z.object({
      asset: z.string().optional().describe("Filter by domain or IP"),
      severity: z.string().optional().describe("Severity filter (e.g. '4,5' for High+Critical)"),
      status: z.string().optional().describe("Status filter (e.g. '0' for Open)"),
      page: z.number().optional().default(1).describe("Page number"),
      per_page: z.number().optional().default(20).describe("Results per page"),
    }),
    handler: async (client, params) => {
      const asset = params.asset as string | undefined;
      const severity = params.severity as string | undefined;
      const status = params.status as string | undefined;
      const page = (params.page as number) || 1;
      const per_page = (params.per_page as number) || 20;

      const result = await getVulnerabilities(client, {
        page,
        per_page,
        ...(asset ? { asset } : {}),
        ...(severity ? { severity: severity.split(",").map((s) => parseInt(s.trim())) as Severity[] } : {}),
        ...(status ? { report_status: status.split(",").map((s) => parseInt(s.trim())) as ReportStatus[] } : {}),
      });

      if (result.success && result.data) {
        const reports = result.data.report || [];
        return createToolResult({
          success: true,
          message: `${reports.length} vulnerability(ies) found`,
          formatted: formatVulnerabilityList(reports),
          data: reports,
          info: {
            total_count: result.data.total_count,
            page,
            reports_url: `${APP_ORIGIN}/scan-reports`,
            overview_url: `${APP_ORIGIN}/scan-report-overview`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve vulnerability list",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "get_severity_summary",
    description: "Get vulnerability severity summary. Shows vulnerability counts per severity level",
    schema: z.object({
      asset: z.string().optional().describe("Filter by domain or IP"),
    }),
    handler: async (client, params) => {
      const asset = params.asset as string | undefined;
      const result = await getSeveritySummary(client, asset);

      if (result.success && result.data) {
        const summaries = result.data || [];
        return createToolResult({
          success: true,
          message: "Vulnerability summary",
          formatted: formatSeveritySummary(summaries),
          data: summaries,
          info: {
            interpretation: {
              "0 Critical/High": "Security posture is good",
              "1-5 Critical/High": "Attention needed",
              "5+ Critical/High": "Take urgent action",
            },
            overview_url: `${APP_ORIGIN}/scan-report-overview`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve severity summary",
        error: result.error || result.message,
      });
    },
  },
  // {
  //   name: "export_report",
  //   description: "Export vulnerability report. Download in PDF, CSV, JSON or HTML format",
  //   schema: z.object({
  //     format: z.enum(["pdf", "csv", "json", "html"]).describe("Export format"),
  //     asset: z.string().optional().describe("Filter by domain or IP"),
  //     severity: z.string().optional().describe("Severity filter (e.g. '4,5')"),
  //   }),
  //   handler: async (client, params) => {
  //     const format = params.format as "pdf" | "csv" | "json" | "html";
  //     const asset = params.asset as string | undefined;
  //     const severity = params.severity as string | undefined;

  //     const result = await exportReport(client, {
  //       output_type: format,
  //       ...(asset ? { asset } : {}),
  //       ...(severity ? { severity: severity.split(",").map((s) => parseInt(s.trim())) as Severity[] } : {}),
  //     });

  //     if (result.success && result.data) {
  //       return createToolResult({
  //         success: true,
  //         message: `Report prepared in ${format.toUpperCase()} format`,
  //         data: result.data,
  //         info: {
  //           format,
  //           reports_url: `${APP_ORIGIN}/scan-reports`,
  //         },
  //       });
  //     }
  //     return createToolResult({
  //       success: false,
  //       message: "Failed to export report",
  //       error: result.error || result.message,
  //     });
  //   },
  // },

  // ==================== DASHBOARD TOOLS ====================
  {
    name: "get_security_summary",
    description: "Get overall security summary. Includes user risk score, per-asset risk scores, vulnerability severity distribution and open ports",
    schema: z.object({}),
    handler: async (client) => {
      const [severityResult, portsResult, assetsResult, riskResult] = await Promise.all([
        getSeveritySummary(client),
        getOpenPorts(client),
        listAssets(client, { per_page: 100 }),
        getUserRiskScore(client, { per_page: 1, order_by: "calculated_at", order_type: "desc" }),
      ]);

      const severities = severityResult.success ? severityResult.data || [] : [];
      const ports = portsResult.success ? portsResult.data || [] : [];
      const assets = assetsResult.success && assetsResult.data
        ? assetsResult.data.asset || []
        : [];
      const totalAssets = assetsResult.success && assetsResult.data
        ? assetsResult.data.count || 0
        : 0;

      const riskEntry = riskResult.success && riskResult.data?.user_risk?.length
        ? riskResult.data.user_risk[0]
        : null;

      const assetMap = new Map<string, string>();
      for (const a of assets) {
        assetMap.set(String(a.id), a.asset);
      }

      let assetRiskDetails: AssetRiskDetail[] = [];
      if (riskEntry) {
        assetRiskDetails = Object.entries(riskEntry.parameters.asset_scores).map(
          ([assetId, score]) => ({
            asset_id: parseInt(assetId, 10),
            asset_name: assetMap.get(assetId) || `asset#${assetId}`,
            risk_score: score,
          })
        );
      }

      return createToolResult({
        success: true,
        message: "Security summary",
        formatted: formatSecuritySummary(severities, totalAssets, ports, riskEntry, assetRiskDetails),
        data: {
          overall_risk_score: riskEntry?.risk_score ?? null,
          calculation_method: riskEntry?.parameters.calculation_method ?? null,
          calculated_at: riskEntry?.calculated_at ?? null,
          asset_risk_scores: assetRiskDetails,
          severities,
          open_ports: ports.slice(0, 10),
          total_assets: totalAssets,
        },
        info: {
          risk_score_note: "High score = Secure (100 is best), Low score = Risky. 0 = Not scanned yet.",
          overview_url: `${APP_ORIGIN}/scan-report-overview`,
          reports_url: `${APP_ORIGIN}/scan-reports`,
          actions: [
            "To see vulnerabilities in detail: 'list vulnerabilities'",
            "To start a scan: 'start full scan [domain]'",
          ],
        },
      });
    },
  },
  {
    name: "get_scan_history",
    description: "Get scan history. List and status of recent scans",
    schema: z.object({
      page: z.number().optional().default(1).describe("Page number"),
      per_page: z.number().optional().default(10).describe("Results per page"),
    }),
    handler: async (client, params) => {
      const page = (params.page as number) || 1;
      const per_page = (params.per_page as number) || 10;

      const result = await getScanHistoryGroup(client, { page, per_page });

      if (result.success && result.data) {
        const scans = result.data.data || [];
        return createToolResult({
          success: true,
          message: `${scans.length} scan record(s) found`,
          formatted: formatGroupScanHistory(scans),
          data: scans,
          info: {
            status_legend: Object.fromEntries(
              Object.entries(GROUP_SCAN_STATUS_LABELS)
            ) as Record<string, string>,
            reports_url: `${APP_ORIGIN}/scan-manager/activity`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve scan history",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "get_open_ports",
    description: "Get open ports. Lists open ports across your assets",
    schema: z.object({}),
    handler: async (client) => {
      const result = await getOpenPorts(client);

      if (result.success && result.data) {
        const ports = result.data || [];
        return createToolResult({
          success: true,
          message: `${ports.length} different open port(s) detected`,
          formatted: formatOpenPorts(ports),
          data: ports,
          info: {
            risk_levels: {
              high_risk: "FTP(21), Telnet(23), SMB(445), RDP(3389), VNC(5900)",
              medium_risk: "SSH(22), SMTP(25), MySQL(3306), PostgreSQL(5432)",
            },
            overview_url: `${APP_ORIGIN}/scan-report-overview`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve open port information",
        error: result.error || result.message,
      });
    },
  },

  // ==================== USER PACKAGE TOOLS ====================
  {
    name: "get_package_info",
    description: "Get the user's S4E.io subscription / package info — plan tier, scan quota, expiry date, etc. Use to answer 'have I hit my limit?' or 'when does my plan renew?'",
    schema: z.object({}),
    handler: async (client) => {
      const result = await getPackageInfo(client);
      if (result.success) {
        return createToolResult({
          success: true,
          message: "Package info retrieved",
          data: result.data,
          info: {
            account_url: `${APP_ORIGIN}/account`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve package info",
        error: result.error || result.message,
      });
    },
  },

  // ==================== ASSET MANAGEMENT EXTRAS ====================
  {
    name: "list_asset_tags",
    description: "List user-defined tags along with the asset_ids attached to each. Useful for filtering assets by label.",
    schema: z.object({}),
    handler: async (client) => {
      const result = await getTagsWithAssetIds(client);
      if (result.success) {
        const tags = result.data ?? [];
        return createToolResult({
          success: true,
          message: `${Array.isArray(tags) ? tags.length : 0} tag(s) found`,
          data: tags,
          info: {
            asset_manager_url: `${APP_ORIGIN}/asset-manager`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve tag list",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "update_asset_description",
    description: `Update an asset description.
Pass asset_id directly when known, or pass asset name/domain/IP in asset and the tool will resolve asset_id using get_asset_detail first.`,
    schema: z.object({
      asset_id: z.number().optional().describe("Asset ID (number). Optional when asset is provided."),
      asset: z.string().optional().describe("Asset name/domain/IP. Used to resolve asset_id via get_asset_detail when asset_id is not provided."),
      description: z.string()
        .min(ASSET_DESCRIPTION_MIN_LENGTH)
        .max(ASSET_DESCRIPTION_MAX_LENGTH)
        .describe("New asset description"),
    }),
    handler: async (client, params) => {
      const asset = params.asset as string | undefined;
      const assetId = params.asset_id as number | undefined;
      const description = params.description as string;

      if (assetId === undefined && !asset) {
        return createToolResult({
          success: false,
          message: "Failed to update asset description",
          error: "Provide asset_id or asset",
        });
      }

      const result = await updateAssetDescription(client, {
        asset_id: assetId,
        ...(asset ? { asset } : {}),
        description,
      });

      if (result.success) {
        return createToolResult({
          success: true,
          message: "Asset description updated",
          data: result.data,
          info: {
            asset_id: assetId,
            ...(asset ? { asset } : {}),
            asset_manager_url: `${APP_ORIGIN}/asset-manager`,
          },
        });
      }

      return createToolResult({
        success: false,
        message: "Failed to update asset description",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "update_asset_scan_categories",
    description: `Toggle scan categories on/off for a single asset (continuous-scan configuration).
status_list is a list of {category_slug, status} entries; status=true enables a category for the asset, false disables.`,
    schema: z.object({
      asset_id: z.number().describe("Numeric asset id (from list_assets / get_asset_detail)"),
      asset: z.string().optional().describe("Asset name (optional, for clarity)"),
      status_list: z.array(
        z.object({
          category_slug: z.enum(SCAN_CATEGORY_SLUGS),
          status: z.boolean(),
        })
      ).optional().describe("Per-category enable/disable list"),
    }),
    handler: async (client, params) => {
      const assetId = params.asset_id as number;
      const statusList = params.status_list as { category_slug: ScanCategory; status: boolean }[] | undefined;

      const detailResult = await getAssetDetail(client, { asset_id: assetId });
      if (!detailResult.success || !detailResult.data?.asset) {
        return createToolResult({
          success: false,
          message: "Failed to update scan categories",
          error: detailResult.error || detailResult.message || "Could not retrieve asset detail",
          info: {
            asset_id: assetId,
          },
        });
      }

      const detailAsset = detailResult.data;
      if (!detailAsset.if_premium) {
        return createToolResult({
          success: false,
          message: "Advanced Security is not enabled for this asset",
          error: "Enable Advanced Security for the asset before updating scan categories.",
          info: {
            asset_id: assetId,
            asset: detailAsset.asset,
            advanced_security_enabled: false,
            asset_manager_url: `${APP_ORIGIN}/asset-manager`,
          },
        });
      }

      if (!statusList || statusList.length === 0) {
        return createToolResult({
          success: false,
          message: "No scan categories provided",
          info: {
            asset_id: assetId,
            asset: detailAsset.asset,
            advanced_security_enabled: true,
            ...buildScanCategoryStatusHelp(),
          },
        });
      }

      const result = await updateAssetScanCategories(client, {
        asset_id: assetId,
        status_list: statusList,
      });
      if (result.success) {
        return createToolResult({
          success: true,
          message: "Scan categories updated",
          data: result.data,
          info: {
            asset_id: assetId,
            asset: detailAsset.asset,
            advanced_security_enabled: true,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to update scan categories",
        error: result.error || result.message,
      });
    },
  },

  // ==================== SCAN INTROSPECTION ====================
  {
    name: "get_scan_activity_logs",
    description: "Fetch live activity / progress log entries for a running or completed scan by its slug (the UUID returned by start_*_scan).",
    schema: z.object({
      slug: z.string().describe("Scan slug / UUID returned by start_full_scan / start_light_scan / start_crawler_scan / start_single_scan"),
      scan_type: z.enum(["full", "light", "crawler", "single"]).optional().describe("Scan type to generate correct result URL. Defaults to 'full'."),
    }),
    handler: async (client, params) => {
      const slug = params.slug as string;
      const scanType = (params.scan_type as string) || "full";
      const result = await getScanActivityLogs(client, slug);

      const resultPathMap: Record<string, string> = {
        full: "result/group-scan",
        light: "result/group-scan",
        crawler: "result/crawl-only",
        single: "result/detail",
      };
      const resultPath = resultPathMap[scanType] || "result/group-scan";

      if (result.success) {
        const logs = result.data ?? [];
        return createToolResult({
          success: true,
          message: `${Array.isArray(logs) ? logs.length : 0} activity log entry/entries`,
          data: logs,
          info: {
            scan_result_url: `${APP_ORIGIN}/${resultPath}/${slug}`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve activity logs",
        error: result.error || result.message,
      });
    },
  },

  // ==================== REPORT EXTRAS ====================
  {
    name: "get_report_history",
    description: `Get historical reports for a scan or asset over time.
Useful for "when was the last scan", "did this finding regress", etc.
Either pass scan_slug to scope to a specific scan, or asset_id/asset to scope to one asset.`,
    schema: z.object({
      scan_slug: z.string().optional(),
      asset_id: z.number().optional(),
      asset: z.string().optional(),
      uniq_report_value: z.string().optional(),
      scan_output_slug: z.string().optional(),
      port: z.number().optional(),
      show_changes: z.boolean().optional(),
      page: z.number().optional().default(1),
      per_page: z.number().optional().default(20),
      order_by: z.enum(["id", "severity", "finished_at"]).optional(),
      order_type: z.enum(["asc", "desc"]).optional(),
    }),
    handler: async (client, params) => {
      const result = await getReportHistory(client, params as Parameters<typeof getReportHistory>[1]);
      if (result.success && result.data) {
        const reports = result.data.report ?? [];
        return createToolResult({
          success: true,
          message: `${reports.length} report(s) in history`,
          data: reports,
          info: {
            total_count: result.data.total_count,
            page: result.data.page,
            reports_url: `${APP_ORIGIN}/scan-reports`,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve report history",
        error: result.error || result.message,
      });
    },
  },
  // ==================== ACTION TOOLS ====================
  {
    name: "list_actions",
    description: `Browse the public action automation catalog.
Use assignment_filter ('all' | 'assigned' | 'available') to narrow results.
Returned action_uniq_uuid values are what assign_action, trigger_action and delete_action expect.`,
    schema: z.object({
      search_text: z.string().min(2).max(300).optional().describe("Search text"),
      action_uniq_uuid: z.string().optional().describe("Filter by a specific action's unique identifier"),
      page: z.number().optional().default(1).describe("Page number"),
      per_page: z.number().optional().default(20).describe("Results per page (max 100)"),
      order_type: z.enum(["asc", "desc"]).optional().default("desc"),
      assignment_filter: z.enum(["all", "assigned", "available"]).optional().default("all"),
    }),
    handler: async (client, params) => {
      const result = await listActionsCatalog(client, params as Parameters<typeof listActionsCatalog>[1]);
      if (result.success && result.data) {
        const items = result.data.data || [];
        return createToolResult({
          success: true,
          message: `${items.length} action(s) found`,
          formatted: formatActionCatalog(items),
          data: items,
          info: {
            total_count: result.data.count,
            usage: "To assign an action, use the assign_action tool with its action_uniq_uuid",
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve action catalog",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "list_my_actions",
    description: "List the token owner's own action assignments. status: 1=active, 2=disabled, 3=pending approval.",
    schema: z.object({
      page: z.number().optional().default(1).describe("Page number"),
      per_page: z.number().optional().default(20).describe("Results per page (max 100)"),
      search_text: z.string().min(1).max(300).optional().describe("Search text"),
      status: z.array(z.union([z.literal(1), z.literal(2), z.literal(3)])).optional().describe("Filter by assignment status"),
      action_uniq_uuid: z.string().optional().describe("Look up a single assignment"),
    }),
    handler: async (client, params) => {
      const result = await listMyActions(client, params as Parameters<typeof listMyActions>[1]);
      if (result.success && result.data) {
        const items = result.data.data || [];
        return createToolResult({
          success: true,
          message: `${items.length} action assignment(s) found`,
          formatted: formatMyActions(items),
          data: items,
          info: {
            total_count: result.data.count,
            status_legend: ACTION_STATUS_LABELS,
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to retrieve action assignments",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "assign_action",
    description: `Assign a catalog action to the token owner (find action_uniq_uuid via list_actions).
Cannot assign the same action twice. Created in a pending-approval state (status=3) — must be
approved in the S4E dashboard before it can run via trigger_action or automatically via scan_slugs.`,
    schema: z.object({
      action_uniq_uuid: z.string().min(3).max(64).describe("Unique identifier of the catalog action to assign"),
      custom_parameters: z.record(z.string(), z.unknown()).optional().describe("Optional parameters overriding the action's suggested defaults"),
      interval: z.number().min(0).max(1000000).optional().describe("Optional automatic run interval, in minutes"),
      scan_slugs: z.array(z.string()).max(5).optional().describe("Optional scan slugs that should auto-trigger this action once approved"),
    }),
    handler: async (client, params) => {
      const result = await assignAction(client, params as unknown as Parameters<typeof assignAction>[1]);
      if (result.success) {
        return createToolResult({
          success: true,
          message: result.message || "Action assigned successfully",
          info: {
            action_uniq_uuid: params.action_uniq_uuid,
            note: "Assignment is pending approval (status=3) until approved in the S4E dashboard.",
          },
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to assign action",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "trigger_action",
    description: `Manually run (test) an already-assigned, active (status=1) action.
Returns immediately with a slug. Pending-approval or disabled assignments cannot be triggered.`,
    schema: z.object({
      action_uniq_uuid: z.string().min(3).max(64).describe("Unique identifier of the assigned action to run"),
      custom_parameters: z.record(z.string(), z.unknown()).optional().describe("Optional parameters overriding the stored ones for this run only"),
    }),
    handler: async (client, params) => {
      const result = await triggerAction(client, params as unknown as Parameters<typeof triggerAction>[1]);
      if (result.success && result.data) {
        return createToolResult({
          success: true,
          message: result.message || "Action triggered successfully",
          data: result.data,
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to trigger action",
        error: result.error || result.message,
      });
    },
  },
  {
    name: "delete_action",
    description: `Delete (unassign) an action assignment for the token owner.
Soft delete: the assignment is disabled (status=2) rather than removed, so its run history is preserved.`,
    schema: z.object({
      action_uniq_uuid: z.string().min(3).max(64).describe("Unique identifier of the assigned action to delete"),
    }),
    handler: async (client, params) => {
      const result = await deleteAction(client, params as unknown as Parameters<typeof deleteAction>[1]);
      if (result.success) {
        return createToolResult({
          success: true,
          message: result.message || "Action assignment deleted successfully",
        });
      }
      return createToolResult({
        success: false,
        message: "Failed to delete action assignment",
        error: result.error || result.message,
      });
    },
  },
];

// Find tool by name
export function getToolByName(name: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((t) => t.name === name);
}

// Get all tool names
export function getToolNames(): string[] {
  return TOOL_DEFINITIONS.map((t) => t.name);
}
