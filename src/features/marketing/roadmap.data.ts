/** Static roadmap content for the /about/roadmap page (mock data). */

/** The most recent target-date move for a committed card — a public-safe
 *  reason only (no who/when — those stay admin-only). Matches the backend's
 *  `SlipDTO` in `roadmap-response.ts`. */
export interface RoadmapSlip {
  from: string;
  to: string;
  reason: string;
}

export interface ShippedItem {
  id: string;
  category: string;
  name: string;
  description: string;
  date: string;
  requested?: boolean;
  committed?: boolean;
  latestSlip?: RoadmapSlip | null;
}

export interface BuildingItem {
  id: string;
  category: string;
  name: string;
  description: string;
  stage: string;
  eta: string;
  progress: number;
  requested?: boolean;
  committed?: boolean;
  latestSlip?: RoadmapSlip | null;
  /** Optional bullet list of the sub-features this item will bring — used for
   *  a bundled surface (e.g. the Work & Economy hub) where one card stands in
   *  for a whole cluster of pages. */
  features?: string[];
}

export interface PlannedItem {
  id: string;
  category: string;
  name: string;
  description: string;
  votes: number;
  hot?: boolean;
  committed?: boolean;
  latestSlip?: RoadmapSlip | null;
}

/** "Someday" — public backlog-column items, same shape as `PlannedItem`. */
export type BacklogItem = PlannedItem;

export interface IdeaItem {
  id: string;
  text: string;
  votes: number;
}

/** Closed set of member-facing reasons an idea isn't being built — mirrors
 *  the backend's `RoadmapDeclineReason`. */
export type RoadmapDeclineReason =
  "scope" | "unsafe" | "capacity" | "exists" | "harm";

/** A dismissed idea whose decline reason is member-facing — "Not building
 *  this, and why" on the public page. */
export interface NotBuildingItem {
  id: string;
  category: string;
  reason: RoadmapDeclineReason;
  note: string;
  votes: number;
}

export const HERO_STATS: {
  label: string;
  value?: string;
  note?: string;
  jade?: boolean;
}[] = [
  {
    label: "12 shipped this year",
    value: "12",
    note: "since launch",
    jade: true,
  },
  { label: "5 in progress", value: "5", note: "building now" },
  { label: "5 planned", value: "5", note: "next up" },
];

export const SHIPPED: ShippedItem[] = [
  {
    id: "gathering-dashboard",
    category: "Gatherings",
    name: "Gathering dashboard",
    description:
      "Live check-in and attendance management for hosts, including QR scanning and waitlist promotion.",
    date: "May 2026",
    committed: true,
  },
  {
    id: "moderation-queue",
    category: "Safety",
    name: "Moderation queue",
    description:
      "Internal tools for reviewing member reports, assigning cases, and issuing decisions.",
    date: "Apr 2026",
    requested: true,
  },
  {
    id: "connection-requests",
    category: "Members",
    name: "Connection requests",
    description:
      "Send, receive, accept and decline connection requests. Mutual connections view included.",
    date: "Mar 2026",
  },
  {
    id: "badges-levels",
    category: "Community",
    name: "Badges & levels",
    description:
      "XP system, earned badges, member perks, and a redeem page for level bonuses.",
    date: "Jun 2026",
    requested: true,
  },
  {
    id: "rsvp-ticket",
    category: "Gatherings",
    name: "RSVP ticket",
    description:
      "Shareable post-RSVP confirmation with QR code, calendar integration, and waitlist state.",
    date: "May 2026",
  },
];

export const BUILDING: BuildingItem[] = [
  {
    id: "work-and-economy",
    category: "Work & Economy",
    name: "Work & Economy hub",
    description:
      "A home for queer work and mutual aid: find jobs, mentors and grants, swap skills, and price your freelance work fairly. We're finishing it now and will open it soon.",
    stage: "Coming soon",
    eta: "~Q4 2026",
    progress: 25,
    features: [
      "Job Board with queer-affirming employers",
      "Skills & Learning workshops",
      "Mentorship matching",
      "Employer Reviews from the community",
      "Skills Exchange for bartering time and talent",
      "Solidarity Pricing tools",
      "Grants for queer projects",
      "How our economy works, explained",
      "Offer a skill to the community",
      "Your Work, a personal workspace",
    ],
  },
  {
    id: "mobile-app-beta",
    category: "Platform",
    name: "Mobile app beta",
    description:
      "iOS and Android apps, starting with gatherings and messaging. Beta invites go to Level 4+ members first.",
    stage: "In progress",
    eta: "~Q3 2026",
    progress: 60,
    committed: true,
    latestSlip: {
      from: "Q2 2026",
      to: "Q3 2026",
      reason:
        "App Store review took longer than planned: wanted a stable build before opening the beta wider.",
    },
  },
  {
    id: "magazine-contributor-tools",
    category: "Content",
    name: "Magazine contributor tools",
    description:
      "Drafting, editing, and publishing tools so members can write for the magazine directly.",
    stage: "In progress",
    eta: "~Q3 2026",
    progress: 35,
    requested: true,
  },
  {
    id: "map-view-gatherings",
    category: "Gatherings",
    name: "Map view for gatherings",
    description:
      "Browse upcoming events on a city map. Filter by date, type, and distance.",
    stage: "Early design",
    eta: "~Q4 2026",
    progress: 20,
  },
  {
    id: "shared-housing-board",
    category: "Community",
    name: "Shared housing board",
    description:
      "A dedicated space for queer-safe housing listings and flatmate search, separate from the main feed.",
    stage: "Research",
    eta: "~Q4 2026",
    progress: 15,
    requested: true,
  },
];

export const PLANNED: PlannedItem[] = [
  {
    id: "business-directory",
    category: "Community",
    name: "Queer business directory",
    description:
      "A curated directory of queer-owned and affirming businesses in Lisbon and beyond.",
    votes: 142,
    hot: true,
    committed: true,
  },
  {
    id: "anon-qa",
    category: "Members",
    name: "Anonymous Q&A threads",
    description:
      "Ask questions anonymously within communities. No names, just honest answers.",
    votes: 98,
  },
  {
    id: "group-messaging",
    category: "Messaging",
    name: "Group messaging",
    description:
      "Create threads with multiple members, for planning gatherings, projects, or just chatting.",
    votes: 76,
  },
  {
    id: "reading-groups",
    category: "Content",
    name: "Reading groups",
    description:
      "Structured book and article reading groups with discussion threads and a shared reading schedule.",
    votes: 54,
  },
  {
    id: "offline-archive",
    category: "Platform",
    name: "Offline archive",
    description:
      "Download your posts, connections, and data in a portable format. Your history, yours to keep.",
    votes: 41,
  },
];

export const TOP_IDEAS: IdeaItem[] = [
  { id: "idea-sms", text: "Event reminders via SMS", votes: 34 },
  { id: "idea-dark-mode", text: "Dark mode", votes: 29 },
  {
    id: "idea-sub-communities",
    text: "Sub-communities within communities",
    votes: 22,
  },
  {
    id: "idea-recurring-gatherings",
    text: "Recurring gatherings (monthly series)",
    votes: 18,
  },
  {
    id: "idea-ticket-splitting",
    text: "Shared event costs / ticket splitting",
    votes: 15,
  },
];

// "Someday" — public backlog-column items, further out than PLANNED with no
// firm votes-driven order yet.
export const BACKLOG: BacklogItem[] = [
  {
    id: "creator-tipping",
    category: "Content",
    name: "Creator tipping",
    description:
      "Let members send small optional tips to magazine contributors and gathering hosts.",
    votes: 19,
  },
  {
    id: "multi-language-ui",
    category: "Platform",
    name: "Multi-language interface",
    description:
      "Beyond EN/PT: community-sourced translations for the whole app, every screen beyond the marketing pages.",
    votes: 12,
  },
];

// "Not building this, and why" — dismissed ideas the team gave a
// member-facing reason for declining, kept public for transparency.
export const NOT_BUILDING: NotBuildingItem[] = [
  {
    id: "not-public-profiles",
    category: "Members",
    reason: "unsafe",
    note: "Public profiles searchable outside the platform would undermine the safety model this community depends on.",
    votes: 23,
  },
  {
    id: "not-dating-features",
    category: "Members",
    reason: "scope",
    note: "General dating features are out of scope. QueerPulse focuses on community and connection.",
    votes: 41,
  },
];
