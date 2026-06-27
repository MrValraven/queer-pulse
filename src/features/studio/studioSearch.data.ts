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
  image?: string
}

export const RESULTS: Result[] = [
  { pre: 'Mariana ', em: 'Sol', meta: 'Artist · 11 tracks · Lisbon', kind: 'Artists', to: '/studio/artist', tint: 'coral', image: 'https://images.unsplash.com/photo-1635169852185-37f90ac07189?q=80&w=400&auto=format&fit=crop' },
  { pre: 'Cidade dos ', em: 'santos', meta: 'Album · Mariana Sol', kind: 'Albums', to: '/studio/album', tint: 'coral', image: 'https://images.unsplash.com/photo-1528643609128-c50fdc20cc58?q=80&w=800&auto=format&fit=crop' },
  { pre: 'Vespertina ', em: 'vol. iv', meta: 'Set · Sara Marques', kind: 'Sets', to: '/studio/set', tint: 'plum', image: 'https://images.unsplash.com/photo-1565502233254-3d22afd146eb?q=80&w=800&auto=format&fit=crop' },
  { pre: 'Lisbon dyke-bar ', em: 'standards', meta: 'Collection · 28 tracks', kind: 'Collections', to: '/studio/collection', tint: 'jade', image: 'https://images.unsplash.com/photo-1566108253680-7c860e4633a3?q=80&w=800&auto=format&fit=crop' },
  { pre: 'Trans ', em: 'composers', meta: 'Mix · D. Okoye', kind: 'Collections', to: '/studio/collection', tint: 'plum', image: 'https://images.unsplash.com/photo-1585310808021-c2221275d7ad?q=80&w=800&auto=format&fit=crop' },
  { pre: 'Carta para a ', em: 'santa', meta: 'Lead sheet · Mariana Sol', kind: 'Sheet music', to: '/studio/sheet-store', tint: 'coral', image: 'https://images.unsplash.com/photo-1615749303653-6d12ed97eb1e?q=80&w=800&auto=format&fit=crop' },
  { pre: 'D. ', em: 'Okoye', meta: 'Artist · 6 tracks · Marvila', kind: 'Artists', to: '/studio/artist', tint: 'jade', image: 'https://images.unsplash.com/photo-1618327907102-e07a8d7081c6?q=80&w=800&auto=format&fit=crop' },
  { pre: 'The Anjos ', em: 'tape', meta: 'Set · Casa do Comum', kind: 'Sets', to: '/studio/set', tint: 'coral', image: 'https://images.unsplash.com/photo-1618853606853-bacd55fb7f70?q=80&w=800&auto=format&fit=crop' },
]

export const RECENT = ['fado reworked', 'sara marques', 'trans composers', 'sheet music']
