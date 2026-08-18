import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { VolunteerOpportunity } from "./volunteerOpportunities";
import styles from "./VolunteerOpportunityPage.module.css";

const PARTNER = routes.partner;

/**
 * The opportunity's linked organization card: a partner org OR a community
 * (never both in practice — `OrganizationPickerField` is a single combined
 * control), reusing the same pill/text/link treatment for either. Renders
 * nothing when neither is set. Split out of `VolunteerOpportunitySidebar` to
 * keep that component under the 200-line limit.
 */
export function VolunteerOrganizationCard({
  opp,
}: {
  opp: VolunteerOpportunity;
}) {
  const { t } = useTranslation();

  if (opp.partner) {
    const partnerTo = opp.partner.slug
      ? `${routes.partners}/${opp.partner.slug}`
      : PARTNER;
    return (
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          {t("marketing:volunteerDetail.sidebar.partnershipLabel")}
        </div>
        <span className={styles.partnerPill}>{opp.partner.name}</span>
        <p className={styles.partnerText}>{opp.partner.text}</p>
        <Link to={partnerTo} className={styles.partnerLink}>
          {t("marketing:volunteerDetail.sidebar.partnershipLink")}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      </div>
    );
  }

  if (opp.community) {
    const communityTo = opp.community.slug
      ? `/community/${opp.community.slug}`
      : routes.communities;
    return (
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          {t("marketing:volunteerDetail.sidebar.communityLabel")}
        </div>
        <span className={styles.partnerPill}>{opp.community.name}</span>
        <Link to={communityTo} className={styles.partnerLink}>
          {t("marketing:volunteerDetail.sidebar.communityLink")}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      </div>
    );
  }

  return null;
}
