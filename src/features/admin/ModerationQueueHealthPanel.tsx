import { reasonFor } from "../../shared/api/errorMessage";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useModerationQueueHealth } from "./api/useModerationQueueHealth";
import { ModerationQueueHealthOverview } from "./ModerationQueueHealthOverview";
import { ModerationQueueHealthRow } from "./ModerationQueueHealthRow";
import { AdminNotice, AdminPanel, AdminStat, AdminStatTiles } from "./ui";
import styles from "./ModerationQueueHealthOverview.module.css";

/**
 * Moderator workload and SLA health across every queue (TS-04).
 *
 * WHAT THIS IS FOR. A volunteer rota cannot see its own backlog building until
 * somebody is already drowning in it, and burnout on a platform this size is a
 * predictable failure, and bad luck has little to do with it. This panel
 * makes the state of the work visible early enough to redistribute it.
 *
 * WHAT IT IS NOT. It measures QUEUES and leaves people out. It holds no
 * throughput figure, per-moderator attribution or ranking anywhere, and none
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

const SKELETON_ROWS = [0, 1, 2, 3, 4];
const SKELETON_TILE_LABELS = [
  "admin:moderationHealth.stat.depth",
  "admin:moderationHealth.stat.overdue",
  "admin:moderationHealth.stat.unassigned",
  "admin:moderationHealth.overview.total.rota",
];

/** The loaded layout's shapes, so nothing jumps when the reading lands: the
 *  overview card (headline, strip and legend, four tiles, footer) and five
 *  queue cards. */
function QueueHealthSkeleton() {
  const { t } = useTranslation();
  return (
    <>
      <div aria-hidden>
        <AdminPanel as="div">
          <div className={styles.overviewBody}>
            <div className={styles.skeletonStack}>
              <SkeletonLine width="55%" height={30} />
              <SkeletonLine width="80%" height={16} />
            </div>
            <div className={styles.stripBlock}>
              <SkeletonLine width="100%" height={8} />
              <SkeletonLine width="40%" height={16} />
            </div>
            <AdminStatTiles columns={4}>
              {SKELETON_TILE_LABELS.map((labelKey) => (
                <AdminStat
                  key={labelKey}
                  label={t(labelKey)}
                  value=""
                  isLoading
                />
              ))}
            </AdminStatTiles>
            <div className={styles.footer}>
              <SkeletonLine width="30%" height={14} />
              <SkeletonLine width={96} height={36} />
            </div>
          </div>
        </AdminPanel>
      </div>
      <div className={styles.rows} aria-hidden>
        {SKELETON_ROWS.map((placeholder) => (
          <AdminPanel as="div" key={placeholder}>
            <div className={styles.skeletonStack}>
              <SkeletonLine width={160} height={24} />
              <SkeletonLine width="100%" height={64} />
              <SkeletonLine width="60%" height={14} />
            </div>
          </AdminPanel>
        ))}
      </div>
    </>
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
    <AdminNotice
      tone="error"
      title={t("admin:moderationHealth.loadError")}
      action={
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
      }
    >
      {reason}
    </AdminNotice>
  );
}
