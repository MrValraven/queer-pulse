import { FiAlertCircle, FiInbox, FiLock } from "react-icons/fi";
import { Link } from "react-router-dom";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./JobApplicationsPage.module.css";

/** Title block: which listing these applications belong to, and how many are
 *  still waiting on the poster. */
export function JobApplicationsHeader({
  jobTitle,
  jobSlug,
  waitingCount,
  totalCount,
}: {
  jobTitle: string;
  jobSlug: string;
  waitingCount: number;
  totalCount: number;
}) {
  const { t } = useTranslation();
  return (
    <header className={styles.head}>
      <div className={styles.eyebrow}>
        {t("economy:jobApplications.eyebrow")}
      </div>
      <h1 className={styles.title}>{jobTitle}</h1>
      <p className={styles.sub}>
        {t("economy:jobApplications.countTotal", { count: totalCount })}{" "}
        {waitingCount > 0
          ? t("economy:jobApplications.countWaiting", { count: waitingCount })
          : t("economy:jobApplications.countWaitingNone")}
      </p>
      <p className={styles.notifyNote}>
        {t("economy:jobApplications.notifyNote")}
      </p>
      <Link className={styles.backLink} to={`${routes.jobs}/${jobSlug}`}>
        {t("economy:jobApplications.viewListing")}
      </Link>
    </header>
  );
}

export function JobApplicationsSkeleton() {
  return (
    <div className={styles.list} aria-busy="true">
      {Array.from({ length: 3 }).map((_, skeletonIndex) => (
        <div key={skeletonIndex} className={styles.card} aria-hidden>
          <SkeletonLine width={160} height={20} />
          <SkeletonLine width="70%" height={14} style={{ marginTop: 12 }} />
          <SkeletonLine width="45%" height={14} style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

export function JobApplicationsEmpty() {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiInbox />}
      title={t("economy:jobApplications.empty.title")}
      description={t("economy:jobApplications.empty.description")}
    />
  );
}

/**
 * The honest failure states. A 403 means the reader did not post this listing,
 * a 404 means the listing is gone, and anything else is a retryable fault. They
 * read differently because they mean different things, and telling someone
 * "something went wrong" when the real answer is "this is not your listing"
 * sends them round the same loop again.
 */
export function JobApplicationsError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const status = error instanceof ApiError ? error.status : null;

  if (status === 403) {
    return (
      <EmptyState
        icon={<FiLock />}
        title={t("economy:jobApplications.forbidden.title")}
        description={t("economy:jobApplications.forbidden.description")}
        action={{
          label: t("economy:jobApplications.forbidden.cta"),
          to: routes.jobs,
        }}
      />
    );
  }

  if (status === 404) {
    return (
      <EmptyState
        icon={<FiAlertCircle />}
        title={t("economy:jobApplications.missing.title")}
        description={t("economy:jobApplications.missing.description")}
        action={{
          label: t("economy:jobApplications.forbidden.cta"),
          to: routes.jobs,
        }}
      />
    );
  }

  return (
    <EmptyState
      icon={<FiAlertCircle />}
      title={t("economy:jobApplications.error.title")}
      description={t("economy:jobApplications.error.description")}
      action={{
        label: t("economy:jobApplications.error.retry"),
        onClick: onRetry,
      }}
    />
  );
}
