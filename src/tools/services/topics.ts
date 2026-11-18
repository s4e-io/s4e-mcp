/**
 * Service Topics - LLM guidance for the Service Manager (asset service tracking)
 */

import { APP_ORIGIN } from "../../core/config.js";

export const SERVICE_TOPICS = {
  overview: `S4E.io Service Manager

A service is one asset + port pair found by port scans, with its protocol
(http, ssh, ...). presence_state is "active" while the port is still seen and
"passive" once later scans stop seeing it. if_scan_enabled says whether
security scans run on that service.

Tools:
- list_services: the services themselves, with filters
- count_services_by_port: assets per port (Top Ports)
- count_services_by_protocol: services per protocol (Top Services)
- set_service_scan_enabled: turn scanning on or off (needs a write token)

Dashboard:
${APP_ORIGIN}/service-manager`,

  list: `List Services (list_services)

Lists asset + port pairs. Filter by ports / ports_exclude, protocol_ids,
presence_state, asset_ids, assets (names) or tag_ids. total_count is the
number of matching services, so per_page=1 is enough to count them.
protocol_id values come from count_services_by_protocol or earlier results.

Example Usage:
- "Which services are open on example.com?"
- "How many active services do I have?"
- "List assets with port 3389 open"`,

  counts: `Service Counts (count_services_by_port, count_services_by_protocol)

count_services_by_port returns how many assets have each port open;
count_services_by_protocol returns how many services each protocol has.
Both take the same filters as list_services (presence_state, ports, asset_ids, ...).

Example Usage:
- "What are my top 5 open ports?"
- "Which protocols run most on my active services?"`,

  scan_enabled: `Turn Service Scanning On/Off (set_service_scan_enabled)

Sets if_scan_enabled on every service that matches the filters. At least one
filter is required; to change a single service send its asset_ids and ports.
The token must have write permission. Returns the number of updated services.

Example Usage:
- "Stop scanning port 22 on example.com"
- "Enable scanning for all passive services"`,
} as const;

export type ServiceTopicKey = keyof typeof SERVICE_TOPICS;
