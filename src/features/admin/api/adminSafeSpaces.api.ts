import { apiGet, apiPatch } from "../../../shared/api/client";
import type { ListingDTO } from "../../marketing/listBusiness/api/listings.api";

/**
 * Admin safe-space moderation (spec Task 4, backend-final). Lets a
 * Moderator/Admin list every listing eligible to become — or already carrying
 * — a Safe Space status, and toggle/edit that status. Kept self-contained (no
 * cross-import of frontend safe-space view-model types), the same way
 * `adminMembers.api.ts` stays a thin wire-shape file and leaves reconciling
 * with the view model to an adapter.
 */

export type SafeSpaceStatus = "none" | "verified" | "removed";

/**
 * The independent-visit tally the candidates endpoint reports for one listing.
 *
 * `independentVisitCount` excludes vouches from anyone with a stake in the
 * place (the owner and any active co-manager). This endpoint has no nomination
 * in hand, so unlike the reviewed path it cannot also exclude a nominator,
 * which can only ever OVERSTATE the count. A listing this reports as under the
 * bar is therefore genuinely under it.
 */
export interface SafeSpaceVisitTally {
  independentVisitCount: number;
  requiredVisitCount: number;
  hasMetVisitBar: boolean;
}

export interface SafeSpaceCandidate {
  ref: string;
  slug: string;
  name: string;
  hood: string;
  safeSpaceStatus: SafeSpaceStatus;
  visits: SafeSpaceVisitTally;
}

/** One safe-space promise card, as edited by the moderator. */
export interface SafeSpacePromiseInput {
  title: string;
  desc: string;
}

/** One member vouch shown on the safe-space detail page, as edited by the moderator. */
export interface SafeSpaceVouchInput {
  name: string;
  byline: string;
  text: string;
  when: string;
}

/** `PATCH /admin/listings/:ref/safe-space` request body — mirrors `UpdateSafeSpaceDto` exactly. */
export interface SetSafeSpaceInput {
  status: SafeSpaceStatus;
  tier?: number;
  verifier?: string;
  /**
   * Why this listing is being badged below the independent-visit bar. The
   * backend requires it on a transition INTO `verified` from any other status
   * and refuses without it (`SAFE_SPACE_VISIT_BAR_NOT_MET`); it is ignored on
   * every other move, so clearing a badge, removing one, or editing one that
   * already stands never needs it. Minimum 20 characters, mirroring
   * `UpdateSafeSpaceDto`.
   */
  belowVisitBarReason?: string;
  reVerifiedAt?: string;
  sub?: string;
  promises?: SafeSpacePromiseInput[];
  vouches?: SafeSpaceVouchInput[];
  reason?: string;
}

/** Every listing a moderator may verify/remove/reinstate as a Safe Space, plus its current status. Moderator/Admin only. */
export const getSafeSpaceCandidates = () =>
  apiGet<SafeSpaceCandidate[]>("/admin/listings/safe-space-candidates");

/** Toggle or edit one listing's Safe Space status. Returns the updated listing. Moderator/Admin only. */
export const setSafeSpace = (ref: string, body: SetSafeSpaceInput) =>
  apiPatch<ListingDTO>(
    `/admin/listings/${encodeURIComponent(ref)}/safe-space`,
    body,
  );
