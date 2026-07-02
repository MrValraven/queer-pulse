import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { FiBriefcase, FiBookmark, FiCheck, FiShield } from "react-icons/fi";
import { FaRainbow } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import {
  EmptyState,
  Reveal,
  SectionHead,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSaved } from "../../app/providers/SavedProvider";
import { routes } from "../../app/routeMap";
import { useWorkProfile } from "../../app/providers/WorkProfileProvider";
import { JOBS, JOB_FILTERS, EMPLOYERS, type Job } from "./jobs.data";
import { safetyFor } from "./employerSafety.data";
import { SafetyBadges } from "./SafetyBadges";
import { affiliationFromLabel } from "./safetyBadges.data";
import { PostJobModal } from "./PostJobModal";
import styles from "./JobsPage.module.css";

function JobCard({ job }: { job: Job }) {
  const { showToast } = useToast();
  const { isSaved, toggleSave } = useSaved();
  const [applied, setApplied] = useState(false);
  const savedId = `job:${job.slug}`;
  const saved = isSaved(savedId);

  function apply(e: SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (applied) return;
    setApplied(true);
    showToast(`Application started for ${job.title}`, "success");
  }

  function save(e: SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    const now = toggleSave({
      id: savedId,
      kind: "job",
      title: job.title,
      href: `${routes.jobs}/${job.slug}`,
      meta: `${job.org} · ${job.location}`,
      description: job.desc,
    });
    showToast(
      now ? `Saved ${job.title}` : `Removed ${job.title} from saved`,
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
        <div className={styles.org}>{job.org}</div>
        <div className={styles.tags}>
          {job.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <SafetyBadges
          signals={safetyFor(job.org)}
          affiliation={affiliationFromLabel(job.qr)}
          affiliationLabel={job.qrLabel}
          compact
        />
        <div className={styles.desc}>{job.desc}</div>
        <div className={styles.meta}>
          <span>{job.type}</span>
          <span className={styles.dot} />
          <span>{job.location}</span>
          <span className={styles.dot} />
          <span>Apply by {job.deadline}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <span
          role="button"
          tabIndex={0}
          aria-pressed={saved}
          aria-label={
            saved ? `Remove ${job.title} from saved` : `Save ${job.title}`
          }
          className={[styles.saveBtn, saved && styles.saveBtnOn]
            .filter(Boolean)
            .join(" ")}
          onClick={save}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") save(e);
          }}
        >
          <FiBookmark fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved" : "Save"}
        </span>
        <span
          role="button"
          tabIndex={0}
          aria-disabled={applied}
          className={[styles.apply, applied && styles.applyDone]
            .filter(Boolean)
            .join(" ")}
          onClick={apply}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") apply(e);
          }}
        >
          {applied ? (
            <>
              Applied <FiCheck />
            </>
          ) : (
            "Apply"
          )}
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
  const { safeOnly } = useWorkProfile();
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const byCat = useMemo(
    () => (filter === "all" ? JOBS : JOBS.filter((j) => j.cat === filter)),
    [filter],
  );
  const verifiedOnly = safeOnly && !showAll;
  const visible = useMemo(
    () =>
      verifiedOnly
        ? byCat.filter((j) => safetyFor(j.org)?.verifiedSafe)
        : byCat,
    [byCat, verifiedOnly],
  );
  const hiddenCount = byCat.length - visible.length;

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            Job Board
          </Reveal>
          <Reveal as="h1" delay={60}>
            Work that <em>doesn't ask you to hide.</em>
          </Reveal>
          <Reveal as="p" delay={120}>
            Queer-run businesses and verified queer-inclusive employers — jobs
            where you can show up as yourself. No rainbow capitalism. Every
            listing is vetted by the community.
          </Reveal>
          <Reveal className={styles.badges} delay={160}>
            <span className={styles.badge}>
              <FaRainbow /> Queer-run
            </span>
            <span className={styles.badge}>
              <FiCheck /> Community verified
            </span>
            <span className={styles.badge}>Lisbon + remote</span>
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
                  {f.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.postBtn}
              onClick={() => setPosting(true)}
            >
              + Post a job
            </button>
          </div>
          {safeOnly && (
            <div className={styles.safetyBanner}>
              <span className={styles.sbIcon} aria-hidden>
                <FiShield />
              </span>
              <span className={styles.sbText}>
                Matched to your work profile — showing{" "}
                <strong>verified-safe employers</strong>.{" "}
                <Link to={routes.workProfile} className={styles.sbLink}>
                  Change in your work profile
                </Link>
              </span>
              <button
                type="button"
                className={styles.sbToggle}
                onClick={() => setShowAll((s) => !s)}
              >
                {showAll
                  ? "Show verified only"
                  : `Show all${hiddenCount ? ` (${hiddenCount} more)` : ""}`}
              </button>
            </div>
          )}
          <div className={styles.list}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <JobSkeleton key={i} />)
            ) : visible.length === 0 ? (
              <EmptyState
                icon={<FiBriefcase />}
                title="No roles match right now"
                description={
                  verifiedOnly
                    ? "Nothing in this category is verified-safe yet. Show all roles, or pick a different category."
                    : "No openings in this category at the moment. Browse every role, or check back soon — listings are added weekly."
                }
                action={
                  verifiedOnly
                    ? {
                        label: "Show all roles",
                        onClick: () => setShowAll(true),
                      }
                    : {
                        label: "Show all roles",
                        onClick: () => setFilter("all"),
                      }
                }
                secondaryAction={
                  filter !== "all"
                    ? {
                        label: "Clear category",
                        onClick: () => setFilter("all"),
                      }
                    : undefined
                }
              />
            ) : (
              visible.map((job) => <JobCard key={job.slug} job={job} />)
            )}
          </div>
        </div>
      </div>

      <section className={styles.employers}>
        <div className="wrap">
          <SectionHead
            title={
              <>
                Queer-run employers <em>we trust</em>
              </>
            }
            subtitle="These organisations are run by or for the queer community. Working here means your money stays in the network."
          />
          <div className={styles.empGrid}>
            {EMPLOYERS.map((emp) => (
              <div key={emp.name} className={styles.empCard}>
                <div
                  className={styles.empLogo}
                  style={{ background: emp.bg, color: emp.text }}
                >
                  {emp.logo}
                </div>
                <div className={styles.empName}>{emp.name}</div>
                <div className={styles.empType}>{emp.type}</div>
                <span
                  className={styles.empBadge}
                  style={{ background: emp.badgeBg, color: emp.badgeText }}
                >
                  {emp.qr ? (
                    <>
                      <FaRainbow />{" "}
                    </>
                  ) : (
                    ""
                  )}
                  {emp.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {posting && <PostJobModal onClose={() => setPosting(false)} />}
    </PageShell>
  );
}
