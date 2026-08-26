import { apiDelete, apiGet, apiPatch } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

/**
 * One entry on a community's ban list (`GET /communities/:slug/bans`, owner,
 * co-owner or moderator only).
 *
 * `member` is null when the barred account has since been erased, and
 * `bannedBy` is null when the moderator who applied the ban has: the ban
 * outlives whoever placed it, and the row still stands.
 */
export interface CommunityBanDTO {
  id: string;
  member: MemberRefDTO | null;
  bannedBy: MemberRefDTO | null;
  reason: string | null;
  /** ISO instant the bar lifts by itself, or null for a permanent ban. */
  expiresAt: string | null;
  /** Server-computed: the end date has passed and the bar no longer holds. */
  isExpired: boolean;
  rule: CommunityBanRuleCitationDTO | null;
  createdAt: string;
}

/**
 * The house rule a ban rests on, snapshotted when the moderator acted.
 *
 * A community's `rules` is a plain array and its `rulesVersion` moves whenever
 * an owner edits it, so the index alone would drift. `version` and `text` are
 * the snapshot that keeps the citation readable after a rewrite, and `isStale`
 * says the rules have changed since.
 */
export interface CommunityBanRuleCitationDTO {
  index: number;
  version: number;
  text: string;
  isStale: boolean;
}

/** One of the community's current house rules, for the citation picker. */
export interface CommunityRuleOptionDTO {
  index: number;
  text: string;
}

/** The whole ban list for one community, newest ban first. */
export interface CommunityBanListDTO {
  bans: CommunityBanDTO[];
  total: number;
  rules: CommunityRuleOptionDTO[];
  rulesVersion: number;
}

/**
 * Body of `PATCH /communities/:slug/bans/:memberSlug`. Every field is
 * optional and only the ones sent are written, so revising the end date never
 * overwrites another moderator's edit to the reason.
 *
 * `banDays` and `makePermanent` contradict each other, as do `ruleIndex` and
 * `clearRule`; the server refuses a request carrying both of a pair.
 */
export interface UpdateCommunityBanInput {
  banDays?: number;
  makePermanent?: boolean;
  reason?: string;
  ruleIndex?: number;
  clearRule?: boolean;
}

export const getCommunityBans = (slug: string) =>
  apiGet<CommunityBanListDTO>(`/communities/${slug}/bans`);

/**
 * `DELETE /communities/:slug/bans/:memberSlug` — lift a ban. Reopens the door
 * to this community. The member is not added back to the roster by this call:
 * they rejoin like anyone else.
 */
export const liftCommunityBan = (slug: string, memberSlug: string) =>
  apiDelete<{ ok: true }>(`/communities/${slug}/bans/${memberSlug}`);

/**
 * `PATCH /communities/:slug/bans/:memberSlug` — revise a ban in place: put an
 * end date on it, make it permanent again, rewrite the reason, or cite the
 * house rule it rests on. The barred member is notified of the new terms.
 */
export const updateCommunityBan = (
  slug: string,
  memberSlug: string,
  input: UpdateCommunityBanInput,
) =>
  apiPatch<CommunityBanDTO>(`/communities/${slug}/bans/${memberSlug}`, input);
