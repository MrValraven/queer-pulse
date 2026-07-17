import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { usePostedJobs } from "../../app/providers/PostedJobsProvider";
import { JOBS } from "./jobs.data";
import { useJob } from "./api/useJob";
import { JobDetailSkeleton } from "./JobDetailSkeleton";
import { JobDetailHeader } from "./JobDetailHeader";
import { JobDetailBody } from "./JobDetailBody";
import { JobDetailSidebar } from "./JobDetailSidebar";
import styles from "./JobDetailPage.module.css";

export function JobDetailPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { postedJobs } = usePostedJobs();
  const jobQuery = useJob(slug);
  const [saved, setSaved] = useState(false);
  const simLoading = useSimulatedLoad();

  // Demo merges locally-posted jobs over the mock board; live reads the query.
  const job = demoMode
    ? (postedJobs.find((j) => j.slug === slug) ??
      JOBS.find((j) => j.slug === slug) ??
      null)
    : (jobQuery.data ?? null);
  const loading = demoMode ? simLoading : jobQuery.isLoading;

  if (loading) {
    return (
      <PageShell>
        <div className={styles.page}>
          <div className={styles.breadcrumb}>
            <Link to={routes.jobs}>
              {t("economy:jobDetail.breadcrumb.jobs")}
            </Link>
          </div>
          <JobDetailSkeleton />
        </div>
      </PageShell>
    );
  }

  if (!job) return <Navigate to={routes.jobs} replace />;

  const d = job.detail;
  // The full deadline: a locale-formatted date, or the "Open" chrome string
  // when the listing has no closing date.
  const deadlineFull = job.deadline
    ? fmt.date(job.deadline)
    : t("economy:jobs.card.deadlineOpen");

  const breadcrumb = (
    <div className={styles.breadcrumb}>
      <Link to={routes.jobs}>{t("economy:jobDetail.breadcrumb.jobs")}</Link>
      <span className={styles.bcSep}>›</span>
      <span>{d.category}</span>
      <span className={styles.bcSep}>›</span>
      <span className={styles.bcCurrent}>{job.title}</span>
    </div>
  );

  function toggleSave() {
    setSaved((s) => {
      showToast(
        t(
          s ? "economy:jobDetail.unsavedToast" : "economy:jobDetail.savedToast",
        ),
        "info",
      );
      return !s;
    });
  }

  return (
    <PageShell>
      <div className={styles.page}>
        {breadcrumb}

        <FadeIn>
          <JobDetailHeader
            job={job}
            deadlineFull={deadlineFull}
            saved={saved}
            onToggleSave={toggleSave}
          />

          <div className={styles.layout}>
            <JobDetailBody job={job} />
            <JobDetailSidebar job={job} deadlineFull={deadlineFull} />
          </div>
        </FadeIn>
      </div>
    </PageShell>
  );
}
