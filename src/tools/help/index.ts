/**
 * Help Tools
 */

import {
  ALL_TOPICS,
  TOPIC_CATEGORIES,
  TOPIC_DESCRIPTIONS,
} from "./topics.js";
import type { HelpTopic } from "./topics.js";

export {
  ALL_TOPICS,
  TOPIC_CATEGORIES,
  TOPIC_DESCRIPTIONS,
  USER_TOPICS,
  SCAN_TOPICS,
  ASSET_TOPICS,
  REPORT_TOPICS,
  DASHBOARD_TOPICS,
} from "./topics.js";
export type { HelpTopic } from "./topics.js";

/**
 * Returns help content for a specific topic
 */
export function getHelp(topic: HelpTopic | string = "overview"): string {
  const content = ALL_TOPICS[topic as HelpTopic];
  if (content) {
    return content;
  }

  // If topic not found, list available topics
  return `Topic "${topic}" not found.

Available topics:
${Object.entries(TOPIC_DESCRIPTIONS)
  .map(([key, desc]) => `- ${key}: ${desc}`)
  .join("\n")}

Example: "help about user:verify_token"`;
}

/**
 * Lists all topics
 */
export function listTopics(): string {
  const categories = Object.entries(TOPIC_CATEGORIES)
    .map(([category, topics]) => {
      const topicList = topics
        .map((t) => `  - ${t}: ${TOPIC_DESCRIPTIONS[t as HelpTopic]}`)
        .join("\n");
      return `${category.toUpperCase()}:\n${topicList}`;
    })
    .join("\n\n");

  return `Available Help Topics:\n\n${categories}`;
}

/**
 * Suggests a topic based on keyword
 */
export function suggestTopic(keyword: string): HelpTopic | null {
  const lowerKeyword = keyword.toLowerCase();

  const keywordMap: Record<string, HelpTopic> = {
    // Token
    token: "user:verify_token",
    "api token": "user:api_token",
    "api key": "user:api_token",
    verify: "user:verify_token",

    // User
    account: "user:info",
    user: "user:info",
    profile: "user:info",

    // General
    "getting started": "quickstart",
    "quick start": "quickstart",
    issue: "troubleshooting",
    error: "troubleshooting",
    problem: "troubleshooting",
    "what is": "about",
    about: "about",

    // Scans
    scan: "scan:overview",
    "full scan": "scan:full_scan",
    "comprehensive scan": "scan:full_scan",
    "light scan": "scan:light_scan",
    "quick scan": "scan:light_scan",
    crawler: "scan:crawler_scan",
    "link discovery": "scan:crawler_scan",

    // Assets
    asset: "asset:overview",
    domain: "asset:overview",
    "asset list": "asset:list_assets",
    "add asset": "asset_guide",
    verification: "asset:verify_asset",

    // Reports
    vulnerability: "report:overview",
    report: "report:overview",
    severity: "report:severity_summary",
    "vulnerability list": "report:get_vulnerabilities",
    export: "report:export_report",
    download: "report:export_report",
    pdf: "report:export_report",
    category: "report:vulnerability_categories",
    owasp: "report:vulnerability_categories",

    // Dashboard
    dashboard: "dashboard:overview",
    summary: "dashboard:security_summary",
    security: "dashboard:security_summary",
    "scan history": "dashboard:scan_history",
    history: "dashboard:scan_history",
    port: "dashboard:open_ports",
    "open port": "dashboard:open_ports",
    statistics: "dashboard:monthly_stats",
    monthly: "dashboard:monthly_stats",
    terminal: "dashboard:terminal",
    log: "dashboard:terminal",
  };

  for (const [key, topic] of Object.entries(keywordMap)) {
    if (lowerKeyword.includes(key)) {
      return topic;
    }
  }

  return null;
}
