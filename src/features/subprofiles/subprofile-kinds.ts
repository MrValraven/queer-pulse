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
 *  columns for every section; this only controls what the UI shows/edits. */
export interface SectionMeta {
  label: string;
  icon: IconType;
  /** Ordered item fields this section renders/edits (from `SubprofileItemDTO`). */
  fields: Array<keyof SubprofileItemDTO>;
}

export const SECTION_META: Record<SubprofileSection, SectionMeta> = {
  // developer
  projects: {
    label: "Projects",
    icon: FiCode,
    fields: ["title", "description", "url", "imageUrl", "tags", "date"],
  },
  open_source: {
    label: "Open source",
    icon: FiGitBranch,
    fields: ["title", "description", "url", "meta", "date"],
  },
  // writer
  publications: {
    label: "Publications",
    icon: FiBookOpen,
    fields: ["title", "subtitle", "description", "url", "date"],
  },
  readings: {
    label: "Readings",
    icon: FiMic,
    fields: ["title", "subtitle", "date", "url"],
  },
  // musician
  discography: {
    label: "Discography",
    icon: FiDisc,
    fields: ["title", "subtitle", "imageUrl", "url", "date"],
  },
  gigs: {
    label: "Gigs",
    icon: FiMapPin,
    fields: ["title", "subtitle", "date", "url"],
  },
  // visual_artist
  portfolio: {
    label: "Portfolio",
    icon: FiImage,
    fields: ["title", "description", "imageUrl", "date"],
  },
  exhibitions: {
    label: "Exhibitions",
    icon: FiMapPin,
    fields: ["title", "subtitle", "date", "url"],
  },
  // filmmaker
  filmography: {
    label: "Filmography",
    icon: FiFilm,
    fields: ["title", "subtitle", "description", "imageUrl", "date", "url"],
  },
  screenings: {
    label: "Screenings",
    icon: FiVideo,
    fields: ["title", "subtitle", "date", "url"],
  },
  // designer
  selected_work: {
    label: "Selected work",
    icon: FiLayers,
    fields: ["title", "subtitle", "description", "imageUrl", "url", "date"],
  },
  clients: {
    label: "Clients",
    icon: FiUsers,
    fields: ["title", "meta"],
  },
  // maker
  collections: {
    label: "Collections",
    icon: FiGrid,
    fields: ["title", "description", "imageUrl", "date", "url"],
  },
  workshops: {
    label: "Workshops",
    icon: FiTool,
    fields: ["title", "subtitle", "date", "url"],
  },
  // generic
  showcase: {
    label: "Showcase",
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
    label: "Links",
    icon: FiLink,
    fields: ["title", "url"],
  },
};

// ── Kind display labels (for pickers / badges) ───────────────────────────────

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

/** The slug a persona gets by default when the owner names it after the profession. */
export function defaultSlugForKind(kind: SubprofileKind): string {
  return slugify(KIND_LABELS[kind]);
}
