import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  type SubprofileItemView,
  type SubprofileSectionView,
} from "./api/subprofiles.adapters";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { MAX_ITEMS_PER_SECTION } from "./subprofileEditor.data";
import { TEMPLATE_ITEMS, buildTemplateItems } from "./subprofileTemplates.data";
import {
  appendGalleryRows,
  commitDraftRow,
  emptyItem,
  moveRow,
  reorderRow,
  toggleRowFeature,
  withUid,
} from "./subprofileSectionEditorRows";
import { useRowDragReorder } from "./useRowDragReorder";
import { EditorItemRow } from "./EditorItemRow";
import { SubprofileItemDrawer } from "./SubprofileItemDrawer";
import { AddGalleryPhotosModal } from "./AddGalleryPhotosModal";
import styles from "./SubprofileEditor.module.css";

type DrawerState = { mode: "add" } | { mode: "edit"; uid: string };

/** Cap on the universal `gallery` section — matches the 6-photo grid
 *  `SubprofileSections` renders on the public persona page (`items.slice(0, 6)`),
 *  so the editor never lets an owner add a photo that would never show. */
const MAX_GALLERY_PHOTOS = 6;

/**
 * Edits one section: a collapsed `.itemrow` list (`EditorItemRow`) with
 * add/remove/reorder/feature-toggle; each item's full field set (base +
 * rich) is edited in the `SubprofileItemDrawer`. Rows are CONTROLLED by
 * `SubprofileEditorContext` (`sectionRows`/`setSectionRows`) — this pane has
 * no local state and no Save button; the global savebar's `saveAll()` PUTs
 * the whole section. Enforces `MAX_ITEMS_PER_SECTION` on Add.
 * Renders WITHOUT its own card chrome/header — `EditorPaneRouter` already
 * renders the active pane's `<h2>`/lede above this.
 */
export function SubprofileSectionEditor({
  subprofileId,
  section,
}: {
  subprofileId: string;
  section: SubprofileSectionView;
}) {
  const { t } = useTranslation();
  const { sectionRows, setSectionRows, meta } = useSubprofileEditorContext();
  const rows = sectionRows[section.section] ?? [];
  const [drawerState, setDrawerState] = useState<DrawerState | null>(null);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);

  const label = t(section.labelKey);
  const atMax = rows.length >= MAX_ITEMS_PER_SECTION;
  const isGalleryFull =
    section.section === "gallery" && rows.length >= MAX_GALLERY_PHOTOS;
  const canFeature =
    section.section !== "links" && section.section !== "gallery";
  const canInsertExamples =
    section.section !== "links" &&
    rows.length === 0 &&
    TEMPLATE_ITEMS[section.section] !== undefined;

  function remove(uid: string) {
    setSectionRows(section.section, rows.filter((r) => r._uid !== uid));
  }
  function move(uid: string, dir: -1 | 1) {
    setSectionRows(section.section, moveRow(rows, uid, dir));
  }
  // Pointer-capture grip drag reorders the array at each midpoint; motion's
  // `layout` on every row (see EditorItemRow) glides the rows into place for
  // BOTH drag swaps and up/down button presses, so no separate FLIP pass is
  // needed. Slot-swap (not motion's floating `drag`) avoids the residual-
  // transform overlap that `drag` + `layout` can leave.
  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(
    (from, to) => setSectionRows(section.section, reorderRow(rows, from, to)),
  );
  function insertExamples() {
    setSectionRows(section.section, buildTemplateItems(section.section, t).map(withUid));
  }
  function toggleFeatured(uid: string) {
    setSectionRows(section.section, toggleRowFeature(rows, uid));
  }

  function closeDrawer() {
    setDrawerState(null);
  }

  /** Commits the drawer's draft back into `rows` (see `commitDraftRow`). */
  function saveDraft(draft: SubprofileItemView) {
    const editingUid = drawerState?.mode === "edit" ? drawerState.uid : null;
    setSectionRows(section.section, commitDraftRow(rows, draft, editingUid));
    closeDrawer();
  }

  const editingRow =
    drawerState?.mode === "edit"
      ? rows.find((r) => r._uid === drawerState.uid)
      : undefined;
  const drawerItem = drawerState?.mode === "add" ? emptyItem(section.section) : editingRow;

  return (
    <>
      {rows.length === 0 && (
        <p className={styles.emptySection}>
          {t("subprofiles:sectionEditor.empty")}
        </p>
      )}
      {canInsertExamples && (
        <Button variant="ghost" onClick={insertExamples}>
          {t("subprofiles:template.insertExamples")}
        </Button>
      )}

      <div className={styles.itemsWrap} ref={containerRef}>
        {rows.map((row, index) => (
          <EditorItemRow
            key={row._uid}
            item={row}
            canFeature={canFeature}
            isFirst={index === 0}
            isLast={index === rows.length - 1}
            gripHandlers={gripHandlers(index)}
            isDragging={draggingIndex === index}
            onEdit={() => setDrawerState({ mode: "edit", uid: row._uid })}
            onMoveUp={() => move(row._uid, -1)}
            onMoveDown={() => move(row._uid, 1)}
            onToggleFeature={() => toggleFeatured(row._uid)}
            onRemove={() => remove(row._uid)}
          />
        ))}
      </div>

      <div className={styles.sectionFoot}>
        <div>
          {!isGalleryFull && (
            <button
              type="button"
              className={styles.addBtn}
              onClick={() =>
                section.section === "gallery"
                  ? setGalleryPickerOpen(true)
                  : setDrawerState({ mode: "add" })
              }
              disabled={atMax}
            >
              <FiPlus size={18} aria-hidden />{" "}
              {t("subprofiles:sectionEditor.addTo", {
                section: label.toLowerCase(),
              })}
            </button>
          )}
          {isGalleryFull ? (
            <p className={styles.capHint}>{t("subprofiles:galleryFull")}</p>
          ) : (
            atMax && (
              <p className={styles.capHint}>
                {t("subprofiles:sectionEditor.capHint")}
              </p>
            )
          )}
        </div>
      </div>

      {drawerState && drawerItem && (
        <SubprofileItemDrawer
          subprofileId={subprofileId}
          section={section}
          item={drawerItem}
          isNew={drawerState.mode === "add"}
          canFeature={canFeature}
          authorName={meta.displayName}
          onSave={saveDraft}
          onClose={closeDrawer}
        />
      )}

      {galleryPickerOpen && (
        <AddGalleryPhotosModal
          remaining={MAX_GALLERY_PHOTOS - rows.length}
          onClose={() => setGalleryPickerOpen(false)}
          onAdd={(imageKeys) =>
            setSectionRows(section.section, appendGalleryRows(rows, imageKeys))
          }
        />
      )}
    </>
  );
}
