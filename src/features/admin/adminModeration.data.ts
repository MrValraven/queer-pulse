import type { AdminTone } from './ui'

export type Severity = 'emergency' | 'high' | 'medium' | 'low'

export interface SeverityMeta {
  label: string
  stripe: string
  cat: 'danger' | 'coral' | 'jade'
}

export const SEVERITY: Record<Severity, SeverityMeta> = {
  emergency: { label: 'Emergency', stripe: 'var(--danger)', cat: 'danger' },
  high: { label: 'High', stripe: 'var(--danger)', cat: 'coral' },
  medium: { label: 'Medium', stripe: 'var(--amber)', cat: 'coral' },
  low: { label: 'Low', stripe: 'var(--jade)', cat: 'jade' },
}

export interface ReportChip {
  tone: AdminTone
  label: string
  dot?: boolean
}

export interface ThreadMsg {
  author: string
  initials: string
  tone: 'plum' | 'coral' | 'jade' | 'violet' | 'amber' | 'anon'
  time: string
  body: string
  flagged?: boolean
}

export interface DrawerPerson {
  role: string
  name: string
  initials: string
  tone: 'plum' | 'coral' | 'jade' | 'violet' | 'amber' | 'anon'
  meta: string
  verified?: boolean
  anon?: boolean
  chips?: ReportChip[]
  pronoun?: string
}

export interface ReportDetail {
  /** Author byline for the reported content. */
  contentAuthor: string
  /** Reported content excerpt shown verbatim in the drawer. */
  excerpt: string
  /** Transparency note about deadname redaction, shown under the excerpt. */
  redactionNote?: string
  thread: ThreadMsg[]
  people: DrawerPerson[]
}

export interface ModReport {
  id: string
  severity: Severity
  /** Stronger square category label (AdminCat). */
  category: string
  chips: ReportChip[]
  title: string
  /** Optional coral-emphasised tail of the title. */
  titleEm?: string
  /** Optional plain tail of the title after the emphasised part. */
  titleAfter?: string
  preview: string
  reporterName: string
  reportedName: string
  community?: string
  /** "1 prior report" style flag shown with a flag icon. */
  priorReports?: string
  age: string
  risk: { tone: AdminTone; label: string }
  detail?: ReportDetail
}

export interface Appeal {
  id: string
  severity: Severity
  chips: ReportChip[]
  title: string
  preview: string
  appealBy: string
  decidedBy: string
  community?: string
  age: string
  status: { tone: AdminTone; label: string }
}

export interface ResolvedItem {
  id: string
  severity: Severity
  chips: ReportChip[]
  /** Stronger square outcome label (AdminCat). */
  outcome: string
  outcomeTone: 'danger' | 'coral' | 'jade'
  title: string
  preview: string
  closed: string
  notified: string
  status: { tone: AdminTone; label: string }
}

/* ── Open queue: 2 emergencies first, then everything else ──────────────── */

export const EMERGENCY_REPORTS: ModReport[] = [
  {
    id: 'r-emerg-1',
    severity: 'emergency',
    category: 'Emergency',
    chips: [{ tone: 'danger', label: 'Outing / doxxing' }],
    title: "A member's",
    titleEm: 'private trans status',
    titleAfter: 'was posted in a public thread',
    preview:
      '"Everyone should know that [name] used to go by…" — reported as deliberate outing in the Lisbon Queers open forum.',
    reporterName: 'anonymous',
    reportedName: '@reblanco',
    priorReports: '1 prior report',
    age: '26m',
    risk: { tone: 'danger', label: 'At risk' },
    detail: {
      contentAuthor: 'RB · @reblanco · in Lisbon Queers · public thread',
      excerpt:
        '"Everyone should know that @[redacted name] used to go by a different name before transitioning — just so you all have the full picture of who you’re dealing with."',
      redactionNote:
        "A deadname has been automatically redacted from this view. The affected member’s legacy identity is never shown to moderators.",
      thread: [
        {
          author: 'Ana L.',
          initials: 'AL',
          tone: 'jade',
          time: '2:14pm',
          body: 'does anyone have a recommendation for a trans-friendly GP near Arroios?',
        },
        {
          author: '@reblanco',
          initials: 'RB',
          tone: 'coral',
          time: '2:21pm · reported',
          flagged: true,
          body: 'Everyone should know that @[redacted] used to go by…',
        },
        {
          author: 'Théo M.',
          initials: 'TM',
          tone: 'violet',
          time: '2:23pm',
          body: 'this is completely out of line — please take this down',
        },
      ],
      people: [
        {
          role: 'Reporter',
          name: 'Anonymous reporter',
          initials: '?',
          tone: 'anon',
          anon: true,
          meta: 'Reporting is anonymous by design. Their identity is protected from you and from the reported member.',
          chips: [{ tone: 'ghost', label: 'Identity shielded' }],
        },
        {
          role: 'Reported',
          name: '@reblanco',
          initials: 'RB',
          tone: 'coral',
          pronoun: 'he/him',
          meta: 'Member since Mar 2024 · 6 vouches · 1 prior report (resolved: warned for hostile tone, Jan 2026).',
          chips: [
            { tone: 'coral', label: '1 prior report' },
            { tone: 'ghost', label: 'Lisbon Queers' },
          ],
        },
      ],
    },
  },
  {
    id: 'r-emerg-2',
    severity: 'emergency',
    category: 'Emergency',
    chips: [{ tone: 'danger', label: 'Outing / doxxing' }],
    title: 'Home address shared in a DM screenshot',
    preview:
      'A throwaway account posted what appears to be a member’s home address with a threat to "show up." Reporter fears for physical safety.',
    reporterName: 'Mara L.',
    reportedName: '@anon_4471',
    priorReports: 'New account · 0 vouches',
    age: '1h',
    risk: { tone: 'danger', label: 'At risk' },
  },
]

export const OTHER_REPORTS: ModReport[] = [
  {
    id: 'r-harass',
    severity: 'high',
    category: 'Harassment',
    chips: [{ tone: 'coral', label: 'Harassment' }],
    title: 'Repeated unwanted DMs after being asked to stop',
    preview:
      'Member reports 14 messages in 2 days from the same person despite blocking. Pattern of escalation.',
    reporterName: 'Tomás R.',
    reportedName: '@nightowl',
    priorReports: '4 prior reports',
    age: '3h',
    risk: { tone: 'coral', label: 'High' },
  },
  {
    id: 'r-vouch',
    severity: 'medium',
    category: 'Vouch-abuse',
    chips: [{ tone: 'violet', label: 'Vouch-abuse' }],
    title: 'Cluster of accounts vouching for each other in a ring',
    preview:
      'Five new accounts created within an hour, each vouching for the others to fast-track verification. Possible coordinated entry.',
    reporterName: 'system',
    reportedName: '5 accounts',
    community: 'Queer Creatives',
    age: '5h',
    risk: { tone: 'amber', label: 'Medium' },
  },
  {
    id: 'r-spam',
    severity: 'medium',
    category: 'Spam',
    chips: [{ tone: 'amber', label: 'Spam' }],
    title: 'Crypto promo links posted across 6 gathering threads',
    preview:
      'Same external link dropped into unrelated event discussions. Likely a compromised or bad-faith account.',
    reporterName: '3 members',
    reportedName: '@coin_daily',
    age: '8h',
    risk: { tone: 'amber', label: 'Medium' },
  },
  {
    id: 'r-offtopic',
    severity: 'low',
    category: 'Off-topic',
    chips: [{ tone: 'jade', label: 'Off-topic' }],
    title: 'A heated but non-abusive disagreement was reported',
    preview:
      'Two members argued about event logistics. Reported as "hostile" but reads as a tense exchange, not a code-of-care breach.',
    reporterName: 'Sofia D.',
    reportedName: 'Trans & Friends',
    community: 'Trans & Friends',
    age: '14h',
    risk: { tone: 'jade', label: 'Low' },
  },
]

/* ── Appeals ─────────────────────────────────────────────────────────────── */

export const APPEALS: Appeal[] = [
  {
    id: 'a-1',
    severity: 'medium',
    chips: [{ tone: 'amber', label: 'Appeal · restriction' }],
    title: '"I was muted for a joke that my friends were in on"',
    preview:
      'Member restricted for 7 days asks for a second look, says context was missed. Two members have written in support.',
    appealBy: '@dovgrey',
    decidedBy: 'Inês M.',
    community: 'Lisbon Queers',
    age: '2d',
    status: { tone: 'amber', label: 'Awaiting' },
  },
  {
    id: 'a-2',
    severity: 'low',
    chips: [{ tone: 'jade', label: 'Appeal · removal' }],
    title: 'Removed member says the report was retaliation',
    preview:
      'Claims the person who reported them was the original aggressor. Requests the full thread be re-read.',
    appealBy: '@marsh.k',
    decidedBy: 'Júlia S.',
    age: '3d',
    status: { tone: 'jade', label: 'Awaiting' },
  },
]

/* ── Resolved ────────────────────────────────────────────────────────────── */

export const RESOLVED: ResolvedItem[] = [
  {
    id: 're-1',
    severity: 'low',
    chips: [{ tone: 'jade', label: 'Resolved' }],
    outcome: 'Restricted · 7 days',
    outcomeTone: 'coral',
    title: 'Harassment in Trans & Friends',
    preview:
      'Resolved by Inês M. — "Repeated DMs after a clear no. Restricted for 7 days; member notified with the policy excerpt."',
    closed: 'Closed 2 min ago',
    notified: 'Member was notified',
    status: { tone: 'jade', label: 'Logged' },
  },
  {
    id: 're-2',
    severity: 'low',
    chips: [{ tone: 'jade', label: 'Resolved' }],
    outcome: 'Dismissed',
    outcomeTone: 'coral',
    title: 'Reported "spam" was a member’s own event',
    preview:
      'Dismissed by Júlia S. — "Genuine community gathering, not promotion. No action; reporter thanked for caution."',
    closed: 'Closed 1h ago',
    notified: 'Both parties notified',
    status: { tone: 'jade', label: 'Logged' },
  },
  {
    id: 're-3',
    severity: 'emergency',
    chips: [{ tone: 'danger', label: 'Resolved' }],
    outcome: 'Removed + reported to safety team',
    outcomeTone: 'danger',
    title: 'Doxxing with intent to intimidate',
    preview:
      'Resolved by Júlia S. — "Address + threat. Content removed within 9 minutes, account banned, member offered safety resources."',
    closed: 'Closed yesterday',
    notified: 'Affected member supported',
    status: { tone: 'jade', label: 'Logged' },
  },
]

/* ── Drawer action grid ──────────────────────────────────────────────────── */

export type ActionKind = 'neutral' | 'protect' | 'destruct'

export interface ModAction {
  id: string
  label: string
  desc: string
  kind: ActionKind
  /** Past-tense phrase used in the confirmation toast. */
  done: string
}

export const MOD_ACTIONS: ModAction[] = [
  { id: 'hide', label: 'Hide content', desc: 'Remove from view, keep for records', kind: 'protect', done: 'hidden' },
  { id: 'shield', label: 'Shield member', desc: 'Protect the person reported about', kind: 'protect', done: 'shielded' },
  { id: 'warn', label: 'Warn', desc: 'Send a formal warning', kind: 'neutral', done: 'warned' },
  { id: 'restrict', label: 'Restrict', desc: 'Limit posting for a period', kind: 'neutral', done: 'restricted' },
  { id: 'remove', label: 'Remove', desc: 'Delete the content permanently', kind: 'destruct', done: 'removed' },
  { id: 'ban', label: 'Ban', desc: 'Remove the member from the network', kind: 'destruct', done: 'banned' },
]

export interface ModReason {
  id: string
  label: string
}

export const MOD_REASONS: ModReason[] = [
  { id: 'outing', label: 'Outing / sharing private identity without consent' },
  { id: 'doxxing', label: 'Sharing personal or location data (doxxing)' },
  { id: 'harassment', label: 'Targeted harassment of a member' },
  { id: 'other', label: 'Other — explain below' },
]
