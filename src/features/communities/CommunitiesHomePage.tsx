import { Link } from "react-router-dom";
import { FiShield, FiInbox, FiFlag, FiUsers } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import {
  Button,
  FadeIn,
  EmptyState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { currentUser } from "../members/data/members";
import { communities } from "../homepage/data/communities";
import { useCommunityMembership } from "../../app/providers/CommunityMembershipProvider";
import { getLiving } from "./livingCommunities.data";
import { HubPulseCard, type HubPost } from "./HubPulseCard";
import {
  CommunitiesHomeSidebar,
  type MyCommunity,
  type UpcomingItem,
} from "./CommunitiesHomeSidebar";
import styles from "./CommunitiesHomePage.module.css";

/** Round-robin interleave so the feed alternates between your communities. */
function interleave(lists: HubPost[][]): HubPost[] {
  const out: HubPost[] = [];
  const max = lists.reduce((m, l) => Math.max(m, l.length), 0);
  for (let i = 0; i < max; i++)
    for (const l of lists) if (l[i]) out.push(l[i]!);
  return out;
}

export function CommunitiesHomePage() {
  const { memberships } = useCommunityMembership();
  const loading = useSimulatedLoad(500);
  const firstName = currentUser.first;

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

  return (
    <AppShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.head}>
            <div>
              <div className={styles.eyebrow}>Your communities</div>
              <h1 className={styles.h1}>
                Welcome back, <em>{firstName}</em>
              </h1>
              <p className={styles.sub}>
                Here's what's been happening across your {myCommunities.length}{" "}
                communities.
              </p>
            </div>
            <Button variant="ghost" to={routes.communities}>
              Discover communities
            </Button>
          </div>

          {myCommunities.length === 0 ? (
            <EmptyState
              icon={<FiUsers />}
              title="You haven't joined any communities yet"
              description="Browse by interest and find where you belong — there's no rush."
              action={{ label: "Discover communities", to: routes.communities }}
            />
          ) : (
            <>
              <div className={styles.digest}>
                <div className={styles.digestSide}>
                  <div className={styles.digestLbl}>This week, quietly</div>
                  <p className={styles.digestNote}>
                    No pings — just your communities' week in one glance.
                  </p>
                </div>
                <div className={styles.digestTiles}>
                  <div className={styles.tile}>
                    <div className={styles.tileNum}>{digest.posts}</div>
                    <div className={styles.tileLbl}>new posts</div>
                  </div>
                  <div className={styles.tile}>
                    <div className={styles.tileNum}>{digest.active}</div>
                    <div className={styles.tileLbl}>active members</div>
                  </div>
                  <div className={styles.tile}>
                    <div className={styles.tileNum}>{digest.events}</div>
                    <div className={styles.tileLbl}>upcoming events</div>
                  </div>
                  <div className={styles.tile}>
                    <div className={styles.tileNum}>{digest.joined}</div>
                    <div className={styles.tileLbl}>people joined</div>
                  </div>
                </div>
              </div>

              <div className={styles.layout}>
                <div>
                  {todos.length > 0 && (
                    <div className={styles.todos}>
                      <div className={styles.todoLbl}>
                        <FiShield aria-hidden /> Needs your attention
                      </div>
                      {todos.map((t) => (
                        <Link
                          key={t.slug}
                          to={`/community/${t.slug}`}
                          className={styles.todoRow}
                        >
                          <span className={styles.todoName}>{t.name}</span>
                          <span className={styles.todoCounts}>
                            {t.requests > 0 && (
                              <span className={styles.todoChip}>
                                <FiInbox aria-hidden /> {t.requests} request
                                {t.requests > 1 ? "s" : ""}
                              </span>
                            )}
                            {t.reports > 0 && (
                              <span
                                className={[
                                  styles.todoChip,
                                  styles.todoChipFlag,
                                ].join(" ")}
                              >
                                <FiFlag aria-hidden /> {t.reports} report
                                {t.reports > 1 ? "s" : ""}
                              </span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className={styles.feedLbl}>Your pulse</div>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div className={styles.pulseCard} key={i}>
                        <SkeletonLine
                          width="30%"
                          height={11}
                          style={{ marginBottom: 14 }}
                        />
                        <div
                          style={{
                            display: "flex",
                            gap: 11,
                            alignItems: "center",
                          }}
                        >
                          <SkeletonAvatar size={36} />
                          <SkeletonLine width="40%" height={12} />
                        </div>
                        <SkeletonLine
                          height={12}
                          style={{ margin: "14px 0 6px" }}
                        />
                        <SkeletonLine width="80%" height={12} />
                      </div>
                    ))
                  ) : pulse.length === 0 ? (
                    <EmptyState
                      compact
                      title="Quiet for now"
                      description="When your communities post, it shows up here."
                    />
                  ) : (
                    pulse.map((item, i) => (
                      <FadeIn key={item.post.id} delay={Math.min(i, 8) * 55}>
                        <HubPulseCard item={item} />
                      </FadeIn>
                    ))
                  )}
                </div>

                <CommunitiesHomeSidebar
                  communities={myCommunities}
                  upcoming={upcoming}
                  suggestions={suggestions}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
