import type {
  SubprofileSectionView,
  SubprofileView,
} from "../api/subprofiles.adapters";
import { ItemRevisionHistoryModal } from "../rights/ItemRevisionHistoryModal";
import { useSubprofileEditorContext } from "../subprofileEditorContext";

/**
 * The gig drawer's revision history modal, wired the way the generic item
 * drawer wires it. Render it only while history is open and as a sibling of
 * the dialog, so a key press inside the modal never reaches the drawer's
 * shortcut handler.
 *
 * A restore rewrites the saved item server-side, which the drawer's local
 * draft cannot pick up, so a restore closes the modal AND the drawer, after
 * reseeding the section with the refetched persona (`null` in demo mode).
 * A restore refused because someone saved the persona meanwhile marks the
 * edit conflict and closes both too, so the conflict alert in the savebar
 * comes into view.
 */
export function GigDrawerHistory({
  subprofileId,
  itemId,
  section,
  onCloseHistory,
  onCloseDrawer,
}: {
  subprofileId: string;
  itemId: string;
  section: SubprofileSectionView["section"];
  onCloseHistory: () => void;
  onCloseDrawer: () => void;
}) {
  const { reseedSection, getEditVersion, adoptEditVersion, markEditConflict } =
    useSubprofileEditorContext();

  function closeHistoryAndDrawer(subprofile: SubprofileView | null) {
    if (subprofile) reseedSection(section, subprofile);
    onCloseHistory();
    onCloseDrawer();
  }

  function markConflictAndClose() {
    markEditConflict();
    onCloseHistory();
    onCloseDrawer();
  }

  return (
    <ItemRevisionHistoryModal
      subprofileId={subprofileId}
      itemId={itemId}
      section={section}
      onClose={onCloseHistory}
      onRestored={closeHistoryAndDrawer}
      editVersionControls={{
        getEditVersion,
        adoptEditVersion,
        markEditConflict: markConflictAndClose,
      }}
    />
  );
}
