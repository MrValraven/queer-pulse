import { useQueryClient } from "@tanstack/react-query";
import {
  FiInbox,
  FiUsers,
  FiCalendar,
  FiUserPlus,
  FiMessageCircle,
} from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import {
  SkeletonAvatar,
  SkeletonLine,
  EmptyState,
  FeatureHelp,
  PullToRefresh,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import type { HubPost } from "../communities/HubPulseCard";
import {
  FEED_TABS,
  FEED_TAB_LABEL_KEY,
  type FeedTab,
  type FeedTabIcon,
} from "./feed.data";
import type { FeedItem } from "./api/feed.api";
import { feedItemToPost } from "./api/feed.adapters";
import {
  MemberCard,
  CommunityPostCard,
  GatheringCard,
  ForumThreadCard,
} from "./FeedCards";
import { FeedLoadMore } from "./FeedLoadMore";
import { useFeedPage } from "./useFeedPage";
import { FeedSidebar } from "./FeedSidebar";
import styles from "./FeedPage.module.css";

/** react-icons glyph for each tab's empty/error panel. */
const TAB_ICONS: Record<FeedTabIcon, React.ReactElement> = {
  inbox: <FiInbox />,
  communities: <FiUsers />,
  gatherings: <FiCalendar />,
  people: <FiUserPlus />,
  posts: <FiMessageCircle />,
};

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

function FeedGreeting({
  greeting,
  dateLine,
  first,
}: {
  greeting: string;
  dateLine: string;
  first: string;
}) {
  return (
    <div className={styles.greetingRow}>
      <div>
        <div className={styles.greeting}>
          {greeting}, <em>{first}</em> <FeatureHelp id="feed.hub" />
        </div>
        <div className={styles.greetingDate}>{dateLine}</div>
      </div>
    </div>
  );
}

function FeedTabs({
  activeTab,
  onSelect,
}: {
  activeTab: FeedTab;
  onSelect: (tab: FeedTab) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.tabs}>
      {FEED_TABS.map((tab) => (
        <button
          type="button"
          key={tab}
          className={[styles.tab, activeTab === tab && styles.tabActive]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onSelect(tab)}
        >
          {t(FEED_TAB_LABEL_KEY[tab])}
        </button>
      ))}
    </div>
  );
}

/** Render the right card for one live `FeedItem`, switching on `type`. The
 *  backend merges all four types into a single ordered `/feed` page (Task 7),
 *  so the render layer — not the hook — is what adapts each item to its
 *  card. `community_post` is the one type whose card still speaks the
 *  prototype's `FeedPost` shape, so it's the one adapted via
 *  `feedItemToPost`; the other three cards render straight off the raw
 *  `FeedItem`. `default` is a defensive no-op for a future item type the
 *  backend ships before this switch is updated for it. */
function renderLiveFeedCard(item: FeedItem, fmt: Formatters): React.ReactNode {
  switch (item.type) {
    case "community_post":
      return <CommunityPostCard post={feedItemToPost(item, fmt)} />;
    case "gathering":
      return <GatheringCard item={item} />;
    case "forum_thread":
      return <ForumThreadCard item={item} />;
    case "new_member":
      return <MemberCard item={item} />;
    default:
      return null;
  }
}

/** The feed list items for the current tab/mode. Purely presentational: the
 *  page derives the arrays and the empty/error panels, this renders the right
 *  branch. Kept separate so the reveal wrappers and skeletons stay in one place
 *  and FeedPage itself stays small. */
export function FeedListBody({
  loading,
  demoMode,
  isError,
  empty,
  emptyPanel,
  errorPanel,
  liveItems,
  pulse,
  staticItems,
  revealDelay,
}: {
  loading: boolean;
  demoMode: boolean;
  isError: boolean;
  empty: boolean;
  emptyPanel: React.ReactNode;
  errorPanel: React.ReactNode;
  liveItems: FeedItem[];
  pulse: HubPost[];
  staticItems: { key: string; Card: () => React.ReactElement }[];
  revealDelay: (index: number) => string;
}) {
  const fmt = useFormat();

  if (loading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, index) => (
          <FeedSkeleton key={index} />
        ))}
      </>
    );
  }

  if (!demoMode) {
    if (isError) return <div className={styles.spanFull}>{errorPanel}</div>;
    if (empty) return <div className={styles.spanFull}>{emptyPanel}</div>;
    return (
      <>
        {liveItems.map((item, index) => (
          <div
            key={item.id}
            className={styles.cardReveal}
            style={{ animationDelay: revealDelay(index) }}
          >
            {renderLiveFeedCard(item, fmt)}
          </div>
        ))}
      </>
    );
  }

  if (empty) return <div className={styles.spanFull}>{emptyPanel}</div>;
  return (
    <>
      {pulse.map((item, index) => (
        <div
          key={item.post.id}
          className={styles.cardReveal}
          style={{ animationDelay: revealDelay(index) }}
        >
          <CommunityPostCard hub={item} />
        </div>
      ))}
      {staticItems.map(({ key, Card }, index) => (
        <div
          key={key}
          className={styles.cardReveal}
          style={{ animationDelay: revealDelay(index + pulse.length) }}
        >
          <Card />
        </div>
      ))}
    </>
  );
}

export function FeedPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    demoMode,
    greeting,
    dateLine,
    first,
    targetTab,
    displayTab,
    leaving,
    selectTab,
    viewportRef,
    contentRef,
    hasSwitchedTab,
    loading,
    isError,
    refetch,
    empty,
    liveItems,
    pulse,
    staticItems,
    banner,
    revealDelay,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    sidebarLoading,
    sidebarMembers,
    sidebarGatherings,
    tabCopy,
  } = useFeedPage();

  const emptyPanel = (
    <div className={styles.cardReveal}>
      <EmptyState
        icon={TAB_ICONS[tabCopy.icon]}
        title={t(tabCopy.empty.titleKey)}
        description={t(tabCopy.empty.descriptionKey)}
        action={
          tabCopy.empty.action && {
            label: t(tabCopy.empty.action.labelKey),
            to: tabCopy.empty.action.to,
          }
        }
        secondaryAction={
          displayTab === "All"
            ? undefined
            : {
                label: t("feed:common.viewEverything"),
                onClick: () => selectTab("All"),
              }
        }
      />
    </div>
  );
  const errorPanel = (
    <EmptyState
      icon={TAB_ICONS[tabCopy.icon]}
      title={t(tabCopy.error.titleKey)}
      description={t(tabCopy.error.descriptionKey)}
      action={{
        label: t("feed:common.tryAgain"),
        onClick: () => void refetch(),
      }}
    />
  );

  return (
    <AppShell>
      <div className={styles.page}>
        <div className="wrap">
          <FeedGreeting greeting={greeting} dateLine={dateLine} first={first} />

          {banner && (
            <div className={styles.banner}>
              <span className={styles.bannerDot} aria-hidden />
              <span>
                {t("feed:banner.joined", { count: banner.joined })}
                {banner.sharing > 0 && (
                  <> · {t("feed:banner.sharing", { count: banner.sharing })}</>
                )}
              </span>
            </div>
          )}

          <div className={styles.layout}>
            <div>
              <FeedTabs activeTab={targetTab} onSelect={selectTab} />
              {/* useSequencedTabSwap fades the outgoing content (`.leaving`)
                  before committing the swap, then eases this viewport's height
                  across the change so it never snaps. */}
              <div ref={viewportRef} className={styles.viewport}>
                {/* Keyed on displayTab so every committed switch re-mounts the
                    panel and the card reveal replays — without this, cards
                    shared between two tabs keep their DOM nodes and silently
                    jump into place. */}
                <div
                  ref={contentRef}
                  key={displayTab}
                  className={[
                    styles.list,
                    hasSwitchedTab && styles.listSwitch,
                    leaving && styles.leaving,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {/* `queryKey: ["feed"]` matches useFeed's `["feed", tab, demoMode]`
                      as a prefix — invalidates every tab/mode variant, so a pull
                      refresh refetches whichever tab is currently displayed. */}
                  <PullToRefresh
                    onRefresh={() =>
                      queryClient.invalidateQueries({ queryKey: ["feed"] })
                    }
                  >
                    {/* Responsive card grid: every card packs two-up (auto-fill
                        reflows to one-up on narrow viewports). `.spanFull` is
                        reserved for the empty/error panels and the pager row
                        below, which legitimately claim the full width. */}
                    <div className={styles.grid}>
                      <FeedListBody
                        loading={loading}
                        demoMode={demoMode}
                        isError={isError}
                        empty={empty}
                        emptyPanel={emptyPanel}
                        errorPanel={errorPanel}
                        liveItems={liveItems}
                        pulse={pulse}
                        staticItems={staticItems}
                        revealDelay={revealDelay}
                      />
                      {/* Live-only infinite-scroll pager. Self-guards on
                          `hasNextPage` (false in demo mode, where the feed hook is
                          disabled), so it renders nothing until there's a real
                          next cursor page to fetch. */}
                      {!demoMode && !loading && !isError && !empty && (
                        <div className={styles.spanFull}>
                          <FeedLoadMore
                            hasNextPage={hasNextPage}
                            fetchNextPage={() => {
                              void fetchNextPage();
                            }}
                            isFetchingNextPage={isFetchingNextPage}
                          />
                        </div>
                      )}
                    </div>
                  </PullToRefresh>
                </div>
              </div>
            </div>
            <FeedSidebar
              loading={sidebarLoading}
              populated={demoMode}
              members={sidebarMembers}
              gatherings={sidebarGatherings}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
