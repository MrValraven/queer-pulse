import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiMoreVertical,
  FiStar,
  FiTrash2,
} from "react-icons/fi";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import styles from "./EditorItemRow.module.css";

interface GripDragHandlers {
  onPointerDown: (event: ReactPointerEvent) => void;
  onPointerMove: (event: ReactPointerEvent) => void;
  onPointerUp: (event: ReactPointerEvent) => void;
  onPointerCancel: (event: ReactPointerEvent) => void;
}

interface EditorItemRowProps {
  item: SubprofileItemView;
  /** Stable per-row id used as the FLIP key for reorder animation. */
  flipKey: string;
  /** Whether this section supports a spotlight item at all (false for `links`). */
  canFeature: boolean;
  isFirst: boolean;
  isLast: boolean;
  /** Pointer handlers that turn the grip into a real drag handle. */
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
 * One collapsed row in a section's `.itemrow` list (Task 5) — a decorative
 * grip, the item's title + a compact subtitle line, and `.iact` action
 * buttons: feature-star toggle, move up/down, edit (opens the item drawer),
 * remove. Distinct from the PUBLIC `SubprofileItemRow` (which renders a
 * published item on the live persona page). Presentational only — all state
 * lives in `SubprofileSectionEditor`. Two reorder paths: pointer drag via the
 * grip handle (`gripHandlers`, mouse/touch/pen — see `useRowDragReorder`) and
 * the up/down buttons (the keyboard/assistive-tech path, so the grip can stay
 * `aria-hidden`).
 */
export function EditorItemRow({
  item,
  flipKey,
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
  const { t } = useTranslation();
  const subtitle = [item.subtitle, item.meta, item.date]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={isDragging ? `itemrow ${styles.dragging}` : "itemrow"}
      data-flip-key={flipKey}
    >
      <span
        className="grip"
        aria-hidden
        title={t("subprofiles:itemEditor.dragToReorder")}
        {...gripHandlers}
      >
        <FiMoreVertical size={16} />
      </span>
      <div className={styles.content}>
        <b>{item.title}</b>
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
    </div>
  );
}
