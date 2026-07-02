import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { JOBS } from "./jobs.data";
import { JobDetailSkeleton } from "./JobDetailSkeleton";
import { JobDetailHeader } from "./JobDetailHeader";
import { JobDetailBody } from "./JobDetailBody";
import { JobDetailSidebar } from "./JobDetailSidebar";
import styles from "./JobDetailPage.module.css";

export function JobDetailPage() {
  const { slug } = useParams();
  const { showToast } = useToast();
  const [saved, setSaved] = useState(false);
  const loading = useSimulatedLoad();

  const job = JOBS.find((j) => j.slug === slug);
  if (!job) return <Navigate to={routes.jobs} replace />;

  const d = job.detail;
  const deadlineFull =
    job.deadline === "Open" ? "Open" : `${job.deadline} 2026`;

  const breadcrumb = (
    <div className={styles.breadcrumb}>
      <Link to={routes.jobs}>Jobs</Link>
      <span className={styles.bcSep}>›</span>
      <span>{d.category}</span>
      <span className={styles.bcSep}>›</span>
      <span className={styles.bcCurrent}>{job.title}</span>
    </div>
  );

  if (loading) {
    return (
      <PageShell>
        <div className={styles.page}>
          {breadcrumb}
          <JobDetailSkeleton />
        </div>
      </PageShell>
    );
  }

  function toggleSave() {
    setSaved((s) => {
      showToast(
        s ? "Listing removed from saved." : "Listing saved to your profile.",
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
