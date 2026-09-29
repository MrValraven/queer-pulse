import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "./api/subprofiles.adapters";
import { emptyItem } from "./subprofileSectionEditorRows";
import type { SubprofileEditorRow } from "./subprofileSectionEditorRows";
import { SubprofileItemDrawer } from "./SubprofileItemDrawer";
import { AddGalleryPhotosModal } from "./AddGalleryPhotosModal";

export type SectionEditorDrawerState =
  { mode: "add" } | { mode: "edit"; uid: string };

/**
 * The section editor's two dialogs: the item drawer (add/edit a row's full
 * field set, looked up from `rows` for an edit) and the gallery's
 * multi-photo picker. Extracted out of `SubprofileSectionEditor` to keep
 * that component under the 200-line cap; `drawerState`/`isGalleryPickerOpen`
 * still live there.
 */
export function SectionEditorDialogs({
  subprofileId,
  section,
  drawerState,
  rows,
  canFeature,
  authorName,
  onSaveDraft,
  onCloseDrawer,
  isGalleryPickerOpen,
  galleryRemaining,
  onGalleryClose,
  onGalleryAdd,
}: {
  subprofileId: string;
  section: SubprofileSectionView;
  drawerState: SectionEditorDrawerState | null;
  rows: SubprofileEditorRow[];
  canFeature: boolean;
  authorName: string;
  onSaveDraft: (draft: SubprofileItemView) => void;
  onCloseDrawer: () => void;
  isGalleryPickerOpen: boolean;
  galleryRemaining: number;
  onGalleryClose: () => void;
  onGalleryAdd: (imageKeys: string[]) => void;
}) {
  const editingRow =
    drawerState?.mode === "edit"
      ? rows.find((row) => row._uid === drawerState.uid)
      : undefined;
  const drawerItem =
    drawerState?.mode === "add" ? emptyItem(section.section) : editingRow;
  return (
    <>
      {drawerState && drawerItem && (
        <SubprofileItemDrawer
          subprofileId={subprofileId}
          section={section}
          item={drawerItem}
          isNew={drawerState.mode === "add"}
          canFeature={canFeature}
          authorName={authorName}
          onSave={onSaveDraft}
          onClose={onCloseDrawer}
        />
      )}
      {isGalleryPickerOpen && (
        <AddGalleryPhotosModal
          remaining={galleryRemaining}
          onClose={onGalleryClose}
          onAdd={onGalleryAdd}
        />
      )}
    </>
  );
}
