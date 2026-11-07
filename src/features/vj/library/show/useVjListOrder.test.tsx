import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useVjListOrder } from "./useVjListOrder";

interface Row {
  id: string;
}

/** A save the test answers by hand, in any order. */
function heldSaves() {
  const calls: { orderedIds: string[]; answer: () => void }[] = [];
  const save = vi.fn(
    (orderedIds: string[]) =>
      new Promise<void>((resolve) => {
        calls.push({ orderedIds, answer: resolve });
      }),
  );
  return { calls, save };
}

function renderListOrder(
  initialItems: Row[],
  save: (orderedIds: string[]) => Promise<unknown>,
) {
  return renderHook(
    ({ items }: { items: Row[] }) =>
      useVjListOrder<Row>({
        items,
        idOf: (row) => row.id,
        save,
        statusOf: (row, newIndex) => `${row.id} at ${newIndex + 1}`,
      }),
    { initialProps: { items: initialItems } },
  );
}

const ROW_A = { id: "a" };
const ROW_B = { id: "b" };

/** Lets the settled save run its `finally` and the state updates land. */
function flushAnswers(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function shownIds(rows: readonly Row[]): string[] {
  return rows.map((row) => row.id);
}

describe("useVjListOrder", () => {
  it("sends a move back to the saved order while the first save is on its way", async () => {
    const { calls, save } = heldSaves();
    const { result, rerender } = renderListOrder([ROW_A, ROW_B], save);

    act(() => {
      result.current.moveBy(0, 1);
    });
    expect(shownIds(result.current.orderedItems)).toEqual(["b", "a"]);
    act(() => {
      result.current.moveBy(1, -1);
    });

    expect(save).toHaveBeenCalledTimes(2);
    expect(calls.map((call) => call.orderedIds)).toEqual([
      ["b", "a"],
      ["a", "b"],
    ]);
    expect(shownIds(result.current.orderedItems)).toEqual(["a", "b"]);

    // The first save lands: the server answers [b, a] while [a, b] is still
    // on its way, and the list keeps showing the newest move.
    await act(async () => {
      calls[0]?.answer();
      await flushAnswers();
    });
    rerender({ items: [ROW_B, ROW_A] });
    expect(shownIds(result.current.orderedItems)).toEqual(["a", "b"]);

    await act(async () => {
      calls[1]?.answer();
      await flushAnswers();
    });
    rerender({ items: [ROW_A, ROW_B] });
    expect(shownIds(result.current.orderedItems)).toEqual(["a", "b"]);
  });
});
