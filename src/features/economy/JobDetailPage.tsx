import { useState } from "react";
import { FaRainbow } from "react-icons/fa6";
import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { JOBS } from "./jobs.data";
import { safetyFor } from "./employerSafety.data";
import { SafetyBadges } from "./SafetyBadges";
import { JobApplyForm } from "./JobApplyForm";
import { JobDetailSkeleton } from "./JobDetailSkeleton";
import styles from "./JobDetailPage.module.css";

const SalaryIcon = () => (
  <svg viewBox="0 0 13 13">
    <circle cx="6.5" cy="6.5" r="5.5" />
    <path d="M6.5 3.5v6M4.5 5h3a1.5 1.5 0 0 1 0 3h-2" />
  </svg>
);
const TypeIcon = () => (
  <svg viewBox="0 0 13 13">
    <rect x="1" y="2" width="11" height="10" rx="2" />
    <line x1="1" y1="6" x2="12" y2="6" />
    <line x1="4" y1="1" x2="4" y2="3" />
    <line x1="9" y1="1" x2="9" y2="3" />
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 13 13">
    <path d="M6.5 1C4 1 2 3 2 5.5c0 3.5 4.5 7 4.5 7s4.5-3.5 4.5-7C11 3 9 1 6.5 1z" />
    <circle cx="6.5" cy="5.5" r="1.5" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 13 13">
    <circle cx="6.5" cy="6.5" r="5.5" />
    <path d="M6.5 3.5v3l2 2" />
  </svg>
);

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

  if (loading) {
    return (
      <PageShell>
        <div className={styles.page}>
          <div className={styles.breadcrumb}>
            <Link to={routes.jobs}>Jobs</Link>
            <span className={styles.bcSep}>›</span>
            <span>{d.category}</span>
            <span className={styles.bcSep}>›</span>
            <span className={styles.bcCurrent}>{job.title}</span>
          </div>
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
        <div className={styles.breadcrumb}>
          <Link to={routes.jobs}>Jobs</Link>
          <span className={styles.bcSep}>›</span>
          <span>{d.category}</span>
          <span className={styles.bcSep}>›</span>
          <span className={styles.bcCurrent}>{job.title}</span>
        </div>

        <FadeIn>
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <h1 className={styles.title}>{job.title}</h1>
              <button
                className={`${styles.save} ${saved ? styles.saved : ""}`}
                onClick={toggleSave}
                aria-pressed={saved}
                title="Save listing"
              >
                <svg viewBox="0 0 16 16">
                  <path d="M8 1.5l1.8 3.6 4 .58-2.9 2.82.68 3.98L8 10.4l-3.58 1.9.68-3.98L2.2 5.68l4-.58z" />
                </svg>
              </button>
            </div>
            <div className={styles.org}>
              {job.org}
              {job.qr && (
                <span className={styles.qrBadge}>
                  <FaRainbow /> {job.qrLabel}
                </span>
              )}
            </div>
            <div className={styles.chips}>
              <span className={`${styles.chip} ${styles.salary}`}>
                <SalaryIcon /> {job.salary}
              </span>
              <span className={styles.chip}>
                <TypeIcon /> {job.type}
              </span>
              <span className={styles.chip}>
                <PinIcon /> {job.location}
              </span>
              <span className={styles.chip}>
                <ClockIcon /> Apply by {deadlineFull}
              </span>
            </div>
          </div>

          <div className={styles.layout}>
            <div>
              <div className={styles.section}>
                <h2 className={styles.secTitle}>About the role</h2>
                {d.about.map((p, i) => (
                  <p key={i} className={styles.text}>
                    {p}
                  </p>
                ))}
              </div>

              <div className={styles.section}>
                <h2 className={styles.secTitle}>Day to day</h2>
                <div className={styles.list}>
                  {d.dayToDay.map((item) => (
                    <div key={item} className={styles.li}>
                      <div className={styles.liDot} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.secTitle}>What we're looking for</h2>
                <div className={styles.list}>
                  {d.lookingFor.map((item) => (
                    <div key={item} className={styles.li}>
                      <div className={`${styles.liDot} ${styles.jade}`} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.secTitle}>What we offer</h2>
                <div className={styles.list}>
                  {d.offer.map((item) => (
                    <div key={item} className={styles.li}>
                      <div className={styles.liDot} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.secTitle}>About {job.org}</h2>
                <p className={styles.text}>{d.aboutCompany}</p>
              </div>

              {safetyFor(job.org) && (
                <div className={styles.section}>
                  <h2 className={styles.secTitle}>Safety</h2>
                  <p className={styles.text}>
                    How {job.org} is rated by the community on the things that
                    matter to queer professionals.
                  </p>
                  <div className={styles.safetyBlock}>
                    <SafetyBadges signals={safetyFor(job.org)} />
                    <Button variant="ghost" to={routes.employerReviews}>
                      See safety reviews →
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.card}>
                <div
                  className={styles.logoFallback}
                  style={{ background: job.logoBg, color: job.logoText }}
                >
                  {job.logo}
                </div>
                <div className={styles.coName}>{job.org}</div>
                {job.qr && (
                  <div className={styles.coQr}>
                    <FaRainbow /> {job.qrLabel}
                  </div>
                )}

                <div className={styles.detailRow}>
                  <span className={styles.dl}>Salary</span>
                  <span className={`${styles.dv} ${styles.salary}`}>
                    {job.salary}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.dl}>Type</span>
                  <span className={styles.dv}>{job.type}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.dl}>Location</span>
                  <span className={styles.dv}>{job.location}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.dl}>Category</span>
                  <span className={styles.dv}>{d.category}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.dl}>Deadline</span>
                  <span className={styles.dv}>{deadlineFull}</span>
                </div>
                <div className={styles.posted}>{d.posted}</div>

                <JobApplyForm job={job} />
              </div>

              <div className={styles.noteCard}>
                <p>{d.reviewerNote}</p>
              </div>
            </aside>
          </div>
        </FadeIn>
      </div>
    </PageShell>
  );
}
