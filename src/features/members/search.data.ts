export type ResultType = 'member' | 'gathering' | 'community' | 'board'

export interface SearchItem {
  t: ResultType
  name: string
  sub: string
  href: string
  kw: string
}

export const SEARCH_DATA: SearchItem[] = [
  { t: 'member', name: 'Inês Tavares', sub: 'Graphic Designer · Príncipe Real', href: 'QueerPulse Profile.html', kw: 'design branding type editorial' },
  { t: 'member', name: 'Rui Marçal', sub: 'Software Engineer · Marvila', href: 'QueerPulse Profile.html', kw: 'tech backend rust engineering' },
  { t: 'member', name: 'Sofia Andrade', sub: 'Documentary Filmmaker · Alfama', href: 'QueerPulse Profile.html', kw: 'film directing editing documentary' },
  { t: 'member', name: 'Tomás Beto', sub: 'Chef · Supper Club Host · Mouraria', href: 'QueerPulse Profile.html', kw: 'food supper club fermentation chef' },
  { t: 'member', name: 'Mariana Loução', sub: 'Clinical Psychologist · Estrela', href: 'QueerPulse Profile.html', kw: 'care therapy lgbtq psychologist' },
  { t: 'member', name: 'André Quintela', sub: 'Portrait Photographer · Cais do Sodré', href: 'QueerPulse Profile.html', kw: 'photography analog portrait darkroom' },
  { t: 'member', name: 'Carla Nogueira', sub: 'Product Manager · Arroios', href: 'QueerPulse Profile.html', kw: 'tech product fintech strategy' },
  { t: 'member', name: 'Beatriz Pinto', sub: 'Ceramicist · Graça', href: 'QueerPulse Profile.html', kw: 'craft ceramics studio glazing' },
  { t: 'member', name: 'Diogo Vasques', sub: 'Music Producer · Bairro Alto', href: 'QueerPulse Profile.html', kw: 'music electronic dj producing' },
  { t: 'gathering', name: 'Queer Supper Club №12', sub: 'Mouraria · 6 Jun — 8 seats left', href: 'QueerPulse Gathering.html', kw: 'food social supper dinner' },
  { t: 'gathering', name: 'Portfolio Night: Designers & Photographers', sub: 'Príncipe Real · 14 Jun — 32 going', href: 'QueerPulse Gathering.html', kw: 'design photography portfolio mixer' },
  { t: 'gathering', name: "Inside Beatriz's Ceramics Studio", sub: 'Graça · 21 Jun — 3 spots left', href: 'QueerPulse Gathering.html', kw: 'craft ceramics studio visit' },
  { t: 'gathering', name: 'Founders & Builders Breakfast', sub: 'Marvila · 2 Jul', href: 'QueerPulse Gathering.html', kw: 'founders tech breakfast networking' },
  { t: 'community', name: 'Queer Social Lisbon', sub: 'Social · 340 members · Monthly', href: 'QueerPulse Communities.html', kw: 'social casual meetup monthly' },
  { t: 'community', name: 'Rainbow Arts Collective', sub: 'Arts · 128 members · Monthly', href: 'QueerPulse Communities.html', kw: 'arts visual collective studio' },
  { t: 'community', name: 'Trans Mutual Aid Network', sub: 'Support · 89 members · Ongoing', href: 'QueerPulse Communities.html', kw: 'trans support mutual aid peer' },
  { t: 'community', name: 'Queer Runners Lisboa', sub: 'Sports · 214 members · Weekly', href: 'QueerPulse Communities.html', kw: 'running sports outdoors weekly' },
  { t: 'community', name: 'Queer Hikers Lisboa', sub: 'Sports · 156 members · Weekly', href: 'QueerPulse Communities.html', kw: 'hiking outdoors sintra nature' },
  { t: 'community', name: 'Queer Founders Lisboa', sub: 'Professional · 72 members · Monthly', href: 'QueerPulse Communities.html', kw: 'founders professional startup' },
  { t: 'community', name: 'Queer Tech Lisbon', sub: 'Professional · 134 members · Monthly', href: 'QueerPulse Communities.html', kw: 'tech professional career talks' },
  { t: 'board', name: 'Free portrait sessions for trans & nonbinary members', sub: 'Offering · André Quintela · 2 days ago', href: 'QueerPulse Offer.html', kw: 'portrait free trans nonbinary' },
  { t: 'board', name: 'A collaborator for a queer zine launching in September', sub: 'Looking for · Inês Tavares · 3 days ago', href: 'QueerPulse Offer.html', kw: 'zine collab writing illustration design' },
  { t: 'board', name: 'Monthly mentoring for junior engineers', sub: 'Offering · Rui Marçal · 4 days ago', href: 'QueerPulse Offer.html', kw: 'mentoring tech engineering backend' },
  { t: 'board', name: 'A sublet in Arroios, June through August', sub: 'Looking for · Carla Nogueira · 1 week ago', href: 'QueerPulse Offer.html', kw: 'housing sublet arroios rent' },
  { t: 'board', name: 'Two desks to share in a bright Graça studio', sub: 'Offering · Beatriz Pinto · 1 week ago', href: 'QueerPulse Offer.html', kw: 'desk studio workspace graça' },
  { t: 'board', name: 'A composer for a short documentary, paid', sub: 'Looking for · Sofia Andrade · 2 weeks ago', href: 'QueerPulse Offer.html', kw: 'music composer documentary film paid' },
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
