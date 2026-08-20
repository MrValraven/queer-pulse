import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPageHeader } from "./ui";
import { routes } from "../../app/routeMap";
import { ApiError } from "../../shared/api/client";
import { useAdminStaffRoster } from "./api/useAdminStaffRoster";
import { AdminStaffRows } from "./AdminStaffRows";
import styles from "./AdminStaffPage.module.css";

/**
 * `/admin/staff` — every moderator and admin on the platform, in one place.
 * Before this page, seeing who holds staff access meant paging through the
 * full member directory. Reads `GET /platform/staff` directly (the same
 * roster the member-facing `StaffBadge` already uses) rather than the
 * paginated member list, since the whole point is a roster small enough to
 * see at a glance. Read-only — role changes stay on each member's own admin
 * drawer (`AdminMemberRoleControl`), where the confirmation + audit-trail
 * machinery already lives.
 */
export function AdminStaffPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error } = useAdminStaffRoster();

  const forbidden =
    isError && error instanceof ApiError && error.status === 403;
  const staff = data ?? [];

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

      {isLoading ? (
        <div className={styles.rows}>
          {[0, 1, 2].map((skeletonIndex) => (
            <SkeletonLine
              key={skeletonIndex}
              height={64}
              style={{ borderRadius: 14 }}
            />
          ))}
        </div>
      ) : isError ? (
        <div className={styles.notice}>
          <p className={styles.noticeText}>
            {forbidden
              ? t("admin:common.panelForbidden")
              : t("admin:staff.loadError")}
          </p>
        </div>
      ) : staff.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>{t("admin:staff.empty")}</p>
        </div>
      ) : (
        <AdminStaffRows staff={staff} />
      )}
    </AdminShell>
  );
}
