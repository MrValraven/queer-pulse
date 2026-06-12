export interface CheckOption {
  label: string
  count: string
  checked?: boolean
}
export interface ChipOption {
  label: string
  active?: boolean
}
export interface MemberCard {
  /** Registry slug — identity (name, initials, tint, photo) is derived from it,
   *  and the card links to `/profile/<slug>`. */
  slug: string
  meta: string
  role: string
  tags: { label: string; match?: boolean }[]
  vouch: string
  mutuals: string
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
  { label: 'Anjos · 412', active: true },
  { label: 'Mouraria · 184', active: true },
  { label: 'Graça · 142' },
  { label: 'Alfama · 98' },
  { label: 'Bairro Alto · 84' },
  { label: 'Marvila · 62' },
  { label: 'All of Lisbon · 1,612' },
]

export const DISCIPLINES: ChipOption[] = [
  { label: 'Design · 184', active: true },
  { label: 'Editorial · 88' },
  { label: 'Healthcare · 142' },
  { label: 'Legal · 38' },
  { label: 'Education · 112' },
  { label: 'Tech · 218' },
  { label: '+ 14 more' },
]

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
  { label: 'PT · 1,612', active: true },
  { label: 'EN · 1,488', active: true },
  { label: 'ES · 312' },
  { label: 'FR · 142' },
  { label: 'DE · 88' },
]

export const MEMBERS: MemberCard[] = [
  { slug: 'ines', meta: 'she/her · Príncipe Real', role: 'Graphic designer & founder of Atelier Pulso. Reviews portfolios, mentors junior designers, hosts critique nights.', tags: [{ label: 'Design', match: true }, { label: 'Mentoring', match: true }, { label: 'PT · EN' }], vouch: '3 vouches', mutuals: '3 mutuals' },
  { slug: 'andre', meta: 'he/him · Cais do Sodré', role: 'Portrait photographer on film. Hosts darkroom sessions and offers free portraits for trans & nonbinary members.', tags: [{ label: 'Photo', match: true }, { label: 'Hosting', match: true }, { label: 'PT · EN' }], vouch: '1 vouch', mutuals: '4 mutuals' },
  { slug: 'tomas', meta: 'he/him · Mouraria', role: 'Chef & supper club host. Open to catering collaborations, recipe testing and long, slow dinners.', tags: [{ label: 'Food', match: true }, { label: 'Hosting', match: true }], vouch: '2 vouches', mutuals: '1 mutual' },
  { slug: 'luisa', meta: 'she/her · Lisbon', role: 'Curator. Hosts reading groups and mentors emerging curators moving into institutional work.', tags: [{ label: 'Design', match: true }, { label: 'Hosting', match: true }, { label: 'PT · EN' }], vouch: '2 vouches', mutuals: '11 mutuals' },
  { slug: 'sofia-castano', meta: 'she/her · Mouraria', role: 'Photographer. Hosts the Stone Butch Blues reading group. Open to portfolio reviews for image-makers.', tags: [{ label: 'Photo', match: true }, { label: 'Hosting', match: true }, { label: 'PT · EN' }], vouch: '2 vouches', mutuals: '4 mutuals' },
  { slug: 'beatriz', meta: 'she/her · Graça', role: 'Ceramicist. Shares a bright Graça studio and runs monthly wheel-throwing workshops for beginners.', tags: [{ label: 'Craft', match: true }, { label: 'Hosting', match: true }], vouch: '1 vouch', mutuals: '2 mutuals' },
]

export const INITIAL_APPLIED = ['Open to mentoring', 'Hosting gatherings', 'Anjos', 'Mouraria', 'Design', 'PT + EN']
