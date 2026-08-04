import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs, AdminChip, type AdminTone } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import {
  useAdminMagazineSubmissions,
  type AdminMagazineSubmissionFilter,
} from "./api/useAdminMagazineSubmissions";
import type {
  AdminMagazineSubmissionDTO,
  MagazineSubmissionStatus,
} from "./api/adminMagazineSubmissions.api";
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

const STATUS_TONE: Record<MagazineSubmissionStatus, AdminTone> = {
  draft: "ghost",
  submitted: "amber",
  in_review: "violet",
  accepted: "jade",
  rejected: "coral",
  published: "plum",
};

function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SubmissionRow({
  submission,
}: {
  submission: AdminMagazineSubmissionDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const submitterName =
    submission.submitter?.name ??
    t("admin:adminMagazineSubmissions.unknownMember");
  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{submission.workingTitle}</span>
          <AdminChip tone={STATUS_TONE[submission.status]} dot>
            {t(`admin:adminMagazineSubmissions.status.${submission.status}`)}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminMagazineSubmissions.row.by", { name: submitterName })}
          {" · "}
          {submission.format}
        </div>
        <div className={styles.rowNote}>{submission.pitch}</div>
        <div className={styles.rowDates}>
          {t("admin:adminMagazineSubmissions.row.sent", {
            date: shortDate(fmt, submission.createdAt),
          })}
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
          height={104}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}

/**
 * Admin magazine-submission oversight: every reader story pitch — submitter,
 * working title, format, pitch, and status — filterable by status. This is the
 * READ surface the submissions editor was previously mock-only for. Demo mode
 * reads the colocated fixture; live mode calls `GET /admin/magazine-submissions`
 * with pagination.
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
                  <SubmissionRow submission={submission} />
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
