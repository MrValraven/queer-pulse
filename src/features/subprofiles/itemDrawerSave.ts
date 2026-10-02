/** Where the save is, in words: what's stopping it, or what it would do. */
export type SaveState = "blocked" | "dirty" | "clean";

/** Save is ready once nothing required is missing and there is something to
 *  save: any change, or a brand-new item. */
export function itemDrawerSaveState({
  isNew,
  isDirty,
  isMissingRequired,
}: {
  isNew: boolean;
  isDirty: boolean;
  isMissingRequired: boolean;
}): SaveState {
  if (isMissingRequired) return "blocked";
  return isDirty || isNew ? "dirty" : "clean";
}
