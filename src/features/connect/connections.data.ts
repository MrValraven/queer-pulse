import { routes } from '../../app/routeMap'
import { MEMBERS, memberName } from '../members/data/members'

export type Tint = 'jade' | 'plum' | undefined
export type TabId = 'all' | 'incoming' | 'outgoing' | 'vouched'

export const PROFILE = routes.members
export const MESSAGES = routes.messages

export interface Person {
  initials: string
  tint?: Tint
  name: string
  pron: string
  role: string
}

/** Structured connection metadata, rendered by the card rather than stored as JSX. */
export interface MetaInfo {
  badge?: string
  mutuals?: number
  mutualsNote?: string
  connected?: string
  sent?: string
  awaiting?: string
  muted?: string
}

export interface ActionLink {
  label: string
  to: string
  variant: 'ghost' | 'primary'
}

export interface AllConnection {
  person: Person
  tags: string[]
  meta: MetaInfo
  actions: ActionLink[]
}
export interface IncomingRequest {
  person: Person
  meta: MetaInfo
  message?: string
}
export interface OutgoingRequest {
  person: Person
  meta: MetaInfo
}
export interface VouchedConnection {
  person: Person
  note: string
}

const DEFAULT_ACTIONS: ActionLink[] = [
  { label: 'Message', to: MESSAGES, variant: 'ghost' },
  { label: 'View profile', to: PROFILE, variant: 'primary' },
]

export const TABS: { id: TabId; label: string; count: string; accent?: boolean }[] = [
  { id: 'all', label: 'All connections', count: '47' },
  { id: 'incoming', label: 'Incoming requests', count: '4', accent: true },
  { id: 'outgoing', label: 'Sent', count: '2' },
  { id: 'vouched', label: 'Vouched-for', count: '11' },
]

export const ALL: AllConnection[] = [
  {
    person: { initials: MEMBERS['catarina-vaz'].initials, name: memberName('catarina-vaz'), pron: 'she/her', role: 'Trans Hub coordinator · long-form writer' },
    tags: ['Activism', 'Writing', 'Trans Hub'],
    meta: { badge: 'Vouched for you', mutuals: 11, connected: 'Mar 2025' },
    actions: DEFAULT_ACTIONS,
  },
  {
    person: { initials: MEMBERS.jonas.initials, tint: 'jade', name: memberName('jonas'), pron: 'he/him', role: 'Reporter, QueerPulse Magazine' },
    tags: ['Editorial', 'Reportage'],
    meta: { mutuals: 8, connected: 'Dec 2024' },
    actions: DEFAULT_ACTIONS,
  },
  {
    person: { initials: MEMBERS.luisa.initials, tint: 'plum', name: memberName('luisa'), pron: 'she/her', role: 'Design director · ex-Atelier Pulso' },
    tags: ['Design', 'Mentoring'],
    meta: { badge: 'You vouched', mutuals: 14 },
    actions: [
      { label: 'Book review', to: routes.offer, variant: 'ghost' },
      { label: 'Message', to: MESSAGES, variant: 'primary' },
    ],
  },
  {
    person: { initials: MEMBERS.anika.initials, name: memberName('anika'), pron: 'she/her', role: 'Healthcare designer · Trans & NB Network' },
    tags: ['Design', 'Health', 'Hosting'],
    meta: { mutuals: 6, connected: 'Jan 2026' },
    actions: [
      { label: 'Co-host', to: routes.host, variant: 'ghost' },
      { label: 'Message', to: MESSAGES, variant: 'primary' },
    ],
  },
  {
    person: { initials: 'RV', tint: 'jade', name: 'Rita Vasquez', pron: 'they/them', role: 'Therapist · Café Beirão regular' },
    tags: ['Wellbeing', 'Therapy'],
    meta: { badge: 'Mutual vouch', mutuals: 9 },
    actions: DEFAULT_ACTIONS,
  },
  {
    person: { initials: MEMBERS.nuno.initials, tint: 'plum', name: memberName('nuno'), pron: 'he/him', role: 'Trans Hub coordinator' },
    tags: ['Activism', 'Trans Hub'],
    meta: { mutuals: 11, connected: 'Feb 2025' },
    actions: DEFAULT_ACTIONS,
  },
  {
    person: { initials: MEMBERS['sofia-castano'].initials, name: memberName('sofia-castano'), pron: 'she/her', role: 'Service designer · reading group host' },
    tags: ['Design', 'Reading'],
    meta: { mutuals: 4, connected: 'Apr 2026' },
    actions: DEFAULT_ACTIONS,
  },
  {
    person: { initials: 'SP', tint: 'jade', name: 'Sara Pinheiro', pron: 'she/her', role: 'Contributing editor · Magazine' },
    tags: ['Editorial', 'Health'],
    meta: { mutuals: 13, connected: 'Sep 2025' },
    actions: [
      { label: 'Message', to: MESSAGES, variant: 'ghost' },
      { label: 'View profile', to: routes.author, variant: 'primary' },
    ],
  },
]

export const INCOMING: IncomingRequest[] = [
  {
    person: { initials: 'EM', name: 'Emília Marques', pron: 'she/her', role: 'Photographer · met at Riso open-house' },
    meta: { mutuals: 3, mutualsNote: 'including Anika', sent: '2h ago' },
    message: '"Hi Tomás! We met briefly at the riso night, I\'m working on a series and would love to chat sometime."',
  },
  {
    person: { initials: 'DR', tint: 'jade', name: 'Daniel Reis', pron: 'he/him', role: 'Junior designer · seen your portfolio piece' },
    meta: { mutuals: 1, mutualsNote: 'Luísa', sent: 'yesterday' },
  },
  {
    person: { initials: 'MM', tint: 'plum', name: 'Mira Martín', pron: 'they/them', role: 'New member · vouched-for by Catarina' },
    meta: { mutuals: 2, sent: '3 days ago' },
  },
  {
    person: { initials: 'PV', name: 'Pedro Vinhas', pron: 'he/him', role: "No mutuals · we don't see why" },
    meta: { muted: 'No mutuals — review carefully' },
  },
]

export const OUTGOING: OutgoingRequest[] = [
  {
    person: { initials: 'MR', name: 'Marta Reis', pron: 'she/her', role: 'Editor · QueerPulse Magazine' },
    meta: { awaiting: '2 days ago' },
  },
  {
    person: { initials: 'FL', tint: 'jade', name: 'Filipa Lopes', pron: 'she/her', role: 'Riso open-house · met last weekend' },
    meta: { awaiting: '5 days ago' },
  },
]

export const VOUCHED: VouchedConnection[] = [
  { person: { initials: 'CV', name: 'Catarina Vaz', pron: 'she/her', role: 'Mutual vouch · 2024' }, note: 'Vouched both ways' },
  { person: { initials: 'RV', tint: 'jade', name: 'Rita Vasquez', pron: 'they/them', role: 'Mutual vouch · 2025' }, note: 'Vouched both ways' },
  { person: { initials: 'LG', tint: 'plum', name: 'Luísa Gomes', pron: 'she/her', role: 'You vouched · 2025' }, note: 'You vouched' },
]

/** Additional pages of connections, generated deterministically for "Load more". */
const MORE_POOL: { name: string; pron: string; role: string; tags: string[]; tint?: Tint }[] = [
  { name: 'Beatriz Lima', pron: 'she/her', role: 'Illustrator · zine collective', tags: ['Illustration', 'Print'] },
  { name: 'Tó Cunha', pron: 'he/him', role: 'Riso printmaker · workshop host', tags: ['Print', 'Hosting'], tint: 'jade' },
  { name: 'Inês Tavares', pron: 'she/her', role: 'GP · Trans & NB Network', tags: ['Health', 'Mentoring'], tint: 'plum' },
  { name: 'Hugo Branco', pron: 'he/him', role: 'Sound designer · club nights', tags: ['Music', 'Events'] },
  { name: 'Nadia Saleh', pron: 'they/them', role: 'Researcher · housing rights', tags: ['Activism', 'Research'], tint: 'jade' },
  { name: 'Pilar Otero', pron: 'she/her', role: 'Editor · community newsletter', tags: ['Editorial'], tint: 'plum' },
  { name: 'Vasco Pinto', pron: 'he/him', role: 'Carpenter · barter regular', tags: ['Barter', 'Making'] },
  { name: 'Lena Costa', pron: 'she/her', role: 'Therapist · Wellbeing circle', tags: ['Wellbeing', 'Therapy'], tint: 'jade' },
]

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const MORE_PER_PAGE = 4

/** Returns deterministic extra connections for a 0-based page; empty when exhausted. */
export function moreConnections(page: number): AllConnection[] {
  const start = page * MORE_PER_PAGE
  return MORE_POOL.slice(start, start + MORE_PER_PAGE).map((p, i) => ({
    person: { initials: initialsOf(p.name), tint: p.tint, name: p.name, pron: p.pron, role: p.role },
    tags: p.tags,
    meta: { mutuals: 3 + ((start + i) % 9), connected: '2025' },
    actions: DEFAULT_ACTIONS,
  }))
}

export const MORE_PAGES = Math.ceil(MORE_POOL.length / MORE_PER_PAGE)
