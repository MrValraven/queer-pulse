import { MdDragIndicator } from "react-icons/md";
import type { IconType } from "react-icons";
import type { PointerEvent as ReactPointerEvent } from "react";
import { m } from "motion/react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { reorderLayoutTransition } from "./reorderMotion";
import { formatMonthYear } from "../../shared/lib/date";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import { EditorItemRowThumbnail } from "./EditorItemRowThumbnail";
import { EditorItemRowActions } from "./EditorItemRowActions";
import styles from "./EditorItemRow.module.css";

interface GripDragHandlers {
  /** Only `onPointerDown` arms the drag; the move/up lifecycle is owned by
   *  window listeners in `useRowDragReorder` (survives motion `layout`
   *  dropping the grip's pointer capture). */
  onPointerDown: (event: ReactPointerEvent) => void;
}

interface EditorItemRowProps {
  item: SubprofileItemView;
  /** The working-list row's client-only id (`SubprofileEditorRow._uid`),
   *  used only to find this row's Edit button after a remove (M2). */
  rowUid: string;
  /** Whether this section supports a spotlight item at all (false for `links`). */
  canFeature: boolean;
  /** Whether the section's items carry an `imageUrl` field at all: the 44px
   *  slot renders for every row so titles line up, image or not (S1). */
  hasImageField: boolean;
  /** Shown centred in the slot, tinted, when a row has no image (S1). */
  sectionIcon: IconType;
  isFirst: boolean;
  isLast: boolean;
  /** Pointer-capture handlers that turn the grip into the drag handle (`useRowDragReorder`). */
  gripHandlers: GripDragHandlers;
  /** True while this row is the one being dragged (lifts it visually). */
  isDragging: boolean;
  /** Inside a Page blocks chapter card: a hairline list row that reflows
   *  its actions under the title when the list is narrow (`.flat`). */
  isFlat?: boolean;
  /** Marks the Edit button as a field jump's landing spot, for a list with
   *  no Add button (see `SubprofileSectionEditor`). */
  isJumpTarget?: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleFeature: () => void;
  onRemove: () => void;
}

/**
 * One collapsed row in a section's `.itemrow` list: grip drag handle,
 * title + subtitle, and `.iact` actions (feature toggle, move up/down,
 * edit, remove). Distinct from the PUBLIC `SubprofileItemRow` on the live
 * persona page; presentational only, state lives in `SubprofileSectionEditor`.
 *
 * An `m.div` with `layout`: pointer-capture on the grip (`gripHandlers`;
 * see `useRowDragReorder`) reorders the array at each midpoint, and
 * motion's `layout` glides each row into its new slot instead of using
 * motion's `drag` gesture, which floats the row at an offset that fights
 * `layout`. The up/down buttons stay the keyboard/assistive-tech path.
 */
export function EditorItemRow({
  item,
  rowUid,
  canFeature,
  hasImageField,
  sectionIcon: SectionIcon,
  isFirst,
  isLast,
  gripHandlers,
  isDragging,
  isFlat = false,
  isJumpTarget = false,
  onEdit,
  onMoveUp,
  onMoveDown,
  onToggleFeature,
  onRemove,
}: EditorItemRowProps) {
  const { t, language } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const subtitle = [
    item.subtitle,
    item.meta,
    formatMonthYear(item.date, language),
  ]
    .filter(Boolean)
    .join(" · ");
  const rowClassName = [
    "itemrow",
    isFlat ? styles.flat : "",
    isDragging ? styles.dragging : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <m.div
      className={rowClassName}
      data-row-uid={rowUid}
      layout
      // The held row is translated by the drag engine itself, so only its
      // neighbours glide (the shared glide, instant under reduced motion).
      transition={{
        layout: reorderLayoutTransition(reducedMotion || isDragging),
      }}
    >
      <span
        className="grip"
        aria-hidden
        title={t("subprofiles:itemEditor.dragToReorder")}
        {...gripHandlers}
      >
        <MdDragIndicator size={18} />
      </span>
      {hasImageField && (
        <EditorItemRowThumbnail
          imageUrl={item.imageUrl}
          sectionIcon={SectionIcon}
        />
      )}
      <div className={styles.content}>
        <b>
          {item.title ||
            (item.imageUrl ? t("subprofiles:itemEditor.untitledPhoto") : "")}
        </b>
        {subtitle && <small>{subtitle}</small>}
      </div>
      <EditorItemRowActions
        canFeature={canFeature}
        isFeatured={item.isFeatured}
        isFirst={isFirst}
        isLast={isLast}
        isJumpTarget={isJumpTarget}
        onEdit={onEdit}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onToggleFeature={onToggleFeature}
        onRemove={onRemove}
      />
    </m.div>
  );
}
