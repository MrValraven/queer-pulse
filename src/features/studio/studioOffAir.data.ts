import type { ImageSlotTint } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";

/**
 * One off-air shelf card. The meta line is composed at render from
 * `kindKey` (catalog key for the format word), `artist`, `trackCount` and
 * `duration`, joined with " · " in that order; titles, names and running
 * times are proper nouns and figures and stay literal.
 */
export interface OffAirCard {
  to: string;
  tint: ImageSlotTint;
  tag?: "mem" | "free";
  tagLabelKey?: string;
  curator?: string;
  title: string;
  titleEm: string;
  kindKey?: string;
  artist?: string;
  trackCount?: number;
  duration?: string;
  image?: string;
}

export const nightcapImage =
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=600&auto=format&fit=crop";

export const OFF_AIR_LIBRARY: OffAirCard[] = [
  {
    to: routes.studioAlbum,
    tint: "coral",
    tag: "mem",
    tagLabelKey: "studio:tag.sustainer",
    title: "Cidade dos ",
    titleEm: "santos",
    kindKey: "studioShowcase:offAir.meta.kind.album",
    artist: "Mariana Sol",
    trackCount: 11,
    image:
      "https://images.unsplash.com/photo-1636207608470-dfedb46c2380?q=80&w=400&auto=format&fit=crop",
  },
  {
    to: routes.studioSet,
    tint: "plum",
    tag: "free",
    tagLabelKey: "studio:tag.replay",
    curator: "Sara Marques",
    title: "Vespertina ",
    titleEm: "vol. iv",
    kindKey: "studioShowcase:offAir.meta.kind.djSet",
    duration: "1h 42m",
    image:
      "https://images.unsplash.com/photo-1760346738721-bc8e0678623f?q=80&w=800&auto=format&fit=crop",
  },
  {
    to: routes.studioCollection,
    tint: "jade",
    curator: "D. Okoye",
    title: "Songs for ",
    titleEm: "insomnia",
    kindKey: "studioShowcase:offAir.meta.kind.collection",
    trackCount: 22,
    image:
      "https://images.unsplash.com/photo-1765410850178-e71b7fd4251c?q=80&w=800&auto=format&fit=crop",
  },
  {
    to: routes.studioTrack,
    tint: "default",
    tag: "free",
    tagLabelKey: "studio:tag.free",
    title: "The kitchen in ",
    titleEm: "April",
    artist: "Rita Ferreira",
    duration: "3:42",
    image:
      "https://images.unsplash.com/photo-1771790547223-a8be4b8dc1d2?q=80&w=800&auto=format&fit=crop",
  },
  {
    to: routes.studioAlbum,
    tint: "plum",
    tag: "mem",
    tagLabelKey: "studio:tag.sustainer",
    title: "Mother, ",
    titleEm: "weather",
    kindKey: "studioShowcase:offAir.meta.kind.soundtrack",
    artist: "Yuki Tanaka",
    image:
      "https://images.unsplash.com/photo-1773695223075-5ca8b60c433d?q=80&w=800&auto=format&fit=crop",
  },
];

export const QUIET_HOURS: OffAirCard[] = [
  {
    to: routes.studioCollection,
    tint: "jade",
    curator: "Yara Reis",
    title: "Almost ",
    titleEm: "asleep",
    kindKey: "studioShowcase:offAir.meta.kind.collection",
    trackCount: 31,
    image:
      "https://images.unsplash.com/photo-1709562499710-eaaf84729550?q=80&w=400&auto=format&fit=crop",
  },
  {
    to: routes.studioCollection,
    tint: "plum",
    curator: "D. Okoye",
    title: "Trans ",
    titleEm: "composers, slow",
    kindKey: "studioShowcase:offAir.meta.kind.mix",
    duration: "58m",
    image:
      "https://images.unsplash.com/photo-1774386088302-a3242d89ab9f?q=80&w=800&auto=format&fit=crop",
  },
  {
    to: routes.studioCollection,
    tint: "coral",
    curator: "João Ribeiro",
    title: "Rain on the ",
    titleEm: "Tejo",
    kindKey: "studioShowcase:offAir.meta.kind.collection",
    trackCount: 18,
    image:
      "https://images.unsplash.com/photo-1774386088306-0af187923468?q=80&w=800&auto=format&fit=crop",
  },
  {
    to: routes.studioCollection,
    tint: "default",
    curator: "Sofía Castro",
    title: "Piano, one ",
    titleEm: "candle",
    kindKey: "studioShowcase:offAir.meta.kind.ep",
    trackCount: 6,
    image:
      "https://images.unsplash.com/photo-1774386513122-d70499fb0953?q=80&w=800&auto=format&fit=crop",
  },
  {
    to: routes.studioCollection,
    tint: "jade",
    curator: "Coro de Outubro",
    title: "Vespers, ",
    titleEm: "recorded",
    kindKey: "studioShowcase:offAir.meta.kind.live",
    duration: "44m",
    image:
      "https://images.unsplash.com/photo-1774393431893-1a1cee164d3a?q=80&w=800&auto=format&fit=crop",
  },
];
