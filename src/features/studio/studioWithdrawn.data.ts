import { routes } from "../../app/routeMap";

/** A card in the "Still available from this artist" grid. */
export interface WithdrawnCard {
  /** Router destination; `undefined` for the design's `href="#"` placeholders. */
  to?: string;
  cvTint: "coral" | "jade" | "plum";
  image: string;
  /** Corner pill on the cover: "Free" or "Sustainer". Omitted when absent. */
  tag?: "free" | "mem";
  tagLabelKey?: string;
  /** Curator credit line ("by Sara Marques" / "All releases"), when present. */
  byCur?: string;
  titlePre: string;
  titleEm?: string;
  meta: string;
}

export const STILL_AVAILABLE: WithdrawnCard[] = [
  {
    to: routes.studioAlbum,
    cvTint: "coral",
    image:
      "https://images.unsplash.com/photo-1635237773272-dcd7a1e16859?q=80&w=600&auto=format&fit=crop",
    tag: "mem",
    tagLabelKey: "studio:tag.sustainer",
    titlePre: "Cidade dos ",
    titleEm: "santos",
    meta: "Mariana Sol · 11 tracks",
  },
  {
    cvTint: "jade",
    image:
      "https://images.unsplash.com/photo-1660585266731-8cb1b1162d70?q=80&w=600&auto=format&fit=crop",
    tag: "free",
    tagLabelKey: "studio:tag.free",
    titlePre: "A ",
    titleEm: "Beja",
    meta: "Mariana Sol · EP",
  },
  {
    to: routes.studioCollection,
    cvTint: "plum",
    image:
      "https://images.unsplash.com/photo-1671703938773-df94fd42e838?q=80&w=600&auto=format&fit=crop",
    byCur: "Sara Marques",
    titlePre: "Songs to play your ",
    titleEm: "mother",
    meta: "Collection · 14 tracks",
  },
  {
    cvTint: "coral",
    image:
      "https://images.unsplash.com/photo-1670956008011-a9dfc94e12b8?q=80&w=600&auto=format&fit=crop",
    tag: "free",
    tagLabelKey: "studio:tag.free",
    titlePre: "The first ",
    titleEm: "Sunday",
    meta: "Mariana Sol · single",
  },
  {
    to: routes.studioArtist,
    cvTint: "jade",
    image:
      "https://images.unsplash.com/photo-1675283090273-4739316cdf80?q=80&w=600&auto=format&fit=crop",
    byCur: "All releases",
    titlePre: "Mariana ",
    titleEm: "Sol",
    meta: "Artist · Sintra",
  },
];
