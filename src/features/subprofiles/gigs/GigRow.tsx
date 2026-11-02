import { FiMapPin, FiStar } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import type { PointerEvent as ReactPointerEvent } from "react";
import { m } from "motion/react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { reorderLayoutTransition } from "../reorderMotion";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import { EditorItemRowThumbnail } from "../EditorItemRowThumbnail";
import { EditorItemRowActions } from "../EditorItemRowActions";
import { isItemPhotoBlurred } from "../skins/tattoo/tattooItemImages";
import { GigDateBlock } from "./GigDateBlock";
import { GigStateChip } from "./GigStateChip";
import { GigRowMeta } from "./GigRowMeta";
import styles from "./GigRow.module.css";

interface GripDragHandlers {
  /** Only `onPointerDown` arms the drag; the move/up lifecycle is owned by
   *  window listeners in `useRowDragReorder`. */
  onPointerDown: (event: ReactPointerEvent) => void;
}

interface GigRowProps {
  item: SubprofileItemView;
  /** The working-list row's client-only id (`SubprofileEditorRow._uid`). */
  rowUid: string;
  /** Whether this section supports a spotlight item at all. */
  canFeature: boolean;
  /** Group-local: first row of its Upcoming or Past group. */
  isFirst: boolean;
  /** Group-local: last row of its Upcoming or Past group. */
  isLast: boolean;
  gripHandlers: GripDragHandlers;
  isDragging: boolean;
  /** Hairline list row inside a chapter card (the default is a bordered card). */
  isFlat?: boolean;
  isJumpTarget?: boolean;
  /** True when the gig sits in the Past group: the row is dimmed until
   *  hover or focus. */
  isPast: boolean;
  /** Read-only rendering for the drawer preview: no grip, no actions and no
   *  layout motion. */
  isStatic?: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleFeature: () => void;
  onRemove: () => void;
}

/**
 * One gig in the editor list: grip, date block, optional 44px poster, content
 * (title, state chip, Spotlight badge, meta lines) and the shared
 * `EditorItemRowActions`. An `m.div` with `layout` like `EditorItemRow`, so
 * the drag engine and the up/down buttons glide neighbours the same way.
 *
 * The layout is a grid that answers to the `section-list` container: below
 * 400px the actions take their own line, from 400px they rejoin the row (460px
 * for a row with a poster). Without a `section-list` ancestor the narrow
 * layout applies.
 */
export function GigRow({
  item,
  rowUid,
  canFeature,
  isFirst,
  isLast,
  gripHandlers,
  isDragging,
  isFlat = false,
  isJumpTarget = false,
  isPast,
  isStatic = false,
  onEdit,
  onMoveUp,
  onMoveDown,
  onToggleFeature,
  onRemove,
}: GigRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isCancelled = item.gigState === "cancelled";
  const rowClassName = [
    "itemrow",
    styles.gigRow,
    isFlat ? styles.flat : "",
    isStatic ? styles.static : "",
    item.imageUrl ? styles.hasPoster : "",
    isPast ? styles.past : "",
    isCancelled ? styles.cancelled : "",
    isDragging ? styles.dragging : "",
  ]
    .filter(Boolean)
    .join(" ");
  const titleText =
    item.title || t("subprofiles:gigEditor.field.name.placeholder");
  const titleClassName = item.title
    ? styles.title
    : `${styles.title} ${styles.titleEmpty}`;

  return (
    <m.div
      className={rowClassName}
      data-row-uid={rowUid}
      layout={!isStatic}
      transition={{
        layout: reorderLayoutTransition(reducedMotion || isDragging),
      }}
    >
      {!isStatic && (
        <span
          className="grip"
          aria-hidden
          title={t("subprofiles:itemEditor.dragToReorder")}
          {...gripHandlers}
        >
          <MdDragIndicator size={18} />
        </span>
      )}
      <div className={styles.date}>
        <GigDateBlock rawDate={item.date} />
      </div>
      {item.imageUrl && (
        <div className={styles.poster}>
          <EditorItemRowThumbnail
            imageUrl={item.imageUrl}
            sectionIcon={FiMapPin}
            isBlurred={isItemPhotoBlurred(item)}
          />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.headline}>
          {isStatic ? (
            <span className={titleClassName}>{titleText}</span>
          ) : (
            <button type="button" className={titleClassName} onClick={onEdit}>
              {titleText}
            </button>
          )}
          <GigStateChip gigState={item.gigState} />
          {item.isFeatured && (
            <span className={styles.spotlight}>
              <FiStar size={12} fill="currentColor" aria-hidden />
              {t("subprofiles:gigEditor.row.spotlight")}
            </span>
          )}
        </div>
        <GigRowMeta item={item} />
      </div>
      {!isStatic && (
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
      )}
    </m.div>
  );
}
