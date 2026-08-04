import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { Translation } from "../../../../shared/i18n/Translation";
import { AdminModal } from "../../ui";
import { useRoadmapModals } from "../state/useRoadmapModals";
import { ROADMAP_SHORTCUTS } from "./shortcuts.data";
import styles from "./roadmapModals.module.css";

/** Read-only reference for the keyboard shortcuts `useRoadmapShortcuts`
 *  wires across the roadmap admin tools — opened by the `?` key itself. */
export function ShortcutsModal() {
  const { t } = useTranslation();
  const { modal, close } = useRoadmapModals();

  if (modal !== "shortcuts") return null;

  return (
    <AdminModal
      eyebrow={t("admin:roadmap.modals.shortcuts.eyebrow")}
      title={
        <Translation
          i18nKey="admin:roadmap.modals.shortcuts.title"
          components={{ em: <em /> }}
        />
      }
      onClose={close}
      footer={
        <Button variant="primary" onClick={close}>
          {t("admin:roadmap.modals.shortcuts.gotItCta")}
        </Button>
      }
    >
      <ul className={styles.shortcutList}>
        {ROADMAP_SHORTCUTS.map((row) => (
          <li key={row.labelKey} className={styles.shortcutRow}>
            <span className={styles.shortcutLabel}>{t(row.labelKey)}</span>
            <span className={styles.shortcutKeys}>
              {row.keys.map((key) => (
                <kbd key={key} className={styles.kbd}>
                  {key}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </AdminModal>
  );
}
