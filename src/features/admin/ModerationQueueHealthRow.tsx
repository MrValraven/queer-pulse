import { Link } from "react-router-dom";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type {
  ModerationQueueHealthEntryDTO,
  ModerationQueueThresholdBandDTO,
} from "./api/moderationHealth.api";
import {
  breachLabelKey,
  queueHref,
  queueLabelKey,
} from "./moderationQueueHealth";
import { ModerationQueueSeverityChip } from "./ModerationQueueSeverityChip";
import { ModerationQueueStat } from "./ModerationQueueStat";
import styles from "./ModerationQueueHealth.module.css";

/**
 * The band this figure is measured against next, as a sentence.
 *
 * NEVER A HARD-CODED NUMBER. Every value comes off `entry.thresholds`, which
 * the server sends with the reading it produced, so the policy moves in one
 * backend edit and this line moves with it. Which band is "applicable" depends
 * on where the figure already sits: below the warning level the next thing that
 * happens is a warning, at or above it the next thing is critical, and past
 * critical there is nothing further to trip, so the line says so instead of
 * naming a level already behind it.
 */
function thresholdNote(
  value: number,
  band: ModerationQueueThresholdBandDTO,
  formatNumber: (value: number) => string,
  t: TFunction,
): string {
  if (value >= band.critical) {
    return t("admin:moderationHealth.threshold.pastCritical", {
      value: formatNumber(band.critical),
    });
  }
  if (value >= band.warning) {
    return t("admin:moderationHealth.threshold.criticalAt", {
      value: formatNumber(band.critical),
    });
  }
  return t("admin:moderationHealth.threshold.warnsAt", {
    value: formatNumber(band.warning),
  });
}

/**
 * One queue in the health panel: what is waiting, how long it has been waiting,
 * how many published promises are already broken, and how that reads against
 * the bands the server judged it by.
 *
 * The heading links to the queue itself. Every destination is moderator
 * reachable, matching who this panel is for.
 *
 * THIS DESCRIBES WORK, NEVER A PERSON. There is no throughput figure and no
 * per-moderator attribution anywhere on this row: `depthPerModerator` is the
 * backlog divided by how many people are on rota, which is a statement about
 * how much there is to do, and the copy says it that way.
 */
export function ModerationQueueHealthRow({
  entry,
}: {
  entry: ModerationQueueHealthEntryDTO;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const formatNumber = (value: number) => format.number(value);
  const hours = (value: number) =>
    t("admin:moderationHealth.hours", {
      count: value,
      value: formatNumber(value),
    });

  return (
    <div
      className={[
        styles.row,
        entry.severity === "warning" && styles.rowWarning,
        entry.severity === "critical" && styles.rowCritical,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.rowHead}>
        <Link className={styles.queueName} to={queueHref(entry.queue)}>
          {t(queueLabelKey(entry.queue))}
        </Link>
        <ModerationQueueSeverityChip severity={entry.severity} />
      </div>

      {entry.breaches.length > 0 && (
        <p className={styles.breaches}>
          <span className={styles.breachLabel}>
            {t("admin:moderationHealth.breachesLabel")}
          </span>{" "}
          {entry.breaches.map((axis) => t(breachLabelKey(axis))).join(" · ")}
        </p>
      )}

      <dl className={styles.stats}>
        <ModerationQueueStat
          label={t("admin:moderationHealth.stat.depth")}
          value={formatNumber(entry.depth)}
          note={thresholdNote(
            entry.depth,
            entry.thresholds.depth,
            formatNumber,
            t,
          )}
        />

        {/* A null oldest item means the queue is EMPTY. That is the best news
            this panel can carry, so it reads as news rather than as a gap. */}
        <ModerationQueueStat
          label={t("admin:moderationHealth.stat.oldest")}
          value={
            entry.oldestItemHours === null
              ? t("admin:moderationHealth.stat.oldestEmpty")
              : hours(entry.oldestItemHours)
          }
          isMuted={entry.oldestItemHours === null}
          note={
            entry.oldestItemHours === null
              ? undefined
              : thresholdNote(
                  entry.oldestItemHours,
                  entry.thresholds.oldestHours,
                  formatNumber,
                  t,
                )
          }
        />

        <ModerationQueueStat
          label={t("admin:moderationHealth.stat.overdue")}
          value={formatNumber(entry.overdueCount)}
          note={thresholdNote(
            entry.overdueCount,
            entry.thresholds.overdue,
            formatNumber,
            t,
          )}
        />

        {/* A null unassigned count means the queue carries no assignment column
            at all. Rendering a zero here would read as "everything is claimed",
            which is the opposite of what the null says. */}
        <ModerationQueueStat
          label={t("admin:moderationHealth.stat.unassigned")}
          value={
            entry.unassignedCount === null
              ? t("admin:moderationHealth.stat.unassignedNotApplicable")
              : formatNumber(entry.unassignedCount)
          }
          isMuted={entry.unassignedCount === null}
          note={
            entry.unassignedCount === null
              ? t("admin:moderationHealth.stat.unassignedNoClaiming")
              : undefined
          }
        />

        {/* A null per-moderator load means there are zero active moderators.
            That is an alarming fact in its own right, so it is stated. */}
        <ModerationQueueStat
          label={t("admin:moderationHealth.stat.perModerator")}
          value={
            entry.depthPerModerator === null
              ? t("admin:moderationHealth.stat.noModerators")
              : formatNumber(entry.depthPerModerator)
          }
          isMuted={entry.depthPerModerator === null}
          note={
            entry.depthPerModerator === null
              ? t("admin:moderationHealth.stat.noModeratorsNote")
              : undefined
          }
        />

        {/* Only invite requests publish a median response today. A queue that
            publishes none omits the line rather than showing an empty slot. */}
        {entry.medianResponseHours !== null && (
          <ModerationQueueStat
            label={t("admin:moderationHealth.stat.median")}
            value={hours(entry.medianResponseHours)}
          />
        )}
      </dl>
    </div>
  );
}
