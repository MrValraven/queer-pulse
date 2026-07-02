import { useCommunityMembership } from "../../app/providers/CommunityMembershipProvider";
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

/** Derives every list the communities home renders from your memberships. */
export function useCommunitiesHomeData() {
  const { memberships } = useCommunityMembership();
  const communities = useAllCommunities();

  const mine = Object.keys(memberships).map((slug) => ({
    slug,
    role: memberships[slug]!.role,
    living: getLiving(slug),
    community: communities.find((c) => c.slug === slug),
  }));

  const pulse = interleave(
    mine
      .filter((m) => m.living)
      .map((m) =>
        [...m.living!.pinned, ...m.living!.pulse].slice(0, 4).map((post) => ({
          post,
          communityName: m.community?.name ?? m.slug,
          communitySlug: m.slug,
        })),
      ),
  ).slice(0, 8);

  const todos = mine
    .filter((m) => (m.role === "owner" || m.role === "mod") && m.living)
    .map((m) => ({
      slug: m.slug,
      name: m.community?.name ?? m.slug,
      requests: m.living!.joinRequests?.length ?? 0,
      reports: m.living!.reports?.length ?? 0,
    }))
    .filter((t) => t.requests + t.reports > 0);

  const myCommunities: MyCommunity[] = mine.map((m) => ({
    slug: m.slug,
    name: m.community?.name ?? m.slug,
    count: m.community?.count ?? "",
    role: m.role,
  }));

  const upcoming: UpcomingItem[] = mine
    .filter((m) => m.living)
    .flatMap((m) =>
      m
        .living!.events.filter((e) => !e.past)
        .map((event) => ({
          event,
          name: m.community?.name ?? m.slug,
          slug: m.slug,
        })),
    )
    .slice(0, 4);

  const suggestions = communities
    .filter((c) => c.slug && !memberships[c.slug] && !c.privateBadge)
    .slice(0, 4);

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
