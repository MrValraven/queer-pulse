import { MEMBERS, memberName } from "../members/data/members";

export const FEED_TABS = [
  "All",
  "Communities",
  "Gatherings",
  "People",
  "Posts",
] as const;
export type FeedTab = (typeof FEED_TABS)[number];

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
