import { FadeIn, LoadErrorState } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { AdminPageHeader } from "./ui";
import { useAdminStaffRosterRows } from "./api/useAdminStaffRoster";
import { AdminMemberDrawer } from "./AdminMemberDrawer";
import { AdminMemberCardLoadingDrawer } from "./AdminMemberCardSelection";
import { useAdminMemberCardSelection } from "./useAdminMemberCardSelection";
import { hasFailedWithoutData, isRetryingFailedRead } from "./queryLoadFailure";
import { AdminStaffBoard } from "./AdminStaffBoard";
import { AdminStaffSkeleton } from "./AdminStaffSkeleton";
import styles from "./AdminStaffPage.module.css";

/**
 * `/admin/staff`: every admin, moderator and staff-grant holder on the
 * platform, with a coverage view of which grants somebody can act on today.
 *
 * Reads one admin roster (`useAdminStaffRosterRows`), which already carries
 * each person's photo, account status and every grant with its date. Manage
 * opens the same member drawer the members console uses, here on this page,
 * so a tier or grant change keeps its confirmation and audit trail.
 */
export function AdminStaffPage() {
  const { t } = useTranslation();
  const rosterQuery = useAdminStaffRosterRows();
  const { memberCard, isPending, selectMember, clearSelection } =
    useAdminMemberCardSelection();

  const isForbidden =
    rosterQuery.error instanceof ApiError && rosterQuery.error.status === 403;
  const rows = rosterQuery.data;

  const renderBody = () => {
    if (hasFailedWithoutData(rosterQuery)) {
      return (
        <LoadErrorState
          headingLevel={2}
          compact
          title={
            isForbidden
              ? t("admin:common.panelForbidden")
              : t("admin:staff.loadError")
          }
          isRetrying={isRetryingFailedRead(rosterQuery)}
          onRetry={isForbidden ? undefined : () => void rosterQuery.refetch()}
        />
      );
    }
    if (rows === undefined) return <AdminStaffSkeleton />;
    if (rows.length === 0) {
      return (
        <div className={styles.notice}>
          <p className={styles.noticeText}>{t("admin:staff.empty")}</p>
        </div>
      );
    }
    return <AdminStaffBoard rows={rows} onManage={selectMember} />;
  };

  return (
    <AdminShell
      title={
        <Translation i18nKey="admin:staff.title" components={{ em: <em /> }} />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:staff.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:staff.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:staff.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={80}>{renderBody()}</FadeIn>

      {memberCard && (
        <AdminMemberDrawer member={memberCard} onClose={clearSelection} />
      )}
      {!memberCard && isPending && (
        <AdminMemberCardLoadingDrawer onClose={clearSelection} />
      )}
    </AdminShell>
  );
}
