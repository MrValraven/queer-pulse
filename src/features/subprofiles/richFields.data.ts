import type {
  SubprofileItemInputDTO,
  SubprofileSection,
} from "./api/subprofiles.api";

/**
 * Per-section descriptors for the Phase-0 rich fields (`venue`/`doors`/
 * `ticketUrl`/`gigState`/`medium`/`dimensions`/`edition`/`workState`/
 * `structured.snippet`) that `itemsToInputDto` (`api/subprofiles.adapters.ts`)
 * now forwards on a section resave. This is a presentation-only overlay —
 * it says which of those already-plumbed fields a given section's item
 * drawer should surface as an input (Phase 3 Task 5), same spirit as
 * `SECTION_META.fields` in `subprofile-kinds.ts` but additive, so that file
 * stays untouched (its `fields` list keeps describing only the base
 * `SubprofileItemDTO` columns every section already rendered).
 *
 * `key: "snippet"` is a sentinel, not a real `SubprofileItemInputDTO` key —
 * the drawer maps it to/from `structured.snippet` (a `string[]`, one line
 * per newline) rather than a flat DTO field, because `structured` is a
 * nested jsonb blob, not a column.
 */
export interface RichFieldDescriptor {
  key: keyof SubprofileItemInputDTO | "snippet";
  kind: "text" | "select" | "textarea";
  labelKey: string;
  placeholderKey?: string;
  options?: { value: string; labelKey: string }[];
}

const GIG_STATE_OPTIONS: RichFieldDescriptor["options"] = [
  { value: "", labelKey: "subprofiles:richField.gigState.option.none" },
  {
    value: "sold_out",
    labelKey: "subprofiles:richField.gigState.option.sold_out",
  },
  {
    value: "cancelled",
    labelKey: "subprofiles:richField.gigState.option.cancelled",
  },
  { value: "guest", labelKey: "subprofiles:richField.gigState.option.guest" },
];

const WORK_STATE_OPTIONS: RichFieldDescriptor["options"] = [
  { value: "", labelKey: "subprofiles:richField.workState.option.none" },
  {
    value: "shipped",
    labelKey: "subprofiles:richField.workState.option.shipped",
  },
  {
    value: "archived",
    labelKey: "subprofiles:richField.workState.option.archived",
  },
  {
    value: "in_progress",
    labelKey: "subprofiles:richField.workState.option.in_progress",
  },
];

/** gigs/shows: date+venue events that can sell out, cancel, or run a guest slot. */
const GIG_FIELDS: RichFieldDescriptor[] = [
  {
    key: "gigState",
    kind: "select",
    labelKey: "subprofiles:richField.gigState.label",
    options: GIG_STATE_OPTIONS,
  },
  {
    key: "venue",
    kind: "text",
    labelKey: "subprofiles:richField.venue.label",
    placeholderKey: "subprofiles:richField.venue.placeholder",
  },
  {
    key: "doors",
    kind: "text",
    labelKey: "subprofiles:richField.doors.label",
    placeholderKey: "subprofiles:richField.doors.placeholder",
  },
  {
    key: "ticketUrl",
    kind: "text",
    labelKey: "subprofiles:richField.ticketUrl.label",
    placeholderKey: "subprofiles:richField.ticketUrl.placeholder",
  },
];

/** Physical/visual-work sections: a single artifact that can carry a medium,
 *  physical dimensions, and an edition/run note. */
const VISUAL_WORK_FIELDS: RichFieldDescriptor[] = [
  {
    key: "medium",
    kind: "text",
    labelKey: "subprofiles:richField.medium.label",
    placeholderKey: "subprofiles:richField.medium.placeholder",
  },
  {
    key: "dimensions",
    kind: "text",
    labelKey: "subprofiles:richField.dimensions.label",
    placeholderKey: "subprofiles:richField.dimensions.placeholder",
  },
  {
    key: "edition",
    kind: "text",
    labelKey: "subprofiles:richField.edition.label",
    placeholderKey: "subprofiles:richField.edition.placeholder",
  },
];

/** Project sections: a shippable thing with a lifecycle state + an optional
 *  workshop/changelog-style snippet (`structured.snippet`, newline-joined). */
const PROJECT_FIELDS: RichFieldDescriptor[] = [
  {
    key: "workState",
    kind: "select",
    labelKey: "subprofiles:richField.workState.label",
    options: WORK_STATE_OPTIONS,
  },
  {
    key: "snippet",
    kind: "textarea",
    labelKey: "subprofiles:richField.snippet.label",
    placeholderKey: "subprofiles:richField.snippet.placeholder",
  },
];

/** Which sections show which rich inputs in the item drawer (Task 5).
 *  Sections not listed here have no rich-field overlay — the drawer only
 *  renders their base `SECTION_META.fields`.
 *
 *  Groupings:
 *  - `gigs` (musician + dj) and `shows` (drag) are the two date/venue-driven
 *    live-event sections across all kinds.
 *  - Visual-work sections span everything that produces a single
 *    physical/visual artifact worth a medium+dimensions+edition note:
 *    `portfolio`/`series` (visual_artist/photographer), `looks` (drag),
 *    `collections` (maker), `selected_work` (designer), `discography`/
 *    `mixes` (musician/dj — a release has a "medium" too, e.g. vinyl/digital),
 *    `filmography`/`videos` (filmmaker/videomaker), `menus`/`cocktails`
 *    (chef/mixologist — "medium" reads as format/technique here, e.g.
 *    tasting menu vs. à la carte).
 *  - `projects`/`open_source` (developer) are the only sections with a
 *    build/ship lifecycle worth `workState` + a snippet. */
export const RICH_FIELDS_FOR_SECTION: Partial<
  Record<SubprofileSection, RichFieldDescriptor[]>
> = {
  gigs: GIG_FIELDS,
  shows: GIG_FIELDS,
  portfolio: VISUAL_WORK_FIELDS,
  looks: VISUAL_WORK_FIELDS,
  series: VISUAL_WORK_FIELDS,
  collections: VISUAL_WORK_FIELDS,
  selected_work: VISUAL_WORK_FIELDS,
  discography: VISUAL_WORK_FIELDS,
  mixes: VISUAL_WORK_FIELDS,
  filmography: VISUAL_WORK_FIELDS,
  videos: VISUAL_WORK_FIELDS,
  menus: VISUAL_WORK_FIELDS,
  cocktails: VISUAL_WORK_FIELDS,
  projects: PROJECT_FIELDS,
  open_source: PROJECT_FIELDS,
};
