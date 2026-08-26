import { apiGet, apiPatch } from "../../../shared/api/client";

/**
 * The member's own coarse activity signal and its opt-out.
 *
 * `band` is one of the three wire tokens (or `null`: opted out is not the only
 * reason, see `activityBand.ts`). There is deliberately no timestamp field on
 * this response and there must never be one: the backend stores a month and
 * ships a band, and a precise value here is the thing the whole design avoids.
 */
export interface ActivityVisibilityDTO {
  band: string | null;
  isHidden: boolean;
}

export const getActivityVisibility = () =>
  apiGet<ActivityVisibilityDTO>("/profiles/me/activity-visibility");

export const setActivityVisibility = (isHidden: boolean) =>
  apiPatch<ActivityVisibilityDTO>("/profiles/me/activity-visibility", {
    isHidden,
  });
