import type { ImageSlotTint } from '../../shared/components/ui'

export const FILTERS = ['Everything', 'Artists', 'Albums', 'Sets', 'Collections', 'Sheet music']

export interface Result {
  pre: string
  em?: string
  post?: string
  meta: string
  kind: string
  to: string
  tint: ImageSlotTint
}

export const RESULTS: Result[] = [
  { pre: 'Mariana ', em: 'Sol', meta: 'Artist · 11 tracks · Lisbon', kind: 'Artists', to: '/studio/artist', tint: 'coral' },
  { pre: 'Cidade dos ', em: 'santos', meta: 'Album · Mariana Sol', kind: 'Albums', to: '/studio/album', tint: 'coral' },
  { pre: 'Vespertina ', em: 'vol. iv', meta: 'Set · Sara Marques', kind: 'Sets', to: '/studio/set', tint: 'plum' },
  { pre: 'Lisbon dyke-bar ', em: 'standards', meta: 'Collection · 28 tracks', kind: 'Collections', to: '/studio/collection', tint: 'jade' },
  { pre: 'Trans ', em: 'composers', meta: 'Mix · D. Okoye', kind: 'Collections', to: '/studio/collection', tint: 'plum' },
  { pre: 'Carta para a ', em: 'santa', meta: 'Lead sheet · Mariana Sol', kind: 'Sheet music', to: '/studio/sheet-store', tint: 'coral' },
  { pre: 'D. ', em: 'Okoye', meta: 'Artist · 6 tracks · Marvila', kind: 'Artists', to: '/studio/artist', tint: 'jade' },
  { pre: 'The Anjos ', em: 'tape', meta: 'Set · Casa do Comum', kind: 'Sets', to: '/studio/set', tint: 'coral' },
]

export const RECENT = ['fado reworked', 'sara marques', 'trans composers', 'sheet music']
