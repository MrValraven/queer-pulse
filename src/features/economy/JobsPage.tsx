import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { FiBriefcase, FiBookmark, FiCheck, FiShield } from "react-icons/fi";
import { FaRainbow } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  Reveal,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { deadlineText } from "./api/jobs.adapters";
import { useSaved } from "../../app/providers/SavedProvider";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { useWorkProfile } from "../../app/providers/WorkProfileProvider";
import { usePostedJobs } from "../../app/providers/PostedJobsProvider";
import { JOBS, JOB_FILTERS, type Job } from "./jobs.data";
import { useJobs } from "./api/useJobs";
import { JobsEmployers } from "./JobsEmployers";
import { safetyFor } from "./employerSafety.data";
import { SafetyBadges } from "./SafetyBadges";
import { affiliationFromLabel } from "./safetyBadges.data";
import styles from "./JobsPage.module.css";

function JobCard({ job }: { job: Job }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { isSaved, toggleSave } = useSaved();
  const navigate = useNavigate();
  const savedId = `job:${job.slug}`;
  const saved = isSaved(savedId);

  function apply(e: SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigate(`${routes.jobs}/${job.slug}/apply`);
  }

  function save(e: SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    const now = toggleSave({
      id: savedId,
      kind: "job",
      title: job.title,
      href: `${routes.jobs}/${job.slug}`,
      meta: `${job.organization} · ${job.location}`,
      description: job.description,
    });
    showToast(
      t(
        now ? "economy:jobs.card.savedToast" : "economy:jobs.card.unsavedToast",
        { title: job.title },
      ),
      "success",
    );
  }

  return (
    <Link to={`${routes.jobs}/${job.slug}`} className={styles.card}>
      <div
        className={styles.logo}
        style={{ background: job.logoBg, color: job.logoText }}
      >
        {job.logo}
      </div>
      <div className={styles.cBody}>
        <div className={styles.cHead}>
          <div className={styles.title}>{job.title}</div>
          <div className={styles.salary}>{job.salary}</div>
        </div>
        <div className={styles.org}>{job.organization}</div>
        <div className={styles.tags}>
          {job.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <SafetyBadges
          signals={safetyFor(job.organization)}
          affiliation={affiliationFromLabel(job.qr)}
          affiliationLabel={job.qrLabel}
          compact
        />
        <div className={styles.desc}>{job.description}</div>
        <div className={styles.meta}>
          <span>{job.type}</span>
          <span className={styles.dot} />
          <span>{job.location}</span>
          <span className={styles.dot} />
          <span>
            {t("economy:jobs.card.applyBy", {
              date: deadlineText(job.deadline, t, fmt),
            })}
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        <span
          role="button"
          tabIndex={0}
          aria-pressed={saved}
          aria-label={t(
            saved
              ? "economy:jobs.card.unsaveAriaLabel"
              : "economy:jobs.card.saveAriaLabel",
            { title: job.title },
          )}
          className={[styles.saveBtn, saved && styles.saveBtnOn]
            .filter(Boolean)
            .join(" ")}
          onClick={save}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") save(e);
          }}
        >
          <FiBookmark fill={saved ? "currentColor" : "none"} />
          {t(saved ? "economy:jobs.card.saved" : "economy:jobs.card.save")}
        </span>
        <span
          role="button"
          tabIndex={0}
          aria-label={t("economy:jobs.card.applyAriaLabel", {
            title: job.title,
          })}
          className={styles.apply}
          onClick={apply}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") apply(e);
          }}
        >
          {t("economy:jobs.card.applyCta")}
        </span>
      </div>
    </Link>
  );
}

function JobSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine width={48} height={48} style={{ borderRadius: 12 }} />
      <div className={styles.cBody} style={{ flex: 1 }}>
        <SkeletonLine width="55%" height={18} />
        <SkeletonLine width="35%" height={13} style={{ marginTop: 10 }} />
        <SkeletonLine width="90%" height={13} style={{ marginTop: 12 }} />
        <SkeletonLine width="45%" height={12} style={{ marginTop: 12 }} />
      </div>
    </div>
  );
}

export function JobsPage() {
  const { t } = useTranslation();
  const { safeOnly } = useWorkProfile();
  const { postedJobs } = usePostedJobs();
  const { demoMode } = useDemoMode();
  const {
    jobs: liveJobs,
    isLoading: jobsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useJobs();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLocalLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Demo keeps its own posted-jobs merge + timed skeleton; live reads the query.
  const loading = demoMode ? localLoading : jobsLoading;
  const allJobs = useMemo(
    () => (demoMode ? [...postedJobs, ...JOBS] : liveJobs),
    [demoMode, postedJobs, liveJobs],
  );
  const byCat = useMemo(
    () =>
      filter === "all" ? allJobs : allJobs.filter((j) => j.category === filter),
    [filter, allJobs],
  );
  const verifiedOnly = safeOnly && !showAll;
  const visible = useMemo(
    () =>
      verifiedOnly
        ? byCat.filter((j) => safetyFor(j.organization)?.verifiedSafe)
        : byCat,
    [byCat, verifiedOnly],
  );
  const hiddenCount = byCat.length - visible.length;

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            {t("economy:jobs.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            <Translation
              i18nKey="economy:jobs.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" delay={120}>
            {t("economy:jobs.lead")}
          </Reveal>
          <Reveal className={styles.badges} delay={160}>
            <span className={styles.badge}>
              <FaRainbow /> {t("economy:jobs.badge.queerRun")}
            </span>
            <span className={styles.badge}>
              <FiCheck /> {t("economy:jobs.badge.verified")}
            </span>
            <span className={styles.badge}>
              {t("economy:jobs.badge.location")}
            </span>
          </Reveal>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.top}>
            <div className={styles.filters}>
              {JOB_FILTERS.map((f) => (
                <button
                  type="button"
                  key={f.value}
                  className={[
                    styles.chip,
                    filter === f.value && styles.chipActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setFilter(f.value)}
                >
                  {t(f.labelKey)}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.postBtn}
              onClick={() => navigate(routes.postJob)}
            >
              {t("economy:jobs.postCta")}
            </button>
          </div>
          {safeOnly && (
            <div className={styles.safetyBanner}>
              <span className={styles.sbIcon} aria-hidden>
                <FiShield />
              </span>
              <span className={styles.sbText}>
                <Translation
                  i18nKey="economy:jobs.safetyBanner.text"
                  components={{ strong: <strong /> }}
                />{" "}
                <Link to={routes.workProfile} className={styles.sbLink}>
                  {t("economy:jobs.safetyBanner.link")}
                </Link>
              </span>
              <button
                type="button"
                className={styles.sbToggle}
                onClick={() => setShowAll((s) => !s)}
              >
                {showAll
                  ? t("economy:jobs.safetyBanner.showVerified")
                  : hiddenCount
                    ? t("economy:jobs.safetyBanner.showAllCount", {
                        count: hiddenCount,
                      })
                    : t("economy:jobs.safetyBanner.showAll")}
              </button>
            </div>
          )}
          <div className={styles.list}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <JobSkeleton key={i} />)
            ) : visible.length === 0 ? (
              <EmptyState
                icon={<FiBriefcase />}
                title={t("economy:jobs.empty.title")}
                description={t(
                  verifiedOnly
                    ? "economy:jobs.empty.verifiedDescription"
                    : "economy:jobs.empty.description",
                )}
                action={{
                  label: t("economy:jobs.empty.showAll"),
                  onClick: () =>
                    verifiedOnly ? setShowAll(true) : setFilter("all"),
                }}
                secondaryAction={
                  filter !== "all"
                    ? {
                        label: t("economy:jobs.empty.clearCategory"),
                        onClick: () => setFilter("all"),
                      }
                    : undefined
                }
              />
            ) : (
              visible.map((job) => <JobCard key={job.slug} job={job} />)
            )}
          </div>
          {hasNextPage && (
            <div className={styles.loadMore}>
              <Button
                type="button"
                variant="ghost"
                disabled={isFetchingNextPage}
                onClick={fetchNextPage}
              >
                {isFetchingNextPage
                  ? t("economy:jobs.loadingMore")
                  : t("economy:jobs.loadMoreCta")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <JobsEmployers />
    </PageShell>
  );
}
