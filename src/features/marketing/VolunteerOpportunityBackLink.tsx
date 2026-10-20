import { type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPath, routes } from "../../app/routeMap";
import { usePreviousLocation } from "../../app/providers/previousLocation";
import {
  communityVolunteeringTabPath,
  opportunityBackTargetFrom,
} from "./volunteerPaths";
import styles from "./VolunteerOpportunityPage.module.css";

/** The id LivingHubTabs puts on the community tab strip. A fresh push to the
 *  tab carries it as the hash, so ScrollManager lands the visitor on the tabs
 *  with the opportunity list right under them. */
const COMMUNITY_TABS_ANCHOR = "community-tabs";

/** True for a plain left click: no modifier key, primary button. Anything else
 *  (a new tab, a new window, a download) keeps the anchor's own behaviour. */
function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  return !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
}

/** The detail page's back link. A member who opened the opportunity from a
 *  community's Volunteering tab arrives with that community in router state,
 *  so the link returns them to the tab. A shared or typed link carries no
 *  state and goes back to the full volunteering board. */
export function VolunteerOpportunityBackLink() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const previousLocation = usePreviousLocation();
  const backTarget = opportunityBackTargetFrom(location.state);

  if (backTarget) {
    // The entry right behind this one is that community's page, so a plain
    // click walks history back to it. Only that POP lets ScrollManager restore
    // the offset the visitor left the list at. The href stays real, so
    // open-in-new-tab and assistive tech still reach the tab.
    const canReturnThroughHistory =
      previousLocation?.pathname === communityPath(backTarget.slug);
    const returnThroughHistory = (event: MouseEvent<HTMLAnchorElement>) => {
      if (!canReturnThroughHistory || !isPlainLeftClick(event)) return;
      event.preventDefault();
      void navigate(-1);
    };
    return (
      <Link
        to={`${communityVolunteeringTabPath(backTarget.slug)}#${COMMUNITY_TABS_ANCHOR}`}
        onClick={returnThroughHistory}
        className={styles.back}
      >
        <FiArrowLeft aria-hidden />{" "}
        {t("marketing:volunteerDetail.backToCommunity", {
          community: backTarget.name,
        })}
      </Link>
    );
  }

  return (
    <Link to={routes.volunteer} className={styles.back}>
      <FiArrowLeft aria-hidden /> {t("marketing:volunteerDetail.backCta")}
    </Link>
  );
}
