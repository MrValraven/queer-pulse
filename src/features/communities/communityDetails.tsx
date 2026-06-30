import { type ReactNode } from "react";
import { COMMUNITY_DETAILS, POOL } from "./communityDetails.data";

export type Tint = "coral" | "jade" | "plum";

export interface Person {
  initials: string;
  name: string;
  tint: Tint;
  role?: string;
  /** Registry slug — when set, the avatar shows the member's photo and links to
   *  their profile (`/profile/<slug>`). */
  slug?: string;
}
export interface Reply {
  initials: string;
  name: string;
  tint: Tint;
  text: string;
}
export interface Thread {
  votes: number;
  title: string;
  author: Person;
  time: string;
  replyCount: number;
  post: string;
  replies: Reply[];
}
export interface CommunityDetail {
  badge: string;
  founded: string;
  cadence: string;
  about: ReactNode[];
  whoFor: string[];
  tags: string[];
  organiser: Person & { bio: string };
  nextEvent: { dd: string; mm: string; title: string; meta: string; spots: string };
  topicThread: Thread;
}

export { COMMUNITY_DETAILS };

export function membersFor(seed: number, n = 8): Person[] {
  const out: Person[] = [];
  for (let i = 0; i < n; i++) out.push(POOL[(seed * 3 + i) % POOL.length]!);
  return out;
}

export function getCommunityDetail(slug: string | undefined): CommunityDetail | undefined {
  return slug ? COMMUNITY_DETAILS[slug] : undefined;
}
