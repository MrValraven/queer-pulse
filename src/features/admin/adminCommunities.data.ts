export interface CommunityHealth {
  slug: string
  name: string
  initials: string
  tint: string
  kind: 'Living' | 'Interest' | 'Support'
  score: number
  members: number
  mods: number
  openReports: number
  factors: { label: string; status: 'good' | 'warn' | 'bad'; detail: string }[]
  mods_roster: { name: string; initials: string; tint: string; role: 'owner' | 'mod' }[]
  escalations: { text: string; time: string }[]
}

export function healthColor(score: number): string {
  if (score >= 70) return 'var(--jade)'
  if (score >= 40) return 'var(--accent)'
  return 'var(--plum)'
}

export const COMMUNITIES: CommunityHealth[] = [
  {
    slug: 'queer-runners',
    name: 'Queer Runners',
    initials: 'QR',
    tint: 'jade',
    kind: 'Living',
    score: 84,
    members: 214,
    mods: 3,
    openReports: 1,
    factors: [
      { label: 'Active moderation', status: 'good', detail: 'Reports resolved within 24 h on average.' },
      { label: 'Member growth', status: 'good', detail: '+18 members in the past 30 days.' },
      { label: 'Open reports', status: 'warn', detail: '1 report awaiting review.' },
      { label: 'Rule compliance', status: 'good', detail: 'No recurring violators this quarter.' },
    ],
    mods_roster: [
      { name: 'Kai Nakamura', initials: 'KN', tint: 'jade', role: 'owner' },
      { name: 'Priya Osei', initials: 'PO', tint: 'plum', role: 'mod' },
      { name: 'Sam Rivera', initials: 'SR', tint: 'coral', role: 'mod' },
    ],
    escalations: [],
  },
  {
    slug: 'trans-hub',
    name: 'Trans Hub',
    initials: 'TH',
    tint: 'plum',
    kind: 'Support',
    score: 72,
    members: 147,
    mods: 2,
    openReports: 3,
    factors: [
      { label: 'Active moderation', status: 'good', detail: 'Mods responding within 48 h.' },
      { label: 'Open reports', status: 'warn', detail: '3 reports open — 1 escalated to staff.' },
      { label: 'Join-request backlog', status: 'warn', detail: '7 pending requests older than 72 h.' },
      { label: 'Rule compliance', status: 'good', detail: 'No repeat offenders this month.' },
    ],
    mods_roster: [
      { name: 'Alex Chen', initials: 'AC', tint: 'plum', role: 'owner' },
      { name: 'Jordan Ellis', initials: 'JE', tint: 'jade', role: 'mod' },
    ],
    escalations: [
      { text: 'Harassing DMs reported by 2 members — escalated by mod.', time: '2 days ago' },
    ],
  },
  {
    slug: 'rainbow-arts',
    name: 'Rainbow Arts',
    initials: 'RA',
    tint: 'coral',
    kind: 'Interest',
    score: 91,
    members: 128,
    mods: 2,
    openReports: 0,
    factors: [
      { label: 'Active moderation', status: 'good', detail: 'All reports resolved within 12 h.' },
      { label: 'Open reports', status: 'good', detail: 'No open reports.' },
      { label: 'Member engagement', status: 'good', detail: 'Highest post-per-member ratio this month.' },
      { label: 'Rule compliance', status: 'good', detail: 'Zero violations in the past 60 days.' },
    ],
    mods_roster: [
      { name: 'Mara López', initials: 'ML', tint: 'coral', role: 'owner' },
      { name: 'Teo Vasquez', initials: 'TV', tint: 'jade', role: 'mod' },
    ],
    escalations: [],
  },
  {
    slug: 'queer-social',
    name: 'Queer Social',
    initials: 'QS',
    tint: 'plum',
    kind: 'Living',
    score: 63,
    members: 312,
    mods: 2,
    openReports: 6,
    factors: [
      { label: 'Active moderation', status: 'warn', detail: 'Average resolution time over 72 h.' },
      { label: 'Open reports', status: 'warn', detail: '6 reports unresolved — 2 over 5 days old.' },
      { label: 'Mod coverage', status: 'warn', detail: 'Only 2 mods for 312 members — recommend adding 1.' },
      { label: 'Member growth', status: 'good', detail: '+24 this month, steady.' },
    ],
    mods_roster: [
      { name: 'Nico Adeyemi', initials: 'NA', tint: 'plum', role: 'owner' },
      { name: 'Bex Morrison', initials: 'BM', tint: 'coral', role: 'mod' },
    ],
    escalations: [
      { text: 'Off-topic spam wave on 24 Jun — 4 posts removed.', time: '4 days ago' },
      { text: 'Member dispute over event access — mediated by mod.', time: '1 week ago' },
    ],
  },
  {
    slug: 'trans-mutual-aid',
    name: 'Trans Mutual Aid',
    initials: 'TM',
    tint: 'jade',
    kind: 'Support',
    score: 78,
    members: 89,
    mods: 2,
    openReports: 1,
    factors: [
      { label: 'Active moderation', status: 'good', detail: 'Reports resolved promptly.' },
      { label: 'Open reports', status: 'warn', detail: '1 report under review.' },
      { label: 'Privacy compliance', status: 'good', detail: 'Reduced-visibility defaults enforced.' },
      { label: 'Member wellbeing', status: 'good', detail: 'No distress escalations in 30 days.' },
    ],
    mods_roster: [
      { name: 'River Tran', initials: 'RT', tint: 'jade', role: 'owner' },
      { name: 'Sage Okonkwo', initials: 'SO', tint: 'plum', role: 'mod' },
    ],
    escalations: [],
  },
  {
    slug: 'queer-parents',
    name: 'Queer Parents',
    initials: 'QP',
    tint: 'coral',
    kind: 'Support',
    score: 35,
    members: 74,
    mods: 1,
    openReports: 8,
    factors: [
      { label: 'Active moderation', status: 'bad', detail: 'Owner inactive for 14 days — no report resolution.' },
      { label: 'Open reports', status: 'bad', detail: '8 open reports, oldest 9 days old.' },
      { label: 'Mod coverage', status: 'bad', detail: 'Single mod — urgent to recruit a second.' },
      { label: 'Member growth', status: 'warn', detail: 'Flat; 0 new members this month.' },
    ],
    mods_roster: [
      { name: 'Dana Ferreira', initials: 'DF', tint: 'coral', role: 'owner' },
    ],
    escalations: [
      { text: 'Owner unresponsive — staff intervention may be needed.', time: '5 days ago' },
      { text: 'Misgendering incident reported x3 by same member.', time: '9 days ago' },
    ],
  },
]
