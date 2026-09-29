import { describe, expect, it } from "vitest";
import type { Piece } from "../data/desk.data";
import {
  DESK_FOCUS_DEFINITIONS,
  countForFocus,
  isDeskFocusId,
  matchesAllFocus,
  type DeskFocusId,
} from "./deskFocus";
import { forecastIssue } from "./deskForecast";
import { readFocusParam } from "./useDeskFocus";

const ME = "marta";

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "A piece",
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Someone",
    editorId: ME,
    stage: "Edit",
    due: "",
    art: "in",
    issueId: null,
    ...overrides,
  };
}

function matches(id: DeskFocusId, piece: Piece, today?: Date): boolean {
  return matchesAllFocus(piece, ME, [id], today);
}

describe("DESK_FOCUS_DEFINITIONS", () => {
  it("lists every chip once, in display order, each with a focus label key", () => {
    expect(DESK_FOCUS_DEFINITIONS.map((definition) => definition.id)).toEqual([
      "your-turn",
      "late",
      "stalled",
      "with-writers",
      "needs-art",
      "sensitivity",
      "ready",
      "unpaid",
      "mine",
      "new-voices",
      "at-risk",
    ]);
    for (const definition of DESK_FOCUS_DEFINITIONS) {
      expect(definition.labelKey).toMatch(/^magazine:desk\.focus\.[a-zA-Z]+$/);
    }
  });
});

describe("focus predicates", () => {
  it("your-turn needs the piece waiting on me AND edited by me", () => {
    expect(matches("your-turn", makePiece({ wait: "you" }))).toBe(true);
    expect(
      matches("your-turn", makePiece({ wait: "you", editorId: "sara" })),
    ).toBe(false);
    expect(matches("your-turn", makePiece({ wait: "writer" }))).toBe(false);
  });

  it("your-turn leaves out a piece out with the sensitivity reader", () => {
    expect(
      matches(
        "your-turn",
        makePiece({ stage: "Sensitivity read", wait: "you" }),
      ),
    ).toBe(false);
    expect(
      matches("your-turn", makePiece({ stage: "Layout", wait: "you" })),
    ).toBe(true);
  });

  it("your-turn is empty while the viewer is unknown", () => {
    const unassignedPiece = makePiece({ wait: "you", editorId: "" });
    expect(matchesAllFocus(unassignedPiece, "", ["your-turn"])).toBe(false);
  });

  it("new-voices matches first-time writers still in flight", () => {
    expect(matches("new-voices", makePiece({ fresh: true }))).toBe(true);
    expect(matches("new-voices", makePiece({ fresh: false }))).toBe(false);
    expect(matches("new-voices", makePiece())).toBe(false);
    expect(
      matches("new-voices", makePiece({ fresh: true, stage: "Published" })),
    ).toBe(false);
  });

  it("late, with-writers and needs-art read their flags", () => {
    expect(matches("late", makePiece({ late: true }))).toBe(true);
    expect(matches("late", makePiece({ late: false }))).toBe(false);
    expect(matches("with-writers", makePiece({ wait: "writer" }))).toBe(true);
    expect(matches("needs-art", makePiece({ art: "none" }))).toBe(true);
    expect(matches("needs-art", makePiece({ art: "brief" }))).toBe(true);
    expect(matches("needs-art", makePiece({ art: "in" }))).toBe(false);
  });

  it("stalled reads stageAge's isStalled, pinned to the today it is given", () => {
    const today = new Date(2026, 7, 10, 12, 0, 0);
    const daysAgo = (days: number) =>
      new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    expect(
      matches(
        "stalled",
        makePiece({ stage: "Edit", stageEnteredAt: daysAgo(5) }),
        today,
      ),
    ).toBe(true);
    expect(
      matches(
        "stalled",
        makePiece({ stage: "Edit", stageEnteredAt: daysAgo(4) }),
        today,
      ),
    ).toBe(false);
    expect(matches("stalled", makePiece({ stage: "Edit" }), today)).toBe(false);
    expect(
      matches(
        "stalled",
        makePiece({ stage: "Published", stageEnteredAt: daysAgo(30) }),
        today,
      ),
    ).toBe(false);
  });

  it("sensitivity and ready match their stage", () => {
    expect(
      matches("sensitivity", makePiece({ stage: "Sensitivity read" })),
    ).toBe(true);
    expect(matches("sensitivity", makePiece({ stage: "Edit" }))).toBe(false);
    expect(matches("ready", makePiece({ stage: "Ready" }))).toBe(true);
  });

  it("ready leaves out a piece scheduled ahead of today, but keeps a live Ready piece whose date has passed", () => {
    const today = new Date(2026, 7, 10, 12, 0, 0);
    const hoursFromToday = (hours: number) =>
      new Date(today.getTime() + hours * 60 * 60 * 1000).toISOString();
    expect(
      matches(
        "ready",
        makePiece({ stage: "Ready", publishedAt: hoursFromToday(2) }),
        today,
      ),
    ).toBe(false);
    // A publish date already in the past still offers Publish
    // (pieceNextAction), so this piece belongs in the count same as any
    // other Ready piece.
    expect(
      matches(
        "ready",
        makePiece({ stage: "Ready", publishedAt: hoursFromToday(-2) }),
        today,
      ),
    ).toBe(true);
    expect(
      matches("ready", makePiece({ stage: "Ready", publishedAt: null }), today),
    ).toBe(true);
  });

  it("unpaid counts pieces whose writer is owed, Published included", () => {
    expect(matches("unpaid", makePiece({ paymentStatus: "owed" }))).toBe(true);
    expect(
      matches(
        "unpaid",
        makePiece({ stage: "Published", paymentStatus: "owed" }),
      ),
    ).toBe(true);
    expect(
      matches("unpaid", makePiece({ stage: "Layout", paymentStatus: "paid" })),
    ).toBe(false);
    expect(
      matches("unpaid", makePiece({ stage: "Ready", paymentStatus: "none" })),
    ).toBe(false);
    expect(matches("unpaid", makePiece({ stage: "Layout" }))).toBe(false);
  });

  it("every chip except unpaid leaves published pieces out", () => {
    const publishedPiece = makePiece({
      stage: "Published",
      wait: "you",
      late: true,
      art: "none",
      paymentStatus: "owed",
      fresh: true,
    });
    for (const definition of DESK_FOCUS_DEFINITIONS) {
      expect(definition.matches(publishedPiece, ME)).toBe(
        definition.id === "unpaid",
      );
    }
  });
});

describe("countForFocus and matchesAllFocus", () => {
  const pieces = [
    makePiece({ id: "a", wait: "you", late: true }),
    makePiece({ id: "b", wait: "you" }),
    makePiece({ id: "c", late: true, editorId: "sara" }),
  ];

  it("counts the pieces one chip would show", () => {
    expect(countForFocus(pieces, ME, "your-turn")).toBe(2);
    expect(countForFocus(pieces, ME, "late")).toBe(2);
    expect(countForFocus(pieces, ME, "mine")).toBe(2);
  });

  it("ANDs several chips together, and no chips matches everything", () => {
    const bothIds = pieces
      .filter((piece) => matchesAllFocus(piece, ME, ["your-turn", "late"]))
      .map((piece) => piece.id);
    expect(bothIds).toEqual(["a"]);
    expect(pieces.every((piece) => matchesAllFocus(piece, ME, []))).toBe(true);
  });
});

describe("the at-risk chip", () => {
  /** Local noon, so no timezone can push the calendar day either way. */
  const TODAY = new Date(2026, 7, 10, 12, 0, 0);
  const CLOSES_ON = "2026-08-15";
  const pieces = [
    makePiece({ id: "late", stage: "Layout", late: true }),
    makePiece({ id: "after-close", stage: "Layout", dueDate: "2026-08-20" }),
    makePiece({
      id: "too-tight",
      stage: "Commissioned",
      dueDate: "2026-08-13",
    }),
    makePiece({ id: "on-track", stage: "Layout", dueDate: "2026-08-12" }),
    makePiece({ id: "ready", stage: "Ready", late: true }),
  ];

  it("matches exactly the pieces the forecast lists", () => {
    const chipIds = pieces
      .filter((piece) =>
        matchesAllFocus(piece, ME, ["at-risk"], TODAY, CLOSES_ON),
      )
      .map((piece) => piece.id);
    const forecastIds = forecastIssue(pieces, CLOSES_ON, TODAY).atRisk.map(
      (piece) => piece.id,
    );
    expect(chipIds.sort()).toEqual([...forecastIds].sort());
    expect(chipIds.sort()).toEqual(["after-close", "late", "too-tight"]);
    expect(countForFocus(pieces, ME, "at-risk", TODAY, CLOSES_ON)).toBe(3);
  });

  it("matches nothing without a close date (outside the issue scope)", () => {
    expect(countForFocus(pieces, ME, "at-risk", TODAY)).toBe(0);
    expect(countForFocus(pieces, ME, "at-risk", TODAY, null)).toBe(0);
  });
});

describe("focus ids in the URL", () => {
  it("drops unknown ids and repeats, and returns registry order", () => {
    expect(readFocusParam("late,bogus,your-turn,late")).toEqual([
      "your-turn",
      "late",
    ]);
    expect(readFocusParam(null)).toEqual([]);
    expect(readFocusParam("")).toEqual([]);
  });

  it("isDeskFocusId accepts only known ids", () => {
    expect(isDeskFocusId("needs-art")).toBe(true);
    expect(isDeskFocusId("at-risk")).toBe(true);
    expect(isDeskFocusId("needsArt")).toBe(false);
  });
});
