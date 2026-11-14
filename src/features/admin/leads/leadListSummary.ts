import type { LeadListResult } from "./api/useLeadList";
import type { LeadListFilters } from "./api/leads.types";

/** How many leads match the filters on screen, when the first page says
 *  so: the stage counts follow the search and the type, so a stage reads
 *  its own count. The due filter has no count of its own; it is known
 *  only once every page is in. */
export function leadMatchCount(
  list: LeadListResult,
  filters: LeadListFilters,
): number | null {
  if (list.totalCount === null) return null;
  if (filters.isDueOnly) return list.hasMore ? null : list.rows.length;
  if (filters.stage !== null) return list.stageCounts?.[filters.stage] ?? null;
  return list.totalCount;
}
