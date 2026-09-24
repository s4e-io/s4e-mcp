/**
 * Assets Tools - Asset listing and details
 */

import { S4EClient } from "../../core/client.js";
import { S4EApiResponse } from "../../core/types.js";
import {
  ListAssetsParams,
  AssetListResponse,
  GetAssetDetailParams,
  AssetDetailResponse,
  S4EAsset,
  AddAssetsParams,
  AddAssetsResponse,
  CheckAssetOwnershipParams,
  CheckAssetOwnershipResponse,
  CheckAssetTypeParams,
  CheckAssetTypeResponse,
  AssetTagItem,
  UpdateScanCategoriesParams,
  UpdateAssetDescriptionParams,
  ASSET_DESCRIPTION_MIN_LENGTH,
  ASSET_DESCRIPTION_MAX_LENGTH,
} from "./types.js";

export * from "./types.js";
export { ASSET_TOPICS } from "./topics.js";

/**
 * Get asset list
 */
export async function listAssets(
  client: S4EClient,
  params: ListAssetsParams = {}
): Promise<S4EApiResponse<AssetListResponse>> {
  const {
    search_text,
    if_verified,
    if_premium,
    asset_ids,
    order_by = "created_at",
    order_type = "desc",
    page = 1,
    per_page = 20,
  } = params;

  return client.request<AssetListResponse>("/asset/info/list", {
    ...(search_text && { search_text }),
    ...(if_verified !== undefined && { if_verified }),
    ...(if_premium !== undefined && { if_premium }),
    ...(asset_ids && { asset_ids }),
    order_by,
    order_type,
    page,
    per_page,
  });
}

/**
 * Get asset detail
 */
export async function getAssetDetail(
  client: S4EClient,
  params: GetAssetDetailParams
): Promise<S4EApiResponse<AssetDetailResponse>> {
  const { asset_id, asset } = params;

  if (!asset_id && !asset) {
    return {
      success: false,
      data: null as unknown as AssetDetailResponse,
      message: "asset_id or asset parameter is required",
      error: "asset_id or asset parameter is required",
    };
  }

  return client.request<AssetDetailResponse>("/asset/info/detail", {
    ...(asset_id && { asset_id }),
    ...(asset && { asset }),
  });
}

/**
 * Simplified asset list format
 */
export function formatAssetList(assets: S4EAsset[]): string {
  if (!assets || assets.length === 0) {
    return "No assets found.";
  }

  const lines = assets.map((a, i) => {
    const status = a.if_verified ? "✓ Verified" : "○ Unverified";
    const type = a.asset_type?.toUpperCase() || "UNKNOWN";
    return `${i + 1}. [${type}] ${a.asset} - ${status}`;
  });

  return lines.join("\n");
}

/**
 * Add assets (bulk)
 */
export async function addAssets(
  client: S4EClient,
  params: AddAssetsParams
): Promise<S4EApiResponse<AddAssetsResponse>> {
  const { assets, description, source = "manuel" } = params;

  if (!assets || assets.length === 0) {
    return {
      success: false,
      data: null as unknown as AddAssetsResponse,
      message: "At least one asset is required",
      error: "At least one asset is required",
    };
  }

  return client.request<AddAssetsResponse>("/asset/handler/bulk-asset-add", {
    assets,
    ...(description && { description }),
    source,
  });
}

/**
 * Check asset ownership - check if assets are available
 */
export async function checkAssetOwnership(
  client: S4EClient,
  params: CheckAssetOwnershipParams
): Promise<S4EApiResponse<CheckAssetOwnershipResponse>> {
  const { assets } = params;

  if (!assets || assets.length === 0) {
    return {
      success: false,
      data: null as unknown as CheckAssetOwnershipResponse,
      message: "At least one asset is required",
      error: "At least one asset is required",
    };
  }

  return client.request<CheckAssetOwnershipResponse>(
    "/asset/handler/bulk-asset-ownership-check",
    { assets }
  );
}

/**
 * Check asset type - validate asset format/type
 */
export async function checkAssetType(
  client: S4EClient,
  params: CheckAssetTypeParams
): Promise<S4EApiResponse<CheckAssetTypeResponse>> {
  const { assets } = params;

  if (!assets || assets.length === 0) {
    return {
      success: false,
      data: null as unknown as CheckAssetTypeResponse,
      message: "At least one asset is required",
      error: "At least one asset is required",
    };
  }

  return client.request<CheckAssetTypeResponse>(
    "/asset/handler/bulk-asset-type-check",
    { assets }
  );
}

/**
 * List user-defined tags along with the asset_ids attached to each.
 * Useful when the LLM needs to filter assets by a label/tag.
 */
export async function getTagsWithAssetIds(
  client: S4EClient
): Promise<S4EApiResponse<AssetTagItem[]>> {
  return client.request<AssetTagItem[]>(
    "/asset/tags/list-with-asset-ids",
    {}
  );
}

/**
 * Toggle scan categories for a single asset.
 * `status_list` is an array of `{category_slug, status}` records: status=true enables
 * the category for the asset, false disables it. Used for "continuous scan" style
 * configuration in the extension.
 */
export async function updateAssetScanCategories(
  client: S4EClient,
  params: UpdateScanCategoriesParams
): Promise<S4EApiResponse<Record<string, unknown>>> {
  if (!params.asset_id) {
    return {
      success: false,
      message: "Failed to update scan categories",
      error: "asset_id is required",
    };
  }
  if (!params.status_list || params.status_list.length === 0) {
    return {
      success: false,
      message: "Failed to update scan categories",
      error: "status_list with at least one {category_slug,status} entry is required",
    };
  }

  return client.request<Record<string, unknown>>(
    "/asset/settings/update-scan-categories",
    {
      asset_id: params.asset_id,
      status_list: params.status_list,
    }
  );
}

/**
 * Update a single asset's description.
 */
export async function updateAssetDescription(
  client: S4EClient,
  params: UpdateAssetDescriptionParams
): Promise<S4EApiResponse<Record<string, unknown>>> {
  if (params.asset_id === undefined || params.asset_id === null) {
    return {
      success: false,
      message: "Failed to update asset description",
      error: "asset_id is required",
    };
  }
  if (params.description === undefined || params.description === null) {
    return {
      success: false,
      message: "Failed to update asset description",
      error: "description is required",
    };
  }
  if (
    params.description.length < ASSET_DESCRIPTION_MIN_LENGTH ||
    params.description.length > ASSET_DESCRIPTION_MAX_LENGTH
  ) {
    return {
      success: false,
      message: "Failed to update asset description",
      error: `description must be between ${ASSET_DESCRIPTION_MIN_LENGTH} and ${ASSET_DESCRIPTION_MAX_LENGTH} characters`,
    };
  }

  return client.request<Record<string, unknown>>(
    "/asset/settings/update-asset-desc",
    {
      asset_id: params.asset_id,
      description: params.description,
    }
  );
}
