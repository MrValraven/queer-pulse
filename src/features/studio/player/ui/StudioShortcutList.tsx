import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STUDIO_PLAYER_SHORTCUTS } from "../studioShortcuts.data";
import { shortcutKeyLabel, shortcutKeySpokenLabel } from "./studioShortcutKeys";
import styles from "./StudioShortcutList.module.css";

/** The player's real keyboard shortcuts as label and key chips: one list for
 *  the `?` sheet and `/studio/accessibility`, so they can never disagree. */
export function StudioShortcutList() {
  const { t } = useTranslation();
  return (
    <ul className={styles.list}>
      {STUDIO_PLAYER_SHORTCUTS.map((shortcut) => (
        <li key={shortcut.id} className={styles.row}>
          <span className={styles.label}>{t(shortcut.labelKey)}</span>
          <span className={styles.keys}>
            {shortcut.keys.map((key) => {
              const shownLabel = shortcutKeyLabel(key, t);
              const spokenLabel = shortcutKeySpokenLabel(key, t);
              return (
                <kbd key={key} className={styles.kbd}>
                  {spokenLabel === shownLabel ? (
                    shownLabel
                  ) : (
                    <>
                      <span aria-hidden="true">{shownLabel}</span>
                      <span className="visuallyHidden">{spokenLabel}</span>
                    </>
                  )}
                </kbd>
              );
            })}
          </span>
        </li>
      ))}
    </ul>
  );
}
