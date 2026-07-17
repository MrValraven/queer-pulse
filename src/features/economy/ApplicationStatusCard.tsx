import { FiClock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  BADGE_CLASS,
  STAGE_CLASS,
  LOGO_CLASS,
  type Application,
  type ActionKind,
} from "./applicationStatus.data";
import styles from "./ApplicationStatusPage.module.css";

/** A single application row: logo, details, stage tracker, badge, and actions. */
export function AppCard({
  app: a,
  muted,
  onAction,
}: {
  app: Application;
  muted?: boolean;
  onAction: (kind: ActionKind) => void;
}) {
  const { t } = useTranslation();
  const activeIdx = a.stages.findIndex((s) => s.state === "active");
  const activeStage = activeIdx >= 0 ? a.stages[activeIdx] : undefined;
  return (
    <div
      className={[
        styles.app,
        muted && styles.appMuted,
        a.accent === "offer" && styles.appOffer,
        a.accent === "overdue" && styles.appOverdue,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          styles.appLogo,
          LOGO_CLASS[a.logoTint] && styles[LOGO_CLASS[a.logoTint]],
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {a.logo}
      </div>
      <div className={styles.appMid}>
        <h3>{a.title}</h3>
        <div className={styles.appCo}>{a.company}</div>
        <div className={styles.appMeta}>
          {a.meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
          {a.deadline && (
            <span
              className={[
                styles.appDeadline,
                a.deadline.urgent && styles.appDeadlineUrgent,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <FiClock size={12} aria-hidden /> {a.deadline.text}
            </span>
          )}
        </div>
        {activeIdx >= 0 && (
          <div className={styles.stageStep}>
            {t("economy:applicationStatus.card.stepOf", {
              step: activeIdx + 1,
              total: a.stages.length,
            })}
            <span className={styles.stageStepLabel}>
              {" "}
              · {activeStage?.label}
            </span>
          </div>
        )}
        {a.stages.length > 0 && (
          <div className={styles.stages}>
            {a.stages.map((s, si) => (
              <div
                key={si}
                className={[
                  styles.stage,
                  STAGE_CLASS[s.state] && styles[STAGE_CLASS[s.state]],
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className={styles.stageBar} />
                <div className={styles.stageL}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
        {activeStage?.hint && (
          <p className={styles.stageHint}>
            <span className={styles.stageHintK}>
              {t("economy:applicationStatus.card.whatThisMeans")}
            </span>
            {activeStage.hint}
          </p>
        )}
        <p className={styles.appStatus}>{a.status}</p>
      </div>
      <div className={styles.appRight}>
        <span
          className={`${styles.appBadge} ${styles[BADGE_CLASS[a.badge.kind]]}`}
        >
          {a.badge.pulse && <span className={styles.pulse} />}
          {a.badge.label}
        </span>
        {a.actions.map((act) =>
          act.muted ? (
            <button
              key={act.label}
              type="button"
              className={`${styles.appAction} ${styles.appActionMuted}`}
              onClick={() => onAction(act.kind)}
            >
              {act.label}
            </button>
          ) : (
            <Button
              key={act.label}
              size="md"
              variant={act.solid ? "primary" : "ghost"}
              onClick={() => onAction(act.kind)}
            >
              {act.label}
            </Button>
          ),
        )}
      </div>
    </div>
  );
}
