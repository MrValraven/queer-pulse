interface SavedLabelState {
  isSavePending: boolean;
  isSaveError: boolean;
  isDirty: boolean;
  /** ENG-111. The draft moved on underneath this tab and autosave has
   *  stopped. Outranks every other state: while it holds, nothing this editor
   *  types is being written anywhere. */
  hasSaveConflict: boolean;
}

/**
 * The i18n key for the editor header's save indicator.
 *
 * `isDirty` is deliberately part of it: the label used to read "All changes
 * saved" during the whole 1.2s autosave debounce, and after a failed save as
 * soon as any later save succeeded, so it told writers their work was safe
 * when it was still only in the browser.
 */
export function savedLabelKey({
  isSavePending,
  isSaveError,
  isDirty,
  hasSaveConflict,
}: SavedLabelState): string {
  if (hasSaveConflict) return "magazine:write.header.savedConflict";
  if (isSavePending) return "magazine:write.header.savedSaving";
  if (isSaveError) return "magazine:write.header.savedError";
  if (isDirty) return "magazine:write.header.savedUnsaved";
  return "magazine:write.header.savedOk";
}
