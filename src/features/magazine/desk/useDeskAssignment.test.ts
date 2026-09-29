import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Piece } from "../data/desk.data";
import type { UseDeskPieceSelectionResult } from "./useDeskPieceSelection";
import { useDeskAssignment } from "./useDeskAssignment";

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

function makePieceSelection(
  selectedPieceIds: string[],
): UseDeskPieceSelectionResult {
  return {
    selectedPieceIds,
    isPieceSelected: (pieceId) => selectedPieceIds.includes(pieceId),
    togglePieceSelect: vi.fn(),
    toggleSelectAll: vi.fn(),
    selectAll: vi.fn(),
    areAllSelected: false,
    clearPieceSelection: vi.fn(),
  };
}

const TARGET = { id: "issue-9", number: "09" };

describe("useDeskAssignment single-target submit", () => {
  it("clears the piece selection on success when the target came from the bulk bar's own selection", () => {
    const pieceA = makePiece("a");
    const pieceSelection = makePieceSelection(["a"]);
    // Resolves synchronously, like the batch path's own onSuccess.
    const assignPieceToIssue = vi.fn(
      (_piece: Piece, _target: typeof TARGET | null, onSuccess?: () => void) =>
        onSuccess?.(),
    );

    const { result } = renderHook(() =>
      useDeskAssignment({
        pieceMutations: { assignIssue: { mutate: vi.fn() } } as never,
        pieceSelection,
        assignPieceToIssue,
        pitchSelection: { clearSelected: vi.fn() },
        showToast: vi.fn(),
        translate: (key: string) => key,
      }),
    );

    act(() => result.current.openForSelection([pieceA]));
    act(() => result.current.submit(TARGET));

    expect(assignPieceToIssue).toHaveBeenCalledWith(
      pieceA,
      TARGET,
      expect.any(Function),
    );
    expect(pieceSelection.clearPieceSelection).toHaveBeenCalledTimes(1);
  });

  it("leaves an unrelated selection alone for a row-level single-piece move", () => {
    const rowPiece = makePiece("row-only");
    // A different piece is bulk-selected; the row action targets a piece
    // that was never part of that selection.
    const pieceSelection = makePieceSelection(["some-other-id"]);
    const assignPieceToIssue = vi.fn(
      (_piece: Piece, _target: typeof TARGET | null, onSuccess?: () => void) =>
        onSuccess?.(),
    );

    const { result } = renderHook(() =>
      useDeskAssignment({
        pieceMutations: { assignIssue: { mutate: vi.fn() } } as never,
        pieceSelection,
        assignPieceToIssue,
        pitchSelection: { clearSelected: vi.fn() },
        showToast: vi.fn(),
        translate: (key: string) => key,
      }),
    );

    act(() => result.current.openForPiece(rowPiece));
    act(() => result.current.submit(TARGET));

    expect(assignPieceToIssue).toHaveBeenCalledWith(
      rowPiece,
      TARGET,
      undefined,
    );
    expect(pieceSelection.clearPieceSelection).not.toHaveBeenCalled();
  });
});
