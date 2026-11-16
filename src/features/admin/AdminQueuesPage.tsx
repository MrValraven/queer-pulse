import { Link } from "react-router-dom";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiHelpCircle,
  FiInbox,
  FiLayers,
  FiRefreshCw,
} from "react-icons/fi";
import {
  Button,
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  AdminStat,
  AdminStatTiles,
  AdminTable,
  adminTableClasses,
} from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { durationLabel } from "../../shared/i18n/duration";
import { routes } from "../../app/routeMap";
import { useAdminQueues } from "./api/useAdminQueues";
import {
  adminQueueLabelKey,
  type AdminQueueSummaryDTO,
  type AdminQueuesDTO,
} from "./api/adminQueues.api";
import styles from "./AdminQueuesPage.module.css";

/** A wait this long or longer is called out in amber. Seven days is the point
 *  at which a queue with no deadline of its own is still plainly neglected. */
const STALE_WAIT_HOURS = 24 * 7;

/** Under a day old reads as normal traffic and stays quiet. */
const FRESH_WAIT_HOURS = 24;

type WaitTone = "fresh" | "waiting" | "stale";

function waitTone(hours: number): WaitTone {
  if (hours >= STALE_WAIT_HOURS) return "stale";
  if (hours < FRESH_WAIT_HOURS) return "fresh";
  return "waiting";
}

/**
 * The queue's own name, or the raw key made readable when this build has never
 * heard of it. A newer backend may name a queue that has no label here yet, and
 * `t()` answers a miss with the key itself: printing
 * `admin:moderationHealth.queue.something` on a console read under pressure is
 * worse than printing "something".
 */
function useQueueName(): (queue: string) => string {
  const { t } = useTranslation();
  return (queue: string) => {
    const key = adminQueueLabelKey(queue);
    const label = t(key);
    return label === key ? queue.replaceAll("_", " ") : label;
  };
}

/**
 * The oldest wait, said in whole days once it passes a day, and under a day in
 * whatever unit the figure actually deserves. `oldestWaitingHours` is
 * fractional, so a request that landed two minutes ago is 0.033 and used to
 * render as "0.03333333333333333 hours" on the row.
 */
function useWaitLabel(): (hours: number) => string {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (hours: number) => {
    if (hours < FRESH_WAIT_HOURS) return durationLabel(hours, fmt, "long");
    return t("admin:adminQueues.age.days", {
      count: Math.floor(hours / FRESH_WAIT_HOURS),
    });
  };
}

/**
 * The headline: whether anything is overdue at all.
 *
 * The overdue figure is the one number on this screen that means somebody has
 * to move now, so it leads the error notice's title. When nothing has
 * breached, a calm success notice says so and no number is enlarged.
 */
function QueuesVerdict({ totals }: { totals: AdminQueuesDTO["totals"] }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  if (totals.overdueCount > 0) {
    return (
      <AdminNotice
        tone="error"
        title={`${fmt.number(totals.overdueCount)} ${t(
          "admin:adminQueues.verdict.heroLabel",
          { count: totals.overdueCount },
        )}`}
      >
        {t("admin:adminQueues.verdict.overdueBody")}
      </AdminNotice>
    );
  }
  return (
    <AdminNotice
      tone="success"
      title={t("admin:adminQueues.verdict.clearTitle")}
    >
      {t("admin:adminQueues.verdict.clearBody")}
    </AdminNotice>
  );
}

function QueuesTotals({
  totals,
  queueCount,
}: {
  totals: AdminQueuesDTO["totals"];
  queueCount: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const hasUntracked = totals.uncountableQueueCount > 0;
  return (
    <AdminStatTiles columns={hasUntracked ? 3 : 2}>
      <AdminStat
        icon={FiInbox}
        label={t("admin:adminQueues.stat.waiting")}
        value={
          <RollingNumber
            value={fmt.number(totals.waitingCount)}
            numericValue={totals.waitingCount}
          />
        }
      />
      <AdminStat
        icon={FiLayers}
        label={t("admin:adminQueues.stat.queuesWithWork")}
        value={
          <RollingNumber
            value={fmt.number(totals.queuesWithWorkCount)}
            numericValue={totals.queuesWithWorkCount}
          />
        }
        hint={t("admin:adminQueues.stat.queuesWithWorkNote", {
          total: fmt.number(queueCount),
        })}
      />
      {hasUntracked && (
        <AdminStat
          icon={FiHelpCircle}
          tone="warn"
          label={t("admin:adminQueues.stat.untracked")}
          value={
            <RollingNumber
              value={fmt.number(totals.uncountableQueueCount)}
              numericValue={totals.uncountableQueueCount}
            />
          }
          hint={t("admin:adminQueues.stat.untrackedNote")}
        />
      )}
    </AdminStatTiles>
  );
}

/** The deadline cell. Three answers, and only one of them is a number. */
function DeadlineCell({ overdueCount }: { overdueCount: number | null }) {
  const { t } = useTranslation();
  if (overdueCount === null)
    return (
      <span className={styles.muted}>
        {t("admin:adminQueues.cell.noDeadline")}
      </span>
    );
  if (overdueCount === 0)
    return (
      <span className={styles.toneClear}>
        <FiCheckCircle className={styles.cellIcon} aria-hidden />
        {t("admin:adminQueues.cell.onTime")}
      </span>
    );
  return (
    <span className={styles.toneOverdue}>
      <FiAlertTriangle className={styles.cellIcon} aria-hidden />
      {t("admin:adminQueues.cell.overdue", { count: overdueCount })}
    </span>
  );
}

function QueueTableRow({ row }: { row: AdminQueueSummaryDTO }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const queueName = useQueueName();
  const waitLabel = useWaitLabel();
  const isOverdue = (row.overdueCount ?? 0) > 0;
  const tone =
    row.oldestWaitingHours === null ? null : waitTone(row.oldestWaitingHours);
  return (
    <tr className={isOverdue ? styles.rowOverdue : undefined}>
      <th scope="row" className={styles.cellQueue}>
        <Link to={row.route} className={styles.queueLink}>
          {queueName(row.queue)}
        </Link>
      </th>
      <td
        className={adminTableClasses.numeric}
        data-label={t("admin:adminQueues.table.waiting")}
      >
        {row.waitingCount === null ? (
          <span className={styles.muted}>
            {t("admin:adminQueues.cell.notTracked")}
          </span>
        ) : (
          fmt.number(row.waitingCount)
        )}
      </td>
      <td
        className={styles.noWrap}
        data-label={t("admin:adminQueues.table.oldest")}
      >
        {row.oldestWaitingHours === null || tone === null ? (
          <span className={styles.muted}>
            {t("admin:adminQueues.cell.notTracked")}
          </span>
        ) : (
          <span className={tone === "stale" ? styles.toneStale : undefined}>
            {tone === "stale" && (
              <FiClock className={styles.cellIcon} aria-hidden />
            )}
            {waitLabel(row.oldestWaitingHours)}
          </span>
        )}
      </td>
      <td
        className={styles.noWrap}
        data-label={t("admin:adminQueues.table.deadline")}
      >
        <DeadlineCell overdueCount={row.overdueCount} />
      </td>
    </tr>
  );
}

function WaitingTable({ rows }: { rows: AdminQueueSummaryDTO[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.tableScope}>
      <AdminTable label={t("admin:adminQueues.table.caption")}>
        <thead>
          <tr>
            <th scope="col">{t("admin:adminQueues.table.queue")}</th>
            <th scope="col" className={adminTableClasses.numeric}>
              {t("admin:adminQueues.table.waiting")}
            </th>
            <th scope="col">{t("admin:adminQueues.table.oldest")}</th>
            <th scope="col">{t("admin:adminQueues.table.deadline")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <QueueTableRow key={row.queue} row={row} />
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}

/** The quiet queues, folded away. They are still one click each, and they no
 *  longer take up the space of the queues that need somebody. */
function ClearQueues({ rows }: { rows: AdminQueueSummaryDTO[] }) {
  const { t } = useTranslation();
  const queueName = useQueueName();
  if (rows.length === 0) return null;
  return (
    <details className={styles.clear}>
      <summary className={styles.clearSummary}>
        {t("admin:adminQueues.clear.summary", { count: rows.length })}
      </summary>
      <ul className={styles.clearList}>
        {rows.map((row) => (
          <li key={row.queue}>
            <Link to={row.route} className={styles.clearLink}>
              {queueName(row.queue)}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

function QueuesBody({ data }: { data: AdminQueuesDTO }) {
  const { t } = useTranslation();
  if (data.queues.length === 0) {
    return (
      <AdminEmptyState
        icon={FiInbox}
        title={t("admin:adminQueues.noQueues.title")}
        body={t("admin:adminQueues.noQueues.body")}
      />
    );
  }

  // A queue that cannot be counted stays with the live work: "we cannot tell"
  // is an answer somebody has to act on, and folding it in with the clear ones
  // would quietly read as clear.
  const waitingRows = data.queues.filter(
    (row) => row.waitingCount === null || row.waitingCount > 0,
  );
  const clearRows = data.queues.filter((row) => row.waitingCount === 0);

  // A genuinely clear desk is told so in a line. Showing thirty-one zeroes
  // would be the same information rendered as a wall, and an operator who has
  // to read a wall to learn nothing is waiting will stop reading it. The
  // queues stay one click away underneath, so "clear" is still checkable.
  if (waitingRows.length === 0) {
    return (
      <div className={styles.stack}>
        <AdminEmptyState
          icon={FiCheckCircle}
          title={t("admin:adminQueues.deskClear.title")}
          body={t("admin:adminQueues.deskClear.body", {
            count: data.queues.length,
          })}
        />
        <ClearQueues rows={clearRows} />
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <FadeIn delay={60}>
        <QueuesVerdict totals={data.totals} />
      </FadeIn>
      <FadeIn delay={80}>
        <QueuesTotals totals={data.totals} queueCount={data.queues.length} />
      </FadeIn>
      <FadeIn delay={100}>
        <WaitingTable rows={waitingRows} />
      </FadeIn>
      <FadeIn delay={120}>
        <ClearQueues rows={clearRows} />
      </FadeIn>
    </div>
  );
}

function QueuesSkeleton() {
  return (
    <div className={styles.skeleton}>
      {[0, 1, 2, 3, 4].map((skeletonIndex) => (
        <SkeletonLine key={skeletonIndex} height={64} />
      ))}
    </div>
  );
}

/**
 * The staff triage console: every queue this operator can work, on one screen,
 * with the oldest thing waiting in each (PRD-282).
 *
 * Nothing on the platform used to say what was waiting today. The dashboard
 * carried four triage counts and the admin rail five badges, while the backend
 * registers 28 staff queues (plus three more outside that registry) whose only
 * standing signal was a bell row announcing an arrival. Knowing that nothing
 * was overdue meant opening roughly fifteen pages, and a data-subject request
 * on a statutory 30-day clock only read "overdue" once somebody happened to
 * open `/admin/dsar`.
 *
 * Three rules this screen is built on:
 * - The server sends only the queues the caller can work, and sends them most
 *   urgent first. Nothing here lists queues of its own or re-sorts them.
 * - Every row deep-links through the `route` the server sent, so the three
 *   queues outside the registry link as well as the twenty-eight inside it.
 * - `null` and `0` are different answers. No deadline is not "on time", and no
 *   worked/unworked record is not "nothing waiting".
 */
export function AdminQueuesPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { data, isLoading, isError, isFetching, refetch } = useAdminQueues();

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminQueues.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("shared:adminNav.sections.trust")}
          title={
            <Translation
              i18nKey="admin:adminQueues.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminQueues.header.sub")}
          meta={
            data
              ? t("admin:adminQueues.asOf", {
                  time: fmt.time(new Date(data.generatedAt)),
                })
              : undefined
          }
          actions={
            <Button
              variant="ghost"
              size="sm"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              <FiRefreshCw aria-hidden />
              {isFetching
                ? t("admin:adminQueues.refreshing")
                : t("admin:adminQueues.refresh")}
            </Button>
          }
        />
      </FadeIn>

      {isLoading ? (
        <QueuesSkeleton />
      ) : isError || !data ? (
        <LoadErrorState
          title={t("admin:adminQueues.error.title")}
          description={t("admin:adminQueues.error.body")}
          onRetry={() => void refetch()}
        />
      ) : (
        <QueuesBody data={data} />
      )}
    </AdminShell>
  );
}
