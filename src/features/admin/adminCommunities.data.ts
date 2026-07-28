import type { AvatarTone } from "./ui";

export type BadgeTone = "plum" | "coral" | "jade" | "violet" | "amber";
export type Visibility = "private" | "public" | "network";

// ── Health colour, card scale ───────────────────────────────────────────────
// ≥90 jade · ≥78 amber · else coral (accent-ink)
export function healthColor(score: number): string {
  if (score >= 90) return "var(--jade)";
  if (score >= 78) return "var(--amber)";
  return "var(--accent-ink)";
}

// ── Health colour, breakdown scale (per-signal) ─────────────────────────────
// ≥85 jade · ≥70 amber · else coral
export function breakdownColor(score: number): string {
  if (score >= 85) return "var(--jade)";
  if (score >= 70) return "var(--amber)";
  return "var(--accent-ink)";
}

/** Returns an `admin:communities.health.narrative.*` catalog key — resolve with `t()`. */
export function breakdownNarrativeKey(score: number): string {
  if (score >= 90) return "communities.health.narrative.strong";
  if (score >= 78) return "communities.health.narrative.healthy";
  return "communities.health.narrative.dragging";
}

/** The four health signals, in breakdown[] order, with name/description catalog keys — resolve with `t()`. */
export const BREAKDOWN_META: {
  id: string;
  nameKey: string;
  descriptionKey: string;
}[] = [
  {
    id: "memberActivity",
    nameKey: "communities.health.breakdown.memberActivity.name",
    descriptionKey: "communities.health.breakdown.memberActivity.desc",
  },
  {
    id: "reportResolution",
    nameKey: "communities.health.breakdown.reportResolution.name",
    descriptionKey: "communities.health.breakdown.reportResolution.desc",
  },
  {
    id: "memberSentiment",
    nameKey: "communities.health.breakdown.memberSentiment.name",
    descriptionKey: "communities.health.breakdown.memberSentiment.desc",
  },
  {
    id: "safetyLoad",
    nameKey: "communities.health.breakdown.safetyLoad.name",
    descriptionKey: "communities.health.breakdown.safetyLoad.desc",
  },
];

export type Severity = "danger" | "coral" | "amber" | "jade";

export interface QueueItem {
  severity: Severity;
  categoryTone: "danger" | "coral" | "amber" | "jade" | "violet";
  categoryLabel: string;
  title: string;
  meta: string;
}

export interface Moderator {
  initials: string;
  name: string;
  pronouns: string;
  tone: AvatarTone;
  /** Sub-line, e.g. "founded the community · 21 vouches". */
  role: string;
}

export interface Community {
  slug: string;
  name: string;
  initials: string;
  tone: BadgeTone;
  tag: string;
  description: string;
  members: string;
  activity: string;
  activePercent: number;
  reports: number;
  resolvedPercent: number;
  health: number;
  founded: string;
  spark: number[];
  /**
   * [activity, resolution, sentiment, safety] — positionally paired with
   * BREAKDOWN_META. Sentiment is null until something on the platform actually
   * measures it; the modal renders that as "not measured yet" rather than a
   * score nobody computed.
   */
  breakdown: [number, number, number | null, number];
  join: string;
  code: string;
  visibility: Visibility;
  support: boolean;
  moderators: Moderator[];
  queue: QueueItem[];
}

const VIS_LABEL_KEY: Record<Visibility, string> = {
  private: "communities.settings.visibility.private",
  public: "communities.settings.visibility.public",
  network: "communities.settings.visibility.network",
};
/** Returns an `admin:communities.settings.visibility.*` catalog key — resolve with `t()`. */
export function visLabelKey(v: Visibility): string {
  return VIS_LABEL_KEY[v];
}

/** "Inês Martins" → "Inês M." */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  return `${parts[0]} ${parts[parts.length - 1]![0]}.`;
}

/** First given name only. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0]!;
}

export const COMMUNITIES: Community[] = [
  {
    slug: "trans-friends",
    name: "Trans & Friends",
    initials: "TR",
    tone: "jade",
    tag: "Peer support · private",
    description: "A peer-support and friendship space for trans, non-binary and questioning members.",
    members: "1,204",
    activity: "High",
    activePercent: 68,
    reports: 1,
    resolvedPercent: 100,
    health: 94,
    founded: "Mar 2023",
    spark: [5, 6, 5, 7, 6, 8, 7, 9],
    breakdown: [91, 100, null, 90],
    join: "Vouch-gated · 2 vouches",
    code: "Platform Code of Care + 2 additions on deadnaming",
    visibility: "private",
    support: false,
    moderators: [
      {
        initials: "IM",
        name: "Inês Martins",
        pronouns: "she/her",
        tone: "jade",
        role: "founded the community · 21 vouches",
      },
      {
        initials: "SA",
        name: "Sofia Almeida",
        pronouns: "she/they",
        tone: "amber",
        role: "mutual aid lead · 14 vouches",
      },
      {
        initials: "DO",
        name: "Devon Okoro",
        pronouns: "they/them",
        tone: "coral",
        role: "8 vouches",
      },
    ],
    queue: [
      {
        severity: "coral",
        categoryTone: "coral",
        categoryLabel: "Harassment",
        title: "Repeated unwanted DMs after being asked to stop",
        meta: "Reported by Sofia D. · about a member with 4 prior reports · 3h ago",
      },
    ],
  },
  {
    slug: "queer-creatives",
    name: "Queer Creatives",
    initials: "QC",
    tone: "violet",
    tag: "Artists & makers",
    description: "A network for queer artists, designers and makers to share work and collaborate.",
    members: "842",
    activity: "Active",
    activePercent: 54,
    reports: 2,
    resolvedPercent: 96,
    health: 88,
    founded: "May 2023",
    spark: [4, 5, 6, 5, 7, 6, 8, 7],
    breakdown: [82, 96, null, 84],
    join: "Open · with a portfolio",
    code: "Platform Code of Care",
    visibility: "network",
    support: false,
    moderators: [
      {
        initials: "DO",
        name: "Devon Okoro",
        pronouns: "they/them",
        tone: "coral",
        role: "illustrator · 8 vouches",
      },
      {
        initials: "KS",
        name: "Kai Sousa",
        pronouns: "xe/xem",
        tone: "plum",
        role: "DJ · 5 vouches",
      },
    ],
    queue: [
      {
        severity: "amber",
        categoryTone: "violet",
        categoryLabel: "Vouch-abuse",
        title: "A cluster of accounts vouching for each other",
        meta: "System flag · 5 accounts · 5h ago",
      },
      {
        severity: "coral",
        categoryTone: "coral",
        categoryLabel: "Harassment",
        title: "Misgendering after repeated correction",
        meta: "Reported by Devon O. · 4h ago",
      },
    ],
  },
  {
    slug: "lisbon-queers",
    name: "Lisbon Queers",
    initials: "LQ",
    tone: "coral",
    tag: "City-wide · public",
    description: "The big public square — anyone in Lisbon can join. High traffic, and the hardest to keep warm.",
    members: "3,180",
    activity: "Busy",
    activePercent: 72,
    reports: 6,
    resolvedPercent: 84,
    health: 71,
    founded: "Jan 2023",
    spark: [8, 7, 9, 8, 10, 9, 11, 10],
    breakdown: [88, 84, null, 58],
    join: "Open · public",
    code: "Platform Code of Care",
    visibility: "public",
    support: true,
    moderators: [
      {
        initials: "TM",
        name: "Théo Mendes",
        pronouns: "he/him",
        tone: "violet",
        role: "community organiser · stretched thin",
      },
    ],
    queue: [
      {
        severity: "danger",
        categoryTone: "danger",
        categoryLabel: "Outing / doxxing",
        title: "A member's private trans status was posted publicly",
        meta: "Anonymous · Emergency · 26m ago",
      },
      {
        severity: "coral",
        categoryTone: "amber",
        categoryLabel: "Spam",
        title: "Crypto promo links across 6 threads",
        meta: "3 reporters · 8h ago",
      },
      {
        severity: "amber",
        categoryTone: "amber",
        categoryLabel: "Spam",
        title: "Repost bot flooding #housing",
        meta: "System flag · 6h ago",
      },
    ],
  },
  {
    slug: "newly-arrived",
    name: "Newly Arrived",
    initials: "NA",
    tone: "jade",
    tag: "Migrants & arrivals",
    description: "A soft landing for queer people new to Lisbon — housing, paperwork, friendship.",
    members: "410",
    activity: "Growing",
    activePercent: 61,
    reports: 0,
    resolvedPercent: 100,
    health: 96,
    founded: "Sep 2024",
    spark: [2, 3, 3, 4, 4, 5, 6, 7],
    breakdown: [78, 100, null, 100],
    join: "Open · with a welcome chat",
    code: "Platform Code of Care",
    visibility: "network",
    support: false,
    moderators: [
      {
        initials: "MK",
        name: "Marsh K.",
        pronouns: "she/her",
        tone: "jade",
        role: "newcomer buddy · 6 vouches",
      },
    ],
    queue: [],
  },
  {
    slug: "trans-healthcare",
    name: "Trans Healthcare",
    initials: "TH",
    tone: "jade",
    tag: "Navigators · support",
    description: "Members sharing trusted clinics, hormone resources and healthcare navigation.",
    members: "560",
    activity: "Steady",
    activePercent: 49,
    reports: 0,
    resolvedPercent: 100,
    health: 92,
    founded: "Feb 2024",
    spark: [3, 4, 3, 4, 4, 5, 4, 5],
    breakdown: [74, 100, null, 100],
    join: "Vouch-gated · 1 vouch",
    code: "Platform Code of Care + medical-privacy rules",
    visibility: "private",
    support: false,
    moderators: [
      {
        initials: "SA",
        name: "Sofia Almeida",
        pronouns: "she/they",
        tone: "amber",
        role: "nurse · 14 vouches",
      },
    ],
    queue: [],
  },
  {
    slug: "nightlife-afters",
    name: "Nightlife & Afters",
    initials: "NF",
    tone: "violet",
    tag: "Events · high traffic",
    description: "Where the parties, afters and DJ line-ups get shared. Fast, loud, occasionally messy.",
    members: "1,640",
    activity: "Spiky",
    activePercent: 80,
    reports: 3,
    resolvedPercent: 88,
    health: 79,
    founded: "Apr 2023",
    spark: [6, 9, 5, 10, 6, 11, 7, 9],
    breakdown: [94, 88, null, 66],
    join: "Open · public",
    code: "Platform Code of Care + consent guidelines",
    visibility: "public",
    support: true,
    moderators: [
      {
        initials: "KS",
        name: "Kai Sousa",
        pronouns: "xe/xem",
        tone: "plum",
        role: "DJ · 5 vouches",
      },
    ],
    queue: [
      {
        severity: "amber",
        categoryTone: "amber",
        categoryLabel: "Spam",
        title: "Ticket-scalping links in event threads",
        meta: "2 reporters · 5h ago",
      },
      {
        severity: "coral",
        categoryTone: "coral",
        categoryLabel: "Harassment",
        title: "Unwanted advances reported in a thread",
        meta: "Reported by a member · 9h ago",
      },
      {
        severity: "jade",
        categoryTone: "jade",
        categoryLabel: "Off-topic",
        title: "A noise complaint about an after",
        meta: "Reported · 12h ago",
      },
    ],
  },
  {
    slug: "elders-memory",
    name: "Elders & Memory",
    initials: "EM",
    tone: "amber",
    tag: "Intergenerational",
    description: "Older members and memory-keepers holding queer history and mentorship.",
    members: "220",
    activity: "Calm",
    activePercent: 43,
    reports: 0,
    resolvedPercent: 100,
    health: 98,
    founded: "Nov 2023",
    spark: [2, 2, 3, 2, 3, 3, 2, 3],
    breakdown: [68, 100, null, 100],
    join: "Vouch-gated · 1 vouch",
    code: "Platform Code of Care",
    visibility: "private",
    support: false,
    moderators: [
      {
        initials: "LB",
        name: "Lurdes B.",
        pronouns: "she/her",
        tone: "amber",
        role: "elder · memory-keeper",
      },
    ],
    queue: [],
  },
  {
    slug: "mutual-aid-lisbon",
    name: "Mutual Aid Lisbon",
    initials: "MA",
    tone: "coral",
    tag: "Solidarity & care",
    description: "Practical solidarity — fund drives, surplus sharing, crisis support.",
    members: "980",
    activity: "Active",
    activePercent: 58,
    reports: 1,
    resolvedPercent: 97,
    health: 90,
    founded: "Jun 2023",
    spark: [5, 5, 6, 6, 5, 7, 6, 7],
    breakdown: [80, 97, null, 90],
    join: "Open · with a welcome chat",
    code: "Platform Code of Care",
    visibility: "network",
    support: false,
    moderators: [
      {
        initials: "SA",
        name: "Sofia Almeida",
        pronouns: "she/they",
        tone: "amber",
        role: "mutual aid lead",
      },
    ],
    queue: [
      {
        severity: "jade",
        categoryTone: "jade",
        categoryLabel: "Off-topic",
        title: "Self-promotion in a support thread",
        meta: "Reported by Kai S. · 11h ago",
      },
    ],
  },
];
