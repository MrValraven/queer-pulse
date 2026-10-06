import type { IconType } from "react-icons";
import {
  FiActivity,
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCamera,
  FiClipboard,
  FiCode,
  FiCoffee,
  FiDisc,
  FiEdit,
  FiEdit3,
  FiFeather,
  FiFileText,
  FiFilm,
  FiFlag,
  FiGitBranch,
  FiGlobe,
  FiGrid,
  FiHeadphones,
  FiHeart,
  FiImage,
  FiLayers,
  FiLink,
  FiMapPin,
  FiMic,
  FiMoon,
  FiPlayCircle,
  FiRadio,
  FiScissors,
  FiSearch,
  FiSmartphone,
  FiStar,
  FiTag,
  FiTool,
  FiTruck,
  FiUsers,
  FiVideo,
} from "react-icons/fi";
import {
  GiBookshelf,
  GiCog,
  GiDiceTwentyFacesTwenty,
  GiDramaMasks,
  GiJigsawPiece,
  GiLaurelsTrophy,
  GiMeeple,
  GiMicrophone,
  GiPaintBrush,
  GiRollingDices,
  GiScrollUnfurled,
  GiSpellBook,
  GiStopwatch,
  GiSwordsEmblem,
  GiTheaterCurtains,
  GiTreasureMap,
  GiTrophyCup,
  GiVideoCamera,
} from "react-icons/gi";
import type {
  SubprofileItemDTO,
  SubprofileKind,
  SubprofileSection,
} from "./api/subprofiles.api";
import { KIND_SECTIONS } from "./kindSections.data";
export {
  KIND_LABELS,
  KIND_LABELS_BY_LANGUAGE,
  personaAddressName,
  isBareProfessionName,
  personaTitleName,
  personaNameBesideCraft,
} from "./personaTitleName";

// ── Kinds & sections config (contract C1 — verbatim, mirrored on the backend) ─
// `KIND_SECTIONS` lives in `kindSections.data.ts` (import-free, so the
// taxonomy check script can load it) and is re-exported from here.
export { KIND_SECTIONS };

/** The content sections of a kind, plus the universal 'gallery' section. */
export const sectionsForKind = (k: SubprofileKind): SubprofileSection[] => [
  ...KIND_SECTIONS[k],
  "gallery",
];

/** 'links' is universal but not a "content" section (excluded from the ≥3
 *  check / MIN_CONTENT_ITEMS). The other universal section, 'gallery', IS a
 *  content section — its items count toward that same readiness check. */
export const isContentSection = (s: SubprofileSection): boolean =>
  s !== "links";

// ── Presentation metadata (frontend-only; the backend has no field descriptors) ─

/** The item fields (in render order) that a section surfaces, plus a display
 *  label and icon. Derived from spec §3.3 — the DB stores the same generalized
 *  columns for every section; this only controls what the UI shows/edits.
 *
 *  i18n label-key indirection: `labelKey` resolves via `t()` at render —
 *  `section` (the Record key) is the persisted canonical id and never
 *  changes with the active language. */
export interface SectionMeta {
  labelKey: string;
  icon: IconType;
  /** Ordered item fields this section renders/edits (from `SubprofileItemDTO`). */
  fields: Array<keyof SubprofileItemDTO>;
}

export const SECTION_META: Record<SubprofileSection, SectionMeta> = {
  // developer
  projects: {
    labelKey: "subprofiles:section.projects",
    icon: FiCode,
    fields: ["title", "description", "url", "imageUrl", "tags", "date"],
  },
  open_source: {
    labelKey: "subprofiles:section.open_source",
    icon: FiGitBranch,
    fields: ["title", "description", "url", "meta", "date"],
  },
  // writer
  publications: {
    labelKey: "subprofiles:section.publications",
    icon: FiBookOpen,
    fields: ["title", "subtitle", "description", "url", "date"],
  },
  readings: {
    labelKey: "subprofiles:section.readings",
    icon: FiMic,
    fields: ["title", "subtitle", "date", "url"],
  },
  // musician
  discography: {
    labelKey: "subprofiles:section.discography",
    icon: FiDisc,
    fields: ["title", "subtitle", "imageUrl", "url", "date"],
  },
  gigs: {
    labelKey: "subprofiles:section.gigs",
    icon: FiMapPin,
    fields: ["title", "subtitle", "imageUrl", "date", "url"],
  },
  // visual_artist
  portfolio: {
    labelKey: "subprofiles:section.portfolio",
    icon: FiImage,
    fields: ["title", "description", "imageUrl", "date"],
  },
  exhibitions: {
    labelKey: "subprofiles:section.exhibitions",
    icon: FiMapPin,
    fields: ["title", "subtitle", "date", "url"],
  },
  // filmmaker
  filmography: {
    labelKey: "subprofiles:section.filmography",
    icon: FiFilm,
    fields: ["title", "subtitle", "description", "imageUrl", "date", "url"],
  },
  screenings: {
    labelKey: "subprofiles:section.screenings",
    icon: FiVideo,
    fields: ["title", "subtitle", "date", "url"],
  },
  // designer
  selected_work: {
    labelKey: "subprofiles:section.selected_work",
    icon: FiLayers,
    fields: ["title", "subtitle", "description", "imageUrl", "url", "date"],
  },
  clients: {
    labelKey: "subprofiles:section.clients",
    icon: FiUsers,
    fields: ["title", "meta"],
  },
  // maker
  collections: {
    labelKey: "subprofiles:section.collections",
    icon: FiGrid,
    fields: ["title", "description", "imageUrl", "date", "url"],
  },
  workshops: {
    labelKey: "subprofiles:section.workshops",
    icon: FiTool,
    fields: ["title", "subtitle", "date", "url"],
  },
  // drag
  shows: {
    labelKey: "subprofiles:section.shows",
    icon: FiFeather,
    fields: ["title", "subtitle", "date", "url"],
  },
  looks: {
    labelKey: "subprofiles:section.looks",
    icon: FiImage,
    fields: ["title", "description", "imageUrl", "date"],
  },
  // dj
  mixes: {
    labelKey: "subprofiles:section.mixes",
    icon: FiHeadphones,
    fields: ["title", "subtitle", "imageUrl", "url", "date"],
  },
  // dancer + performer
  performances: {
    labelKey: "subprofiles:section.performances",
    icon: FiActivity,
    fields: ["title", "subtitle", "date", "url"],
  },
  reel: {
    labelKey: "subprofiles:section.reel",
    icon: FiVideo,
    fields: ["title", "description", "url", "imageUrl"],
  },
  // performer
  appearances: {
    labelKey: "subprofiles:section.appearances",
    icon: FiAward,
    fields: ["title", "subtitle", "date", "url"],
  },
  // photographer
  series: {
    labelKey: "subprofiles:section.series",
    icon: FiCamera,
    fields: ["title", "description", "imageUrl", "date", "url"],
  },
  // videomaker
  videos: {
    labelKey: "subprofiles:section.videos",
    icon: FiVideo,
    fields: ["title", "subtitle", "description", "imageUrl", "url", "date"],
  },
  // chef
  menus: {
    labelKey: "subprofiles:section.menus",
    icon: FiClipboard,
    fields: ["title", "subtitle", "description", "imageUrl", "date", "url"],
  },
  // chef + mixologist
  residencies: {
    labelKey: "subprofiles:section.residencies",
    icon: FiMapPin,
    fields: ["title", "subtitle", "date", "url"],
  },
  // mixologist
  cocktails: {
    labelKey: "subprofiles:section.cocktails",
    icon: FiCoffee,
    fields: ["title", "subtitle", "description", "imageUrl", "date"],
  },
  // therapist
  specialisms: {
    labelKey: "subprofiles:section.specialisms",
    icon: FiHeart,
    fields: ["title", "description"],
  },
  credentials: {
    labelKey: "subprofiles:section.credentials",
    icon: FiAward,
    fields: ["title", "subtitle", "date", "imageUrl"],
  },
  // astrologer
  charts: {
    labelKey: "subprofiles:section.charts",
    icon: FiStar,
    fields: ["title", "subtitle", "description"],
  },
  sky: {
    labelKey: "subprofiles:section.sky",
    icon: FiMoon,
    fields: ["title", "subtitle", "description", "date", "url"],
  },
  // generic
  showcase: {
    labelKey: "subprofiles:section.showcase",
    icon: FiStar,
    fields: [
      "title",
      "subtitle",
      "description",
      "imageUrl",
      "url",
      "date",
      "tags",
    ],
  },
  // universal
  gallery: {
    labelKey: "subprofiles:section.gallery",
    icon: FiImage,
    fields: ["imageUrl"],
  },
  links: {
    labelKey: "subprofiles:section.links",
    icon: FiLink,
    fields: ["title", "url"],
  },
  // ── Personas expansion — new content sections (shared ids defined once) ──
  sets: {
    labelKey: "subprofiles:section.sets",
    icon: FiMic,
    fields: ["title", "subtitle", "date", "url"],
  },
  tour: {
    labelKey: "subprofiles:section.tour",
    icon: FiMapPin,
    fields: ["title", "subtitle", "date", "url"],
  },
  recordings: {
    labelKey: "subprofiles:section.recordings",
    icon: FiHeadphones,
    fields: ["title", "subtitle", "url", "date"],
  },
  acts: {
    labelKey: "subprofiles:section.acts",
    icon: FiFeather,
    fields: ["title", "subtitle", "date", "url"],
  },
  pieces: {
    labelKey: "subprofiles:section.pieces",
    icon: FiLayers,
    fields: ["title", "description", "imageUrl", "date"],
  },
  hosted: {
    labelKey: "subprofiles:section.hosted",
    icon: FiMic,
    fields: ["title", "subtitle", "date", "url"],
  },
  balls: {
    labelKey: "subprofiles:section.balls",
    icon: FiStar,
    fields: ["title", "subtitle", "date", "url"],
  },
  flash: {
    labelKey: "subprofiles:section.flash",
    icon: FiImage,
    fields: ["title", "description", "imageUrl", "date"],
  },
  healed: {
    labelKey: "subprofiles:section.healed",
    icon: FiImage,
    fields: ["title", "description", "imageUrl", "date"],
  },
  books: {
    labelKey: "subprofiles:section.books",
    icon: FiBookOpen,
    fields: ["title", "subtitle", "description", "url", "date"],
  },
  strips: {
    labelKey: "subprofiles:section.strips",
    icon: FiGrid,
    fields: ["title", "description", "imageUrl", "date"],
  },
  games: {
    labelKey: "subprofiles:section.games",
    icon: FiGrid,
    fields: ["title", "description", "imageUrl", "url", "date"],
  },
  jams: {
    labelKey: "subprofiles:section.jams",
    icon: FiActivity,
    fields: ["title", "description", "url", "date"],
  },
  models: {
    labelKey: "subprofiles:section.models",
    icon: FiLayers,
    fields: ["title", "description", "imageUrl", "url", "date"],
  },
  editions: {
    labelKey: "subprofiles:section.editions",
    icon: FiLayers,
    fields: ["title", "description", "imageUrl", "date"],
  },
  reporting: {
    labelKey: "subprofiles:section.reporting",
    icon: FiFileText,
    fields: ["title", "subtitle", "description", "url", "date"],
  },
  bylines: {
    labelKey: "subprofiles:section.bylines",
    icon: FiFileText,
    fields: ["title", "subtitle", "url"],
  },
  poems: {
    labelKey: "subprofiles:section.poems",
    icon: FiFeather,
    fields: ["title", "subtitle", "description", "date"],
  },
  edited: {
    labelKey: "subprofiles:section.edited",
    icon: FiEdit,
    fields: ["title", "subtitle", "url", "date"],
  },
  scripts: {
    labelKey: "subprofiles:section.scripts",
    icon: FiFileText,
    fields: ["title", "subtitle", "description", "date"],
  },
  productions: {
    labelKey: "subprofiles:section.productions",
    icon: FiFilm,
    fields: ["title", "subtitle", "date", "url"],
  },
  translations: {
    labelKey: "subprofiles:section.translations",
    icon: FiBookOpen,
    fields: ["title", "subtitle", "url", "date"],
  },
  languages: {
    labelKey: "subprofiles:section.languages",
    icon: FiGlobe,
    fields: ["title", "subtitle"],
  },
  zines: {
    labelKey: "subprofiles:section.zines",
    icon: FiBookOpen,
    fields: ["title", "description", "url", "date"],
  },
  distros: {
    labelKey: "subprofiles:section.distros",
    icon: FiMapPin,
    fields: ["title", "subtitle", "url"],
  },
  papers: {
    labelKey: "subprofiles:section.papers",
    icon: FiFileText,
    fields: ["title", "subtitle", "description", "url", "date"],
  },
  teaching: {
    labelKey: "subprofiles:section.teaching",
    icon: FiBookOpen,
    fields: ["title", "subtitle", "date", "url"],
  },
  wares: {
    labelKey: "subprofiles:section.wares",
    icon: FiGrid,
    fields: ["title", "description", "imageUrl", "date"],
  },
  firings: {
    labelKey: "subprofiles:section.firings",
    icon: FiMapPin,
    fields: ["title", "subtitle", "date", "url"],
  },
  commissions: {
    labelKey: "subprofiles:section.commissions",
    icon: FiTool,
    fields: ["title", "description", "date", "url"],
  },
  builds: {
    labelKey: "subprofiles:section.builds",
    icon: FiTool,
    fields: ["title", "description", "imageUrl", "date"],
  },
  arrangements: {
    labelKey: "subprofiles:section.arrangements",
    icon: FiImage,
    fields: ["title", "description", "imageUrl", "date"],
  },
  events: {
    labelKey: "subprofiles:section.events",
    icon: FiCalendar,
    fields: ["title", "subtitle", "date", "url"],
  },
  analyses: {
    labelKey: "subprofiles:section.analyses",
    icon: FiBarChart2,
    fields: ["title", "description", "url", "date"],
  },
  programmes: {
    labelKey: "subprofiles:section.programmes",
    icon: FiClipboard,
    fields: ["title", "subtitle", "description"],
  },
  treatments: {
    labelKey: "subprofiles:section.treatments",
    icon: FiHeart,
    fields: ["title", "subtitle", "description"],
  },
  classes: {
    labelKey: "subprofiles:section.classes",
    icon: FiActivity,
    fields: ["title", "subtitle", "description"],
  },
  trainings: {
    labelKey: "subprofiles:section.trainings",
    icon: FiAward,
    fields: ["title", "subtitle", "date", "imageUrl"],
  },
  support: {
    labelKey: "subprofiles:section.support",
    icon: FiHeart,
    fields: ["title", "description"],
  },
  training: {
    labelKey: "subprofiles:section.training",
    icon: FiActivity,
    fields: ["title", "subtitle", "description"],
  },
  resources: {
    labelKey: "subprofiles:section.resources",
    icon: FiBookOpen,
    fields: ["title", "description", "url"],
  },
  groups: {
    labelKey: "subprofiles:section.groups",
    icon: FiUsers,
    fields: ["title", "subtitle", "description"],
  },
  bakes: {
    labelKey: "subprofiles:section.bakes",
    icon: FiImage,
    fields: ["title", "description", "imageUrl", "date"],
  },
  markets: {
    labelKey: "subprofiles:section.markets",
    icon: FiMapPin,
    fields: ["title", "subtitle", "url"],
  },
  brews: {
    labelKey: "subprofiles:section.brews",
    icon: FiCoffee,
    fields: ["title", "subtitle", "description"],
  },
  releases: {
    labelKey: "subprofiles:section.releases",
    icon: FiTag,
    fields: ["title", "subtitle", "description", "date"],
  },
  taprooms: {
    labelKey: "subprofiles:section.taprooms",
    icon: FiMapPin,
    fields: ["title", "subtitle", "url"],
  },
  lists: {
    labelKey: "subprofiles:section.lists",
    icon: FiClipboard,
    fields: ["title", "subtitle", "description"],
  },
  pairings: {
    labelKey: "subprofiles:section.pairings",
    icon: FiCoffee,
    fields: ["title", "subtitle", "description"],
  },
  services: {
    labelKey: "subprofiles:section.services",
    icon: FiScissors,
    fields: ["title", "subtitle", "description"],
  },
  cuts: {
    labelKey: "subprofiles:section.cuts",
    icon: FiScissors,
    fields: ["title", "description", "imageUrl", "date"],
  },
  nail_sets: {
    labelKey: "subprofiles:section.nail_sets",
    icon: FiImage,
    fields: ["title", "description", "imageUrl", "date"],
  },
  aftercare: {
    labelKey: "subprofiles:section.aftercare",
    icon: FiHeart,
    fields: ["title", "description"],
  },
  piercings: {
    labelKey: "subprofiles:section.piercings",
    icon: FiImage,
    fields: ["title", "description", "imageUrl", "date"],
  },
  editorials: {
    labelKey: "subprofiles:section.editorials",
    icon: FiCamera,
    fields: ["title", "subtitle", "imageUrl", "date"],
  },
  book: {
    labelKey: "subprofiles:section.book",
    icon: FiImage,
    fields: ["title", "description", "imageUrl", "date"],
  },
  campaigns: {
    labelKey: "subprofiles:section.campaigns",
    icon: FiFlag,
    fields: ["title", "subtitle", "description", "date"],
  },
  sketches: {
    labelKey: "subprofiles:section.sketches",
    icon: FiEdit3,
    fields: ["title", "description", "imageUrl", "date"],
  },
  texts: {
    labelKey: "subprofiles:section.texts",
    icon: FiFileText,
    fields: ["title", "subtitle", "description", "url"],
  },
  programme: {
    labelKey: "subprofiles:section.programme",
    icon: FiCalendar,
    fields: ["title", "subtitle", "date", "url"],
  },
  artists: {
    labelKey: "subprofiles:section.artists",
    icon: FiUsers,
    fields: ["title", "subtitle", "url"],
  },
  available: {
    labelKey: "subprofiles:section.available",
    icon: FiImage,
    fields: ["title", "subtitle", "imageUrl", "date"],
  },
  advisory: {
    labelKey: "subprofiles:section.advisory",
    icon: FiBriefcase,
    fields: ["title", "description"],
  },
  finding_aids: {
    labelKey: "subprofiles:section.finding_aids",
    icon: FiFileText,
    fields: ["title", "subtitle", "description", "url"],
  },
  loans: {
    labelKey: "subprofiles:section.loans",
    icon: FiTruck,
    fields: ["title", "subtitle", "date"],
  },
  installations: {
    labelKey: "subprofiles:section.installations",
    icon: FiGrid,
    fields: ["title", "description", "imageUrl", "date"],
  },
  reviews: {
    labelKey: "subprofiles:section.reviews",
    icon: FiFileText,
    fields: ["title", "subtitle", "url", "date"],
  },
  tours: {
    labelKey: "subprofiles:section.tours",
    icon: FiMapPin,
    fields: ["title", "subtitle", "date"],
  },
  talks: {
    labelKey: "subprofiles:section.talks",
    icon: FiMic,
    fields: ["title", "subtitle", "date", "url"],
  },
  installs: {
    labelKey: "subprofiles:section.installs",
    icon: FiTool,
    fields: ["title", "subtitle", "date"],
  },
  research: {
    labelKey: "subprofiles:section.research",
    icon: FiSearch,
    fields: ["title", "subtitle", "description", "url"],
  },
  lectures: {
    labelKey: "subprofiles:section.lectures",
    icon: FiMic,
    fields: ["title", "subtitle", "date", "url"],
  },
  testimonies: {
    labelKey: "subprofiles:section.testimonies",
    icon: FiMic,
    fields: ["title", "subtitle", "description", "date"],
  },
  findings: {
    labelKey: "subprofiles:section.findings",
    icon: FiSearch,
    fields: ["title", "subtitle", "description"],
  },
  sites: {
    labelKey: "subprofiles:section.sites",
    icon: FiMapPin,
    fields: ["title", "subtitle", "description"],
  },
  actions: {
    labelKey: "subprofiles:section.actions",
    icon: FiCalendar,
    fields: ["title", "subtitle", "date", "url"],
  },
  writing: {
    labelKey: "subprofiles:section.writing",
    icon: FiFileText,
    fields: ["title", "subtitle", "url", "date"],
  },
  nights: {
    labelKey: "subprofiles:section.nights",
    icon: FiCalendar,
    fields: ["title", "subtitle", "date", "url"],
  },
  roster: {
    labelKey: "subprofiles:section.roster",
    icon: FiUsers,
    fields: ["title", "subtitle", "url"],
  },
  courses: {
    labelKey: "subprofiles:section.courses",
    icon: FiBookOpen,
    fields: ["title", "subtitle", "description", "url"],
  },
  subjects: {
    labelKey: "subprofiles:section.subjects",
    icon: FiBookOpen,
    fields: ["title", "description"],
  },
  // Quest personas. `campaigns` already exists above (model, heritage,
  // organizer, activist) and the game master shares that entry.
  sessions: {
    labelKey: "subprofiles:section.sessions",
    icon: FiCalendar,
    fields: ["title", "date", "url", "description"],
  },
  playthroughs: {
    labelKey: "subprofiles:section.playthroughs",
    icon: GiMeeple,
    fields: ["title", "url", "imageUrl", "date"],
  },
  library: {
    labelKey: "subprofiles:section.library",
    icon: GiBookshelf,
    fields: ["title", "subtitle", "imageUrl", "tags"],
  },
  larps: {
    labelKey: "subprofiles:section.larps",
    icon: GiSwordsEmblem,
    fields: ["title", "date", "description", "url", "imageUrl"],
  },
  minis: {
    labelKey: "subprofiles:section.minis",
    icon: GiPaintBrush,
    fields: ["title", "imageUrl", "description", "tags"],
  },
  maps: {
    labelKey: "subprofiles:section.maps",
    icon: GiTreasureMap,
    fields: ["title", "imageUrl", "description", "url"],
  },
  dice: {
    labelKey: "subprofiles:section.dice",
    icon: GiRollingDices,
    fields: ["title", "imageUrl", "description", "meta"],
  },
  results: {
    labelKey: "subprofiles:section.results",
    icon: GiTrophyCup,
    fields: ["title", "date", "description", "url"],
  },
  streams: {
    labelKey: "subprofiles:section.streams",
    icon: GiVideoCamera,
    fields: ["title", "url", "date", "imageUrl"],
  },
  runs: {
    labelKey: "subprofiles:section.runs",
    icon: GiStopwatch,
    fields: ["title", "meta", "url", "date"],
  },
  mods: {
    labelKey: "subprofiles:section.mods",
    icon: GiCog,
    fields: ["title", "description", "url", "tags"],
  },
  cons: {
    labelKey: "subprofiles:section.cons",
    icon: GiDramaMasks,
    fields: ["title", "date", "subtitle", "imageUrl"],
  },
  puzzles: {
    labelKey: "subprofiles:section.puzzles",
    icon: GiJigsawPiece,
    fields: ["title", "description", "url", "imageUrl"],
  },
  episodes: {
    labelKey: "subprofiles:section.episodes",
    icon: GiMicrophone,
    // `subtitle` holds the season/episode ("S2 · E14") and `meta` the running
    // time ("48 min"); a podcast feed import fills both, so both stay editable.
    fields: [
      "title",
      "subtitle",
      "url",
      "date",
      "meta",
      "description",
      "imageUrl",
    ],
  },
  roles: {
    labelKey: "subprofiles:section.roles",
    icon: GiTheaterCurtains,
    fields: ["title", "subtitle", "url", "date"],
  },
  works: {
    labelKey: "subprofiles:section.works",
    icon: GiScrollUnfurled,
    fields: ["title", "subtitle", "description", "url", "tags"],
  },
};

/** The create picker shows a kind's icon as its lead section's icon
 *  (`SECTION_META[KIND_SECTIONS[kind][0]].icon`), which reads wrong or
 *  clashes for a few Quest kinds: game_master's lead section is "campaigns"
 *  (shared with organizer/activist/model/heritage), whose flag icon doesn't
 *  read as tabletop; ttrpg_designer and game_designer share "games" (the grid
 *  icon); game_night_host and tournament_organizer share a calendar-first
 *  section. These four get a picker-only override instead. Verified to exist
 *  in `react-icons/gi`. */
export const KIND_ICON_OVERRIDE: Partial<Record<SubprofileKind, IconType>> = {
  game_master: GiDiceTwentyFacesTwenty,
  ttrpg_designer: GiSpellBook,
  game_night_host: GiMeeple,
  tournament_organizer: GiLaurelsTrophy,
  // Video & audio creators: video_creator/short_form_creator lead with
  // "videos" (videomaker's camera) and radio_host with "episodes"
  // (podcaster's mic), and podcast_producer's "productions" icon doesn't
  // read as audio, so each gets its own picker chip.
  video_creator: FiPlayCircle,
  short_form_creator: FiSmartphone,
  podcast_producer: FiHeadphones,
  radio_host: FiRadio,
};

/** The icon for a kind's create-picker chip: the override above when one
 *  exists, else the lead section's own icon. */
export function kindIcon(kind: SubprofileKind): IconType {
  return KIND_ICON_OVERRIDE[kind] ?? SECTION_META[KIND_SECTIONS[kind][0]!].icon;
}

// ── Kind display labels (for pickers / badges) ───────────────────────────────

/** i18n label-key indirection: `kind` is a PERSISTED field on the subprofile,
 *  so the Record key (developer/writer/…) is the stable canonical id; the
 *  UI label resolves via `t(KIND_LABEL_KEYS[kind])` at render. */
export const KIND_LABEL_KEYS: Record<SubprofileKind, string> = {
  developer: "subprofiles:kind.developer",
  writer: "subprofiles:kind.writer",
  musician: "subprofiles:kind.musician",
  visual_artist: "subprofiles:kind.visual_artist",
  filmmaker: "subprofiles:kind.filmmaker",
  designer: "subprofiles:kind.designer",
  maker: "subprofiles:kind.maker",
  drag: "subprofiles:kind.drag",
  dj: "subprofiles:kind.dj",
  dancer: "subprofiles:kind.dancer",
  performer: "subprofiles:kind.performer",
  photographer: "subprofiles:kind.photographer",
  videomaker: "subprofiles:kind.videomaker",
  video_creator: "subprofiles:kind.video_creator",
  short_form_creator: "subprofiles:kind.short_form_creator",
  chef: "subprofiles:kind.chef",
  mixologist: "subprofiles:kind.mixologist",
  therapist: "subprofiles:kind.therapist",
  astrologer: "subprofiles:kind.astrologer",
  generic: "subprofiles:kind.generic",
  // stage (new kinds)
  comedian: "subprofiles:kind.comedian",
  vocalist: "subprofiles:kind.vocalist",
  burlesque: "subprofiles:kind.burlesque",
  circus: "subprofiles:kind.circus",
  spoken_word: "subprofiles:kind.spoken_word",
  host: "subprofiles:kind.host",
  voguer: "subprofiles:kind.voguer",
  pole_dancer: "subprofiles:kind.pole_dancer",
  // studio (new kinds)
  illustrator: "subprofiles:kind.illustrator",
  tattoo_artist: "subprofiles:kind.tattoo_artist",
  animator: "subprofiles:kind.animator",
  comic_artist: "subprofiles:kind.comic_artist",
  // game_designer moved to the Quest block below (quest family), since this
  // Record's order sets each family's kind order in `KIND_FAMILIES`.
  artist_3d: "subprofiles:kind.artist_3d",
  printmaker: "subprofiles:kind.printmaker",
  // page (new kinds)
  journalist: "subprofiles:kind.journalist",
  poet: "subprofiles:kind.poet",
  editor: "subprofiles:kind.editor",
  screenwriter: "subprofiles:kind.screenwriter",
  translator: "subprofiles:kind.translator",
  zinester: "subprofiles:kind.zinester",
  academic: "subprofiles:kind.academic",
  // workshop (new kinds)
  ceramicist: "subprofiles:kind.ceramicist",
  jeweler: "subprofiles:kind.jeweler",
  textile_artist: "subprofiles:kind.textile_artist",
  woodworker: "subprofiles:kind.woodworker",
  florist: "subprofiles:kind.florist",
  data_scientist: "subprofiles:kind.data_scientist",
  // practice (new kinds)
  coach: "subprofiles:kind.coach",
  bodyworker: "subprofiles:kind.bodyworker",
  yoga_teacher: "subprofiles:kind.yoga_teacher",
  nutritionist: "subprofiles:kind.nutritionist",
  doula: "subprofiles:kind.doula",
  personal_trainer: "subprofiles:kind.personal_trainer",
  sex_educator: "subprofiles:kind.sex_educator",
  peer_support: "subprofiles:kind.peer_support",
  // table (new kinds)
  baker: "subprofiles:kind.baker",
  barista: "subprofiles:kind.barista",
  brewer: "subprofiles:kind.brewer",
  sommelier: "subprofiles:kind.sommelier",
  caterer: "subprofiles:kind.caterer",
  // chair (new family)
  hair_stylist: "subprofiles:kind.hair_stylist",
  barber: "subprofiles:kind.barber",
  makeup_artist: "subprofiles:kind.makeup_artist",
  nail_artist: "subprofiles:kind.nail_artist",
  esthetician: "subprofiles:kind.esthetician",
  piercer: "subprofiles:kind.piercer",
  // runway (new family)
  fashion_designer: "subprofiles:kind.fashion_designer",
  stylist: "subprofiles:kind.stylist",
  model: "subprofiles:kind.model",
  costume_designer: "subprofiles:kind.costume_designer",
  // gallery (new family)
  curator: "subprofiles:kind.curator",
  gallerist: "subprofiles:kind.gallerist",
  art_dealer: "subprofiles:kind.art_dealer",
  archivist: "subprofiles:kind.archivist",
  conservator: "subprofiles:kind.conservator",
  registrar: "subprofiles:kind.registrar",
  exhibition_designer: "subprofiles:kind.exhibition_designer",
  art_critic: "subprofiles:kind.art_critic",
  docent: "subprofiles:kind.docent",
  preparator: "subprofiles:kind.preparator",
  // history (new family — "Record")
  historian: "subprofiles:kind.historian",
  art_historian: "subprofiles:kind.art_historian",
  oral_historian: "subprofiles:kind.oral_historian",
  genealogist: "subprofiles:kind.genealogist",
  heritage: "subprofiles:kind.heritage",
  archival_researcher: "subprofiles:kind.archival_researcher",
  memory_keeper: "subprofiles:kind.memory_keeper",
  // collective (new family — "Poster")
  organizer: "subprofiles:kind.organizer",
  activist: "subprofiles:kind.activist",
  event_producer: "subprofiles:kind.event_producer",
  promoter: "subprofiles:kind.promoter",
  // classroom (new family)
  teacher: "subprofiles:kind.teacher",
  facilitator: "subprofiles:kind.facilitator",
  tutor: "subprofiles:kind.tutor",
  lecturer: "subprofiles:kind.lecturer",
  // Quest personas (+20)
  game_master: "subprofiles:kind.game_master",
  ttrpg_designer: "subprofiles:kind.ttrpg_designer",
  game_designer: "subprofiles:kind.game_designer",
  board_game_reviewer: "subprofiles:kind.board_game_reviewer",
  game_night_host: "subprofiles:kind.game_night_host",
  larp_organizer: "subprofiles:kind.larp_organizer",
  miniature_painter: "subprofiles:kind.miniature_painter",
  cartographer: "subprofiles:kind.cartographer",
  dice_maker: "subprofiles:kind.dice_maker",
  tournament_organizer: "subprofiles:kind.tournament_organizer",
  actual_play: "subprofiles:kind.actual_play",
  streamer: "subprofiles:kind.streamer",
  speedrunner: "subprofiles:kind.speedrunner",
  modder: "subprofiles:kind.modder",
  cosplayer: "subprofiles:kind.cosplayer",
  prop_maker: "subprofiles:kind.prop_maker",
  puzzle_designer: "subprofiles:kind.puzzle_designer",
  podcaster: "subprofiles:kind.podcaster",
  podcast_producer: "subprofiles:kind.podcast_producer",
  radio_host: "subprofiles:kind.radio_host",
  voice_actor: "subprofiles:kind.voice_actor",
  fanfic_writer: "subprofiles:kind.fanfic_writer",
  game_critic: "subprofiles:kind.game_critic",
};

/** Turn any label into a URL-safe slug: lowercase, non-alphanumerics → hyphens. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** English, language-independent slug per kind (matches the pre-i18n default
 *  addresses exactly, so existing personas' addresses don't shift underfoot). */
const KIND_SLUG: Record<SubprofileKind, string> = {
  developer: "developer",
  writer: "writer",
  musician: "musician",
  visual_artist: "visual-artist",
  filmmaker: "filmmaker",
  designer: "designer",
  maker: "maker",
  drag: "drag",
  dj: "dj",
  dancer: "dancer",
  performer: "performer",
  photographer: "photographer",
  videomaker: "videomaker",
  video_creator: "video-creator",
  short_form_creator: "short-form-creator",
  chef: "chef",
  mixologist: "mixologist",
  therapist: "therapist",
  astrologer: "astrologer",
  generic: "other",
  // stage (new kinds)
  comedian: "comedian",
  vocalist: "vocalist",
  burlesque: "burlesque",
  circus: "circus",
  spoken_word: "spoken-word",
  host: "host",
  voguer: "voguer",
  pole_dancer: "pole-dancer",
  // studio (new kinds)
  illustrator: "illustrator",
  tattoo_artist: "tattoo-artist",
  animator: "animator",
  comic_artist: "comic-artist",
  game_designer: "game-designer",
  artist_3d: "artist-3d",
  printmaker: "printmaker",
  // page (new kinds)
  journalist: "journalist",
  poet: "poet",
  editor: "editor",
  screenwriter: "screenwriter",
  translator: "translator",
  zinester: "zinester",
  academic: "academic",
  // workshop (new kinds)
  ceramicist: "ceramicist",
  jeweler: "jeweler",
  textile_artist: "textile-artist",
  woodworker: "woodworker",
  florist: "florist",
  data_scientist: "data-scientist",
  // practice (new kinds)
  coach: "coach",
  bodyworker: "bodyworker",
  yoga_teacher: "yoga-teacher",
  nutritionist: "nutritionist",
  doula: "doula",
  personal_trainer: "personal-trainer",
  sex_educator: "sex-educator",
  peer_support: "peer-support",
  // table (new kinds)
  baker: "baker",
  barista: "barista",
  brewer: "brewer",
  sommelier: "sommelier",
  caterer: "caterer",
  // chair (new family)
  hair_stylist: "hair-stylist",
  barber: "barber",
  makeup_artist: "makeup-artist",
  nail_artist: "nail-artist",
  esthetician: "esthetician",
  piercer: "piercer",
  // runway (new family)
  fashion_designer: "fashion-designer",
  stylist: "stylist",
  model: "model",
  costume_designer: "costume-designer",
  // gallery (new family)
  curator: "curator",
  gallerist: "gallerist",
  art_dealer: "art-dealer",
  archivist: "archivist",
  conservator: "conservator",
  registrar: "registrar",
  exhibition_designer: "exhibition-designer",
  art_critic: "art-critic",
  docent: "docent",
  preparator: "preparator",
  // history (new family — "Record")
  historian: "historian",
  art_historian: "art-historian",
  oral_historian: "oral-historian",
  genealogist: "genealogist",
  heritage: "heritage",
  archival_researcher: "archival-researcher",
  memory_keeper: "memory-keeper",
  // collective (new family — "Poster")
  organizer: "organizer",
  activist: "activist",
  event_producer: "event-producer",
  promoter: "promoter",
  // classroom (new family)
  teacher: "teacher",
  facilitator: "facilitator",
  tutor: "tutor",
  lecturer: "lecturer",
  // Quest personas (+20)
  game_master: "game-master",
  ttrpg_designer: "ttrpg-writer",
  board_game_reviewer: "board-game-reviewer",
  game_night_host: "game-night-host",
  larp_organizer: "larp-organiser",
  miniature_painter: "miniature-painter",
  cartographer: "map-maker",
  dice_maker: "dice-maker",
  tournament_organizer: "tournament-organiser",
  actual_play: "actual-play",
  streamer: "streamer",
  speedrunner: "speedrunner",
  modder: "modder",
  cosplayer: "cosplayer",
  prop_maker: "prop-maker",
  puzzle_designer: "puzzle-designer",
  podcaster: "podcaster",
  podcast_producer: "podcast-producer",
  radio_host: "radio-host",
  voice_actor: "voice-actor",
  fanfic_writer: "fanfic-writer",
  game_critic: "game-critic",
};

/**
 * Extra words a directory search can name a profession by, beyond its EN and
 * PT labels. Mirrors the aliases in the backend's `subprofile-kind-search.ts`
 * (keep in step); demo mode's `mockDirectory` reads them through
 * `kindSearch.ts`.
 */
export const KIND_SEARCH_ALIASES: Partial<
  Record<SubprofileKind, readonly string[]>
> = {
  video_creator: [
    "youtuber",
    "youtube",
    "vlogger",
    "vlog",
    "video essayist",
    "video essay",
    "content creator",
    "criador de conteúdo",
    "criadora de conteúdo",
  ],
  short_form_creator: [
    "tiktok",
    "tiktoker",
    "reels",
    "shorts",
    "short-form",
    "influencer",
  ],
  podcaster: ["podcast host", "podcasting"],
  podcast_producer: [
    "podcast editor",
    "audio editor",
    "audio producer",
    "edição de áudio",
    "produção de áudio",
  ],
  radio_host: [
    "radio",
    "radio presenter",
    "broadcaster",
    "locutor",
    "locutora",
  ],
  game_master: [
    "dm",
    "gm",
    "dungeon master",
    "game master",
    "mestre",
    "mestre de jogo",
    "narrador",
    "narradora",
    "keeper",
    "storyteller",
    "rpg",
  ],
  ttrpg_designer: ["ttrpg", "rpg designer"],
  streamer: ["vtuber", "twitch"],
  cosplayer: ["cosplay"],
  larp_organizer: ["larp", "live action"],
  tournament_organizer: [
    "tournament",
    "torneio",
    "magic",
    "mtg",
    "pokemon",
    "chess",
    "xadrez",
  ],
  board_game_reviewer: ["board games", "jogos de tabuleiro"],
};

/** The slug a persona gets by default when the owner names it after the
 *  profession — always the fixed English id, so the default address never
 *  changes with the active language. */
export function defaultSlugForKind(kind: SubprofileKind): string {
  return KIND_SLUG[kind];
}
