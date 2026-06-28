import type { AdminTone, AvatarTone } from './ui'

// ── Health colour by score ──────────────────────────────────────────────────
// ≥90 jade · ≥78 amber · else coral (accent-ink)
export function healthColor(score: number): string {
  if (score >= 90) return 'var(--jade)'
  if (score >= 78) return 'var(--amber)'
  return 'var(--accent-ink)'
}

export type BadgeTone = 'plum' | 'coral' | 'jade' | 'violet' | 'amber'

export interface CommunityCard {
  slug: string
  name: string
  initials: string
  tone: BadgeTone
  tag: string
  /** Members shown verbatim as a comma string. */
  members: string
  /** Activity descriptor, e.g. "High", "Busy". */
  activity: string
  openReports: number
  health: number
  /** 8-point sparkline series. */
  spark: number[]
  /** True for the one card that opens the inline detail view. */
  hasDetail?: boolean
}

export const COMMUNITIES: CommunityCard[] = [
  {
    slug: 'trans-friends',
    name: 'Trans & Friends',
    initials: 'TR',
    tone: 'jade',
    tag: 'Peer support · private',
    members: '1,204',
    activity: 'High',
    openReports: 1,
    health: 94,
    spark: [5, 6, 5, 7, 6, 8, 7, 9],
    hasDetail: true,
  },
  {
    slug: 'queer-creatives',
    name: 'Queer Creatives',
    initials: 'QC',
    tone: 'violet',
    tag: 'Artists & makers',
    members: '842',
    activity: 'Active',
    openReports: 2,
    health: 88,
    spark: [4, 5, 6, 5, 7, 6, 8, 7],
  },
  {
    slug: 'lisbon-queers',
    name: 'Lisbon Queers',
    initials: 'LQ',
    tone: 'coral',
    tag: 'City-wide · public',
    members: '3,180',
    activity: 'Busy',
    openReports: 6,
    health: 71,
    spark: [8, 7, 9, 8, 10, 9, 11, 10],
  },
  {
    slug: 'newly-arrived',
    name: 'Newly Arrived',
    initials: 'NA',
    tone: 'jade',
    tag: 'Migrants & arrivals',
    members: '410',
    activity: 'Growing',
    openReports: 0,
    health: 96,
    spark: [2, 3, 3, 4, 4, 5, 6, 7],
  },
  {
    slug: 'trans-healthcare',
    name: 'Trans Healthcare',
    initials: 'TH',
    tone: 'jade',
    tag: 'Navigators · support',
    members: '560',
    activity: 'Steady',
    openReports: 0,
    health: 92,
    spark: [3, 4, 3, 4, 4, 5, 4, 5],
  },
  {
    slug: 'nightlife-afters',
    name: 'Nightlife & Afters',
    initials: 'NF',
    tone: 'violet',
    tag: 'Events · high traffic',
    members: '1,640',
    activity: 'Spiky',
    openReports: 3,
    health: 79,
    spark: [6, 9, 5, 10, 6, 11, 7, 9],
  },
  {
    slug: 'elders-memory',
    name: 'Elders & Memory',
    initials: 'EM',
    tone: 'amber',
    tag: 'Intergenerational',
    members: '220',
    activity: 'Calm',
    openReports: 0,
    health: 98,
    spark: [2, 2, 3, 2, 3, 3, 2, 3],
  },
  {
    slug: 'mutual-aid-lisbon',
    name: 'Mutual Aid Lisbon',
    initials: 'MA',
    tone: 'coral',
    tag: 'Solidarity & care',
    members: '980',
    activity: 'Active',
    openReports: 1,
    health: 90,
    spark: [5, 5, 6, 6, 5, 7, 6, 7],
  },
]

// ── Detail view (Trans & Friends) ───────────────────────────────────────────

export interface DetailStat {
  label: string
  value: string
  tone?: 'jade' | 'coral' | 'plum'
}

export interface ScopedReport {
  category: string
  tone: 'danger' | 'coral' | 'amber' | 'jade'
  title: string
  meta: string
  severity: 'high' | 'med' | 'low'
}

export interface RosterMember {
  name: string
  pronouns: string
  initials: string
  tone: AvatarTone
  verified?: boolean
  /** Sub-line under the name. */
  detail: string
  /** Right-side affordance: a role chip, or a "View" link. */
  role?: { label: string; tone: AdminTone }
  link?: string
}

export interface SettingRow {
  label: string
  detail: string
  /** Trailing affordance: chips, a "View" button, or a single badge. */
  chips?: { label: string; tone: AdminTone }[]
  badge?: { label: string; tone: AdminTone }
  action?: string
}

export interface CommunityDetail {
  slug: string
  name: string
  initials: string
  tone: BadgeTone
  tag: string
  description: string
  health: number
  healthLabel: string
  stats: DetailStat[]
  scoped: ScopedReport[]
  roster: RosterMember[]
  totalMembers: string
  settings: SettingRow[]
}

export const TRANS_FRIENDS_DETAIL: CommunityDetail = {
  slug: 'trans-friends',
  name: 'Trans & Friends',
  initials: 'TR',
  tone: 'jade',
  tag: 'Peer support · private',
  description:
    "A peer-support and friendship space for trans, non-binary and questioning members. Stewarded by 3 moderators · founded Mar 2023.",
  health: 94,
  healthLabel: 'thriving',
  stats: [
    { label: 'Members', value: '1,204', tone: 'plum' },
    { label: 'Active this week', value: '68%', tone: 'plum' },
    { label: 'Open reports', value: '1', tone: 'coral' },
    { label: 'Resolved on time', value: '100%', tone: 'jade' },
  ],
  scoped: [
    {
      category: 'Harassment',
      tone: 'coral',
      title: "Repeated unwanted DMs after being asked to stop",
      meta: "Reported by Sofia D. · about a member with 4 prior reports · 3h ago",
      severity: 'high',
    },
  ],
  roster: [
    {
      name: 'Inês Martins',
      pronouns: 'she/her',
      initials: 'IM',
      tone: 'jade',
      verified: true,
      detail: 'Moderator · founded the community · 21 vouches',
      role: { label: 'Moderator', tone: 'jade' },
    },
    {
      name: 'Sofia Almeida',
      pronouns: 'she/they',
      initials: 'SA',
      tone: 'amber',
      verified: true,
      detail: 'Moderator · mutual aid lead · 14 vouches',
      role: { label: 'Moderator', tone: 'jade' },
    },
    {
      name: 'Devon Okoro',
      pronouns: 'they/them',
      initials: 'DO',
      tone: 'coral',
      verified: true,
      detail: 'Member · joined Jun 2025 · 8 vouches',
      link: 'View',
    },
  ],
  totalMembers: '1,204',
  settings: [
    {
      label: 'Who can join',
      detail: 'Vouch-gated — a member must be vouched for by 2 existing members.',
      badge: { label: '2 vouches required', tone: 'plum' },
    },
    {
      label: 'Moderators',
      detail: 'Three community members hold moderation powers, scoped to this space only.',
      chips: [
        { label: 'Inês M.', tone: 'jade' },
        { label: 'Sofia A.', tone: 'jade' },
        { label: '+1', tone: 'jade' },
      ],
    },
    {
      label: 'Code of care',
      detail:
        'Uses the platform Code of Care plus 2 community-specific additions about deadnaming.',
      action: 'View',
    },
    {
      label: 'Visibility',
      detail: 'Private — not listed publicly. Members find it through invitation only.',
      badge: { label: 'Private', tone: 'violet' },
    },
  ],
}
