import { describe, expect, it } from "vitest";
import type { Piece } from "../data/desk.data";
import { forecastIssue, forecastPieceReason } from "./deskForecast";

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
    issueId: "issue-1",
    ...overrides,
  };
}

describe("forecastIssue", () => {
  it("forecasts nothing without a known close date", () => {
    const pieces = [makePiece({ late: true })];
    expect(forecastIssue(pieces, null, TODAY)).toEqual({
      atRisk: [],
      reasonByPieceId: {},
    });
    expect(forecastIssue(pieces, undefined, TODAY)).toEqual({
      atRisk: [],
      reasonByPieceId: {},
    });
  });

  it("skips Ready and Published pieces, however they are dated", () => {
    const pieces = [
      makePiece({ id: "ready", stage: "Ready", late: true }),
      makePiece({
        id: "published",
        stage: "Published",
        dueDate: "2026-09-01",
      }),
    ];
    expect(forecastIssue(pieces, "2026-08-15", TODAY)).toEqual({
      atRisk: [],
      reasonByPieceId: {},
    });
  });

  it("flags a late piece as 'late' even with room left before close", () => {
    const pieces = [
      makePiece({
        id: "p1",
        stage: "Layout",
        late: true,
        dueDate: "2026-08-09",
      }),
    ];
    const result = forecastIssue(pieces, "2026-09-01", TODAY);
    expect(result.atRisk.map((piece) => piece.id)).toEqual(["p1"]);
    expect(result.reasonByPieceId.p1).toBe("late");
  });

  it("flags a due date past the close as 'due-after-close'", () => {
    const pieces = [
      makePiece({ id: "p1", stage: "Layout", dueDate: "2026-08-20" }),
    ];
    const result = forecastIssue(pieces, "2026-08-15", TODAY);
    expect(result.reasonByPieceId.p1).toBe("due-after-close");
  });

  it("flags a piece with too many stages left as 'not-enough-time'", () => {
    // Commissioned to Ready is 6 stage steps, 12 days of allowance; the close
    // is only 5 days out.
    const pieces = [
      makePiece({ id: "p1", stage: "Commissioned", dueDate: "2026-08-13" }),
    ];
    const result = forecastIssue(pieces, "2026-08-15", TODAY);
    expect(result.reasonByPieceId.p1).toBe("not-enough-time");
  });

  it("leaves a piece with enough runway off the list", () => {
    // Layout to Ready is one stage step, 2 days of allowance; the close is
    // 20 days out and the due date sits before it.
    const pieces = [
      makePiece({ id: "p1", stage: "Layout", dueDate: "2026-08-12" }),
    ];
    const result = forecastIssue(pieces, "2026-08-30", TODAY);
    expect(result.atRisk).toEqual([]);
  });

  it("orders late pieces first, then by soonest due date", () => {
    const pieces = [
      makePiece({ id: "soon", stage: "Layout", dueDate: "2026-08-12" }),
      makePiece({
        id: "late",
        stage: "Layout",
        late: true,
        dueDate: "2026-08-09",
      }),
      makePiece({ id: "far", stage: "Layout", dueDate: "2026-08-25" }),
    ];
    // Every piece here misses the close (set well before all three due dates)
    // so every one of them is at risk, and only order is under test.
    const result = forecastIssue(pieces, "2026-08-11", TODAY);
    expect(result.atRisk.map((piece) => piece.id)).toEqual([
      "late",
      "soon",
      "far",
    ]);
  });
});

describe("forecastPieceReason", () => {
  it("gives each piece the reason forecastIssue records for it", () => {
    const pieces = [
      makePiece({ id: "late", stage: "Layout", late: true }),
      makePiece({ id: "after", stage: "Layout", dueDate: "2026-08-20" }),
      makePiece({ id: "tight", stage: "Commissioned", dueDate: "2026-08-13" }),
      makePiece({ id: "fine", stage: "Layout", dueDate: "2026-08-12" }),
    ];
    const { reasonByPieceId } = forecastIssue(pieces, "2026-08-15", TODAY);
    for (const piece of pieces) {
      expect(forecastPieceReason(piece, "2026-08-15", TODAY)).toBe(
        reasonByPieceId[piece.id] ?? null,
      );
    }
  });

  it("has nothing to say about Ready and Published pieces", () => {
    const readyPiece = makePiece({ stage: "Ready", late: true });
    const publishedPiece = makePiece({ stage: "Published", late: true });
    expect(forecastPieceReason(readyPiece, "2026-08-15", TODAY)).toBeNull();
    expect(forecastPieceReason(publishedPiece, "2026-08-15", TODAY)).toBeNull();
  });
});
