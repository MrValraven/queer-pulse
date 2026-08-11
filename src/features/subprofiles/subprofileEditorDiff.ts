import { itemsToInputDto } from "./api/subprofiles.adapters";
import type { SubprofileEditorRow } from "./subprofileSectionEditorRows";

/**
 * Pure diff module for the subprofile editor's global-save work: turns
 * editor-draft-vs-baseline comparisons into a list of `PendingChange`
 * descriptors the "pending changes" UI (Task 5) renders and the save
 * orchestrator (Task 3) walks to fire the right mutations. No React, no
 * network, no i18n resolution — every string here is a KEY, resolved later
 * by the consuming UI via `t(...)`.
 */

// ── Shapes ────────────────────────────────────────────────────────────────

export type PendingArea =
  | { kind: "meta" }
  | { kind: "section"; section: string }
  | { kind: "socials" }
  | { kind: "affiliations" }
  | { kind: "skin" };

export interface PendingChange {
  area: PendingArea;
  areaLabelKey: string; // i18n key, resolved by the UI later
  summaryKey: string; // i18n key, resolved by the UI later
  params?: Record<string, string | number>;
}

/** Flat snapshot of the meta-editor's local field state (mirrors the
 *  `useState` fields + `dirty` OR-list in `useSubprofileMetaEditor.ts`), used
 *  as both the "current" draft and the persisted "baseline" for `diffMeta`. */
export interface MetaSnapshot {
  displayName: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  slug: string;
  handle: string;
  link: string;
  visibility: string;
  accent: string;
  availability: string;
  ctaLabel: string;
  ctaUrl: string;
  coverBleed: boolean;
}

export interface RowDiffCounts {
  added: number;
  removed: number;
  edited: number;
  reordered: boolean;
}

// ── Row (working-list) diff ──────────────────────────────────────────────

/** Generic `_uid`-keyed working-list diff, shared by every list the editor
 *  owns (section items, social links, affiliations). Counts additions,
 *  removals, and per-row content edits — where "content" is whatever
 *  `comparable(row)` projects each row to (its save-shape, so a uid/order-only
 *  difference never reads as "edited") — plus whether the surviving membership
 *  was merely reordered. `_uid` is assigned client-side (stable across
 *  reorders/edits within one editor session). */
export function diffRowsBy<Row extends { _uid: string }>(
  current: Row[],
  baseline: Row[],
  comparable: (row: Row) => unknown,
): RowDiffCounts {
  const currentUids = current.map((row) => row._uid);
  const baselineUids = baseline.map((row) => row._uid);
  const currentUidSet = new Set(currentUids);
  const baselineUidSet = new Set(baselineUids);
  const baselineByUid = new Map(baseline.map((row) => [row._uid, row]));

  const added = current.filter((row) => !baselineUidSet.has(row._uid)).length;
  const removed = baseline.filter((row) => !currentUidSet.has(row._uid)).length;

  let edited = 0;
  for (const row of current) {
    const baselineRow = baselineByUid.get(row._uid);
    if (!baselineRow) continue;
    const currentJson = JSON.stringify(comparable(row));
    const baselineJson = JSON.stringify(comparable(baselineRow));
    if (currentJson !== baselineJson) edited += 1;
  }

  // Membership unchanged (no add/remove) but the ordered uid list differs.
  const reordered =
    added === 0 &&
    removed === 0 &&
    JSON.stringify(currentUids) !== JSON.stringify(baselineUids);

  return { added, removed, edited, reordered };
}

/** Section-items specialization of `diffRowsBy` using the same `itemsToInputDto`
 *  shaping the save path sends. */
export function diffRows(
  current: SubprofileEditorRow[],
  baseline: SubprofileEditorRow[],
): RowDiffCounts {
  return diffRowsBy(current, baseline, (row) => itemsToInputDto([row]));
}

/** Fold one section's (or socials'/affiliations') `RowDiffCounts` into a
 *  single `PendingChange`, or `null` when nothing changed. The UI composes
 *  the human-readable count sentence from `params`; this only supplies the
 *  numbers. */
export function rowDiffToChange(
  area: PendingArea,
  areaLabelKey: string,
  counts: RowDiffCounts,
): PendingChange | null {
  const { added, removed, edited, reordered } = counts;
  if (added === 0 && removed === 0 && edited === 0 && !reordered) return null;
  return {
    area,
    areaLabelKey,
    summaryKey: "subprofiles:pending.rowSummary",
    params: {
      added,
      removed,
      edited,
      reordered: reordered ? 1 : 0,
    },
  };
}

// ── Meta diff ────────────────────────────────────────────────────────────

type MetaFieldKind = "text" | "enum" | "image" | "boolean";

interface MetaFieldSpec {
  field: keyof MetaSnapshot;
  kind: MetaFieldKind;
}

/** Mirrors the 14-field `dirty` OR-list at `useSubprofileMetaEditor.ts:124-138`
 *  — one spec per meta field, tagged with how its change reads in the pending
 *  list (plain text edit / enum "set to X" / image add-or-remove / boolean
 *  on-off). */
const META_FIELDS: MetaFieldSpec[] = [
  { field: "displayName", kind: "text" },
  { field: "tagline", kind: "text" },
  { field: "bio", kind: "text" },
  { field: "avatarUrl", kind: "image" },
  { field: "coverUrl", kind: "image" },
  { field: "slug", kind: "text" },
  { field: "handle", kind: "text" },
  { field: "link", kind: "enum" },
  { field: "visibility", kind: "enum" },
  { field: "accent", kind: "enum" },
  { field: "availability", kind: "enum" },
  { field: "ctaLabel", kind: "text" },
  { field: "ctaUrl", kind: "text" },
  { field: "coverBleed", kind: "boolean" },
];

const META_AREA_LABEL_KEY = "subprofiles:pending.area.meta";

/** Compare the meta-editor's local draft against its loaded baseline, one
 *  `PendingChange` per diverged field (never a single bundled "meta changed"
 *  entry — the pending list is meant to read like an itemized diff). */
export function diffMeta(
  current: MetaSnapshot,
  baseline: MetaSnapshot,
): PendingChange[] {
  const changes: PendingChange[] = [];

  for (const spec of META_FIELDS) {
    const currentValue = current[spec.field];
    const baselineValue = baseline[spec.field];
    if (currentValue === baselineValue) continue;

    const fieldLabelKey = `subprofiles:pending.field.${spec.field}`;

    // Enums (visibility/link/accent/availability) and the bleed boolean report
    // as a plain "{field} edited". We deliberately do NOT interpolate the new
    // value: it's a raw backend code ("members", "unlinked", an accent key) with
    // no locale-safe label here, so surfacing it would leak untranslated English
    // into every locale. The docked live preview already shows the real value.
    if (spec.kind === "boolean" || spec.kind === "enum") {
      changes.push({
        area: { kind: "meta" },
        areaLabelKey: META_AREA_LABEL_KEY,
        summaryKey: "subprofiles:pending.metaEdited",
        params: { field: fieldLabelKey },
      });
      continue;
    }

    if (spec.kind === "image") {
      const removed = currentValue === "";
      changes.push({
        area: { kind: "meta" },
        areaLabelKey: META_AREA_LABEL_KEY,
        summaryKey: removed
          ? "subprofiles:pending.metaImageRemoved"
          : "subprofiles:pending.metaImage",
        params: { field: fieldLabelKey },
      });
      continue;
    }

    // Plain text field.
    changes.push({
      area: { kind: "meta" },
      areaLabelKey: META_AREA_LABEL_KEY,
      summaryKey: "subprofiles:pending.metaEdited",
      params: { field: fieldLabelKey },
    });
  }

  return changes;
}

// ── Skin-block diff ──────────────────────────────────────────────────────

const SKIN_AREA_LABEL_KEY = "subprofiles:pending.area.skin";

/** Turn the skin-block editor's already-computed per-block changes (each
 *  carrying the block's human `titleKey`) into itemized `PendingChange`s — one
 *  "{block} updated" row per changed block, matching the meta pending style.
 *  The block-vs-baseline comparison itself lives in the skin-blocks hook
 *  (its values are nested objects/arrays, unlike the flat `MetaSnapshot`). */
export function skinChangesToPending(
  changes: { blockKey: string; titleKey: string }[],
): PendingChange[] {
  return changes.map((change) => ({
    area: { kind: "skin" },
    areaLabelKey: SKIN_AREA_LABEL_KEY,
    summaryKey: "subprofiles:pending.skinEdited",
    params: { field: change.titleKey },
  }));
}
