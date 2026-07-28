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
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HubPulseCard, type HubPost } from "../communities/HubPulseCard";
import {
  FEED_TABS,
  FEED_TAB_LABEL_KEY,
  type FeedTab,
  type FeedPost,
  type FeedTabIcon,
} from "./feed.data";
import type { FeedItem } from "./api/feed.api";
import { NewMemberCard, PostCard } from "./FeedCards";
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
  populated,
}: {
  greeting: string;
  dateLine: string;
  first: string;
  populated: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.greetingRow}>
      <div>
        <div className={styles.greeting}>
          {greeting}, <em>{first}</em>
        </div>
        <div className={styles.greetingDate}>{dateLine}</div>
      </div>
      <Link to={routes.messages} className={styles.msgChip}>
        <svg width={13} height={13} viewBox="0 0 13 13" fill="none" aria-hidden>
          <path
            d="M1 2.5h11v7H1zM1 2.5l5.5 4 5.5-4"
            stroke="var(--jade)"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {populated
          ? t("feed:greeting.newMessages", { count: 2 })
          : t("feed:greeting.messagesLink")}
      </Link>
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

/** The feed list items for the current tab/mode. Purely presentational: the
 *  page derives the arrays and the empty/error panels, this renders the right
 *  branch. Kept separate so the reveal wrappers and skeletons stay in one place
 *  and FeedPage itself stays small. */
function FeedListBody({
  loading,
  demoMode,
  isError,
  empty,
  emptyPanel,
  errorPanel,
  livePosts,
  liveMembers,
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
  livePosts: FeedPost[];
  liveMembers: FeedItem[];
  pulse: HubPost[];
  staticItems: { key: string; Card: () => React.ReactElement }[];
  revealDelay: (index: number) => string;
}) {
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
    if (isError) return <>{errorPanel}</>;
    if (empty) return <>{emptyPanel}</>;
    return (
      <>
        {livePosts.map((post, index) => (
          <div
            key={post.id}
            className={styles.cardReveal}
            style={{ animationDelay: revealDelay(index) }}
          >
            <PostCard post={post} />
          </div>
        ))}
        {liveMembers.map((item, index) => (
          <div
            key={item.id}
            className={styles.cardReveal}
            style={{ animationDelay: revealDelay(index + livePosts.length) }}
          >
            <NewMemberCard item={item} />
          </div>
        ))}
      </>
    );
  }

  if (empty) return <>{emptyPanel}</>;
  return (
    <>
      {pulse.map((item, index) => (
        <div
          key={item.post.id}
          className={styles.cardReveal}
          style={{ animationDelay: revealDelay(index) }}
        >
          <HubPulseCard item={item} />
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
    livePosts,
    liveMembers,
    pulse,
    staticItems,
    revealDelay,
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
    <AppShell unreadCount={demoMode ? 3 : 0}>
      <div className={styles.page}>
        <div className="wrap">
          <FeedGreeting
            greeting={greeting}
            dateLine={dateLine}
            first={first}
            populated={demoMode}
          />

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
                  <FeedListBody
                    loading={loading}
                    demoMode={demoMode}
                    isError={isError}
                    empty={empty}
                    emptyPanel={emptyPanel}
                    errorPanel={errorPanel}
                    livePosts={livePosts}
                    liveMembers={liveMembers}
                    pulse={pulse}
                    staticItems={staticItems}
                    revealDelay={revealDelay}
                  />
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
