import type { Ref } from "react";
import { FiArrowDown, FiArrowUp, FiX } from "react-icons/fi";
import { IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import css from "./PersonaWallPicks.module.css";

/** A pick row's three icon actions: Move up, Move down and Remove from
 *  wall. Each names its persona for a screen reader and shows its short
 *  verb as a tooltip on hover and keyboard focus. */
export function PersonaWallPickRowActions({
  name,
  isBusy,
  isFirst,
  isLast,
  moveUpRef,
  moveDownRef,
  onMoveUp,
  onMoveDown,
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
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={css.actions}>
      <IconButton
        ref={moveUpRef}
        size="sm"
        aria-label={t("admin:personaWall.row.moveUpAria", { name })}
        tooltip={t("admin:personaWall.row.moveUpCta")}
        aria-disabled={isBusy || isFirst || undefined}
        onClick={onMoveUp}
      >
        <FiArrowUp aria-hidden />
      </IconButton>
      <IconButton
        ref={moveDownRef}
        size="sm"
        aria-label={t("admin:personaWall.row.moveDownAria", { name })}
        tooltip={t("admin:personaWall.row.moveDownCta")}
        aria-disabled={isBusy || isLast || undefined}
        onClick={onMoveDown}
      >
        <FiArrowDown aria-hidden />
      </IconButton>
      <IconButton
        size="sm"
        className={css.remove}
        aria-label={t("admin:personaWall.row.removeAria", { name })}
        tooltip={t("admin:personaWall.row.removeCta")}
        aria-disabled={isBusy || undefined}
        data-pick-remove
        onClick={onRemove}
      >
        <FiX aria-hidden />
      </IconButton>
    </div>
  );
}
