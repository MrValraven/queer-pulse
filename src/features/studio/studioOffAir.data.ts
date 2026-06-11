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
}

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
  },
  {
    to: routes.studioCollection,
    tint: 'jade',
    curator: 'D. Okoye',
    title: 'Songs for ',
    titleEm: 'insomnia',
    meta: 'Collection · 22 tracks',
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
  },
  {
    to: routes.studioCollection,
    tint: 'plum',
    curator: 'D. Okoye',
    title: 'Trans ',
    titleEm: 'composers, slow',
    meta: 'Mix · 58m',
  },
  {
    to: routes.studioCollection,
    tint: 'coral',
    curator: 'João Ribeiro',
    title: 'Rain on the ',
    titleEm: 'Tejo',
    meta: 'Collection · 18 tracks',
  },
  {
    to: routes.studioCollection,
    tint: 'default',
    curator: 'Sofía Castro',
    title: 'Piano, one ',
    titleEm: 'candle',
    meta: 'EP · 6 tracks',
  },
  {
    to: routes.studioCollection,
    tint: 'jade',
    curator: 'Coro de Outubro',
    title: 'Vespers, ',
    titleEm: 'recorded',
    meta: 'Live · 44m',
  },
]
