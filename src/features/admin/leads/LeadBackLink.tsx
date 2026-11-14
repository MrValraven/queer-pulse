import { FiArrowLeft } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { LEADS_LIST_SEARCH_STATE_KEY } from "./leadPaths";
import styles from "./AdminLead.module.css";

/** The list's search string from router state, when the page was opened
 *  from the list. Only an empty string or one starting with "?" counts, so
 *  stray state can never steer the link somewhere else. */
function leadsListSearchFrom(state: unknown): string {
  if (typeof state !== "object" || state === null) return "";
  const search: unknown = (state as Record<string, unknown>)[
    LEADS_LIST_SEARCH_STATE_KEY
  ];
  if (typeof search !== "string") return "";
  const isListSearch = search === "" || search.startsWith("?");
  return isListSearch ? search : "";
}

/**
 * "Back to leads" above the lead page. It returns to the list with the
 * query, stage and type the admin had, when the list opened this page; a
 * page opened straight from a link goes back to the unfiltered list.
 */
export function LeadBackLink() {
  const { t } = useTranslation();
  const location = useLocation();
  const search = leadsListSearchFrom(location.state);
  return (
    <Link to={routes.adminLeads + search} className={styles.backLink}>
      <FiArrowLeft aria-hidden />
      {t("admin:leads.page.backCta")}
    </Link>
  );
}
