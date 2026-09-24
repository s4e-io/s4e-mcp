
// Assignment status: 1=active, 2=disabled, 3=pending approval
export type ActionAssignmentStatus = 1 | 2 | 3;

// Action catalog item (public catalog, /action/info/list)
export interface ActionCatalogItem {
  action_uniq_uuid: string;
  name: string;
  description: string;
  benefit: string;
  expert_comment: string;
  sample_output: string;
  usage_count: number;
  if_active: boolean;
  if_visible: boolean;
  estimated_time: number;
  suggested_custom_parameters?: unknown;
  scan_slugs: string[] | null;
  interval: number | null;
  assignment_status: "available" | "already_assigned";
  [key: string]: unknown;
}

export interface ActionListResponse {
  data: ActionCatalogItem[];
  count: number;
}

export interface ListActionsParams {
  search_text?: string;
  action_uniq_uuid?: string;
  page?: number;
  per_page?: number;
  order_type?: "asc" | "desc";
  assignment_filter?: "all" | "assigned" | "available";
}

// Action assignment item (token owner's own assignments, /action/handler/list-my)
export interface ActionAssignmentItem {
  action_uniq_uuid: string;
  action_name: string;
  action_description: string;
  action_benefit: string;
  action_expert_comment: string;
  estimated_time: number;
  suggested_custom_parameters?: unknown;
  scan_slugs: string[] | null;
  interval: number | null;
  custom_parameters: Record<string, unknown>;
  status: ActionAssignmentStatus;
  activated_at: number | null;
  disabled_at: number | null;
  last_run_date: number | null;
  last_output_status: number | null;
  [key: string]: unknown;
}

export interface ActionListMyResponse {
  data: ActionAssignmentItem[];
  count: number;
}

export interface ListMyActionsParams {
  page?: number;
  per_page?: number;
  search_text?: string;
  status?: ActionAssignmentStatus[];
  action_uniq_uuid?: string;
}

export interface AssignActionParams {
  action_uniq_uuid: string;
  custom_parameters?: Record<string, unknown>;
  interval?: number;
  scan_slugs?: string[];
}

export interface TriggerActionParams {
  action_uniq_uuid: string;
  custom_parameters?: Record<string, unknown>;
}

export interface TriggerActionResponse {
  slug: string;
}

export interface DeleteActionParams {
  action_uniq_uuid: string;
}
