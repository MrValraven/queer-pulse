import { MEMBERS, memberName } from "../members/data/members";
import type { AvatarTint } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";

/**
 * Canonical tab ids — never translated. Held in component state, used as
 * `Record` keys and to filter `FEED_ITEMS` below, so a language switch must
 * never change these values (label-key indirection: `tab.<id>` in the
 * `feed` catalog resolves the display label a `FeedTabs` button shows).
 */
export const FEED_TABS = [
  "All",
  "Communities",
  "Connections",
  "Gatherings",
  "People",
  "Posts",
] as const;
export type FeedTab = (typeof FEED_TABS)[number];

/** `feed:tab.<id>` catalog key for a tab's display label. */
export const FEED_TAB_LABEL_KEY: Record<FeedTab, string> = {
  All: "feed:tab.all",
  Communities: "feed:tab.communities",
  Connections: "feed:tab.connections",
  Gatherings: "feed:tab.gatherings",
  People: "feed:tab.people",
  Posts: "feed:tab.posts",
};

/** Which react-icons glyph a tab's empty/error panel shows (resolved in the page). */
export type FeedTabIcon =
  "inbox" | "communities" | "connections" | "gatherings" | "people" | "posts";

interface FeedTabMessage {
  titleKey: string;
  descriptionKey: string;
  /** Where the primary button sends you to start filling this space. */
  action?: { labelKey: string; to: string };
}

interface FeedTabCopy {
  icon: FeedTabIcon;
  /** Shown when this tab has no activity to show. */
  empty: FeedTabMessage;
  /** Shown when this tab's live fetch fails. Retry is added by the page. */
  error: Omit<FeedTabMessage, "action">;
}

/**
 * i18n Pattern A. Distinct, tab-specific empty + error copy — each panel names
 * what this corner of the feed is for and offers one warm way to start
 * filling it. The data file holds catalog keys; `FeedPage.tsx` resolves them
 * with `t()`. Keep the per-tab distinctions intact — do not collapse into one
 * generic string.
 */
export const FEED_TAB_COPY: Record<FeedTab, FeedTabCopy> = {
  All: {
    icon: "inbox",
    empty: {
      titleKey: "feed:tab.all.empty.title",
      descriptionKey: "feed:tab.all.empty.description",
      action: { labelKey: "feed:tab.all.empty.action", to: routes.members },
    },
    error: {
      titleKey: "feed:tab.all.error.title",
      descriptionKey: "feed:tab.all.error.description",
    },
  },
  Communities: {
    icon: "communities",
    empty: {
      titleKey: "feed:tab.communities.empty.title",
      descriptionKey: "feed:tab.communities.empty.description",
      action: {
        labelKey: "feed:tab.communities.empty.action",
        to: routes.communities,
      },
    },
    error: {
      titleKey: "feed:tab.communities.error.title",
      descriptionKey: "feed:tab.communities.error.description",
    },
  },
  Connections: {
    icon: "connections",
    empty: {
      titleKey: "feed:tab.connections.empty.title",
      descriptionKey: "feed:tab.connections.empty.description",
      action: {
        labelKey: "feed:tab.connections.empty.action",
        to: routes.members,
      },
    },
    error: {
      titleKey: "feed:tab.connections.error.title",
      descriptionKey: "feed:tab.connections.error.description",
    },
  },
  Gatherings: {
    icon: "gatherings",
    empty: {
      titleKey: "feed:tab.gatherings.empty.title",
      descriptionKey: "feed:tab.gatherings.empty.description",
      action: {
        labelKey: "feed:tab.gatherings.empty.action",
        to: routes.gatherings,
      },
    },
    error: {
      titleKey: "feed:tab.gatherings.error.title",
      descriptionKey: "feed:tab.gatherings.error.description",
    },
  },
  People: {
    icon: "people",
    empty: {
      titleKey: "feed:tab.people.empty.title",
      descriptionKey: "feed:tab.people.empty.description",
      action: { labelKey: "feed:tab.people.empty.action", to: routes.members },
    },
    error: {
      titleKey: "feed:tab.people.error.title",
      descriptionKey: "feed:tab.people.error.description",
    },
  },
  Posts: {
    icon: "posts",
    empty: {
      titleKey: "feed:tab.posts.empty.title",
      descriptionKey: "feed:tab.posts.empty.description",
      action: { labelKey: "feed:tab.posts.empty.action", to: routes.forum },
    },
    error: {
      titleKey: "feed:tab.posts.error.title",
      descriptionKey: "feed:tab.posts.error.description",
    },
  },
};

const NEW_SLUGS = [
  "kai",
  "bilal-kaya",
  "ines-fonseca",
  "daniel-oliveira",
] as const;

/** A row in the sidebar's "New this week" widget — shared by the demo mock
 *  (`NEW_THIS_WEEK`) and the live members mapped from the feed's `new_member`
 *  items, so the widget renders one way regardless of mode. */
export interface SidebarMember {
  slug: string;
  name: string;
  initials: string;
  tint: AvatarTint;
  photo?: string;
}

/** A row in the sidebar's "Upcoming" widget — the live gatherings the viewer is
 *  attending, mapped from the events API in live mode. Demo mode keeps its own
 *  curated rows inside the sidebar component. */
export interface SidebarGathering {
  /** Router path to the gathering detail page. */
  to: string;
  /** Start instant — formatted to a date pill at render via `useFormat()`. */
  date: Date;
  name: string;
  venue: string;
}

/**
 * The sidebar's connections widget, in BOTH modes (SOC-06).
 *
 * It used to be gated on a `populated` flag the page passed as `demoMode`, so
 * every live member was told, on the most-visited page in the product, that
 * they had no connections — while demo mode showed six hardcoded initials and
 * a fixed "42 connections". Now both modes read the real relationship list.
 *
 * `avatars` is a short display sample, `count` is the true total.
 */
export interface SidebarConnections {
  count: number;
  avatars: { initials: string; tint: AvatarTint; src?: string }[];
  /** True when the lookup failed. Without it a failed request collapses back
   *  into `count: 0` and the widget reprints the very claim SOC-06 removed
   *  (DES-22): that the member has no connections. */
  hasFailed?: boolean;
  /** Re-runs the failed lookup. */
  onRetry?: () => void;
}

export const NEW_THIS_WEEK: SidebarMember[] = NEW_SLUGS.map((slug) => {
  const member = MEMBERS[slug]!;
  return {
    slug,
    name: memberName(slug),
    initials: member.initials,
    tint: member.tint,
    photo: member.photo,
  };
});

/** Reasons offered when reporting a post for moderation. */
export const REPORT_REASONS = [
  "Harassment or hate speech",
  "Spam or scam",
  "Misinformation",
  "Outing or doxxing someone",
  "Something else",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const SAFETY_EMAIL = "hello@queerpulse.com";

export interface FeedReply {
  id: string;
  author: string;
  /** Member slug for `author`, when the display name resolves to a real
   *  member account. Parallel to `author` (which stays the display string
   *  used for rendering) rather than replacing it, so no existing mock
   *  reply's shape needs rewriting. Left undefined for replies whose author
   *  is abbreviated (e.g. "Joana P.") and can't be matched to a member
   *  without guessing a surname. */
  authorSlug?: string;
  body: string;
}

/** A community post in the feed. Counts are seeds for local interaction state. */
export interface FeedPost {
  id: string;
  /** Author profile slug (drives Connect). */
  slug: string;
  authorName: string;
  authorInitials: string;
  authorTint: "jade" | "coral" | "plum";
  time: string;
  context: string;
  body: string;
  likeCount: number;
  replies: FeedReply[];
  /** Thread deep-link for live posts, mapped from the feed API's `FeedItem.link`.
   *  Demo posts omit it — `CommunityPostCard` falls back to `/communities`. */
  link?: string;
  /** Author avatar for live posts, mapped from the feed API's
   *  `FeedItem.actor.avatarUrl`. Demo posts omit it — `CommunityPostCard`
   *  falls back to initials. */
  avatarUrl?: string | null;
}

export const FEED_POST: FeedPost = {
  id: "post:gp-lisbon-gp",
  slug: "anika",
  authorName: "Anika Kovač",
  authorInitials: "AK",
  authorTint: "coral",
  time: "2 hours ago",
  context: "Trans & Non-Binary Network",
  body: "Anyone have recommendations for a queer-friendly GP in Lisbon? Preferably someone familiar with trans healthcare. I'm tired of having to explain myself from scratch every visit. Grateful for any leads, DM or reply here.",
  likeCount: 12,
  replies: [
    {
      id: "r1",
      author: "Joana P.",
      body: "Dr. Marta Reis at Clínica Arco, genuinely lovely and experienced.",
    },
    {
      id: "r2",
      author: "Sam R.",
      body: "Sending you a DM with two more options now.",
    },
    {
      id: "r3",
      author: "Téo M.",
      body: "The CheckpointLX team can also point you to affirming GPs.",
    },
    {
      id: "r4",
      author: "Iris L.",
      body: "Following. Looking for the same near Almada.",
    },
  ],
};
