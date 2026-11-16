import { describe, expect, it } from "vitest";
import { EMPTY_LEAD_FILTERS } from "./api/leads.types";
import type { LeadListResult } from "./api/useLeadList";
import { leadListViewName } from "./leadListView";

/** A settled first page with no rows at all. */
const EMPTY_RESULT: LeadListResult = {
  rows: [],
  stageCounts: {
    to_contact: 0,
    contacted: 0,
    in_talks: 0,
    on_board: 0,
    not_now: 0,
  },
  totalCount: 0,
  dueCount: 0,
  isLoading: false,
  isLoadError: false,
  isRetrying: false,
  isLoadMoreError: false,
  hasMore: false,
  isFetchingMore: false,
  isShowingPreviousResults: false,
  errorUpdateCount: 0,
  error: null,
  loadMore: () => undefined,
  retry: () => undefined,
};

describe("leadListViewName", () => {
  it.each([
    ["me", "emptyMine"],
    ["me_or_unassigned", "emptyMineAndUnassigned"],
    ["unassigned", "emptyUnassigned"],
  ] as const)("names the empty %s view", (assignedTo, viewName) => {
    expect(
      leadListViewName(
        EMPTY_RESULT,
        { ...EMPTY_LEAD_FILTERS, assignedTo },
        true,
      ),
    ).toBe(viewName);
  });

  it("keeps the filtered state when another filter joins the view", () => {
    expect(
      leadListViewName(
        EMPTY_RESULT,
        { ...EMPTY_LEAD_FILTERS, assignedTo: "me", type: "venue" },
        true,
      ),
    ).toBe("emptyFiltered");
  });

  it("keeps the empty directory state for Everyone", () => {
    expect(leadListViewName(EMPTY_RESULT, EMPTY_LEAD_FILTERS, false)).toBe(
      "emptyNone",
    );
  });
});
