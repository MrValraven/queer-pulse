import { FiUserPlus } from "react-icons/fi";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminEmptyState, AdminNotice, AdminPageHeader } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useAdminChangemakerNominations } from "./api/useAdminChangemakerNominations";
import { AdminChangemakerNominationsRow } from "./AdminChangemakerNominationsRow";
import styles from "./AdminSubmissionList.module.css";
import stateStyles from "./AdminInboxStates.module.css";

function RowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={80}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}

/**
 * Admin changemaker-nomination oversight: every "Nominate them" a member has
 * submitted for the Change Makers directory — who nominated whom. Demo mode
 * reads the colocated fixture; live mode calls `GET /admin/changemaker-
 * nominations` with pagination.
 */
export function AdminChangemakerNominationsPage() {
  const { t } = useTranslation();
  const {
    nominations,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminChangemakerNominations();

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminChangemakerNominations.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("shared:adminNav.sections.partners")}
          title={
            <Translation
              i18nKey="admin:adminChangemakerNominations.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminChangemakerNominations.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <RowsSkeleton />
        ) : isError ? (
          <div className={stateStyles.notice}>
            <AdminNotice tone="error">
              {t("admin:adminChangemakerNominations.error")}
            </AdminNotice>
          </div>
        ) : nominations.length === 0 ? (
          <AdminEmptyState
            size="inline"
            icon={FiUserPlus}
            title={t("admin:adminChangemakerNominations.empty")}
          />
        ) : (
          <>
            <div className={styles.rows}>
              {nominations.map((nomination, index) => (
                <FadeIn key={nomination.id} delay={Math.min(index, 8) * 50}>
                  <AdminChangemakerNominationsRow nomination={nomination} />
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
                    ? t("admin:adminChangemakerNominations.loadingMore")
                    : t("admin:adminChangemakerNominations.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>
    </AdminShell>
  );
}
