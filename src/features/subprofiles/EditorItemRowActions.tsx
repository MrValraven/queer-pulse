import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiStar,
  FiTrash2,
} from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";

interface EditorItemRowActionsProps {
  /** Whether this section supports a spotlight item at all (false for `links`). */
  canFeature: boolean;
  isFeatured: boolean;
  isFirst: boolean;
  isLast: boolean;
  /** Marks the Edit button as a field jump's landing spot, for a list with
   *  no Add button (see `SubprofileSectionEditor`). */
  isJumpTarget: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleFeature: () => void;
  onRemove: () => void;
}

/**
 * The `.itemacts` cluster of an `EditorItemRow`: feature toggle, move
 * up/down, edit, remove. Extracted so the row component stays under the
 * 200-line cap; presentational only, all state lives in the row's caller.
 */
export function EditorItemRowActions({
  canFeature,
  isFeatured,
  isFirst,
  isLast,
  isJumpTarget,
  onEdit,
  onMoveUp,
  onMoveDown,
  onToggleFeature,
  onRemove,
}: EditorItemRowActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="itemacts">
      {canFeature && (
        <button
          type="button"
          className="iact"
          onClick={onToggleFeature}
          aria-pressed={isFeatured}
          aria-label={t(
            isFeatured
              ? "subprofiles:itemEditor.unfeature"
              : "subprofiles:itemEditor.feature",
          )}
          title={t(
            isFeatured
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
        data-jump-target={isJumpTarget || undefined}
        data-edit-button
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
  );
}
