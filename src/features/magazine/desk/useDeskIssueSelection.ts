/**
 * Which issue the desk is working on. Before the switcher existed the answer
 * was implicit — whatever `GET /magazine/admin/issues/current` returned, i.e.
 * the highest display number — which meant an older issue could not be worked
 * on at all, and a newly created "Issue 01" alongside an existing "09" would
 * never become reachable.
 *
 * The choice lives in the URL (`?issue=01`), mirroring the `?track=` idiom, so
 * it survives a reload and can be linked to. `magazine-current-issue` is only
 * the DEFAULT now, never the constraint.
 */

import { useMemo } from "react";
import type { SetURLSearchParams } from "react-router-dom";
import type { Issue, IssueSummary } from "../data/desk.data";

export interface UseDeskIssueSelectionParams {
  /** Every issue, newest number first (`useDeskIssues`). */
  issues: IssueSummary[];
  /** The backend's current-issue answer. Used as the DEFAULT selection, and
   *  as the only source of the editorial calendar fields (`closes`/`daysLeft`),
   *  which exist in demo mode alone. */
  currentIssue: Issue | null;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}

export interface UseDeskIssueSelectionResult {
  /** The resolved issue, or `null` when the magazine has no issues yet. */
  selectedIssue: IssueSummary | null;
  /** The same issue in the desk header's shape, blank when none is selected. */
  deskIssue: Issue;
  selectIssue: (issueNumber: string) => void;
}

/** The header's shape with nothing in it — rendered when the magazine has no
 *  issues at all, so the header stays honestly blank (no theme, no Produce
 *  button) rather than inventing an issue out of the piece count. */
const BLANK_DESK_ISSUE: Issue = {
  id: "",
  number: "",
  theme: "",
  closes: "",
  publishes: "",
  daysLeft: 0,
  filled: 0,
  slots: 0,
};

/**
 * Widens a switcher row into the desk header's `Issue` shape. The backend
 * models no editorial calendar, so `closes`/`daysLeft` are carried over only
 * from the current-issue lookup and only when it IS the selected issue —
 * blank otherwise, never fabricated. `publishes` is real whenever the issue has
 * a date, and blank while it is still unscheduled (the date is optional at
 * creation): the header hides the meta line rather than inventing one.
 */
function toDeskIssue(
  selectedIssue: IssueSummary | null,
  currentIssue: Issue | null,
): Issue {
  if (!selectedIssue) return BLANK_DESK_ISSUE;
  const isCurrent = currentIssue?.number === selectedIssue.number;
  return {
    id: selectedIssue.id,
    number: selectedIssue.number,
    theme: selectedIssue.theme,
    closes: isCurrent ? currentIssue.closes : "",
    publishes: selectedIssue.publishedOn ?? "",
    daysLeft: isCurrent ? currentIssue.daysLeft : 0,
    filled: selectedIssue.filled,
    slots: selectedIssue.slots,
  };
}

export function useDeskIssueSelection({
  issues,
  currentIssue,
  searchParams,
  setSearchParams,
}: UseDeskIssueSelectionParams): UseDeskIssueSelectionResult {
  const issueParam = searchParams.get("issue");

  const selectedIssue = useMemo(() => {
    // An `?issue=` pointing at an issue that no longer exists (a stale link, a
    // deleted issue) falls through to the default rather than blanking the
    // desk — the header would otherwise show nothing with no way back.
    const fromParam = issueParam
      ? issues.find((issue) => issue.number === issueParam)
      : undefined;
    if (fromParam) return fromParam;

    const current = currentIssue
      ? issues.find((issue) => issue.number === currentIssue.number)
      : undefined;
    // `issues` is already newest-number-first, so `[0]` is the sensible
    // fallback when the current-issue lookup and the list disagree.
    return current ?? issues[0] ?? null;
  }, [issueParam, issues, currentIssue]);

  const deskIssue = useMemo(
    () => toDeskIssue(selectedIssue, currentIssue),
    [selectedIssue, currentIssue],
  );

  function selectIssue(issueNumber: string): void {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("issue", issueNumber);
    setSearchParams(nextParams, { replace: true });
  }

  return { selectedIssue, deskIssue, selectIssue };
}
