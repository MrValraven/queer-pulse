import { useFormat } from "../../shared/i18n/format";
import { durationLabel } from "../../shared/i18n/duration";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ModerationQueueHealthEntryDTO } from "./api/moderationHealth.api";
import { ModerationQueueStat } from "./ModerationQueueStat";
import styles from "./ModerationQueueHealth.module.css";

/**
 * The quieter readings under a queue's three figures: who has claimed the work,
 * how it divides across the rota, and the usual turnaround where one exists.
 * None of these decide the severity, so they sit below the figures that do.
 */
export function ModerationQueueHealthFacts({
  entry,
}: {
  entry: ModerationQueueHealthEntryDTO;
}) {
  const { t } = useTranslation();
  const format = useFormat();

  return (
    <dl className={styles.stats}>
      {/* A null unassigned count means the queue carries no assignment column
          at all. Rendering a zero here would read as "everything is claimed",
          which is the opposite of what the null says. */}
      <ModerationQueueStat
        label={t("admin:moderationHealth.stat.unassigned")}
        value={
          entry.unassignedCount === null
            ? t("admin:moderationHealth.stat.unassignedNotApplicable")
            : format.number(entry.unassignedCount)
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
            : format.number(entry.depthPerModerator)
        }
        isMuted={entry.depthPerModerator === null}
        note={
          entry.depthPerModerator === null
            ? t("admin:moderationHealth.stat.noModeratorsNote")
            : undefined
        }
      />

      {/* Only invite requests publish a median response today. The line
          appears only for a queue that publishes one, so every slot shown
          carries a reading. */}
      {entry.medianResponseHours !== null && (
        <ModerationQueueStat
          label={t("admin:moderationHealth.stat.median")}
          value={durationLabel(entry.medianResponseHours, format, "long")}
        />
      )}
    </dl>
  );
}
