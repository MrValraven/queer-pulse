import { FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";
import { IconButton } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./ListingMenu.module.css";

/** The move up, move down and remove buttons at the end of a menu item row. */
export function ListingMenuItemControls({
  itemName,
  position,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  /** The item's name, or its "item N" fallback, for the accessible names. */
  itemName: string;
  /** 1-based position among its siblings. */
  position: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.controls}>
      <IconButton
        size="sm"
        aria-label={t("marketing:listBusiness.menu.moveItemUp", {
          name: itemName,
        })}
        disabled={position === 1}
        onClick={onMoveUp}
      >
        <FiArrowUp aria-hidden />
      </IconButton>
      <IconButton
        size="sm"
        aria-label={t("marketing:listBusiness.menu.moveItemDown", {
          name: itemName,
        })}
        disabled={position === total}
        onClick={onMoveDown}
      >
        <FiArrowDown aria-hidden />
      </IconButton>
      <IconButton
        size="sm"
        aria-label={t("marketing:listBusiness.menu.removeItem", {
          name: itemName,
        })}
        onClick={onRemove}
      >
        <FiTrash2 aria-hidden />
      </IconButton>
    </div>
  );
}
