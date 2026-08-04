import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiInbox } from "react-icons/fi";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { AdminChip, AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import { DEFAULT_AUDIT_FILTERS, type AuditFilterState } from "./adminGovernance.data";
import { useAdminAudit, type AuditRowView } from "./api/useAdminAudit";
import { AdminGovernanceAuditFilters } from "./AdminGovernanceAuditFilters";
import { AdminGovernanceAuditModal } from "./AdminGovernanceAuditModal";
import styles from "./AdminGovernancePage.module.css";

const PAGE_SIZE = 8;

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
  const metaLabel =
    total === 0
      ? t("admin:governance.audit.metaZero")
      : t("admin:governance.audit.metaMatch", { count: total });

  // `pageCount` can shrink (filters narrow the result set, or a live refetch
  // returns fewer rows) after `page` was already advanced past it — clamp so
  // the pager and the visible slice never point past the last real page.
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;

  return (
    <FadeIn>
      <div className={styles.auditHead}>
        <h2 className={styles.cardTitle}>
          <Translation
            i18nKey="admin:governance.audit.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.auditMeta}>{metaLabel}</span>
      </div>

      <AdminGovernanceAuditFilters
        filters={filters}
        onChange={changeFilters}
        moderators={moderators}
        onExport={() =>
          demoMode
            ? showToast(
                t("admin:governance.audit.exportToast", {
                  total: totalDisplay,
                }),
                "success",
              )
            : showToast(
                t("admin:governance.audit.exportComingSoonToast"),
                "info",
              )
        }
      />

      <div className={styles.auditCard}>
        <div className={styles.auditTable} role="table">
          <div className={styles.auditRowHead} role="row">
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

          {loading ? (
            Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <SkeletonRow key={index} />
            ))
          ) : total === 0 ? (
            <EmptyState />
          ) : (
            items.map((entry, index) => (
              <FadeIn key={entry.id} delay={index * 45}>
                <AuditRow entry={entry} onOpen={() => setOpen(entry)} />
              </FadeIn>
            ))
          )}
        </div>

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
      </div>

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
  return (
    <div
      className={styles.auditRow}
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
          src={portrait(entry.moderatorName)}
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

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className={styles.auditEmpty}>
      <span className={styles.auditEmptyIco} aria-hidden>
        <FiInbox />
      </span>
      <h3 className={styles.auditEmptyTitle}>
        {t("admin:governance.audit.emptyTitle")}
      </h3>
      <p className={styles.auditEmptyText}>
        {t("admin:governance.audit.emptyText")}
      </p>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className={styles.auditRow} aria-hidden>
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
