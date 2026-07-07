import { useMemo, useState } from "react";
import { FiBriefcase } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { usePostedJobs } from "../../app/providers/PostedJobsProvider";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { COMPANY_PROFILES, type CompanyReview } from "./companies.data";
import { JOBS } from "./jobs.data";
import { useCompany } from "./api/useCompany";
import { useCompanyReviews } from "./api/useCompanyReviews";
import { CompanyCover } from "./CompanyCover";
import { CompanyTabs } from "./CompanyTabs";
import { CompanySidebar } from "./CompanySidebar";
import { CompanyReviewModal } from "./CompanyReviewModal";
import styles from "./CompanyPage.module.css";

type TabId = "about" | "jobs" | "reviews" | "work";

export function CompanyPage() {
  const { slug = "" } = useParams();
  const { demoMode } = useDemoMode();
  const { postedJobs } = usePostedJobs();
  const companyQuery = useCompany(slug);
  const [tab, setTab] = useState<TabId>("about");
  const [writing, setWriting] = useState(false);
  const [addedReviews, setAddedReviews] = useState<CompanyReview[]>([]);

  const profile = demoMode
    ? (COMPANY_PROFILES[slug] ?? null)
    : (companyQuery.data?.profile ?? null);
  // Live supplies the company's open roles; demo computes them locally.
  const apiOpenRoles = companyQuery.data?.openRoles ?? null;
  const loading = demoMode ? false : companyQuery.isLoading;

  const reviewsQuery = useCompanyReviews(slug, { enabled: tab === "reviews" });

  const jobs = useMemo(() => {
    if (!profile) return [];
    if (apiOpenRoles) return apiOpenRoles;
    return [...postedJobs, ...JOBS].filter((j) => j.org === profile.nameText);
  }, [profile, apiOpenRoles, postedJobs]);

  const baseReviews = demoMode
    ? (profile?.reviews ?? [])
    : (reviewsQuery.data ?? []);
  const reviews = [...addedReviews, ...baseReviews];
  const reviewCount = (profile?.reviewCount ?? 0) + addedReviews.length;

  if (loading) {
    return (
      <PageShell>
        <div className={styles.body}>
          <SkeletonLine width="45%" height={36} />
          <SkeletonLine width="80%" height={16} style={{ marginTop: 16 }} />
          <SkeletonLine width="70%" height={16} style={{ marginTop: 10 }} />
        </div>
      </PageShell>
    );
  }

  if (!profile) {
    return (
      <PageShell>
        <div className={styles.body}>
          <EmptyState
            icon={<FiBriefcase />}
            title="Company not found"
            description="This company profile doesn't exist or has been taken down. Browse the job board to find queer-run and verified-inclusive employers."
            action={{ label: "Back to the job board", to: routes.jobs }}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <CompanyCover
        profile={profile}
        openRoles={jobs.length}
        onSeeRoles={() => setTab("jobs")}
      />
      <div className={styles.body}>
        <div className={styles.grid}>
          <CompanyTabs
            profile={profile}
            jobs={jobs}
            reviews={reviews}
            reviewCount={reviewCount}
            onWriteReview={() => setWriting(true)}
            tab={tab}
            setTab={setTab}
          />
          <CompanySidebar profile={profile} />
        </div>
      </div>

      {writing && (
        <CompanyReviewModal
          slug={slug}
          companyName={profile.nameText}
          onClose={() => setWriting(false)}
          onCreated={(r) => {
            if (demoMode) setAddedReviews((prev) => [r, ...prev]);
          }}
        />
      )}
    </PageShell>
  );
}
