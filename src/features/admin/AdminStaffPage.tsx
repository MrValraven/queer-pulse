import { useMemo } from "react";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPageHeader } from "./ui";
import { routes } from "../../app/routeMap";
import { ApiError } from "../../shared/api/client";
import {
  useAdminStaffRoleHolders,
  useAdminStaffRoster,
} from "./api/useAdminStaffRoster";
import { AdminStaffRows, type StaffRosterRow } from "./AdminStaffRows";
import styles from "./AdminStaffPage.module.css";

/**
 * `/admin/staff` — every moderator, admin and staff-grant holder on the
 * platform, in one place.
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
  const { data: grantHolders } = useAdminStaffRoleHolders();

  const forbidden =
    isError && error instanceof ApiError && error.status === 403;

  // One list: the account tiers from the platform roster, each carrying the
  // additive grants that person holds, plus every grant holder who is on the
  // ordinary member tier and so appears on no roster of their own (OPS-03).
  // The grants query failing degrades to tiers alone rather than emptying the
  // page.
  const staff = useMemo<StaffRosterRow[]>(() => {
    const holders = grantHolders ?? [];
    const grantsBySlug = new Map(
      holders.map((holder) => [holder.slug, holder.staffRoles]),
    );
    const rosterSlugs = new Set((data ?? []).map((member) => member.slug));
    return [
      ...(data ?? []).map((member) => ({
        slug: member.slug,
        firstName: member.firstName,
        lastName: member.lastName,
        // The roster sends null for someone on the ordinary member tier who is
        // there for their grants alone; this page has a label for that tier.
        platformRole: member.platformRole ?? ("member" as const),
        // Prefer the admin grants endpoint, which carries EVERY grant a person
        // holds; the roster row only carries the ones that earn a public badge.
        // Falling back to those keeps the page truthful when that query fails.
        staffRoles: grantsBySlug.get(member.slug) ?? member.badgedStaffRoles,
      })),
      ...holders
        .filter((holder) => !rosterSlugs.has(holder.slug))
        .map((holder) => ({
          slug: holder.slug,
          firstName: holder.firstName,
          lastName: holder.lastName,
          platformRole: holder.platformRole,
          staffRoles: holder.staffRoles,
        })),
    ];
  }, [data, grantHolders]);

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
