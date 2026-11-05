import { FiAlertTriangle, FiClock, FiRefreshCw } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  ModerationQueueHealthDTO,
  ModerationQueueSeverity,
} from "./api/moderationHealth.api";
import { severityPresentation } from "./moderationQueueHealth";
import {
  SEVERITY_ORDER,
  overdueEmphasis,
  overviewHeadline,
  overviewSeverity,
  queueCountBySeverity,
  queueHealthTotals,
  queuesWorstFirst,
  type OverdueEmphasis,
} from "./moderationQueueHealthSummary";
import styles from "./ModerationQueueHealthOverview.module.css";

/** Severity to class. The tone always travels with the word and the glyph. */
const CARD_WASH: Record<ModerationQueueSeverity, string | undefined> = {
  ok: styles.washOk,
  warning: styles.washWarning,
  critical: styles.washCritical,
};

const SEVERITY_TONE: Record<ModerationQueueSeverity, string | undefined> = {
  ok: styles.toneOk,
  warning: styles.toneWarning,
  critical: styles.toneCritical,
};

const OVERDUE_FIGURE: Record<OverdueEmphasis, string | undefined> = {
  calm: styles.figureCalm,
  loud: styles.figureLoud,
  plain: undefined,
};

/** A background refresh that failed while an older reading is still shown.
 *  `reason` is the server's own words when it sent some. */
export interface QueueHealthRefreshFailure {
  reason: string | null;
}

interface ModerationQueueHealthOverviewProps {
  health: ModerationQueueHealthDTO;
  measuredAt: string | null;
  isFetching: boolean;
  onRefresh: () => void;
  refreshFailure: QueueHealthRefreshFailure | null;
}

/**
 * The top of the queue-health tab (TS-04): one card answering "how is the work
 * doing right now", before the per-queue rows answer "where".
 *
 * Only the headline block is a live region. The tiles and the refresh button
 * sit outside it, so a refetch announces the level once and nothing else.
 */
export function ModerationQueueHealthOverview({
  health,
  measuredAt,
  isFetching,
  onRefresh,
  refreshFailure,
}: ModerationQueueHealthOverviewProps) {
  const { t } = useTranslation();
  const severity = overviewSeverity(health);
  const { Glyph } = severityPresentation(severity);
  const headline = overviewHeadline(health);

  return (
    <section className={`${styles.card} ${CARD_WASH[severity] ?? ""}`}>
      <div className={styles.cardBody}>
        <div
          className={styles.headlineRow}
          role="status"
          aria-label={t("admin:moderationHealth.summaryAriaLabel")}
        >
          <span
            className={`${styles.badge} ${SEVERITY_TONE[severity] ?? ""}`}
            aria-hidden
          >
            <Glyph />
          </span>
          <div className={styles.headlineText}>
            <h2 className={styles.headline}>
              {t(headline.key, headline.options)}
            </h2>
            <p className={styles.explainer}>
              {t("admin:moderationHealth.overallExplainer")}
            </p>
          </div>
        </div>

        <OverviewStrip health={health} />
        <OverviewTotals health={health} />
        <OverviewFooter
          measuredAt={measuredAt}
          isFetching={isFetching}
          onRefresh={onRefresh}
          refreshFailure={refreshFailure}
        />
      </div>
    </section>
  );
}

/**
 * When it was measured, and a way to measure again. A failed refresh keeps the
 * older reading on screen and says so here, with the time those figures are
 * from. The button stays focusable while a reading is in flight: aria-disabled
 * and the guard below hold it, so keyboard focus never drops to the page.
 */
function OverviewFooter({
  measuredAt,
  isFetching,
  onRefresh,
  refreshFailure,
}: Omit<ModerationQueueHealthOverviewProps, "health">) {
  const { t } = useTranslation();
  const refresh = () => {
    if (isFetching) return;
    onRefresh();
  };

  return (
    <div className={styles.footer}>
      {refreshFailure ? (
        <p className={styles.refreshFailed} role="status">
          <FiAlertTriangle aria-hidden className={styles.refreshFailedGlyph} />
          <span>
            {measuredAt
              ? t("admin:moderationHealth.overview.refreshFailed", {
                  time: measuredAt,
                })
              : t("admin:moderationHealth.overview.refreshFailedUndated")}
            {refreshFailure.reason && " "}
            {refreshFailure.reason && (
              <span className={styles.refreshFailedReason}>
                {t("admin:moderationHealth.overview.refreshFailedReason", {
                  reason: refreshFailure.reason,
                })}
              </span>
            )}
          </span>
        </p>
      ) : (
        measuredAt && (
          <span className={styles.measuredAt}>
            <FiClock aria-hidden />
            {t("admin:moderationHealth.measuredAt", { time: measuredAt })}
          </span>
        )
      )}
      <Button
        variant="quiet"
        size="sm"
        className={`${styles.refreshButton} ${styles.busyButton}`}
        aria-disabled={isFetching}
        aria-busy={isFetching}
        onClick={refresh}
      >
        <FiRefreshCw
          aria-hidden
          className={isFetching ? styles.refreshIconSpinning : undefined}
        />
        {t("admin:moderationHealth.refresh")}
      </Button>
    </div>
  );
}

/**
 * One segment per queue, worst level first so the bar reads in the same order
 * as the legend; queues at one level keep the server's order. The bar is
 * decoration; the legend under it is what a screen reader gets, and it
 * carries the word and the glyph for every level present.
 */
function OverviewStrip({ health }: { health: ModerationQueueHealthDTO }) {
  const { t } = useTranslation();
  const counts = queueCountBySeverity(health.queues);
  const presentLevels = SEVERITY_ORDER.filter((level) => counts[level] > 0);
  if (health.queues.length === 0) return null;

  return (
    <div className={styles.stripBlock}>
      <div className={styles.strip} aria-hidden>
        {queuesWorstFirst(health.queues).map((entry) => (
          <span
            key={entry.queue}
            className={`${styles.segment} ${SEVERITY_TONE[entry.severity] ?? ""}`}
          />
        ))}
      </div>
      <ul
        className={styles.legend}
        aria-label={t("admin:moderationHealth.overview.legendAriaLabel")}
      >
        {presentLevels.map((level) => {
          const { Glyph } = severityPresentation(level);
          return (
            <li
              key={level}
              className={`${styles.legendItem} ${SEVERITY_TONE[level] ?? ""}`}
            >
              <Glyph aria-hidden className={styles.legendGlyph} />
              {t(`admin:moderationHealth.overview.legend.${level}`, {
                count: counts[level],
              })}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * The four totals. Every figure is a property of the queues; the rota tile
 * states how many people can work them and divides nothing by it.
 */
function OverviewTotals({ health }: { health: ModerationQueueHealthDTO }) {
  const { t } = useTranslation();
  const format = useFormat();
  const totals = queueHealthTotals(health.queues);
  const rota = health.activeModeratorCount;
  const overdue = overdueEmphasis(totals.overdue, health.overallSeverity);

  return (
    <dl className={styles.totals}>
      <TotalTile
        label={t("admin:moderationHealth.stat.depth")}
        figure={totals.waiting}
        formatted={format.number(totals.waiting)}
        note={t("admin:moderationHealth.overview.total.waitingNote", {
          count: totals.queueCount,
        })}
      />
      <TotalTile
        label={t("admin:moderationHealth.stat.overdue")}
        figure={totals.overdue}
        formatted={format.number(totals.overdue)}
        figureClassName={OVERDUE_FIGURE[overdue]}
        note={t("admin:moderationHealth.overview.total.overdueNote")}
      />
      {totals.unclaimed === null ? (
        <div className={styles.tile}>
          <dt className={styles.tileLabel}>
            {t("admin:moderationHealth.stat.unassigned")}
          </dt>
          <dd className={`${styles.tileFigure} ${styles.tileFigureMuted}`}>
            {t("admin:moderationHealth.overview.total.unclaimedNotApplicable")}
          </dd>
          <dd className={styles.tileNote}>
            {t("admin:moderationHealth.overview.total.unclaimedNoClaimingNote")}
          </dd>
        </div>
      ) : (
        <TotalTile
          label={t("admin:moderationHealth.stat.unassigned")}
          figure={totals.unclaimed}
          formatted={format.number(totals.unclaimed)}
          note={t("admin:moderationHealth.overview.total.unclaimedNote")}
        />
      )}
      <TotalTile
        label={t("admin:moderationHealth.overview.total.rota")}
        figure={rota}
        formatted={format.number(rota)}
        figureClassName={rota === 0 ? styles.figureLoud : undefined}
        note={t("admin:moderationHealth.overview.total.rotaNote", {
          count: rota,
        })}
      />
    </dl>
  );
}

interface TotalTileProps {
  label: string;
  figure: number;
  formatted: string;
  note: string;
  figureClassName?: string;
}

function TotalTile({
  label,
  figure,
  formatted,
  note,
  figureClassName,
}: TotalTileProps) {
  return (
    <div className={styles.tile}>
      <dt className={styles.tileLabel}>{label}</dt>
      <dd className={`${styles.tileFigure} ${figureClassName ?? ""}`}>
        <RollingNumber value={formatted} numericValue={figure} />
      </dd>
      <dd className={styles.tileNote}>{note}</dd>
    </div>
  );
}
