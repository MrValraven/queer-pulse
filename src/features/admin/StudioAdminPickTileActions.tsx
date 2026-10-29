import type { Ref } from "react";
import { FiArrowLeft, FiArrowRight, FiEdit3, FiX } from "react-icons/fi";
import { IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import css from "./StudioAdminShelves.module.css";

/** A sleeve's four icon actions: Move earlier, Move later, Edit note (Add a
 *  note while there is none) and Remove pick. Each names its pick for a screen reader and shows its short
 *  verb as a tooltip on hover and keyboard focus. */
export function StudioAdminPickTileActions({
  title,
  shelfLabel,
  isBusy,
  isFirst,
  isLast,
  hasNote,
  moveUpRef,
  moveDownRef,
  onMoveUp,
  onMoveDown,
  onEditNote,
  onRemove,
}: {
  title: string;
  shelfLabel: string;
  isBusy: boolean;
  isFirst: boolean;
  isLast: boolean;
  /** Without a note the pencil reads Add a note, like the link beside it. */
  hasNote: boolean;
  moveUpRef: Ref<HTMLButtonElement>;
  moveDownRef: Ref<HTMLButtonElement>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEditNote: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={css.tileActions}>
      <IconButton
        ref={moveUpRef}
        size="sm"
        className={css.tileAction}
        aria-label={t("admin:studioAdmin.moveEarlierAria", { name: title })}
        tooltip={t("admin:studioAdmin.moveEarlierCta")}
        aria-disabled={isBusy || isFirst || undefined}
        onClick={onMoveUp}
      >
        <FiArrowLeft aria-hidden />
      </IconButton>
      <IconButton
        ref={moveDownRef}
        size="sm"
        className={css.tileAction}
        aria-label={t("admin:studioAdmin.moveLaterAria", { name: title })}
        tooltip={t("admin:studioAdmin.moveLaterCta")}
        aria-disabled={isBusy || isLast || undefined}
        onClick={onMoveDown}
      >
        <FiArrowRight aria-hidden />
      </IconButton>
      <IconButton
        size="sm"
        className={css.tileAction}
        aria-label={
          hasNote
            ? t("admin:studioAdmin.pick.editNoteAria", { title })
            : t("admin:studioAdmin.pick.addNoteAria", { title })
        }
        tooltip={
          hasNote
            ? t("admin:studioAdmin.pick.editNoteCta")
            : t("admin:studioAdmin.pick.addNoteCta")
        }
        onClick={onEditNote}
      >
        <FiEdit3 aria-hidden />
      </IconButton>
      <IconButton
        size="sm"
        className={`${css.tileAction} ${css.tileRemove}`}
        aria-label={t("admin:studioAdmin.pick.removeAria", {
          title,
          shelf: shelfLabel,
        })}
        tooltip={t("admin:studioAdmin.pick.removeCta")}
        aria-disabled={isBusy || undefined}
        data-pick-remove
        onClick={onRemove}
      >
        <FiX aria-hidden />
      </IconButton>
    </div>
  );
}
