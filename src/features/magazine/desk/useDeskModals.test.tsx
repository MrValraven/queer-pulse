import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_PIECES, type Piece } from "../data/desk.data";
import { usePieceMutations } from "../api/usePieceMutations";
import { usePitchMutations } from "../api/usePitchMutations";
import { useDeskModals } from "./useDeskModals";

function demoPiece(index: number): Piece {
  const piece = DEMO_PIECES[index];
  if (!piece) throw new Error(`No demo piece at ${index}`);
  return piece;
}

const QUEUE = [demoPiece(0), demoPiece(1), demoPiece(2)];

function Wrapper({ children }: { children: ReactNode }) {
  return <TestProviders>{children}</TestProviders>;
}

function renderModals() {
  return renderHook(
    () =>
      useDeskModals({
        activeMe: "marta",
        currentIssueId: "",
        pieceMutations: usePieceMutations(),
        pitchMutations: usePitchMutations(),
      }),
    { wrapper: Wrapper },
  );
}

function chasedPieceId(modal: ReturnType<typeof useDeskModals>["modal"]) {
  return modal?.kind === "chase" ? modal.piece.id : null;
}

describe("useDeskModals chase queue", () => {
  it("Skip moves on to the next writer with its progress", () => {
    const { result } = renderModals();

    act(() => result.current.openChaseQueue(QUEUE));
    expect(chasedPieceId(result.current.modal)).toBe(QUEUE[0]?.id);

    act(() => result.current.skipChase());
    const modal = result.current.modal;
    expect(chasedPieceId(modal)).toBe(QUEUE[1]?.id);
    expect(modal?.kind === "chase" && modal.progress).toEqual({
      current: 2,
      total: 3,
    });
  });

  it("closing a queued chase ends the whole queue", () => {
    const { result } = renderModals();

    act(() => result.current.openChaseQueue(QUEUE));
    act(() => result.current.close());
    expect(result.current.modal).toBeNull();

    // Nothing is left to skip to once the queue has been closed.
    act(() => result.current.skipChase());
    expect(result.current.modal).toBeNull();
  });

  it("opening another overlay drops a running queue", () => {
    const { result } = renderModals();

    act(() => result.current.openChaseQueue(QUEUE));
    act(() => result.current.openShortcuts());
    expect(result.current.modal?.kind).toBe("shortcuts");

    act(() => result.current.close());
    expect(result.current.modal).toBeNull();
  });

  it("skipping past the last writer empties the slot", () => {
    const { result } = renderModals();

    act(() => result.current.openChaseQueue(QUEUE.slice(0, 2)));
    act(() => result.current.skipChase());
    act(() => result.current.skipChase());
    expect(result.current.modal).toBeNull();
  });
});
