import { apiDelete, apiGet } from "../../../shared/api/client";
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
  createdAt: string;
}

/** The whole ban list for one community, newest ban first. */
export interface CommunityBanListDTO {
  bans: CommunityBanDTO[];
  total: number;
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
