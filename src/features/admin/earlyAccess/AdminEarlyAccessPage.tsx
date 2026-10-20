import { FiZap } from "react-icons/fi";
import {
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../../shared/components/ui";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { AdminPageHeader } from "../ui";
import { useEarlyAccessFeatures } from "../api/useAdminEarlyAccess";
import {
  AdminEarlyAccessLoadFailed,
  AdminEarlyAccessRosterSection,
  AdminEarlyAccessRowsSkeleton,
} from "./AdminEarlyAccessRosterSection";
import styles from "./AdminEarlyAccessPage.module.css";

/** One section in outline: the heading line, then the rows. */
function PageSkeleton() {
  return (
    <div className={styles.section} aria-hidden>
      <SkeletonLine width={200} height={22} />
      <SkeletonLine width="50%" height={12} />
      <AdminEarlyAccessRowsSkeleton />
    </div>
  );
}

/**
 * `/admin/early-access`: who holds early access to each feature that has not
 * launched yet, one section per feature, with Revoke on every member.
 * Moderators and admins can open it (`@Roles(Moderator, Admin)`); granting
 * happens in the admin-only member drawer, which the subtitle says.
 */
export function AdminEarlyAccessPage() {
  const { t } = useTranslation();
  const features = useEarlyAccessFeatures();
  // A retry on a never-loaded failed query resets it to pending, so the
  // error branch reads errorUpdateCount and stays mounted while it runs.
  const hasLoadFailed =
    features.data === undefined && features.errorUpdateCount > 0;
  const isRetrying = hasLoadFailed && features.isFetching;
  const featureList = features.data?.features ?? [];

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:earlyAccess.page.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("shared:adminNav.sections.people")}
          title={
            <Translation
              i18nKey="admin:earlyAccess.page.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:earlyAccess.page.subtitle")}
        />
      </FadeIn>

      {hasLoadFailed ? (
        <AdminEarlyAccessLoadFailed
          isRetrying={isRetrying}
          onRetry={() => void features.refetch()}
        />
      ) : features.data === undefined ? (
        <PageSkeleton />
      ) : featureList.length === 0 ? (
        <EmptyState
          compact
          headingLevel={2}
          icon={<FiZap aria-hidden />}
          title={t("admin:earlyAccess.page.empty")}
        />
      ) : (
        <FadeIn>
          <div className={styles.sections}>
            {featureList.map((feature) => (
              <AdminEarlyAccessRosterSection
                key={feature.featureKey}
                featureKey={feature.featureKey}
                grantCount={feature.grantCount}
              />
            ))}
          </div>
        </FadeIn>
      )}
    </AdminShell>
  );
}
