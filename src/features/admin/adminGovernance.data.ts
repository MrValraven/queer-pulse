import { FiHeart, FiServer, FiLifeBuoy, FiActivity, FiBookOpen } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import type { AdminTone } from './ui'

// ── Finances ────────────────────────────────────────────────────────────────

export interface FinanceStat {
  label: string
  /** Numeric count-up target. */
  value: number
  prefix?: string
  suffix?: string
  comma?: boolean
  /** Highlight the number in jade (e.g. the surplus). */
  jade?: boolean
  foot: string
}

export const FINANCE_STATS: FinanceStat[] = [
  {
    label: 'Sustainer MRR',
    value: 23150,
    prefix: '€',
    comma: true,
    foot: '1,842 members chip in monthly',
  },
  {
    label: 'Total monthly income',
    value: 34370,
    prefix: '€',
    comma: true,
    foot: 'Sustainers, grants & one-offs',
  },
  {
    label: 'Monthly surplus',
    value: 4870,
    prefix: '€',
    comma: true,
    jade: true,
    foot: 'Held in the community reserve',
  },
  {
    label: 'On solidarity access',
    value: 18,
    suffix: '%',
    foot: 'Members on free or reduced rate',
  },
]

/** Token colour keys mapped to CSS-module meter classes in the component. */
export type LedgerColor = 'coral' | 'violet' | 'jade' | 'amber' | 'plum'

export interface LedgerRow {
  label: string
  amount: string
  /** Bar width as a percentage of the largest line. */
  width: number
  color: LedgerColor
}

/** Where every euro goes — widest line (honoraria) is the 100% reference. */
export const LEDGER: LedgerRow[] = [
  { label: 'Moderator honoraria', amount: '€9,600', width: 100, color: 'coral' },
  { label: 'Platform & tools', amount: '€7,200', width: 75, color: 'plum' },
  { label: 'Mutual aid & micro-grants', amount: '€6,500', width: 68, color: 'jade' },
  { label: 'Mental health fund', amount: '€3,800', width: 40, color: 'violet' },
  { label: 'Magazine production', amount: '€2,400', width: 25, color: 'amber' },
]

// ── Policy & versions ─────────────────────────────────────────────────────────

export interface CareVersion {
  version: string
  date: string
  note: string
  badge?: string
  badgeTone?: AdminTone
  current?: boolean
}

export const CARE_VERSIONS: CareVersion[] = [
  {
    version: 'v4.2',
    date: 'Ratified by the Annual Assembly · 12 Jun 2026 · 89% in favour',
    note: 'Added an explicit clause naming deadnaming and outing as severe harm, with mandatory content removal. Proposed by the Trans & Friends moderators.',
    badge: 'Current',
    badgeTone: 'jade',
    current: true,
  },
  {
    version: 'v4.1',
    date: '14 Mar 2026 · minor revision',
    note: 'Clarified the appeals window from 7 to 14 days after member feedback.',
  },
  {
    version: 'v4.0',
    date: '8 Jan 2026 · full community vote',
    note: 'A complete rewrite in plain, warm language. Reframed moderation around care and restoration rather than punishment.',
    badge: 'Major',
    badgeTone: 'violet',
  },
  {
    version: 'v3.3',
    date: '2 Oct 2025',
    note: 'Added the anonymous-reporting protection guarantee.',
  },
]

export const PRINCIPLES: string[] = [
  'We will never sell member data.',
  'Visibility is always the member’s choice.',
  'No silent removals — every action carries a reason.',
  'Access is never conditional on ability to pay.',
]

// ── Audit log ─────────────────────────────────────────────────────────────────

export type AuditTone = AdminTone

export interface AuditEntry {
  id: string
  modName: string
  modInitials: string
  modTone: 'plum' | 'coral' | 'jade' | 'violet' | 'amber' | 'anon'
  action: string
  actionTone: AuditTone
  subject: string
  reason: string
  when: string
}

export const AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: 'a1',
    modName: 'Inês Martins',
    modInitials: 'IM',
    modTone: 'jade',
    action: 'Restricted · 7 days',
    actionTone: 'amber',
    subject: '@member·redacted',
    reason: 'Repeated DMs after a clear no. Notified with policy excerpt.',
    when: '2 min ago',
  },
  {
    id: 'a2',
    modName: 'Júlia Saraiva',
    modInitials: 'JS',
    modTone: 'jade',
    action: 'Removed + banned',
    actionTone: 'danger',
    subject: '@anon_4471',
    reason: 'Doxxing — home address shared with a threat. Member offered safety resources.',
    when: '9 min ago',
  },
  {
    id: 'a3',
    modName: 'Théo · auto',
    modInitials: 'SY',
    modTone: 'plum',
    action: 'Auto-froze account',
    actionTone: 'amber',
    subject: '@anon_4471',
    reason: 'New account, 0 vouches, flagged for doxxing. Held for human review.',
    when: '1h ago',
  },
  {
    id: 'a4',
    modName: 'Júlia Saraiva',
    modInitials: 'JS',
    modTone: 'jade',
    action: 'Dismissed',
    actionTone: 'coral',
    subject: 'report #4471',
    reason: 'Genuine community gathering, not spam. Reporter thanked for caution.',
    when: '1h ago',
  },
  {
    id: 'a5',
    modName: 'Sofia Almeida',
    modInitials: 'SA',
    modTone: 'amber',
    action: 'Warned',
    actionTone: 'coral',
    subject: '@coin_daily',
    reason: 'First spam offence. Friendly warning + link removed.',
    when: '3h ago',
  },
  {
    id: 'a6',
    modName: 'Inês Martins',
    modInitials: 'IM',
    modTone: 'jade',
    action: 'Verified',
    actionTone: 'jade',
    subject: 'Marco Vieira',
    reason: 'Two vouches confirmed. Welcomed in.',
    when: '5h ago',
  },
  {
    id: 'a7',
    modName: 'Júlia Saraiva',
    modInitials: 'JS',
    modTone: 'jade',
    action: 'Upheld appeal',
    actionTone: 'violet',
    subject: '@dovgrey',
    reason: 'Context was missed on first review. Restriction lifted, apology sent.',
    when: 'yesterday',
  },
  {
    id: 'a8',
    modName: 'Kai Sousa',
    modInitials: 'KS',
    modTone: 'plum',
    action: 'Edited policy',
    actionTone: 'violet',
    subject: 'Code of Care v4.2',
    reason: 'Added deadnaming clause per Assembly vote.',
    when: '12 Jun',
  },
]

// ── Live-MRR panel ────────────────────────────────────────────────────────────

export interface PanelStat {
  label: string
  value: string
  icon: IconType
}

export const PANEL_BREAKDOWN: PanelStat[] = [
  { label: 'Care', value: '€9.6k', icon: FiHeart },
  { label: 'Platform', value: '€7.2k', icon: FiServer },
  { label: 'Mutual aid', value: '€6.5k', icon: FiLifeBuoy },
  { label: 'Health', value: '€3.8k', icon: FiActivity },
  { label: 'Magazine', value: '€2.4k', icon: FiBookOpen },
]
