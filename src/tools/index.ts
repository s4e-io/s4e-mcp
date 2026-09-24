/**
 * Tools module - exports all tools
 */

// User tools
export { verifyToken, getUserInfo, getPackageInfo } from "./user/index.js";
export type { S4EUserInfo } from "./user/index.js";
export { USER_TOPICS } from "./user/topics.js";

// Help tools
export {
  getHelp,
  listTopics,
  suggestTopic,
  ALL_TOPICS,
  TOPIC_CATEGORIES,
  TOPIC_DESCRIPTIONS,
} from "./help/index.js";
export type { HelpTopic } from "./help/index.js";

// Scan tools
export {
  startGroupScan,
  startFullScan,
  startLightScan,
  startCrawlerScan,
  startSingleScan,
  listScans,
  formatScanList,
  getScanActivityLogs,
  SCAN_CATEGORY_SLUGS,
  SCAN_TOPICS,
} from "./scans/index.js";
export type {
  GroupScanParams,
  GroupScanResponse,
  ScanSlug,
  ScanCategory,
  SingleScanParams,
  SingleScanResponse,
  ListScansParams,
  ListScansResponse,
  ScanItem,
  ScanActivityLogEntry,
} from "./scans/index.js";

// Asset tools
export {
  listAssets,
  getAssetDetail,
  addAssets,
  checkAssetOwnership,
  checkAssetType,
  getTagsWithAssetIds,
  updateAssetScanCategories,
  updateAssetDescription,
  formatAssetList,
  ASSET_TOPICS,
  ASSET_DESCRIPTION_MIN_LENGTH,
  ASSET_DESCRIPTION_MAX_LENGTH,
} from "./assets/index.js";
export type {
  S4EAsset,
  AssetListResponse,
  ListAssetsParams,
  GetAssetDetailParams,
  AssetDetailResponse,
  AssetType,
  AddAssetsParams,
  AddAssetsResponse,
  CheckAssetOwnershipParams,
  CheckAssetOwnershipResponse,
  CheckAssetTypeParams,
  CheckAssetTypeResponse,
  AssetTagItem,
  ScanCategoryStatus,
  UpdateScanCategoriesParams,
  UpdateAssetDescriptionParams,
} from "./assets/index.js";

// Crawler tools
export {
  getCrawlerSettings,
  addExcludedUrls,
  addIncludedUrls,
  updateCrawlerHeader,
  formatCrawlerSettings,
  CRAWLER_TOPICS,
} from "./crawler/index.js";
export type {
  CrawlerSettings,
  GetCrawlerSettingsParams,
  CrawlerSettingsResponse,
  AddExcludedUrlsParams,
  AddIncludedUrlsParams,
  UpdateCrawlerHeaderParams,
  CrawlerUrlResponse,
  CrawlerHeaderResponse,
} from "./crawler/index.js";

// Report tools
export {
  getVulnerabilities,
  getSeveritySummary,
  exportReport,
  getReportHistory,
  formatVulnerabilityList,
  formatSeveritySummary,
  REPORT_TOPICS,
  SEVERITY_LABELS,
  REPORT_STATUS_LABELS,
  SCAN_CATEGORY_LABELS,
} from "./reports/index.js";
export type {
  VulnerabilityReport,
  VulnerabilityListResponse,
  GetVulnerabilitiesParams,
  SeveritySummary,
  ExportReportParams,
  ExportReportResponse,
  ExportFormat,
  Severity,
  ReportStatus,
  ScanCategorySlug,
  ReportHistoryParams,
  ReportHistoryResponse,
  ReportHistoryEntry,
} from "./reports/index.js";

// Risk tools
export {
  getAssetRiskScoreV2,
  getAssetScoreHistory,
} from "./risk/index.js";
export type {
  AssetRiskItem,
  AssetRiskParameters,
  AssetRiskScoreV2Response,
  GetAssetRiskScoreV2Params,
  AssetScoreHistoryItem,
  AssetScoreHistoryResponse,
  GetAssetScoreHistoryParams,
} from "./risk/index.js";

// Action tools
export {
  listActionsCatalog,
  listMyActions,
  assignAction,
  triggerAction,
  deleteAction,
  formatActionCatalog,
  formatMyActions,
  ACTION_TOPICS,
  ACTION_STATUS_LABELS,
} from "./action/index.js";
export type {
  ActionCatalogItem,
  ActionListResponse,
  ListActionsParams,
  ActionAssignmentItem,
  ActionListMyResponse,
  ListMyActionsParams,
  ActionAssignmentStatus,
  AssignActionParams,
  TriggerActionParams,
  TriggerActionResponse,
  DeleteActionParams,
} from "./action/index.js";

// Dashboard tools
export {
  getScanHistoryGroup,
  getScanHistorySingle,
  getCrawlerHistory,
  getOpenPorts,
  getMonthlyStats,
  getCombinedScanHistory,
  getUserRiskScore,
  formatScanHistory,
  formatGroupScanHistory,
  formatOpenPorts,
  formatSecuritySummary,
  DASHBOARD_TOPICS,
  SCAN_STATUS_LABELS,
  GROUP_SCAN_STATUS_LABELS,
  SCAN_TYPE_LABELS,
} from "./dashboard/index.js";
export type {
  ScanHistoryItem,
  ScanHistoryResponse,
  GetScanHistoryParams,
  OpenPort,
  SecuritySummary,
  DashboardStats,
  ScanStatus,
  GroupScanStatus,
  ScanType,
  UserRiskEntry,
  UserRiskScoreResponse,
  AssetRiskDetail,
} from "./dashboard/index.js";
