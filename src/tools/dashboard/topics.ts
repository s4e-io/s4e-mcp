/**
 * Dashboard Topics - LLM guidance for dashboard-related features
 */

import { APP_ORIGIN } from "../../core/config.js";

export const DASHBOARD_TOPICS = {
  overview: `S4E.io Dashboard

The dashboard provides a single-view overview of your overall security posture.

Main Components:
1. Security Summary: Total vulnerability counts and distribution
2. Asset Status: Verified/unverified asset counts
3. Recent Scans: Active and completed scans
4. Open Ports: Most common open ports
5. Trend Charts: Changes over time

Available Commands:
- "Show security summary"
- "List recent scans"
- "Show open ports"
- "Get this month's statistics"

Dashboard Access:
${APP_ORIGIN}

Widgets:
- Security Overview: Vulnerability distribution
- Asset Overview: Asset statistics
- Recent Activity: Latest activities
- Scan Progress: Ongoing scans`,

  security_summary: `Security Summary

Overall security posture of your digital assets.

Displayed Metrics:
- Total Asset Count
- Verified Asset Count
- Total Vulnerability Count
- Severity Distribution:
  * Critical (red): Immediate action required
  * High (orange): High priority
  * Medium (yellow): Planned resolution
  * Low (green): Low priority
  * Info (blue): Informational

Risk Assessment:
- 0 Critical/High: Good condition ✓
- 1-5 Critical/High: Attention needed ⚠
- 5+ Critical/High: Urgent action required ❌

Example Usage:
- "What's my security status?"
- "How many vulnerabilities are there?"
- "Show risk summary"

On Dashboard:
1. Go to ${APP_ORIGIN}
2. "Security Overview" widget on the main page
3. Or select "Dashboard" from the left menu`,

  scan_history: `Scan History

List and status of all scans performed.

Scan Statuses:
- Queued: Waiting in queue
- Running: Currently executing
- Completed: Finished successfully
- Failed: Encountered an error
- Cancelled: User cancelled
- Timeout: Time limit exceeded

Scan Types:
- Full Scan: Comprehensive scan (10,000+ checks)
- Light Scan: Quick scan (basic checks)
- Single Scan: Individual vulnerability check
- Crawler: URL discovery
- Continuous: Continuous monitoring

Example Usage:
- "Show recent scans"
- "What scans are running?"
- "List failed scans"
- "Show scan history for example.com"

On Dashboard:
1. Go to ${APP_ORIGIN}/scans
2. Click the "History" tab
3. Filter by:
   - Scan type
   - Status
   - Asset
   - Date range

Scan Details:
- Click a row to view details
- View found vulnerabilities
- Review logs`,

  open_ports: `Open Ports

Analysis of open ports across your assets.

Why It Matters:
- Open ports create attack surface
- Unnecessary services should be closed
- Ports with known vulnerabilities are dangerous

Common High-Risk Ports:
- 21 (FTP): Encrypted connection recommended
- 22 (SSH): Strong password/key required
- 23 (Telnet): Should not be used
- 3389 (RDP): Should be behind a VPN
- 3306 (MySQL): External access should be disabled
- 27017 (MongoDB): Authentication required

Example Usage:
- "Show open ports"
- "Which ports are open?"
- "Are there any dangerous ports?"

On Dashboard:
1. Go to ${APP_ORIGIN}
2. "Open Ports" widget
3. Or Scans > Network Results

Port Action Recommendations:
1. Close unnecessary services
2. Add firewall rules
3. Update services
4. Add monitoring`,

  monthly_stats: `Monthly Statistics

Monthly summary of scanning and discovery activities.

Displayed Metrics:
- Scans This Month: Total scans performed
- Crawler Activity: Number of discovered URLs
- New Vulnerabilities: Found this week
- Fixed Vulnerabilities: Resolved this week

Trend Analysis:
- Increasing vulnerabilities: Attention needed
- Decreasing vulnerabilities: Improving
- Stable: Level maintained

Example Usage:
- "Show this month's statistics"
- "How many scans were performed?"
- "How does the trend look?"

On Dashboard:
1. Go to ${APP_ORIGIN}
2. "Monthly Overview" widget
3. Use date filter to view history

Reporting:
- Generate monthly PDF reports
- Use for management presentations
- Compliance documentation`,

  terminal: `Terminal Output

Live terminal output during scan process.

What It Shows:
- Real-time scan progress
- Found findings
- Error messages
- Completion status

Example Usage:
- "Show scan output"
- "Get terminal logs"

On Dashboard:
1. After starting an active scan
2. Click the "Terminal" tab
3. Watch the live output

Log Analysis:
- Green: Successful checks
- Red: Found vulnerabilities
- Yellow: Warnings
- Blue: Informational`,
} as const;

export type DashboardTopicKey = keyof typeof DASHBOARD_TOPICS;
