import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs, AdminChip, type AdminTone } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import {
  useAdminConcerns,
  type AdminConcernStatusFilter,
} from "./api/useAdminConcerns";
import { useAdminConcernMutations } from "./api/useAdminConcernMutations";
import type {
  AdminConcernDTO,
  ConcernStatus,
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

const STATUS_TONE: Record<ConcernStatus, AdminTone> = {
  new: "amber",
  reviewing: "violet",
  resolved: "jade",
  dismissed: "ghost",
};

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
          <AdminChip tone={STATUS_TONE[concern.status]} dot>
            {t(`admin:adminConcerns.status.${concern.status}`)}
          </AdminChip>
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

function RowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={92}
          style={{ borderRadius: 22 }}
        />
      ))}
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
 */
export function AdminConcernsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<AdminConcernStatusFilter>("all");
  const {
    concerns,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminConcerns(filter);
  const { triage, pending } = useAdminConcernMutations();

  const handleTriage = (id: string, status: ConcernTriageStatus) => {
    triage(
      { id, status },
      {
        onSuccess: () =>
          showToast(t(`admin:adminConcerns.toast.${status}`), "success"),
        onError: () =>
          showToast(t("admin:adminConcerns.toast.error"), "error"),
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
          onChange={(value) =>
            setFilter(value as AdminConcernStatusFilter)
          }
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <RowsSkeleton />
        ) : isError ? (
          <p className={styles.emptyLine}>{t("admin:adminConcerns.error")}</p>
        ) : concerns.length === 0 ? (
          <p className={styles.emptyLine}>{t("admin:adminConcerns.empty")}</p>
        ) : (
          <>
            <div className={styles.rows}>
              {concerns.map((concern, index) => (
                <FadeIn key={concern.id} delay={Math.min(index, 8) * 50}>
                  <ConcernRow
                    concern={concern}
                    pending={pending}
                    onTriage={(status) => handleTriage(concern.id, status)}
                  />
                </FadeIn>
              ))}
            </div>
            {hasNextPage && (
              <div className={styles.loadMore}>
                <Button
                  variant="ghost"
                  size="md"
                  disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  {isFetchingNextPage
                    ? t("admin:adminConcerns.loadingMore")
                    : t("admin:adminConcerns.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>
    </AdminShell>
  );
}
