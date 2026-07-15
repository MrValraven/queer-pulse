import { MEMBERS, memberName } from "../members/data/members";
import { routes } from "../../app/routeMap";

export const FEED_TABS = [
  "All",
  "Communities",
  "Gatherings",
  "People",
  "Posts",
] as const;
export type FeedTab = (typeof FEED_TABS)[number];

/** Which react-icons glyph a tab's empty/error panel shows (resolved in the page). */
export type FeedTabIcon =
  "inbox" | "communities" | "gatherings" | "people" | "posts";

interface FeedTabMessage {
  title: string;
  description: string;
  /** Where the primary button sends you to start filling this space. */
  action?: { label: string; to: string };
}

interface FeedTabCopy {
  icon: FeedTabIcon;
  /** Shown when this tab has no activity to show. */
  empty: FeedTabMessage;
  /** Shown when this tab's live fetch fails. Retry is added by the page. */
  error: Omit<FeedTabMessage, "action">;
}

/** Distinct, tab-specific empty + error copy. Each panel names what this corner
 *  of the feed is for and offers one warm way to start filling it. */
export const FEED_TAB_COPY: Record<FeedTab, FeedTabCopy> = {
  All: {
    icon: "inbox",
    empty: {
      title: "Your feed is quiet",
      description:
        "When the people and communities you follow post, gather, or welcome someone new, it lands here.",
      action: { label: "Find people to follow", to: routes.members },
    },
    error: {
      title: "Couldn't load your feed",
      description:
        "Something got in the way reaching the community. Give it another try.",
    },
  },
  Communities: {
    icon: "communities",
    empty: {
      title: "No community pulse yet",
      description:
        "Join a community and its plans, pinned notes, and conversations will gather here.",
      action: { label: "Browse communities", to: routes.communities },
    },
    error: {
      title: "Couldn't reach your communities",
      description:
        "The pulse from your communities didn't come through. Try again in a moment.",
    },
  },
  Gatherings: {
    icon: "gatherings",
    empty: {
      title: "Nothing on the calendar yet",
      description:
        "When a gathering you're part of is announced or recapped, you'll find it here.",
      action: { label: "See what's on", to: routes.gatherings },
    },
    error: {
      title: "Couldn't load gatherings",
      description: "We couldn't reach what's coming up. Give it another try.",
    },
  },
  People: {
    icon: "people",
    empty: {
      title: "No new faces yet",
      description:
        "As people you're connected to arrive or share something, they'll show up here.",
      action: { label: "Meet the community", to: routes.members },
    },
    error: {
      title: "Couldn't load new faces",
      description:
        "We couldn't reach the latest arrivals. Try again in a moment.",
    },
  },
  Posts: {
    icon: "posts",
    empty: {
      title: "Quiet in here for now",
      description:
        "Follow more people, or start the conversation yourself, and posts will fill this space.",
      action: { label: "Go to the forum", to: routes.forum },
    },
    error: {
      title: "Couldn't load posts",
      description:
        "The conversation didn't come through this time. Give it another try.",
    },
  },
};

const NEW_SLUGS = [
  "kai",
  "bilal-kaya",
  "ines-fonseca",
  "daniel-oliveira",
] as const;

export const NEW_THIS_WEEK = NEW_SLUGS.map((slug) => {
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

export const SAFETY_EMAIL = "safety@queerpulse.pt";

export interface FeedReply {
  id: string;
  author: string;
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
}

export const FEED_POST: FeedPost = {
  id: "post:gp-lisbon-gp",
  slug: "anika",
  authorName: "Anika Kovač",
  authorInitials: "AK",
  authorTint: "coral",
  time: "2 hours ago",
  context: "Trans & Non-Binary Network",
  body: "Anyone have recommendations for a queer-friendly GP in Lisbon? Preferably someone familiar with trans healthcare — I'm tired of having to explain myself from scratch every visit. Grateful for any leads, DM or reply here.",
  likeCount: 12,
  replies: [
    {
      id: "r1",
      author: "Joana P.",
      body: "Dr. Marta Reis at Clínica Arco — genuinely lovely and experienced.",
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
      body: "Following — looking for the same near Almada.",
    },
  ],
};
