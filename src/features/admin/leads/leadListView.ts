import type { LeadListResult } from "./api/useLeadList";

/** Which of the list's views is on screen. `none` is the instant between a
 *  failed first page and its error view being allowed to show; `emptyNone`
 *  is a directory with no leads at all, `emptyFiltered` filters that match
 *  nothing. */
export type LeadListViewName =
  "loading" | "error" | "none" | "emptyNone" | "emptyFiltered" | "rows";

/** Names the view the list shows for its current state. */
export function leadListViewName(
  list: LeadListResult,
  hasFilters: boolean,
): LeadListViewName {
  if (list.isLoading) return "loading";
  if (list.isLoadError) return list.errorUpdateCount > 0 ? "error" : "none";
  if (list.rows.length > 0) return "rows";
  return list.totalCount === 0 && !hasFilters ? "emptyNone" : "emptyFiltered";
}
