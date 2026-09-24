/**
 * Scan Topics - LLM guidance for scan-related features
 */

import { APP_ORIGIN } from "../../core/config.js";

export const SCAN_TOPICS = {
  overview: `S4E.io Security Scans

You can start 3 different scan types through S4E.io:

1. FULL SCAN (Comprehensive Scan)
   - 10,000+ vulnerability checks
   - OWASP Top 10 (SQL injection, XSS, SSRF, CSRF, XXE, etc.)
   - Network and web vulnerabilities
   - DNS, SSL, misconfiguration checks
   - Example: "start a full scan for example.com"

2. LIGHT SCAN (Quick Scan)
   - Basic security checks
   - DNS checks
   - SSL/TLS checks
   - Misconfiguration checks
   - Example: "start a light scan for example.com"

3. CRAWLER SCAN (Link Discovery)
   - Does NOT perform security tests
   - Maps site structure
   - Finds all URLs
   - Detects input fields
   - Example: "discover links for example.com"

Scan results can be viewed on the S4E.io dashboard:
${APP_ORIGIN}`,

  full_scan: `Full Scan - Comprehensive Security Scan

Full scan is the most comprehensive security scan.

Checked Categories:
- DNS controls
- SSL/TLS controls
- Misconfiguration
- Network vulnerabilities
- Web vulnerabilities
- Information scans
- Product-based web vulnerabilities
- Product-based network vulnerabilities
- Exposed panels

Detected Vulnerabilities:
- SQL Injection
- Cross-Site Scripting (XSS)
- Server-Side Request Forgery (SSRF)
- Cross-Site Request Forgery (CSRF)
- XML External Entity (XXE)
- Local/Remote File Inclusion
- Command Injection
- And 10,000+ more...

Usage:
"start a full scan for [domain]"
"run a security scan on [domain]"`,

  light_scan: `Light Scan - Quick Security Check

Light scan quickly performs basic security checks.

Checked Categories:
- DNS controls
- SSL/TLS controls
- Misconfiguration
- Product-based network vulnerabilities

When to Use:
- For a quick security assessment
- For SSL certificate checks
- For DNS configuration checks
- For basic security posture review

Usage:
"start a light scan for [domain]"
"run a quick scan on [domain]"`,

  crawler_scan: `Crawler Scan - Link and URL Discovery

Crawler scan does NOT perform security tests.
It only discovers site structure.

What It Does:
- Finds all pages on the site
- Maps links
- Detects forms and input fields
- Extracts site structure

When to Use:
- As preparation before a full scan
- To understand the site structure
- To list all pages

Usage:
"discover links for [domain]"
"crawl [domain]"
"run crawler for [domain]"`,
} as const;

export type ScanTopicKey = keyof typeof SCAN_TOPICS;
