import { memberProfiles } from './data/memberProfiles'

export interface CheckOption {
  label: string
  count: string
  checked?: boolean
}
export interface ChipOption {
  label: string
  active?: boolean
}

/** A single thing a member is open to — the chip on the card maps onto these. */
export type OpenTo =
  | 'Mentoring junior peers'
  | 'Portfolio reviews'
  | 'Hosting gatherings'
  | 'Co-hosting an event'
  | 'Collaborating on something'
  | 'Coffee with new arrivals'
  | 'Vouching for a stranger'

export type Identity =
  | 'Trans & non-binary'
  | 'Lesbian'
  | 'Gay'
  | 'Bi / Pan'
  | 'Aro / ace spectrum'
  | 'QPOC / queer of colour'
  | 'Disabled / chronic illness'

export interface MemberCard {
  /** Registry slug — identity (name, initials, tint, photo) is derived from it,
   *  and the card links to `/members/<slug>`. */
  slug: string
  meta: string
  role: string
  tags: { label: string; match?: boolean }[]
  vouch: string
  mutuals: string
  // ---- structured fields the filters / sort run against ----
  openTo: OpenTo[]
  hood: string
  /** Broad professional field — drives the "What they do" filter. */
  discipline: string
  /** Specific job within `discipline` — drives the "Profession" filter. */
  profession: string
  identities: Identity[]
  languages: string[]
  /** Years on QueerPulse. */
  years: number
  /** Sort keys (lower = more recent / earlier). */
  activeRank: number
  joinedRank: number
  vouchCount: number
  mutualsCount: number
}

export const OPEN_TO: CheckOption[] = [
  { label: 'Mentoring junior peers', count: '142', checked: true },
  { label: 'Portfolio reviews', count: '28' },
  { label: 'Hosting gatherings', count: '84', checked: true },
  { label: 'Co-hosting an event', count: '62' },
  { label: 'Collaborating on something', count: '214' },
  { label: 'Coffee with new arrivals', count: '312' },
  { label: 'Vouching for a stranger', count: '68' },
]

export const NEIGHBOURHOODS: ChipOption[] = [
  { label: 'Anjos', active: true },
  { label: 'Mouraria', active: true },
  { label: 'Graça' },
  { label: 'Alfama' },
  { label: 'Bairro Alto' },
  { label: 'Marvila' },
  { label: 'Príncipe Real' },
  { label: 'All of Lisbon' },
]

export const DISCIPLINES: ChipOption[] = [
  { label: 'Design', active: true },
  { label: 'Editorial' },
  { label: 'Healthcare' },
  { label: 'Legal' },
  { label: 'Education' },
  { label: 'Tech' },
  { label: 'Photo' },
  { label: 'Film' },
  { label: 'Performance' },
  { label: 'Music' },
  { label: 'Architecture' },
  { label: 'Community' },
  { label: 'Curation' },
  { label: 'Food' },
  { label: 'Craft' },
  { label: 'Science' },
]

/** Specific professions grouped under each broad field (`discipline`).
 *  The Profession filter narrows to these once a field is chosen. */
export const PROFESSIONS_BY_FIELD: Record<string, string[]> = {
  Design: ['Graphic Designer', 'UX Designer', 'Illustrator', 'Art Director'],
  Editorial: ['Editor', 'Journalist', 'Copywriter', 'Translator', 'Poet'],
  Healthcare: [
    'Therapist',
    'Psychologist',
    'Nurse',
    'GP',
    'Physiotherapist',
    'Peer Counsellor',
    'Community Health Worker',
  ],
  Legal: ['Immigration Lawyer', 'Family Lawyer', 'Paralegal', 'Legal Advocate'],
  Education: ['Teacher', 'Workshop Facilitator', 'Researcher', 'Tutor'],
  Tech: ['Software Engineer', 'Backend Engineer', 'Data Scientist', 'Product Manager'],
  Photo: ['Portrait Photographer', 'Photojournalist', 'Retoucher'],
  Film: ['Documentary Filmmaker', 'Filmmaker', 'Cinematographer', 'Film Editor'],
  Performance: ['Choreographer', 'Dancer', 'Theatre Maker', 'Performance Artist'],
  Music: ['Music Producer', 'DJ', 'Session Musician', 'Sound Designer', 'Music Industry A&R'],
  Architecture: ['Architect', 'Urban Designer', 'Interior Architect'],
  Community: [
    'Community Organiser',
    'Housing Organiser',
    'Housing Advocate',
    'Support Coordinator',
    'Accessibility Advocate',
    'Activist',
  ],
  Curation: ['Curator', 'Archivist', 'Gallery Director'],
  Food: ['Chef', 'Barista', 'Baker', 'Supper Club Host'],
  Craft: ['Ceramicist', 'Woodworker', 'Textile Artist'],
  Science: ['Biologist', 'Ecologist', 'Lab Researcher'],
}

/** Flat list of every profession across all fields. */
export const ALL_PROFESSIONS: string[] = Object.values(PROFESSIONS_BY_FIELD).flat()

/** Reverse lookup: which field a profession belongs to. Used so that picking a
 *  profession from a free-text search also selects its parent field, keeping the
 *  profession ⊆ field invariant (see `reconcileProfessions`). */
export const FIELD_BY_PROFESSION: Record<string, string> = Object.fromEntries(
  Object.entries(PROFESSIONS_BY_FIELD).flatMap(([field, profs]) =>
    profs.map((p) => [p, field]),
  ),
)

/** The professions available to pick given the selected fields.
 *  No field selected → everything; otherwise the union of those fields' pools. */
export function professionsForFields(disciplines: string[]): string[] {
  if (!disciplines.length) return ALL_PROFESSIONS
  const seen = new Set<string>()
  for (const d of disciplines) for (const p of PROFESSIONS_BY_FIELD[d] ?? []) seen.add(p)
  return Array.from(seen)
}

export const IDENTITY: CheckOption[] = [
  { label: 'Trans & non-binary', count: '408' },
  { label: 'Lesbian', count: '214' },
  { label: 'Gay', count: '312' },
  { label: 'Bi / Pan', count: '288' },
  { label: 'Aro / ace spectrum', count: '96' },
  { label: 'QPOC / queer of colour', count: '142' },
  { label: 'Disabled / chronic illness', count: '88' },
]

export const LANGUAGES: ChipOption[] = [
  { label: 'PT', active: true },
  { label: 'EN', active: true },
  { label: 'ES' },
  { label: 'FR' },
  { label: 'DE' },
]

/** Total directory population — drives the "of N members" line. */
export const TOTAL_MEMBERS = 1847

const HOODS = ['Anjos', 'Mouraria', 'Graça', 'Alfama', 'Bairro Alto', 'Marvila', 'Príncipe Real']
const DISCIPLINE_POOL = Object.keys(PROFESSIONS_BY_FIELD)
const OPEN_POOL: OpenTo[] = [
  'Mentoring junior peers',
  'Portfolio reviews',
  'Hosting gatherings',
  'Co-hosting an event',
  'Collaborating on something',
  'Coffee with new arrivals',
  'Vouching for a stranger',
]
const IDENTITY_POOL: Identity[] = [
  'Trans & non-binary',
  'Lesbian',
  'Gay',
  'Bi / Pan',
  'Aro / ace spectrum',
  'QPOC / queer of colour',
  'Disabled / chronic illness',
]
const LANG_POOL = ['PT', 'EN', 'ES', 'FR', 'DE']
const PRONOUNS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they']

/** Per-member facets for the generated directory card. The preview `bio` is a
 *  short third-person echo of the member's own profile bio, and `discipline` /
 *  `profession` are the closest filter-enum bucket for that person — so a card's
 *  preview sentence, tags and the filters it answers to all describe the *real*
 *  member behind the avatar, not a randomly assembled persona.
 *  Keyed by registry slug; see `./data/members`. */
interface MemberFacet {
  discipline: string
  profession: string
  bio: string
}
const SLUG_FACETS: Record<string, MemberFacet> = {
  ines: { discipline: 'Design', profession: 'Graphic Designer', bio: 'Designs brand identities and editorial systems for cultural orgs and small presses.' },
  rui: { discipline: 'Tech', profession: 'Backend Engineer', bio: 'Backend engineer building durable systems, open to mentoring and code review.' },
  sofia: { discipline: 'Film', profession: 'Documentary Filmmaker', bio: 'Documentary filmmaker making slow, observational portraits shot around Lisbon.' },
  tomas: { discipline: 'Food', profession: 'Supper Club Host', bio: 'Runs a twelve-seat supper club in Mouraria — no menu, lots of fermentation.' },
  mariana: { discipline: 'Healthcare', profession: 'Psychologist', bio: 'Clinical psychologist working with LGBTQ+ adults on identity and visibility.' },
  andre: { discipline: 'Photo', profession: 'Portrait Photographer', bio: 'Shoots film portraits, offering free sittings for trans & nonbinary members.' },
  carla: { discipline: 'Tech', profession: 'Product Manager', bio: 'Product manager from fintech, thinking hard about how to build ethically.' },
  beatriz: { discipline: 'Craft', profession: 'Ceramicist', bio: 'Makes functional ceramics in a Graça studio and teaches occasional workshops.' },
  diogo: { discipline: 'Music', profession: 'Music Producer', bio: 'Produces and mixes live sets for queer club nights and stranger projects.' },
  'sofia-rodrigues': { discipline: 'Design', profession: 'UX Designer', bio: "Designs public-service tools that don't make people feel stupid." },
  'tomas-mendes': { discipline: 'Architecture', profession: 'Architect', bio: 'Architect working on co-housing and who gets to stay in a neighbourhood.' },
  anika: { discipline: 'Editorial', profession: 'Poet', bio: 'Translator and poet working between Slovene, English and Portuguese.' },
  jordan: { discipline: 'Community', profession: 'Community Organiser', bio: 'Community organiser facilitating hard conversations, mediation and trust.' },
  maria: { discipline: 'Healthcare', profession: 'Psychologist', bio: 'Clinical psychologist in Porto caring mostly for queer and trans clients.' },
  kai: { discipline: 'Film', profession: 'Filmmaker', bio: 'Filmmaker newly in Lisbon, making documentaries about disappearing places.' },
  monica: { discipline: 'Healthcare', profession: 'Physiotherapist', bio: 'Physiotherapist offering trans-affirming bodywork and post-surgical rehab.' },
  fatima: { discipline: 'Community', profession: 'Support Coordinator', bio: 'Coordinates peer support and crisis referral for queer migrants in Lisbon.' },
  'catarina-vaz': { discipline: 'Community', profession: 'Housing Organiser', bio: 'Housing organiser standing with tenants in Marvila and Graça against eviction.' },
  jonas: { discipline: 'Healthcare', profession: 'Community Health Worker', bio: 'Community health worker doing harm-reduction and PrEP outreach in Cais do Sodré.' },
  'raquel-baptista': { discipline: 'Legal', profession: 'Family Lawyer', bio: 'Pro-bono lawyer taking on queer family law and discrimination cases.' },
  rita: { discipline: 'Design', profession: 'Illustrator', bio: 'Makes zines and queer comics on a temperamental shared-studio risograph.' },
  'sofia-castano': { discipline: 'Photo', profession: 'Photojournalist', bio: 'Documentary photographer of queer nightlife, raised between Vigo and Lisbon.' },
  nuno: { discipline: 'Tech', profession: 'Software Engineer', bio: 'Frontend engineer and accessibility advocate building sites that lock no one out.' },
  luisa: { discipline: 'Curation', profession: 'Curator', bio: 'Curator of contemporary shows, building a stubborn queer community archive.' },
  'mariana-costa': { discipline: 'Editorial', profession: 'Journalist', bio: 'Journalist reporting on the slow machinery of LGBTQ+ rights in Portugal.' },
  'rui-fernandes': { discipline: 'Community', profession: 'Activist', bio: 'Trans-rights activist and essayist, organising in the gaps between meetings.' },
  'catarina-melo': { discipline: 'Community', profession: 'Housing Advocate', bio: 'Housing advocate fighting for queer tenants pushed out by a city for sale.' },
  'sara-pinheiro': { discipline: 'Community', profession: 'Accessibility Advocate', bio: 'Disabled queer accessibility auditor working at the edge of disability justice.' },
  'bilal-kaya': { discipline: 'Music', profession: 'Sound Designer', bio: 'Sound designer for film and theatre, tuning club rigs that hit your chest.' },
  'ines-fonseca': { discipline: 'Performance', profession: 'Choreographer', bio: 'Choreographer making tender, feral contemporary dance about queer bodies.' },
  'daniel-oliveira': { discipline: 'Healthcare', profession: 'Nurse', bio: 'Nurse and harm-reduction worker caring for the clubs around Cais do Sodré.' },
  tiago: { discipline: 'Tech', profession: 'Software Engineer', bio: 'Fullstack developer bringing useful — and sometimes silly — web ideas to life.' },
}

/** All slugs in the registry that resolve to a real person profile. */
const PROFILE_SLUGS = Object.keys(memberProfiles)

/** Tiny deterministic PRNG so the generated directory is stable across renders. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)]
}

function some<T>(arr: T[], r: () => number, min: number, max: number): T[] {
  const n = min + Math.floor(r() * (max - min + 1))
  const copy = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(r() * copy.length), 1)[0])
  }
  return out
}

/** Build a deterministic, filterable directory of `count` members. */
function buildMembers(count: number): MemberCard[] {
  const out: MemberCard[] = []
  for (let i = 0; i < count; i++) {
    const r = rng(i * 9973 + 7)
    const slug = PROFILE_SLUGS[i % PROFILE_SLUGS.length]
    const member = memberProfiles[slug]
    // The card describes the *real* member: bio + filter buckets come from the
    // facet table, with a graceful fallback for any slug not yet curated.
    const facet: MemberFacet = SLUG_FACETS[slug] ?? {
      discipline: pick(DISCIPLINE_POOL, r),
      profession: pick(PROFESSIONS_BY_FIELD[pick(DISCIPLINE_POOL, r)] ?? [], r) ?? 'Member',
      bio: member?.role ?? '',
    }
    const { discipline, profession, bio } = facet
    const hood = pick(HOODS, r)
    const openTo = some(OPEN_POOL, r, 1, 3)
    const identities = some(IDENTITY_POOL, r, 1, 2)
    const languages = ['PT', ...some(LANG_POOL.slice(1), r, 1, 2)]
    const years = Math.floor(r() * 9)
    const vouchCount = 1 + Math.floor(r() * 12)
    const mutualsCount = Math.floor(r() * 14)

    // Show the member's own profile tags so the card reads as one coherent person.
    const realTags = member?.tags ?? []
    const tags: MemberCard['tags'] = [
      ...realTags.slice(0, 2).map((label) => ({ label, match: true })),
      { label: languages.slice(0, 2).join(' · ') },
    ]

    out.push({
      slug,
      meta: `${pick(PRONOUNS, r)} · ${hood}`,
      role: bio,
      tags,
      vouch: `${vouchCount} vouch${vouchCount === 1 ? '' : 'es'}`,
      mutuals: `${mutualsCount} mutual${mutualsCount === 1 ? '' : 's'}`,
      openTo,
      hood,
      discipline,
      profession,
      identities,
      languages,
      years,
      activeRank: i,
      joinedRank: count - i,
      vouchCount,
      mutualsCount,
    })
  }
  return out
}

/** The full generated directory. The list shows a page of these at a time. */
export const MEMBERS: MemberCard[] = buildMembers(360)

/** How many cards are shown per page. */
export const PAGE_SIZE = 12

export type SortKey =
  | 'Recently active'
  | 'Recently joined'
  | 'Closest mutuals'
  | 'A to Z'
  | 'Most vouched'

export const SORTS: SortKey[] = [
  'Recently active',
  'Recently joined',
  'Closest mutuals',
  'A to Z',
  'Most vouched',
]

/** The chips shown applied at the top, with the control + value each maps to. */
export interface AppliedChip {
  label: string
  group: 'openTo' | 'hood' | 'discipline' | 'profession' | 'language' | 'identity'
  value: string
}

/** Everything the controls write into — the single source of truth for results. */
export interface FilterState {
  openTo: string[]
  hoods: string[]
  disciplines: string[]
  professions: string[]
  identities: string[]
  languages: string[]
  yearsFrom: number
  yearsTo: number
}

export const DEFAULT_FILTERS: FilterState = {
  openTo: ['Mentoring junior peers', 'Hosting gatherings'],
  hoods: ['Anjos', 'Mouraria'],
  disciplines: [],
  professions: [],
  identities: [],
  languages: ['PT', 'EN'],
  yearsFrom: 0,
  yearsTo: 9,
}

/** Drop any selected profession that no longer belongs to the selected fields.
 *  Keeps profession ⊆ field coherent after a field is removed. */
export function reconcileProfessions(f: FilterState): FilterState {
  if (!f.disciplines.length) return f
  const allowed = new Set(professionsForFields(f.disciplines))
  const professions = f.professions.filter((p) => allowed.has(p))
  return professions.length === f.professions.length ? f : { ...f, professions }
}

/** Does a member satisfy every active criterion? (AND across groups, OR within.) */
export function matchesFilters(m: MemberCard, f: FilterState): boolean {
  if (f.openTo.length && !f.openTo.some((o) => m.openTo.includes(o as OpenTo))) return false
  // "All of Lisbon" is a non-filtering convenience option.
  const hoods = f.hoods.filter((h) => h !== 'All of Lisbon')
  if (hoods.length && !hoods.includes(m.hood)) return false
  if (f.disciplines.length && !f.disciplines.includes(m.discipline)) return false
  if (f.professions.length && !f.professions.includes(m.profession)) return false
  if (f.identities.length && !f.identities.some((i) => m.identities.includes(i as Identity)))
    return false
  if (f.languages.length && !f.languages.some((l) => m.languages.includes(l))) return false
  if (m.years < f.yearsFrom || m.years > f.yearsTo) return false
  return true
}

/** Returns a new array sorted by the chosen key (non-mutating). */
export function sortMembers(list: MemberCard[], sort: SortKey): MemberCard[] {
  const out = [...list]
  switch (sort) {
    case 'Recently active':
      return out.sort((a, b) => a.activeRank - b.activeRank)
    case 'Recently joined':
      return out.sort((a, b) => a.joinedRank - b.joinedRank)
    case 'Closest mutuals':
      return out.sort((a, b) => b.mutualsCount - a.mutualsCount)
    case 'Most vouched':
      return out.sort((a, b) => b.vouchCount - a.vouchCount)
    case 'A to Z':
      return out.sort((a, b) => a.slug.localeCompare(b.slug))
    default:
      return out
  }
}

/** Flatten the active filters into removable chips for the top-of-results row. */
export function appliedChips(f: FilterState): AppliedChip[] {
  const chips: AppliedChip[] = []
  f.openTo.forEach((value) => chips.push({ label: value, group: 'openTo', value }))
  f.hoods.forEach((value) => chips.push({ label: value, group: 'hood', value }))
  f.disciplines.forEach((value) => chips.push({ label: value, group: 'discipline', value }))
  f.professions.forEach((value) => chips.push({ label: value, group: 'profession', value }))
  f.identities.forEach((value) => chips.push({ label: value, group: 'identity', value }))
  f.languages.forEach((value) => chips.push({ label: value, group: 'language', value }))
  return chips
}
