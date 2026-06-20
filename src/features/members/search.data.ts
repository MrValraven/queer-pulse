import { routes } from '../../app/routeMap'
import { memberName } from './data/members'
export type ResultType = 'member' | 'gathering' | 'community' | 'board'

export interface SearchItem {
  t: ResultType
  name: string
  sub: string
  href: string
  kw: string
}

export const SEARCH_DATA: SearchItem[] = [
  { t: 'member', name: memberName('ines'), sub: 'Graphic Designer · Príncipe Real', href: routes.members, kw: 'design branding type editorial' },
  { t: 'member', name: memberName('rui'), sub: 'Software Engineer · Marvila', href: routes.members, kw: 'tech backend rust engineering' },
  { t: 'member', name: memberName('sofia'), sub: 'Documentary Filmmaker · Alfama', href: routes.members, kw: 'film directing editing documentary' },
  { t: 'member', name: memberName('tomas'), sub: 'Chef · Supper Club Host · Mouraria', href: routes.members, kw: 'food supper club fermentation chef' },
  { t: 'member', name: memberName('mariana'), sub: 'Clinical Psychologist · Estrela', href: routes.members, kw: 'care therapy lgbtq psychologist' },
  { t: 'member', name: memberName('andre'), sub: 'Portrait Photographer · Cais do Sodré', href: routes.members, kw: 'photography analog portrait darkroom' },
  { t: 'member', name: memberName('carla'), sub: 'Product Manager · Arroios', href: routes.members, kw: 'tech product fintech strategy' },
  { t: 'member', name: memberName('beatriz'), sub: 'Ceramicist · Graça', href: routes.members, kw: 'craft ceramics studio glazing' },
  { t: 'member', name: memberName('diogo'), sub: 'Music Producer · Bairro Alto', href: routes.members, kw: 'music electronic dj producing' },
  { t: 'gathering', name: 'Queer Supper Club №12', sub: 'Mouraria · 6 Jun — 8 seats left', href: routes.gathering, kw: 'food social supper dinner' },
  { t: 'gathering', name: 'Portfolio Night: Designers & Photographers', sub: 'Príncipe Real · 14 Jun — 32 going', href: routes.gathering, kw: 'design photography portfolio mixer' },
  { t: 'gathering', name: "Inside Beatriz's Ceramics Studio", sub: 'Graça · 21 Jun — 3 spots left', href: routes.gathering, kw: 'craft ceramics studio visit' },
  { t: 'gathering', name: 'Founders & Builders Breakfast', sub: 'Marvila · 2 Jul', href: routes.gathering, kw: 'founders tech breakfast networking' },
  { t: 'community', name: 'Queer Social Lisbon', sub: 'Social · 340 members · Monthly', href: routes.communities, kw: 'social casual meetup monthly' },
  { t: 'community', name: 'Rainbow Arts Collective', sub: 'Arts · 128 members · Monthly', href: routes.communities, kw: 'arts visual collective studio' },
  { t: 'community', name: 'Trans Mutual Aid Network', sub: 'Support · 89 members · Ongoing', href: routes.communities, kw: 'trans support mutual aid peer' },
  { t: 'community', name: 'Queer Runners Lisboa', sub: 'Sports · 214 members · Weekly', href: routes.communities, kw: 'running sports outdoors weekly' },
  { t: 'community', name: 'Queer Hikers Lisboa', sub: 'Sports · 156 members · Weekly', href: routes.communities, kw: 'hiking outdoors sintra nature' },
  { t: 'community', name: 'Queer Founders Lisboa', sub: 'Professional · 72 members · Monthly', href: routes.communities, kw: 'founders professional startup' },
  { t: 'community', name: 'Queer Tech Lisbon', sub: 'Professional · 134 members · Monthly', href: routes.communities, kw: 'tech professional career talks' },
  { t: 'board', name: 'Free portrait sessions for trans & nonbinary members', sub: `Offering · ${memberName('andre')} · 2 days ago`, href: routes.offer, kw: 'portrait free trans nonbinary' },
  { t: 'board', name: 'A collaborator for a queer zine launching in September', sub: `Looking for · ${memberName('ines')} · 3 days ago`, href: routes.offer, kw: 'zine collab writing illustration design' },
  { t: 'board', name: 'Monthly mentoring for junior engineers', sub: `Offering · ${memberName('rui')} · 4 days ago`, href: routes.offer, kw: 'mentoring tech engineering backend' },
  { t: 'board', name: 'A sublet in Arroios, June through August', sub: `Looking for · ${memberName('carla')} · 1 week ago`, href: routes.offer, kw: 'housing sublet arroios rent' },
  { t: 'board', name: 'Two desks to share in a bright Graça studio', sub: `Offering · ${memberName('beatriz')} · 1 week ago`, href: routes.offer, kw: 'desk studio workspace graça' },
  { t: 'board', name: 'A composer for a short documentary, paid', sub: `Looking for · ${memberName('sofia')} · 2 weeks ago`, href: routes.offer, kw: 'music composer documentary film paid' },
]

export const TYPE_BG: Record<ResultType, string> = {
  member: 'rgba(45,27,61,.08)',
  gathering: 'rgba(74,140,111,.1)',
  community: 'rgba(232,119,90,.1)',
  board: 'rgba(122,82,184,.1)',
}
export const TYPE_ICON: Record<ResultType, string> = {
  member: '👤',
  gathering: '📅',
  community: '🤝',
  board: '📋',
}
export const TYPE_LABEL: Record<ResultType, string> = {
  member: 'Members',
  gathering: 'Gatherings',
  community: 'Communities',
  board: 'Board',
}
export const RECENTS = [
  'portrait sessions',
  'supper club',
  'ceramics studio',
  'mentoring engineers',
  'sublet arroios',
  'documentary composer',
]
export const TABS: { id: ResultType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'member', label: 'Members' },
  { id: 'gathering', label: 'Gatherings' },
  { id: 'community', label: 'Communities' },
  { id: 'board', label: 'Board' },
]
