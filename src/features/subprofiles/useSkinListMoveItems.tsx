import {
  FiArrowDown,
  FiArrowUp,
  FiChevronsDown,
  FiChevronsUp,
} from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinListMoveMenuItem } from "./SkinListMoveMenu";

/**
 * The four choices of a list grip's move menu (`SkinListMoveMenu`) for the
 * row at `rowIndex` (0-based): Move up, Move down, Move to top and Move to
 * bottom, each inert where the row already sits at that end.
 */
export function useSkinListMoveItems({
  rowIndex,
  rowCount,
  onMove,
}: {
  rowIndex: number;
  rowCount: number;
  /** Moves the row to `toIndex` (0-based). */
  onMove: (toIndex: number) => void;
}): SkinListMoveMenuItem[] {
  const { t } = useTranslation();
  const isFirst = rowIndex <= 0;
  const isLast = rowIndex >= rowCount - 1;

  const moveItem = (
    key: string,
    label: string,
    icon: SkinListMoveMenuItem["icon"],
    toIndex: number,
    isDisabled: boolean,
  ): SkinListMoveMenuItem => ({
    key,
    label,
    icon,
    isDisabled,
    onSelect: () => onMove(toIndex),
  });

  return [
    moveItem(
      "up",
      t("subprofiles:skinList.moveMenu.up"),
      <FiArrowUp aria-hidden />,
      rowIndex - 1,
      isFirst,
    ),
    moveItem(
      "down",
      t("subprofiles:skinList.moveMenu.down"),
      <FiArrowDown aria-hidden />,
      rowIndex + 1,
      isLast,
    ),
    moveItem(
      "top",
      t("subprofiles:skinList.moveMenu.top"),
      <FiChevronsUp aria-hidden />,
      0,
      isFirst,
    ),
    moveItem(
      "bottom",
      t("subprofiles:skinList.moveMenu.bottom"),
      <FiChevronsDown aria-hidden />,
      rowCount - 1,
      isLast,
    ),
  ];
}
