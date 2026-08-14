import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiMoreVertical,
  FiStar,
  FiTrash2,
} from "react-icons/fi";
import type { PointerEvent as ReactPointerEvent } from "react";
import { m } from "motion/react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMotionPrefs } from "../../app/providers/MotionProvider";
import { formatMonthYear } from "../../shared/lib/date";
import { ImageSlot } from "../../shared/components/ui";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import styles from "./EditorItemRow.module.css";

/** Reorder glide, tuned to the repo's motion tokens (`--dur-base` / `--ease`
 *  in styles/tokens/effects.css) so the drag/arrow reflow matches every other
 *  transition in the app. Instant under reduced motion — the reorder itself is
 *  a control, not decoration, so only the glide is suppressed. */
const LAYOUT_EASE = [0.22, 0.68, 0.16, 1] as const;
const LAYOUT_DURATION = 0.25;

interface GripDragHandlers {
  /** Only `onPointerDown` arms the drag — the move/up lifecycle is owned by
   *  window listeners in `useRowDragReorder` (survives motion `layout`
   *  dropping the grip's pointer capture). */
  onPointerDown: (event: ReactPointerEvent) => void;
}

interface EditorItemRowProps {
  item: SubprofileItemView;
  /** Whether this section supports a spotlight item at all (false for `links`). */
  canFeature: boolean;
  isFirst: boolean;
  isLast: boolean;
  /** Pointer-capture handlers that turn the grip into the drag handle
   *  (`useRowDragReorder`). */
  gripHandlers: GripDragHandlers;
  /** True while this row is the one being dragged (lifts it visually). */
  isDragging: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleFeature: () => void;
  onRemove: () => void;
}

/**
 * One collapsed row in a section's `.itemrow` list — a grip drag handle, the
 * item's title + a compact subtitle line, and `.iact` action buttons:
 * feature-star toggle, move up/down, edit (opens the item drawer), remove.
 * Distinct from the PUBLIC `SubprofileItemRow` (which renders a published item
 * on the live persona page). Presentational only — all state lives in
 * `SubprofileSectionEditor`.
 *
 * Rendered as an `m.div` with `layout`: pointer-capture on the grip
 * (`gripHandlers`, mouse/touch/pen — see `useRowDragReorder`) reorders the
 * array at each midpoint, and motion's `layout` glides every row into its new
 * slot. The up/down buttons stay the keyboard/assistive-tech path (so the grip
 * can remain `aria-hidden`). We drive the drag with pointer capture rather than
 * motion's `drag` gesture on purpose: `drag` floats the row at an arbitrary
 * offset that fights `layout` and can leave a residual transform (rows overlay)
 * — a discrete slot-swap can't. (Motion's `Reorder` isn't an option either:
 * it's incompatible with the app's `LazyMotion strict`.)
 */
export function EditorItemRow({
  item,
  canFeature,
  isFirst,
  isLast,
  gripHandlers,
  isDragging,
  onEdit,
  onMoveUp,
  onMoveDown,
  onToggleFeature,
  onRemove,
}: EditorItemRowProps) {
  const { t, language } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const subtitle = [item.subtitle, item.meta, formatMonthYear(item.date, language)]
    .filter(Boolean)
    .join(" · ");

  return (
    <m.div
      className={isDragging ? `itemrow ${styles.dragging}` : "itemrow"}
      layout
      transition={{
        layout: reducedMotion
          ? { duration: 0 }
          : { duration: LAYOUT_DURATION, ease: LAYOUT_EASE },
      }}
    >
      <span
        className="grip"
        aria-hidden
        title={t("subprofiles:itemEditor.dragToReorder")}
        {...gripHandlers}
      >
        <FiMoreVertical size={16} />
      </span>
      {item.imageUrl && (
        <ImageSlot
          src={item.imageUrl}
          alt=""
          width={44}
          height={44}
          radius={10}
          srcSize={96}
          className={styles.thumb}
        />
      )}
      <div className={styles.content}>
        <b>
          {item.title ||
            (item.imageUrl ? t("subprofiles:itemEditor.untitledPhoto") : "")}
        </b>
        {subtitle && <small>{subtitle}</small>}
      </div>
      <div className="itemacts">
        {canFeature && (
          <button
            type="button"
            className="iact"
            onClick={onToggleFeature}
            aria-pressed={item.isFeatured}
            aria-label={t(
              item.isFeatured
                ? "subprofiles:itemEditor.unfeature"
                : "subprofiles:itemEditor.feature",
            )}
            title={t(
              item.isFeatured
                ? "subprofiles:itemEditor.unfeature"
                : "subprofiles:itemEditor.feature",
            )}
          >
            <FiStar size={15} aria-hidden />
          </button>
        )}
        <button
          type="button"
          className="iact"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label={t("subprofiles:itemEditor.moveUp")}
        >
          <FiArrowUp size={15} aria-hidden />
        </button>
        <button
          type="button"
          className="iact"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label={t("subprofiles:itemEditor.moveDown")}
        >
          <FiArrowDown size={15} aria-hidden />
        </button>
        <button
          type="button"
          className="iact"
          onClick={onEdit}
          aria-label={t("subprofiles:itemRow.edit")}
          title={t("subprofiles:itemRow.edit")}
        >
          <FiEdit2 size={15} aria-hidden />
        </button>
        <button
          type="button"
          className="iact"
          onClick={onRemove}
          aria-label={t("subprofiles:itemEditor.remove")}
          title={t("subprofiles:itemEditor.remove")}
        >
          <FiTrash2 size={15} aria-hidden />
        </button>
      </div>
    </m.div>
  );
}
