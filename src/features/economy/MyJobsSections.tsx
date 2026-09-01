import { FiBriefcase } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import {
  Badge,
  Button,
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { MyJobRow } from "./api/jobOwner.adapters";
import styles from "./MyJobsPage.module.css";

/**
 * One posting the member published, with everything they need to recognise it
 * and every route back into it: the public listing, the edit form that fixes a
 * wrong salary band, the applications console, and closing it for good.
 */
export function MyJobCard({
  job,
  isBusy,
  onClose,
}: {
  job: MyJobRow;
  isBusy: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isClosed = job.status === "closed";

  return (
    <FadeIn className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.org}>
          {job.organization || t("economy:myJobs.noOrganization")}
        </span>
        <Badge tone={isClosed ? "ghost" : "jade"}>
          {t(
            isClosed
              ? "economy:myJobs.status.closed"
              : "economy:myJobs.status.open",
          )}
        </Badge>
      </div>

      <h3 className={styles.cardTitle}>{job.title}</h3>

      <div className={styles.cardMeta}>
        <span>{job.commitment}</span>
        <span>{job.location}</span>
        <span>{job.payLabel}</span>
      </div>

      <p className={styles.cardHint}>
        {job.postedAt
          ? t("economy:myJobs.postedOn", { date: fmt.date(job.postedAt) })
          : t("economy:myJobs.postedRecently")}
        {isClosed ? ` · ${t("economy:myJobs.closedHint")}` : ""}
      </p>

      <div className={styles.cardActions}>
        <Button size="md" variant="ghost" to={`${routes.jobs}/${job.slug}`}>
          {t("economy:myJobs.actions.view")}
        </Button>
        <Button
          size="md"
          variant="ghost"
          to={`${routes.jobs}/${job.slug}/edit`}
        >
          {t("economy:myJobs.actions.edit")}
        </Button>
        <Button
          size="md"
          variant="ghost"
          to={`${routes.jobs}/${job.slug}/applications`}
        >
          {t("economy:myJobs.actions.applications")}
        </Button>
        {!isClosed && (
          <Button
            size="md"
            variant="danger"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isBusy}
          >
            {t("economy:myJobs.actions.close")}
          </Button>
        )}
      </div>
    </FadeIn>
  );
}

export function MyJobsSkeleton() {
  return (
    <div className={styles.list} aria-busy="true">
      {Array.from({ length: 3 }).map((_, skeletonIndex) => (
        <div key={skeletonIndex} className={styles.card} aria-hidden>
          <SkeletonLine width={90} height={20} />
          <SkeletonLine width="60%" height={22} style={{ marginTop: 10 }} />
          <SkeletonLine width="40%" height={14} style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

export function MyJobsEmpty() {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiBriefcase />}
      title={t("economy:myJobs.empty.title")}
      description={t("economy:myJobs.empty.description")}
      action={{
        label: t("economy:myJobs.empty.cta"),
        to: routes.postJob,
      }}
    />
  );
}
