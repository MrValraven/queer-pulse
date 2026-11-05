import { useId } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { durationLabel } from "../../shared/i18n/duration";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  ModerationQueueHealthEntryDTO,
  ModerationQueueSeverity,
} from "./api/moderationHealth.api";
import {
  breachLabelKey,
  queueHref,
  queueLabelKey,
} from "./moderationQueueHealth";
import { ModerationQueueSeverityChip } from "./ModerationQueueSeverityChip";
import { ModerationQueueHealthFigure } from "./ModerationQueueHealthFigure";
import { ModerationQueueHealthFacts } from "./ModerationQueueHealthFacts";
import styles from "./ModerationQueueHealth.module.css";

/** Card and breach-pill classes per severity. An ok card carries no accent
 *  bar and no pills, so its slots stay empty. */
const SEVERITY_CLASSES: Record<
  ModerationQueueSeverity,
  { row?: string; pill?: string }
> = {
  ok: {},
  warning: { row: styles.rowWarning, pill: styles.breachPillWarning },
  critical: { row: styles.rowCritical, pill: styles.breachPillCritical },
};

/**
 * One queue in the health panel: what is waiting, how long it has been waiting,
 * how many published promises are already broken, and how that reads against
 * the bands the server judged it by.
 *
 * One explicit "Open queue" link per card goes to the queue itself. Every
 * destination is moderator reachable, matching who this panel is for.
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
  const nameId = useId();
  const linkTextId = useId();
  const formatNumber = (value: number) => format.number(value);
  // These readings arrive as fractional hours, so a queue answered eight
  // minutes ago used to read "0.1 hours". The figure keeps its own unit; the
  // threshold notes underneath stay in hours, because the bands are set in
  // hours and the note names the band.
  const wait = (value: number) => durationLabel(value, format, "long");
  const severityClasses = SEVERITY_CLASSES[entry.severity];

  return (
    <div
      className={[styles.row, severityClasses.row].filter(Boolean).join(" ")}
    >
      <div className={styles.rowBody}>
        <div className={styles.rowHead}>
          <h2 className={styles.queueName} id={nameId}>
            {t(queueLabelKey(entry.queue))}
          </h2>
          <ModerationQueueSeverityChip severity={entry.severity} />
        </div>

        {entry.breaches.length > 0 && (
          <div className={styles.breaches}>
            <span className={styles.breachLabel}>
              {t("admin:moderationHealth.breachesLabel")}
            </span>
            <ul className={styles.breachList}>
              {entry.breaches.map((axis) => (
                <li
                  key={axis}
                  className={[styles.breachPill, severityClasses.pill]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {t(breachLabelKey(axis))}
                </li>
              ))}
            </ul>
          </div>
        )}

        <dl className={styles.figures}>
          <ModerationQueueHealthFigure
            label={t("admin:moderationHealth.stat.depth")}
            value={formatNumber(entry.depth)}
            measured={{
              reading: entry.depth,
              band: entry.thresholds.depth,
            }}
          />

          {/* A null oldest item means the queue is EMPTY. That is the best news
            this panel can carry, so it reads as news rather than as a gap. */}
          <ModerationQueueHealthFigure
            label={t("admin:moderationHealth.stat.oldest")}
            value={
              entry.oldestItemHours === null
                ? t("admin:moderationHealth.stat.oldestEmpty")
                : wait(entry.oldestItemHours)
            }
            measured={
              entry.oldestItemHours === null
                ? undefined
                : {
                    reading: entry.oldestItemHours,
                    band: entry.thresholds.oldestHours,
                  }
            }
          />

          <ModerationQueueHealthFigure
            label={t("admin:moderationHealth.stat.overdue")}
            value={formatNumber(entry.overdueCount)}
            measured={{
              reading: entry.overdueCount,
              band: entry.thresholds.overdue,
            }}
          />
        </dl>

        <ModerationQueueHealthFacts entry={entry} />

        {/* Every card carries the same visible label, so the link's name
            joins it to the queue name ("Open queue Reports") for a links
            list. Last in the DOM; the grid lifts it into the header on wide
            cards. */}
        <Link
          className={styles.openLink}
          to={queueHref(entry.queue)}
          aria-labelledby={`${linkTextId} ${nameId}`}
        >
          <span id={linkTextId}>
            {t("admin:moderationHealth.row.openQueue")}
          </span>
          <FiArrowRight className={styles.openLinkArrow} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
