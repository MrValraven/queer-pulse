import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MyOpportunitySummaryDTO } from "./api/volunteering.api";
import styles from "./VolunteerApplicantsDashboardPage.module.css";

/** Left pane: opportunities the viewer posted, each with a pending-count tag
 *  and a select action (mirrors `AdminVerificationRows`' row + ghost-button
 *  pattern rather than making the whole row an ad-hoc `<button>`). */
export function VolunteerApplicantsOpportunityList({
  opportunities,
  activeSlug,
  onSelect,
}: {
  opportunities: MyOpportunitySummaryDTO[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.oppList}>
      {opportunities.map((o) => (
        <div
          key={o.slug}
          className={`${styles.oppRow} ${o.slug === activeSlug ? styles.oppRowActive : ""}`}
        >
          <div className={styles.oppInfo}>
            <div className={styles.oppRole}>{o.role}</div>
            <div className={styles.oppOrg}>{o.org}</div>
            {o.pendingCount > 0 && (
              <span className={styles.oppPendingTag}>
                {t("marketing:volunteerManage.pendingCount", {
                  count: o.pendingCount,
                })}
              </span>
            )}
          </div>
          <Button
            variant={o.slug === activeSlug ? "primary" : "ghost"}
            size="sm"
            onClick={() => onSelect(o.slug)}
          >
            {t("marketing:volunteer.signups.title")}
          </Button>
        </div>
      ))}
    </div>
  );
}
