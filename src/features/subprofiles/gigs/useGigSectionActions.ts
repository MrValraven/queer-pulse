import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import type { SubprofileEditorRow } from "../subprofileSectionEditorRows";
import type { SectionEditorDrawerState } from "../SectionEditorDialogs";
import {
  commitGigDraft,
  groupGigRows,
  moveWithinGroup,
  reorderWithinGroup,
  type GigGroupName,
} from "./gigRows";

/**
 * The gig editor's own row handlers: moving a gig inside its group, the grip
 * drag reorder inside a group, and committing the drawer's draft with
 * date-sorted placement. Remove, Insert examples and the spotlight toggle come
 * from the shared `useSectionRowActions`. The caller owns all the state; this
 * hook only turns it into handlers.
 */
export function useGigSectionActions({
  rows,
  setSectionRows,
  drawerState,
  setDrawerState,
  announce,
  onLanded,
}: {
  rows: SubprofileEditorRow[];
  setSectionRows: (section: string, rows: SubprofileEditorRow[]) => void;
  drawerState: SectionEditorDrawerState | null;
  setDrawerState: (state: SectionEditorDrawerState | null) => void;
  announce: (message: string) => void;
  /** Called after a save with the group the gig landed in. */
  onLanded: (group: GigGroupName) => void;
}) {
  const { t } = useTranslation();

  /** Swaps a gig with its neighbour in its own group (a no-op at the edge). */
  function move(rowUid: string, direction: -1 | 1) {
    const groups = groupGigRows(rows);
    for (const groupName of ["upcoming", "past"] as const) {
      const groupIndex = groups[groupName].findIndex(
        (entry) => entry.row._uid === rowUid,
      );
      if (groupIndex !== -1) {
        setSectionRows(
          "gigs",
          moveWithinGroup(rows, groupName, groupIndex, direction),
        );
        return;
      }
    }
  }

  /** Grip drag result, with group-local positions. */
  function reorder(
    group: GigGroupName,
    fromGroupIndex: number,
    toGroupIndex: number,
  ) {
    setSectionRows(
      "gigs",
      reorderWithinGroup(rows, group, fromGroupIndex, toGroupIndex),
    );
  }

  /** Commits the drawer's draft, then names the group the gig landed in. */
  function saveDraft(draft: SubprofileItemView) {
    const editingUid = drawerState?.mode === "edit" ? drawerState.uid : null;
    const committed = commitGigDraft(rows, draft, editingUid);
    setSectionRows("gigs", committed.rows);
    setDrawerState(null);
    const groupLabel = t(
      `subprofiles:gigEditor.group.${committed.landedGroup}`,
    );
    const gigTitle = draft.title || t("subprofiles:gigEditor.preview.untitled");
    announce(`${gigTitle}, ${groupLabel}`);
    onLanded(committed.landedGroup);
  }

  return { move, reorder, saveDraft };
}
