import type {
  GigState,
  SubprofileItemDTO,
  SubprofileSection,
  WorkState,
} from "./api/subprofiles.api";
import type { SkinFamily } from "./subprofile-skins";
import { VISUAL_SECTIONS } from "./subprofile-skins";

/**
 * How the persona-page renderer (`SubprofileHero`/`SubprofileSections`/
 * `SubprofileSpotlight`/`SubprofileSkinExtras`) is being shown: a public
 * visitor, the persona's own owner, or the Phase-3 editor's non-interactive
 * preview. Shared here so every renderer component references the same
 * literal union instead of redeclaring it.
 */
export type PersonaViewMode = "public" | "owner" | "preview";

/**
 * The intents a viewer's persona-page controls dispatch up to the page host
 * (`SubprofilePage.handleAction`) via the `onAction` callback, threaded through
 * `SubprofilePageBody` → `SubprofileHero`/`SubprofileHeroActions`/
 * `SubprofileMoreMenu`/`SubprofileAffiliations`. `"report"` opens the report
 * modal; the `"people:*"` pair opens the endorsers/followers modal; the
 * navigation intents (`"edit"`/`"cta"`/`"message"`) accompany controls that
 * also carry their own `to`/`href`/handler. Replaces the former bare `string`
 * so every hop is checked against the same closed set.
 */
export type PersonaAction =
  | "edit"
  | "cta"
  | "message"
  | "report"
  | "people:endorsers"
  | "people:followers";

/**
 * Is a freeform item date ("14 Mar 2026", "2026", "Feb 2026") in the future?
 * Not stored — derived at render. `Date.parse` handles every format the
 * persona editors produce; an unparseable or past date is "not upcoming".
 */
export function isUpcoming(date: string | null | undefined): boolean {
  if (!date) return false;
  const parsed = Date.parse(date);
  if (Number.isNaN(parsed)) return false;
  return parsed > Date.now();
}

/**
 * `gigState` chip labels (ItemRow, stage skin). i18n label-key indirection —
 * `gigState` is a PERSISTED field, so the Record key is the stable canonical
 * value; resolve the label via `t(GIG_STATE_LABEL[gigState])` at render.
 * Mirrors `KIND_LABEL_KEYS` in `subprofile-kinds.ts`. Matching English strings
 * live at `gigState.*` in both i18n catalogs.
 */
export const GIG_STATE_LABEL: Record<GigState, string> = {
  sold_out: "subprofiles:gigState.sold_out",
  cancelled: "subprofiles:gigState.cancelled",
  guest: "subprofiles:gigState.guest",
};

/**
 * `workState` chip labels (ItemRow, studio/workshop skins). Same label-key
 * indirection as `GIG_STATE_LABEL`. Matching English strings live at
 * `workState.*` in both i18n catalogs.
 */
export const WORK_STATE_LABEL: Record<WorkState, string> = {
  shipped: "subprofiles:workState.shipped",
  archived: "subprofiles:workState.archived",
  in_progress: "subprofiles:workState.in_progress",
};

/**
 * `workState` values use an underscore (`in_progress`); the `.gigstate` chip
 * CSS modifier the ported stylesheet targets is hyphenated
 * (`.gigstate.in-progress`) — used by both `SubprofileItemRow` and
 * `SubprofileItemTile`, whose chip rendering is otherwise identical.
 */
export const WORK_STATE_CLASS: Record<WorkState, string> = {
  shipped: "shipped",
  archived: "archived",
  in_progress: "in-progress",
};

/**
 * The " · "-joined studio-work meta line ("Oil on linen · 40×50cm · Ed. 3/10")
 * built from an item's `medium`/`dimensions`/`edition`, dropping any that are
 * empty. Shared by the studio tile, checklist, and lightbox so the field order
 * and separator stay in lockstep. Typed structurally so it accepts a
 * `SubprofileItemView` without importing the view model (no import cycle).
 */
export function workMeta(item: {
  medium: string | null;
  dimensions: string | null;
  edition: string | null;
}): string {
  return [item.medium, item.dimensions, item.edition]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Dietary-mark legend (Table skin — `structured.courses[].dishes[].marks`).
 * Not a persisted enum type (marks are freeform strings on the dish), but
 * `v`/`ve`/`gf` are the only marks the create flow offers, so the same
 * label-key indirection applies. Matching English strings live at
 * `dietary.*` in both i18n catalogs.
 */
export const DIETARY: Record<string, string> = {
  v: "subprofiles:dietary.v",
  ve: "subprofiles:dietary.ve",
  gf: "subprofiles:dietary.gf",
};

/**
 * How a section's items should render on the persona page.
 * - "gallery": the universal `gallery` section — an image-only grid.
 * - "visual": an image-tile grid (`VISUAL_SECTIONS`, e.g. portfolio, menus).
 * - "stage-split": stage-skin sections with at least one upcoming item —
 *   upcoming rows first, then a "Played" block for the rest.
 * - "list": every other section — a plain `.pp-list` of rows.
 */
export function sectionShape(
  section: SubprofileSection,
  skin: SkinFamily,
  items: SubprofileItemDTO[],
): "list" | "visual" | "gallery" | "stage-split" {
  if (section === "gallery") return "gallery";
  if (VISUAL_SECTIONS.includes(section)) return "visual";
  if (skin === "stage" && items.some((item) => isUpcoming(item.date))) {
    return "stage-split";
  }
  return "list";
}
