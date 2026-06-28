export type Severity = 'critical' | 'high' | 'medium'
export type ReportType = 'harassment' | 'outing' | 'spam' | 'vouch'

export interface ModReportItem {
  id: string
  severity: Severity
  type: ReportType
  excerpt: string
  reporter: string
  reported: string
  community?: string
  time: string
}

export interface AppealItem {
  id: string
  action: string
  date: string
  moderator: string
  statement: string
  modNote: string
  byMe?: boolean
}

export interface ActionLogRow {
  id: string
  date: string
  moderator: string
  action: string
  target: string
  community?: string
  note: string
}

export const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  harassment: 'Harassment / personal attack',
  outing: 'Outing / privacy violation',
  spam: 'Spam / promotional',
  vouch: 'Vouch abuse / fraudulent invite',
}

export const REPORT_QUEUE: ModReportItem[] = [
  {
    id: 'r001',
    severity: 'critical',
    type: 'outing',
    excerpt: '"You should be careful what you say about @ana_r — I know where you live and I\'ll tell your family exactly what kind of person you are."',
    reporter: '@marta_j',
    reported: '@tempuser99',
    community: 'Queer Runners',
    time: '14 min ago',
  },
  {
    id: 'r002',
    severity: 'high',
    type: 'harassment',
    excerpt: '"Stop posting your propaganda here. Nobody wants your kind in this space. Leave or we\'ll make you leave."',
    reporter: '@pedro_v',
    reported: '@newmember22',
    community: 'Rainbow Parents',
    time: '1h ago',
  },
  {
    id: 'r003',
    severity: 'high',
    type: 'vouch',
    excerpt: 'Three accounts vouched by the same source within 48 hours, all inactive except for liking one post. Suspected coordinated fake-account creation.',
    reporter: 'System (auto-flag)',
    reported: '@vouchchain_suspect',
    time: '2h ago',
  },
  {
    id: 'r004',
    severity: 'medium',
    type: 'spam',
    excerpt: '"Grow your OnlyFans fast!! DM me for promo packages — 10 posts in 7 days guaranteed." Same message posted to 6 communities.',
    reporter: '@lea_s',
    reported: '@promo_acct',
    community: 'Trans Lisbon',
    time: '3h ago',
  },
  {
    id: 'r005',
    severity: 'medium',
    type: 'harassment',
    excerpt: '"Your event is a joke. Real queers don\'t do pilates. Stop pretending you belong here."',
    reporter: '@kai_m',
    reported: '@user_felix',
    time: '5h ago',
  },
  {
    id: 'r006',
    severity: 'critical',
    type: 'outing',
    excerpt: 'Member posted a screenshot of a private conversation revealing another member\'s HIV status without consent.',
    reporter: '@admin_tip',
    reported: '@gossip_acc',
    community: 'Health & Wellness',
    time: '7h ago',
  },
]

export const APPEALS: AppealItem[] = [
  {
    id: 'a001',
    action: '7-day suspension',
    date: '2026-06-21',
    moderator: 'You',
    statement: 'I didn\'t intend to harass anyone — I was responding to misinformation about my community. I understand my tone was aggressive and I\'ve reflected on that. I ask for the opportunity to return and engage more constructively.',
    modNote: 'Member posted three increasingly hostile replies targeting the same person over 20 minutes. Warned once before suspension.',
    byMe: true,
  },
  {
    id: 'a002',
    action: 'Post removal',
    date: '2026-06-24',
    moderator: '@mod_claudia',
    statement: 'The post was a personal story about coming out to my family. I included their names only to give context. I didn\'t think that was a violation. Can the post be reinstated or edited rather than deleted entirely?',
    modNote: 'Post contained full names and location of non-consenting third parties (family members). Removed for privacy.',
  },
  {
    id: 'a003',
    action: '30-day ban',
    date: '2026-06-18',
    moderator: '@mod_rui',
    statement: 'I was sharing a fundraiser link — I didn\'t know the no-promo rule applied to charities too. I\'ve been a member for two years and have never violated a rule before. This feels disproportionate.',
    modNote: 'Third promotional post in 30 days. First two received warnings. Ban applied per escalation policy.',
  },
]

export const ACTION_LOG: ActionLogRow[] = [
  {
    id: 'l001',
    date: '2026-06-28 09:14',
    moderator: '@mod_ana',
    action: 'Warning issued',
    target: '@user_felix',
    note: 'Hostile comment in pilates thread. First offence, warned per policy.',
  },
  {
    id: 'l002',
    date: '2026-06-27 16:42',
    moderator: '@mod_claudia',
    action: 'Post removed',
    target: '@member_tomas',
    community: 'Rainbow Parents',
    note: 'Post contained private family member details without consent.',
  },
  {
    id: 'l003',
    date: '2026-06-27 11:05',
    moderator: '@mod_rui',
    action: '7-day suspension',
    target: '@newmember22',
    community: 'Rainbow Parents',
    note: 'Repeated harassment after warning. Suspended for 7 days.',
  },
  {
    id: 'l004',
    date: '2026-06-26 18:30',
    moderator: 'System',
    action: 'Account flagged',
    target: '@vouchchain_suspect',
    note: 'Auto-flagged: 3 vouches from same account in 48h. Pending review.',
  },
  {
    id: 'l005',
    date: '2026-06-26 14:22',
    moderator: '@mod_ana',
    action: 'Spam removed',
    target: '@promo_acct',
    community: 'Trans Lisbon',
    note: 'Six identical promo posts removed. Account under review.',
  },
  {
    id: 'l006',
    date: '2026-06-25 10:08',
    moderator: '@mod_claudia',
    action: 'Ban lifted',
    target: '@old_member_g',
    note: 'Appeal upheld. Ban was disproportionate. Member reinstated with formal notice.',
  },
  {
    id: 'l007',
    date: '2026-06-24 09:55',
    moderator: '@mod_rui',
    action: '30-day ban',
    target: '@promo_repeat',
    community: 'Queer Runners',
    note: 'Third promotional post. Escalated per policy after two warnings.',
  },
  {
    id: 'l008',
    date: '2026-06-23 17:40',
    moderator: '@mod_ana',
    action: 'Report dismissed',
    target: '@kai_m',
    note: 'Report was unfounded — content was a legitimate critique, not harassment.',
  },
  {
    id: 'l009',
    date: '2026-06-22 12:15',
    moderator: '@mod_claudia',
    action: 'Identity verified',
    target: '@member_sol',
    note: 'Document review complete. Member verified and tier upgraded.',
  },
]
