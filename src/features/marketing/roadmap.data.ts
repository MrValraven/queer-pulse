/** Static roadmap content for the /about/roadmap page (mock data). */

export interface ShippedItem {
  category: string;
  name: string;
  desc: string;
  date: string;
  requested?: boolean;
}

export interface BuildingItem {
  category: string;
  name: string;
  desc: string;
  stage: string;
  eta: string;
  progress: number;
  requested?: boolean;
}

export interface PlannedItem {
  id: string;
  category: string;
  name: string;
  desc: string;
  votes: number;
  hot?: boolean;
}

export interface IdeaItem {
  text: string;
  votes: number;
}

export interface DecisionItem {
  tone: "jade" | "accent" | "plum";
  title: string;
  desc: string;
}

export const HERO_STATS: { label: string; jade?: boolean }[] = [
  { label: "12 shipped this year", jade: true },
  { label: "4 in progress" },
  { label: "5 planned" },
];

export const SHIPPED: ShippedItem[] = [
  {
    category: "Gatherings",
    name: "Gathering dashboard",
    desc: "Live check-in and attendance management for hosts, including QR scanning and waitlist promotion.",
    date: "May 2026",
  },
  {
    category: "Safety",
    name: "Moderation queue",
    desc: "Internal tools for reviewing member reports, assigning cases, and issuing decisions.",
    date: "Apr 2026",
    requested: true,
  },
  {
    category: "Members",
    name: "Connection requests",
    desc: "Send, receive, accept and decline connection requests. Mutual connections view included.",
    date: "Mar 2026",
  },
  {
    category: "Community",
    name: "Badges & levels",
    desc: "XP system, earned badges, member perks, and a redeem page for level bonuses.",
    date: "Jun 2026",
    requested: true,
  },
  {
    category: "Gatherings",
    name: "RSVP ticket",
    desc: "Shareable post-RSVP confirmation with QR code, calendar integration, and waitlist state.",
    date: "May 2026",
  },
];

export const BUILDING: BuildingItem[] = [
  {
    category: "Platform",
    name: "Mobile app beta",
    desc: "iOS and Android apps, starting with gatherings and messaging. Beta invites go to Level 4+ members first.",
    stage: "In progress",
    eta: "~Q3 2026",
    progress: 60,
  },
  {
    category: "Content",
    name: "Magazine contributor tools",
    desc: "Drafting, editing, and publishing tools so members can write for the magazine directly.",
    stage: "In progress",
    eta: "~Q3 2026",
    progress: 35,
    requested: true,
  },
  {
    category: "Gatherings",
    name: "Map view for gatherings",
    desc: "Browse upcoming events on a city map. Filter by date, type, and distance.",
    stage: "Early design",
    eta: "~Q4 2026",
    progress: 20,
  },
  {
    category: "Community",
    name: "Shared housing board",
    desc: "A dedicated space for queer-safe housing listings and flatmate search, separate from the main feed.",
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
    desc: "A curated directory of queer-owned and affirming businesses in Lisbon and beyond.",
    votes: 142,
    hot: true,
  },
  {
    id: "anon-qa",
    category: "Members",
    name: "Anonymous Q&A threads",
    desc: "Ask questions anonymously within communities. No names — just honest answers.",
    votes: 98,
  },
  {
    id: "group-messaging",
    category: "Messaging",
    name: "Group messaging",
    desc: "Create threads with multiple members — for planning gatherings, projects, or just chatting.",
    votes: 76,
  },
  {
    id: "reading-groups",
    category: "Content",
    name: "Reading groups",
    desc: "Structured book and article reading groups with discussion threads and a shared reading schedule.",
    votes: 54,
  },
  {
    id: "offline-archive",
    category: "Platform",
    name: "Offline archive",
    desc: "Download your posts, connections, and data in a portable format. Your history, yours to keep.",
    votes: 41,
  },
];

export const TOP_IDEAS: IdeaItem[] = [
  { text: "Event reminders via SMS", votes: 34 },
  { text: "Dark mode", votes: 29 },
  { text: "Sub-communities within communities", votes: 22 },
  { text: "Recurring gatherings (monthly series)", votes: 18 },
  { text: "Shared event costs / ticket splitting", votes: 15 },
];

export const DECISIONS: DecisionItem[] = [
  {
    tone: "jade",
    title: "Member votes",
    desc: "The features you vote for rise to the top. We look at this weekly.",
  },
  {
    tone: "accent",
    title: "Safety first",
    desc: "Every feature is reviewed for how it could be misused in a community like this.",
  },
  {
    tone: "plum",
    title: "Small team, careful pace",
    desc: "We're two engineers and a designer. We'd rather build slowly and get it right.",
  },
];
