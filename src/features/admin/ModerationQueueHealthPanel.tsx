import { FiAlertTriangle } from "react-icons/fi";
import { reasonFor } from "../../shared/api/errorMessage";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useModerationQueueHealth } from "./api/useModerationQueueHealth";
import { ModerationQueueHealthOverview } from "./ModerationQueueHealthOverview";
import { ModerationQueueHealthRow } from "./ModerationQueueHealthRow";
import styles from "./ModerationQueueHealthOverview.module.css";

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
  const { data, error, isLoading, isError, isFetching, refetch } =
    useModerationQueueHealth();
  const refresh = () => {
    void refetch();
  };
  const failureReason = isError ? reasonFor(error) : null;

  const intro = (
    <p className={styles.intro}>{t("admin:moderationHealth.intro")}</p>
  );

  if (isLoading) {
    return (
      <div className={styles.panel}>
        {intro}
        <QueueHealthSkeleton />
      </div>
    );
  }

  // React Query keeps the last good reading when a background refetch fails,
  // so the error card is only for a panel with nothing to show yet.
  if (!data) {
    return (
      <div className={styles.panel}>
        {intro}
        <QueueHealthLoadError
          reason={failureReason}
          isRetrying={isFetching}
          onRetry={refresh}
        />
      </div>
    );
  }

  const generatedAt = new Date(data.generatedAt);
  const measuredAt = Number.isNaN(generatedAt.getTime())
    ? null
    : format.time(generatedAt);

  return (
    <div className={styles.panel}>
      {intro}
      <ModerationQueueHealthOverview
        health={data}
        measuredAt={measuredAt}
        isFetching={isFetching}
        onRefresh={refresh}
        refreshFailure={isError ? { reason: failureReason } : null}
      />
      <div className={styles.rows}>
        {data.queues.map((entry) => (
          <ModerationQueueHealthRow key={entry.queue} entry={entry} />
        ))}
      </div>
    </div>
  );
}

const SKELETON_TILES = [0, 1, 2, 3];
const SKELETON_ROWS = [0, 1, 2, 3, 4];
const SKELETON_FIGURES = [0, 1, 2];

/** The loaded layout's shapes, so nothing jumps when the reading lands: the
 *  overview card (headline, strip and legend, four tiles, footer) and five
 *  queue cards. */
function QueueHealthSkeleton() {
  return (
    <>
      <div className={styles.card} aria-hidden>
        <div className={styles.cardBody}>
          <div className={styles.skeletonHeadline}>
            <span className={styles.skeletonBadge} />
            <div className={styles.skeletonHeadlineText}>
              <SkeletonLine width="55%" height={30} />
              <SkeletonLine width="80%" height={16} />
            </div>
          </div>
          <div className={styles.stripBlock}>
            <SkeletonLine width="100%" height={8} />
            <SkeletonLine width="40%" height={16} />
          </div>
          <div className={styles.totals}>
            {SKELETON_TILES.map((placeholder) => (
              <div className={styles.tile} key={placeholder}>
                <SkeletonLine width="50%" height={14} />
                <SkeletonLine width="40%" height={38} />
                <SkeletonLine width="75%" height={14} />
              </div>
            ))}
          </div>
          <div className={styles.skeletonFooter}>
            <SkeletonLine width="30%" height={14} />
            <SkeletonLine width={96} height={32} />
          </div>
        </div>
      </div>
      <div className={styles.rows} aria-hidden>
        {SKELETON_ROWS.map((placeholder) => (
          <QueueRowSkeleton key={placeholder} />
        ))}
      </div>
    </>
  );
}

/** One queue card's shape: the header (name and chip, the link on the right),
 *  the three figures with their meters, and the facts under a hairline. */
function QueueRowSkeleton() {
  return (
    <div className={styles.skeletonRow}>
      <div className={styles.skeletonRowBody}>
        <div className={styles.skeletonRowHead}>
          <div className={styles.skeletonRowTitle}>
            <SkeletonLine width={160} height={24} />
            <span className={styles.skeletonPill} />
          </div>
          <SkeletonLine width={88} height={18} />
        </div>
        <div className={styles.skeletonFigures}>
          {SKELETON_FIGURES.map((placeholder) => (
            <div className={styles.skeletonFigure} key={placeholder}>
              <SkeletonLine width="45%" height={14} />
              <SkeletonLine width="50%" height={32} />
              <span className={styles.skeletonMeter} />
              <SkeletonLine width="65%" height={14} />
            </div>
          ))}
        </div>
        <div className={styles.skeletonFacts}>
          {SKELETON_FIGURES.map((placeholder) => (
            <div className={styles.skeletonFact} key={placeholder}>
              <SkeletonLine width={84} height={14} />
              <SkeletonLine width={48} height={20} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A failed first read, said as one, with the server's own reason when it
 *  sent one. The retry asks the server again; while that is in flight the
 *  button stays focusable, says it is busy and ignores further presses. */
function QueueHealthLoadError({
  reason,
  isRetrying,
  onRetry,
}: {
  reason: string | null;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const retry = () => {
    if (isRetrying) return;
    onRetry();
  };
  return (
    <div className={styles.errorCard}>
      <span className={`${styles.badge} ${styles.toneWarning}`} aria-hidden>
        <FiAlertTriangle />
      </span>
      <div className={styles.errorBody}>
        <div className={styles.errorMessage} role="status">
          <p className={styles.errorText}>
            {t("admin:moderationHealth.loadError")}
          </p>
          {reason && <p className={styles.errorReason}>{reason}</p>}
        </div>
        <Button
          variant="quiet"
          size="sm"
          className={styles.busyButton}
          aria-disabled={isRetrying}
          aria-busy={isRetrying}
          onClick={retry}
        >
          {t("common:error.retry")}
        </Button>
      </div>
    </div>
  );
}
