import { useState } from "react";
import { FaRainbow } from "react-icons/fa6";
import { FiArrowRight, FiShare2, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import type { Job } from "./jobs.data";
import { postedText } from "./api/jobs.adapters";
import { COMPANY_SLUG_BY_NAME } from "./companies.data";
import { ReportSubjectControl } from "../safety/ReportSubjectControl";
import { ShareToCommunityModal } from "./ShareToCommunityModal";
import styles from "./JobDetailPage.module.css";

/** Absolute link back to a job, for the body of a shared community post. */
function jobUrl(slug: string): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}${routes.jobs}/${slug}`;
}

export function JobDetailSidebar({
  job,
  deadlineFull,
  isPoster,
}: {
  job: Job;
  deadlineFull: string;
  /** True when the reader posted this listing. Unlocks the applications
   *  console, which the backend gates to the poster anyway. */
  isPoster: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [isSharing, setIsSharing] = useState(false);
  const d = job.detail;
  const companySlug = COMPANY_SLUG_BY_NAME[job.organization];
  return (
    <aside className={styles.sidebar}>
      <div className={styles.card}>
        <div
          className={styles.logoFallback}
          style={{ background: job.logoBg, color: job.logoText }}
        >
          {job.logo}
        </div>
        <div className={styles.coName}>
          {companySlug ? (
            <Link to={`${routes.company}/${companySlug}`}>
              {job.organization}
            </Link>
          ) : (
            job.organization
          )}
        </div>
        {job.qr && (
          <div className={styles.coQr}>
            <FaRainbow /> {job.qrLabel}
          </div>
        )}

        <div className={styles.detailRow}>
          <span className={styles.dl}>
            {t("economy:jobDetail.sidebar.salary")}
          </span>
          <span className={`${styles.dv} ${styles.salary}`}>{job.salary}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.dl}>
            {t("economy:jobDetail.sidebar.type")}
          </span>
          <span className={styles.dv}>{job.type}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.dl}>
            {t("economy:jobDetail.sidebar.location")}
          </span>
          <span className={styles.dv}>{job.location}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.dl}>
            {t("economy:jobDetail.sidebar.category")}
          </span>
          <span className={styles.dv}>{d.category}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.dl}>
            {t("economy:jobDetail.sidebar.deadline")}
          </span>
          <span className={styles.dv}>{deadlineFull}</span>
        </div>
        <div className={styles.posted}>{postedText(d.posted, t, fmt)}</div>

        <div className={styles.applyWrap}>
          {isPoster ? (
            <Button
              variant="primary"
              to={`${routes.jobs}/${job.slug}/applications`}
              style={{ width: "100%", justifyContent: "center" }}
            >
              <FiUsers aria-hidden />{" "}
              {t("economy:jobDetail.sidebar.reviewApplicationsCta")}
            </Button>
          ) : (
            <Button
              variant="primary"
              to={`${routes.jobs}/${job.slug}/apply`}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {t("economy:jobDetail.sidebar.applyCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          )}
          {/* Shares as a COMMUNITY POST, so the item lands in a room with a
              moderation owner and reaches the feed through the existing
              read-time aggregation. There is no standalone feed post. */}
          <Button
            variant="ghost"
            onClick={() => setIsSharing(true)}
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            <FiShare2 aria-hidden />{" "}
            {t("economy:jobDetail.sidebar.shareToCommunityCta")}
          </Button>
        </div>
      </div>

      {isSharing && (
        <ShareToCommunityModal
          title={job.title}
          organization={job.organization}
          url={jobUrl(job.slug)}
          onClose={() => setIsSharing(false)}
        />
      )}

      <div className={styles.noteCard}>
        <p>{d.reviewerNote}</p>
      </div>

      <ReportSubjectControl
        subjectType="job"
        subjectId={job.slug}
        subjectName={job.title}
        label={t("economy:jobDetail.report.cta")}
        ariaLabel={t("economy:jobDetail.report.ariaLabel", {
          name: job.title,
        })}
      />
    </aside>
  );
}
