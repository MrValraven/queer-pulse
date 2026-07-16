import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { NextAction } from "./work.data";
import styles from "./WorkHubPage.module.css";

/** The cross-silo "what needs you" list — the hub's prioritised action queue. */
export function WorkNextActions({ actions }: { actions: NextAction[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.actionList}>
      {actions.map((a) => (
        <div
          key={a.id}
          className={[styles.row, a.urgent && styles.rowUrgent]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.rowIcon} aria-hidden>
            {a.icon}
          </span>
          <div className={styles.rowBody}>
            <div className={styles.rowLabel}>
              {t(a.labelKey, a.labelValues)}
              {a.urgencyKey && (
                <span
                  className={[styles.urgency, a.urgent && styles.urgencyUrgent]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {t(a.urgencyKey, a.urgencyValues)}
                </span>
              )}
            </div>
            <div className={styles.rowContext}>{t(a.contextKey)}</div>
          </div>
          <Button variant="ghost" to={a.to}>
            {t(a.ctaKey)}
          </Button>
        </div>
      ))}
    </div>
  );
}
