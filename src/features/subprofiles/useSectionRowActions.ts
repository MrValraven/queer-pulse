import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "./api/subprofiles.adapters";
import {
  commitDraftRow,
  moveRow,
  toggleRowFeature,
  withUid,
  type SubprofileEditorRow,
} from "./subprofileSectionEditorRows";
import { buildTemplateItems } from "./subprofileTemplates.data";
import type { SectionEditorDrawerState } from "./SectionEditorDialogs";

/**
 * `SubprofileSectionEditor`'s per-row handlers (remove, move, insert
 * examples, toggle feature, commit the drawer's draft): extracted into a
 * hook to keep that component under the 200-line cap. Takes the section's
 * working list and the setters it acts on; returns nothing but the
 * handlers themselves, so the caller still owns all the state.
 */
export function useSectionRowActions({
  section,
  rows,
  setSectionRows,
  isGallery,
  announce,
  focusRowOrAdd,
  drawerState,
  setDrawerState,
}: {
  section: SubprofileSectionView;
  rows: SubprofileEditorRow[];
  setSectionRows: (section: string, rows: SubprofileEditorRow[]) => void;
  isGallery: boolean;
  announce: (message: string) => void;
  focusRowOrAdd: (uid: string | undefined) => void;
  drawerState: SectionEditorDrawerState | null;
  setDrawerState: (state: SectionEditorDrawerState | null) => void;
}) {
  const { t } = useTranslation();

  function remove(uid: string) {
    const index = rows.findIndex((row) => row._uid === uid);
    const removedTitle = rows[index]?.title || t(section.labelKey);
    setSectionRows(
      section.section,
      rows.filter((row) => row._uid !== uid),
    );
    focusRowOrAdd(rows[index + 1]?._uid ?? rows[index - 1]?._uid);
    // Gallery photos are usually untitled. This announces a title-free
    // string here, since the section label alone would read oddly
    // ("Removed Photo gallery").
    announce(
      isGallery
        ? t("subprofiles:sectionEditor.removedPhotoAnnounce")
        : t("subprofiles:sectionEditor.removedAnnounce", {
            title: removedTitle,
          }),
    );
  }

  function move(uid: string, direction: -1 | 1) {
    setSectionRows(section.section, moveRow(rows, uid, direction));
  }

  function insertExamples() {
    const newRows = buildTemplateItems(section.section, t).map(withUid);
    setSectionRows(section.section, newRows);
    focusRowOrAdd(newRows[0]?._uid);
    announce(
      t("subprofiles:sectionEditor.addedExamplesAnnounce", {
        count: newRows.length,
      }),
    );
  }

  function toggleFeatured(uid: string) {
    setSectionRows(section.section, toggleRowFeature(rows, uid));
  }

  /** Commits the drawer's draft back into `rows` (see `commitDraftRow`). */
  function saveDraft(draft: SubprofileItemView) {
    const editingUid = drawerState?.mode === "edit" ? drawerState.uid : null;
    setSectionRows(section.section, commitDraftRow(rows, draft, editingUid));
    setDrawerState(null);
  }

  return { remove, move, insertExamples, toggleFeatured, saveDraft };
}
