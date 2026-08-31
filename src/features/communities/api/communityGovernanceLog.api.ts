import { apiGet } from "../../../shared/api/client";
import type { MemberRefDTO, Paginated } from "../../../shared/api/refs";

/**
 * This community's own governance audit trail
 * (`GET /communities/:slug/governance-log`, owner / co-owner / moderator only).
 *
 * The community-scoped twin of `adminCommunityGovernanceLog.api.ts`. Both read
 * the same `community_governance_log` table, and they are deliberately NOT the
 * same shape: the admin route hands a platform Moderator/Admin the raw
 * `metadata` jsonb, while this one is served the backend's hand-picked
 * allowlist (`CommunityGovernanceLogDetailsDTO` in
 * `queerpulse-backend/src/communities/community-governance-history-response.ts`).
 * Raw user ids, platform-only settings and internal moderation signals never
 * cross this boundary, and a platform action arrives with `actor: null`,
 * `details: {}` and `isPlatformAction: true`.
 *
 * Kept self-contained (no cross-import of the admin module's types) the same
 * way every other `communities/api/*.api.ts` is.
 */

/**
 * The backend's `GovernanceLogAction` enum, over the wire as its string values.
 * Order here is the order the action filter offers them in: roster actions
 * first, then ownership and lifecycle, then settings, then the membership-card
 * programme, then the platform's offers of support.
 *
 * Every value the backend can write belongs here. One that is missing has no
 * chip tone and no copy of its own, and falls back to a humanized version of
 * the raw key rather than printing `card_replaced` at a moderator.
 */
export const COMMUNITY_GOVERNANCE_LOG_ACTIONS = [
  "role_changed",
  "member_removed",
  "member_banned",
  // The second-signature ladder on a permanent bar (PRD-25). A bar proposed,
  // then whichever ending arrived: signed by a second owner or moderator,
  // refused by one, or nobody signed inside the window and the hold lapsed
  // with the bar left at its original end date.
  "member_ban_proposed",
  "member_ban_ratified",
  "member_ban_declined",
  "member_ban_hold_expired",
  "ban_lifted",
  "ownership_transferred",
  "owner_auto_promoted",
  "frozen",
  "unfrozen",
  "archived",
  "unarchived",
  "settings_changed",
  "card_program_enabled",
  "card_program_disabled",
  "card_suspended",
  "card_revoked",
  "card_reinstated",
  "card_replaced",
  "support_offered",
  "support_offer_answered",
] as const;

export type CommunityGovernanceLogAction =
  (typeof COMMUNITY_GOVERNANCE_LOG_ACTIONS)[number];

/** Whether a raw wire value is one of the actions this client knows about. */
export function isCommunityGovernanceLogAction(
  value: string,
): value is CommunityGovernanceLogAction {
  return (COMMUNITY_GOVERNANCE_LOG_ACTIONS as readonly string[]).includes(
    value,
  );
}

/** One changed setting on a `settings_changed` entry, in the order the server
 *  wrote it. */
export interface CommunityGovernanceSettingChangeDTO {
  field: string;
  from: unknown;
  to: unknown;
}

/**
 * The per-action detail this community's own staff may read. An allowlist on
 * the server, so every field here is one somebody deliberately opened up:
 * a new server-written metadata key stays platform-staff-only until it is
 * added there.
 */
export interface CommunityGovernanceLogDetailsDTO {
  /** `role_changed`: the roster role held before, and the one held now. */
  fromRole?: string;
  toRole?: string;
  /** `member_removed`: the member left of their own accord. */
  isSelfRemoval?: boolean;
  /** `member_banned` / `ban_lifted`: the moderator's ban note.
   *  `frozen`: which trigger froze the community.
   *  `owner_auto_promoted`: why the promotion happened. */
  reason?: string;
  /** `frozen`: the short public line a moderator wrote about a manual pause. */
  note?: string;
  /** `ban_lifted`: when the lifted ban was originally placed, ISO 8601. */
  bannedAt?: string;
  /** The card actions: which card was suspended, revoked, reinstated or
   *  reissued. */
  cardSerial?: string;
  /** `settings_changed`: the field-by-field diff. */
  changedSettings?: CommunityGovernanceSettingChangeDTO[];
}

export interface CommunityGovernanceLogEntryDTO {
  id: string;
  /**
   * Typed as a plain string rather than the union above on purpose: the
   * backend enum grows, and a value this client has not learned yet must still
   * render as a readable row instead of narrowing to `never` at a lookup.
   */
  action: string;
  /** Null for a system-driven action, once the actor's account no longer
   *  resolves, or whenever `isPlatformAction` is true. */
  actor: MemberRefDTO | null;
  /** Null for actions with no single target (freeze, archive), or once the
   *  target's account no longer resolves. */
  target: MemberRefDTO | null;
  /**
   * Platform staff took this action over the community's own owner and
   * moderators. Such an entry carries no actor and no details by design, and
   * must be labelled as a platform action rather than shown as though one of
   * the community's moderators did it.
   */
  isPlatformAction: boolean;
  details: CommunityGovernanceLogDetailsDTO;
  createdAt: string;
}

/** The `Paginated<CommunityGovernanceLogEntryDTO>` envelope, newest first. */
export type CommunityGovernanceLogPageDTO =
  Paginated<CommunityGovernanceLogEntryDTO>;

export interface CommunityGovernanceLogParams {
  /** 1-based. Left out of the query string on the first page, which the
   *  backend normalizes to 1 anyway. */
  page?: number;
  action?: CommunityGovernanceLogAction;
}

/**
 * One page of this community's governance trail, newest first.
 *
 * Owner, co-owner and moderator only: anyone else gets a 403, and an unknown
 * or archived slug a 404. Both are failures the caller must surface as
 * failures, never as an empty trail.
 */
export const getCommunityGovernanceLog = (
  slug: string,
  params: CommunityGovernanceLogParams,
) => {
  const search = new URLSearchParams();
  if (params.page && params.page > 1) search.set("page", String(params.page));
  if (params.action) search.set("action", params.action);
  const queryString = search.toString();
  return apiGet<CommunityGovernanceLogPageDTO>(
    `/communities/${slug}/governance-log${queryString ? `?${queryString}` : ""}`,
  );
};
