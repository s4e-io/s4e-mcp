import { S4EClient } from "../../core/client.js";
import { S4EApiResponse } from "../../core/types.js";
import type { S4EUserInfo } from "./types.js";

export type { S4EUserInfo } from "./types.js";

enum CstPackage {
  FREE = 1,
  EXPERT = 2,
  ENTERPRISE = 3,
  ELITE = 4,
  PREMIER = 5,
}

interface S4EPackageInfo extends Record<string, unknown> {
  has_package: boolean;
  package_id: CstPackage;
  deletion_alert: boolean;
  deleted_at: number | null;
  finished_at: number;
}

function getPackageName(value: unknown): string | undefined {
  return typeof value === "number" ? CstPackage[value] : undefined;
}

function formatUtcTimestamp(value: unknown): unknown {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return value;
  }

  return `${new Date(value * 1000).toISOString().replace("T", " ").replace(".000Z", "")} (UTC+0)`;
}

export async function verifyToken(
  client: S4EClient
): Promise<S4EApiResponse<S4EUserInfo>> {
  return client.request<S4EUserInfo>("/user/info", {});
}

export async function getUserInfo(
  client: S4EClient
): Promise<S4EApiResponse<S4EUserInfo>> {
  return client.request<S4EUserInfo>("/user/info", {});
}

/**
 * Get the user's package / subscription info
 * (plan tier, scan quota, expiry, etc.).
 */
export async function getPackageInfo(
  client: S4EClient
): Promise<S4EApiResponse<Record<string, unknown>>> {
  const [packageInfo, userInfo] = await Promise.all([
    client.request<S4EPackageInfo>("/user/package-info", {}),
    getUserInfo(client),
  ]);

  if (!packageInfo.success || !packageInfo.data) {
    return packageInfo;
  }
  const { package_id: packageId, ...packageData } = packageInfo.data;
  const currentPlan = getPackageName(packageId);

  return {
    ...packageInfo,
    data: {
      ...packageData,
      ...(currentPlan !== undefined ? { current_plan: currentPlan } : {}),
      finished_at: formatUtcTimestamp(packageInfo.data.finished_at),
      license_count: userInfo.data?.premium_asset_limit,
      used_license: userInfo.data?.premium_asset_count,
    },
  };
}
