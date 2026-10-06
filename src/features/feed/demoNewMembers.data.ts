import { MEMBERS, memberName } from "../members/data/members";
import type { FeedItem, FeedReason } from "./api/feed.api";
import { DEMO_COMMUNITY, DEMO_MEMBER } from "./feedCards.data";

/**
 * Demo `new_member` feed items, shaped exactly like the ones the live backend
 * sends (`newMemberToFeedItem` in the backend's `feed/feed-response.ts`), so
 * the demo feed renders new members through the same `MemberCard` and group
 * card code path as live. Every slug is a real `MEMBERS` record.
 *
 * Eleven people in two sets. The All tab folds new members into one group
 * card per calendar week (`groupNewMembers.ts`), so the sets are timed to land
 * in different weeks.
 *
 * Six joined in the last five days (`joinedHoursAgo`), one per state the cards
 * can show. Depending on the weekday the demo runs on, they fill this week's
 * group, last week's, or both:
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
 * Five more joined in the week two weeks before the current one
 * (`joinedTwoWeeksBack`), anchored to that week's Monday so they stay in it
 * whatever weekday the demo runs on. Five is more than the group card shows
 * collapsed, so that older group always offers its "Show all" toggle:
 *  - `rui-fernandes`: a long bio, a neighbourhood and four interests, in a
 *    community the viewer shares, so the line reads "Also in" even though he
 *    also shares an interest.
 *  - `monica`: a private profile, so a bio and interests with no
 *    neighbourhood, reached through a followed topic.
 *  - `tomas-mendes`: a network-only profile with no bio, so the card shows
 *    interests alone, and three mutual connections.
 *  - `andre`: no photo, but a bio, a neighbourhood and two interests, with no
 *    shared ground at all, so the line falls back to "New to QueerPulse".
 *  - `sofia-rodrigues`: five interests with two shared and one mutual
 *    connection, which outranks the shared interests on the context line.
 *
 * Neighbourhoods follow the backend's gate: only an open profile shares one.
 * Every `sharedInterests` entry is one of the member's own `interests`, in
 * their order, as the backend sends it.
 */

const HOUR_MS = 60 * 60 * 1000;

/** Join times count back from when this module loaded, so the relative labels
 *  ("2h", "3d") stay true whenever the demo runs. */
const MODULE_LOADED_AT_MS = Date.now();

/** How far before the current week's Monday the older set's week starts. */
const TWO_WEEKS_IN_DAYS = 14;

interface DemoNewMemberProfileSeed {
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
}

/** When the person joined: a number of hours before the module loaded, or a
 *  local day and hour inside the week two weeks before the current one
 *  (`daysAfterMonday` 0 is that week's Monday, 6 its Sunday). */
type DemoNewMemberJoinTime =
  | { joinedHoursAgo: number }
  | { joinedTwoWeeksBack: { daysAfterMonday: number; hour: number } };

type DemoNewMemberSeed = DemoNewMemberProfileSeed & DemoNewMemberJoinTime;

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
  {
    slug: "rui-fernandes",
    pronouns: "he/him",
    summary: bioOf("rui-fernandes"),
    neighbourhood: MEMBERS["rui-fernandes"]?.hood ?? null,
    interests: tagsOf("rui-fernandes", 4),
    sharedInterests: ["Mutual aid"],
    hasPhoto: true,
    reason: "membership",
    reasonSubject: DEMO_COMMUNITY.name,
    mutualConnectionCount: 0,
    joinedTwoWeeksBack: { daysAfterMonday: 0, hour: 9 },
  },
  {
    slug: "monica",
    pronouns: "she/her",
    summary: bioOf("monica"),
    neighbourhood: null,
    interests: tagsOf("monica", 3),
    sharedInterests: [],
    hasPhoto: true,
    reason: "topic",
    reasonSubject: "Movement",
    mutualConnectionCount: 0,
    joinedTwoWeeksBack: { daysAfterMonday: 1, hour: 19 },
  },
  {
    slug: "tomas-mendes",
    pronouns: null,
    summary: "",
    neighbourhood: null,
    interests: tagsOf("tomas-mendes", 4),
    sharedInterests: [],
    hasPhoto: true,
    reason: "recent",
    reasonSubject: null,
    mutualConnectionCount: 3,
    joinedTwoWeeksBack: { daysAfterMonday: 3, hour: 8 },
  },
  {
    slug: "andre",
    pronouns: "he/him",
    summary: bioOf("andre"),
    neighbourhood: MEMBERS.andre?.hood ?? null,
    interests: tagsOf("andre", 2),
    sharedInterests: [],
    hasPhoto: false,
    reason: "recent",
    reasonSubject: null,
    mutualConnectionCount: 0,
    joinedTwoWeeksBack: { daysAfterMonday: 4, hour: 22 },
  },
  {
    slug: "sofia-rodrigues",
    pronouns: "she/they",
    summary: bioOf("sofia-rodrigues"),
    neighbourhood: MEMBERS["sofia-rodrigues"]?.hood ?? null,
    interests: tagsOf("sofia-rodrigues", 5),
    sharedInterests: ["Accessibility", "Design systems"],
    hasPhoto: true,
    reason: "recent",
    reasonSubject: null,
    mutualConnectionCount: 1,
    joinedTwoWeeksBack: { daysAfterMonday: 5, hour: 11 },
  },
];

/**
 * The seed's join time as ISO. A `joinedTwoWeeksBack` slot is placed with
 * local calendar math, the same way `weekStartKey` finds a week's Monday: the
 * current week's Monday (local time) minus two weeks, plus the slot's days,
 * at the slot's local hour. `new Date(year, month, day, hour)` rolls over
 * month and year ends and keeps the hour through a daylight saving change.
 */
function joinedAtIso(seed: DemoNewMemberSeed): string {
  if ("joinedHoursAgo" in seed) {
    return new Date(
      MODULE_LOADED_AT_MS - seed.joinedHoursAgo * HOUR_MS,
    ).toISOString();
  }
  const loadedAt = new Date(MODULE_LOADED_AT_MS);
  // getDay() is 0 on Sunday, so this maps Monday to 0 and Sunday to 6.
  const daysSinceMonday = (loadedAt.getDay() + 6) % 7;
  const { daysAfterMonday, hour } = seed.joinedTwoWeeksBack;
  return new Date(
    loadedAt.getFullYear(),
    loadedAt.getMonth(),
    loadedAt.getDate() - daysSinceMonday - TWO_WEEKS_IN_DAYS + daysAfterMonday,
    hour,
  ).toISOString();
}

function seedToFeedItem(seed: DemoNewMemberSeed): FeedItem {
  const displayName = memberName(seed.slug);
  return {
    id: `demo-new-member-${seed.slug}`,
    type: "new_member",
    createdAt: joinedAtIso(seed),
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
