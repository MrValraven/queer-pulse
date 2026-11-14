import type { LeadListFilters } from "./leads.types";

/** Every leads query key (contract section 10.2). The mode rides at the
 *  end, since a demo/live switch keeps the query cache. */
export const leadKeys = {
  root: ["admin", "leads"] as const,
  listRoot: ["admin", "leads", "list"] as const,
  list: (filters: LeadListFilters, isDemoMode: boolean) =>
    ["admin", "leads", "list", filters, { demo: isDemoMode }] as const,
  detailRoot: ["admin", "leads", "detail"] as const,
  detail: (leadId: string, isDemoMode: boolean) =>
    ["admin", "leads", "detail", leadId, { demo: isDemoMode }] as const,
  dueCountRoot: ["admin", "leads", "dueCount"] as const,
  dueCount: (isDemoMode: boolean) =>
    ["admin", "leads", "dueCount", { demo: isDemoMode }] as const,
  personaSearchRoot: ["admin", "leads", "personaSearch"] as const,
  personaSearch: (term: string, isDemoMode: boolean) =>
    ["admin", "leads", "personaSearch", term, { demo: isDemoMode }] as const,
};
