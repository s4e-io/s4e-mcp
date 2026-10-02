/**
 * Action Tools - Public action automation catalog and assignments
 */

import { S4EClient } from "../../core/client.js";
import { S4EApiResponse } from "../../core/types.js";
import {
  ListActionsParams,
  ActionListResponse,
  ActionCatalogItem,
  ListMyActionsParams,
  ActionListMyResponse,
  ActionAssignmentItem,
  AssignActionParams,
  TriggerActionParams,
  TriggerActionResponse,
  DeleteActionParams,
  UpdateActionParams,
  GetActionOutputParams,
  ActionOutputItem,
  ListActionRunsParams,
  ActionRunsResponse,
} from "./types.js";

export * from "./types.js";
export { ACTION_TOPICS } from "./topics.js";

export const ACTION_STATUS_LABELS: Record<number, string> = {
  1: "active",
  2: "disabled",
  3: "pending_approval",
};

export const ACTION_OUTPUT_STATUS_LABELS: Record<number, string> = {
  0: "running",
  1: "success",
  2: "error",
  3: "timeout",
};

/**
 * Browse the public action catalog.
 */
export async function listActionsCatalog(
  client: S4EClient,
  params: ListActionsParams = {}
): Promise<S4EApiResponse<ActionListResponse>> {
  return client.request<ActionListResponse>("/action/info/list", { ...params });
}

/**
 * List the token owner's own action assignments.
 */
export async function listMyActions(
  client: S4EClient,
  params: ListMyActionsParams = {}
): Promise<S4EApiResponse<ActionListMyResponse>> {
  return client.request<ActionListMyResponse>("/action/handler/list-my", { ...params });
}

/**
 * Assign a catalog action to the token owner (pending-approval).
 */
export async function assignAction(
  client: S4EClient,
  params: AssignActionParams
): Promise<S4EApiResponse<null>> {
  return client.request<null>("/action/handler/assign", { ...params });
}

/**
 * Manually run an already-assigned, active action.
 */
export async function triggerAction(
  client: S4EClient,
  params: TriggerActionParams
): Promise<S4EApiResponse<TriggerActionResponse>> {
  return client.request<TriggerActionResponse>("/action/handler/trigger", { ...params });
}

/**
 * Soft-delete (disable) an action assignment.
 */
export async function deleteAction(
  client: S4EClient,
  params: DeleteActionParams
): Promise<S4EApiResponse<null>> {
  return client.request<null>("/action/handler/delete", { ...params });
}

/**
 * Update an assignment's custom_parameters, interval and/or scan_slugs.
 */
export async function updateAction(
  client: S4EClient,
  params: UpdateActionParams
): Promise<S4EApiResponse<null>> {
  return client.request<null>("/action/handler/update", { ...params });
}

/**
 * Read a single run result by slug (as returned by trigger_action).
 */
export async function getActionOutput(
  client: S4EClient,
  params: GetActionOutputParams
): Promise<S4EApiResponse<ActionOutputItem>> {
  return client.request<ActionOutputItem>("/action/output/get", { ...params });
}

/**
 * List past runs of an assigned action; count is the total number of matching runs.
 */
export async function listActionRuns(
  client: S4EClient,
  params: ListActionRunsParams
): Promise<S4EApiResponse<ActionRunsResponse>> {
  return client.request<ActionRunsResponse>("/action/output/history", { ...params });
}

export function formatActionCatalog(items: ActionCatalogItem[]): string {
  if (items.length === 0) return "No actions found.";
  return items
    .map((a) => {
      const status = a.assignment_status === "already_assigned" ? "already assigned" : "available";
      return `- **${a.name}** (${status})\n  UUID: \`${a.action_uniq_uuid}\`\n  ${a.description}`;
    })
    .join("\n\n");
}

export function formatMyActions(items: ActionAssignmentItem[]): string {
  if (items.length === 0) return "No action assignments found.";
  return items
    .map((a) => {
      const status = ACTION_STATUS_LABELS[a.status] ?? String(a.status);
      return `- **${a.action_name}** (${status})\n  UUID: \`${a.action_uniq_uuid}\`\n  ${a.action_description}`;
    })
    .join("\n\n");
}

export function formatActionRuns(items: ActionOutputItem[]): string {
  if (items.length === 0) return "No action runs found.";
  return items
    .map((r) => {
      const status = ACTION_OUTPUT_STATUS_LABELS[r.status] ?? String(r.status);
      return `- \`${r.slug}\` (${status})`;
    })
    .join("\n");
}
