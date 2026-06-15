import type { ImageSlotTint } from '../../shared/components/ui'

export interface LibItem {
  pre: string
  em?: string
  post?: string
  meta: string
  to: string
  tint: ImageSlotTint
}

export const TABS = ['Albums', 'Sets', 'Collections', 'Tracks'] as const

export const LIBRARY: Record<string, LibItem[]> = {
  Albums: [
    { pre: 'Cidade dos ', em: 'santos', meta: 'Mariana Sol · 11 tracks', to: '/studio/album', tint: 'coral' },
    { pre: 'Marvila ', em: 'nights', meta: 'D. Okoye · 8 tracks', to: '/studio/album', tint: 'jade' },
    { pre: 'Quiet ', em: 'rooms', meta: 'Inês T. · 9 tracks', to: '/studio/album', tint: 'plum' },
  ],
  Sets: [
    { pre: 'Vespertina ', em: 'vol. iv', meta: 'Sara Marques · 58 min', to: '/studio/set', tint: 'plum' },
    { pre: 'The Anjos ', em: 'tape', meta: 'Casa do Comum · 42 min', to: '/studio/set', tint: 'coral' },
  ],
  Collections: [
    { pre: 'Lisbon dyke-bar ', em: 'standards', meta: '28 tracks · curated', to: '/studio/collection', tint: 'jade' },
    { pre: 'Trans ', em: 'composers', meta: 'Mix · D. Okoye', to: '/studio/collection', tint: 'plum' },
  ],
  Tracks: [
    { pre: 'Carta para a ', em: 'santa', meta: 'Mariana Sol · 4:18', to: '/studio/track', tint: 'coral' },
    { pre: 'Madrugada', meta: 'Inês T. · 5:11', to: '/studio/track', tint: 'plum' },
    { pre: 'Última ', em: 'dança', meta: 'Helena P. · 4:50', to: '/studio/track', tint: 'jade' },
  ],
}
