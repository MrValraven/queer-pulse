import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useEmployerAffiliation } from "../../app/providers/EmployerAffiliationProvider";
import { COMPANY_PROFILES } from "./companies.data";
import { PostJobGate } from "./PostJobGate";
import { PostJobComposer } from "./PostJobComposer";
import { PostJobConfirmation } from "./PostJobConfirmation";
import type { Job } from "./jobs.data";
import styles from "./PostJobPage.module.css";

export function PostJobPage() {
  const { affiliation, clearAffiliation } = useEmployerAffiliation();
  const [params] = useSearchParams();
  const companyParam = params.get("company") ?? undefined;
  const [published, setPublished] = useState<Job | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const company = affiliation
    ? COMPANY_PROFILES[affiliation.companySlug]
    : undefined;

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
