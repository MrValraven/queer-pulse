import { apiGet } from "../../../shared/api/client";
import type { RosterRole } from "./communities.api";
import type { CommunityNotificationLevel } from "./communityPreferences.api";

/** A post's kind, mirroring the backend `PostKind` enum. */
export type CommunityDigestPostKind = "post" | "announcement";

/**
 * A representative post from one community's digest window.
 *
 * The body arrives already truncated (160 characters) and carries NO author
 * identity: the backend omits it deliberately, so the digest stays a summary of
 * the community rather than a report on who has been talking. Any surface
 * rendering an excerpt therefore shows the community it came from, never a
 * person. Posts from a blocked or muted author are filtered out server-side.
 */
export interface CommunityDigestExcerptDTO {
  postId: string;
  kind: CommunityDigestPostKind;
  excerpt: string;
  createdAt: string;
}

/** One community's last seven days, from the viewer's own point of view. */
export interface CommunityDigestEntryDTO {
  slug: string;
  name: string;
  avatarImageUrl: string | null;
  /** The viewer's own role on this roster. */
  myRole: RosterRole;
  /** The viewer's own notification level for this community. */
  notificationLevel: CommunityNotificationLevel;
  newPostCount: number;
  newMemberCount: number;
  /** How many published gatherings are still ahead. A COUNT, with no titles or
   *  dates: the endpoint carries no gathering detail. */
  upcomingGatheringCount: number;
  /**
   * People waiting to be let in: join requests still `pending`.
   *
   * MODERATION STATE. The server computes it only where `myRole` is a staff
   * role and sends a flat `0` otherwise, so a plain member's digest never
   * carries it. Read it through `isCommunityStaff(entry.myRole)` all the same:
   * a zero that means "not yours to see" and a zero that means "nobody is
   * waiting" are the same number on the wire.
   */
  pendingJoinRequestCount: number;
  /** Reports still open in this community's own moderation queue, counted the
   *  way that queue counts them. Same viewer gate as the field above. */
  openReportCount: number;
  excerpts: CommunityDigestExcerptDTO[];
}

/**
 * `GET /me/communities/digest` — the caller's own week across every community
 * they belong to, in ONE request regardless of how many that is (the service
 * fans out over a fixed six queries, see `CommunityDigestService`).
 *
 * Two exclusions make this a poor substitute for the membership map: a
 * community the viewer has MUTED is absent (a mute is a request to stop hearing
 * from a room), and so is an archived one. Read `GET /me/communities` for "which
 * communities am I in", and this for "what happened in them".
 */
export interface CommunityDigestDTO {
  /** ISO timestamp: the start of the window every count above is measured from. */
  since: string;
  communities: CommunityDigestEntryDTO[];
}

/** The envelope is always an object, never null (an empty week answers with an
 *  empty `communities` array), so this is a plain `apiGet`. */
export const getMyCommunityDigest = () =>
  apiGet<CommunityDigestDTO>("/me/communities/digest");
