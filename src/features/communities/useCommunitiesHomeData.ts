import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { Community } from "../homepage/data/types";
import {
  useMyCommunities,
  useMyCommunitiesResolving,
} from "./api/useMyCommunities";
import { useMyCommunityDigest } from "./api/useMyCommunityDigest";
import { isCommunityStaff } from "./communityStaff";
import { useSuggestedCommunities } from "./api/useSuggestedCommunities";
import { useAllCommunities } from "./useAllCommunities";
import { getLiving } from "./livingCommunities.data";
import type { HubDigest } from "./CommunitiesHomeDigest";
import type { HubExcerpt, HubPost } from "./HubPulseCard";
import type {
  MyCommunity,
  UpcomingCountItem,
  UpcomingItem,
} from "./CommunitiesHomeSidebar";

/** How many pulse cards the hub feed shows, in either mode. */
const PULSE_LIMIT = 8;
/** How many rows the sidebar's "upcoming" card shows, in either mode. */
const UPCOMING_LIMIT = 4;
/** How many rows the sidebar's "suggestions" card shows in demo mode. */
const SUGGESTIONS_LIMIT = 4;

/** One moderation to-do row: a community of yours with a queue waiting. */
export interface HomeTodo {
  slug: string;
  name: string;
  /** Join requests still pending on that roster. */
  requests: number;
  /** Reports still open in that community's own queue. */
  reports: number;
}

/** The mock-derived sections. Every list here is empty in live mode. */
export interface CommunitiesHomeDemoSections {
  pulse: HubPost[];
  todos: HomeTodo[];
  upcoming: UpcomingItem[];
  digest: HubDigest;
}

/** The sections `GET /me/communities/digest` backs. `null` in demo mode. */
export interface CommunitiesHomeLiveSections {
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  /** `null` while the digest is in flight and after it fails, so the band is
   *  absent rather than showing a week of zeroes that nobody measured. */
  digest: HubDigest | null;
  pulse: HubExcerpt[];
  upcoming: UpcomingCountItem[];
  /**
   * Moderation to-dos: one row per community the viewer STAFFS that has
   * something waiting in it. Empty for everybody else, and empty for a
   * moderator whose queues are clear.
   */
  todos: HomeTodo[];
  /**
   * Whether the viewer staffs any community at all, read from the membership
   * map rather than from the digest.
   *
   * It is what tells "there is nothing waiting on you" apart from "this block
   * is not yours", which the to-do list alone cannot: both are an empty array.
   * A member who moderates nothing gets no block, no skeleton and no error
   * panel, because they could never have had a to-do.
   */
  isModeratorSomewhere: boolean;
}

export interface CommunitiesHomeData {
  /** Whether the membership map itself is still resolving. */
  isLoading: boolean;
  myCommunities: MyCommunity[];
  suggestions: Community[];
  demo: CommunitiesHomeDemoSections;
  live: CommunitiesHomeLiveSections | null;
}

/** Round-robin interleave so the feed alternates between your communities. */
function interleave<Item>(lists: Item[][]): Item[] {
  const merged: Item[] = [];
  const longest = lists.reduce(
    (count, list) => Math.max(count, list.length),
    0,
  );
  for (let index = 0; index < longest; index++)
    for (const list of lists) if (list[index]) merged.push(list[index]!);
  return merged;
}

/**
 * Every list the communities home renders, in both modes.
 *
 * The two modes answer the same five sections from different places, and the
 * hook keeps them in separate branches so neither can leak into the other:
 *
 * - DEMO reads the `getLiving` mock registry and the static directory, exactly
 *   as it always has. `live` is `null` and nothing here touches the network.
 * - LIVE reads `GET /me/communities/digest` in ONE request (its counts and post
 *   excerpts back the digest band, the pulse feed and the upcoming card) plus
 *   `GET /communities/suggested` for the suggestions rail. `demo` collapses to
 *   empty, and no mock is consulted for any of it.
 *
 * The moderation to-do list rides on that same digest request: the entry
 * carries `pendingJoinRequestCount` and `openReportCount`, computed server-side
 * only for the communities you staff (PRD-144). Reading the two queues from
 * here instead would be one request per community, which is the fan-out the
 * digest exists to replace.
 *
 * The digest is NOT a membership list: it omits muted and archived
 * communities. `GET /me/communities` stays the source for "which communities
 * am I in", which is why both are read.
 */
export function useCommunitiesHomeData(): CommunitiesHomeData {
  const { demoMode } = useDemoMode();
  const memberships = useMyCommunities();
  // Same react-query key as the map above, so this is a read of the in-flight
  // state and never a second request. The home body needs it to tell "you
  // belong to nothing" apart from "we don't know yet": without it a live
  // member is shown the "you haven't joined any communities yet" empty state
  // for the length of the `GET /me/communities` round trip.
  const isLoading = useMyCommunitiesResolving();
  const communities = useAllCommunities();
  const digest = useMyCommunityDigest();
  // Resolves locally in demo mode (no network), so mounting it in both modes
  // is free. Its result is only USED in live mode: demo keeps deriving its own
  // suggestions from the static directory below, unchanged.
  const suggested = useSuggestedCommunities();

  const mine = Object.keys(memberships).map((slug) => {
    const membership = memberships[slug]!;
    // Only consult the mock directory in demo mode — in live it would resolve a
    // real community against a fabricated name/count if the slugs happened to
    // collide.
    const community = demoMode
      ? communities.find((entry) => entry.slug === slug)
      : undefined;
    return {
      slug,
      role: membership.role,
      // Live: the real name from `/me/communities`; demo: the directory entry.
      name: membership.name ?? community?.name ?? slug,
      count: community?.count ?? "",
      living: demoMode ? getLiving(slug) : undefined,
      community,
    };
  });

  const myCommunities: MyCommunity[] = mine.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    count: entry.count,
    role: entry.role,
  }));

  // ── Demo sections ────────────────────────────────────────────────────────
  const demoPulse = interleave(
    mine
      .filter((entry) => entry.living)
      .map((entry) =>
        [...entry.living!.pinned, ...entry.living!.pulse]
          .slice(0, 4)
          .map((post) => ({
            post,
            communityName: entry.name,
            communitySlug: entry.slug,
          })),
      ),
  ).slice(0, PULSE_LIMIT);

  const demoTodos: HomeTodo[] = mine
    .filter(
      (entry) =>
        (entry.role === "owner" || entry.role === "mod") && entry.living,
    )
    .map((entry) => ({
      slug: entry.slug,
      name: entry.name,
      requests: entry.living!.joinRequests?.length ?? 0,
      reports: entry.living!.reports?.length ?? 0,
    }))
    .filter((todo) => todo.requests + todo.reports > 0);

  const demoUpcoming: UpcomingItem[] = mine
    .filter((entry) => entry.living)
    .flatMap((entry) =>
      entry
        .living!.events.filter((event) => !event.past)
        .map((event) => ({
          event,
          name: entry.name,
          slug: entry.slug,
        })),
    )
    .slice(0, UPCOMING_LIMIT);

  const livingMine = mine
    .map((entry) => entry.living)
    .filter(Boolean) as NonNullable<(typeof mine)[number]["living"]>[];
  const demoDigest: HubDigest = {
    posts: livingMine.reduce(
      (sum, entry) => sum + entry.stats.postsThisWeek,
      0,
    ),
    active: livingMine.reduce(
      (sum, entry) => sum + entry.stats.activeThisWeek,
      0,
    ),
    events: demoUpcoming.length,
    joined: livingMine.reduce(
      (sum, entry) =>
        sum + entry.moments.filter((moment) => moment.kind === "joined").length,
      0,
    ),
  };

  const demoSuggestions = demoMode
    ? communities
        .filter(
          (entry) =>
            entry.slug && !memberships[entry.slug] && !entry.privateBadge,
        )
        .slice(0, SUGGESTIONS_LIMIT)
    : [];

  if (demoMode) {
    return {
      isLoading,
      myCommunities,
      suggestions: demoSuggestions,
      demo: {
        pulse: demoPulse,
        todos: demoTodos,
        upcoming: demoUpcoming,
        digest: demoDigest,
      },
      live: null,
    };
  }

  // ── Live sections, all four off the single digest request ────────────────
  const livePulse: HubExcerpt[] = interleave(
    digest.communities.map((entry) =>
      entry.excerpts.map((excerpt) => ({
        postId: excerpt.postId,
        kind: excerpt.kind,
        excerpt: excerpt.excerpt,
        createdAt: excerpt.createdAt,
        communityName: entry.name,
        communitySlug: entry.slug,
      })),
    ),
  ).slice(0, PULSE_LIMIT);

  // The digest counts gatherings without naming them, so these rows say how
  // many are ahead in each community and link into it. A titled, dated list
  // would need a "gatherings across my communities" endpoint that does not
  // exist, and reading `GET /communities/:slug/pulse` per community is the
  // request-per-community fan-out the digest was built to replace.
  const liveUpcoming: UpcomingCountItem[] = digest.communities
    .filter((entry) => entry.upcomingGatheringCount > 0)
    .map((entry) => ({
      slug: entry.slug,
      name: entry.name,
      count: entry.upcomingGatheringCount,
    }))
    .slice(0, UPCOMING_LIMIT);

  // Moderation to-dos, off the same digest entry. Gated on the viewer's own
  // roster role a second time: the server sends 0 on every community the
  // viewer does not staff, and a `0` that means "not yours to see" is
  // indistinguishable on the wire from a `0` that means "nothing waiting", so
  // the row is built from the role rather than from the number. A community
  // with both queues clear drops out, because a to-do list of nothing to do is
  // not a to-do list.
  //
  // Known limit, inherited from the digest: a community the viewer has MUTED
  // is absent from the response entirely, so its queues do not appear here
  // even for its own moderator. Mod tools still badge both queues inside the
  // community itself, which is where a muted room's work stays visible.
  const liveTodos: HomeTodo[] = digest.communities
    .filter((entry) => isCommunityStaff(entry.myRole))
    .map((entry) => ({
      slug: entry.slug,
      name: entry.name,
      requests: entry.pendingJoinRequestCount,
      reports: entry.openReportCount,
    }))
    .filter((todo) => todo.requests + todo.reports > 0);

  // Read from the membership map, NOT from the digest: the digest is what may
  // have failed, and the block has to know whose it is before it can report a
  // failure at all. `GET /me/communities` also carries the communities the
  // digest drops (muted ones), which is right here: muting a room you moderate
  // silences its week, and it does not resign you from it.
  const isModeratorSomewhere = myCommunities.some((entry) =>
    isCommunityStaff(entry.role),
  );

  // An empty `communities` list is not a quiet week: the digest drops MUTED
  // and archived communities, so a member who muted all of theirs would
  // otherwise be shown a 0 / 0 / 0 week that was never measured. The band
  // needs at least one community actually counted before it can report on
  // one. A member whose counted communities all scored zero DOES see zeroes,
  // and that is true.
  const hasDigest =
    !digest.isLoading && !digest.isError && digest.communities.length > 0;
  const liveDigest: HubDigest | null = hasDigest
    ? {
        posts: digest.communities.reduce(
          (sum, entry) => sum + entry.newPostCount,
          0,
        ),
        // `active` is deliberately absent: the digest carries new posts, new
        // members and upcoming gatherings, and no active-member count. An
        // "active members" tile reading 0 would be a measurement nobody took.
        events: digest.communities.reduce(
          (sum, entry) => sum + entry.upcomingGatheringCount,
          0,
        ),
        joined: digest.communities.reduce(
          (sum, entry) => sum + entry.newMemberCount,
          0,
        ),
      }
    : null;

  return {
    isLoading,
    myCommunities,
    // `GET /communities/suggested` answers `[]` for a member with no
    // connections, which is the normal case rather than a failure: the rail
    // hides itself instead of carrying an empty state.
    suggestions: suggested.communities,
    demo: {
      pulse: [],
      todos: [],
      upcoming: [],
      digest: { posts: 0, events: 0, joined: 0 },
    },
    live: {
      isLoading: digest.isLoading,
      isError: digest.isError,
      refetch: digest.refetch,
      digest: liveDigest,
      pulse: livePulse,
      upcoming: liveUpcoming,
      todos: liveTodos,
      isModeratorSomewhere,
    },
  };
}
