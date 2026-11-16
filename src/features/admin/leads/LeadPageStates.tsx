import { FiUsers } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { Button, SkeletonLine } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminEmptyState, AdminNotice, AdminPageHeader } from "../ui";
import { leadErrorKeyOf, leadErrorValuesOf } from "./leadErrors";
import styles from "./AdminLead.module.css";

// The lead page's states other than the lead itself. The page draws them
// inside one `AdminLeadFrame`, so the admin rail stays put while the body
// swaps from the outline to the lead, or to one of these.

/** The page's h1 for a state with no lead to name: the section's own title. */
function LeadStateHeader() {
  const { t } = useTranslation();
  return (
    <AdminPageHeader
      eyebrow={t("shared:adminNav.sections.communities")}
      title={t("admin:leads.title")}
    />
  );
}

/**
 * The lead is gone: deleted here, in another tab, or never there (a typo in
 * the link). It names that and offers the way back to the list. A retry
 * would get the same answer, so there is none.
 */
export function AdminLeadNotFound() {
  const { t } = useTranslation();
  return (
    <div className={styles.statePage}>
      <LeadStateHeader />
      <AdminEmptyState
        icon={FiUsers}
        title={t("admin:leads.page.notFound.title")}
        body={t("admin:leads.page.notFound.body")}
        action={
          <Button to={routes.adminLeads}>
            {t("admin:leads.page.backCta")}
          </Button>
        }
      />
    </div>
  );
}

/**
 * Any other failure to load the lead: the cause (the connection, the server
 * or the account's access) and a retry that names what it loads. While the
 * retry runs the button stays in place, says so and ignores presses.
 */
export function AdminLeadLoadError({
  error,
  isRetrying,
  onRetry,
}: {
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.statePage}>
      <LeadStateHeader />
      <AdminNotice
        tone="error"
        title={t("admin:leads.page.loadError.title")}
        action={
          <Button
            variant="ghost"
            size="sm"
            aria-disabled={isRetrying || undefined}
            onClick={() => {
              if (!isRetrying) onRetry();
            }}
          >
            {isRetrying
              ? t("shared:loadError.retryingCta")
              : t("admin:leads.page.loadError.retryCta")}
          </Button>
        }
      >
        {t(leadErrorKeyOf(error), leadErrorValuesOf(error))}
      </AdminNotice>
    </div>
  );
}

/** The lead page's outline while the lead loads: the header, then the
 *  details and history columns. */
export function AdminLeadSkeleton() {
  return (
    <div className={styles.skeletonPage} aria-busy="true">
      <div className={styles.skeletonHeader}>
        <SkeletonLine width="18%" height={14} />
        <SkeletonLine width="44%" height={36} />
        <SkeletonLine width="30%" height={16} />
      </div>
      <div className={styles.bodyFrame}>
        <div className={styles.skeletonBody}>
          <div className={styles.skeletonColumn}>
            <SkeletonLine width="32%" height={24} />
            <SkeletonLine height={48} />
            <SkeletonLine height={48} />
            <SkeletonLine height={48} />
          </div>
          <div className={styles.skeletonColumn}>
            <SkeletonLine width="32%" height={24} />
            <SkeletonLine height={96} />
            <SkeletonLine height={72} />
          </div>
        </div>
      </div>
    </div>
  );
}
