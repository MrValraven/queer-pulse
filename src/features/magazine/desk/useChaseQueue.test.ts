import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DEMO_PIECES, type Piece } from "../data/desk.data";
import { chaseModalFor, chaseStepAt, useChaseQueue } from "./useChaseQueue";

function demoPiece(index: number): Piece {
  const piece = DEMO_PIECES[index];
  if (!piece) throw new Error(`No demo piece at ${index}`);
  return piece;
}

const FIRST = demoPiece(0);
const SECOND = demoPiece(1);
const THIRD = demoPiece(2);

describe("chaseStepAt", () => {
  it("numbers steps from 1 and stops past the end", () => {
    expect(chaseStepAt([FIRST, SECOND], 1)).toEqual({
      piece: SECOND,
      progress: { current: 2, total: 2 },
    });
    expect(chaseStepAt([FIRST, SECOND], 2)).toBeNull();
  });
});

describe("chaseModalFor", () => {
  it("carries progress only for a queue of more than one piece", () => {
    const single = chaseModalFor({
      piece: FIRST,
      progress: { current: 1, total: 1 },
    });
    expect(single.progress).toBeUndefined();
    expect(single.piece.id).toBe(FIRST.id);

    const queued = chaseModalFor({
      piece: SECOND,
      progress: { current: 2, total: 3 },
    });
    expect(queued.progress).toEqual({ current: 2, total: 3 });
  });
});

describe("useChaseQueue", () => {
  it("walks the queue in order and forgets it at the end", () => {
    const show = vi.fn();
    const { result } = renderHook(() => useChaseQueue(show));

    act(() => result.current.openChaseQueue([FIRST, SECOND, THIRD]));
    expect(show).toHaveBeenLastCalledWith({
      piece: FIRST,
      progress: { current: 1, total: 3 },
    });

    let hasNext = false;
    act(() => {
      hasNext = result.current.advance();
    });
    expect(hasNext).toBe(true);
    expect(show).toHaveBeenLastCalledWith({
      piece: SECOND,
      progress: { current: 2, total: 3 },
    });

    act(() => {
      hasNext = result.current.advance();
    });
    expect(show).toHaveBeenLastCalledWith({
      piece: THIRD,
      progress: { current: 3, total: 3 },
    });

    act(() => {
      hasNext = result.current.advance();
    });
    expect(hasNext).toBe(false);
    expect(show).toHaveBeenCalledTimes(3);
  });

  it("does nothing for an empty queue", () => {
    const show = vi.fn();
    const { result } = renderHook(() => useChaseQueue(show));
    act(() => result.current.openChaseQueue([]));
    expect(show).not.toHaveBeenCalled();
  });

  it("stop ends a running queue, so the next step shows nothing", () => {
    const show = vi.fn();
    const { result } = renderHook(() => useChaseQueue(show));
    act(() => result.current.openChaseQueue([FIRST, SECOND, THIRD]));
    act(() => result.current.stop());

    let hasNext = true;
    act(() => {
      hasNext = result.current.advance();
    });
    expect(hasNext).toBe(false);
    expect(show).toHaveBeenCalledTimes(1);
  });

  it("a single chase drops a running queue", () => {
    const show = vi.fn();
    const { result } = renderHook(() => useChaseQueue(show));
    act(() => result.current.openChaseQueue([FIRST, SECOND]));
    act(() => result.current.openChase(THIRD));
    expect(show).toHaveBeenLastCalledWith({
      piece: THIRD,
      progress: { current: 1, total: 1 },
    });

    let hasNext = true;
    act(() => {
      hasNext = result.current.advance();
    });
    expect(hasNext).toBe(false);
  });
});
