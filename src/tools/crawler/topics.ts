/**
 * Crawler Topics - LLM guidance for crawler-related features
 */

import { APP_ORIGIN } from "../../core/config.js";

export const CRAWLER_TOPICS = {
  overview: `Crawler Configuration

You can configure settings before the crawler scans your site.

Available Settings:
- Excluded URLs
- Included URLs
- Custom HTTP headers

Example Usage:
- "Show crawler settings"
- "Exclude these URLs from scanning"
- "Add custom header to crawler"

When to Use:
- When you want to exclude specific pages from scanning
- When custom authentication headers are needed
- When you want to limit the scanning scope

Dashboard:
${APP_ORIGIN}/asset-manager > Asset > Crawler Settings`,

  get_settings: `View Crawler Settings

View the current crawler configuration for a specific asset.

Returned Information:
- excluded_urls: URLs excluded from scanning
- included_urls: URLs included in scanning
- custom_headers: Custom HTTP headers
- max_depth: Maximum crawl depth
- max_pages: Maximum number of pages

Example Usage:
- "Show crawler settings for example.com"
- "Get crawler configuration for asset ID 123"

On Dashboard:
${APP_ORIGIN}/asset-manager > Asset > Settings > Crawler`,

  excluded_urls: `Excluded URLs

Define URL patterns that the crawler will not scan.

When to Use:
- Exclude admin panels from scanning
- Exclude logout URLs
- Skip large file/media directories
- Block URLs that may cause infinite loops

Example Patterns:
- /admin/* - Admin directory
- /logout - Logout page
- /uploads/* - Upload directory
- *.pdf - All PDF files

Example Usage:
- "Exclude /admin directory for example.com"
- "Exclude these URLs from crawler: /logout, /admin"`,

  included_urls: `Included URLs

Define URLs that the crawler will always scan.

When to Use:
- Scan custom API endpoints
- Include hidden pages in scanning
- Prioritize specific paths

Example Usage:
- "Include /api/v1 directory for example.com"
- "Add these URLs to scanning: /hidden-page, /special"`,

  custom_headers: `Custom HTTP Headers

Add custom headers to crawler requests.

When to Use:
- When authentication token is required
- When API key is needed
- When you want to set a custom User-Agent

Common Headers:
- Authorization: Bearer <token>
- X-API-Key: <key>
- Cookie: session=<value>

Example Usage:
- "Add Authorization header to crawler"
- "Set X-API-Key header for example.com crawler"

Security Note:
- Headers containing sensitive information are stored securely
- Headers are only used for the associated asset`,
} as const;

export type CrawlerTopicKey = keyof typeof CRAWLER_TOPICS;
