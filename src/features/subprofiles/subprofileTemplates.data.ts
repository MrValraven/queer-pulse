import type { TFunction } from "../../shared/i18n/types";
import type { SubprofileKind, SubprofileSection } from "./api/subprofiles.api";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import { KIND_SECTIONS } from "./subprofile-kinds";

// ── Starter-template data (Phase 4a) ─────────────────────────────────────────
//
// Seeds a kind-appropriate skeleton (example section items + a suggested
// tagline) when a persona is created, so a fresh draft never opens to a
// totally blank editor. Applied through the existing `create` / `replaceSection`
// / `update` mutations (demo/live-aware) — this file only supplies content,
// never touches the API directly. Every string is an i18n KEY, resolved by the
// caller's `t()`; the actual copy lives in the en/pt catalogs (Task 3).
//
// A `TemplateItem` only references keys for the fields its section actually
// shows (per `SECTION_META[section].fields` in `subprofile-kinds.ts`) — e.g. a
// section without `description` in its fields gets no `descriptionKey`. Fields
// that aren't text (url/imageUrl/meta) are never templated: there's no real
// asset to seed, so they stay blank for the owner to fill in.

export interface TemplateItem {
  titleKey: string;
  subtitleKey?: string;
  descriptionKey?: string;
  /** Literal example tags (not i18n keys) — only for sections whose fields include `tags`. */
  tags?: string[];
  /** Literal example date (not an i18n key) — only for sections whose fields include `date`. */
  date?: string;
}

/** One (sometimes two) example item per content section. Every `SubprofileSection`
 *  except `links` (the universal, non-content section) is covered — derived from
 *  the full set that appears across `KIND_SECTIONS`. */
export const TEMPLATE_ITEMS: Partial<Record<SubprofileSection, TemplateItem[]>> = {
  // developer
  projects: [
    {
      titleKey: "subprofiles:template.section.projects.item1.title",
      descriptionKey: "subprofiles:template.section.projects.item1.desc",
      tags: ["React", "TypeScript"],
      date: "2025",
    },
    {
      titleKey: "subprofiles:template.section.projects.item2.title",
      descriptionKey: "subprofiles:template.section.projects.item2.desc",
      tags: ["Node.js", "PostgreSQL"],
      date: "2024",
    },
  ],
  open_source: [
    {
      titleKey: "subprofiles:template.section.open_source.item1.title",
      descriptionKey: "subprofiles:template.section.open_source.item1.desc",
      date: "2025",
    },
  ],
  // writer
  publications: [
    {
      titleKey: "subprofiles:template.section.publications.item1.title",
      subtitleKey: "subprofiles:template.section.publications.item1.subtitle",
      descriptionKey: "subprofiles:template.section.publications.item1.desc",
      date: "2025",
    },
  ],
  readings: [
    {
      titleKey: "subprofiles:template.section.readings.item1.title",
      subtitleKey: "subprofiles:template.section.readings.item1.subtitle",
      date: "2025",
    },
  ],
  // musician
  discography: [
    {
      titleKey: "subprofiles:template.section.discography.item1.title",
      subtitleKey: "subprofiles:template.section.discography.item1.subtitle",
      date: "2025",
    },
  ],
  gigs: [
    {
      titleKey: "subprofiles:template.section.gigs.item1.title",
      subtitleKey: "subprofiles:template.section.gigs.item1.subtitle",
      date: "2025",
    },
  ],
  // visual_artist
  portfolio: [
    {
      titleKey: "subprofiles:template.section.portfolio.item1.title",
      descriptionKey: "subprofiles:template.section.portfolio.item1.desc",
      date: "2025",
    },
    {
      titleKey: "subprofiles:template.section.portfolio.item2.title",
      descriptionKey: "subprofiles:template.section.portfolio.item2.desc",
      date: "2024",
    },
  ],
  exhibitions: [
    {
      titleKey: "subprofiles:template.section.exhibitions.item1.title",
      subtitleKey: "subprofiles:template.section.exhibitions.item1.subtitle",
      date: "2025",
    },
  ],
  // filmmaker
  filmography: [
    {
      titleKey: "subprofiles:template.section.filmography.item1.title",
      subtitleKey: "subprofiles:template.section.filmography.item1.subtitle",
      descriptionKey: "subprofiles:template.section.filmography.item1.desc",
      date: "2025",
    },
  ],
  screenings: [
    {
      titleKey: "subprofiles:template.section.screenings.item1.title",
      subtitleKey: "subprofiles:template.section.screenings.item1.subtitle",
      date: "2025",
    },
  ],
  // designer
  selected_work: [
    {
      titleKey: "subprofiles:template.section.selected_work.item1.title",
      subtitleKey: "subprofiles:template.section.selected_work.item1.subtitle",
      descriptionKey: "subprofiles:template.section.selected_work.item1.desc",
      date: "2025",
    },
  ],
  clients: [
    {
      titleKey: "subprofiles:template.section.clients.item1.title",
    },
  ],
  // maker
  collections: [
    {
      titleKey: "subprofiles:template.section.collections.item1.title",
      descriptionKey: "subprofiles:template.section.collections.item1.desc",
      date: "2025",
    },
  ],
  workshops: [
    {
      titleKey: "subprofiles:template.section.workshops.item1.title",
      subtitleKey: "subprofiles:template.section.workshops.item1.subtitle",
      date: "2025",
    },
  ],
  // drag
  shows: [
    {
      titleKey: "subprofiles:template.section.shows.item1.title",
      subtitleKey: "subprofiles:template.section.shows.item1.subtitle",
      date: "2025",
    },
  ],
  looks: [
    {
      titleKey: "subprofiles:template.section.looks.item1.title",
      descriptionKey: "subprofiles:template.section.looks.item1.desc",
      date: "2025",
    },
  ],
  // dj
  mixes: [
    {
      titleKey: "subprofiles:template.section.mixes.item1.title",
      subtitleKey: "subprofiles:template.section.mixes.item1.subtitle",
      date: "2025",
    },
    {
      titleKey: "subprofiles:template.section.mixes.item2.title",
      subtitleKey: "subprofiles:template.section.mixes.item2.subtitle",
      date: "2024",
    },
  ],
  // dancer + performer
  performances: [
    {
      titleKey: "subprofiles:template.section.performances.item1.title",
      subtitleKey: "subprofiles:template.section.performances.item1.subtitle",
      date: "2025",
    },
  ],
  reel: [
    {
      titleKey: "subprofiles:template.section.reel.item1.title",
      descriptionKey: "subprofiles:template.section.reel.item1.desc",
    },
  ],
  // performer
  appearances: [
    {
      titleKey: "subprofiles:template.section.appearances.item1.title",
      subtitleKey: "subprofiles:template.section.appearances.item1.subtitle",
      date: "2025",
    },
  ],
  // photographer
  series: [
    {
      titleKey: "subprofiles:template.section.series.item1.title",
      descriptionKey: "subprofiles:template.section.series.item1.desc",
      date: "2025",
    },
  ],
  // videomaker
  videos: [
    {
      titleKey: "subprofiles:template.section.videos.item1.title",
      subtitleKey: "subprofiles:template.section.videos.item1.subtitle",
      descriptionKey: "subprofiles:template.section.videos.item1.desc",
      date: "2025",
    },
  ],
  // generic
  showcase: [
    {
      titleKey: "subprofiles:template.section.showcase.item1.title",
      subtitleKey: "subprofiles:template.section.showcase.item1.subtitle",
      descriptionKey: "subprofiles:template.section.showcase.item1.desc",
      tags: ["Community", "Creative"],
      date: "2025",
    },
  ],
};

/** kind -> suggested tagline key, offered alongside the section templates. */
export const TEMPLATE_TAGLINE: Partial<Record<SubprofileKind, string>> = {
  developer: "subprofiles:template.tagline.developer",
  writer: "subprofiles:template.tagline.writer",
  musician: "subprofiles:template.tagline.musician",
  visual_artist: "subprofiles:template.tagline.visual_artist",
  filmmaker: "subprofiles:template.tagline.filmmaker",
  designer: "subprofiles:template.tagline.designer",
  maker: "subprofiles:template.tagline.maker",
  drag: "subprofiles:template.tagline.drag",
  dj: "subprofiles:template.tagline.dj",
  dancer: "subprofiles:template.tagline.dancer",
  performer: "subprofiles:template.tagline.performer",
  photographer: "subprofiles:template.tagline.photographer",
  videomaker: "subprofiles:template.tagline.videomaker",
  generic: "subprofiles:template.tagline.generic",
};

/** Resolve a section's template items into full view-model rows (blank
 *  defaults for every field the template doesn't seed), ready to hand to
 *  `itemsToInputDto` or drop straight into an editor's `rows` state. */
export function buildTemplateItems(
  section: SubprofileSection,
  t: TFunction,
): SubprofileItemView[] {
  const templateItems = TEMPLATE_ITEMS[section] ?? [];
  return templateItems.map((templateItem) => ({
    section,
    title: t(templateItem.titleKey),
    subtitle: templateItem.subtitleKey ? t(templateItem.subtitleKey) : "",
    description: templateItem.descriptionKey
      ? t(templateItem.descriptionKey)
      : "",
    url: "",
    imageUrl: "",
    date: templateItem.date ?? "",
    meta: "",
    tags: templateItem.tags ?? [],
    isFeatured: false,
    collaborators: [],
  }));
}

/** Every section of `kind` that has template content, each resolved to full
 *  view-model rows — the shape the create-time picker replays via
 *  `replaceSection`. Sections with no `TEMPLATE_ITEMS` entry are skipped. */
export function buildTemplateSections(
  kind: SubprofileKind,
  t: TFunction,
): { section: SubprofileSection; items: SubprofileItemView[] }[] {
  return KIND_SECTIONS[kind]
    .filter((section) => TEMPLATE_ITEMS[section] !== undefined)
    .map((section) => ({ section, items: buildTemplateItems(section, t) }));
}

/** The suggested tagline for `kind`, resolved via `t()` — `undefined` when the
 *  kind has none (so the caller can skip the tagline PATCH entirely). */
export function templateTaglineFor(
  kind: SubprofileKind,
  t: TFunction,
): string | undefined {
  const key = TEMPLATE_TAGLINE[kind];
  return key ? t(key) : undefined;
}
