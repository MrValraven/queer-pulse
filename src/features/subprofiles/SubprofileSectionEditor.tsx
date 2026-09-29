import { useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type SubprofileSectionView } from "./api/subprofiles.adapters";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { MAX_ITEMS_PER_SECTION } from "./subprofileEditor.data";
import { TEMPLATE_ITEMS } from "./subprofileTemplates.data";
import { appendGalleryRows, reorderRow } from "./subprofileSectionEditorRows";
import { useRowDragReorder } from "./useRowDragReorder";
import { useSectionEditorFocusAnnounce } from "./useSectionEditorFocusAnnounce";
import { useSectionRowActions } from "./useSectionRowActions";
import { EditorItemRow } from "./EditorItemRow";
import { SectionEditorAddFooter } from "./SectionEditorAddFooter";
import {
  SectionEditorDialogs,
  type SectionEditorDrawerState,
} from "./SectionEditorDialogs";
import styles from "./SubprofileEditor.module.css";

/** Cap on the universal `gallery` section: matches the public page's 6-photo
 *  grid (`items.slice(0, 6)`), so the editor never adds a photo past that. */
const MAX_GALLERY_PHOTOS = 6;

/**
 * Edits one section's item list (`EditorItemRow` rows; full fields open via
 * `SectionEditorDialogs`). CONTROLLED by `SubprofileEditorContext`, no local
 * state; renders WITHOUT card chrome inside a Page blocks chapter card.
 */
export function SubprofileSectionEditor({
  subprofileId,
  section,
  isInChapter = false,
  isFeatureHidden = false,
}: {
  subprofileId: string;
  section: SubprofileSectionView;
  /** Rows render as one hairline list inside the chapter's card. */
  isInChapter?: boolean;
  /** No spotlight slot for this section in the kind's layout (S6). */
  isFeatureHidden?: boolean;
}) {
  const { t } = useTranslation();
  const { sectionRows, setSectionRows, meta } = useSubprofileEditorContext();
  const rows = sectionRows[section.section] ?? [];
  const [drawerState, setDrawerState] =
    useState<SectionEditorDrawerState | null>(null);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const { announcement, announce, focusRowOrAdd } =
    useSectionEditorFocusAnnounce(addButtonRef, rows);

  const isGallery = section.section === "gallery";
  const hasImageField = section.fields.includes("imageUrl");
  const isAtMax = rows.length >= MAX_ITEMS_PER_SECTION;
  const isGalleryFull = isGallery && rows.length >= MAX_GALLERY_PHOTOS;
  // A field jump lands on Add, else (list full) the first row's Edit button.
  const hasAddButton = !isGalleryFull && !isAtMax;
  const canFeature =
    section.section !== "links" &&
    section.section !== "gallery" &&
    !isFeatureHidden;
  const canInsertExamples =
    section.section !== "links" &&
    rows.length === 0 &&
    TEMPLATE_ITEMS[section.section] !== undefined;

  // The grip drag swaps rows at each midpoint; motion's `layout` glides them.
  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(
    (from, to) => setSectionRows(section.section, reorderRow(rows, from, to)),
  );
  const { remove, move, insertExamples, toggleFeatured, saveDraft } =
    useSectionRowActions({
      section,
      rows,
      setSectionRows,
      isGallery,
      announce,
      focusRowOrAdd,
      drawerState,
      setDrawerState,
    });

  return (
    <>
      {/* Always mounted, per `SkinChapterGroupCard`'s row-check pattern. */}
      <p aria-live="polite" className="visuallyHidden">
        {announcement}
      </p>
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

      <div
        className={
          isInChapter
            ? `${styles.itemsWrap} ${styles.itemsFlat}`
            : styles.itemsWrap
        }
        ref={containerRef}
      >
        {rows.map((row, index) => (
          <EditorItemRow
            key={row._uid}
            item={row}
            rowUid={row._uid}
            canFeature={canFeature}
            hasImageField={hasImageField}
            sectionIcon={section.icon}
            isFirst={index === 0}
            isLast={index === rows.length - 1}
            gripHandlers={gripHandlers(index)}
            isDragging={draggingIndex === index}
            isFlat={isInChapter}
            isJumpTarget={!hasAddButton && index === 0}
            onEdit={() => setDrawerState({ mode: "edit", uid: row._uid })}
            onMoveUp={() => move(row._uid, -1)}
            onMoveDown={() => move(row._uid, 1)}
            onToggleFeature={() => toggleFeatured(row._uid)}
            onRemove={() => remove(row._uid)}
          />
        ))}
      </div>
      <SectionEditorAddFooter
        isGallery={isGallery}
        isGalleryFull={isGalleryFull}
        isAtMax={isAtMax}
        hasAddButton={hasAddButton}
        sectionLabelKey={section.labelKey}
        addButtonRef={addButtonRef}
        onAdd={() =>
          isGallery
            ? setIsGalleryPickerOpen(true)
            : setDrawerState({ mode: "add" })
        }
      />
      <SectionEditorDialogs
        subprofileId={subprofileId}
        section={section}
        drawerState={drawerState}
        rows={rows}
        canFeature={canFeature}
        authorName={meta.displayName}
        onSaveDraft={saveDraft}
        onCloseDrawer={() => setDrawerState(null)}
        isGalleryPickerOpen={isGalleryPickerOpen}
        galleryRemaining={MAX_GALLERY_PHOTOS - rows.length}
        onGalleryClose={() => setIsGalleryPickerOpen(false)}
        onGalleryAdd={(imageKeys) =>
          setSectionRows(section.section, appendGalleryRows(rows, imageKeys))
        }
      />
    </>
  );
}
