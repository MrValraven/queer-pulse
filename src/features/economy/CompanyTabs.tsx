import type { ReactNode } from "react";
import { FiBriefcase, FiPlus, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button, EmptyState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import type { CompanyProfile } from "./companies.data";
import type { Job } from "./jobs.data";
import styles from "./CompanyPage.module.css";

type TabId = "about" | "jobs" | "reviews" | "work";

function Stars({ n }: { n: number }) {
  return (
    <div className={styles.revStars} aria-label={`${n} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} fill={i < n ? "currentColor" : "none"} aria-hidden />
      ))}
    </div>
  );
}

function AboutPane({ profile }: { profile: CompanyProfile }) {
  return (
    <>
      <div className={styles.prose}>{profile.about}</div>
      <div className={styles.values}>
        {profile.values.map((v) => (
          <div key={v.title} className={styles.val}>
            <h4>{v.title}</h4>
            <p>{v.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function JobsPane({ jobs, postHref }: { jobs: Job[]; postHref: string }) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<FiBriefcase />}
        title="No open roles right now"
        description="This company isn't hiring on QueerPulse at the moment. Follow them from the top of the page to hear when a role opens."
        action={{ label: "Post a role", to: postHref }}
      />
    );
  }
  return (
    <div className={styles.jobs}>
      <div className={styles.jobsHead}>
        <Button variant="ghost" size="md" to={postHref}>
          <FiPlus aria-hidden /> Post a role
        </Button>
      </div>
      {jobs.map((job) => (
        <Link
          key={job.slug}
          to={`${routes.jobs}/${job.slug}`}
          className={styles.job}
        >
          <div>
            <h3>{job.title}</h3>
            <div className={styles.jobMeta}>
              <span>{job.type}</span>
              <span>{job.location}</span>
              <span className={styles.jade}>{job.salary}</span>
            </div>
          </div>
          <div className={styles.jobR}>
            <b>Apply by {job.deadline}</b>
            {job.detail.category}
          </div>
        </Link>
      ))}
    </div>
  );
}

function ReviewsPane({ profile }: { profile: CompanyProfile }) {
  return (
    <>
      <div className={styles.revSummary}>
        <div>
          <div className={styles.revScore}>
            <em>{profile.reviewScore}</em>
          </div>
          <div className={styles.revScoreOut}>
            / 5 · {profile.reviewCount} reviews
          </div>
        </div>
        <div className={styles.revBars}>
          {profile.reviewBars.map((bar) => (
            <div key={bar.label} className={styles.revBar}>
              <span>{bar.label}</span>
              <div className={styles.revBarTrack}>
                <span
                  className={styles.revBarFill}
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
              <span>
                <b>{bar.score}</b>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.revList}>
        {profile.reviews.map((rev) => (
          <div key={rev.title} className={styles.rev}>
            <div className={styles.revHead}>
              <div className={styles.revTitle}>{rev.title}</div>
              <Stars n={rev.stars} />
            </div>
            <div className={styles.revByline}>{rev.byline}</div>
            <div className={styles.revBody}>
              {rev.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function WorkPane({ work }: { work: NonNullable<CompanyProfile["work"]> }) {
  return (
    <>
      <div className={styles.prose}>
        <p>A small selection of recent projects from the studio.</p>
      </div>
      <div className={styles.workGrid}>
        {work.map((slot) => (
          <div key={slot.label} className={styles.workTile}>
            {slot.label}
          </div>
        ))}
      </div>
    </>
  );
}

export function CompanyTabs({
  profile,
  jobs,
  tab,
  setTab,
}: {
  profile: CompanyProfile;
  jobs: Job[];
  tab: TabId;
  setTab: (t: TabId) => void;
}) {
  const tabs: { id: TabId; label: string; badge?: ReactNode }[] = [
    { id: "about", label: "About" },
    {
      id: "jobs",
      label: "Jobs",
      badge: jobs.length > 0 && (
        <span className={styles.tabCount}>{jobs.length}</span>
      ),
    },
    {
      id: "reviews",
      label: "Reviews",
      badge: (
        <span className={styles.tabCountMuted}>{profile.reviewCount}</span>
      ),
    },
    ...(profile.work ? [{ id: "work" as const, label: "Work" }] : []),
  ];

  return (
    <main>
      <div className={styles.tabs} role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={[styles.tab, tab === t.id && styles.tabActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.badge}
          </button>
        ))}
      </div>

      {tab === "about" && <AboutPane profile={profile} />}
      {tab === "jobs" && (
        <JobsPane
          jobs={jobs}
          postHref={`${routes.postJob}?company=${profile.slug}`}
        />
      )}
      {tab === "reviews" && <ReviewsPane profile={profile} />}
      {tab === "work" && profile.work && <WorkPane work={profile.work} />}
    </main>
  );
}
