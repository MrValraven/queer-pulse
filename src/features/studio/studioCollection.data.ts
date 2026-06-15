import type { ImageSlotTint } from '../../shared/components/ui'

export const COLLECTION = {
  title: 'Lisbon dyke-bar ',
  em: 'standards',
  curator: 'Sara Marques',
  count: '28 tracks',
  hours: '1h 54m',
  blurb: 'The songs that actually get played — at Purex, at the Anjos back room, at every house party that goes past 4am. Curated from the catalogue, paid to the artists on every listen.',
}

export interface CollTrack {
  pre: string
  em?: string
  post?: string
  meta: string
  tint: ImageSlotTint
}

export const TRACKS: CollTrack[] = [
  { pre: 'Carta para a ', em: 'santa', meta: 'Mariana Sol · 4:18', tint: 'coral' },
  { pre: 'Vespertina ', em: 'vol. iv', meta: 'Sara Marques · 6:02', tint: 'plum' },
  { pre: 'Anjos ', em: 'tape', meta: 'D. Okoye · 3:44', tint: 'jade' },
  { pre: 'Madrugada', meta: 'Inês T. · 5:11', tint: 'plum' },
  { pre: 'Purex ', em: 'theme', meta: 'Various · 3:02', tint: 'coral' },
  { pre: 'Última ', em: 'dança', meta: 'Helena P. · 4:50', tint: 'jade' },
]

export const RELATED = [
  { pre: 'Trans ', em: 'composers', meta: 'Mix · D. Okoye', tint: 'plum' as const },
  { pre: 'Late ', em: 'Marvila', meta: 'Collection · 19 tracks', tint: 'coral' as const },
  { pre: 'Fado ', em: 'reworked', meta: 'Collection · 12 tracks', tint: 'jade' as const },
]
