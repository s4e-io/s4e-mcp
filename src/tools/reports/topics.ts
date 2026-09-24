/**
 * Report Topics - LLM guidance for report-related features
 */

import { APP_ORIGIN } from "../../core/config.js";

export const REPORT_TOPICS = {
  overview: `S4E.io Vulnerability Reports

Security vulnerabilities detected from scans are reported here.

Severity Levels:
- Critical (5): Serious vulnerabilities requiring immediate action
- High (4): Significant security risks
- Medium (3): Moderate risks
- Low (2): Low priority issues
- Information (1): Informational findings

Report Statuses:
- Open: Not yet resolved
- Fixed: Resolved
- In Progress: Being worked on
- False Positive: Incorrect detection
- Accepted Risk: Acknowledged risk

Available Commands:
- "List vulnerabilities"
- "Show critical vulnerabilities"
- "Get vulnerabilities for example.com"
- "Download vulnerability report"

Dashboard:
${APP_ORIGIN}`,

  get_vulnerabilities: `Vulnerability List

List vulnerabilities detected during scans.

Filter Options:
- Asset: For a specific domain/IP
- Severity: Critical, High, Medium, Low, Information
- Status: Open, Fixed, False Positive, etc.
- Category: Web, Network, DNS, SSL, etc.

Example Usage:
- "List all vulnerabilities"
- "Show critical and high vulnerabilities"
- "Get open vulnerabilities for example.com"
- "Find vulnerabilities in the DNS category"

View on Dashboard:
1. Go to ${APP_ORIGIN}
2. Select from filters on the left:
   - Severity filters (colored buttons at top)
   - Asset filters
   - Status filters
3. Click a vulnerability row for details

Vulnerability Details:
- Description and remediation advice
- Technical details
- CVE references
- CVSS score`,

  severity_summary: `Vulnerability Summary (Severity Summary)

View the overall security posture of your assets.

Displayed Information:
- Vulnerability count per severity level
- Total open vulnerability count
- Severity distribution percentage

Example Usage:
- "Show vulnerability summary"
- "What's the security status?"
- "How many critical vulnerabilities are there?"

View on Dashboard:
1. Go to ${APP_ORIGIN} (main dashboard)
2. In the "Security Overview" widget:
   - Pie chart distribution
   - Severity-based counts
3. Or ${APP_ORIGIN}/scan-reports > summary at the top

Interpretation:
- Critical/High: Take immediate action
- Medium: Include in planned sprints
- Low/Info: Track for informational purposes

Risk Score:
The number of Critical and High vulnerabilities affects your overall security posture.`,

  export_report: `Vulnerability Report Export

Download vulnerabilities in various formats.

Supported Formats:
- PDF: For presentations and sharing
- CSV: For Excel and data analysis
- JSON: For integration and automation
- HTML: For web viewing

Template Options:
- Full: All details (description, solution, references)
- Short: Summary info (name, severity, status)

Example Usage:
- "Download vulnerabilities as PDF"
- "Export critical vulnerabilities as CSV"
- "Generate report for example.com"

Export on Scan Reports:
1. Go to ${APP_ORIGIN}/scan-reports
2. Apply filters
3. Click the "Export" button in the top right
4. Select format and template
5. Click "Download"

Integration:
JSON export can be used for SIEM and ticket system integrations:
- Jira integration
- ServiceNow
- Splunk
- Custom webhook`,

  vulnerability_categories: `Vulnerability Categories

Security categories scanned by S4E.io:

1. DNS Controls
   - DNS zone transfer
   - DNS cache poisoning
   - Subdomain takeover
   - SPF/DKIM/DMARC misconfigurations

2. SSL/TLS Controls
   - Certificate validity
   - Weak cipher suites
   - SSL version issues
   - Missing HSTS

3. Misconfiguration
   - Open directory listing
   - Default credentials
   - Debug mode enabled
   - Missing security headers

4. Network Vulnerabilities
   - Open ports
   - Outdated service versions
   - Missing security patches

5. Web Vulnerabilities
   - SQL Injection
   - Cross-Site Scripting (XSS)
   - CSRF, SSRF, XXE
   - Command Injection
   - Path Traversal

6. Product-Based Vulnerabilities
   - WordPress, Joomla, Drupal
   - Apache, Nginx, IIS
   - PHP, Java, .NET

7. Exposed Panels
   - Admin panels
   - Database interfaces
   - Monitoring tools`,
} as const;

export type ReportTopicKey = keyof typeof REPORT_TOPICS;
