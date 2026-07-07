import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { SkeletonLine } from "../../shared/components/ui";
import { useEmployerAffiliation } from "../../app/providers/EmployerAffiliationProvider";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { COMPANY_PROFILES } from "./companies.data";
import { useCompany } from "./api/useCompany";
import { PostJobGate } from "./PostJobGate";
import { PostJobComposer } from "./PostJobComposer";
import { PostJobConfirmation } from "./PostJobConfirmation";
import type { Job } from "./jobs.data";
import styles from "./PostJobPage.module.css";

export function PostJobPage() {
  const { affiliation, clearAffiliation } = useEmployerAffiliation();
  const { demoMode } = useDemoMode();
  const [params] = useSearchParams();
  const companyParam = params.get("company") ?? undefined;
  const [published, setPublished] = useState<Job | null>(null);
  const [resetKey, setResetKey] = useState(0);

  // Demo resolves the affiliated company from the mock registry; live fetches
  // it (so an inline-created company resolves too).
  const companyQuery = useCompany(affiliation?.companySlug);
  const company = affiliation
    ? demoMode
      ? COMPANY_PROFILES[affiliation.companySlug]
      : (companyQuery.data?.profile ?? undefined)
    : undefined;
  const loadingCompany =
    Boolean(affiliation) && !demoMode && companyQuery.isLoading;

  return (
    <PageShell>
      <div className={styles.page}>
        <div className={styles.wrap}>
          {published ? (
            <PostJobConfirmation
              job={published}
              onPostAnother={() => {
                setPublished(null);
                setResetKey((k) => k + 1);
              }}
            />
          ) : loadingCompany ? (
            <div>
              <SkeletonLine width="40%" height={28} />
              <SkeletonLine width="90%" height={16} style={{ marginTop: 16 }} />
              <SkeletonLine width="80%" height={16} style={{ marginTop: 10 }} />
            </div>
          ) : company && affiliation ? (
            <PostJobComposer
              key={resetKey}
              company={company}
              role={affiliation.role}
              onSwitchCompany={clearAffiliation}
              onPublished={setPublished}
            />
          ) : (
            <PostJobGate
              initialCompany={companyParam}
              onAffiliated={() => setResetKey((k) => k + 1)}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}
