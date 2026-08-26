import { apiGet, apiPost } from "../../../shared/api/client";
import type { ItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type {
  HousingListingDTO,
  HousingListingStatus,
} from "../../economy/api/housingListing.api";

/**
 * The housing review console's wire layer (`/admin/housing-listings`).
 *
 * Both routes are gated server-side by a platform moderator/admin role or the
 * additive `housing_moderator` staff role, and they are the ONLY routes that
 * return `AdminHousingListingDTO`, which carries the exact coordinates and the
 * full street address of a real person's home. Nothing outside this console
 * may read that shape.
 */

/** How the queue is ordered. `risk` is the default and the reason the queue
 * exists: the backend scores every listing deterministically at create and on
 * every edit, so leading with the highest score puts the likely scam, the
 * likely discriminatory listing and the unverified lister in front of a
 * moderator first. Ties break oldest-first so nothing at a score is starved. */
export type HousingReviewQueueSort = "risk" | "oldest" | "newest";

/** Which bucket to list. Defaults to `review`, the pending working set.
 * `all` widens it to every listing regardless of status. */
export type HousingReviewQueueStatus = HousingListingStatus | "all";

export interface HousingReviewQueueQuery {
  status?: HousingReviewQueueStatus;
  sort?: HousingReviewQueueSort;
  page?: number;
}

/** The four decisions a moderator can record. Expressed as an action rather
 * than a target status: three of them require a reason, all four notify the
 * lister, and `take_down` is only legal on a listing that is currently live. */
export type HousingListingDecisionAction =
  "approve" | "request_changes" | "reject" | "take_down";

export interface DecideHousingListingBody {
  decision: HousingListingDecisionAction;
  /** Required for `request_changes`, `reject` and `take_down`; the backend
   * 400s on a blank one. Optional note on `approve`. Shown to the lister
   * verbatim, so it is one person writing to another. */
  reason?: string;
}

/**
 * What a moderator has decided about THIS LISTER before, counted across their
 * own housing listings. Counts only: no other listing's title, address, or
 * lister. It answers "have we refused this person twice already?" without
 * making the moderator open a second surface per row.
 */
export interface HousingListerHistoryDTO {
  totalListings: number;
  liveListings: number;
  changesRequestedListings: number;
  rejectedListings: number;
  takenDownListings: number;
  /** True when this member has never had a listing refused or pulled. */
  hasCleanRecord: boolean;
}

/**
 * The public listing shape plus everything a human needs to decide without
 * opening five tabs. `riskScore`/`riskReasons` are deliberately absent from
 * the public DTO so they can never leak onto browse.
 */
export interface AdminHousingListingDTO extends HousingListingDTO {
  /** 0 (clean) to 100 (many strong red flags). */
  riskScore: number;
  /** Stable machine codes from the backend's risk assessment, in a fixed
   * order (`rent_far_below_market`, `contact_info_in_text`,
   * `discriminatory_language`, …). Localized by this console. */
  riskReasons: string[];
  /** Null when the lister erased their account: there is no member left to
   * have a record. */
  listerHistory: HousingListerHistoryDTO | null;
  /** Who recorded the last decision, when there is one. */
  decidedBy: MemberRefDTO | null;
}

/** GET /admin/housing-listings — the review queue, riskiest first by default. */
export function getHousingReviewQueue(query: HousingReviewQueueQuery = {}) {
  const searchParams = new URLSearchParams();
  if (query.status) searchParams.set("status", query.status);
  if (query.sort) searchParams.set("sort", query.sort);
  if (query.page) searchParams.set("page", String(query.page));
  const querySuffix = searchParams.toString();
  return apiGet<ItemsPage<AdminHousingListingDTO>>(
    `/admin/housing-listings${querySuffix ? `?${querySuffix}` : ""}`,
  );
}

/** POST /admin/housing-listings/:ref/decision — one moderator decision.
 * Approving publishes the listing and fires the saved-search alerts. */
export function decideHousingListing(
  ref: string,
  body: DecideHousingListingBody,
) {
  return apiPost<AdminHousingListingDTO>(
    `/admin/housing-listings/${ref}/decision`,
    body,
  );
}
