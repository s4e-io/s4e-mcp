/**
 * Service Tools - Services (open ports) detected on assets, as on the Service Manager page
 */

import { S4EClient } from "../../core/client.js";
import { S4EApiResponse } from "../../core/types.js";
import {
  ListServicesParams,
  ServiceItem,
  CountServicesByPortParams,
  ServicePortCount,
  CountServicesByProtocolParams,
  ServiceProtocolCount,
  ServiceListResponse,
  SetServiceScanEnabledParams,
  SetServiceScanEnabledResponse,
} from "./types.js";

export * from "./types.js";
export { SERVICE_TOPICS } from "./topics.js";

/**
 * List services (asset + port pairs) of the token owner.
 */
export async function listServices(
  client: S4EClient,
  params: ListServicesParams
): Promise<S4EApiResponse<ServiceListResponse<ServiceItem>>> {
  return client.request<ServiceListResponse<ServiceItem>>("/asset/service-tracking/list", { ...params });
}

/**
 * Number of assets per port.
 */
export async function countServicesByPort(
  client: S4EClient,
  params: CountServicesByPortParams
): Promise<S4EApiResponse<ServiceListResponse<ServicePortCount>>> {
  return client.request<ServiceListResponse<ServicePortCount>>("/asset/service-tracking/count-by-port", { ...params });
}

/**
 * Number of services per protocol.
 */
export async function countServicesByProtocol(
  client: S4EClient,
  params: CountServicesByProtocolParams
): Promise<S4EApiResponse<ServiceListResponse<ServiceProtocolCount>>> {
  return client.request<ServiceListResponse<ServiceProtocolCount>>(
    "/asset/service-tracking/count-by-protocol-name",
    { ...params }
  );
}

/**
 * Turn scanning on or off for the matching services.
 */
export async function setServiceScanEnabled(
  client: S4EClient,
  params: SetServiceScanEnabledParams
): Promise<S4EApiResponse<SetServiceScanEnabledResponse>> {
  return client.request<SetServiceScanEnabledResponse>("/asset/service-tracking/bulk-set-scan-enabled", { ...params });
}

export function formatServiceList(items: ServiceItem[]): string {
  if (items.length === 0) return "No services found.";
  return items
    .map((s) => {
      const protocol = s.protocol_name ?? "unknown";
      const scan = s.if_scan_enabled === false ? ", scan off" : "";
      return `- ${s.asset}:${s.port} ${protocol} (${s.presence_state}${scan})`;
    })
    .join("\n");
}

export function formatPortCounts(items: ServicePortCount[]): string {
  if (items.length === 0) return "No ports found.";
  return items.map((p) => `- ${p.port} (${p.protocol_name ?? "unknown"}): ${p.asset_count} asset(s)`).join("\n");
}

export function formatProtocolCounts(items: ServiceProtocolCount[]): string {
  if (items.length === 0) return "No services found.";
  return items.map((p) => `- ${p.protocol_name ?? "unknown"}: ${p.count} service(s)`).join("\n");
}
