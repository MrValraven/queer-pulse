import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SkeletonLine } from "../../shared/components/ui";
import { useModerationQueueHealth } from "./api/useModerationQueueHealth";
import { ModerationQueueHealthRow } from "./ModerationQueueHealthRow";
import { ModerationQueueSeverityChip } from "./ModerationQueueSeverityChip";
import styles from "./ModerationQueueHealth.module.css";

/**
 * Moderator workload and SLA health across every queue (TS-04).
 *
 * WHAT THIS IS FOR. A volunteer rota cannot see its own backlog building until
 * somebody is already drowning in it, and burnout on a platform this size is a
 * predictable failure rather than bad luck. This panel makes the state of the
 * work visible early enough to redistribute it.
 *
 * WHAT IT IS NOT. It measures QUEUES, never people. There is no throughput
 * figure, no per-moderator attribution and no ranking anywhere in it, and none
 * may be added: a surface built to prevent burnout that reads as a performance
 * board would cause the thing it exists to stop.
 *
 * Staff only. There is no member-facing counterpart to any of this and there
 * must never be one.
 */
export function ModerationQueueHealthPanel() {
  const { t } = useTranslation();
  const format = useFormat();
  const { data, isLoading, isError } = useModerationQueueHealth();

  if (isLoading) {
    return (
      <div className={styles.rows}>
        {[0, 1, 2].map((placeholder) => (
          <div className={styles.row} key={placeholder}>
            <SkeletonLine width="40%" height={18} />
            <SkeletonLine width="90%" height={48} />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className={styles.intro} role="status">
        {t("admin:moderationHealth.loadError")}
      </p>
    );
  }

  const generatedAt = new Date(data.generatedAt);
  const measuredAt = Number.isNaN(generatedAt.getTime())
    ? null
    : format.time(generatedAt);

  return (
    <div className={styles.panel}>
      <p className={styles.intro}>{t("admin:moderationHealth.intro")}</p>

      {/* One live region for the whole reading. A screen reader hears the
          overall level and the rota size together, which is the pair the panel
          is actually answering. */}
      <div
        className={styles.summary}
        role="status"
        aria-label={t("admin:moderationHealth.summaryAriaLabel")}
      >
        <ModerationQueueSeverityChip severity={data.overallSeverity} />
        <span className={styles.summaryFact}>
          {t("admin:moderationHealth.overallExplainer")}
        </span>
        <span className={styles.summaryFact}>
          {t("admin:moderationHealth.activeModerators", {
            count: data.activeModeratorCount,
          })}
        </span>
        {measuredAt && (
          <span className={styles.summaryFact}>
            {t("admin:moderationHealth.measuredAt", { time: measuredAt })}
          </span>
        )}
      </div>

      <div className={styles.rows}>
        {data.queues.map((entry) => (
          <ModerationQueueHealthRow key={entry.queue} entry={entry} />
        ))}
      </div>
    </div>
  );
}
