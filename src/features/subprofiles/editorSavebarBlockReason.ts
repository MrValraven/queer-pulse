import type { SubprofileMetaEditor } from "./useSubprofileMetaEditor";

/** The meta gate holding Save back, most specific first, so the note names
 *  the exact fix. `null` when no meta gate applies. Shared by the desktop
 *  savebar (`EditorSavebar`) and the phone row (`EditorSavebarPhone`). */
export function metaBlockReasonKey(
  meta: Pick<
    SubprofileMetaEditor,
    | "nameMissing"
    | "handleBlocked"
    | "isStandaloneHandleMissing"
    | "isHandleKindName"
  >,
): string | null {
  if (meta.nameMissing) return "subprofiles:pending.blockedName";
  if (!meta.handleBlocked) return null;
  if (meta.isStandaloneHandleMissing)
    return "subprofiles:pending.blockedHandleMissing";
  if (meta.isHandleKindName) return "subprofiles:pending.blockedHandleKind";
  return "subprofiles:pending.blockedHandle";
}
