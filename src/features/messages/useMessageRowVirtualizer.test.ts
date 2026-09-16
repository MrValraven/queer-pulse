// src/features/messages/useMessageRowVirtualizer.test.ts
import { act, renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { describe, expect, it } from "vitest";
import { useMessageRowVirtualizer } from "./useMessageRowVirtualizer";
import { estimateRowHeight, type MessageRow } from "./messageRows";
import type { ChatMessage } from "./data";

// ENG-267: unit coverage for the real virtualizer wiring (`@tanstack/react-virtual`
// over the flattened `MessageRow` list). jsdom has no layout engine, so every
// row's measured size stays at its `estimateSize()` value unless a test calls
// `rowVirtualizer.measureElement()` itself (see the "row height measurement"
// group below), which turns into a feature here: the visible-window math stays
// fully deterministic and checkable by hand.

/** Builds `count` messages alternating sender, one minute apart, each its own
 *  run (`isSameSender` breaks on every message because the sender alternates,
 *  independent of the gap) so the row list is exactly
 *  `[daySeparator, run, run, ..., run]` with a predictable, uniform run height.
 *  `senderPhase` shifts which sender starts the alternation, so two lists
 *  meant to be concatenated (prepended history, an appended arrival) can be
 *  phased to end/start on different senders and stay one run each, instead of
 *  the boundary message silently merging into its neighbour's run. */
function buildAlternatingMessages(
  count: number,
  idPrefix = "msg",
  senderPhase = 0,
): ChatMessage[] {
  const messages: ChatMessage[] = [];
  for (let index = 0; index < count; index += 1) {
    messages.push({
      from: (index + senderPhase) % 2 === 0 ? "them" : "me",
      text: `message ${index}`,
      id: `${idPrefix}-${index}`,
      at: new Date(2026, 0, 1, 0, index).toISOString(),
    });
  }
  return messages;
}

function createScrollContainer(heightPx: number): HTMLDivElement {
  const container = document.createElement("div");
  Object.defineProperty(container, "offsetHeight", {
    value: heightPx,
    configurable: true,
  });
  Object.defineProperty(container, "offsetWidth", {
    value: 400,
    configurable: true,
  });
  return container;
}

/** Cumulative pixel offset each row's top sits at, derived independently from
 *  the row list's own geometry using the SAME `estimateRowHeight` the hook
 *  feeds `useVirtualizer`'s `estimateSize`. This is a fact about the rows the
 *  hook built, kept separate from `@tanstack/virtual-core`'s own internal
 *  offsets. */
function computeRowStartOffsets(rows: MessageRow[]): number[] {
  const offsets: number[] = [];
  let runningStart = 0;
  for (const row of rows) {
    offsets.push(runningStart);
    runningStart += estimateRowHeight(row);
  }
  return offsets;
}

function renderVirtualizer(
  initialMessageGroups: { day: string; items: ChatMessage[] }[],
  container: HTMLDivElement,
) {
  const scrollElementRef: RefObject<HTMLDivElement | null> = {
    current: container,
  };
  return renderHook(
    ({ messageGroups }) =>
      useMessageRowVirtualizer(
        messageGroups,
        undefined,
        undefined,
        false,
        false,
        scrollElementRef,
      ),
    { initialProps: { messageGroups: initialMessageGroups } },
  );
}

function scrollTo(container: HTMLDivElement, scrollTop: number): void {
  container.scrollTop = scrollTop;
  act(() => {
    container.dispatchEvent(new Event("scroll"));
  });
}

describe("useMessageRowVirtualizer degenerate row lists", () => {
  it("renders no virtual items for an empty conversation", () => {
    const container = createScrollContainer(500);
    const { result } = renderVirtualizer([], container);

    expect(result.current.rows).toHaveLength(0);
    expect(result.current.rowVirtualizer.getVirtualItems()).toEqual([]);
  });

  it("renders the single row of a day with no messages yet", () => {
    const container = createScrollContainer(500);
    const { result } = renderVirtualizer(
      [{ day: "Today", items: [] }],
      container,
    );

    expect(result.current.rows).toHaveLength(1);
    const virtualItems = result.current.rowVirtualizer.getVirtualItems();
    expect(virtualItems).toHaveLength(1);
    expect(virtualItems[0]?.index).toBe(0);
    expect(virtualItems[0]?.key).toBe(result.current.rows[0]?.key);
  });

  it("renders every row when the whole thread is shorter than the viewport", () => {
    const container = createScrollContainer(500);
    const messages = buildAlternatingMessages(3);
    const { result } = renderVirtualizer(
      [{ day: "Today", items: messages }],
      container,
    );

    // 1 day separator + 3 single-message runs.
    expect(result.current.rows).toHaveLength(4);
    const virtualItems = result.current.rowVirtualizer.getVirtualItems();
    expect(virtualItems.map((item) => item.index)).toEqual([0, 1, 2, 3]);
    virtualItems.forEach((item) => {
      expect(item.key).toBe(result.current.rows[item.index]?.key);
    });
  });
});

describe("useMessageRowVirtualizer visible window and overscan", () => {
  it("windows to the rows intersecting the viewport, expanded by the overscan, in the middle of a long thread", () => {
    const container = createScrollContainer(300);
    const messages = buildAlternatingMessages(40);
    const { result } = renderVirtualizer(
      [{ day: "Today", items: messages }],
      container,
    );
    const { rows } = result.current;
    expect(rows).toHaveLength(41); // 1 day separator + 40 runs

    const rowStartOffsets = computeRowStartOffsets(rows);
    // Land exactly on the boundary of row 11 so the expected start index is
    // unambiguous no matter which side of an inclusive/exclusive edge the
    // real binary search resolves to.
    const targetIndex = 11;
    scrollTo(container, rowStartOffsets[targetIndex]!);

    const virtualItems = result.current.rowVirtualizer.getVirtualItems();
    const viewportBottom = rowStartOffsets[targetIndex]! + 300;

    // The strictly-visible range: the target row through the last row whose
    // rectangle still overlaps the viewport bottom.
    let expectedRawEnd = targetIndex;
    while (
      expectedRawEnd < rows.length - 1 &&
      rowStartOffsets[expectedRawEnd]! +
        estimateRowHeight(rows[expectedRawEnd]) <
        viewportBottom
    ) {
      expectedRawEnd += 1;
    }
    // The hook hard-codes overscan: 8 (see useMessageRowVirtualizer.ts).
    const expectedStart = Math.max(targetIndex - 8, 0);
    const expectedEnd = Math.min(expectedRawEnd + 8, rows.length - 1);

    expect(virtualItems[0]?.index).toBe(expectedStart);
    expect(virtualItems[virtualItems.length - 1]?.index).toBe(expectedEnd);
    expect(virtualItems).toHaveLength(expectedEnd - expectedStart + 1);
  });

  it("clips the overscan at the start of the thread instead of requesting a negative index", () => {
    const container = createScrollContainer(200);
    const messages = buildAlternatingMessages(40);
    const { result } = renderVirtualizer(
      [{ day: "Today", items: messages }],
      container,
    );

    scrollTo(container, 0);
    const virtualItems = result.current.rowVirtualizer.getVirtualItems();

    expect(virtualItems[0]?.index).toBe(0);
    virtualItems.forEach((item) =>
      expect(item.index).toBeGreaterThanOrEqual(0),
    );
  });

  it("clips the overscan at the end of the thread instead of requesting past the last row", () => {
    const container = createScrollContainer(300);
    const messages = buildAlternatingMessages(40);
    const { result } = renderVirtualizer(
      [{ day: "Today", items: messages }],
      container,
    );
    const lastIndex = result.current.rows.length - 1;
    const rowStartOffsets = computeRowStartOffsets(result.current.rows);
    const totalHeight =
      rowStartOffsets[lastIndex]! +
      estimateRowHeight(result.current.rows[lastIndex]);

    scrollTo(container, totalHeight - 300);
    const virtualItems = result.current.rowVirtualizer.getVirtualItems();

    expect(virtualItems[virtualItems.length - 1]?.index).toBe(lastIndex);
    virtualItems.forEach((item) =>
      expect(item.index).toBeLessThanOrEqual(lastIndex),
    );
  });

  it("moves the visible window forward as the member scrolls down", () => {
    const container = createScrollContainer(300);
    const messages = buildAlternatingMessages(40);
    const { result } = renderVirtualizer(
      [{ day: "Today", items: messages }],
      container,
    );
    const rowStartOffsets = computeRowStartOffsets(result.current.rows);

    scrollTo(container, rowStartOffsets[5]!);
    const atTop = result.current.rowVirtualizer.getVirtualItems();

    scrollTo(container, rowStartOffsets[30]!);
    const afterScroll = result.current.rowVirtualizer.getVirtualItems();

    expect(afterScroll[0]!.index).toBeGreaterThan(atTop[0]!.index);
    expect(afterScroll[afterScroll.length - 1]!.index).toBeGreaterThan(
      atTop[atTop.length - 1]!.index,
    );
  });
});

describe("useMessageRowVirtualizer identity across prepend and append", () => {
  it("keeps a message's row key and object stable when older history is prepended above it", () => {
    const container = createScrollContainer(1000);
    // Phased so the last "older" message and the first "initial" message are
    // different senders and stay two separate runs at the join.
    const initialMessages = buildAlternatingMessages(5, "msg", 1);
    const { result, rerender } = renderVirtualizer(
      [{ day: "Today", items: initialMessages }],
      container,
    );

    const targetRowBefore = result.current.rows[5]; // run for msg-4
    expect(targetRowBefore?.kind).toBe("run");
    const keyBefore = targetRowBefore?.key;
    expect(keyBefore).toBe("msg-4");

    const olderMessages = buildAlternatingMessages(3, "older");
    rerender({
      messageGroups: [
        { day: "Today", items: [...olderMessages, ...initialMessages] },
      ],
    });

    // 1 day separator + 3 older runs + 5 original runs.
    expect(result.current.rows).toHaveLength(9);
    const targetRowAfter = result.current.rows[8];
    expect(targetRowAfter?.key).toBe(keyBefore);
    // Structural sharing (`createMessageRowReuser`) hands back the SAME row
    // object, so `MessageRunView`'s memo still skips it.
    expect(targetRowAfter).toBe(targetRowBefore);

    const virtualizer = result.current.rowVirtualizer;
    expect(virtualizer.options.getItemKey(8)).toBe(keyBefore);
  });

  it("does not let a freshly-prepended row inherit the measured height cached under the index it now occupies", () => {
    const container = createScrollContainer(1000);
    const initialMessages = buildAlternatingMessages(5, "msg", 1);
    const { result, rerender } = renderVirtualizer(
      [{ day: "Today", items: initialMessages }],
      container,
    );

    // Simulate a real DOM measurement of row index 5 (msg-4's run) coming back
    // taller than the generic estimate (a long bubble, an attachment, etc.).
    const measuredNode = document.createElement("div");
    measuredNode.setAttribute("data-index", "5");
    Object.defineProperty(measuredNode, "offsetHeight", {
      value: 240,
      configurable: true,
    });
    act(() => {
      result.current.rowVirtualizer.measureElement(measuredNode);
    });

    const sizeBeforePrepend = result.current.rowVirtualizer
      .getVirtualItems()
      .find((item) => item.index === 5)?.size;
    expect(sizeBeforePrepend).toBe(240);

    const olderMessages = buildAlternatingMessages(3, "older");
    rerender({
      messageGroups: [
        { day: "Today", items: [...olderMessages, ...initialMessages] },
      ],
    });

    const virtualItems = result.current.rowVirtualizer.getVirtualItems();
    // msg-4's run shifted from index 5 to index 8, so its measured height
    // must follow ITS key alone.
    const shiftedMeasuredRow = virtualItems.find((item) => item.index === 8);
    expect(shiftedMeasuredRow?.key).toBe("msg-4");
    expect(shiftedMeasuredRow?.size).toBe(240);

    // A brand new row now sits at index 5 (one of the prepended older runs),
    // so it must fall back to the generic estimate for its own row kind and
    // stay clear of the 240px value that used to live at that index. A
    // virtualizer keyed by index would fail exactly this assertion.
    const newRowAtOldIndex = virtualItems.find((item) => item.index === 5);
    expect(newRowAtOldIndex?.key).not.toBe("msg-4");
    expect(newRowAtOldIndex?.size).toBe(
      estimateRowHeight(result.current.rows[5]),
    );
  });

  it("keeps an earlier row's identity and object untouched when a new message is appended at the bottom", () => {
    const container = createScrollContainer(1000);
    // Phased so the appended arrival differs in sender from the last
    // "initial" message and stays its own run instead of joining it.
    const initialMessages = buildAlternatingMessages(5, "msg", 1);
    const { result, rerender } = renderVirtualizer(
      [{ day: "Today", items: initialMessages }],
      container,
    );

    const firstRunRowBefore = result.current.rows[1]; // run for msg-0
    expect(firstRunRowBefore?.key).toBe("msg-0");

    const nextMessages = [
      ...initialMessages,
      ...buildAlternatingMessages(1, "incoming"),
    ];
    rerender({ messageGroups: [{ day: "Today", items: nextMessages }] });

    expect(result.current.rows).toHaveLength(7); // day separator + 6 runs
    const firstRunRowAfter = result.current.rows[1];
    expect(firstRunRowAfter?.key).toBe("msg-0");
    expect(firstRunRowAfter).toBe(firstRunRowBefore);

    const newLastRow = result.current.rows[6];
    expect(newLastRow?.key).toBe("incoming-0");
    expect(result.current.rowVirtualizer.options.count).toBe(7);
    expect(result.current.rowVirtualizer.options.getItemKey(6)).toBe(
      "incoming-0",
    );
  });
});
