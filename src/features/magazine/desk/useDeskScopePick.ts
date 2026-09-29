/**
 * Picking an issue in the header's scope menu. One pick means two facts in
 * the URL: which issue (`?issue=`) and that the desk shows that issue's
 * pieces (`?track=issue`). They go out in ONE `setSearchParams` write: two
 * writers in the same tick each start from the params of the render they
 * were created in, so the second write would silently drop the first.
 */

import { useCallback } from "react";
import type { SetURLSearchParams } from "react-router-dom";

/** The params after an issue pick: every other param kept, `issue` set to
 *  the picked number and the scope switched to that issue. */
export function withIssueScope(
  params: URLSearchParams,
  issueNumber: string,
): URLSearchParams {
  const nextParams = new URLSearchParams(params);
  nextParams.set("issue", issueNumber);
  nextParams.set("track", "issue");
  return nextParams;
}

/**
 * Returns the header's `onSelectIssueScope` handler. The write replaces the
 * history entry, like the desk's other URL writers (`useDeskTracks`,
 * `useDeskIssueSelection`), so Back leaves the desk instead of stepping
 * through scope picks.
 */
export function useDeskScopePick(
  setSearchParams: SetURLSearchParams,
): (issueNumber: string) => void {
  return useCallback(
    (issueNumber: string) =>
      setSearchParams(
        (currentParams) => withIssueScope(currentParams, issueNumber),
        { replace: true },
      ),
    [setSearchParams],
  );
}
