import { describe, expect, it } from "vitest";
import type { LeadListItemDTO, LeadListPageDTO } from "./api/leads.types";
import { EMPTY_LEAD_FILTERS } from "./api/leads.types";
import {
  dueCountShiftOf,
  withLeadMovedInPages,
  type LeadListPages,
} from "./leadListCachePatch";

const TODAY = "2026-11-14";

function rowOf(overrides: Partial<LeadListItemDTO>): LeadListItemDTO {
  return {
    id: "lead-a",
    name: "Lead A",
    type: "venue",
    stage: "in_talks",
    location: null,
    links: [],
    linkCount: 0,
    followUpOn: "2026-11-08",
    isFollowUpDue: true,
    linkedPersona: null,
    noteCount: 0,
    lastEntryAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
    ...overrides,
  };
}

function pagesOf(items: LeadListItemDTO[]): LeadListPages {
  const page: LeadListPageDTO = {
    items,
    nextCursor: null,
    stageCounts: {
      to_contact: 1,
      contacted: 0,
      in_talks: 1,
      on_board: 0,
      not_now: 0,
    },
    totalCount: 2,
  };
  return { pages: [page], pageParams: [null] };
}

const firstPage = (pages: LeadListPages) => {
  const page = pages.pages[0];
  if (page === undefined) throw new Error("Expected a page");
  return page;
};

describe("withLeadMovedInPages", () => {
  const pages = pagesOf([
    rowOf({}),
    rowOf({ id: "lead-b", stage: "to_contact", followUpOn: null }),
  ]);

  it("moves the row, its due flag and the stage counts", () => {
    const moved = firstPage(
      withLeadMovedInPages(
        pages,
        EMPTY_LEAD_FILTERS,
        "lead-a",
        "on_board",
        TODAY,
      ),
    );
    expect(moved.items[0]).toMatchObject({
      stage: "on_board",
      isFollowUpDue: false,
    });
    expect(moved.stageCounts.in_talks).toBe(0);
    expect(moved.stageCounts.on_board).toBe(1);
    expect(moved.totalCount).toBe(2);
  });

  it("drops a row that leaves the stage or due filter", () => {
    const byStage = withLeadMovedInPages(
      pages,
      { ...EMPTY_LEAD_FILTERS, stage: "in_talks" },
      "lead-a",
      "on_board",
      TODAY,
    );
    expect(firstPage(byStage).items.map((item) => item.id)).toEqual(["lead-b"]);
    const byDue = withLeadMovedInPages(
      pages,
      { ...EMPTY_LEAD_FILTERS, isDueOnly: true },
      "lead-a",
      "not_now",
      TODAY,
    );
    expect(firstPage(byDue).items.map((item) => item.id)).toEqual(["lead-b"]);
  });

  it("leaves a list that does not hold the lead, and a repeat, alone", () => {
    expect(
      withLeadMovedInPages(
        pages,
        EMPTY_LEAD_FILTERS,
        "other",
        "on_board",
        TODAY,
      ),
    ).toBe(pages);
    const once = withLeadMovedInPages(
      pages,
      EMPTY_LEAD_FILTERS,
      "lead-a",
      "contacted",
      TODAY,
    );
    expect(
      withLeadMovedInPages(
        once,
        EMPTY_LEAD_FILTERS,
        "lead-a",
        "contacted",
        TODAY,
      ),
    ).toBe(once);
  });
});

describe("dueCountShiftOf", () => {
  it("counts a due lead that closes, and a past date that opens again", () => {
    const due = { stage: "in_talks" as const, followUpOn: "2026-11-08" };
    expect(dueCountShiftOf(due, "on_board", TODAY)).toBe(-1);
    expect(dueCountShiftOf(due, "contacted", TODAY)).toBe(0);
    const closed = { stage: "not_now" as const, followUpOn: "2026-11-04" };
    expect(dueCountShiftOf(closed, "to_contact", TODAY)).toBe(1);
    const later = { stage: "not_now" as const, followUpOn: "2026-12-01" };
    expect(dueCountShiftOf(later, "to_contact", TODAY)).toBe(0);
  });
});
