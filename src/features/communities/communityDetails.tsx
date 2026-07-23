import { type ReactNode } from "react";
import { COMMUNITY_DETAILS } from "./communityDetails.data";

export type Tint = "coral" | "jade" | "plum";

export interface Person {
  initials: string;
  name: string;
  tint: Tint;
  role?: string;
  /** Registry slug — when set, the avatar shows the member's photo and links to
   *  their profile (`/profile/<slug>`). */
  slug?: string;
  /** The member's own avatar photo, carried straight from the auth profile /
   *  API `MemberRef`. Preferred over the static registry lookup so real users
   *  (owner + members) show their actual picture, not just initials. */
  avatarUrl?: string | null;
}
export interface Reply {
  initials: string;
  name: string;
  tint: Tint;
  text: string;
  /** Backend reply id (present for live-wired threads; absent in static demo). */
  id?: string;
  /** ISO timestamp of the last edit, when the reply has been edited. */
  editedAt?: string | null;
  /** True when the reply is a soft-tombstone ("[deleted]"). */
  deleted?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
  canViewHistory?: boolean;
}
export interface Thread {
  votes: number;
  title: string;
  author: Person;
  time: string;
  replyCount: number;
  post: string;
  replies: Reply[];
  /** Backend post id (present for live-wired threads; absent in static demo). */
  id?: string;
  /** ISO creation timestamp, for the Newest sort. */
  createdAt?: string;
  /** Whether the viewer has Heart-reacted (seeds the upvote toggle). */
  voted?: boolean;
  /** Pinned by a mod (drives the Pinned filter chip). */
  pinned?: boolean;
  /** ISO timestamp of the last edit, when the OP post has been edited. */
  editedAt?: string | null;
  /** True when the OP post is a soft-tombstone ("[deleted]"). */
  deleted?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
  canViewHistory?: boolean;
}
export interface CommunityDetail {
  badge: string;
  founded: string;
  cadence: string;
  about: ReactNode[];
  whoFor: string[];
  tags: string[];
  organiser: Person & { bio: string };
  nextEvent: {
    dd: string;
    mm: string;
    title: string;
    meta: string;
    spots: string;
    /** No gathering is actually scheduled yet — the card shows placeholder copy
     *  and the sidebar hides its RSVP action. Real gatherings leave this unset. */
    tba?: boolean;
    /** Slug of the real gathering this card mirrors, when there is one — the
     *  RSVP button links to `gatheringPath(slug)` (the specific gathering) rather
     *  than the generic gatherings landing. Absent for TBA/placeholder events. */
    slug?: string;
  };
  topicThread: Thread;
}

export { COMMUNITY_DETAILS };

export function getCommunityDetail(
  slug: string | undefined,
): CommunityDetail | undefined {
  return slug ? COMMUNITY_DETAILS[slug] : undefined;
}
