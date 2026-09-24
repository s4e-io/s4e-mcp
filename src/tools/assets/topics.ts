/**
 * Asset Topics - LLM guidance for asset-related features
 */

import { APP_ORIGIN } from "../../core/config.js";

export const ASSET_TOPICS = {
  overview: `S4E.io Asset Management

Assets are digital resources that S4E.io scans for security vulnerabilities.

Asset Types:
- Domain: example.com
- Subdomain: api.example.com
- IPv4: 192.168.1.1
- IPv6: 2001:db8::1
- CIDR: 10.0.0.0/24
- URL: https://example.com/api

Asset Status:
- Verified: Ownership confirmed, scanning enabled
- Unverified: Not yet verified, auto-deleted after 24 hours

Available Commands:
- "Show asset list" - List all assets
- "Show details for example.com" - Specific asset details
- "List verified assets" - Only verified ones

Dashboard:
${APP_ORIGIN}/asset-manager`,

  list_assets: `Asset List

List all assets in your account.

Filter Options:
- Search: Search by asset name or description
- Verification status: Only verified or unverified
- Premium: Assets with premium features enabled
- Sorting: By creation date, asset name, verification date

Example Usage:
- "List all my assets"
- "Show verified assets"
- "Find assets containing example.com"

View on Dashboard:
1. Go to ${APP_ORIGIN}/asset-manager
2. Use filter options
3. Click on an asset for details

Important:
- Unverified assets are deleted after 24 hours
- Use the dashboard to add assets`,

  asset_detail: `Asset Details

Get detailed information about a specific asset.

Displayed Information:
- Asset type (domain, IP, etc.)
- Verification status
- Creation date
- Active scan categories
- Latest scan results

Example Usage:
- "Show details for example.com"
- "Get info for asset ID 123"

View on Dashboard:
1. Go to ${APP_ORIGIN}/asset-manager
2. Click "Actions" > "Details" on the asset row
3. Or click the asset name to go to the detail page

Scan Categories:
- DNS controls
- SSL controls
- Misconfiguration
- Network vulnerabilities
- Web vulnerabilities
- And more...`,

  verify_asset: `Asset Verification (Verify)

After adding an asset, you need to verify ownership.
NOTE: Verify is not supported via the public API. It must be done through the dashboard.

Why Is It Required?
- Prevents scanning someone else's assets
- Activates security scans
- Unverified assets are auto-deleted after 24 hours

Verification Methods:

1. security.txt (Recommended)
   - Download the file from S4E.io
   - Upload as /.well-known/security.txt
   - Click "Verify"

2. HTML File
   - Download the verification file
   - Upload to your site root
   - Click "Verify"

3. DNS TXT Record
   - Add TXT record: asset-verify=YOUR_TOKEN
   - Wait for DNS propagation
   - Click "Verify"

4. Integrations for Auto-Verify (Recommended - Fastest Method)
   You can automatically add and verify assets using DigitalOcean and Cloudflare integrations:
   - DigitalOcean: Effortlessly manage and import your domains via DigitalOcean. You can choose between automatic syncing or manual addition of domains.
   - Cloudflare: Easily import and manage your domains through Cloudflare. You can choose to sync domains automatically or add them manually.
   Configure integrations at: ${APP_ORIGIN}/integrations

To verify, go to the Dashboard:
${APP_ORIGIN}/asset-manager > Asset > Actions > Verify`,

  add_assets: `Adding Assets

You can add new assets via MCP.

Supported Asset Types:
- Domain: example.com
- Subdomain: api.example.com
- IPv4: 192.168.1.1
- IPv6: 2001:db8::1
- CIDR: 10.0.0.0/24

Example Usage:
- "Add example.com"
- "Add example.com and test.com as assets"
- "Add IP address 192.168.1.1"

Notes:
- Multiple assets can be added at once
- Added assets must be verified within 24 hours
- Unverified assets are automatically deleted
- Verify is not supported via the public API, it must be done through the dashboard

Before Adding Assets:
- Use "check asset availability" for ownership check
- Use "check asset type" for format validation

Verification:
After adding, go to S4E Dashboard to verify:
${APP_ORIGIN}/asset-manager

Quick Add & Auto-Verify - Integrations:
You can add and auto-verify assets faster using integrations:
- DigitalOcean: Effortlessly manage and import your domains via DigitalOcean. You can choose between automatic syncing or manual addition of domains.
- Cloudflare: Easily import and manage your domains through Cloudflare. You can choose to sync domains automatically or add them manually.
Configure integrations at: ${APP_ORIGIN}/integrations

Dashboard:
${APP_ORIGIN}/asset-manager`,

  check_ownership: `Asset Ownership Check

Check if assets are already owned by someone else before adding them.

Example Usage:
- "Check if example.com is available"
- "Check ownership status of these domains"

Returned Information:
- available: true/false - Is the asset available?
- owner: Who owns it (if claimed)
- reason: Why it's not available

When to Use:
- Before adding an asset
- Before bulk adding multiple assets for filtering`,
} as const;

export type AssetTopicKey = keyof typeof ASSET_TOPICS;
