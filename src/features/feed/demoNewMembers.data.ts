import { MEMBERS, memberName } from "../members/data/members";
import type { FeedItem, FeedReason } from "./api/feed.api";
import { DEMO_COMMUNITY, DEMO_MEMBER } from "./feedCards.data";

/**
 * Demo `new_member` feed items, shaped exactly like the ones the live backend
 * sends (`newMemberToFeedItem` in the backend's `feed/feed-response.ts`), so
 * the demo feed renders new members through the same `MemberCard` and group
 * card code path as live. Every slug is a real `MEMBERS` record.
 *
 * Six people, one per state the cards can show:
 *  - `kai`: the demo's headline member (DEMO_MEMBER copy), in a community the
 *    viewer shares, with one shared interest.
 *  - `catarina-vaz`: already connected to the demo viewer (`SEED_CONNECTED`
 *    in `features/connect/connectionSeeds.data.ts`), with an empty profile, so
 *    the card offers "Message" and the connected empty prompt.
 *  - `bilal-kaya`: a long bio with a line break (exercises "Read more"), six
 *    interests (more than fit on one row) with two shared, and four mutual
 *    connections.
 *  - `beatriz`: a demo Ambassador (`DEMO_AMBASSADORS`), so the card shows her
 *    tag, reached through a followed topic with one mutual connection.
 *  - `daniel-oliveira`: no photo and an empty profile.
 *  - `jordan`: a bio, a neighbourhood and three interests, one of them shared,
 *    so the context line reads "You both like".
 *
 * Neighbourhoods follow the backend's gate: only an open profile shares one.
 * Every `sharedInterests` entry is one of the member's own `interests`, in
 * their order, as the backend sends it.
 */

const HOUR_MS = 60 * 60 * 1000;

/** Join times count back from when this module loaded, so the relative labels
 *  ("2h", "3d") stay true whenever the demo runs. */
const MODULE_LOADED_AT_MS = Date.now();

interface DemoNewMemberSeed {
  slug: string;
  /** Most demo members carry no pronouns, so the seed supplies them. */
  pronouns: string | null;
  summary: string;
  neighbourhood: string | null;
  interests: string[];
  /** The member's interests the demo viewer also lists, in the member's order. */
  sharedInterests: string[];
  hasPhoto: boolean;
  reason: FeedReason;
  reasonSubject: string | null;
  mutualConnectionCount: number;
  joinedHoursAgo: number;
}

function bioOf(slug: string): string {
  return MEMBERS[slug]?.bio ?? "";
}

function tagsOf(slug: string, count: number): string[] {
  return (MEMBERS[slug]?.tags ?? []).slice(0, count);
}

/** Bilal's profile bio split into two paragraphs, long enough to clamp, so the
 *  demo card shows "Read more" and a preserved line break. */
const BILAL_SUMMARY =
  "I'm Turkish-Portuguese and I make sound for film and theatre, and I tune club rigs so they hit your chest without shredding your ears.\n" +
  "I grew up between Istanbul and Almada, so my ear is full of ferries, call to prayer and bad PA systems. New here, but I've already found the best spot in Marvila to record at 4am.";

const DEMO_NEW_MEMBER_SEEDS: DemoNewMemberSeed[] = [
  {
    slug: DEMO_MEMBER.slug,
    pronouns: DEMO_MEMBER.pronouns,
    summary: DEMO_MEMBER.quote,
    neighbourhood: DEMO_MEMBER.hood,
    interests: DEMO_MEMBER.tags,
    sharedInterests: ["Nightlife"],
    hasPhoto: true,
    reason: "membership",
    reasonSubject: DEMO_COMMUNITY.name,
    mutualConnectionCount: 0,
    joinedHoursAgo: 2,
  },
  {
    slug: "catarina-vaz",
    pronouns: "she/her",
    summary: "",
    neighbourhood: null,
    interests: [],
    sharedInterests: [],
    hasPhoto: true,
    reason: "connection",
    reasonSubject: memberName("catarina-vaz"),
    mutualConnectionCount: 2,
    joinedHoursAgo: 72,
  },
  {
    slug: "bilal-kaya",
    pronouns: "he/him",
    summary: BILAL_SUMMARY,
    neighbourhood: MEMBERS["bilal-kaya"]?.hood ?? null,
    interests: [...tagsOf("bilal-kaya", 4), "Modular synths", "Night walks"],
    sharedInterests: ["Film & theatre", "Field recording"],
    hasPhoto: true,
    reason: "recent",
    reasonSubject: null,
    mutualConnectionCount: 4,
    joinedHoursAgo: 21,
  },
  {
    slug: "beatriz",
    pronouns: null,
    summary: bioOf("beatriz"),
    neighbourhood: MEMBERS.beatriz?.hood ?? null,
    interests: tagsOf("beatriz", 3),
    sharedInterests: [],
    hasPhoto: true,
    reason: "topic",
    reasonSubject: "Ceramics",
    mutualConnectionCount: 1,
    joinedHoursAgo: 24,
  },
  {
    slug: "daniel-oliveira",
    pronouns: null,
    summary: "",
    neighbourhood: null,
    interests: [],
    sharedInterests: [],
    hasPhoto: false,
    reason: "recent",
    reasonSubject: null,
    mutualConnectionCount: 0,
    joinedHoursAgo: 120,
  },
  {
    slug: "jordan",
    pronouns: "they/them",
    summary: bioOf("jordan"),
    neighbourhood: MEMBERS.jordan?.hood ?? null,
    interests: tagsOf("jordan", 3),
    sharedInterests: ["Mutual aid"],
    hasPhoto: true,
    reason: "recent",
    reasonSubject: null,
    mutualConnectionCount: 0,
    joinedHoursAgo: 96,
  },
];

function seedToFeedItem(seed: DemoNewMemberSeed): FeedItem {
  const displayName = memberName(seed.slug);
  return {
    id: `demo-new-member-${seed.slug}`,
    type: "new_member",
    createdAt: new Date(
      MODULE_LOADED_AT_MS - seed.joinedHoursAgo * HOUR_MS,
    ).toISOString(),
    title: displayName,
    summary: seed.summary,
    link: `/profile/${seed.slug}`,
    actor: {
      handle: seed.slug,
      displayName,
      pronouns: seed.pronouns,
      avatarUrl: seed.hasPhoto ? (MEMBERS[seed.slug]?.photo ?? null) : null,
    },
    neighbourhood: seed.neighbourhood,
    interests: seed.interests,
    reason: seed.reason,
    reasonSubject: seed.reasonSubject,
    mutualConnectionCount: seed.mutualConnectionCount,
    sharedInterests: seed.sharedInterests,
  };
}

/** The demo feed's new members, in feed order (Kai first). Only slugs that
 *  exist in `MEMBERS` make it in. */
export const DEMO_NEW_MEMBER_ITEMS: FeedItem[] = DEMO_NEW_MEMBER_SEEDS.filter(
  (seed) => MEMBERS[seed.slug] !== undefined,
).map(seedToFeedItem);
