import type { SubprofileKind, SubprofileSection } from "./api/subprofiles.api";

/** The seven page families. A member never picks one — it is derived from `kind`. */
export type SkinFamily =
  | "stage"
  | "studio"
  | "page"
  | "workshop"
  | "practice"
  | "table"
  | "chart"
  | "chair"
  | "runway"
  | "gallery"
  | "history"
  | "collective"
  | "classroom";

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
  astrologer: "chart",
  // stage (new kinds)
  comedian: "stage",
  vocalist: "stage",
  burlesque: "stage",
  circus: "stage",
  spoken_word: "stage",
  host: "stage",
  voguer: "stage",
  pole_dancer: "stage",
  // studio (new kinds)
  illustrator: "studio",
  tattoo_artist: "studio",
  animator: "studio",
  comic_artist: "studio",
  game_designer: "studio",
  artist_3d: "studio",
  printmaker: "studio",
  // page (new kinds)
  journalist: "page",
  poet: "page",
  editor: "page",
  screenwriter: "page",
  translator: "page",
  zinester: "page",
  academic: "page",
  // workshop (new kinds)
  ceramicist: "workshop",
  jeweler: "workshop",
  textile_artist: "workshop",
  woodworker: "workshop",
  florist: "workshop",
  data_scientist: "workshop",
  // practice (new kinds)
  coach: "practice",
  bodyworker: "practice",
  yoga_teacher: "practice",
  nutritionist: "practice",
  doula: "practice",
  personal_trainer: "practice",
  sex_educator: "practice",
  peer_support: "practice",
  // table (new kinds)
  baker: "table",
  barista: "table",
  brewer: "table",
  sommelier: "table",
  caterer: "table",
  // chair (new family)
  hair_stylist: "chair",
  barber: "chair",
  makeup_artist: "chair",
  nail_artist: "chair",
  esthetician: "chair",
  piercer: "chair",
  // runway (new family)
  fashion_designer: "runway",
  stylist: "runway",
  model: "runway",
  costume_designer: "runway",
  // gallery (new family)
  curator: "gallery",
  gallerist: "gallery",
  art_dealer: "gallery",
  archivist: "gallery",
  conservator: "gallery",
  registrar: "gallery",
  exhibition_designer: "gallery",
  art_critic: "gallery",
  docent: "gallery",
  preparator: "gallery",
  // history (new family — "Record")
  historian: "history",
  art_historian: "history",
  oral_historian: "history",
  genealogist: "history",
  heritage: "history",
  archival_researcher: "history",
  memory_keeper: "history",
  // collective (new family — "Poster")
  organizer: "collective",
  activist: "collective",
  event_producer: "collective",
  promoter: "collective",
  // classroom (new family)
  teacher: "classroom",
  facilitator: "classroom",
  tutor: "classroom",
  lecturer: "classroom",
};

/** The page family for a persona kind. */
export const skinFor = (kind: SubprofileKind): SkinFamily => SKIN_OF[kind];

/**
 * Sections that render as an image grid rather than a list. Excludes the
 * universal `gallery` section on purpose: `sectionShape()` in
 * `personaSkinRender.ts` already resolves `gallery` to its own `"gallery"`
 * shape via an explicit check that runs before this list is consulted, so
 * gallery's membership here would be inert for rendering — but
 * `getStudioWorks()` (`skins/studioWorks.ts`) filters on this same array to
 * build the studio lightbox/checklist, and gallery items carry no `title`,
 * so including "gallery" here leaked blank-titled items into that flow.
 */
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
  // Personas expansion — new visual (image-grid) sections
  "pieces",
  "flash",
  "healed",
  "strips",
  "games",
  "models",
  "editions",
  "wares",
  "builds",
  "arrangements",
  "bakes",
  "cuts",
  "nail_sets",
  "piercings",
  "editorials",
  "book",
  "sketches",
  "available",
  "installations",
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
    kinds: ["Drag", "DJ", "Musician", "Dancer", "Performer", "Pole dancer"],
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
  chart: {
    name: "Chart",
    face: "Cormorant Light",
    note: "An ephemeris page. Indigo ground, house numerals down the gutter, everything centred on an axis.",
    kinds: ["Astrologer"],
  },
  chair: {
    name: "Chair",
    face: "Bodoni Moda",
    note: "A lit mirror. Bulbs across the top, high-contrast type, a price list that never asks your gender.",
    kinds: [
      "Hair stylist",
      "Barber",
      "Makeup artist",
      "Nail artist",
      "Esthetician",
      "Piercer",
    ],
  },
  runway: {
    name: "Runway",
    face: "Syne Extrabold",
    note: "A lookbook spread. Enormous name, tiny credits, tall images walking down the page.",
    kinds: ["Fashion designer", "Stylist", "Model", "Costume designer"],
  },
  gallery: {
    name: "Gallery",
    face: "EB Garamond",
    note: "Museum-grade air. Every item is a wall label — title, date, medium, accession number.",
    kinds: [
      "Curator",
      "Gallerist",
      "Archivist",
      "Conservator",
      "Registrar",
      "Art critic",
      "Docent",
    ],
  },
  history: {
    name: "Record",
    face: "Libre Caslon",
    note: "Aged paper and a timeline. Dates live in the margin, sources are named, gaps are admitted.",
    kinds: [
      "Historian",
      "Oral historian",
      "Genealogist",
      "Heritage",
      "Memory keeper",
    ],
  },
  collective: {
    name: "Poster",
    face: "Archivo Black",
    note: "Riso ink on cheap paper. Stacked caps, a demand at the top, dates you can read across a room.",
    kinds: ["Organiser", "Activist", "Event producer", "Promoter"],
  },
  classroom: {
    name: "Classroom",
    face: "Newsreader",
    note: "A board and a handout. Numbered weeks, plain promises, fees stated before you ask.",
    kinds: ["Teacher", "Workshop facilitator", "Tutor", "Lecturer"],
  },
};
