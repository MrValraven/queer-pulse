import type { SubprofileKind, SubprofileSection } from "./api/subprofiles.api";

/** The six page families. A member never picks one — it is derived from `kind`. */
export type SkinFamily = "stage" | "studio" | "page" | "workshop" | "practice" | "table";

/** kind → skin family. Total over SubprofileKind. Mirrors the design prototype's SKIN_OF. */
export const SKIN_OF: Record<SubprofileKind, SkinFamily> = {
  drag: "stage",
  dj: "stage",
  dancer: "stage",
  performer: "stage",
  musician: "stage",
  visual_artist: "studio",
  photographer: "studio",
  filmmaker: "studio",
  videomaker: "studio",
  designer: "studio",
  writer: "page",
  developer: "workshop",
  maker: "workshop",
  generic: "workshop",
  therapist: "practice",
  chef: "table",
  mixologist: "table",
};

/** The page family for a persona kind. */
export const skinFor = (kind: SubprofileKind): SkinFamily => SKIN_OF[kind];

/** Sections that render as an image grid rather than a list. */
export const VISUAL_SECTIONS: readonly SubprofileSection[] = [
  "portfolio",
  "looks",
  "series",
  "collections",
  "discography",
  "mixes",
  "filmography",
  "videos",
  "selected_work",
  "menus",
  "cocktails",
  "projects",
];

export interface SkinMeta {
  /** Human family name (chrome — English here; UI localises via i18n where shown). */
  name: string;
  /** One-line description of the family's intent. */
  note: string;
  /** Display typeface signature (documentation only). */
  face: string;
  /** Kinds that belong to this family, as display labels (documentation only). */
  kinds: string[];
}

/** Family metadata. Documentation-grade — drives the (future) skin reference and
 *  the create-flow family grouping. Not persisted. */
export const SKIN_META: Record<SkinFamily, SkinMeta> = {
  stage: {
    name: "Stage",
    face: "Anton",
    note: "Poster type, dark ground, marquee rules. For the crafts that happen in front of a room.",
    kinds: ["Drag", "DJ", "Musician", "Dancer", "Performer"],
  },
  studio: {
    name: "Studio",
    face: "Instrument Serif",
    note: "Gallery paper, hairline frames, work first and captions second.",
    kinds: ["Visual artist", "Photographer", "Filmmaker", "Videomaker", "Designer"],
  },
  page: {
    name: "Page",
    face: "Fraunces Light",
    note: "A book column. Wide measure, long line-height, quiet rules.",
    kinds: ["Writer"],
  },
  workshop: {
    name: "Workshop",
    face: "DM Mono",
    note: "Grid paper and monospaced labels. Built things, listed plainly.",
    kinds: ["Developer", "Maker", "Other"],
  },
  practice: {
    name: "Practice",
    face: "DM Sans Medium",
    note: "No display type at all. Calm, credible, generous spacing.",
    kinds: ["Therapist"],
  },
  table: {
    name: "Table",
    face: "Fraunces + leaders",
    note: "A menu sheet. Centred headings, dotted leaders, warm paper.",
    kinds: ["Chef", "Mixologist"],
  },
};
