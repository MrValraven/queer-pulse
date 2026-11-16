import { useId, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiInbox } from "react-icons/fi";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import {
  AdminAvatar,
  AdminChip,
  AdminEmptyState,
  AdminPanel,
  adminTableClasses,
} from "./ui";
import { useDemoPortrait } from "./useDemoPortrait";
import {
  DEFAULT_AUDIT_FILTERS,
  type AuditFilterState,
} from "./adminGovernance.data";
import { useAdminAudit, type AuditRowView } from "./api/useAdminAudit";
import { downloadAuditCsv } from "./api/adminAudit.api";
import { AdminGovernanceAuditFilters } from "./AdminGovernanceAuditFilters";
import { AdminGovernanceAuditModal } from "./AdminGovernanceAuditModal";
import styles from "./AdminGovernancePage.module.css";

const PAGE_SIZE = 8;

/** A log row on the kit's row list, laid out on this table's column grid. */
const AUDIT_ROW_CLASS = `${adminTableClasses.row} ${styles.auditRow}`;

export function AdminGovernanceAudit() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<AuditFilterState>(
    DEFAULT_AUDIT_FILTERS,
  );
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<AuditRowView | null>(null);
  const titleId = useId();

  const { items, total, moderators, pageCount, loading } = useAdminAudit(
    filters,
    page,
    PAGE_SIZE,
  );

  const changeFilters = (next: AuditFilterState) => {
    setFilters(next);
    setPage(1);
  };

  const totalDisplay = fmt.number(total);

  // Export the audit feed as CSV. Demo keeps the prototype's confirmation
  // toast (the demo has no backend and writes no file); live streams the CSV
  // from `/mod/audit.csv` honouring the current filters, then confirms or
  // shows an honest error.
  const handleExport = async () => {
    if (demoMode) {
      showToast(
        t("admin:governance.audit.exportToast", { total: totalDisplay }),
        "success",
      );
      return;
    }
    try {
      await downloadAuditCsv({
        moderator: filters.moderator === "all" ? undefined : filters.moderator,
        action: filters.action === "all" ? undefined : filters.action,
        range: filters.range === "all" ? undefined : filters.range,
        q: filters.query.trim() || undefined,
      });
      showToast(
        t("admin:governance.audit.exportToast", { total: totalDisplay }),
        "success",
      );
    } catch {
      showToast(t("admin:governance.audit.exportError"), "error");
    }
  };
  const metaLabel =
    total === 0
      ? t("admin:governance.audit.metaZero")
      : t("admin:governance.audit.metaMatch", { count: total });

  // `pageCount` can shrink (filters narrow the result set, or a live refetch
  // returns fewer rows) after `page` was already advanced past it. Clamp so
  // the pager and the visible slice never point past the last real page.
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;

  return (
    <FadeIn className={styles.tabBody}>
      {/* Overflow stays visible so the filter selects can open past the
          panel's edge. */}
      <AdminPanel
        padding="flush"
        isOverflowVisible
        titleId={titleId}
        title={
          <Translation
            i18nKey="admin:governance.audit.title"
            components={{ em: <em /> }}
          />
        }
      >
        <div className={styles.auditToolbar}>
          <AdminGovernanceAuditFilters
            filters={filters}
            onChange={changeFilters}
            moderators={moderators}
            // P3-8: live now streams a real CSV from `GET /mod/audit.csv`
            // honouring the current filters; demo keeps the prototype's
            // confirmation toast.
            onExport={() => void handleExport()}
            count={metaLabel}
          />
        </div>

        {!loading && total === 0 ? (
          <AdminEmptyState
            icon={FiInbox}
            title={t("admin:governance.audit.emptyTitle")}
            body={t("admin:governance.audit.emptyText")}
          />
        ) : (
          <div
            className={styles.auditTable}
            role="table"
            aria-labelledby={titleId}
          >
            <div
              className={`${adminTableClasses.headRow} ${styles.auditRowHead}`}
              role="row"
            >
              <span role="columnheader">
                {t("admin:governance.audit.columns.moderator")}
              </span>
              <span role="columnheader">
                {t("admin:governance.audit.columns.action")}
              </span>
              <span role="columnheader">
                {t("admin:governance.audit.columns.subject")}
              </span>
              <span role="columnheader">
                {t("admin:governance.audit.columns.reason")}
              </span>
              <span role="columnheader">
                {t("admin:governance.audit.columns.when")}
              </span>
            </div>

            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              : items.map((entry, index) => (
                  <FadeIn key={entry.id} delay={index * 45}>
                    <AuditRow entry={entry} onOpen={() => setOpen(entry)} />
                  </FadeIn>
                ))}
          </div>
        )}

        {!loading && total > 0 && (
          <Pager
            page={safePage}
            pageCount={pageCount}
            start={start + 1}
            end={start + items.length}
            total={total}
            onPage={setPage}
          />
        )}
      </AdminPanel>

      {open && (
        <AdminGovernanceAuditModal entry={open} onClose={() => setOpen(null)} />
      )}
    </FadeIn>
  );
}

function AuditRow({
  entry,
  onOpen,
}: {
  entry: AuditRowView;
  onOpen: () => void;
}) {
  const demoPortrait = useDemoPortrait();
  return (
    <div
      className={AUDIT_ROW_CLASS}
      role="row"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <span className={styles.auditMod} role="cell">
        <AdminAvatar
          initials={entry.moderatorInitials}
          tone={entry.moderatorTone}
          size="sm"
          // Demo fixtures only: the registry is keyed by name, and a live
          // audit row names a real moderator.
          src={demoPortrait(entry.moderatorName)}
        />
        {entry.moderatorName}
      </span>
      <span role="cell">
        <AdminChip tone={entry.actionTone}>{entry.actionLabel}</AdminChip>
      </span>
      <span className={styles.auditSubject} role="cell">
        {entry.subject}
      </span>
      <span className={styles.auditReason} role="cell">
        {entry.reason}
      </span>
      <span className={styles.auditWhen} role="cell">
        {entry.when}
      </span>
    </div>
  );
}

function Pager({
  page,
  pageCount,
  start,
  end,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  start: number;
  end: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.pager}>
      <span className={styles.pagerMeta}>
        {t("admin:governance.audit.pagerMeta", {
          start,
          end,
          total: fmt.number(total),
        })}
      </span>
      <div className={styles.pagerNav}>
        <button
          type="button"
          className={styles.pagerBtn}
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          aria-label={t("admin:governance.audit.prevPage")}
        >
          <FiChevronLeft />
        </button>
        {Array.from({ length: pageCount }).map((_, index) => (
          <button
            key={index}
            type="button"
            className={[
              styles.pagerNum,
              page === index + 1 && styles.pagerNumOn,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={page === index + 1 ? "page" : undefined}
            onClick={() => onPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          type="button"
          className={styles.pagerBtn}
          disabled={page === pageCount}
          onClick={() => onPage(page + 1)}
          aria-label={t("admin:governance.audit.nextPage")}
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className={AUDIT_ROW_CLASS} aria-hidden>
      <span className={styles.auditMod}>
        <SkeletonLine
          width={26}
          height={26}
          style={{ borderRadius: 999, flex: "none" }}
        />
        <SkeletonLine width="60%" />
      </span>
      <SkeletonLine width={92} height={22} style={{ borderRadius: 999 }} />
      <SkeletonLine width="70%" />
      <SkeletonLine width="90%" />
      <SkeletonLine width="50%" />
    </div>
  );
}
