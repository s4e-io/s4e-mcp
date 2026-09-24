/**
 * Risk Tools - Asset risk scores and history
 */

import { S4EClient } from "../../core/client.js";
import { S4EApiResponse } from "../../core/types.js";
import {
  AssetRiskScoreV2Response,
  AssetScoreHistoryResponse,
  GetAssetRiskScoreV2Params,
  GetAssetScoreHistoryParams,
} from "./types.js";

export * from "./types.js";

/**
 * Retrieve detailed risk scores for assets (V2).
 */
export async function getAssetRiskScoreV2(
  client: S4EClient,
  params: GetAssetRiskScoreV2Params = {}
): Promise<S4EApiResponse<AssetRiskScoreV2Response>> {
  const {
    asset_ids,
    assets,
    tag,
    page = 1,
    per_page = 20,
    order_type = "desc",
    order_by = "calculated_at",
    calculated_at_min,
    calculated_at_max,
    if_unique,
  } = params;

  return client.request<AssetRiskScoreV2Response>("/risk/asset-score", {
    page,
    per_page,
    order_type,
    order_by,
    ...(asset_ids?.length ? { asset_ids } : {}),
    ...(assets?.length ? { assets } : {}),
    ...(tag ? { tag } : {}),
    ...(calculated_at_min !== undefined ? { calculated_at_min } : {}),
    ...(calculated_at_max !== undefined ? { calculated_at_max } : {}),
    ...(if_unique !== undefined ? { if_unique } : {}),
  });
}

/**
 * Retrieve historical risk scores for assets.
 */
export async function getAssetScoreHistory(
  client: S4EClient,
  params: GetAssetScoreHistoryParams = {}
): Promise<S4EApiResponse<AssetScoreHistoryResponse>> {
  const {
    asset_ids,
    assets,
    tag,
    page = 1,
    per_page = 20,
    order_type = "desc",
    order_by = "calculated_at",
  } = params;

  return client.requestGet<AssetScoreHistoryResponse>("/risk/get-asset-score-history", {
    page,
    per_page,
    order_type,
    order_by,
    ...(asset_ids?.length ? { asset_ids } : {}),
    ...(assets?.length ? { assets } : {}),
    ...(tag ? { tag } : {}),
  });
}
