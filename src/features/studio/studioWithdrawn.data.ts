import { routes } from "../../app/routeMap";
import type { TranslateOptions } from "../../shared/i18n/types";

/** A card in the "Still available from this artist" grid. */
export interface WithdrawnCard {
  /** Router destination; `undefined` for the design's `href="#"` placeholders. */
  to?: string;
  cvTint: "coral" | "jade" | "plum";
  image: string;
  /** Corner pill on the cover: "Free" or "Sustainer". Omitted when absent. */
  tag?: "free" | "mem";
  tagLabelKey?: string;
  /** Curator credit line: a person's name, kept literal. */
  byCur?: string;
  /** Curator credit line as a catalog key ("All releases"). */
  byCurKey?: string;
  titlePre: string;
  titleEm?: string;
  /** The facts line under the title: a catalog key plus its values. */
  metaKey: string;
  metaValues?: TranslateOptions;
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
    metaKey: "studioShowcase:withdrawn.still.meta.artistTracks",
    metaValues: { artist: "Mariana Sol", count: 11 },
  },
  {
    cvTint: "jade",
    image:
      "https://images.unsplash.com/photo-1660585266731-8cb1b1162d70?q=80&w=600&auto=format&fit=crop",
    tag: "free",
    tagLabelKey: "studio:tag.free",
    titlePre: "A ",
    titleEm: "Beja",
    metaKey: "studioShowcase:withdrawn.still.meta.artistEp",
    metaValues: { artist: "Mariana Sol" },
  },
  {
    to: routes.studioCollection,
    cvTint: "plum",
    image:
      "https://images.unsplash.com/photo-1671703938773-df94fd42e838?q=80&w=600&auto=format&fit=crop",
    byCur: "Sara Marques",
    titlePre: "Songs to play your ",
    titleEm: "mother",
    metaKey: "studioShowcase:withdrawn.still.meta.collectionTracks",
    metaValues: { count: 14 },
  },
  {
    cvTint: "coral",
    image:
      "https://images.unsplash.com/photo-1670956008011-a9dfc94e12b8?q=80&w=600&auto=format&fit=crop",
    tag: "free",
    tagLabelKey: "studio:tag.free",
    titlePre: "The first ",
    titleEm: "Sunday",
    metaKey: "studioShowcase:withdrawn.still.meta.artistSingle",
    metaValues: { artist: "Mariana Sol" },
  },
  {
    to: routes.studioArtist,
    cvTint: "jade",
    image:
      "https://images.unsplash.com/photo-1675283090273-4739316cdf80?q=80&w=600&auto=format&fit=crop",
    byCurKey: "studioShowcase:withdrawn.still.allReleases",
    titlePre: "Mariana ",
    titleEm: "Sol",
    metaKey: "studioShowcase:withdrawn.still.meta.artistCity",
    metaValues: { city: "Sintra" },
  },
];
