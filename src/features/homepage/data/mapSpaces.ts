import type { MapSpace, MapSpaceType } from './types'

export const MAP_COLORS: Record<MapSpaceType, string> = {
  venue: '#E8775A',
  studio: '#F0EBE3',
  community: '#4A8C6F',
  org: '#9B6FD4',
}

export const mapFilters: { value: 'all' | MapSpaceType; label: string }[] = [
  { value: 'all', label: 'All spaces' },
  { value: 'venue', label: 'Safe venues' },
  { value: 'studio', label: 'Member studios' },
  { value: 'community', label: 'Community spaces' },
  { value: 'org', label: 'Organisations' },
]

export const mapLegend: { type: MapSpaceType; label: string }[] = [
  { type: 'venue', label: 'Safe venues' },
  { type: 'studio', label: 'Member studios' },
  { type: 'community', label: 'Community spaces' },
  { type: 'org', label: 'Organisations' },
]

export const mapSpaces: MapSpace[] = [
  { type: 'venue', x: 190, y: 250, color: MAP_COLORS.venue, label: 'A Cena', title: 'A Cena · Queer bar & live music · Príncipe Real' },
  { type: 'venue', x: 317, y: 275, color: MAP_COLORS.venue, title: 'Tasca Queerlândia · Queer-welcoming · Mouraria' },
  { type: 'community', x: 174, y: 230, color: MAP_COLORS.community, label: 'Arquivo Queer', title: 'Arquivo Queer · Community library · Príncipe Real' },
  { type: 'community', x: 349, y: 260, color: MAP_COLORS.community, title: 'Espaço Comunidade · Gathering space · Mouraria' },
  { type: 'community', x: 374, y: 204, color: MAP_COLORS.community, label: 'Hub Arroios', title: 'Hub Arroios · Community space · Arroios' },
  { type: 'studio', x: 435, y: 230, color: MAP_COLORS.studio, label: 'Studio Graça', title: 'Studio Graça · Ceramics studio · Graça' },
  { type: 'studio', x: 167, y: 242, color: MAP_COLORS.studio, title: 'Studio Príncipe Real · Design studio · Príncipe Real' },
  { type: 'studio', x: 617, y: 264, color: MAP_COLORS.studio, title: 'Ateliê Marvila · Member workshop · Marvila' },
  { type: 'org', x: 393, y: 194, color: MAP_COLORS.org, label: 'ILGA Portugal', title: 'ILGA Portugal · LGBTQ+ advocacy · Arroios' },
  { type: 'org', x: 447, y: 274, color: MAP_COLORS.org, title: 'Opus Diversus · Queer arts org · Alfama' },
]
