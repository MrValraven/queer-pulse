import { AnimatePresence } from "motion/react";
import { FiAlertCircle, FiSearch, FiUsers } from "react-icons/fi";
import {
  Collapse,
  EmptyState,
  LoadMoreButton,
  LoadMoreStatus,
  SkeletonLine,
} from "../../../shared/components/ui";
import { FadeListItem } from "../../../shared/components/ui/ViewFade";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { LeadListResult } from "./api/useLeadList";
import { AdminLeadRow } from "./AdminLeadRow";
import { leadErrorKeyOf, leadErrorValuesOf } from "./leadErrors";
import type { LeadListViewName } from "./leadListView";
import { LEAD_LIST_SKELETON_ROWS } from "./leadsList.data";
import styles from "./AdminLeads.module.css";

/** The column names over a wide list. The rows name their own parts to
 *  assistive tech, so this line is for the eye only. */
function AdminLeadsTableHead() {
  const { t } = useTranslation();
  return (
    <div className={styles.tableHead} aria-hidden>
      <span className={styles.headName}>{t("admin:leads.column.lead")}</span>
      <span className={styles.headStage}>{t("admin:leads.field.stage")}</span>
      <span className={styles.headLocation}>
        {t("admin:leads.field.location")}
      </span>
      <span className={styles.headLinks}>{t("admin:leads.field.links")}</span>
      <span className={styles.headNotes}>{t("admin:leads.column.notes")}</span>
      <span className={styles.headFollowUp}>
        {t("admin:leads.column.followUp")}
      </span>
    </div>
  );
}

/** Row-shaped placeholders while the first page loads. */
function AdminLeadsSkeleton() {
  return (
    <div className={styles.skeletonRows} aria-hidden>
      {LEAD_LIST_SKELETON_ROWS.map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={72}
          style={{ borderRadius: "var(--radius-card)" }}
        />
      ))}
    </div>
  );
}

/** The first page failed: the cause, and a retry that keeps its place (and
 *  focus) while the read runs again. Built on EmptyState so the retry can
 *  say "Load the leads again". */
function AdminLeadsLoadError({ list }: { list: LeadListResult }) {
  const { t } = useTranslation();
  const ignorePress = () => {};
  return (
    <EmptyState
      className={styles.listState}
      compact
      headingLevel={2}
      icon={<FiAlertCircle aria-hidden />}
      title={t("admin:leads.list.loadError")}
      description={t(leadErrorKeyOf(list.error), leadErrorValuesOf(list.error))}
      action={
        list.isRetrying
          ? {
              label: t("shared:loadError.retryingCta"),
              onClick: ignorePress,
              isBusy: true,
            }
          : { label: t("admin:leads.list.retryCta"), onClick: list.retry }
      }
    />
  );
}

/**
 * The content of one list view. It holds no animation of its own: the parent
 * swaps whole views with a fade and eases the panel height once. Rows that
 * arrive with the view appear at rest; rows a Show more press appends fade
 * in beside them. While new filters load, the rows on screen dim.
 */
export function AdminLeadsListView({
  viewName,
  list,
  onAdd,
  onClearFilters,
}: {
  viewName: LeadListViewName;
  list: LeadListResult;
  onAdd: () => void;
  onClearFilters: () => void;
}) {
  const { t } = useTranslation();

  if (viewName === "loading") return <AdminLeadsSkeleton />;
  if (viewName === "error") return <AdminLeadsLoadError list={list} />;
  if (viewName === "none") return null;
  if (viewName === "emptyNone") {
    return (
      <EmptyState
        className={styles.listState}
        compact
        headingLevel={2}
        icon={<FiUsers aria-hidden />}
        title={t("admin:leads.empty.none.title")}
        description={t("admin:leads.empty.none.body")}
        action={{ label: t("admin:leads.addCta"), onClick: onAdd }}
      />
    );
  }
  if (viewName === "emptyFiltered") {
    return (
      <EmptyState
        className={styles.listState}
        compact
        headingLevel={2}
        icon={<FiSearch aria-hidden />}
        title={t("admin:leads.empty.filtered.title")}
        description={t("admin:leads.empty.filtered.body")}
        action={{
          label: t("admin:leads.empty.clearFilters"),
          onClick: onClearFilters,
        }}
      />
    );
  }
  return (
    <>
      <div className={styles.table}>
        <AdminLeadsTableHead />
        <ul
          className={styles.rows}
          aria-label={t("admin:leads.title")}
          aria-busy={list.isShowingPreviousResults || undefined}
          data-stale={list.isShowingPreviousResults || undefined}
        >
          <AnimatePresence initial={false}>
            {list.rows.map((row) => (
              <FadeListItem key={row.id}>
                <AdminLeadRow row={row} />
              </FadeListItem>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <LoadMoreStatus
        isFetchingNextPage={list.isFetchingMore}
        isFetchNextPageError={list.isLoadMoreError}
        errorMessage={t(
          leadErrorKeyOf(list.error),
          leadErrorValuesOf(list.error),
        )}
      />
      <Collapse isOpen={list.hasMore}>
        <div className={styles.loadMore}>
          <LoadMoreButton
            isFetchingNextPage={list.isFetchingMore}
            isFetchNextPageError={list.isLoadMoreError}
            onLoadMore={list.loadMore}
            label={t("admin:leads.list.loadMore")}
            loadingLabel={t("shared:loading.label")}
          />
        </div>
      </Collapse>
    </>
  );
}
