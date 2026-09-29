import { describe, expect, it } from "vitest";
import type { Editor, Piece } from "../data/desk.data";
import {
  CALENDAR_MAX_WEEKS,
  CALENDAR_OPEN_WEEKS,
  agendaDays,
  buildCalendarWeeks,
  calendarPieceOrder,
  fromIsoDay,
  lastCalendarDay,
  mondayOf,
  toIsoDay,
  type CalendarLayout,
} from "./piecesCalendarWeeks";

/** Wednesday 12 Aug 2026 at local noon, so no timezone moves the day. The
 *  calendar opens on Monday 10 Aug. */
const TODAY = new Date(2026, 7, 12, 12, 0, 0);

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

function allDays(layout: CalendarLayout) {
  return layout.weeks.flatMap((week) => week.days);
}

function dayOf(layout: CalendarLayout, isoDate: string) {
  const day = allDays(layout).find(
    (candidate) => candidate.isoDate === isoDate,
  );
  if (!day) throw new Error(`No cell for ${isoDate}`);
  return day;
}

describe("calendar day helpers", () => {
  it("reads a bare ISO day as local midnight", () => {
    const day = fromIsoDay("2026-08-10");
    expect(day.getFullYear()).toBe(2026);
    expect(day.getMonth()).toBe(7);
    expect(day.getDate()).toBe(10);
    expect(day.getHours()).toBe(0);
    expect(toIsoDay(day)).toBe("2026-08-10");
  });

  it("finds the Monday of the week, Sunday included", () => {
    expect(toIsoDay(mondayOf(TODAY))).toBe("2026-08-10");
    expect(toIsoDay(mondayOf(new Date(2026, 7, 16, 23, 30)))).toBe(
      "2026-08-10",
    );
    expect(toIsoDay(mondayOf(new Date(2026, 7, 10, 0, 5)))).toBe("2026-08-10");
  });
});

describe("buildCalendarWeeks range", () => {
  it("draws four weeks from this Monday when the issue has no close date", () => {
    const layout = buildCalendarWeeks([], TODAY, null, null);
    expect(layout.weeks).toHaveLength(CALENDAR_OPEN_WEEKS);
    expect(layout.weeks.every((week) => week.days.length === 7)).toBe(true);
    expect(layout.weeks[0]?.id).toBe("2026-08-10");
    expect(lastCalendarDay(layout)?.isoDate).toBe("2026-09-06");
  });

  it("runs through the week of the close date", () => {
    const layout = buildCalendarWeeks([], TODAY, "2026-08-21", null);
    expect(layout.weeks).toHaveLength(2);
    expect(lastCalendarDay(layout)?.isoDate).toBe("2026-08-23");
  });

  it("stretches to the latest due day when it falls after the close", () => {
    const layout = buildCalendarWeeks(
      [makePiece({ dueDate: "2026-08-28" })],
      TODAY,
      "2026-08-21",
      null,
    );
    expect(layout.weeks).toHaveLength(3);
  });

  it("caps the range at six weeks and lanes what falls beyond it", () => {
    const farPiece = makePiece({ id: "far", dueDate: "2026-12-01" });
    const layout = buildCalendarWeeks([farPiece], TODAY, "2026-11-30", null);
    expect(layout.weeks).toHaveLength(CALENDAR_MAX_WEEKS);
    expect(lastCalendarDay(layout)?.isoDate).toBe("2026-09-20");
    expect(layout.later.map((entry) => entry.piece.id)).toEqual(["far"]);
  });

  it("keeps one week for an issue that already closed", () => {
    const layout = buildCalendarWeeks([], TODAY, "2026-07-31", null);
    expect(layout.weeks).toHaveLength(1);
    expect(allDays(layout).every((day) => day.isAfterClose)).toBe(true);
  });

  it("walks one calendar day per cell across a DST change", () => {
    // Europe's clocks go forward on Sunday 29 March 2026.
    const layout = buildCalendarWeeks(
      [],
      new Date(2026, 2, 25, 12),
      "2026-04-10",
      null,
    );
    const isoDates = allDays(layout).map((day) => day.isoDate);
    expect(isoDates[0]).toBe("2026-03-23");
    expect(isoDates).toContain("2026-03-29");
    expect(isoDates).toContain("2026-03-30");
    expect(new Set(isoDates).size).toBe(isoDates.length);
    expect(isoDates.at(-1)).toBe("2026-04-12");
  });
});

describe("buildCalendarWeeks placement", () => {
  it("puts each piece on its due day, local calendar, in input order", () => {
    const first = makePiece({ id: "first", dueDate: "2026-08-14" });
    const second = makePiece({ id: "second", dueDate: "2026-08-14" });
    const monday = makePiece({ id: "monday", dueDate: "2026-08-10" });
    const layout = buildCalendarWeeks(
      [first, monday, second],
      TODAY,
      "2026-08-21",
      null,
    );
    expect(
      dayOf(layout, "2026-08-14").entries.map((entry) => entry.piece.id),
    ).toEqual(["first", "second"]);
    const mondayCell = dayOf(layout, "2026-08-10");
    expect(mondayCell.date.getDay()).toBe(1);
    expect(mondayCell.entries.map((entry) => entry.piece.id)).toEqual([
      "monday",
    ]);
  });

  it("reads an ISO `due` when `dueDate` is unset", () => {
    const layout = buildCalendarWeeks(
      [makePiece({ due: "2026-08-13" })],
      TODAY,
      null,
      null,
    );
    expect(dayOf(layout, "2026-08-13").entries).toHaveLength(1);
  });

  it("lanes undated pieces and pieces due before this week", () => {
    const undated = makePiece({ id: "undated", due: "" });
    const displayOnly = makePiece({ id: "display", due: "4 Aug" });
    const overdue = makePiece({ id: "overdue", dueDate: "2026-08-03" });
    const layout = buildCalendarWeeks(
      [undated, displayOnly, overdue],
      TODAY,
      "2026-08-21",
      null,
    );
    expect(layout.undated.map((entry) => entry.piece.id)).toEqual([
      "undated",
      "display",
    ]);
    expect(layout.earlier.map((entry) => entry.piece.id)).toEqual(["overdue"]);
    expect(layout.earlier[0]?.isLate).toBe(true);
    expect(allDays(layout).every((day) => day.entries.length === 0)).toBe(true);
  });

  it("places every piece exactly once", () => {
    const pieces = [
      makePiece({ id: "a", dueDate: "2026-08-01" }),
      makePiece({ id: "b", dueDate: "2026-08-12" }),
      makePiece({ id: "c" }),
      makePiece({ id: "d", dueDate: "2027-01-05" }),
    ];
    const layout = buildCalendarWeeks(pieces, TODAY, "2026-08-21", null);
    const placedIds = [
      ...layout.undated,
      ...layout.earlier,
      ...layout.later,
      ...allDays(layout).flatMap((day) => day.entries),
    ].map((entry) => entry.piece.id);
    expect(placedIds.sort()).toEqual(["a", "b", "c", "d"]);
  });
});

describe("buildCalendarWeeks markers and flags", () => {
  it("marks today, the close day, the publish day and the days after close", () => {
    const layout = buildCalendarWeeks([], TODAY, "2026-08-19", "2026-08-22");
    expect(allDays(layout).filter((day) => day.isToday)).toHaveLength(1);
    expect(dayOf(layout, "2026-08-12").isToday).toBe(true);
    expect(dayOf(layout, "2026-08-11").isPast).toBe(true);
    expect(dayOf(layout, "2026-08-12").isPast).toBe(false);
    expect(dayOf(layout, "2026-08-19").isCloseDay).toBe(true);
    expect(dayOf(layout, "2026-08-19").isAfterClose).toBe(false);
    expect(dayOf(layout, "2026-08-20").isAfterClose).toBe(true);
    expect(dayOf(layout, "2026-08-22").isPublishDay).toBe(true);
    expect(layout.closesOn).toBe("2026-08-19");
    expect(layout.publishesOn).toBe("2026-08-22");
  });

  it("flags work due after close, leaving Published work alone", () => {
    const afterClose = makePiece({ id: "after", dueDate: "2026-08-20" });
    const onClose = makePiece({ id: "on", dueDate: "2026-08-19" });
    const published = makePiece({
      id: "published",
      stage: "Published",
      due: "ready",
      dueDate: "2026-08-20",
    });
    const layout = buildCalendarWeeks(
      [afterClose, onClose, published],
      TODAY,
      "2026-08-19",
      null,
    );
    const flagged = allDays(layout)
      .flatMap((day) => day.entries)
      .filter((entry) => entry.isAfterClose)
      .map((entry) => entry.piece.id);
    expect(flagged).toEqual(["after"]);
  });

  it("gives the dot the waiting-on tone and marks the viewer's turn", () => {
    const layout = buildCalendarWeeks(
      [
        makePiece({ id: "you", wait: "you", dueDate: "2026-08-13" }),
        makePiece({ id: "writer", wait: "writer", dueDate: "2026-08-13" }),
        makePiece({ id: "nobody", dueDate: "2026-08-13" }),
        makePiece({
          id: "colleague",
          wait: "you",
          editorId: "someone-else",
          dueDate: "2026-08-13",
        }),
        makePiece({
          id: "reader",
          stage: "Sensitivity read",
          wait: "you",
          dueDate: "2026-08-13",
        }),
      ],
      TODAY,
      null,
      null,
      "marta",
    );
    const entries = dayOf(layout, "2026-08-13").entries;
    expect(entries.map((entry) => entry.waitTone)).toEqual([
      "you",
      "writer",
      "neutral",
      "neutral",
      "writer",
    ]);
    expect(entries.map((entry) => entry.isYourTurn)).toEqual([
      true,
      false,
      false,
      false,
      false,
    ]);
  });

  it("names the waiting party the way the table's Waiting on does", () => {
    const editors: Editor[] = [
      {
        id: "sara",
        name: "Sara Pinheiro",
        initials: "SP",
        tint: "jade",
        cap: 7,
      },
    ];
    const layout = buildCalendarWeeks(
      [
        makePiece({ id: "you", wait: "you", dueDate: "2026-08-13" }),
        makePiece({ id: "writer", wait: "writer", dueDate: "2026-08-13" }),
        makePiece({ id: "nobody", dueDate: "2026-08-13" }),
        makePiece({
          id: "colleague",
          wait: "you",
          editorId: "sara",
          dueDate: "2026-08-13",
        }),
        makePiece({
          id: "reader",
          stage: "Sensitivity read",
          wait: "you",
          dueDate: "2026-08-13",
        }),
      ],
      TODAY,
      null,
      null,
      "marta",
      editors,
    );
    const entries = dayOf(layout, "2026-08-13").entries;
    expect(
      entries.map((entry) =>
        entry.waitingOn
          ? (entry.waitingOn.name ?? entry.waitingOn.labelKey)
          : null,
      ),
    ).toEqual([
      "magazine:desk.pieceRow.you",
      "magazine:desk.pieceRow.writer",
      null,
      "Sara",
      "magazine:desk.pieceRow.reader",
    ]);
  });

  it("ignores a close date that is not an ISO day", () => {
    const layout = buildCalendarWeeks([], TODAY, "14 Aug", null);
    expect(layout.closesOn).toBeNull();
    expect(layout.weeks).toHaveLength(CALENDAR_OPEN_WEEKS);
  });
});

/** An ISO instant at a local hour on a local day, so the go-live day reads
 *  the same in every timezone the suite runs in. */
function localInstant(month: number, day: number, hour: number): string {
  return new Date(2026, month, day, hour, 0, 0).toISOString();
}

describe("buildCalendarWeeks scheduled pieces", () => {
  it("files a scheduled piece with no due date on its go-live day", () => {
    const scheduled = makePiece({
      id: "scheduled",
      stage: "Ready",
      publishedAt: localInstant(7, 14, 10),
    });
    const layout = buildCalendarWeeks([scheduled], TODAY, "2026-08-21", null);
    expect(layout.undated).toHaveLength(0);
    const friday = dayOf(layout, "2026-08-14");
    expect(friday.entries.map((entry) => entry.piece.id)).toEqual([
      "scheduled",
    ]);
    expect(friday.entries[0]?.goesLiveOn).toBe("2026-08-14");
    expect(friday.entries[0]?.dueDate).toBeNull();
  });

  it("keeps a scheduled piece with a due date on its due day", () => {
    const scheduled = makePiece({
      stage: "Ready",
      dueDate: "2026-08-11",
      publishedAt: localInstant(7, 14, 10),
    });
    const layout = buildCalendarWeeks([scheduled], TODAY, "2026-08-21", null);
    expect(dayOf(layout, "2026-08-11").entries).toHaveLength(1);
    expect(dayOf(layout, "2026-08-14").entries).toHaveLength(0);
  });

  it("stretches the range to reach a go-live day past the close", () => {
    const scheduled = makePiece({
      stage: "Ready",
      publishedAt: localInstant(7, 26, 9),
    });
    const layout = buildCalendarWeeks([scheduled], TODAY, "2026-08-14", null);
    expect(layout.weeks).toHaveLength(3);
    expect(dayOf(layout, "2026-08-26").entries).toHaveLength(1);
  });

  it("leaves a piece already live with no due date in the no-date lane", () => {
    const live = makePiece({
      id: "live",
      stage: "Ready",
      publishedAt: localInstant(7, 5, 9),
    });
    const layout = buildCalendarWeeks([live], TODAY, "2026-08-21", null);
    expect(layout.undated.map((entry) => entry.piece.id)).toEqual(["live"]);
    expect(layout.undated[0]?.goesLiveOn).toBeNull();
  });

  it("lanes a go-live day beyond the last week drawn as later", () => {
    const scheduled = makePiece({
      id: "far",
      stage: "Ready",
      publishedAt: localInstant(11, 1, 9),
    });
    const layout = buildCalendarWeeks([scheduled], TODAY, "2026-08-21", null);
    expect(layout.later.map((entry) => entry.piece.id)).toEqual(["far"]);
  });
});

describe("calendarPieceOrder", () => {
  it("walks the lanes first, then the grid day by day", () => {
    const layout = buildCalendarWeeks(
      [
        makePiece({ id: "friday", dueDate: "2026-08-14" }),
        makePiece({ id: "undated" }),
        makePiece({ id: "far", dueDate: "2026-12-01" }),
        makePiece({ id: "tuesday", dueDate: "2026-08-11" }),
        makePiece({ id: "earlier", dueDate: "2026-08-03" }),
      ],
      TODAY,
      "2026-08-21",
      null,
    );
    expect(calendarPieceOrder(layout).map((piece) => piece.id)).toEqual([
      "undated",
      "earlier",
      "far",
      "tuesday",
      "friday",
    ]);
  });
});

describe("agendaDays", () => {
  it("keeps the days with work plus the close day", () => {
    const layout = buildCalendarWeeks(
      [makePiece({ dueDate: "2026-08-14" })],
      TODAY,
      "2026-08-19",
      null,
    );
    expect(agendaDays(layout).map((day) => day.isoDate)).toEqual([
      "2026-08-14",
      "2026-08-19",
    ]);
  });
});
