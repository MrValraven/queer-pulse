import { routes } from "../../../app/routeMap";

/** One lead's page under the leads directory, with the id encoded. */
export const adminLeadPath = (leadId: string): string =>
  `${routes.adminLeads}/${encodeURIComponent(leadId)}`;
