import { apiGet, apiPut } from "../../../shared/api/client";
import type { GroupAddPolicy } from "../../../shared/contracts/contracts";

/**
 * "Who can add me to groups" (PRD-353). Mirrors `suggestionVisibility.api.ts`
 * field-for-field.
 *
 * `connections` (default, today's behaviour): a connection who is an
 * owner/admin of a group may seat the caller directly.
 * `invite_only`: every add becomes an invite the caller accepts or declines
 * instead of being seated immediately. There is no third "everyone" value,
 * only accepted connections of the adder can ever be added or invited in the
 * first place, whichever policy is in force.
 *
 * A member who previously left or was removed from a specific group is NEVER
 * silently re-seated by this preference: that always creates an invite,
 * regardless of what's stored here (server-enforced, not a client concern).
 */
export interface GroupAddPolicyDTO {
  policy: GroupAddPolicy;
}

/** Mirrors the backend's own default (`connections`): what the picker shows
 *  before the first fetch resolves. */
export const DEFAULT_GROUP_ADD_POLICY: GroupAddPolicy = "connections";

/** GET /me/group-add-policy: never 404s; synthesises the default when unset. */
export const getGroupAddPolicy = () =>
  apiGet<GroupAddPolicyDTO>("/me/group-add-policy");

/** PUT /me/group-add-policy: echoes back what was actually stored. */
export const putGroupAddPolicy = (policy: GroupAddPolicy) =>
  apiPut<GroupAddPolicyDTO>("/me/group-add-policy", { policy });
