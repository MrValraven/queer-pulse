import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  emptyItem,
  withUid,
  type SubprofileEditorRow,
} from "../subprofileSectionEditorRows";
import {
  commitGigDraft,
  groupGigRows,
  moveWithinGroup,
  reorderWithinGroup,
  sortGigsByDate,
} from "./gigRows";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 1, 12, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

function makeGigRow(title: string, date: string): SubprofileEditorRow {
  return withUid({ ...emptyItem("gigs"), title, date });
}

function titlesOf(rows: SubprofileEditorRow[]): string[] {
  return rows.map((row) => row.title);
}

/** Interleaved flat order: U1 P1 U2 P2 U3. */
function makeMixedRows(): SubprofileEditorRow[] {
  return [
    makeGigRow("U1", "2026-12-01"),
    makeGigRow("P1", "2026-01-10"),
    makeGigRow("U2", "2027-01-01"),
    makeGigRow("P2", ""),
    makeGigRow("U3", "2027-06-01"),
  ];
}

describe("groupGigRows", () => {
  it("splits by the shared upcoming rule and records flat slots", () => {
    const groups = groupGigRows(makeMixedRows());
    expect(titlesOf(groups.upcoming.map((entry) => entry.row))).toEqual([
      "U1",
      "U2",
      "U3",
    ]);
    expect(groups.upcoming.map((entry) => entry.globalIndex)).toEqual([
      0, 2, 4,
    ]);
    expect(titlesOf(groups.past.map((entry) => entry.row))).toEqual([
      "P1",
      "P2",
    ]);
    expect(groups.past.map((entry) => entry.globalIndex)).toEqual([1, 3]);
  });

  it("never mutates or reorders the flat array", () => {
    const rows = makeMixedRows();
    const before = [...rows];
    groupGigRows(rows);
    expect(rows).toEqual(before);
  });

  it("puts a gig dated today in Upcoming", () => {
    const groups = groupGigRows([makeGigRow("Tonight", "2026-11-01")]);
    expect(groups.upcoming).toHaveLength(1);
  });
});

describe("reorderWithinGroup and moveWithinGroup", () => {
  it("reorders upcoming rows without touching past rows", () => {
    const rows = makeMixedRows();
    const next = reorderWithinGroup(rows, "upcoming", 0, 2);
    expect(titlesOf(next)).toEqual(["U2", "P1", "U3", "P2", "U1"]);
    expect(next[1]).toBe(rows[1]);
    expect(next[3]).toBe(rows[3]);
  });

  it("moves a past row down inside the past group", () => {
    const rows = makeMixedRows();
    const next = moveWithinGroup(rows, "past", 0, 1);
    expect(titlesOf(next)).toEqual(["U1", "P2", "U2", "P1", "U3"]);
  });

  it("is a no-op at a group edge", () => {
    const rows = makeMixedRows();
    expect(moveWithinGroup(rows, "upcoming", 0, -1)).toBe(rows);
    expect(moveWithinGroup(rows, "past", 1, 1)).toBe(rows);
  });

  it("is a no-op for equal or out-of-range positions", () => {
    const rows = makeMixedRows();
    expect(reorderWithinGroup(rows, "upcoming", 1, 1)).toBe(rows);
    expect(reorderWithinGroup(rows, "upcoming", 0, 9)).toBe(rows);
  });
});

describe("sortGigsByDate", () => {
  it("sorts upcoming ascending and past descending in place", () => {
    const rows = [
      makeGigRow("U-late", "2027-06-01"),
      makeGigRow("P-old", "2025-01-01"),
      makeGigRow("U-soon", "2026-12-01"),
      makeGigRow("P-undated", ""),
      makeGigRow("P-new", "2026-05-01"),
    ];
    expect(titlesOf(sortGigsByDate(rows))).toEqual([
      "U-soon",
      "P-new",
      "U-late",
      "P-old",
      "P-undated",
    ]);
  });
});

describe("commitGigDraft", () => {
  it("inserts a new upcoming gig date-sorted before a later one", () => {
    const rows = makeMixedRows();
    const draft = { ...emptyItem("gigs"), title: "New", date: "2026-12-15" };
    const result = commitGigDraft(rows, draft, null);
    expect(result.landedGroup).toBe("upcoming");
    expect(titlesOf(result.rows)).toEqual([
      "U1",
      "P1",
      "New",
      "U2",
      "P2",
      "U3",
    ]);
  });

  it("appends a new upcoming gig after the last upcoming one", () => {
    const rows = makeMixedRows();
    const draft = { ...emptyItem("gigs"), title: "Last", date: "2030-01-01" };
    const result = commitGigDraft(rows, draft, null);
    expect(titlesOf(result.rows)).toEqual([
      "U1",
      "P1",
      "U2",
      "P2",
      "U3",
      "Last",
    ]);
  });

  it("inserts a new past gig in descending order", () => {
    const rows = [
      makeGigRow("P-2026", "2026-05-01"),
      makeGigRow("P-2024", "2024-05-01"),
    ];
    const draft = { ...emptyItem("gigs"), title: "P-2025", date: "2025-05-01" };
    const result = commitGigDraft(rows, draft, null);
    expect(result.landedGroup).toBe("past");
    expect(titlesOf(result.rows)).toEqual(["P-2026", "P-2025", "P-2024"]);
  });

  it("places the first gig of an empty list", () => {
    const draft = { ...emptyItem("gigs"), title: "Only", date: "2027-01-01" };
    const result = commitGigDraft([], draft, null);
    expect(titlesOf(result.rows)).toEqual(["Only"]);
  });

  it("replaces an edited gig in place when it stays in its group", () => {
    const rows = makeMixedRows();
    const target = rows[2]!;
    const result = commitGigDraft(
      rows,
      { ...target, title: "U2 edited", date: "2029-01-01" },
      target._uid,
    );
    expect(result.landedGroup).toBe("upcoming");
    expect(titlesOf(result.rows)).toEqual([
      "U1",
      "P1",
      "U2 edited",
      "P2",
      "U3",
    ]);
    expect(result.rows[2]!._uid).toBe(target._uid);
  });

  it("moves an edited gig across groups when its date changes group", () => {
    const rows = makeMixedRows();
    const target = rows[0]!;
    const result = commitGigDraft(
      rows,
      { ...target, date: "2026-03-01" },
      target._uid,
    );
    expect(result.landedGroup).toBe("past");
    const groups = groupGigRows(result.rows);
    expect(titlesOf(groups.past.map((entry) => entry.row))).toEqual([
      "U1",
      "P1",
      "P2",
    ]);
  });

  it("keeps spotlight single-select within gigs", () => {
    const rows = makeMixedRows();
    rows[0] = { ...rows[0]!, isFeatured: true };
    const draft = {
      ...emptyItem("gigs"),
      title: "Star",
      date: "2027-02-01",
      isFeatured: true,
    };
    const result = commitGigDraft(rows, draft, null);
    const featuredTitles = titlesOf(
      result.rows.filter((row) => row.isFeatured),
    );
    expect(featuredTitles).toEqual(["Star"]);
  });

  it("never reorders rows of the other group", () => {
    const rows = makeMixedRows();
    const draft = { ...emptyItem("gigs"), title: "New", date: "2026-12-15" };
    const result = commitGigDraft(rows, draft, null);
    const pastTitles = groupGigRows(result.rows).past.map(
      (entry) => entry.row.title,
    );
    expect(pastTitles).toEqual(["P1", "P2"]);
  });
});
