import { useMemo, useState } from "react";
import { FiBriefcase } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { usePostedJobs } from "../../app/providers/PostedJobsProvider";
import { COMPANY_PROFILES } from "./companies.data";
import { JOBS } from "./jobs.data";
import { CompanyCover } from "./CompanyCover";
import { CompanyTabs } from "./CompanyTabs";
import { CompanySidebar } from "./CompanySidebar";
import styles from "./CompanyPage.module.css";

type TabId = "about" | "jobs" | "reviews" | "work";

export function CompanyPage() {
  const { slug = "" } = useParams();
  const profile = COMPANY_PROFILES[slug];
  const { postedJobs } = usePostedJobs();
  const [tab, setTab] = useState<TabId>("about");

  const jobs = useMemo(
    () =>
      profile
        ? [...postedJobs, ...JOBS].filter((j) => j.org === profile.nameText)
        : [],
    [profile, postedJobs],
  );

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
            tab={tab}
            setTab={setTab}
          />
          <CompanySidebar profile={profile} />
        </div>
      </div>
    </PageShell>
  );
}
