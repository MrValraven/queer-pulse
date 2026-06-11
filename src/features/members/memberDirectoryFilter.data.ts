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
  initials: string
  tint?: 'jade' | 'plum'
  name: string
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
  { initials: 'LG', name: 'Luísa Gomes', meta: 'she/her · Mouraria', role: 'Design director, ex-Atelier Pulso. Reviews portfolios, mentors junior designers, hosts critique nights.', tags: [{ label: 'Design', match: true }, { label: 'Mentoring', match: true }, { label: 'PT · EN' }], vouch: '3 vouches', mutuals: '3 mutuals' },
  { initials: 'AB', tint: 'jade', name: 'André Bento', meta: 'he/him · Anjos', role: 'Co-founder of Atelier Pulso. Hosts Open Studio monthly. Mentors mid-career designers in identity systems.', tags: [{ label: 'Design', match: true }, { label: 'Hosting', match: true }, { label: 'PT · EN' }], vouch: '7 vouches', mutuals: '4 mutuals' },
  { initials: 'TC', tint: 'plum', name: 'Tó Cunha', meta: 'he/him · Anjos', role: 'Riso printer at Editora Anjos. Runs the 6-week risograph workshop. Open to mentoring & co-hosting print nights.', tags: [{ label: 'Design', match: true }, { label: 'Mentoring', match: true }, { label: 'Hosting', match: true }], vouch: '2 vouches', mutuals: '1 mutual' },
  { initials: 'MR', name: 'Marta Reis', meta: 'she/her · Anjos', role: 'Editor in chief of QueerPulse Magazine. Hosts Open Studio. Mentors designers moving into editorial.', tags: [{ label: 'Design', match: true }, { label: 'Editorial' }, { label: 'Hosting', match: true }], vouch: '9 vouches', mutuals: '11 mutuals' },
  { initials: 'SC', tint: 'jade', name: 'Sofia Castaño', meta: 'she/her · Mouraria', role: 'Service designer. Hosts the Stone Butch Blues reading group. Open to portfolio reviews for service designers.', tags: [{ label: 'Design', match: true }, { label: 'Hosting', match: true }, { label: 'PT · EN' }], vouch: '2 vouches', mutuals: '4 mutuals' },
  { initials: 'FL', tint: 'plum', name: 'Filipa Lopes', meta: 'she/her · Anjos', role: 'Brand designer · Atelier Pulso. Co-hosts Porto launch. Mentors juniors making the city move.', tags: [{ label: 'Design', match: true }, { label: 'Mentoring', match: true }], vouch: '1 vouch', mutuals: '2 mutuals' },
]

export const INITIAL_APPLIED = ['Open to mentoring', 'Hosting gatherings', 'Anjos', 'Mouraria', 'Design', 'PT + EN']
