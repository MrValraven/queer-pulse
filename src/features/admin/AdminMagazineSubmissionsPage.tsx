import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  useAdminMagazineSubmissions,
  type AdminMagazineSubmissionFilter,
} from "./api/useAdminMagazineSubmissions";
import { AdminMagazineSubmissionRow } from "./AdminMagazineSubmissionRow";
import styles from "./AdminSubmissionList.module.css";

const FILTERS: AdminMagazineSubmissionFilter[] = [
  "all",
  "submitted",
  "in_review",
  "accepted",
  "rejected",
  "published",
  "draft",
];

function RowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={104}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}

/**
 * Admin magazine-submission oversight: every reader story — submitter, working
 * title, format, the piece as written, its cover, and its status — filterable
 * by status, with accept / decline / commission on each open row
 * (`AdminMagazineSubmissionRow`). Demo mode reads the colocated fixture; live
 * mode calls `GET /admin/magazine-submissions` with pagination.
 */
export function AdminMagazineSubmissionsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<AdminMagazineSubmissionFilter>("all");
  const {
    submissions,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminMagazineSubmissions(filter);

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminMagazineSubmissions.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminMagazineSubmissions.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminMagazineSubmissions.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminMagazineSubmissions.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label: t(`admin:adminMagazineSubmissions.filter.${value}`),
          }))}
          active={filter}
          onChange={(value) =>
            setFilter(value as AdminMagazineSubmissionFilter)
          }
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <RowsSkeleton />
        ) : isError ? (
          <p className={styles.emptyLine}>
            {t("admin:adminMagazineSubmissions.error")}
          </p>
        ) : submissions.length === 0 ? (
          <p className={styles.emptyLine}>
            {t("admin:adminMagazineSubmissions.empty")}
          </p>
        ) : (
          <>
            <div className={styles.rows}>
              {submissions.map((submission, index) => (
                <FadeIn key={submission.id} delay={Math.min(index, 8) * 50}>
                  <AdminMagazineSubmissionRow submission={submission} />
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
                    ? t("admin:adminMagazineSubmissions.loadingMore")
                    : t("admin:adminMagazineSubmissions.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>
    </AdminShell>
  );
}
