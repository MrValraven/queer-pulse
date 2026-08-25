import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyOpportunities } from "./api/useMyOpportunities";
import { useSignups } from "./api/useSignups";
import { useDecideSignup } from "./api/useOpportunityMutations";
import { VolunteerApplicantsOpportunityList } from "./VolunteerApplicantsOpportunityList";
import { VolunteerApplicantsList } from "./VolunteerApplicantsList";
import styles from "./VolunteerApplicantsDashboardPage.module.css";

/**
 * Applicant-review desk: pick one of the opportunities you can review on the
 * left (yours, plus any attributed to a community you own or moderate),
 * review/accept/decline its applicants on the right. `?opportunity=<slug>`
 * seeds the initial selection so `VolunteerSignupsCard`'s "N to review" link
 * can deep-link straight to the relevant opportunity.
 */
export function VolunteerApplicantsDashboardPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { data: opportunities = [], isLoading } = useMyOpportunities();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    searchParams.get("opportunity"),
  );

  const activeSlug = useMemo(() => {
    if (selectedSlug && opportunities.some((o) => o.slug === selectedSlug)) {
      return selectedSlug;
    }
    return opportunities[0]?.slug ?? null;
  }, [selectedSlug, opportunities]);

  const signups = useSignups(activeSlug ?? undefined, Boolean(activeSlug));
  const decide = useDecideSignup(activeSlug ?? "");

  return (
    <PageShell>
      <div className={`wrap ${styles.page}`}>
        <h1 className={styles.title}>{t("marketing:volunteerManage.title")}</h1>
        <p className={styles.sub}>{t("marketing:volunteerManage.sub")}</p>

        {isLoading ? (
          <p className={styles.altText}>
            {t("marketing:volunteerManage.loading")}
          </p>
        ) : opportunities.length === 0 ? (
          <p className={styles.altText}>
            {t("marketing:volunteerManage.empty")}
          </p>
        ) : (
          <div className={styles.grid}>
            <VolunteerApplicantsOpportunityList
              opportunities={opportunities}
              activeSlug={activeSlug}
              onSelect={setSelectedSlug}
            />
            <VolunteerApplicantsList
              rows={signups.data ?? []}
              loading={signups.isLoading}
              onAccept={(signupId) =>
                decide.mutate({ signupId, status: "accepted" })
              }
              onDecline={(signupId) =>
                decide.mutate({ signupId, status: "declined" })
              }
              deciding={decide.isPending}
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}
