import type { AvatarTint } from '../../shared/components/ui'

export type MemberStatus = 'active' | 'suspended' | 'banned'
export type MemberRole = 'member' | 'mod' | 'staff' | 'founder'
export type Tier = 'standard' | 'solidarity' | 'sustainer'

export interface AdminMember {
  id: string
  name: string
  initials: string
  tint: AvatarTint
  role: MemberRole
  status: MemberStatus
  vouches: number
  tier: Tier
  joined: string
  lastSeen: string
  bio: string
  vouchedBy: { name: string; when: string }[]
  modHistory: { action: string; date: string; note: string }[]
}

export interface VerificationItem {
  id: string
  name: string
  initials: string
  tint: AvatarTint
  docType: string
  waiting: string
  vouches: number
}

export const MEMBERS: AdminMember[] = [
  {
    id: 'm1',
    name: 'Marta Jiménez',
    initials: 'MJ',
    tint: 'coral',
    role: 'founder',
    status: 'active',
    vouches: 12,
    tier: 'sustainer',
    joined: 'Jan 2022',
    lastSeen: 'Today',
    bio: 'Co-founder of QueerPulse. Community organiser and activist based in Lisbon.',
    vouchedBy: [],
    modHistory: [],
  },
  {
    id: 'm2',
    name: 'Pedro Vargas',
    initials: 'PV',
    tint: 'jade',
    role: 'staff',
    status: 'active',
    vouches: 8,
    tier: 'sustainer',
    joined: 'Mar 2022',
    lastSeen: 'Yesterday',
    bio: 'Platform mod and design contributor. He/him.',
    vouchedBy: [{ name: 'Marta Jiménez', when: 'Mar 2022' }],
    modHistory: [],
  },
  {
    id: 'm3',
    name: 'Sam Rivera',
    initials: 'SR',
    tint: 'plum',
    role: 'mod',
    status: 'active',
    vouches: 5,
    tier: 'solidarity',
    joined: 'Jun 2022',
    lastSeen: '2 days ago',
    bio: 'Running-club mod and queer sports advocate. They/them.',
    vouchedBy: [
      { name: 'Marta Jiménez', when: 'Jun 2022' },
      { name: 'Pedro Vargas', when: 'Jun 2022' },
    ],
    modHistory: [],
  },
  {
    id: 'm4',
    name: 'Anya Kovač',
    initials: 'AK',
    tint: 'coral',
    role: 'member',
    status: 'active',
    vouches: 3,
    tier: 'standard',
    joined: 'Sep 2022',
    lastSeen: '5 days ago',
    bio: 'Artist and illustrator. Illustrates zines and community posters.',
    vouchedBy: [{ name: 'Sam Rivera', when: 'Sep 2022' }],
    modHistory: [],
  },
  {
    id: 'm5',
    name: 'Tomas Brandt',
    initials: 'TB',
    tint: 'jade',
    role: 'member',
    status: 'suspended',
    vouches: 1,
    tier: 'standard',
    joined: 'Jan 2023',
    lastSeen: '3 weeks ago',
    bio: 'Joined via referral. Currently suspended pending review.',
    vouchedBy: [{ name: 'Anya Kovač', when: 'Jan 2023' }],
    modHistory: [
      {
        action: 'Suspended (7 days)',
        date: 'Jun 2026',
        note: 'Multiple reports of aggressive DMs in running club thread.',
      },
    ],
  },
  {
    id: 'm6',
    name: 'Léa Fontaine',
    initials: 'LF',
    tint: 'plum',
    role: 'member',
    status: 'active',
    vouches: 4,
    tier: 'solidarity',
    joined: 'Apr 2023',
    lastSeen: 'Today',
    bio: 'Writer and zine editor. Based in Paris. She/her.',
    vouchedBy: [
      { name: 'Marta Jiménez', when: 'Apr 2023' },
      { name: 'Anya Kovač', when: 'May 2023' },
    ],
    modHistory: [],
  },
  {
    id: 'm7',
    name: 'Rui Nunes',
    initials: 'RN',
    tint: 'coral',
    role: 'member',
    status: 'active',
    vouches: 0,
    tier: 'standard',
    joined: 'May 2024',
    lastSeen: '2 weeks ago',
    bio: 'New member — still building vouch connections.',
    vouchedBy: [],
    modHistory: [],
  },
  {
    id: 'm8',
    name: 'Zeynep Aydın',
    initials: 'ZA',
    tint: 'jade',
    role: 'member',
    status: 'banned',
    vouches: 0,
    tier: 'standard',
    joined: 'Jul 2023',
    lastSeen: '4 months ago',
    bio: 'Account permanently banned after repeated outing violations.',
    vouchedBy: [],
    modHistory: [
      {
        action: 'Warning',
        date: 'Sep 2023',
        note: 'First outing report — formal warning issued.',
      },
      {
        action: 'Suspended (30 days)',
        date: 'Nov 2023',
        note: 'Second outing incident. 30-day suspension.',
      },
      {
        action: 'Banned',
        date: 'Jan 2024',
        note: 'Third violation — permanent ban upheld by council.',
      },
    ],
  },
  {
    id: 'm9',
    name: 'Ingrid Halvorsen',
    initials: 'IH',
    tint: 'plum',
    role: 'member',
    status: 'active',
    vouches: 2,
    tier: 'solidarity',
    joined: 'Oct 2023',
    lastSeen: '1 week ago',
    bio: 'Photographer and visual storyteller. She/her.',
    vouchedBy: [{ name: 'Léa Fontaine', when: 'Oct 2023' }],
    modHistory: [],
  },
  {
    id: 'm10',
    name: 'Dani Park',
    initials: 'DP',
    tint: 'coral',
    role: 'member',
    status: 'active',
    vouches: 0,
    tier: 'standard',
    joined: 'Feb 2026',
    lastSeen: '3 days ago',
    bio: 'Newly joined — identity verification pending.',
    vouchedBy: [],
    modHistory: [],
  },
  {
    id: 'm11',
    name: 'Camille Moreau',
    initials: 'CM',
    tint: 'jade',
    role: 'mod',
    status: 'active',
    vouches: 6,
    tier: 'sustainer',
    joined: 'Nov 2022',
    lastSeen: 'Today',
    bio: 'Mod for cinema and arts spaces. She/they. Based in Lyon.',
    vouchedBy: [
      { name: 'Marta Jiménez', when: 'Nov 2022' },
      { name: 'Sam Rivera', when: 'Dec 2022' },
    ],
    modHistory: [],
  },
]

export const VERIFICATION_QUEUE: VerificationItem[] = [
  {
    id: 'v1',
    name: 'Dani Park',
    initials: 'DP',
    tint: 'coral',
    docType: 'Government ID',
    waiting: '2 days',
    vouches: 0,
  },
  {
    id: 'v2',
    name: 'Rui Nunes',
    initials: 'RN',
    tint: 'coral',
    docType: 'Community letter',
    waiting: '5 days',
    vouches: 0,
  },
  {
    id: 'v3',
    name: 'Sasha Bloom',
    initials: 'SB',
    tint: 'plum',
    docType: 'Government ID',
    waiting: '1 week',
    vouches: 1,
  },
]

/* ── Vouch network graph ──────────────────────────────────────── */

export interface VouchNode {
  id: string
  label: string
  x: number
  y: number
  cohort: 2023 | 2024 | 2025
  vouches: number
}

export interface VouchEdge {
  from: string
  to: string
}

/** Hand-placed nodes (x/y in 0–100 space). id overlaps MEMBERS where possible. */
export const VOUCH_NODES: VouchNode[] = [
  // 2023 cohort — jade tint
  { id: 'm1', label: 'Marta J.', x: 50, y: 12, cohort: 2023, vouches: 12 },
  { id: 'm2', label: 'Pedro V.', x: 30, y: 26, cohort: 2023, vouches: 8 },
  { id: 'm3', label: 'Sam R.', x: 68, y: 26, cohort: 2023, vouches: 5 },
  { id: 'm11', label: 'Camille M.', x: 50, y: 38, cohort: 2023, vouches: 6 },
  // 2024 cohort — plum tint
  { id: 'm4', label: 'Anya K.', x: 20, y: 48, cohort: 2024, vouches: 3 },
  { id: 'm6', label: 'Léa F.', x: 40, y: 52, cohort: 2024, vouches: 4 },
  { id: 'm9', label: 'Ingrid H.', x: 62, y: 50, cohort: 2024, vouches: 2 },
  { id: 'm5', label: 'Tomas B.', x: 80, y: 42, cohort: 2024, vouches: 1 },
  // 2025 cohort — coral tint
  { id: 'm7', label: 'Rui N.', x: 15, y: 70, cohort: 2025, vouches: 0 },
  { id: 'm10', label: 'Dani P.', x: 52, y: 75, cohort: 2025, vouches: 0 },
  { id: 'n1', label: 'Sasha B.', x: 78, y: 68, cohort: 2025, vouches: 1 },
  { id: 'n2', label: 'Alex M.', x: 34, y: 82, cohort: 2025, vouches: 0 },
]

/** Vouch edges — isolated nodes (vouches===0) have no edges. */
export const VOUCH_EDGES: VouchEdge[] = [
  { from: 'm1', to: 'm2' },
  { from: 'm1', to: 'm3' },
  { from: 'm1', to: 'm11' },
  { from: 'm2', to: 'm4' },
  { from: 'm2', to: 'm6' },
  { from: 'm3', to: 'm9' },
  { from: 'm3', to: 'm5' },
  { from: 'm11', to: 'm6' },
  { from: 'm4', to: 'm5' },
  { from: 'm6', to: 'm9' },
  { from: 'm9', to: 'n1' },
]
