import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiMoreVertical,
  FiStar,
  FiTrash2,
} from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import styles from "./EditorItemRow.module.css";

interface EditorItemRowProps {
  item: SubprofileItemView;
  /** Whether this section supports a spotlight item at all (false for `links`). */
  canFeature: boolean;
  isFirst: boolean;
  isLast: boolean;
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
 * lives in `SubprofileSectionEditor`. Keyboard-only reorder: the up/down
 * buttons are the accessible path (native drag is optional, not built here).
 */
export function EditorItemRow({
  item,
  canFeature,
  isFirst,
  isLast,
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
    <div className="itemrow">
      <span className="grip" aria-hidden>
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
