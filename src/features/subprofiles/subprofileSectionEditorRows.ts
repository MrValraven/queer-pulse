import type { SubprofileSection } from "./api/subprofiles.api";
import type { SubprofileItemView } from "./api/subprofiles.adapters";

// ── Working-list row helpers for `SubprofileSectionEditor` ──────────────────
//
// Extracted out of the editor component to keep it under the 200-line cap.
// A `Row` is a `SubprofileItemView` plus a client-only `_uid` so React can key
// + reorder the working list before it's flattened back via `itemsToInputDto`.

export type SubprofileEditorRow = SubprofileItemView & { _uid: string };

let sequenceCounter = 0;

export const withUid = (item: SubprofileItemView): SubprofileEditorRow => ({
  ...item,
  _uid: `row-${sequenceCounter++}`,
});

export const emptyItem = (section: SubprofileSection): SubprofileItemView => ({
  // Not yet persisted: no server-assigned row exists yet. The revision-history
  // UI guards on `isNew`, not on `id` truthiness, so an empty placeholder is
  // fine here (mirrors the "Protect this work" section's existing pattern).
  id: "",
  section,
  // Not yet persisted: stamped with "now" as a placeholder until the save
  // response returns the real server-assigned `createdAt`.
  createdAt: new Date().toISOString(),
  title: "",
  subtitle: "",
  description: "",
  url: "",
  imageUrl: "",
  date: "",
  meta: "",
  tags: [],
  isFeatured: false,
  collaborators: [],
  venue: null,
  doors: null,
  ticketUrl: null,
  gigState: null,
  medium: null,
  dimensions: null,
  edition: null,
  workState: null,
  structured: null,
});

// ── Pure working-list transforms (Task 5) ────────────────────────────────
// Extracted so `SubprofileSectionEditor` only wires these into `setRows` +
// `touch()`, keeping the component's own body under the line cap.

/** Swap a row with its neighbor in the given direction; a no-op past either end. */
export function moveRow(
  rows: SubprofileEditorRow[],
  uid: string,
  dir: -1 | 1,
): SubprofileEditorRow[] {
  const i = rows.findIndex((r) => r._uid === uid);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return rows;
  const next = [...rows];
  [next[i], next[j]] = [next[j]!, next[i]!];
  return next;
}

/** Move a row from one index to another (pointer drag-reorder). A no-op when
 *  the indices are equal or either is out of range. `moveRow` above is the
 *  neighbour-swap the up/down arrows use; this is the free-form splice the
 *  grip's drag handle needs when the pointer crosses several rows at once. */
export function reorderRow(
  rows: SubprofileEditorRow[],
  from: number,
  to: number,
): SubprofileEditorRow[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= rows.length ||
    to >= rows.length
  )
    return rows;
  const next = [...rows];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved!);
  return next;
}

/** Toggle one row's spotlight, single-select within this working list only —
 *  the backend enforces the cross-section, persona-wide spotlight on save,
 *  clearing any featured item left in other sections. */
export function toggleRowFeature(
  rows: SubprofileEditorRow[],
  uid: string,
): SubprofileEditorRow[] {
  const target = rows.find((r) => r._uid === uid);
  if (!target) return rows;
  const turningOn = !target.isFeatured;
  return rows.map((r) => ({
    ...r,
    isFeatured: r._uid === uid ? turningOn : turningOn ? false : r.isFeatured,
  }));
}

/** Commit an item drawer's draft into the working list: appends for a new
 *  item (`editingUid === null`), replaces in place for an edit — applying
 *  the same single-select feature exclusivity as `toggleRowFeature`. */
export function commitDraftRow(
  rows: SubprofileEditorRow[],
  draft: SubprofileItemView,
  editingUid: string | null,
): SubprofileEditorRow[] {
  const cleared = draft.isFeatured
    ? rows.map((r) => (r._uid === editingUid ? r : { ...r, isFeatured: false }))
    : rows;
  return editingUid
    ? cleared.map((r) =>
        r._uid === editingUid ? { ...draft, _uid: r._uid } : r,
      )
    : [...cleared, withUid(draft)];
}

/** Append several new image-only rows to the working list (gallery multi-add):
 *  each key becomes an `emptyItem("gallery")` carrying just that `imageUrl`. */
export function appendGalleryRows(
  rows: SubprofileEditorRow[],
  imageKeys: string[],
): SubprofileEditorRow[] {
  return [
    ...rows,
    ...imageKeys.map((imageUrl) =>
      withUid({ ...emptyItem("gallery"), imageUrl }),
    ),
  ];
}
