import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs, AdminChip, type AdminTone } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import {
  useAdminCommissionInterests,
  type AdminCommissionCategoryFilter,
} from "./api/useAdminCommissionInterests";
import type {
  AdminCommissionInterestDTO,
  CommissionCategory,
} from "./api/adminCommissionInterests.api";
import styles from "./AdminSubmissionList.module.css";

const FILTERS: AdminCommissionCategoryFilter[] = [
  "all",
  "Photo",
  "Music",
  "Writing",
  "Design",
  "Film",
];

/** Chip tone per commission category. */
const CATEGORY_TONE: Record<CommissionCategory, AdminTone> = {
  Photo: "violet",
  Music: "coral",
  Writing: "plum",
  Design: "amber",
  Film: "jade",
};

function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CommissionInterestRow({
  interest,
}: {
  interest: AdminCommissionInterestDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const memberName =
    interest.member?.name ?? t("admin:adminCommissionInterests.unknownMember");
  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{interest.commissionTitle}</span>
          <AdminChip tone={CATEGORY_TONE[interest.commissionCategory]} dot>
            {interest.commissionCategory}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminCommissionInterests.row.from", { name: memberName })}
          {" → "}
          {t("admin:adminCommissionInterests.row.to", {
            name: interest.recipientName,
          })}
        </div>
        {interest.message && (
          <div className={styles.rowNote}>“{interest.message}”</div>
        )}
        <div className={styles.rowDates}>
          {t("admin:adminCommissionInterests.row.sent", {
            date: shortDate(fmt, interest.createdAt),
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
          height={92}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}

/**
 * Admin commission-interest oversight: every "express interest" a member has
 * sent on the Commission Board — who, which project/category, to whom, and their
 * optional note — filterable by category. Demo mode reads the colocated fixture;
 * live mode calls `GET /admin/commission-interests` with pagination.
 */
export function AdminCommissionInterestsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<AdminCommissionCategoryFilter>("all");
  const {
    interests,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminCommissionInterests(filter);

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminCommissionInterests.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminCommissionInterests.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminCommissionInterests.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminCommissionInterests.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label:
              value === "all"
                ? t("admin:adminCommissionInterests.filter.all")
                : value,
          }))}
          active={filter}
          onChange={(value) =>
            setFilter(value as AdminCommissionCategoryFilter)
          }
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <RowsSkeleton />
        ) : isError ? (
          <p className={styles.emptyLine}>
            {t("admin:adminCommissionInterests.error")}
          </p>
        ) : interests.length === 0 ? (
          <p className={styles.emptyLine}>
            {t("admin:adminCommissionInterests.empty")}
          </p>
        ) : (
          <>
            <div className={styles.rows}>
              {interests.map((interest, index) => (
                <FadeIn key={interest.id} delay={Math.min(index, 8) * 50}>
                  <CommissionInterestRow interest={interest} />
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
                    ? t("admin:adminCommissionInterests.loadingMore")
                    : t("admin:adminCommissionInterests.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>
    </AdminShell>
  );
}
