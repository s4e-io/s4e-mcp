
// Crawler settings
export interface CrawlerSettings {
  asset_id: number;
  exclude_urls?: string | null;
  include_urls?: string | null;
  headers?: string | null;
  max_depth?: number | null;
  max_pages?: number | null;
  headers_updated?: number| null;
  [key: string]: unknown;
}

// Get crawler settings params
export interface GetCrawlerSettingsParams {
  asset_id: number;
}

// Crawler settings response
export interface CrawlerSettingsResponse {
  data: CrawlerSettings;
}

// Add excluded URLs params
export interface AddExcludedUrlsParams {
  asset_id: number;
  urls: string[];
}

// Add included URLs params
export interface AddIncludedUrlsParams {
  asset_id: number;
  urls: string[];
}

// Update crawler header params
export interface UpdateCrawlerHeaderParams {
  asset_id: number;
  headers: Record<string, string>;
}

// Crawler URL operation response
export interface CrawlerUrlResponse {
  success: boolean;
  message?: string;
  added?: string[];
  failed?: string[];
}

// Crawler header response
export interface CrawlerHeaderResponse {
  success: boolean;
  message?: string;
  headers?: Record<string, string>;
}
