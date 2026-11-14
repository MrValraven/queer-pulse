import { routes } from "../../../app/routeMap";

/** One lead's page under the leads directory, with the id encoded. */
export const adminLeadPath = (leadId: string): string =>
  `${routes.adminLeads}/${encodeURIComponent(leadId)}`;

/** The router state key a list row hands to the lead page: the list's
 *  search string (query, stage and type), so the page's back link returns
 *  to the same filtered list. */
export const LEADS_LIST_SEARCH_STATE_KEY = "leadsListSearch";

/** Router state the list passes when it opens a lead. */
export type LeadPageLocationState = {
  [LEADS_LIST_SEARCH_STATE_KEY]: string;
};
