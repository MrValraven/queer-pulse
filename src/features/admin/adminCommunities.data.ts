import type { AvatarTone } from './ui'

export type BadgeTone = 'plum' | 'coral' | 'jade' | 'violet' | 'amber'
export type Visibility = 'private' | 'public' | 'network'

// ── Health colour, card scale ───────────────────────────────────────────────
// ≥90 jade · ≥78 amber · else coral (accent-ink)
export function healthColor(score: number): string {
  if (score >= 90) return 'var(--jade)'
  if (score >= 78) return 'var(--amber)'
  return 'var(--accent-ink)'
}

// ── Health colour, breakdown scale (per-signal) ─────────────────────────────
// ≥85 jade · ≥70 amber · else coral
export function breakdownColor(score: number): string {
  if (score >= 85) return 'var(--jade)'
  if (score >= 70) return 'var(--amber)'
  return 'var(--accent-ink)'
}

export function breakdownNarrative(score: number): string {
  if (score >= 90)
    return "A strong, balanced score. Nothing here needs your attention — keep doing what works."
  if (score >= 78) return "Healthy overall, with one or two areas worth a gentle eye."
  return "Sentiment and safety load are dragging the score down. This is exactly where a little staff support goes a long way."
}

/** The four health signals, in bd[] order, with name + description. */
export const BREAKDOWN_META: { name: string; desc: string }[] = [
  { name: 'Member activity', desc: 'How alive the space feels — posts, replies, attendance' },
  { name: 'Report resolution', desc: 'Share of reports resolved within the SLA' },
  { name: 'Member sentiment', desc: 'Quiet pulse-check surveys and reaction signals' },
  { name: 'Safety load', desc: 'Inverse of harm reports relative to size' },
]

export type Severity = 'danger' | 'coral' | 'amber' | 'jade'

export interface QueueItem {
  sev: Severity
  catTone: 'danger' | 'coral' | 'amber' | 'jade' | 'violet'
  catLabel: string
  title: string
  meta: string
}

export interface Moderator {
  initials: string
  name: string
  pronouns: string
  tone: AvatarTone
  /** Sub-line, e.g. "founded the community · 21 vouches". */
  role: string
}

export interface Community {
  slug: string
  name: string
  initials: string
  tone: BadgeTone
  tag: string
  desc: string
  members: string
  activity: string
  activePct: number
  reports: number
  resolvedPct: number
  health: number
  founded: string
  spark: number[]
  /** [activity, resolution, sentiment, safety] */
  bd: [number, number, number, number]
  join: string
  code: string
  vis: Visibility
  support: boolean
  mods: Moderator[]
  queue: QueueItem[]
}

const VIS_LABEL: Record<Visibility, string> = {
  private: 'Private',
  public: 'Public',
  network: 'Network-only',
}
export function visLabel(v: Visibility): string {
  return VIS_LABEL[v]
}

/** "Inês Martins" → "Inês M." */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) return name
  return `${parts[0]} ${parts[parts.length - 1]![0]}.`
}

/** First given name only. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0]!
}

export const COMMUNITIES: Community[] = [
  {
    slug: 'trans-friends',
    name: 'Trans & Friends',
    initials: 'TR',
    tone: 'jade',
    tag: 'Peer support · private',
    desc: 'A peer-support and friendship space for trans, non-binary and questioning members.',
    members: '1,204',
    activity: 'High',
    activePct: 68,
    reports: 1,
    resolvedPct: 100,
    health: 94,
    founded: 'Mar 2023',
    spark: [5, 6, 5, 7, 6, 8, 7, 9],
    bd: [91, 100, 95, 90],
    join: 'Vouch-gated · 2 vouches',
    code: 'Platform Code of Care + 2 additions on deadnaming',
    vis: 'private',
    support: false,
    mods: [
      { initials: 'IM', name: 'Inês Martins', pronouns: 'she/her', tone: 'jade', role: 'founded the community · 21 vouches' },
      { initials: 'SA', name: 'Sofia Almeida', pronouns: 'she/they', tone: 'amber', role: 'mutual aid lead · 14 vouches' },
      { initials: 'DO', name: 'Devon Okoro', pronouns: 'they/them', tone: 'coral', role: '8 vouches' },
    ],
    queue: [
      {
        sev: 'coral',
        catTone: 'coral',
        catLabel: 'Harassment',
        title: 'Repeated unwanted DMs after being asked to stop',
        meta: 'Reported by Sofia D. · about a member with 4 prior reports · 3h ago',
      },
    ],
  },
  {
    slug: 'queer-creatives',
    name: 'Queer Creatives',
    initials: 'QC',
    tone: 'violet',
    tag: 'Artists & makers',
    desc: 'A network for queer artists, designers and makers to share work and collaborate.',
    members: '842',
    activity: 'Active',
    activePct: 54,
    reports: 2,
    resolvedPct: 96,
    health: 88,
    founded: 'May 2023',
    spark: [4, 5, 6, 5, 7, 6, 8, 7],
    bd: [82, 96, 88, 84],
    join: 'Open · with a portfolio',
    code: 'Platform Code of Care',
    vis: 'network',
    support: false,
    mods: [
      { initials: 'DO', name: 'Devon Okoro', pronouns: 'they/them', tone: 'coral', role: 'illustrator · 8 vouches' },
      { initials: 'KS', name: 'Kai Sousa', pronouns: 'xe/xem', tone: 'plum', role: 'DJ · 5 vouches' },
    ],
    queue: [
      {
        sev: 'amber',
        catTone: 'violet',
        catLabel: 'Vouch-abuse',
        title: 'A cluster of accounts vouching for each other',
        meta: 'System flag · 5 accounts · 5h ago',
      },
      {
        sev: 'coral',
        catTone: 'coral',
        catLabel: 'Harassment',
        title: 'Misgendering after repeated correction',
        meta: 'Reported by Devon O. · 4h ago',
      },
    ],
  },
  {
    slug: 'lisbon-queers',
    name: 'Lisbon Queers',
    initials: 'LQ',
    tone: 'coral',
    tag: 'City-wide · public',
    desc: 'The big public square — anyone in Lisbon can join. High traffic, and the hardest to keep warm.',
    members: '3,180',
    activity: 'Busy',
    activePct: 72,
    reports: 6,
    resolvedPct: 84,
    health: 71,
    founded: 'Jan 2023',
    spark: [8, 7, 9, 8, 10, 9, 11, 10],
    bd: [88, 84, 62, 58],
    join: 'Open · public',
    code: 'Platform Code of Care',
    vis: 'public',
    support: true,
    mods: [
      { initials: 'TM', name: 'Théo Mendes', pronouns: 'he/him', tone: 'violet', role: 'community organiser · stretched thin' },
    ],
    queue: [
      {
        sev: 'danger',
        catTone: 'danger',
        catLabel: 'Outing / doxxing',
        title: "A member's private trans status was posted publicly",
        meta: 'Anonymous · Emergency · 26m ago',
      },
      {
        sev: 'coral',
        catTone: 'amber',
        catLabel: 'Spam',
        title: 'Crypto promo links across 6 threads',
        meta: '3 reporters · 8h ago',
      },
      {
        sev: 'amber',
        catTone: 'amber',
        catLabel: 'Spam',
        title: 'Repost bot flooding #housing',
        meta: 'System flag · 6h ago',
      },
    ],
  },
  {
    slug: 'newly-arrived',
    name: 'Newly Arrived',
    initials: 'NA',
    tone: 'jade',
    tag: 'Migrants & arrivals',
    desc: 'A soft landing for queer people new to Lisbon — housing, paperwork, friendship.',
    members: '410',
    activity: 'Growing',
    activePct: 61,
    reports: 0,
    resolvedPct: 100,
    health: 96,
    founded: 'Sep 2024',
    spark: [2, 3, 3, 4, 4, 5, 6, 7],
    bd: [78, 100, 98, 100],
    join: 'Open · with a welcome chat',
    code: 'Platform Code of Care',
    vis: 'network',
    support: false,
    mods: [
      { initials: 'MK', name: 'Marsh K.', pronouns: 'she/her', tone: 'jade', role: 'newcomer buddy · 6 vouches' },
    ],
    queue: [],
  },
  {
    slug: 'trans-healthcare',
    name: 'Trans Healthcare',
    initials: 'TH',
    tone: 'jade',
    tag: 'Navigators · support',
    desc: 'Members sharing trusted clinics, hormone resources and healthcare navigation.',
    members: '560',
    activity: 'Steady',
    activePct: 49,
    reports: 0,
    resolvedPct: 100,
    health: 92,
    founded: 'Feb 2024',
    spark: [3, 4, 3, 4, 4, 5, 4, 5],
    bd: [74, 100, 96, 100],
    join: 'Vouch-gated · 1 vouch',
    code: 'Platform Code of Care + medical-privacy rules',
    vis: 'private',
    support: false,
    mods: [
      { initials: 'SA', name: 'Sofia Almeida', pronouns: 'she/they', tone: 'amber', role: 'nurse · 14 vouches' },
    ],
    queue: [],
  },
  {
    slug: 'nightlife-afters',
    name: 'Nightlife & Afters',
    initials: 'NF',
    tone: 'violet',
    tag: 'Events · high traffic',
    desc: 'Where the parties, afters and DJ line-ups get shared. Fast, loud, occasionally messy.',
    members: '1,640',
    activity: 'Spiky',
    activePct: 80,
    reports: 3,
    resolvedPct: 88,
    health: 79,
    founded: 'Apr 2023',
    spark: [6, 9, 5, 10, 6, 11, 7, 9],
    bd: [94, 88, 70, 66],
    join: 'Open · public',
    code: 'Platform Code of Care + consent guidelines',
    vis: 'public',
    support: true,
    mods: [
      { initials: 'KS', name: 'Kai Sousa', pronouns: 'xe/xem', tone: 'plum', role: 'DJ · 5 vouches' },
    ],
    queue: [
      {
        sev: 'amber',
        catTone: 'amber',
        catLabel: 'Spam',
        title: 'Ticket-scalping links in event threads',
        meta: '2 reporters · 5h ago',
      },
      {
        sev: 'coral',
        catTone: 'coral',
        catLabel: 'Harassment',
        title: 'Unwanted advances reported in a thread',
        meta: 'Reported by a member · 9h ago',
      },
      {
        sev: 'jade',
        catTone: 'jade',
        catLabel: 'Off-topic',
        title: 'A noise complaint about an after',
        meta: 'Reported · 12h ago',
      },
    ],
  },
  {
    slug: 'elders-memory',
    name: 'Elders & Memory',
    initials: 'EM',
    tone: 'amber',
    tag: 'Intergenerational',
    desc: 'Older members and memory-keepers holding queer history and mentorship.',
    members: '220',
    activity: 'Calm',
    activePct: 43,
    reports: 0,
    resolvedPct: 100,
    health: 98,
    founded: 'Nov 2023',
    spark: [2, 2, 3, 2, 3, 3, 2, 3],
    bd: [68, 100, 100, 100],
    join: 'Vouch-gated · 1 vouch',
    code: 'Platform Code of Care',
    vis: 'private',
    support: false,
    mods: [
      { initials: 'LB', name: 'Lurdes B.', pronouns: 'she/her', tone: 'amber', role: 'elder · memory-keeper' },
    ],
    queue: [],
  },
  {
    slug: 'mutual-aid-lisbon',
    name: 'Mutual Aid Lisbon',
    initials: 'MA',
    tone: 'coral',
    tag: 'Solidarity & care',
    desc: 'Practical solidarity — fund drives, surplus sharing, crisis support.',
    members: '980',
    activity: 'Active',
    activePct: 58,
    reports: 1,
    resolvedPct: 97,
    health: 90,
    founded: 'Jun 2023',
    spark: [5, 5, 6, 6, 5, 7, 6, 7],
    bd: [80, 97, 92, 90],
    join: 'Open · with a welcome chat',
    code: 'Platform Code of Care',
    vis: 'network',
    support: false,
    mods: [
      { initials: 'SA', name: 'Sofia Almeida', pronouns: 'she/they', tone: 'amber', role: 'mutual aid lead' },
    ],
    queue: [
      {
        sev: 'jade',
        catTone: 'jade',
        catLabel: 'Off-topic',
        title: 'Self-promotion in a support thread',
        meta: 'Reported by Kai S. · 11h ago',
      },
    ],
  },
]

