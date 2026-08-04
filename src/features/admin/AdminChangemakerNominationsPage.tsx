import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { useAdminChangemakerNominations } from "./api/useAdminChangemakerNominations";
import type { AdminChangemakerNominationDTO } from "./api/adminChangemakerNominations.api";
import styles from "./AdminSubmissionList.module.css";

function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function NominationRow({
  nomination,
}: {
  nomination: AdminChangemakerNominationDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const nominatorName =
    nomination.nominator?.name ??
    t("admin:adminChangemakerNominations.unknownMember");
  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{nomination.nomineeName}</span>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminChangemakerNominations.row.by", {
            name: nominatorName,
          })}
        </div>
        <div className={styles.rowDates}>
          {t("admin:adminChangemakerNominations.row.sent", {
            date: shortDate(fmt, nomination.createdAt),
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
          eyebrow={t("admin:adminChangemakerNominations.header.eyebrow")}
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
          <p className={styles.emptyLine}>
            {t("admin:adminChangemakerNominations.error")}
          </p>
        ) : nominations.length === 0 ? (
          <p className={styles.emptyLine}>
            {t("admin:adminChangemakerNominations.empty")}
          </p>
        ) : (
          <>
            <div className={styles.rows}>
              {nominations.map((nomination, index) => (
                <FadeIn key={nomination.id} delay={Math.min(index, 8) * 50}>
                  <NominationRow nomination={nomination} />
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
