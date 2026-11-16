import type { LeadListResult } from "./api/useLeadList";
import type { LeadListFilters } from "./api/leads.types";
import {
  LEAD_ASSIGNEE_EMPTY_VIEW,
  type LeadAssigneeEmptyViewName,
} from "./leadAssignees.data";

/** Which of the list's views is on screen. `none` is the instant between a
 *  failed first page and its error view being allowed to show; `emptyNone`
 *  is a directory with no leads at all, `emptyFiltered` filters that match
 *  nothing. `emptyMine`, `emptyMineAndUnassigned` and `emptyUnassigned` are
 *  an In charge view that matches nothing while it is the only filter set. */
export type LeadListViewName =
  | "loading"
  | "error"
  | "none"
  | "emptyNone"
  | "emptyFiltered"
  | LeadAssigneeEmptyViewName
  | "rows";

/** Whether the In charge view is the one filter set: no search, stage,
 *  type or due-only. */
function isAssigneeOnlyFilter(filters: LeadListFilters): boolean {
  return (
    filters.assignedTo !== null &&
    filters.q === "" &&
    filters.stage === null &&
    filters.type === null &&
    !filters.isDueOnly
  );
}

/** Names the view the list shows for its current state. */
export function leadListViewName(
  list: LeadListResult,
  filters: LeadListFilters,
  hasFilters: boolean,
): LeadListViewName {
  if (list.isLoading) return "loading";
  if (list.isLoadError) return list.errorUpdateCount > 0 ? "error" : "none";
  if (list.rows.length > 0) return "rows";
  if (filters.assignedTo !== null && isAssigneeOnlyFilter(filters)) {
    return LEAD_ASSIGNEE_EMPTY_VIEW[filters.assignedTo];
  }
  return list.totalCount === 0 && !hasFilters ? "emptyNone" : "emptyFiltered";
}
