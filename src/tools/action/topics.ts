/**
 * Action Topics - LLM guidance for the action automation catalog
 */

import { APP_ORIGIN } from "../../core/config.js";

export const ACTION_TOPICS = {
  overview: `S4E.io Actions

Actions are pre-built automations from a public catalog (e.g. auto-remediation,
notifications, integrations) that a user can assign to their account, optionally
attach to scan slugs so they auto-run after those scans, and run manually.

Lifecycle:
1. Browse the catalog (list_actions) to find an action_uniq_uuid.
2. Assign it (assign_action) — creates a pending-approval assignment (status=3).
   An admin/user must approve it in the dashboard before it can run.
3. Once active (status=1), run it manually (trigger_action) or let it run
   automatically when its attached scan_slugs finish.
4. Review your assignments (list_my_actions).
5. Remove it (delete_action) — soft delete: disabled (status=2), history kept.

Dashboard:
${APP_ORIGIN}`,

  catalog: `Action Catalog (list_actions)

Lists public actions available to the token owner, paginated and searchable.
Use assignment_filter to narrow to actions already assigned ("assigned") or not
yet assigned ("available"). The returned action_uniq_uuid is what assign_action,
trigger_action and delete_action expect.

Example Usage:
- "List available actions"
- "Search actions for 'slack notification'"
- "Show actions I haven't assigned yet"`,

  assign: `Assign an Action (assign_action)

Assigns a catalog action to the token owner. A user cannot assign the same
action twice. The assignment starts in a pending-approval state (status=3) and
must be approved (in the S4E dashboard) before it can be triggered.

Optional parameters:
- custom_parameters: overrides the action's suggested defaults
- interval: automatic run interval in minutes
- scan_slugs: scan slugs that should auto-trigger this action once approved

Example Usage:
- "Assign action <uuid> to run every 1440 minutes"
- "Assign action <uuid> and trigger it after full-port-tcp-scan"`,

  trigger: `Run/Test an Action (trigger_action)

Manually runs an already-assigned, active (status=1) action. Returns immediately
with a slug — read the result with get_action_output (status 0=running,
1=success, 2=error, 3=timeout). Pending-approval or disabled assignments cannot be triggered.

Example Usage:
- "Run action <uuid> now"
- "Test action <uuid> with these custom parameters: {...}"`,

  update: `Update an Action Assignment (update_action)

Changes custom_parameters, interval (minutes) and/or scan_slugs of an existing
assignment. Omitted fields keep their stored value; at least one is required.
custom_parameters replaces the stored object, so send the full object. The
assignment status is not changed.

Example Usage:
- "Run action <uuid> every 2 days" (interval=2880)
- "Change the rules of action <uuid> to ..."`,

  output: `Action Run Result (get_action_output)

Reads one run by the slug trigger_action returned. status: 0=running,
1=success, 2=error, 3=timeout. Poll while status is 0.

Example Usage:
- "Show the result of run <slug>"`,

  history: `Action Run History (list_action_runs)

Lists all past runs of an assigned action, newest first. total_count is the
number of matching runs; filter by status=1 (success) or status=2 (error) to
count successful or failed runs.

Example Usage:
- "How many times did action <uuid> run, and how many succeeded?"
- "Show failed runs of action <uuid>"`,

  delete: `Delete an Action Assignment (delete_action)

Unassigns (soft-deletes) an action for the token owner: the assignment is
disabled (status=2) rather than removed, so its run history is preserved. A
disabled assignment stops running automatically and rejects manual triggers.

Example Usage:
- "Remove action <uuid> from my account"
- "Disable action <uuid>"`,

  list_my: `My Action Assignments (list_my_actions)

Lists all action assignments belonging to the token owner. Supports filtering
by status (1=active, 2=disabled, 3=pending approval) and free-text search, or
looking up a single assignment via action_uniq_uuid.

Example Usage:
- "Show my active actions"
- "List my pending action assignments"`,
} as const;

export type ActionTopicKey = keyof typeof ACTION_TOPICS;
