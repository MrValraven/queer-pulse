import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiInbox,
  FiUsers,
  FiCalendar,
  FiUserPlus,
  FiMessageCircle,
} from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import {
  SkeletonAvatar,
  SkeletonLine,
  EmptyState,
} from "../../shared/components/ui";
import { useProfile } from "../../app/providers/ProfileProvider";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../app/providers/CommunityMembershipProvider";
import { communities } from "../homepage/data/communities";
import { getLiving } from "../communities/livingCommunities.data";
import { HubPulseCard, type HubPost } from "../communities/HubPulseCard";
import { useSocial } from "../../app/providers/SocialProvider";
import {
  FEED_TABS,
  FEED_POST,
  FEED_TAB_COPY,
  type FeedTab,
  type FeedTabIcon,
} from "./feed.data";
import {
  GatheringCard,
  NewMemberCard,
  PostCard,
  SavedArticleCard,
  RecapCard,
} from "./FeedCards";
import { useFeed } from "./api/useFeed";
import { FeedSidebar } from "./FeedSidebar";
import styles from "./FeedPage.module.css";

/** Each feed item tagged with the tabs it belongs to (besides "All"). Cards with
 *  an identifiable author carry `authorSlug` so blocked/muted authors filter out. */
const FEED_ITEMS: {
  key: string;
  tab: FeedTab;
  Card: () => React.ReactElement;
  authorSlug?: string;
}[] = [
  { key: "gathering", tab: "Gatherings", Card: GatheringCard },
  { key: "new-member", tab: "People", Card: NewMemberCard, authorSlug: "kai" },
  {
    key: "post",
    tab: "Posts",
    Card: () => <PostCard />,
    authorSlug: FEED_POST.slug,
  },
  { key: "saved-article", tab: "Posts", Card: SavedArticleCard },
  { key: "recap", tab: "Gatherings", Card: RecapCard },
];

/** react-icons glyph for each tab's empty/error panel. */
const TAB_ICONS: Record<FeedTabIcon, React.ReactElement> = {
  inbox: <FiInbox />,
  communities: <FiUsers />,
  gatherings: <FiCalendar />,
  people: <FiUserPlus />,
  posts: <FiMessageCircle />,
};

/** Greeting + formatted date from the user's local machine clock. */
function useNowGreeting() {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const weekday = now.toLocaleDateString("en-GB", { weekday: "long" });
  const day = now.getDate();
  const month = now.toLocaleDateString("en-GB", { month: "long" });
  const year = now.getFullYear();
  return {
    greeting,
    dateLine: `${weekday} · Lisbon · ${day} ${month} ${year}`,
  };
}

function FeedSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.pad} style={{ display: "flex", gap: 12 }}>
        <SkeletonAvatar size={44} />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="40%" height={14} />
          <SkeletonLine width="80%" height={18} style={{ marginTop: 12 }} />
          <SkeletonLine width="60%" height={13} style={{ marginTop: 10 }} />
        </div>
      </div>
    </div>
  );
}

export function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("All");
  const { demoMode } = useDemoMode();
  const [demoLoading, setDemoLoading] = useState(demoMode);
  const [prevDemo, setPrevDemo] = useState(demoMode);
  const { memberships } = useCommunityMembership();
  const { blocked, muted } = useSocial();
  // The signed-in member (real profile live, mock currentUser in demo mode).
  const { profile } = useProfile();
  const { greeting, dateLine } = useNowGreeting();

  // Live feed source (inert in demo mode, which renders its scripted cards).
  const feed = useFeed(activeTab);

  // Defense-in-depth: hide any author I've blocked or muted from my feed. The
  // server is authoritative in live mode; this stops any flash of their content.
  const hidden = new Set([...blocked, ...muted]);

  // When the platform is (re)populated, snap straight into the skeleton during
  // this render — adjusting state mid-render avoids a one-frame flash of data
  // before the load-in. Emptying the platform just clears the skeleton.
  if (demoMode !== prevDemo) {
    setPrevDemo(demoMode);
    setDemoLoading(demoMode);
  }

  // Simulate a fetch whenever the platform is populated (incl. toggling on),
  // so the feed skeletons out and then staggers its data back in.
  useEffect(() => {
    if (!demoMode) return;
    const t = setTimeout(() => setDemoLoading(false), 600);
    return () => clearTimeout(t);
  }, [demoMode]);

  const loading = demoMode ? demoLoading : feed.isLoading;

  // Cross-community aggregation: the latest pulse from communities you're in.
  const communityPulse: HubPost[] = Object.keys(memberships)
    .map((slug) => ({
      slug,
      living: getLiving(slug),
      c: communities.find((x) => x.slug === slug),
    }))
    .filter((x) => x.living)
    .flatMap((x) =>
      [...x.living!.pinned, ...x.living!.pulse].slice(0, 2).map((post) => ({
        post,
        communityName: x.c?.name ?? x.slug,
        communitySlug: x.slug,
      })),
    )
    .slice(0, 5);

  const showCommunity = activeTab === "All" || activeTab === "Communities";
  // All feed content is mock data, gated behind the "Populate platform" toggle.
  const pulse = (demoMode && showCommunity ? communityPulse : []).filter(
    (item) => !item.post.author.slug || !hidden.has(item.post.author.slug),
  );
  const staticItems =
    demoMode && activeTab !== "Communities"
      ? FEED_ITEMS.filter(
          ({ tab, authorSlug }) =>
            (activeTab === "All" || tab === activeTab) &&
            !(authorSlug && hidden.has(authorSlug)),
        )
      : [];
  // Live posts (block/mute filtered — defense-in-depth over the server filter).
  const livePosts = demoMode
    ? []
    : feed.posts.filter((p) => !p.slug || !hidden.has(p.slug));
  // Live "new member" items (People tab, also folded into All) — same
  // defense-in-depth block/mute filtering as livePosts above.
  const liveMembers = demoMode
    ? []
    : feed.newMembers.filter(
        (m) => !m.actor?.handle || !hidden.has(m.actor.handle),
      );
  const empty = demoMode
    ? pulse.length === 0 && staticItems.length === 0
    : livePosts.length === 0 && liveMembers.length === 0;

  // Tab-specific empty/error copy, so each corner of the feed says what it's for.
  const tabCopy = FEED_TAB_COPY[activeTab];
  const emptyPanel = (
    <EmptyState
      icon={TAB_ICONS[tabCopy.icon]}
      title={tabCopy.empty.title}
      description={tabCopy.empty.description}
      action={tabCopy.empty.action}
      secondaryAction={
        activeTab === "All"
          ? undefined
          : { label: "View everything", onClick: () => setActiveTab("All") }
      }
    />
  );

  return (
    <AppShell unreadCount={demoMode ? 3 : 0}>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.greetingRow}>
            <div>
              <div className={styles.greeting}>
                {greeting}, <em>{profile.first}</em>
              </div>
              <div className={styles.greetingDate}>{dateLine}</div>
            </div>
            <Link to={routes.messages} className={styles.msgChip}>
              <svg
                width={13}
                height={13}
                viewBox="0 0 13 13"
                fill="none"
                aria-hidden
              >
                <path
                  d="M1 2.5h11v7H1zM1 2.5l5.5 4 5.5-4"
                  stroke="var(--jade)"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {demoMode ? "2 new messages" : "Messages"}
            </Link>
          </div>

          <div className={styles.layout}>
            <div>
              <div className={styles.tabs}>
                {FEED_TABS.map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    className={[
                      styles.tab,
                      activeTab === tab && styles.tabActive,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className={styles.list}>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <FeedSkeleton key={i} />
                  ))
                ) : !demoMode ? (
                  feed.isError ? (
                    <EmptyState
                      icon={TAB_ICONS[tabCopy.icon]}
                      title={tabCopy.error.title}
                      description={tabCopy.error.description}
                      action={{
                        label: "Try again",
                        onClick: () => void feed.refetch(),
                      }}
                    />
                  ) : empty ? (
                    emptyPanel
                  ) : (
                    <>
                      {livePosts.map((post, i) => (
                        <div
                          key={post.id}
                          className={styles.cardReveal}
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                          <PostCard post={post} />
                        </div>
                      ))}
                      {liveMembers.map((item, i) => (
                        <div
                          key={item.id}
                          className={styles.cardReveal}
                          style={{
                            animationDelay: `${(i + livePosts.length) * 60}ms`,
                          }}
                        >
                          <NewMemberCard item={item} />
                        </div>
                      ))}
                    </>
                  )
                ) : empty ? (
                  emptyPanel
                ) : (
                  <>
                    {pulse.map((item, i) => (
                      <div
                        key={item.post.id}
                        className={styles.cardReveal}
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <HubPulseCard item={item} />
                      </div>
                    ))}
                    {staticItems.map(({ key, Card }, i) => (
                      <div
                        key={key}
                        className={styles.cardReveal}
                        style={{
                          animationDelay: `${(i + pulse.length) * 60}ms`,
                        }}
                      >
                        <Card />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            <FeedSidebar loading={loading} populated={demoMode} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
