import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEMO_PIECES, DEMO_STAGES } from "../data/desk.data";
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

  it("mine=true narrows visiblePieces to pieces whose editorId matches me", () => {
    const { result } = renderHook(() => useDeskState(DEMO_PIECES, ME));

    act(() => result.current.setMine(true));

    expect(result.current.visiblePieces.length).toBeGreaterThan(0);
    expect(
      result.current.visiblePieces.every((piece) => piece.editorId === ME),
    ).toBe(true);
    expect(result.current.visiblePieces).toHaveLength(
      DEMO_PIECES.filter((piece) => piece.editorId === ME).length,
    );
  });

  it("a saved view (v-late) narrows visiblePieces to late-or-waiting-on-writer pieces", () => {
    const { result } = renderHook(() => useDeskState(DEMO_PIECES, ME));

    act(() => result.current.setView("v-late"));

    const expectedIds = DEMO_PIECES.filter(
      (piece) => !!piece.late || piece.wait === "writer",
    ).map((piece) => piece.id);

    expect(expectedIds.length).toBeGreaterThan(0);
    expect(
      result.current.visiblePieces.map((piece) => piece.id).sort(),
    ).toEqual(expectedIds.sort());
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
});
