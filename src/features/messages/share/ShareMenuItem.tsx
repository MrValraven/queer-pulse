import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ShareMenuOption } from "./shareMenu.types";
import styles from "./ShareMenu.module.css";

/**
 * One `ShareMenu` item: a link for an item with an `href`, which opens a new
 * tab and says so to a screen reader, and a button for the rest. `onPicked`
 * runs first either way, so the menu hands focus back to its trigger.
 */
export function ShareMenuItem({
  item,
  onPicked,
}: {
  item: ShareMenuOption;
  onPicked: () => void;
}) {
  const { t } = useTranslation();
  const icon = (
    <span className={styles.itemIcon} aria-hidden>
      {item.icon}
    </span>
  );
  if (item.href) {
    return (
      <a
        role="menuitem"
        tabIndex={-1}
        className={styles.item}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onPicked}
      >
        {icon}
        {item.label}
        <span className="visuallyHidden">
          {" "}
          {t("messages:shareMenu.opensInNewTab")}
        </span>
      </a>
    );
  }
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      className={styles.item}
      onClick={() => {
        onPicked();
        item.onSelect?.();
      }}
    >
      {icon}
      {item.label}
    </button>
  );
}
