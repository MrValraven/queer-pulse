import type { ImageSlotTint } from '../../shared/components/ui'

export interface LibItem {
  pre: string
  em?: string
  post?: string
  meta: string
  to: string
  tint: ImageSlotTint
  image?: string
}

export const TABS = ['Albums', 'Sets', 'Collections', 'Tracks'] as const

export const LIBRARY: Record<string, LibItem[]> = {
  Albums: [
    { pre: 'Cidade dos ', em: 'santos', meta: 'Mariana Sol · 11 tracks', to: '/studio/album', tint: 'coral', image: 'https://images.unsplash.com/photo-1758391407796-ca8949b88a01?q=80&w=400&auto=format&fit=crop' },
    { pre: 'Marvila ', em: 'nights', meta: 'D. Okoye · 8 tracks', to: '/studio/album', tint: 'jade', image: 'https://images.unsplash.com/photo-1635237773272-dcd7a1e16859?q=80&w=800&auto=format&fit=crop' },
    { pre: 'Quiet ', em: 'rooms', meta: 'Inês T. · 9 tracks', to: '/studio/album', tint: 'plum', image: 'https://images.unsplash.com/photo-1636207608470-dfedb46c2380?q=80&w=800&auto=format&fit=crop' },
  ],
  Sets: [
    { pre: 'Vespertina ', em: 'vol. iv', meta: 'Sara Marques · 58 min', to: '/studio/set', tint: 'plum', image: 'https://images.unsplash.com/photo-1657627157213-c5f44dbd0724?q=80&w=800&auto=format&fit=crop' },
    { pre: 'The Anjos ', em: 'tape', meta: 'Casa do Comum · 42 min', to: '/studio/set', tint: 'coral', image: 'https://images.unsplash.com/photo-1670956008011-a9dfc94e12b8?q=80&w=800&auto=format&fit=crop' },
  ],
  Collections: [
    { pre: 'Lisbon dyke-bar ', em: 'standards', meta: '28 tracks · curated', to: '/studio/collection', tint: 'jade', image: 'https://images.unsplash.com/photo-1671703938773-df94fd42e838?q=80&w=800&auto=format&fit=crop' },
    { pre: 'Trans ', em: 'composers', meta: 'Mix · D. Okoye', to: '/studio/collection', tint: 'plum', image: 'https://images.unsplash.com/photo-1675283090273-4739316cdf80?q=80&w=800&auto=format&fit=crop' },
  ],
  Tracks: [
    { pre: 'Carta para a ', em: 'santa', meta: 'Mariana Sol · 4:18', to: '/studio/track', tint: 'coral', image: 'https://images.unsplash.com/photo-1679967488543-5a0655c54227?q=80&w=800&auto=format&fit=crop' },
    { pre: 'Madrugada', meta: 'Inês T. · 5:11', to: '/studio/track', tint: 'plum', image: 'https://images.unsplash.com/photo-1680443674341-8d75146757b2?q=80&w=800&auto=format&fit=crop' },
    { pre: 'Última ', em: 'dança', meta: 'Helena P. · 4:50', to: '/studio/track', tint: 'jade', image: 'https://images.unsplash.com/photo-1682579280153-5ea1d3bb95ac?q=80&w=800&auto=format&fit=crop' },
  ],
}
