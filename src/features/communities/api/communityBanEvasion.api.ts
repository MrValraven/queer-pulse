import { apiGet, apiPost } from "../../../shared/api/client";

/**
 * The community-facing half of the ban-evasion signal store (PRD-31).
 *
 * THE PRINCIPLE, copied from the backend's own doc comments so it cannot drift:
 * the community moderator recognises, platform staff investigates.
 *
 * Everything here is served by
 * `queerpulse-backend/src/ban-evasion/community-ban-evasion.controller.ts`, and
 * all three routes are owner, co-owner or moderator OF THIS COMMUNITY. A
 * platform staff role grants nothing: a platform moderator with no roster row
 * here reads the same case on `/admin/ban-evasion`, in full. Anyone below that
 * tier gets a 403, and an unknown or archived slug a 404. Both are failures the
 * caller must render AS failures. See `useCommunityBanEvasion.ts` for why that
 * matters more here than almost anywhere else in the app.
 *
 * Deliberately NOT importing anything from `src/features/admin/api` : the staff
 * console reads a far wider assessment (tier, score, every matched signal,
 * across every community), and keeping the two clients apart is what stops that
 * width from arriving here by an innocent-looking import.
 */

/**
 * One join request, one bit.
 *
 * This is the whole of what a community's owner, co-owners and moderators are
 * told about an applicant's ban history. There is no tier, no score, no count
 * of matched signals, no hash, no identifier, no name or slug of a prior
 * account, and no date. They cannot tell WHICH of their own bans matched, only
 * that one did.
 *
 * AND IT IS THIS COMMUNITY ONLY. A match against another community's ban, or
 * against a platform-level ban, answers `false` here. That is the point: a
 * moderator recognises people they themselves barred, which is knowledge they
 * already have. Somebody else's ban is not theirs to be told about.
 * `escalateCommunityBanEvasion` exists so a moderator who suspects more can ASK
 * for the cross-community judgement rather than be handed it.
 *
 * DO NOT WIDEN THIS, and do not let the UI describe it as more than it is. It
 * is a prompt to look, never a verdict.
 */
export interface CommunityBanEvasionFlagDTO {
  joinRequestId: string;
  /** True when this applicant correlates with an account THIS community
   *  banned. False for every other answer, "matched, but only elsewhere on the
   *  platform" included. */
  isMatchingBannedMember: boolean;
}

/** Where an escalation stands. `resolved` means somebody looked, and nothing
 *  more: what staff found never crosses this boundary. */
export type CommunityBanEvasionEscalationStatus = "open" | "resolved";

/**
 * One escalation as this community's own moderators read it.
 *
 * SAME BOUNDARY AS THE FLAG ABOVE: no assessment, no resolution note, no
 * resolver, no resolution date. A moderator learns that they asked, and whether
 * the question has been closed. Handing back what staff found would deliver
 * through the back door the exact picture the one-bit flag exists to withhold.
 */
export interface CommunityBanEvasionEscalationDTO {
  id: string;
  joinRequestId: string;
  status: CommunityBanEvasionEscalationStatus;
  /** ISO 8601, when the escalation was raised. */
  createdAt: string;
  /** The note that was stored. This can differ from the note just typed: the
   *  POST is idempotent while an escalation is open and returns the EXISTING
   *  row with the FIRST note. */
  note: string | null;
}

/**
 * How many join requests one flag call may cover. Mirrors the backend's
 * `BAN_EVASION_MAX_SUBJECTS` (`src/ban-evasion/dto/assess-join-requests.query.ts`),
 * which rejects an oversized list with a 400. The hook chunks by this rather
 * than trusting a queue page to stay under it.
 */
export const COMMUNITY_BAN_EVASION_MAX_IDS = 60;

/** How long a moderator's note to staff may be. Mirrors the backend's
 *  `EscalateBanEvasionDto` `@MaxLength(2000)`, which is what enforces it. */
export const MAX_BAN_EVASION_ESCALATION_NOTE_LENGTH = 2000;

/**
 * `GET /communities/:slug/join-requests/ban-evasion?ids=a,b,c`
 *
 * Batched on purpose: a per-row fetch would be an N+1 on a triage screen.
 *
 * The response carries one entry per id that resolved to one of THIS
 * community's join requests. An id from another queue is SILENTLY ABSENT, so
 * callers must key by `joinRequestId` and read a missing entry as "no answer"
 * rather than as `false`.
 */
export const getCommunityBanEvasionFlags = (
  slug: string,
  joinRequestIds: string[],
  signal?: AbortSignal,
) =>
  apiGet<CommunityBanEvasionFlagDTO[]>(
    `/communities/${slug}/join-requests/ban-evasion?ids=${encodeURIComponent(
      joinRequestIds.join(","),
    )}`,
    undefined,
    undefined,
    signal,
  );

/**
 * `GET /communities/:slug/join-requests/escalations`
 *
 * `status` is deliberately left off: the triage screen wants BOTH lanes in one
 * pass. An open escalation suppresses the escalate button on that row, and a
 * resolved one restores it, because staff have closed that case. Without the
 * resolved rows, pressing escalate on a closed case would silently open a
 * second one with nothing on screen explaining why.
 *
 * Newest first.
 */
export const getCommunityBanEvasionEscalations = (
  slug: string,
  signal?: AbortSignal,
) =>
  apiGet<CommunityBanEvasionEscalationDTO[]>(
    `/communities/${slug}/join-requests/escalations`,
    undefined,
    undefined,
    signal,
  );

/**
 * `POST /communities/:slug/join-requests/:id/escalate-ban-evasion`
 *
 * Hands the case to platform staff, who can see every community and the
 * platform ban list. Throttled 20 per 60 seconds. The note is optional: "please
 * check this one" is a complete request, and requiring a paragraph would push
 * moderators towards declining somebody instead of asking.
 *
 * IDEMPOTENT WHILE OPEN. A second press returns the EXISTING row carrying the
 * FIRST note, so no caller may assume the note it just sent was the one stored.
 * Compare `note` on the response against what was typed, and say plainly that
 * the earlier note won.
 */
export const escalateCommunityBanEvasion = (
  slug: string,
  joinRequestId: string,
  note?: string,
) =>
  apiPost<CommunityBanEvasionEscalationDTO>(
    `/communities/${slug}/join-requests/${joinRequestId}/escalate-ban-evasion`,
    note ? { note } : {},
  );
