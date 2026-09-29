import type { EditorPaneKey } from "./editorRail.data";
import type { SubprofileMetaEditor } from "./useSubprofileMetaEditor";

/** The meta gate holding Save back, most specific first, so the note names
 *  the exact fix. `null` when no meta gate applies. Shared by the desktop
 *  savebar (`EditorSavebar`) and the phone row (`EditorSavebarPhone`).
 *
 *  `activePane` is the pane on screen (`?pane=`). On the Address pane the
 *  handle field is right there, so a handle reason uses its `Here` variant,
 *  which points at the field and leaves out "on the Address tab". Left out,
 *  every reason names its tab. */
export function metaBlockReasonKey(
  meta: Pick<
    SubprofileMetaEditor,
    | "nameMissing"
    | "handleBlocked"
    | "isStandaloneHandleMissing"
    | "isHandleKindName"
  >,
  activePane?: EditorPaneKey,
): string | null {
  if (meta.nameMissing) return "subprofiles:pending.blockedName";
  if (!meta.handleBlocked) return null;
  const isOnAddressPane = activePane === "address";
  if (meta.isStandaloneHandleMissing)
    return isOnAddressPane
      ? "subprofiles:pending.blockedHandleMissingHere"
      : "subprofiles:pending.blockedHandleMissing";
  if (meta.isHandleKindName)
    return isOnAddressPane
      ? "subprofiles:pending.blockedHandleKindHere"
      : "subprofiles:pending.blockedHandleKind";
  return isOnAddressPane
    ? "subprofiles:pending.blockedHandleHere"
    : "subprofiles:pending.blockedHandle";
}
