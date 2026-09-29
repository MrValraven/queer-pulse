import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_PIECES, DEMO_STAGES } from "../data/desk.data";
import { DESK_DENSITY_STORAGE_KEY } from "./deskDensity";
import { countForFocus, matchesAllFocus } from "./deskFocus";
import { useDeskState } from "./useDeskState";

/**
 * Pure UI-state test: `useDeskState` never fetches (its caller passes in
 * the already-loaded pieces), so this exercises `visiblePieces`'s filter/sort
 * pipeline directly against `DEMO_PIECES` with no provider/network setup.
 */

const ME = "marta";

describe("useDeskState", () => {
  it("defaults to showing every piece, unfiltered", () => {
    const { result } = renderHook(() => useDeskState(DEMO_PIECES, ME));

    expect(result.current.visiblePieces).toHaveLength(DEMO_PIECES.length);
  });

  it("fmt='deck' narrows visiblePieces to decks only", () => {
    const { result } = renderHook(() => useDeskState(DEMO_PIECES, ME));

    act(() => result.current.setFmt("deck"));

    expect(result.current.visiblePieces.length).toBeGreaterThan(0);
    expect(
      result.current.visiblePieces.every((piece) => piece.format === "deck"),
    ).toBe(true);
    expect(result.current.visiblePieces).toHaveLength(
      DEMO_PIECES.filter((piece) => piece.format === "deck").length,
    );
  });

  it("q filters visiblePieces by a title substring", () => {
    const { result } = renderHook(() => useDeskState(DEMO_PIECES, ME));
    const target = DEMO_PIECES.find((piece) => piece.id === "p11")!;

    act(() => result.current.setQ("waiting room"));

    expect(result.current.visiblePieces).toHaveLength(1);
    expect(result.current.visiblePieces[0]!.id).toBe(target.id);
  });

  it("sort='stage' orders visiblePieces by DEMO_STAGES index", () => {
    const { result } = renderHook(() => useDeskState(DEMO_PIECES, ME));

    act(() => result.current.setSort("stage"));

    const stageIndices = result.current.visiblePieces.map((piece) =>
      DEMO_STAGES.indexOf(piece.stage),
    );
    for (let position = 1; position < stageIndices.length; position += 1) {
      expect(stageIndices[position]).toBeGreaterThanOrEqual(
        stageIndices[position - 1]!,
      );
    }
  });

  it("sort='due' puts late first, then soonest dueDate, then undated and ready", () => {
    const basePiece = DEMO_PIECES[0]!;
    const pieces = [
      { ...basePiece, id: "undated", late: false, due: "", dueDate: undefined },
      {
        ...basePiece,
        id: "later",
        late: false,
        due: "12 Aug",
        dueDate: "2026-08-12",
      },
      {
        ...basePiece,
        id: "late",
        late: true,
        due: "20 Aug",
        dueDate: "2026-08-20",
      },
      {
        ...basePiece,
        id: "sooner",
        late: false,
        due: "8 Aug",
        dueDate: "2026-08-08",
      },
      {
        ...basePiece,
        id: "ready",
        stage: "Ready" as const,
        late: false,
        due: "ready",
        dueDate: "2026-08-01",
      },
    ];
    const { result } = renderHook(() => useDeskState(pieces, ME));

    expect(result.current.sort).toBe("due");
    expect(result.current.visiblePieces.map((piece) => piece.id)).toEqual([
      "late",
      "sooner",
      "later",
      "undated",
      "ready",
    ]);
  });

  it("q also matches a piece's kind", () => {
    const { result } = renderHook(() => useDeskState(DEMO_PIECES, ME));

    act(() => result.current.setQ("book review"));

    expect(result.current.visiblePieces.map((piece) => piece.id)).toEqual([
      "p10",
    ]);
  });

  it("activeFocusIds narrows visiblePieces to pieces matching every chip", () => {
    const { result } = renderHook(() =>
      useDeskState(DEMO_PIECES, ME, {
        activeFocusIds: ["with-writers", "late"],
      }),
    );

    const expectedIds = DEMO_PIECES.filter((piece) =>
      matchesAllFocus(piece, ME, ["with-writers", "late"]),
    ).map((piece) => piece.id);

    expect(expectedIds.length).toBeGreaterThan(0);
    expect(
      result.current.visiblePieces.map((piece) => piece.id).sort(),
    ).toEqual(expectedIds.sort());
  });

  it("sectionFilter and stageFilter narrow visiblePieces, empty shows all", () => {
    const { result } = renderHook(() => useDeskState(DEMO_PIECES, ME));

    act(() => result.current.setSectionFilter(["Reported", "Essays"]));
    expect(
      result.current.visiblePieces.every((piece) =>
        ["Reported", "Essays"].includes(piece.section),
      ),
    ).toBe(true);
    expect(result.current.visiblePieces).toHaveLength(
      DEMO_PIECES.filter((piece) =>
        ["Reported", "Essays"].includes(piece.section),
      ).length,
    );

    act(() => result.current.setStageFilter(["Drafting"]));
    expect(result.current.visiblePieces.map((piece) => piece.id)).toEqual([
      "p11",
    ]);

    act(() => {
      result.current.setSectionFilter([]);
      result.current.setStageFilter([]);
    });
    expect(result.current.visiblePieces).toHaveLength(DEMO_PIECES.length);
  });

  it("editorFilter shows one editor's queue", () => {
    const { result } = renderHook(() => useDeskState(DEMO_PIECES, ME));

    act(() => result.current.setEditorFilter("sara"));

    expect(result.current.visiblePieces.length).toBeGreaterThan(0);
    expect(
      result.current.visiblePieces.every((piece) => piece.editorId === "sara"),
    ).toBe(true);
  });

  it("groups by waiting by default and lets the caller change it", () => {
    const { result } = renderHook(() => useDeskState(DEMO_PIECES, ME));

    expect(result.current.groupBy).toBe("waiting");
    act(() => result.current.setGroupBy("section"));
    expect(result.current.groupBy).toBe("section");
  });
});

describe("useDeskState density", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("defaults to comfortable and remembers compact across mounts", () => {
    const { result, unmount } = renderHook(() => useDeskState(DEMO_PIECES, ME));

    expect(result.current.density).toBe("comfortable");
    act(() => result.current.setDensity("compact"));
    expect(result.current.density).toBe("compact");
    expect(window.localStorage.getItem(DESK_DENSITY_STORAGE_KEY)).toBe(
      "compact",
    );
    unmount();

    const { result: remounted } = renderHook(() =>
      useDeskState(DEMO_PIECES, ME),
    );
    expect(remounted.current.density).toBe("compact");
  });

  it("still works when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = renderHook(() => useDeskState(DEMO_PIECES, ME));

    expect(result.current.density).toBe("comfortable");
    act(() => result.current.setDensity("compact"));
    expect(result.current.density).toBe("compact");
  });
});

describe("useDeskState pitch selection", () => {
  it("keeps a selected pitch id when no pitchIds are passed", () => {
    const { result } = renderHook(() => useDeskState(DEMO_PIECES, ME));

    act(() => result.current.toggleSelect("pitch-1"));

    expect(result.current.selected).toEqual(["pitch-1"]);
  });

  it("drops a selected pitch id once it falls out of pitchIds, and it does not come back", () => {
    const { result, rerender } = renderHook(
      ({ pitchIds }: { pitchIds: string[] }) =>
        useDeskState(DEMO_PIECES, ME, { pitchIds }),
      { initialProps: { pitchIds: ["pitch-1", "pitch-2"] } },
    );

    act(() => result.current.toggleSelect("pitch-1"));
    expect(result.current.selected).toEqual(["pitch-1"]);

    // The pitch answered and left the queue.
    rerender({ pitchIds: ["pitch-2"] });
    expect(result.current.selected).toEqual([]);

    // A later refetch brings the id back into the list, but not selected.
    rerender({ pitchIds: ["pitch-1", "pitch-2"] });
    expect(result.current.selected).toEqual([]);
  });
});

describe("useDeskState stalled filter", () => {
  afterEach(() => vi.useRealTimers());

  it("keeps a piece at exactly its stall threshold, as the chip counts it", () => {
    // Mid-afternoon, so a midnight clock would read the piece a day younger.
    const now = new Date(2026, 7, 10, 15, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
    const [basePiece] = DEMO_PIECES;
    // Edit stalls at 5 days; this piece entered Edit exactly 5 days ago.
    const thresholdPiece = {
      ...basePiece!,
      id: "at-threshold",
      stage: "Edit" as const,
      stageEnteredAt: new Date(now.getTime() - fiveDaysInMs).toISOString(),
    };

    expect(countForFocus([thresholdPiece], ME, "stalled")).toBe(1);
    const { result } = renderHook(() =>
      useDeskState([thresholdPiece], ME, {
        activeFocusIds: ["stalled"],
        closesOn: "2026-08-20",
      }),
    );
    expect(result.current.visiblePieces.map((piece) => piece.id)).toEqual([
      "at-threshold",
    ]);
  });
});
