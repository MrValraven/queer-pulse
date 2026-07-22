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
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useProfile } from "../../app/providers/ProfileProvider";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMyCommunities } from "../communities/api/useMyCommunities";
import { communities } from "../homepage/data/communities";
import { getLiving } from "../communities/livingCommunities.data";
import { HubPulseCard, type HubPost } from "../communities/HubPulseCard";
import { useSocial } from "../../app/providers/SocialProvider";
import {
  FEED_TABS,
  FEED_POST,
  FEED_TAB_COPY,
  FEED_TAB_LABEL_KEY,
  NEW_THIS_WEEK,
  type FeedTab,
  type FeedPost,
  type FeedTabIcon,
  type SidebarMember,
  type SidebarGathering,
} from "./feed.data";
import { useEvents } from "../gatherings/api/useEvents";
import { initials } from "./api/feed.adapters";
import type { FeedItem } from "./api/feed.api";
import { tintForSlug } from "../../shared/api/refs";
import {
  GatheringCard,
  NewMemberCard,
  PostCard,
  SavedArticleCard,
  RecapCard,
} from "./FeedCards";
import { useFeed } from "./api/useFeed";
import { useSequencedTabSwap } from "./useSequencedTabSwap";
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
  const { t } = useTranslation();
  const fmt = useFormat();
  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  return {
    greeting: t(`feed:greeting.${timeOfDay}`),
    dateLine: t("feed:greeting.dateLine", {
      weekday: fmt.date(now, { weekday: "long" }),
      city: t("feed:greeting.city"),
      date: fmt.date(now),
    }),
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
        {populated ? "2 new messages" : "Messages"}
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
    targetTab,
    displayTab,
    leaving,
    selectTab: swapTab,
    viewportRef,
    contentRef,
  } = useSequencedTabSwap("All");
  const [hasSwitchedTab, setHasSwitchedTab] = useState(false);
  const { demoMode } = useDemoMode();
  const [demoLoading, setDemoLoading] = useState(demoMode);
  const [prevDemo, setPrevDemo] = useState(demoMode);
  const memberships = useMyCommunities();
  const { blocked, muted } = useSocial();
  // The signed-in member (real profile live, mock currentUser in demo mode).
  const { profile } = useProfile();
  const { greeting, dateLine } = useNowGreeting();

  // Live feed source (inert in demo mode, which renders its scripted cards).
  const feed = useFeed(displayTab);
  // The sidebar's "New this week" widget is page-global — it must stay put no
  // matter which feed tab is active. Source it from a dedicated People-tab
  // query rather than the tab-scoped `feed` above, whose `newMembers` is empty
  // on tabs like Gatherings/Posts. When the active tab *is* People this shares
  // `feed`'s query key, so react-query dedupes it into a single request.
  const sidebarFeed = useFeed("People");
  // The sidebar's "Upcoming" widget shows the upcoming gatherings, independent of
  // the active feed tab — same page-global rationale as the members widget.
  // `useEvents` branches demo/live internally; in demo the sidebar keeps its own
  // curated rows and ignores this.
  const upcomingFeed = useEvents({ filter: "upcoming" });

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

  const showCommunity = displayTab === "All" || displayTab === "Communities";
  // All feed content is mock data, gated behind the "Populate platform" toggle.
  const pulse = (demoMode && showCommunity ? communityPulse : []).filter(
    (item) => !item.post.author.slug || !hidden.has(item.post.author.slug),
  );
  const staticItems =
    demoMode && displayTab !== "Communities"
      ? FEED_ITEMS.filter(
          ({ tab, authorSlug }) =>
            (displayTab === "All" || tab === displayTab) &&
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

  // Sidebar "New this week" rows: the demo mock in demo mode, otherwise the live
  // recently-joined members from the tab-independent `sidebarFeed` (block/mute
  // filtered like the list) mapped to the widget's row shape and capped to a
  // short list. Items without a handle can't link to a profile, so they're
  // dropped. Sourcing this from `sidebarFeed` (not `liveMembers`) keeps the
  // widget populated across every tab switch.
  const sidebarNewMembers = demoMode
    ? []
    : sidebarFeed.newMembers.filter(
        (member) => !member.actor?.handle || !hidden.has(member.actor.handle),
      );
  const sidebarMembers: SidebarMember[] = demoMode
    ? NEW_THIS_WEEK
    : sidebarNewMembers
        .filter((item) => item.actor?.handle)
        .slice(0, 5)
        .map((item) => {
          const slug = item.actor!.handle;
          return {
            slug,
            name: item.title,
            initials: initials(item.title),
            tint: tintForSlug(slug),
            photo: item.actor?.avatarUrl ?? undefined,
          };
        });

  // Sidebar "Upcoming" rows: demo keeps its curated rows inside the sidebar;
  // live mode surfaces the viewer's own "going" gatherings, dropping any already
  // past, soonest first, capped to a short list. Each `CalendarEvent` already
  // carries a ready `to` link and a `Date` the widget formats into a date pill.
  const nowInstant = new Date();
  const sidebarGatherings: SidebarGathering[] = demoMode
    ? []
    : upcomingFeed.items
        .filter((event) => event.date >= nowInstant)
        .sort((first, second) => first.date.getTime() - second.date.getTime())
        .slice(0, 3)
        .map((event) => ({
          to: event.to,
          date: event.date,
          name: event.title,
          venue: event.hood,
        }));

  const selectTab = (tab: FeedTab) => {
    setHasSwitchedTab(true);
    swapTab(tab);
  };

  // Card entrance timing. The first paint of the page is a load, so it earns the
  // slower, more generous stagger; a tab switch should feel instant, so the step
  // tightens and stops compounding after the sixth card rather than trailing off.
  const revealDelay = (index: number) =>
    hasSwitchedTab ? `${Math.min(index, 5) * 40}ms` : `${index * 60}ms`;

  // Tab-specific empty/error copy, so each corner of the feed says what it's for.
  const tabCopy = FEED_TAB_COPY[displayTab];
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
        onClick: () => void feed.refetch(),
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
            first={profile.first}
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
                    isError={feed.isError}
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
              loading={
                loading ||
                (!demoMode && (sidebarFeed.isLoading || upcomingFeed.isLoading))
              }
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
