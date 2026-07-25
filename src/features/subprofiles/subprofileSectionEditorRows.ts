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
  section,
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
});
