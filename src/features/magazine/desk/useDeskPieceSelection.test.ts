import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Piece } from "../data/desk.data";
import { useDeskPieceSelection } from "./useDeskPieceSelection";

function makePiece(id: string): Piece {
  return {
    id,
    title: `Piece ${id}`,
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Someone",
    editorId: "marta",
    stage: "Edit",
    due: "",
    art: "in",
    issueId: null,
  };
}

const PIECES: Piece[] = [makePiece("a"), makePiece("b"), makePiece("c")];

describe("useDeskPieceSelection selectAll", () => {
  it("selects every visible piece from an empty selection", () => {
    const { result } = renderHook(() => useDeskPieceSelection(PIECES));

    act(() => result.current.selectAll());

    expect(result.current.selectedPieceIds).toEqual(["a", "b", "c"]);
    expect(result.current.areAllSelected).toBe(true);
  });

  it("selects every visible piece from a partial selection, without toggling off", () => {
    const { result } = renderHook(() => useDeskPieceSelection(PIECES));

    act(() => result.current.togglePieceSelect("b"));
    expect(result.current.selectedPieceIds).toEqual(["b"]);

    act(() => result.current.selectAll());

    expect(result.current.selectedPieceIds).toEqual(["a", "b", "c"]);
  });

  it("stays fully selected when called again with everything already selected", () => {
    // The behaviour `selectAll` exists for: it stays a plain select, unlike
    // `toggleSelectAll`'s on/off pair, so calling it again while everything
    // is already selected keeps the selection instead of clearing it, the
    // way the bulk bar's "Select all {count}" action needs it to.
    const { result } = renderHook(() => useDeskPieceSelection(PIECES));

    act(() => result.current.selectAll());
    act(() => result.current.selectAll());

    expect(result.current.selectedPieceIds).toEqual(["a", "b", "c"]);
  });
});

describe("useDeskPieceSelection pruning", () => {
  it("drops a selected piece that a filter hides, and does not bring it back once the filter clears", async () => {
    const { result, rerender } = renderHook(
      ({ pieces }: { pieces: Piece[] }) => useDeskPieceSelection(pieces),
      { initialProps: { pieces: PIECES } },
    );

    act(() => result.current.togglePieceSelect("b"));
    expect(result.current.selectedPieceIds).toEqual(["b"]);

    // A filter narrows the visible pieces to exclude "b".
    rerender({ pieces: [PIECES[0]!, PIECES[2]!] });
    await waitFor(() => expect(result.current.selectedPieceIds).toEqual([]));

    // Clearing the filter brings "b" back into view, but not back selected.
    rerender({ pieces: PIECES });
    expect(result.current.selectedPieceIds).toEqual([]);
  });
});
