import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiInbox } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import {
  SkeletonAvatar,
  SkeletonLine,
  EmptyState,
} from "../../shared/components/ui";
import { currentUser } from "../members/data/members";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../app/providers/CommunityMembershipProvider";
import { communities } from "../homepage/data/communities";
import { getLiving } from "../communities/livingCommunities.data";
import { HubPulseCard, type HubPost } from "../communities/HubPulseCard";
import { FEED_TABS, type FeedTab } from "./feed.data";
import {
  GatheringCard,
  NewMemberCard,
  PostCard,
  SavedArticleCard,
  RecapCard,
} from "./FeedCards";
import { FeedSidebar } from "./FeedSidebar";
import styles from "./FeedPage.module.css";

/** Each feed item tagged with the tabs it belongs to (besides "All"). */
const FEED_ITEMS: {
  key: string;
  tab: FeedTab;
  Card: () => React.ReactElement;
}[] = [
  { key: "gathering", tab: "Gatherings", Card: GatheringCard },
  { key: "new-member", tab: "People", Card: NewMemberCard },
  { key: "post", tab: "Posts", Card: PostCard },
  { key: "saved-article", tab: "Posts", Card: SavedArticleCard },
  { key: "recap", tab: "Gatherings", Card: RecapCard },
];

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
  const [loading, setLoading] = useState(demoMode);
  const [prevDemo, setPrevDemo] = useState(demoMode);
  const { memberships } = useCommunityMembership();

  // When the platform is (re)populated, snap straight into the skeleton during
  // this render — adjusting state mid-render avoids a one-frame flash of data
  // before the load-in. Emptying the platform just clears the skeleton.
  if (demoMode !== prevDemo) {
    setPrevDemo(demoMode);
    setLoading(demoMode);
  }

  // Simulate a fetch whenever the platform is populated (incl. toggling on),
  // so the feed skeletons out and then staggers its data back in.
  useEffect(() => {
    if (!demoMode) return;
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [demoMode]);

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
  const pulse = demoMode && showCommunity ? communityPulse : [];
  const staticItems =
    demoMode && activeTab !== "Communities"
      ? FEED_ITEMS.filter(({ tab }) => activeTab === "All" || tab === activeTab)
      : [];
  const empty = pulse.length === 0 && staticItems.length === 0;

  return (
    <AppShell unreadCount={demoMode ? 3 : 0}>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.greetingRow}>
            <div>
              <div className={styles.greeting}>
                Good morning, <em>{currentUser.first}</em>
              </div>
              <div className={styles.greetingDate}>
                Saturday · Lisbon · 21 June 2026
              </div>
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
                ) : empty ? (
                  !demoMode ? (
                    <EmptyState
                      icon={<FiInbox />}
                      title="Your feed is quiet"
                      description={
                        <>
                          Turn on <strong>Populate platform</strong> from your
                          account menu to preview the feed with sample activity.
                        </>
                      }
                    />
                  ) : (
                    <EmptyState
                      icon={<FiInbox />}
                      title={`Nothing in ${activeTab} yet`}
                      description="When there's activity here, it'll show up in your feed."
                      action={{
                        label: "View everything",
                        onClick: () => setActiveTab("All"),
                      }}
                    />
                  )
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
