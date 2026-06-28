import type { AvatarTone } from './ui'

/* ── Types ────────────────────────────────────────────────── */

export type MemberStatus = 'active' | 'review' | 'frozen' | 'limited'

export interface VouchAvatar {
  initials: string
  tone: AvatarTone
}

export interface AdminMember {
  id: string
  name: string
  initials: string
  tone: AvatarTone
  pronoun: string
  verified: boolean
  /** short status chip label, e.g. "Verified", "1 open report" */
  statusLabel: string
  /** tone for the status chip */
  statusTone: 'jade' | 'amber' | 'coral' | 'violet' | 'plum' | 'ghost'
  /** used by the "New this week" filter */
  newThisWeek: boolean
  meta: string
  vouchCount: number
  /** the small stacked vouch avatars to preview on the row */
  vouchedBy: VouchAvatar[]
}

export interface VerifyQueueItem {
  id: string
  name: string
  initials: string
  tone: AvatarTone
  pronoun: string
  vouchedByLine: string
  appliedLine: string
  /** when set, shows the amber "wait for 2?" nudge */
  oneVouchNudge: boolean
}

export interface FlaggedMember {
  id: string
  handle: string
  initials: string
  tone: AvatarTone
  /** left category chip, e.g. "4 reports" */
  catLabel: string
  catTone: 'danger' | 'amber' | 'violet' | 'coral'
  meta: string
  /** right status chip, e.g. "Under review" */
  statusLabel: string
  statusTone: 'danger' | 'amber' | 'violet' | 'coral'
}

export interface DrawerStat {
  label: string
  value: string
}

export interface ContributionItem {
  what: string
  when: string
}

export type CommTone = 'jade' | 'violet' | 'plum' | 'coral' | 'amber' | 'ghost'

export interface MemberDetail {
  id: string
  glance: DrawerStat[]
  graphNote: string
  communities: { label: string; tone: CommTone }[]
  contributions: ContributionItem[]
  reportsNote: string
  removeBody: string
  /** central node + surrounding bubbles for the vouch graph */
  graph: {
    center: { initials: string; tone: AvatarTone }
    nodes: VouchAvatar[]
  }
}

/* ── Verification pending badge ──────────────────────────── */

/** The tab badge reads 11 even though only 3 cards are shown (per design). */
export const VERIFY_PENDING_COUNT = 11

/* ── All members (directory) ─────────────────────────────── */

export const MEMBERS: AdminMember[] = [
  {
    id: 'ines',
    name: 'Inês Martins',
    initials: 'IM',
    tone: 'jade',
    pronoun: 'she/her',
    verified: true,
    statusLabel: 'Verified',
    statusTone: 'jade',
    newThisWeek: false,
    meta: 'Joined Mar 2023 · Founder, Maré Records · Trans & Friends · Queer Creatives',
    vouchCount: 21,
    vouchedBy: [
      { initials: 'TM', tone: 'violet' },
      { initials: 'AL', tone: 'coral' },
      { initials: 'DO', tone: 'coral' },
    ],
  },
  {
    id: 'devon',
    name: 'Devon Okoro',
    initials: 'DO',
    tone: 'coral',
    pronoun: 'they/them',
    verified: true,
    statusLabel: 'Verified',
    statusTone: 'jade',
    newThisWeek: false,
    meta: 'Joined Jun 2025 · Illustrator · Queer Creatives',
    vouchCount: 10,
    vouchedBy: [
      { initials: 'IM', tone: 'jade' },
      { initials: 'KS', tone: 'plum' },
    ],
  },
  {
    id: 'theo',
    name: 'Théo Mendes',
    initials: 'TM',
    tone: 'violet',
    pronoun: 'he/him',
    verified: false,
    statusLabel: '1 open report',
    statusTone: 'coral',
    newThisWeek: false,
    meta: 'Joined Sep 2024 · Community organiser · Lisbon Queers',
    vouchCount: 7,
    vouchedBy: [
      { initials: 'IM', tone: 'jade' },
      { initials: 'SA', tone: 'amber' },
    ],
  },
  {
    id: 'sofia',
    name: 'Sofia Almeida',
    initials: 'SA',
    tone: 'amber',
    pronoun: 'she/they',
    verified: true,
    statusLabel: 'Verified',
    statusTone: 'jade',
    newThisWeek: false,
    meta: 'Joined Jan 2024 · Nurse · mutual aid lead · Trans & Friends',
    vouchCount: 14,
    vouchedBy: [
      { initials: 'DO', tone: 'coral' },
      { initials: 'TM', tone: 'violet' },
    ],
  },
  {
    id: 'kai',
    name: 'Kai Sousa',
    initials: 'KS',
    tone: 'plum',
    pronoun: 'xe/xem',
    verified: true,
    statusLabel: 'Verified',
    statusTone: 'jade',
    newThisWeek: true,
    meta: 'Joined Nov 2025 · DJ · night-life · Queer Creatives',
    vouchCount: 4,
    vouchedBy: [{ initials: 'SA', tone: 'amber' }],
  },
]

/* ── Verification pending ────────────────────────────────── */

export const VERIFY_QUEUE: VerifyQueueItem[] = [
  {
    id: 'marco',
    name: 'Marco Vieira',
    initials: 'MV',
    tone: 'coral',
    pronoun: 'he/him',
    vouchedByLine: 'Vouched by Inês M. & Sofia A.',
    appliedLine: 'Applied 2 days ago',
    oneVouchNudge: false,
  },
  {
    id: 'rui',
    name: 'Rui Antunes',
    initials: 'RA',
    tone: 'jade',
    pronoun: 'he/they',
    vouchedByLine: 'Vouched by Devon O.',
    appliedLine: 'Applied 3 days ago',
    oneVouchNudge: true,
  },
  {
    id: 'nadia',
    name: 'Nadia Lopes',
    initials: 'NL',
    tone: 'violet',
    pronoun: 'she/her',
    vouchedByLine: 'Vouched by Kai S., Théo M. & 1 more',
    appliedLine: 'Applied 5 days ago',
    oneVouchNudge: false,
  },
]

/* ── Flagged ─────────────────────────────────────────────── */

export const FLAGGED: FlaggedMember[] = [
  {
    id: 'nightowl',
    handle: '@nightowl',
    initials: 'N',
    tone: 'plum',
    catLabel: '4 reports',
    catTone: 'danger',
    meta: 'Joined Sep 2024 · Pattern: repeated DMs after blocks',
    statusLabel: 'Under review',
    statusTone: 'coral',
  },
  {
    id: 'anon_4471',
    handle: '@anon_4471',
    initials: 'A',
    tone: 'anon',
    catLabel: 'Doxxing report',
    catTone: 'danger',
    meta: 'New account · 1h old · 0 vouches · Auto-frozen pending review',
    statusLabel: 'Frozen',
    statusTone: 'danger',
  },
  {
    id: 'coin_daily',
    handle: '@coin_daily',
    initials: 'CD',
    tone: 'amber',
    catLabel: 'Spam',
    catTone: 'amber',
    meta: 'Joined last week · Crypto links across 6 threads',
    statusLabel: 'Limited',
    statusTone: 'amber',
  },
]

/* ── Drawer detail (keyed by member id) ──────────────────── */

export const MEMBER_DETAIL: Record<string, MemberDetail> = {
  ines: {
    id: 'ines',
    glance: [
      { label: 'Vouches', value: '21' },
      { label: 'Member for', value: '3yr' },
      { label: 'Reports against', value: '0' },
    ],
    graphNote:
      '21 members have vouched for Inês. A dense, mutual graph is a sign of a deeply-trusted member — not a metric to optimise.',
    communities: [
      { label: 'Trans & Friends · moderator', tone: 'jade' },
      { label: 'Queer Creatives', tone: 'violet' },
      { label: 'Lisbon Queers', tone: 'plum' },
    ],
    contributions: [
      { what: 'Resolved a harassment report in Trans & Friends', when: '2 min ago' },
      { what: 'Hosted "Queer founders breakfast" — 34 attended', when: 'Jun 12' },
      { what: 'Vouched for Marco Vieira', when: 'May 30' },
      { what: 'Published an essay in the Magazine', when: 'Apr 18' },
    ],
    reportsNote:
      'No reports against this member. One report filed by them (harassment, resolved). A clean record built over three years.',
    removeBody:
      "This ends Inês Martins's membership, hides their content, and notifies them with your reason and the right to appeal. Their vouches for others stay valid. This is logged in the audit trail under your name.",
    graph: {
      center: { initials: 'IM', tone: 'jade' },
      nodes: [
        { initials: 'TM', tone: 'violet' },
        { initials: 'AL', tone: 'coral' },
        { initials: 'DO', tone: 'coral' },
        { initials: 'SA', tone: 'amber' },
        { initials: 'KS', tone: 'plum' },
        { initials: 'MV', tone: 'coral' },
        { initials: 'NL', tone: 'violet' },
        { initials: 'RA', tone: 'jade' },
        { initials: 'PE', tone: 'plum' },
        { initials: 'YC', tone: 'jade' },
        { initials: 'JO', tone: 'amber' },
        { initials: 'BR', tone: 'violet' },
      ],
    },
  },
}

/** Fallback detail so any member opens a populated drawer. */
export function detailFor(member: AdminMember): MemberDetail {
  const found = MEMBER_DETAIL[member.id]
  if (found) return found
  const first = member.name.split(' ')[0]
  return {
    id: member.id,
    glance: [
      { label: 'Vouches', value: String(member.vouchCount) },
      { label: 'Member for', value: member.newThisWeek ? 'new' : '1yr+' },
      { label: 'Reports against', value: '0' },
    ],
    graphNote: `${member.vouchCount} members have vouched for ${first}. A mutual graph is a sign of trust — not a metric to optimise.`,
    communities: [
      { label: 'Trans & Friends', tone: 'jade' },
      { label: 'Queer Creatives', tone: 'violet' },
    ],
    contributions: [
      { what: 'Joined QueerPulse', when: 'this year' },
      { what: 'Posted in a community', when: 'recently' },
    ],
    reportsNote: 'No reports against this member.',
    removeBody: `This ends ${member.name}'s membership, hides their content, and notifies them with your reason and the right to appeal. Their vouches for others stay valid. This is logged in the audit trail under your name.`,
    graph: {
      center: { initials: member.initials, tone: member.tone },
      nodes: member.vouchedBy.length
        ? member.vouchedBy
        : [{ initials: '?', tone: 'anon' }],
    },
  }
}
