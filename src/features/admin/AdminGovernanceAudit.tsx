import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiInbox } from "react-icons/fi";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { AdminChip, AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import {
  AUDIT_ENTRIES,
  AUDIT_TOTAL,
  AUDIT_PAGE_SIZE,
  DEFAULT_AUDIT_FILTERS,
  type AuditEntry,
  type AuditFilterState,
} from "./adminGovernance.data";
import { AdminGovernanceAuditFilters } from "./AdminGovernanceAuditFilters";
import { AdminGovernanceAuditModal } from "./AdminGovernanceAuditModal";
import styles from "./AdminGovernancePage.module.css";

function matches(e: AuditEntry, f: AuditFilterState): boolean {
  if (f.moderator !== "all" && e.modName !== f.moderator) return false;
  if (f.action !== "all" && e.type !== f.action) return false;
  if (f.range !== "all" && e.range !== f.range) return false;
  if (f.query.trim()) {
    const q = f.query.trim().toLowerCase();
    if (!`${e.reason} ${e.subject}`.toLowerCase().includes(q)) return false;
  }
  return true;
}

export function AdminGovernanceAudit() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const loading = useSimulatedLoad(1100);
  const { showToast } = useToast();
  const [filters, setFilters] = useState<AuditFilterState>(
    DEFAULT_AUDIT_FILTERS,
  );
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<AuditEntry | null>(null);

  const filtered = useMemo(
    () => AUDIT_ENTRIES.filter((e) => matches(e, filters)),
    [filters],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / AUDIT_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * AUDIT_PAGE_SIZE;
  const rows = filtered.slice(start, start + AUDIT_PAGE_SIZE);

  const changeFilters = (next: AuditFilterState) => {
    setFilters(next);
    setPage(1);
  };

  const totalDisplay = fmt.number(AUDIT_TOTAL);
  const metaLabel =
    filtered.length === 0
      ? t("admin:governance.audit.metaZero", { total: totalDisplay })
      : t("admin:governance.audit.metaMatch", {
          count: filtered.length,
          total: totalDisplay,
        });

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
        onExport={() =>
          showToast(
            t("admin:governance.audit.exportToast", { total: totalDisplay }),
            "success",
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
            Array.from({ length: AUDIT_PAGE_SIZE }).map((_, i) => (
              <SkeletonRow key={i} />
            ))
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            rows.map((e, i) => (
              <FadeIn key={e.id} delay={i * 45}>
                <AuditRow entry={e} onOpen={() => setOpen(e)} />
              </FadeIn>
            ))
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <Pager
            page={safePage}
            pageCount={pageCount}
            start={start + 1}
            end={start + rows.length}
            total={filtered.length}
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
  entry: AuditEntry;
  onOpen: () => void;
}) {
  return (
    <div
      className={styles.auditRow}
      role="row"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <span className={styles.auditMod} role="cell">
        <AdminAvatar
          initials={entry.modInitials}
          tone={entry.modTone}
          size="sm"
          src={portrait(entry.modName)}
        />
        {entry.modName}
      </span>
      <span role="cell">
        <AdminChip tone={entry.actionTone}>{entry.action}</AdminChip>
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
  onPage: (p: number) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.pager}>
      <span className={styles.pagerMeta}>
        {t("admin:governance.audit.pagerMeta", {
          start,
          end,
          total: fmt.number(AUDIT_TOTAL),
        })}
        {total !== AUDIT_TOTAL &&
          t("admin:governance.audit.pagerMatch", { count: total })}
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
        {Array.from({ length: pageCount }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={[styles.pagerNum, page === i + 1 && styles.pagerNumOn]
              .filter(Boolean)
              .join(" ")}
            aria-current={page === i + 1 ? "page" : undefined}
            onClick={() => onPage(i + 1)}
          >
            {i + 1}
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
  const fmt = useFormat();
  return (
    <div className={styles.auditEmpty}>
      <span className={styles.auditEmptyIco} aria-hidden>
        <FiInbox />
      </span>
      <h3 className={styles.auditEmptyTitle}>
        {t("admin:governance.audit.emptyTitle")}
      </h3>
      <p className={styles.auditEmptyText}>
        {t("admin:governance.audit.emptyText", {
          total: fmt.number(AUDIT_TOTAL),
        })}
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
