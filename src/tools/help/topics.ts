/**
 * Help Topics - Combines topics from all modules
 */

import { USER_TOPICS, UserTopicKey } from "../user/topics.js";
import { SCAN_TOPICS, ScanTopicKey } from "../scans/topics.js";
import { ASSET_TOPICS, AssetTopicKey } from "../assets/topics.js";
import { REPORT_TOPICS, ReportTopicKey } from "../reports/topics.js";
import { DASHBOARD_TOPICS, DashboardTopicKey } from "../dashboard/topics.js";
import { CRAWLER_TOPICS, CrawlerTopicKey } from "../crawler/topics.js";
import { ACTION_TOPICS, ActionTopicKey } from "../action/topics.js";
import { APP_ORIGIN } from "../../core/config.js";

// Re-export individual topics
export { USER_TOPICS } from "../user/topics.js";
export { SCAN_TOPICS } from "../scans/topics.js";
export { ASSET_TOPICS } from "../assets/topics.js";
export { REPORT_TOPICS } from "../reports/topics.js";
export { DASHBOARD_TOPICS } from "../dashboard/topics.js";
export { CRAWLER_TOPICS } from "../crawler/topics.js";
export { ACTION_TOPICS } from "../action/topics.js";

// General help topics
export const GENERAL_TOPICS = {
  overview: `S4E.io MCP Server - Overview

S4E.io is a platform that helps you monitor the security of your digital assets.
This MCP server lets you use S4E.io through your AI assistants.

Available Categories:

1. ASSET MANAGEMENT
   - "Show asset list" - List all your assets
   - "Show details for example.com" - Asset information

2. SECURITY SCANNING
   - "Start a full scan for example.com" - Comprehensive scan (10,000+ checks)
   - "Start a light scan for example.com" - Quick scan
   - "Run crawler for example.com" - Link discovery

3. VULNERABILITY REPORTS
   - "List vulnerabilities" - Found security issues
   - "Show severity summary" - Vulnerability distribution
   - "Download report as PDF" - Export

4. DASHBOARD
   - "Show security summary" - Overall status
   - "Show scan history" - Scan records
   - "Show open ports" - Port analysis

Dashboard:
${APP_ORIGIN}`,

  quickstart: `S4E.io Quick Start

STEP 1: Verify Token
   "Verify my S4E.io token"

STEP 2: View Assets
   "Show asset list"

STEP 3: Run Security Scan
   "Start a full scan for example.com"

STEP 4: Review Results
   "List vulnerabilities"
   "Show security summary"

Common Commands:
- Verify token -> Token check
- List assets -> Your assets
- Start full scan -> Comprehensive scan
- List vulnerabilities -> Findings
- Severity summary -> Overall status
- Download report -> PDF/CSV export

Dashboard:
${APP_ORIGIN}`,

  asset_guide: `S4E.io Asset Addition Guide

NOTE: Asset addition is supported via MCP.
Verification must be done through the S4E.io web interface.

STEP 1: Go to Asset Manager
- ${APP_ORIGIN}/asset-manager

STEP 2: Add Asset
- Click the "Add Asset" button
- Select asset type:
  * Domain (e.g. example.com)
  * Subdomain (e.g. api.example.com)
  * IPv4 Address (e.g. 192.168.1.1)
  * IPv6 Address
  * CIDR Subnet (e.g. 10.0.0.0/24)
- Enter asset information and add

IMPORTANT: Unverified assets are automatically deleted after 24 hours!

STEP 3: Choose Verification Method
- Single asset: Continue from the dialog that opens
- Multiple assets: Click "Verify" from the "Actions" column in the table

Verification Methods:
1. security.txt (Recommended)
   - Download the security.txt file
   - Upload as /.well-known/security.txt or /security.txt

2. HTML File
   - Download the HTML verification file
   - Upload to site root

3. DNS Record
   - Add TXT record: asset-verify=YOUR_TOKEN
   - Save to DNS

4. DNS Connect
   - Auto-configure via your DNS provider's API

STEP 4: Verify
- Complete the steps for your chosen method
- Click the "Verify" button
- On success, the asset becomes active

HAVING ISSUES?
Contact support at ${APP_ORIGIN}/support`,

  troubleshooting: `S4E.io Troubleshooting

TOKEN ERRORS:
- "Invalid token": Token is wrong or invalid
  Solution: Get a new token from Settings > Profile

- "Token expired": Token has expired
  Solution: Generate a new token

API ACCESS ISSUES:
- Connection error: Check your internet connection
- Timeout: API server may be busy, try again

SCAN ISSUES:
- "Asset not found": Asset not added or not verified
  Solution: Add and verify the asset from Asset Manager

- "Scan failed": Target unreachable or blocked by firewall
  Solution: Check target accessibility

REPORT ISSUES:
- "No vulnerabilities found": No scan has been performed yet
  Solution: Start a full scan first

OTHER:
- API access issue: Check VPN/Firewall
- Slow response: May be hitting API rate limits, wait

SUPPORT:
${APP_ORIGIN}/support`,

  about: `About S4E.io

S4E.io (Security for Everyone) is a security platform that helps you
monitor and manage the security of your digital assets.

FEATURES:
- 10,000+ vulnerability checks
- OWASP Top 10 scanning
- SSL certificate monitoring
- DNS change tracking
- Open port detection
- Continuous monitoring
- Detailed reporting

SCAN TYPES:
- Full Scan: Comprehensive security scan
- Light Scan: Quick basic checks
- Crawler: URL and link discovery
- Single Scan: Individual vulnerability check
- Continuous: Continuous monitoring

MCP SERVER CAPABILITIES:
- Asset management
- Scan initiation
- Vulnerability querying
- Report export
- Dashboard data

LINKS:
- Web: https://s4e.io
- Dashboard: ${APP_ORIGIN}
- Documentation: https://docs.s4e.io
- Support: https://app.s4e.io/support`,
} as const;

// Combine all topics
export const ALL_TOPICS = {
  // General
  ...GENERAL_TOPICS,

  // User topics (with prefix)
  "user:verify_token": USER_TOPICS.verify_token,
  "user:info": USER_TOPICS.user_info,
  "user:api_token": USER_TOPICS.api_token,

  // Scan topics (with prefix)
  "scan:overview": SCAN_TOPICS.overview,
  "scan:full_scan": SCAN_TOPICS.full_scan,
  "scan:light_scan": SCAN_TOPICS.light_scan,
  "scan:crawler_scan": SCAN_TOPICS.crawler_scan,

  // Asset topics (with prefix)
  "asset:overview": ASSET_TOPICS.overview,
  "asset:list_assets": ASSET_TOPICS.list_assets,
  "asset:asset_detail": ASSET_TOPICS.asset_detail,
  "asset:verify_asset": ASSET_TOPICS.verify_asset,
  "asset:add_assets": ASSET_TOPICS.add_assets,
  "asset:check_ownership": ASSET_TOPICS.check_ownership,

  // Report topics (with prefix)
  "report:overview": REPORT_TOPICS.overview,
  "report:get_vulnerabilities": REPORT_TOPICS.get_vulnerabilities,
  "report:severity_summary": REPORT_TOPICS.severity_summary,
  "report:export_report": REPORT_TOPICS.export_report,
  "report:vulnerability_categories": REPORT_TOPICS.vulnerability_categories,

  // Dashboard topics (with prefix)
  "dashboard:overview": DASHBOARD_TOPICS.overview,
  "dashboard:security_summary": DASHBOARD_TOPICS.security_summary,
  "dashboard:scan_history": DASHBOARD_TOPICS.scan_history,
  "dashboard:open_ports": DASHBOARD_TOPICS.open_ports,
  "dashboard:monthly_stats": DASHBOARD_TOPICS.monthly_stats,
  "dashboard:terminal": DASHBOARD_TOPICS.terminal,

  // Crawler topics (with prefix)
  "crawler:overview": CRAWLER_TOPICS.overview,
  "crawler:get_settings": CRAWLER_TOPICS.get_settings,
  "crawler:excluded_urls": CRAWLER_TOPICS.excluded_urls,
  "crawler:included_urls": CRAWLER_TOPICS.included_urls,
  "crawler:custom_headers": CRAWLER_TOPICS.custom_headers,

  // Action topics (with prefix)
  "action:overview": ACTION_TOPICS.overview,
  "action:catalog": ACTION_TOPICS.catalog,
  "action:assign": ACTION_TOPICS.assign,
  "action:update": ACTION_TOPICS.update,
  "action:trigger": ACTION_TOPICS.trigger,
  "action:output": ACTION_TOPICS.output,
  "action:history": ACTION_TOPICS.history,
  "action:delete": ACTION_TOPICS.delete,
  "action:list_my": ACTION_TOPICS.list_my,
} as const;

export type HelpTopic = keyof typeof ALL_TOPICS;

// Topic categories
export const TOPIC_CATEGORIES = {
  general: ["overview", "quickstart", "asset_guide", "troubleshooting", "about"],
  user: ["user:verify_token", "user:info", "user:api_token"],
  scan: ["scan:overview", "scan:full_scan", "scan:light_scan", "scan:crawler_scan"],
  asset: ["asset:overview", "asset:list_assets", "asset:asset_detail", "asset:verify_asset", "asset:add_assets", "asset:check_ownership"],
  report: ["report:overview", "report:get_vulnerabilities", "report:severity_summary", "report:export_report", "report:vulnerability_categories"],
  dashboard: ["dashboard:overview", "dashboard:security_summary", "dashboard:scan_history", "dashboard:open_ports", "dashboard:monthly_stats", "dashboard:terminal"],
  crawler: ["crawler:overview", "crawler:get_settings", "crawler:excluded_urls", "crawler:included_urls", "crawler:custom_headers"],
  action: ["action:overview", "action:catalog", "action:assign", "action:update", "action:trigger", "action:output", "action:history", "action:delete", "action:list_my"],
} as const;

// Topic descriptions
export const TOPIC_DESCRIPTIONS: Record<HelpTopic, string> = {
  // General
  overview: "S4E.io overview and basic concepts",
  quickstart: "Quick start guide",
  asset_guide: "Asset addition and verification guide",
  troubleshooting: "Common issues and solutions",
  about: "About S4E.io",

  // User
  "user:verify_token": "API token verification guide",
  "user:info": "About user information",
  "user:api_token": "API token management",

  // Scan
  "scan:overview": "Security scans overview",
  "scan:full_scan": "Full scan - comprehensive security scan",
  "scan:light_scan": "Light scan - quick security scan",
  "scan:crawler_scan": "Crawler scan - URL and link discovery",

  // Asset
  "asset:overview": "Asset management overview",
  "asset:list_assets": "Asset listing and filtering",
  "asset:asset_detail": "Asset details and information",
  "asset:verify_asset": "Asset verification methods",
  "asset:add_assets": "Asset addition guide",
  "asset:check_ownership": "Asset ownership check",

  // Report
  "report:overview": "Vulnerability reports overview",
  "report:get_vulnerabilities": "Vulnerability listing and filtering",
  "report:severity_summary": "Severity summary and interpretation",
  "report:export_report": "Report export (PDF, CSV, JSON, HTML)",
  "report:vulnerability_categories": "Vulnerability categories and descriptions",

  // Dashboard
  "dashboard:overview": "Dashboard overview",
  "dashboard:security_summary": "Security summary and metrics",
  "dashboard:scan_history": "Scan history and statuses",
  "dashboard:open_ports": "Open ports and risk analysis",
  "dashboard:monthly_stats": "Monthly statistics and trends",
  "dashboard:terminal": "Terminal output and logs",

  // Crawler
  "crawler:overview": "Crawler configuration overview",
  "crawler:get_settings": "View crawler settings",
  "crawler:excluded_urls": "Excluded URLs",
  "crawler:included_urls": "Included URLs",
  "crawler:custom_headers": "Custom HTTP headers",

  // Action
  "action:overview": "Action automation catalog overview",
  "action:catalog": "Browsing the action catalog",
  "action:assign": "Assigning an action",
  "action:update": "Updating an action assignment",
  "action:trigger": "Manually running an action",
  "action:output": "Reading an action run result",
  "action:history": "Action run history and counts",
  "action:delete": "Removing an action assignment",
  "action:list_my": "Listing your action assignments",
};
