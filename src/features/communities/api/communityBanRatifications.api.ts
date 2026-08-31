import { ApiError, apiGet, apiPatch } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { CommunityBanRuleCitationDTO } from "./communityBans.api";

/**
 * Permanent community bars waiting on a second signature
 * (`/communities/:slug/ban-ratifications`, owner / co-owner / moderator only).
 *
 * PRD-25. A community permanent bar used to be unilateral: one owner or
 * moderator barred someone forever, while a PLATFORM permanent ban had needed
 * a second moderator since TS-12. The community-level bar is the removal most
 * members actually meet, so it now takes two people as well.
 *
 * What the backend does, and what this client has to render honestly: the
 * member is removed and barred for `fallbackDays` immediately, whatever
 * happens next. Only the PERMANENCE waits. If nobody signs inside
 * `windowHours` the hold lapses and the bar simply stays at that term, so
 * inaction never releases anybody, and a reader must never be left thinking it
 * does.
 *
 * The community-scoped twin of `admin/api/useBanRatifications.ts`, one scope
 * down and with the same vocabulary on purpose.
 */

/** Where a hold ended up. Only `pending` can be acted on. */
export const COMMUNITY_BAN_RATIFICATION_STATUSES = [
  "pending",
  "ratified",
  "declined",
  "expired",
  "withdrawn",
] as const;

export type CommunityBanRatificationStatus =
  (typeof COMMUNITY_BAN_RATIFICATION_STATUSES)[number];

/** One permanent bar waiting on, or already decided by, a second signatory.
 *  Also the shape `PATCH …/ban-ratifications/:id` answers with. */
export interface CommunityBanRatificationDTO {
  id: string;
  /** Null when the barred account has since been erased. The hold stands. */
  member: MemberRefDTO | null;
  /** The name snapshot taken when the bar was proposed, so the row still reads
   *  correctly after an erasure. */
  memberName: string;
  /** Null when the proposer has since erased their account. */
  requestedBy: MemberRefDTO | null;
  /** The proposer's own words, as written on the removal. */
  note: string | null;
  rule: CommunityBanRuleCitationDTO | null;
  /** What the member is serving while the hold stands. Today always
   *  `removed_and_barred_30_days`. */
  interimAction: string;
  /** ISO instant the interim bar ends by itself. Null once a signed hold has
   *  made the bar permanent. */
  barExpiresAt: string | null;
  requestedAt: string;
  /** ISO instant the hold lapses if nobody signs. */
  expiresAt: string;
  isExpired: boolean;
  /** True when the viewer proposed this bar, so may not sign it. Enforced on
   *  the server either way; this is what lets the row say WHY. */
  isOwnProposal: boolean;
  status: CommunityBanRatificationStatus;
  decidedBy: MemberRefDTO | null;
  decidedAt: string | null;
  decisionNote: string | null;
}

/**
 * The queue for one community, soonest to lapse first.
 *
 * `windowHours` and `fallbackDays` are served rather than assumed so no copy
 * hard-codes "72 hours" or "30 days" and then drifts when the server changes
 * its mind.
 */
export interface CommunityBanRatificationListDTO {
  ratifications: CommunityBanRatificationDTO[];
  total: number;
  windowHours: number;
  fallbackDays: number;
}

/** The second signature, or the refusal. The wire literal is `decline`, the
 *  same word the platform hold uses and the same word the UI says. */
export interface DecideCommunityBanRatificationInput {
  decision: "ratify" | "decline";
  /** The second signatory's own words, up to 2000 characters. */
  note?: string;
}

export const getCommunityBanRatifications = (
  slug: string,
  status: CommunityBanRatificationStatus = "pending",
) =>
  apiGet<CommunityBanRatificationListDTO>(
    `/communities/${slug}/ban-ratifications?status=${status}`,
  );

export const decideCommunityBanRatification = (
  slug: string,
  ratificationId: string,
  input: DecideCommunityBanRatificationInput,
) =>
  apiPatch<CommunityBanRatificationDTO>(
    `/communities/${slug}/ban-ratifications/${ratificationId}`,
    input,
  );

/**
 * Why a signature was refused, as far as the client can tell it apart.
 *
 *  - `ownProposal` (403): the caller asked for this bar, so cannot sign it.
 *    The row already disables the buttons on `isOwnProposal`; this catches the
 *    case where a stale list said otherwise.
 *  - `alreadyDecided` (409): somebody else signed it, it lapsed to the
 *    fallback term, or the bar was lifted underneath the hold.
 *  - `gone` (404): the hold is not there any more.
 *
 * Read off the HTTP status rather than the server's prose, which is
 * server-worded English and not translatable.
 */
export type CommunityBanRatificationRefusal =
  "ownProposal" | "alreadyDecided" | "gone";

export function communityBanRatificationRefusalFor(
  error: unknown,
): CommunityBanRatificationRefusal | null {
  if (!(error instanceof ApiError)) return null;
  if (error.status === 403) return "ownProposal";
  if (error.status === 409) return "alreadyDecided";
  if (error.status === 404) return "gone";
  return null;
}

/**
 * True when a `makePermanent` PATCH was refused because this community has
 * nobody else who could sign it (a solo owner, the case the whole control
 * exists for). The bar stands at the fallback term and the proposer has to be
 * told so rather than shown a generic failure.
 *
 * The backend answers 400 with prose and no machine code, so the status alone
 * is not enough: a rule index outside the community's current rules is also a
 * 400 on the same route. The caller therefore passes whether it asked for a
 * permanent bar at all, and the server's sentence is matched as a second,
 * narrowing check. A miss falls through to the generic error, never the other
 * way round.
 */
export function isNoSecondSignatoryError(
  error: unknown,
  wasPermanentRequested: boolean,
): boolean {
  if (!wasPermanentRequested) return false;
  if (!(error instanceof ApiError) || error.status !== 400) return false;
  return /second signature/i.test(error.message);
}
