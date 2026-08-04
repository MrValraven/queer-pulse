import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMyCommunities } from "./api/useMyCommunities";
import { useAllCommunities } from "./useAllCommunities";
import { getLiving } from "./livingCommunities.data";
import type { HubPost } from "./HubPulseCard";
import type { MyCommunity, UpcomingItem } from "./CommunitiesHomeSidebar";

/** Round-robin interleave so the feed alternates between your communities. */
function interleave(lists: HubPost[][]): HubPost[] {
  const out: HubPost[] = [];
  const max = lists.reduce((m, l) => Math.max(m, l.length), 0);
  for (let i = 0; i < max; i++)
    for (const l of lists) if (l[i]) out.push(l[i]!);
  return out;
}

/** Derives every list the communities home renders from your memberships.
 *
 * The cross-community activity feed (pulse / to-dos / upcoming / digest) and the
 * "suggested communities" rail are prototype-only — they read the `getLiving`
 * mock registry and the static directory, neither of which has a live backend.
 * So in live mode this hook resolves ONLY what real data can back: the
 * membership list itself (names + roles from `GET /me/communities`). Everything
 * mock-derived collapses to empty, and the page renders honest empty states
 * rather than fabricated activity. Demo mode is unchanged. */
export function useCommunitiesHomeData() {
  const { demoMode } = useDemoMode();
  const memberships = useMyCommunities();
  const communities = useAllCommunities();

  const mine = Object.keys(memberships).map((slug) => {
    const membership = memberships[slug]!;
    // Only consult the mock directory in demo mode — in live it would resolve a
    // real community against a fabricated name/count if the slugs happened to
    // collide.
    const community = demoMode
      ? communities.find((c) => c.slug === slug)
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

  const pulse = interleave(
    mine
      .filter((m) => m.living)
      .map((m) =>
        [...m.living!.pinned, ...m.living!.pulse].slice(0, 4).map((post) => ({
          post,
          communityName: m.name,
          communitySlug: m.slug,
        })),
      ),
  ).slice(0, 8);

  const todos = mine
    .filter((m) => (m.role === "owner" || m.role === "mod") && m.living)
    .map((m) => ({
      slug: m.slug,
      name: m.name,
      requests: m.living!.joinRequests?.length ?? 0,
      reports: m.living!.reports?.length ?? 0,
    }))
    .filter((t) => t.requests + t.reports > 0);

  const myCommunities: MyCommunity[] = mine.map((m) => ({
    slug: m.slug,
    name: m.name,
    count: m.count,
    role: m.role,
  }));

  const upcoming: UpcomingItem[] = mine
    .filter((m) => m.living)
    .flatMap((m) =>
      m
        .living!.events.filter((e) => !e.past)
        .map((event) => ({
          event,
          name: m.name,
          slug: m.slug,
        })),
    )
    .slice(0, 4);

  // Prototype-only rail — fabricated from the static directory, no live backend.
  const suggestions = demoMode
    ? communities
        .filter((c) => c.slug && !memberships[c.slug] && !c.privateBadge)
        .slice(0, 4)
    : [];

  const livingMine = mine.map((m) => m.living).filter(Boolean) as NonNullable<
    (typeof mine)[number]["living"]
  >[];
  const digest = {
    posts: livingMine.reduce((s, c) => s + c.stats.postsThisWeek, 0),
    active: livingMine.reduce((s, c) => s + c.stats.activeThisWeek, 0),
    events: upcoming.length,
    joined: livingMine.reduce(
      (s, c) => s + c.moments.filter((mo) => mo.kind === "joined").length,
      0,
    ),
  };

  return { pulse, todos, myCommunities, upcoming, suggestions, digest };
}

export type HomeTodo = ReturnType<
  typeof useCommunitiesHomeData
>["todos"][number];
