import { apiGet, apiPatch } from "../../../shared/api/client";
import type { ItemsPage } from "../../../shared/api/pagination";

/**
 * The pre-publication review queue for listings posted inside a vetted housing
 * group (`/admin/housing-group-listings`).
 *
 * Two moderation controls sit on the same row and are deliberately NOT the same
 * decision, so this module only owns one of them:
 *  - `status` (here) decides whether a listing ever becomes public at all.
 *  - `hidden` (`adminHousingGroups.api.ts`) pulls an already-public listing down
 *    for a norm violation.
 *
 * Mirrors the backend `AdminGroupListingDTO` hand-mapped in
 * `housing-groups-response.ts`. Guarded by the moderator/admin role or the
 * additive `housing_moderator` staff role; 403s for anyone else.
 */

/** Where a listing sits in its pre-publication review. */
export type GroupListingStatus = "review" | "question" | "live" | "declined";

/** The member who posted the listing, as the backend's compact `MemberRef`. */
export interface GroupListingPoster {
  slug: string;
  firstName: string;
  lastName: string;
  pronouns: string | null;
  avatarUrl: string | null;
}

export interface AdminGroupListingQueueDTO {
  id: string;
  title: string;
  description: string;
  neighbourhood: string;
  priceEuros: number;
  accessibilityInfo: string;
  groupSlug: string | null;
  groupName: string | null;
  status: GroupListingStatus;
  /** Deterministic 0–100 red-flag score. Sorts the queue; decides nothing. */
  riskScore: number;
  /** Stable machine reason codes behind `riskScore`. */
  riskReasons: string[];
  hidden: boolean;
  hiddenReason: string | null;
  createdAt: string;
  postedBy: GroupListingPoster | null;
  decidedAt: string | null;
  /** The deciding staffer's user id — the audit key, never a display name. */
  decidedBy: string | null;
  decisionReason: string | null;
}

/** The queue's status filter, plus the "everything" option the tabs open on. */
export type GroupListingQueueFilter = GroupListingStatus | "all";

export interface GroupListingQueueParameters {
  page?: number;
  status?: GroupListingStatus;
  group?: string;
  hidden?: boolean;
}

/** One page of the review queue, riskiest first then newest. */
export const getGroupListingQueue = (
  parameters: GroupListingQueueParameters,
  signal?: AbortSignal,
) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.status) searchParams.set("status", parameters.status);
  if (parameters.group) searchParams.set("group", parameters.group);
  if (parameters.hidden !== undefined) {
    searchParams.set("hidden", String(parameters.hidden));
  }
  const querySuffix = searchParams.toString();
  return apiGet<ItemsPage<AdminGroupListingQueueDTO>>(
    `/admin/housing-groups/listings/queue${querySuffix ? `?${querySuffix}` : ""}`,
    undefined,
    undefined,
    signal,
  );
};

export interface SetGroupListingStatusBody {
  status: GroupListingStatus;
  /** Required by the backend for `declined` and `question`. Sent to the poster. */
  reason?: string;
}

/**
 * Record the review decision. The backend refuses a `declined` or `question`
 * with no reason (400), stamps who decided and when, and tells the poster
 * in-app plus push for every outcome except a return to `review`.
 */
export const setGroupListingStatus = (
  id: string,
  body: SetGroupListingStatusBody,
) =>
  apiPatch<AdminGroupListingQueueDTO>(
    `/admin/housing-groups/listings/${id}/status`,
    body,
  );
