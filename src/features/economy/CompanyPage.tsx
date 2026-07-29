import { useMemo, useState } from "react";
import { FiBriefcase } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { usePostedJobs } from "../../app/providers/usePostedJobs";
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
  const { t } = useTranslation();
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
    return [...postedJobs, ...JOBS].filter((j) => j.organization === profile.nameText);
  }, [profile, apiOpenRoles, postedJobs]);

  const baseReviews = demoMode ? (profile?.reviews ?? []) : reviewsQuery.reviews;
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
            title={t("economy:company.notFound.title")}
            description={t("economy:company.notFound.description")}
            action={{
              label: t("economy:company.notFound.backCta"),
              to: routes.jobs,
            }}
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
            hasMoreReviews={reviewsQuery.hasNextPage}
            onLoadMoreReviews={reviewsQuery.fetchNextPage}
            isLoadingMoreReviews={reviewsQuery.isFetchingNextPage}
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
