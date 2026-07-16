import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiCode,
  FiDisc,
  FiFilm,
  FiGitBranch,
  FiGrid,
  FiImage,
  FiLayers,
  FiLink,
  FiMapPin,
  FiMic,
  FiStar,
  FiTool,
  FiUsers,
  FiVideo,
} from "react-icons/fi";
import type {
  SubprofileItemDTO,
  SubprofileKind,
  SubprofileSection,
} from "./api/subprofiles.api";

// ── Kinds & sections config (contract C1 — verbatim, mirrored on the backend) ─

/** kind -> ordered content sections (excludes the universal 'links'). */
export const KIND_SECTIONS: Record<SubprofileKind, SubprofileSection[]> = {
  developer: ["projects", "open_source"],
  writer: ["publications", "readings"],
  musician: ["discography", "gigs"],
  visual_artist: ["portfolio", "exhibitions"],
  filmmaker: ["filmography", "screenings"],
  designer: ["selected_work", "clients"],
  maker: ["collections", "workshops"],
  generic: ["showcase"],
};

/** The content sections of a kind, plus the universal 'links' section. */
export const sectionsForKind = (k: SubprofileKind): SubprofileSection[] => [
  ...KIND_SECTIONS[k],
  "links",
];

/** Whether `section` is one this `kind` exposes (content section or 'links'). */
export const isSectionAllowed = (
  k: SubprofileKind,
  s: SubprofileSection,
): boolean => sectionsForKind(k).includes(s);

/** 'links' is universal but not a "content" section (excluded from the ≥3 check). */
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
    fields: ["title", "subtitle", "date", "url"],
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
  links: {
    labelKey: "subprofiles:section.links",
    icon: FiLink,
    fields: ["title", "url"],
  },
};

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
  generic: "subprofiles:kind.generic",
};

/**
 * English fallback names, kept ONLY for the "no display name typed" case: when
 * a persona is created with a blank name, its `displayName` — a PERSISTED
 * field — defaults to the profession (e.g. a blank Developer persona is named
 * "Developer"). That stored value isn't chrome and isn't re-translated later
 * (no backend translation pipeline), so it stays English like other
 * persisted/generated content, distinct from `KIND_LABEL_KEYS` (the UI badge
 * label, which does follow the active language). Used by
 * `useSubprofileMutations.ts`'s demo path and the MSW test handler that
 * mirror this same backend default.
 */
export const KIND_LABELS: Record<SubprofileKind, string> = {
  developer: "Developer",
  writer: "Writer",
  musician: "Musician",
  visual_artist: "Visual artist",
  filmmaker: "Filmmaker",
  designer: "Designer",
  maker: "Maker",
  generic: "Other",
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
  generic: "other",
};

/** The slug a persona gets by default when the owner names it after the
 *  profession — always the fixed English id, so the default address never
 *  changes with the active language. */
export function defaultSlugForKind(kind: SubprofileKind): string {
  return KIND_SLUG[kind];
}
