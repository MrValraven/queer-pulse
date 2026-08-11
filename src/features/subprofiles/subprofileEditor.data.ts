import type {
  LinkVisibility,
  SubprofileSection,
  Visibility,
} from "./api/subprofiles.api";

// ── Publish thresholds (mirror contract C5) ──────────────────────────────────

/** Minimum bio length before an unlinked persona can go live. */
export const MIN_BIO = 80;
/** Server-side cap, surfaced here as a friendly limit on the Add affordance. */
export const MAX_ITEMS_PER_SECTION = 100;

/** Sections whose items support per-item typed social links (stored in each
 *  item's `structured.links`). Kept narrow: only project-shaped sections where
 *  a GitHub / demo / docs link per entry makes sense. */
export const ITEM_LINKS_SECTIONS = new Set<SubprofileSection>([
  "projects",
  "open_source",
]);
/** Friendly per-item link cap surfaced on the Add affordance. */
export const MAX_ITEM_LINKS = 6;

// ── Meta-form options + copy ─────────────────────────────────────────────────
// i18n label-key indirection throughout this section: `value`/the Record key
// is the PERSISTED canonical id (visibility / linkVisibility are stored
// fields), so `labelKey`/`helpKey` resolve via `t()` at render — a language
// switch never touches the stored choice.

export const VISIBILITY_OPTIONS: {
  value: Visibility;
  labelKey: string;
  helpKey: string;
}[] = [
  {
    value: "open",
    labelKey: "subprofiles:visibility.open.label",
    helpKey: "subprofiles:visibility.open.help",
  },
  {
    value: "network",
    labelKey: "subprofiles:visibility.network.label",
    helpKey: "subprofiles:visibility.network.help",
  },
  {
    value: "private",
    labelKey: "subprofiles:visibility.private.label",
    helpKey: "subprofiles:visibility.private.help",
  },
];

/** Segmented-control values for the link-visibility choice — canonical ids;
 *  the component renders their translated labels via `LINK_TO_LABEL_KEY`. */
export const LINK_OPTIONS = [
  "linked",
  "unlinked",
] as const satisfies readonly LinkVisibility[];

export const LINK_TO_LABEL_KEY: Record<LinkVisibility, string> = {
  linked: "subprofiles:link.linked",
  unlinked: "subprofiles:link.standalone",
};

export const LINK_HELP_KEY: Record<LinkVisibility, string> = {
  linked: "subprofiles:link.help.linked",
  unlinked: "subprofiles:link.help.unlinked",
};

// ── Per-field labels for the item editor ─────────────────────────────────────
// Generic, friendly labels for the generalized item columns. Each section only
// renders the fields listed in SECTION_META[section].fields. Not persisted
// choices (the field NAMES title/subtitle/… are fixed, only their labels
// translate), still resolved via `t()` for consistency.

export const FIELD_META: Record<
  string,
  { labelKey: string; placeholderKey: string; multiline?: boolean }
> = {
  title: {
    labelKey: "subprofiles:field.title.label",
    placeholderKey: "subprofiles:field.title.placeholder",
  },
  subtitle: {
    labelKey: "subprofiles:field.subtitle.label",
    placeholderKey: "subprofiles:field.subtitle.placeholder",
  },
  description: {
    labelKey: "subprofiles:field.description.label",
    placeholderKey: "subprofiles:field.description.placeholder",
    multiline: true,
  },
  url: {
    labelKey: "subprofiles:field.url.label",
    placeholderKey: "subprofiles:field.url.placeholder",
  },
  date: {
    labelKey: "subprofiles:field.date.label",
    placeholderKey: "subprofiles:field.date.placeholder",
  },
  meta: {
    labelKey: "subprofiles:field.meta.label",
    placeholderKey: "subprofiles:field.meta.placeholder",
  },
  tags: {
    labelKey: "subprofiles:field.tags.label",
    placeholderKey: "subprofiles:field.tags.placeholder",
  },
};
