/** Static roadmap content for the /about/roadmap page (mock data). */

export interface ShippedItem {
  id: string;
  category: string;
  name: string;
  description: string;
  date: string;
  requested?: boolean;
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
}

export interface PlannedItem {
  id: string;
  category: string;
  name: string;
  description: string;
  votes: number;
  hot?: boolean;
}

export interface IdeaItem {
  id: string;
  text: string;
  votes: number;
}

export interface DecisionItem {
  tone: "jade" | "accent" | "plum";
  title: string;
  description: string;
}

export const HERO_STATS: { label: string; jade?: boolean }[] = [
  { label: "12 shipped this year", jade: true },
  { label: "4 in progress" },
  { label: "5 planned" },
];

export const SHIPPED: ShippedItem[] = [
  {
    id: "gathering-dashboard",
    category: "Gatherings",
    name: "Gathering dashboard",
    description: "Live check-in and attendance management for hosts, including QR scanning and waitlist promotion.",
    date: "May 2026",
  },
  {
    id: "moderation-queue",
    category: "Safety",
    name: "Moderation queue",
    description: "Internal tools for reviewing member reports, assigning cases, and issuing decisions.",
    date: "Apr 2026",
    requested: true,
  },
  {
    id: "connection-requests",
    category: "Members",
    name: "Connection requests",
    description: "Send, receive, accept and decline connection requests. Mutual connections view included.",
    date: "Mar 2026",
  },
  {
    id: "badges-levels",
    category: "Community",
    name: "Badges & levels",
    description: "XP system, earned badges, member perks, and a redeem page for level bonuses.",
    date: "Jun 2026",
    requested: true,
  },
  {
    id: "rsvp-ticket",
    category: "Gatherings",
    name: "RSVP ticket",
    description: "Shareable post-RSVP confirmation with QR code, calendar integration, and waitlist state.",
    date: "May 2026",
  },
];

export const BUILDING: BuildingItem[] = [
  {
    id: "mobile-app-beta",
    category: "Platform",
    name: "Mobile app beta",
    description: "iOS and Android apps, starting with gatherings and messaging. Beta invites go to Level 4+ members first.",
    stage: "In progress",
    eta: "~Q3 2026",
    progress: 60,
  },
  {
    id: "magazine-contributor-tools",
    category: "Content",
    name: "Magazine contributor tools",
    description: "Drafting, editing, and publishing tools so members can write for the magazine directly.",
    stage: "In progress",
    eta: "~Q3 2026",
    progress: 35,
    requested: true,
  },
  {
    id: "map-view-gatherings",
    category: "Gatherings",
    name: "Map view for gatherings",
    description: "Browse upcoming events on a city map. Filter by date, type, and distance.",
    stage: "Early design",
    eta: "~Q4 2026",
    progress: 20,
  },
  {
    id: "shared-housing-board",
    category: "Community",
    name: "Shared housing board",
    description: "A dedicated space for queer-safe housing listings and flatmate search, separate from the main feed.",
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
    description: "A curated directory of queer-owned and affirming businesses in Lisbon and beyond.",
    votes: 142,
    hot: true,
  },
  {
    id: "anon-qa",
    category: "Members",
    name: "Anonymous Q&A threads",
    description: "Ask questions anonymously within communities. No names — just honest answers.",
    votes: 98,
  },
  {
    id: "group-messaging",
    category: "Messaging",
    name: "Group messaging",
    description: "Create threads with multiple members — for planning gatherings, projects, or just chatting.",
    votes: 76,
  },
  {
    id: "reading-groups",
    category: "Content",
    name: "Reading groups",
    description: "Structured book and article reading groups with discussion threads and a shared reading schedule.",
    votes: 54,
  },
  {
    id: "offline-archive",
    category: "Platform",
    name: "Offline archive",
    description: "Download your posts, connections, and data in a portable format. Your history, yours to keep.",
    votes: 41,
  },
];

export const TOP_IDEAS: IdeaItem[] = [
  { id: "idea-sms", text: "Event reminders via SMS", votes: 34 },
  { id: "idea-dark-mode", text: "Dark mode", votes: 29 },
  { id: "idea-sub-communities", text: "Sub-communities within communities", votes: 22 },
  { id: "idea-recurring-gatherings", text: "Recurring gatherings (monthly series)", votes: 18 },
  { id: "idea-ticket-splitting", text: "Shared event costs / ticket splitting", votes: 15 },
];

export const DECISIONS: DecisionItem[] = [
  {
    tone: "jade",
    title: "Member votes",
    description: "The features you vote for rise to the top. We look at this weekly.",
  },
  {
    tone: "accent",
    title: "Safety first",
    description: "Every feature is reviewed for how it could be misused in a community like this.",
  },
  {
    tone: "plum",
    title: "Small team, careful pace",
    description: "We're two engineers and a designer. We'd rather build slowly and get it right.",
  },
];
