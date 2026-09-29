import { describe, expect, it } from "vitest";
import { DEMO_PIECES, type Piece } from "../data/desk.data";
import { isoCalendarDate } from "../api/pieces.adapters";
import { describeDue } from "./deskDue";

/** Local noon, so no timezone can push the calendar day either way. */
const TODAY = new Date(2026, 7, 10, 12, 0, 0);

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "A piece",
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Someone",
    editorId: "marta",
    stage: "Edit",
    due: "",
    art: "in",
    issueId: null,
    ...overrides,
  };
}

describe("describeDue", () => {
  it("says today and tomorrow", () => {
    expect(describeDue(makePiece({ dueDate: "2026-08-10" }), TODAY)).toEqual({
      kind: "relative",
      labelKey: "magazine:desk.due.today",
      isLate: false,
    });
    expect(
      describeDue(makePiece({ dueDate: "2026-08-11" }), TODAY).labelKey,
    ).toBe("magazine:desk.due.tomorrow");
  });

  it("counts days ahead and days late", () => {
    expect(describeDue(makePiece({ dueDate: "2026-08-13" }), TODAY)).toEqual({
      kind: "relative",
      labelKey: "magazine:desk.due.inDays",
      values: { count: 3 },
      isLate: false,
    });
    expect(describeDue(makePiece({ dueDate: "2026-08-09" }), TODAY)).toEqual({
      kind: "relative",
      labelKey: "magazine:desk.due.daysLate",
      values: { count: 1 },
      isLate: true,
    });
  });

  it("reads an ISO due string when no dueDate was set", () => {
    expect(describeDue(makePiece({ due: "2026-08-12" }), TODAY).values).toEqual(
      { count: 2 },
    );
  });

  it("echoes display text it cannot date, keeping the late flag", () => {
    expect(describeDue(makePiece({ due: "4 Aug", late: true }), TODAY)).toEqual(
      { kind: "raw", text: "4 Aug", isLate: true },
    );
  });

  it("returns none for an empty due and ready for finished work", () => {
    expect(describeDue(makePiece({ due: "" }), TODAY).kind).toBe("none");
    expect(describeDue(makePiece({ due: "ready" }), TODAY).kind).toBe("ready");
    expect(
      describeDue(
        makePiece({ stage: "Ready", due: "2026-08-01", dueDate: "2026-08-01" }),
        TODAY,
      ),
    ).toEqual({ kind: "ready", isLate: false });
  });

  it("gives every dated demo piece a relative label that agrees with its late flag", () => {
    const today = new Date();
    for (const piece of DEMO_PIECES) {
      if (piece.due === "ready") continue;
      const description = describeDue(piece, today);
      expect(description.kind).toBe("relative");
      expect(description.isLate).toBe(piece.late === true);
    }
  });
});

describe("isoCalendarDate", () => {
  it("keeps the calendar day of an ISO value and rejects anything else", () => {
    expect(isoCalendarDate("2026-08-04")).toBe("2026-08-04");
    expect(isoCalendarDate("2026-08-04T10:00:00.000Z")).toBe("2026-08-04");
    expect(isoCalendarDate("4 Aug")).toBeUndefined();
    expect(isoCalendarDate("ready")).toBeUndefined();
    expect(isoCalendarDate("2026-02-31")).toBeUndefined();
    expect(isoCalendarDate(null)).toBeUndefined();
  });
});
