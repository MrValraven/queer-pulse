import { useEffect, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useProfile } from "../../app/providers/useProfile";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMyCommunities } from "../communities/api/useMyCommunities";
import { communities } from "../homepage/data/communities";
import { getLiving } from "../communities/livingCommunities.data";
import type { HubPost } from "../communities/HubPulseCard";
import { useSocial } from "../../app/providers/useSocial";
import {
  FEED_POST,
  FEED_TAB_COPY,
  NEW_THIS_WEEK,
  type FeedTab,
  type SidebarMember,
  type SidebarGathering,
} from "./feed.data";
import { useEvents } from "../gatherings/api/useEvents";
import { initials } from "./api/feed.adapters";
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

/** All the feed page's data derivation and tab-swap/loading orchestration.
 *  Preserves the exact demo/live branching of the original page component;
 *  extracted purely so FeedPage stays a thin presentational shell under the
 *  200-line component limit. */
export function useFeedPage() {
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
      community: communities.find((x) => x.slug === slug),
    }))
    .filter((x) => x.living)
    .flatMap((x) =>
      [...x.living!.pinned, ...x.living!.pulse].slice(0, 2).map((post) => ({
        post,
        communityName: x.community?.name ?? x.slug,
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

  return {
    demoMode,
    greeting,
    dateLine,
    first: profile.first,
    targetTab,
    displayTab,
    leaving,
    selectTab,
    viewportRef,
    contentRef,
    hasSwitchedTab,
    loading,
    isError: feed.isError,
    refetch: feed.refetch,
    empty,
    livePosts,
    liveMembers,
    pulse,
    staticItems,
    revealDelay,
    sidebarLoading:
      loading || (!demoMode && (sidebarFeed.isLoading || upcomingFeed.isLoading)),
    sidebarMembers,
    sidebarGatherings,
    tabCopy,
  };
}
