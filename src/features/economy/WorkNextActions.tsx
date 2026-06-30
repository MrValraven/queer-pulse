import { Button } from "../../shared/components/ui";
import type { NextAction } from "./work.data";
import styles from "./WorkHubPage.module.css";

/** The cross-silo "what needs you" list — the hub's prioritised action queue. */
export function WorkNextActions({ actions }: { actions: NextAction[] }) {
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
              {a.label}
              {a.urgency && (
                <span
                  className={[styles.urgency, a.urgent && styles.urgencyUrgent]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {a.urgency}
                </span>
              )}
            </div>
            <div className={styles.rowContext}>{a.context}</div>
          </div>
          <Button variant="ghost" to={a.to}>
            {a.cta}
          </Button>
        </div>
      ))}
    </div>
  );
}
