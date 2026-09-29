import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { FiArrowRight, FiBookmark, FiCheck, FiShield } from "react-icons/fi";
import { FaRainbow } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import {
  LoadErrorState,
  Reveal,
  SkeletonLine,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { activateOnKey } from "../../shared/lib/activateOnKey";
import { deadlineText, jobFieldFilterQuery } from "./api/jobs.adapters";
import { useSaved } from "../../app/providers/useSaved";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { useWorkProfile } from "../../app/providers/useWorkProfile";
import { usePostedJobs } from "../../app/providers/usePostedJobs";
import { JOBS, type Job } from "./jobs.data";
import { JobFieldFilter, type JobFieldFilterValue } from "./JobFieldFilter";
import { useJobs } from "./api/useJobs";
import { useMyJobs } from "./api/jobOwner.hooks";
import { JobsEmployers } from "./JobsEmployers";
import { JobsEmptyState } from "./JobsEmptyState";
import { JobsLoadMore } from "./JobsLoadMore";
import { jobFieldLabel } from "./postJob.data";
import { safetyFor } from "./employerSafety.data";
import { SafetyBadges } from "./SafetyBadges";
import { affiliationFromLabel } from "./safetyBadges.data";
import styles from "./JobsPage.module.css";

const NO_FIELD_FILTER: JobFieldFilterValue = { groupId: null, fieldId: null };

function JobCard({ job }: { job: Job }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { isSaved, toggleSave } = useSaved();
  const navigate = useNavigate();
  const savedId = `job:${job.slug}`;
  const saved = isSaved(savedId);
  const fieldLabel = job.category
    ? jobFieldLabel(job.category, job.profession ?? "", t)
    : "";

  function apply(e: SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    void navigate(`${routes.jobs}/${job.slug}/apply`);
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
          {fieldLabel && <span>{fieldLabel}</span>}
          {fieldLabel && <span className={styles.dot} />}
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
          onKeyDown={(e) => activateOnKey(e, () => save(e))}
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
          onKeyDown={(e) => activateOnKey(e, () => apply(e))}
        >
          {t("economy:jobs.card.applyCta")} <FiArrowRight aria-hidden />
        </span>
      </div>
    </Link>
  );
}

/** "Show all (N more)": the hidden count rolls as the category changes. */
function ShowAllCount({ count }: { count: number }) {
  const fmt = useFormat();
  return (
    <Translation
      i18nKey="economy:jobs.safetyBanner.showAllCount"
      values={{ count }}
      slots={{
        count: <RollingNumber value={fmt.number(count)} numericValue={count} />,
      }}
    />
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
  const [fieldFilter, setFieldFilter] = useState(NO_FIELD_FILTER);
  const { fieldIds: selectedFieldIds, params: jobsQueryParams } = useMemo(
    () => jobFieldFilterQuery(fieldFilter),
    [fieldFilter],
  );
  const {
    jobs: liveJobs,
    isLoading: jobsLoading,
    isError: hasJobsError,
    refetch: refetchJobs,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useJobs(jobsQueryParams);
  // PRD-44: a poster had no index of what they published. The board is where
  // they come looking, so the way in sits next to the post button, and only
  // for someone who actually has a posting to manage.
  const { rows: myPostedJobs } = useMyJobs();
  const navigate = useNavigate();
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
  // Live pages arrive already narrowed by `cat`: per the rule "server-narrowed
  // results must not be client-filtered", only the demo list filters here.
  const byCat = useMemo(
    () =>
      demoMode && selectedFieldIds.length
        ? allJobs.filter((job) => selectedFieldIds.includes(job.category ?? ""))
        : allJobs,
    [demoMode, selectedFieldIds, allJobs],
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
      <header className={styles.hero} data-plum>
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
      </header>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.top}>
            <JobFieldFilter
              groupId={fieldFilter.groupId}
              fieldId={fieldFilter.fieldId}
              onChange={setFieldFilter}
            />
            <div className={styles.topActions}>
              {myPostedJobs.length > 0 && (
                <Link to={routes.myJobs} className={styles.myJobsLink}>
                  {t("economy:myJobs.entryLink")}
                </Link>
              )}
              <button
                type="button"
                className={styles.postBtn}
                onClick={() => void navigate(routes.postJob)}
              >
                {t("economy:jobs.postCta")}
              </button>
            </div>
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
                {showAll ? (
                  t("economy:jobs.safetyBanner.showVerified")
                ) : hiddenCount ? (
                  <ShowAllCount count={hiddenCount} />
                ) : (
                  t("economy:jobs.safetyBanner.showAll")
                )}
              </button>
            </div>
          )}
          <div className={styles.list}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <JobSkeleton key={i} />)
            ) : hasJobsError ? (
              // The board is this page's main content, so a failed fetch says
              // it could not load (DES-22).
              <LoadErrorState
                title={t("economy:jobs.loadError.title")}
                description={t("economy:jobs.loadError.description")}
                onRetry={refetchJobs}
              />
            ) : visible.length === 0 ? (
              <JobsEmptyState
                isVerifiedOnly={verifiedOnly}
                fieldFilter={fieldFilter}
                onShowUnverified={() => setShowAll(true)}
                onFieldFilterChange={setFieldFilter}
              />
            ) : (
              visible.map((job) => <JobCard key={job.slug} job={job} />)
            )}
          </div>
          {hasNextPage && (
            // A failed next page keeps the loaded list above; only this footer
            // reports it, and its button retries.
            <JobsLoadMore
              isFetchingNextPage={isFetchingNextPage}
              isFetchNextPageError={isFetchNextPageError}
              onLoadMore={fetchNextPage}
            />
          )}
        </div>
      </div>

      <JobsEmployers />
    </PageShell>
  );
}
