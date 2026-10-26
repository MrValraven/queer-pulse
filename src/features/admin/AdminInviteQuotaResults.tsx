import { AnimatePresence, m } from "motion/react";
import { FiSearch, FiUsers } from "react-icons/fi";
import {
  EmptyState,
  LoadErrorState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import type { useAdminInviteQuotas } from "./api/useAdminInvites";
import { hasFailedWithoutData, isRetryingFailedRead } from "./queryLoadFailure";
import { describeInviteQuotaLoadError } from "./adminInviteQuotaErrors";
import { AdminInviteQuotaRow } from "./AdminInviteQuotaRow";
import { AdminInviteQuotaListFooter } from "./AdminInviteQuotaListFooter";
import styles from "./AdminInviteQuotaModal.module.css";

export type AdminInviteQuotasQuery = ReturnType<typeof useAdminInviteQuotas>;

type ResultsView = "loading" | "error" | "empty" | "list";

function resultsViewFor(quotas: AdminInviteQuotasQuery): ResultsView {
  if (hasFailedWithoutData(quotas)) return "error";
  if (quotas.data === undefined) return "loading";
  return quotas.members.length === 0 ? "empty" : "list";
}

const SKELETON_ROW_KEYS = ["first", "second", "third", "fourth"];

function QuotaRowsSkeleton() {
  return (
    <div className={styles.skeletonRows} aria-hidden>
      {SKELETON_ROW_KEYS.map((skeletonKey) => (
        <div key={skeletonKey} className={styles.skeletonRow}>
          <SkeletonAvatar size={40} />
          <div className={styles.skeletonText}>
            <SkeletonLine width="45%" height={14} />
            <SkeletonLine width="30%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

function QuotaEmptyState({ shownTerm }: { shownTerm: string }) {
  const { t } = useTranslation();
  return shownTerm ? (
    <EmptyState
      compact
      icon={<FiSearch aria-hidden />}
      title={t("admin:adminInvites.quota.empty.searchTitle", {
        query: shownTerm,
      })}
      description={t("admin:adminInvites.quota.empty.searchBody")}
    />
  ) : (
    <EmptyState
      compact
      icon={<FiUsers aria-hidden />}
      title={t("admin:adminInvites.quota.empty.idleTitle")}
      description={t("admin:adminInvites.quota.empty.idleBody")}
    />
  );
}

/** The column header and the rows. On a narrow modal the header hides and
 *  each row labels its own cells (see the container query in the CSS). */
function QuotaList({ quotas }: { quotas: AdminInviteQuotasQuery }) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.results}
      data-stale={quotas.isSearching || undefined}
    >
      <div className={styles.table}>
        <div className={styles.headerRow} aria-hidden>
          <span>{t("admin:adminInvites.quota.column.member")}</span>
          <span>{t("admin:adminInvites.quota.column.thisMonth")}</span>
          <span>{t("admin:adminInvites.quota.column.monthlyLimit")}</span>
          <span />
        </div>
        <ul
          className={styles.list}
          aria-label={t("admin:adminInvites.quota.listLabel")}
          aria-busy={quotas.isSearching || undefined}
        >
          {quotas.members.map((member) => (
            <AdminInviteQuotaRow
              key={member.slug}
              member={member}
              defaultMonthlyQuota={
                quotas.defaultMonthlyQuota ?? member.monthlyLimit
              }
            />
          ))}
        </ul>
      </div>
      <AdminInviteQuotaListFooter quotas={quotas} />
    </div>
  );
}

/**
 * Everything under the sticky search bar: skeleton rows on first load, the
 * error panel with a retry, an empty state that echoes the search, or the
 * list. Each swap cross-fades. While a new search loads, the previous rows
 * stay on screen, dimmed, and the search bar shows the busy line.
 */
export function AdminInviteQuotaResults({
  quotas,
}: {
  quotas: AdminInviteQuotasQuery;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const view = resultsViewFor(quotas);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.18 }}
      >
        {view === "loading" && <QuotaRowsSkeleton />}
        {view === "error" && (
          <LoadErrorState
            compact
            title={t("admin:adminInvites.quota.error.loadTitle")}
            description={describeInviteQuotaLoadError(quotas.error, t)}
            onRetry={() => void quotas.refetch()}
            isRetrying={isRetryingFailedRead(quotas)}
          />
        )}
        {view === "empty" && (
          <div
            className={styles.results}
            data-stale={quotas.isSearching || undefined}
          >
            <QuotaEmptyState shownTerm={quotas.shownTerm} />
          </div>
        )}
        {view === "list" && <QuotaList quotas={quotas} />}
      </m.div>
    </AnimatePresence>
  );
}
