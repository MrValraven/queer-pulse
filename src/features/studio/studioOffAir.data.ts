import type { ImageSlotTint } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'

export interface OffAirCard {
  to: string
  tint: ImageSlotTint
  tag?: 'mem' | 'free'
  tagLabel?: string
  curator?: string
  title: string
  titleEm: string
  meta: string
  pay?: boolean
  image?: string
}

export const nightcapImage = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=600&auto=format&fit=crop'

export const OFF_AIR_LIBRARY: OffAirCard[] = [
  {
    to: routes.studioAlbum,
    tint: 'coral',
    tag: 'mem',
    tagLabel: 'Sustainer',
    title: 'Cidade dos ',
    titleEm: 'santos',
    meta: 'Album · Mariana Sol · 11 tracks',
    pay: true,
    image: 'https://images.unsplash.com/photo-1636207608470-dfedb46c2380?q=80&w=400&auto=format&fit=crop',
  },
  {
    to: routes.studioSet,
    tint: 'plum',
    tag: 'free',
    tagLabel: 'Replay',
    curator: 'Sara Marques',
    title: 'Vespertina ',
    titleEm: 'vol. iv',
    meta: 'DJ set · 1h 42m',
    image: 'https://images.unsplash.com/photo-1760346738721-bc8e0678623f?q=80&w=800&auto=format&fit=crop',
  },
  {
    to: routes.studioCollection,
    tint: 'jade',
    curator: 'D. Okoye',
    title: 'Songs for ',
    titleEm: 'insomnia',
    meta: 'Collection · 22 tracks',
    image: 'https://images.unsplash.com/photo-1765410850178-e71b7fd4251c?q=80&w=800&auto=format&fit=crop',
  },
  {
    to: routes.studioTrack,
    tint: 'default',
    tag: 'free',
    tagLabel: 'Free',
    title: 'The kitchen in ',
    titleEm: 'April',
    meta: 'Rita Ferreira · 3:42',
    pay: true,
    image: 'https://images.unsplash.com/photo-1771790547223-a8be4b8dc1d2?q=80&w=800&auto=format&fit=crop',
  },
  {
    to: routes.studioAlbum,
    tint: 'plum',
    tag: 'mem',
    tagLabel: 'Sustainer',
    title: 'Mother, ',
    titleEm: 'weather',
    meta: 'Yuki Tanaka · OST',
    pay: true,
    image: 'https://images.unsplash.com/photo-1773695223075-5ca8b60c433d?q=80&w=800&auto=format&fit=crop',
  },
]

export const QUIET_HOURS: OffAirCard[] = [
  {
    to: routes.studioCollection,
    tint: 'jade',
    curator: 'Yara Reis',
    title: 'Almost ',
    titleEm: 'asleep',
    meta: 'Collection · 31 tracks',
    image: 'https://images.unsplash.com/photo-1709562499710-eaaf84729550?q=80&w=400&auto=format&fit=crop',
  },
  {
    to: routes.studioCollection,
    tint: 'plum',
    curator: 'D. Okoye',
    title: 'Trans ',
    titleEm: 'composers, slow',
    meta: 'Mix · 58m',
    image: 'https://images.unsplash.com/photo-1774386088302-a3242d89ab9f?q=80&w=800&auto=format&fit=crop',
  },
  {
    to: routes.studioCollection,
    tint: 'coral',
    curator: 'João Ribeiro',
    title: 'Rain on the ',
    titleEm: 'Tejo',
    meta: 'Collection · 18 tracks',
    image: 'https://images.unsplash.com/photo-1774386088306-0af187923468?q=80&w=800&auto=format&fit=crop',
  },
  {
    to: routes.studioCollection,
    tint: 'default',
    curator: 'Sofía Castro',
    title: 'Piano, one ',
    titleEm: 'candle',
    meta: 'EP · 6 tracks',
    image: 'https://images.unsplash.com/photo-1774386513122-d70499fb0953?q=80&w=800&auto=format&fit=crop',
  },
  {
    to: routes.studioCollection,
    tint: 'jade',
    curator: 'Coro de Outubro',
    title: 'Vespers, ',
    titleEm: 'recorded',
    meta: 'Live · 44m',
    image: 'https://images.unsplash.com/photo-1774393431893-1a1cee164d3a?q=80&w=800&auto=format&fit=crop',
  },
]
