import { useState } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs, AdminChip } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { AdminSubmissionQueue, AdminWaitingChip } from "./AdminSubmissionQueue";
import { ADMIN_SUBMISSION_STATUS_TONE } from "./adminSubmissionMeta";
import {
  useAdminConcerns,
  type AdminConcernStatusFilter,
} from "./api/useAdminConcerns";
import { useAdminConcernMutations } from "./api/useAdminConcernMutations";
import type {
  AdminConcernDTO,
  ConcernTriageStatus,
} from "./api/adminConcerns.api";
import styles from "./AdminSubmissionList.module.css";

const FILTERS: AdminConcernStatusFilter[] = [
  "all",
  "new",
  "reviewing",
  "resolved",
  "dismissed",
];

// The triage actions, and the status each lands the concern in — used to disable
// the button matching the current status (a no-op re-triage).
const ACTIONS: ConcernTriageStatus[] = ["reviewing", "resolved", "dismissed"];

function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ConcernRow({
  concern,
  onTriage,
  pending,
}: {
  concern: AdminConcernDTO;
  onTriage: (status: ConcernTriageStatus) => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // Who raised it / how to reach them: a signed-in member resolves to their
  // name; a logged-out person left an email; otherwise there's no way back.
  const contact = concern.submitter
    ? concern.submitter.name
    : concern.email
      ? concern.email
      : t("admin:adminConcerns.contact.anon");
  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>
            {t(`admin:adminConcerns.category.${concern.category}`)}
          </span>
          <AdminChip
            tone={ADMIN_SUBMISSION_STATUS_TONE[concern.status] ?? "plum"}
            dot
          >
            {t(`admin:adminConcerns.status.${concern.status}`)}
          </AdminChip>
          {concern.status === "new" && (
            <AdminWaitingChip since={concern.createdAt} />
          )}
        </div>
        {concern.description && (
          <div className={styles.rowNote}>“{concern.description}”</div>
        )}
        <div className={styles.rowMeta}>
          {t("admin:adminConcerns.row.contact", { contact })}
        </div>
        <div className={styles.rowDates}>
          {t("admin:adminConcerns.row.sent", {
            date: shortDate(fmt, concern.createdAt),
          })}
        </div>
      </div>
      <div className={styles.rowActions}>
        <div className={styles.rowActionButtons}>
          {ACTIONS.map((status) => (
            <Button
              key={status}
              variant="ghost"
              size="sm"
              disabled={pending || concern.status === status}
              onClick={() => onTriage(status)}
            >
              {t(`admin:adminConcerns.action.${status}`)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Admin governance-concern oversight: every "Submit a concern" a visitor or
 * member sent through the public governance form — the category, what they
 * described, and how to reach them — filterable by triage status, with
 * mark-reviewing / resolve / dismiss actions. Demo mode reads the colocated
 * fixture; live mode calls `GET /intakes?kind=governance_concern` with
 * pagination.
 *
 * This page stays separate from the generalised console at `/admin/intakes`
 * (ACQ-03) on purpose: a concern is confidential, and it needs the
 * reviewing/resolved/dismissed worklist rather than the plain "somebody read
 * this" flip the other eleven intake kinds get. What the two DO share is the
 * list machinery — skeleton, empty, error, staggered rows, load-more and the
 * status tones — which lives in `AdminSubmissionQueue` so the two inboxes
 * cannot drift apart.
 */
export function AdminConcernsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<AdminConcernStatusFilter>("all");
  const query = useAdminConcerns(filter);
  const { triage, pending } = useAdminConcernMutations();

  const handleTriage = (id: string, status: ConcernTriageStatus) => {
    triage(
      { id, status },
      {
        onSuccess: () =>
          showToast(t(`admin:adminConcerns.toast.${status}`), "success"),
        onError: () => showToast(t("admin:adminConcerns.toast.error"), "error"),
      },
    );
  };

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminConcerns.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminConcerns.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminConcerns.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminConcerns.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label:
              value === "all"
                ? t("admin:adminConcerns.filter.all")
                : t(`admin:adminConcerns.status.${value}`),
          }))}
          active={filter}
          onChange={(value) => setFilter(value as AdminConcernStatusFilter)}
        />
      </FadeIn>

      <FadeIn delay={80}>
        <AdminSubmissionQueue<AdminConcernDTO>
          items={query.concerns}
          itemKey={(concern) => concern.id}
          renderItem={(concern) => (
            <ConcernRow
              concern={concern}
              pending={pending}
              onTriage={(status) => handleTriage(concern.id, status)}
            />
          )}
          isLoading={query.isLoading}
          isError={query.isError}
          errorText={t("admin:adminConcerns.error")}
          emptyText={t("admin:adminConcerns.empty")}
          hasNextPage={Boolean(query.hasNextPage)}
          isFetchingNextPage={query.isFetchingNextPage}
          onLoadMore={() => void query.fetchNextPage()}
          loadMoreLabel={t("admin:adminConcerns.loadMore")}
          loadingMoreLabel={t("admin:adminConcerns.loadingMore")}
        />
      </FadeIn>
    </AdminShell>
  );
}
