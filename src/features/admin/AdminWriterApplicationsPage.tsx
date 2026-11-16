import { useState } from "react";
import { FiFeather } from "react-icons/fi";
import { FadeIn, SkeletonLine, Button } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminEmptyState, AdminNotice, AdminPageHeader, AdminTabs } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  useAdminWriterApplications,
  type AdminWriterApplicationFilter,
} from "./api/useAdminWriterApplications";
import { AdminWriterApplicationsRow } from "./AdminWriterApplicationsRow";
import styles from "./AdminSubmissionList.module.css";
import stateStyles from "./AdminInboxStates.module.css";

const FILTERS: AdminWriterApplicationFilter[] = [
  "all",
  "pending",
  "approved",
  "declined",
];

function RowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={104}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}

export function AdminWriterApplicationsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<AdminWriterApplicationFilter>("all");
  const {
    applications,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminWriterApplications(filter);

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminWriterApplications.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("shared:adminNav.sections.editorial")}
          title={
            <Translation
              i18nKey="admin:adminWriterApplications.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminWriterApplications.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label: t(`admin:adminWriterApplications.filter.${value}`),
          }))}
          active={filter}
          onChange={(value) => setFilter(value as AdminWriterApplicationFilter)}
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <RowsSkeleton />
        ) : isError ? (
          <div className={stateStyles.notice}>
            <AdminNotice tone="error">
              {t("admin:adminWriterApplications.error")}
            </AdminNotice>
          </div>
        ) : applications.length === 0 ? (
          <AdminEmptyState
            size="inline"
            icon={FiFeather}
            title={t("admin:adminWriterApplications.empty")}
          />
        ) : (
          <>
            <div className={styles.rows}>
              {applications.map((application, index) => (
                <FadeIn key={application.id} delay={Math.min(index, 8) * 50}>
                  <AdminWriterApplicationsRow application={application} />
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
                    ? t("admin:adminWriterApplications.loadingMore")
                    : t("admin:adminWriterApplications.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>
    </AdminShell>
  );
}
