import type { Ref } from "react";
import { FiArrowDown, FiArrowUp, FiEdit3, FiX } from "react-icons/fi";
import { IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import css from "./AdminDirectoryPartners.module.css";

/** A partner row's four icon actions: Move up, Move down, Edit note and
 *  Remove from partners. Each names its partner for a screen reader and
 *  shows its short verb as a tooltip on hover and keyboard focus. A row
 *  without a note also has an "Add a note" link in its body. */
export function AdminDirectoryPartnerRowActions({
  name,
  isBusy,
  isFirst,
  isLast,
  moveUpRef,
  moveDownRef,
  onMoveUp,
  onMoveDown,
  onEditNote,
  onRemove,
}: {
  name: string;
  isBusy: boolean;
  isFirst: boolean;
  isLast: boolean;
  moveUpRef: Ref<HTMLButtonElement>;
  moveDownRef: Ref<HTMLButtonElement>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEditNote: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={css.actions}>
      <IconButton
        ref={moveUpRef}
        size="sm"
        aria-label={t("admin:directoryPartners.row.moveUpAria", { name })}
        tooltip={t("admin:directoryPartners.row.moveUpCta")}
        aria-disabled={isBusy || isFirst || undefined}
        onClick={onMoveUp}
      >
        <FiArrowUp aria-hidden />
      </IconButton>
      <IconButton
        ref={moveDownRef}
        size="sm"
        aria-label={t("admin:directoryPartners.row.moveDownAria", { name })}
        tooltip={t("admin:directoryPartners.row.moveDownCta")}
        aria-disabled={isBusy || isLast || undefined}
        onClick={onMoveDown}
      >
        <FiArrowDown aria-hidden />
      </IconButton>
      <IconButton
        size="sm"
        aria-label={t("admin:directoryPartners.row.editNoteAria", { name })}
        tooltip={t("admin:directoryPartners.row.editNoteCta")}
        onClick={onEditNote}
      >
        <FiEdit3 aria-hidden />
      </IconButton>
      <IconButton
        size="sm"
        className={css.remove}
        aria-label={t("admin:directoryPartners.row.removeAria", { name })}
        tooltip={t("admin:directoryPartners.row.removeCta")}
        aria-disabled={isBusy || undefined}
        data-partner-remove
        onClick={onRemove}
      >
        <FiX aria-hidden />
      </IconButton>
    </div>
  );
}
