import { describe, expect, it } from "vitest";
import { createMessageRowReuser } from "./messageRowReuse";
import type { MessageRow } from "./messageRows";
import type { ChatMessage } from "./data";

/**
 * `createMessageRowReuser` is the structural-sharing cache that keeps
 * `MessageAreaRow`/`MessageRunView`'s `memo` working across cache patches:
 * an unchanged row must come back as the SAME object reference even though
 * `buildMessageRows` makes a brand-new one every call.
 */

function chatMessage(id: string): ChatMessage {
  return { from: "them", text: "hi", id };
}

describe("createMessageRowReuser: whole-list identity", () => {
  it("returns the exact same array reference when every row rebuilds identically", () => {
    const reuse = createMessageRowReuser();
    const rowsA: MessageRow[] = [
      { kind: "daySeparator", key: "day-1", day: "Today" },
    ];
    const first = reuse(rowsA);
    const rowsB: MessageRow[] = [
      { kind: "daySeparator", key: "day-1", day: "Today" },
    ];
    const second = reuse(rowsB);
    expect(second).toBe(first);
  });

  it("returns a new array when the row count changes", () => {
    const reuse = createMessageRowReuser();
    reuse([{ kind: "unreadDivider", key: "u" }]);
    const second = reuse([
      { kind: "unreadDivider", key: "u" },
      { kind: "groupSeenBy", key: "g" },
    ]);
    expect(second).toHaveLength(2);
  });
});

describe("createMessageRowReuser: per-row identity", () => {
  it("reuses the previous row object for a structurally-equal rebuild", () => {
    const reuse = createMessageRowReuser();
    const message = chatMessage("m1");
    const firstRows: MessageRow[] = [
      {
        kind: "run",
        key: "m1",
        day: "Today",
        run: { from: "them", items: [message] },
      },
    ];
    const first = reuse(firstRows);
    // A brand-new run object, but every field (including `items` element by
    // element) is equal, which is what a re-render with an untouched message
    // list looks like after `buildMessageRows` rebuilds fresh objects.
    const secondRows: MessageRow[] = [
      {
        kind: "run",
        key: "m1",
        day: "Today",
        run: { from: "them", items: [message] },
      },
    ];
    const second = reuse(secondRows);
    expect(second[0]).toBe(first[0]);
    expect(second[0]).not.toBe(secondRows[0]);
  });

  it("hands back a genuinely new row when the underlying message changed", () => {
    const reuse = createMessageRowReuser();
    const messageA = chatMessage("m1");
    const firstRows: MessageRow[] = [
      {
        kind: "run",
        key: "m1",
        day: "Today",
        run: { from: "them", items: [messageA] },
      },
    ];
    reuse(firstRows);
    // Same key, but a DIFFERENT message object at the same position, e.g. a
    // live cache patch that edited this message's text.
    const messageB = chatMessage("m1");
    const secondRows: MessageRow[] = [
      {
        kind: "run",
        key: "m1",
        day: "Today",
        run: { from: "them", items: [messageB] },
      },
    ];
    const second = reuse(secondRows);
    expect(second[0]).toBe(secondRows[0]);
    if (second[0]!.kind === "run")
      expect(second[0]!.run.items[0]).toBe(messageB);
  });

  it("never reuses a row whose kind changed, even when its key stayed the same", () => {
    const reuse = createMessageRowReuser();
    const firstRows: MessageRow[] = [{ kind: "unreadDivider", key: "x" }];
    const first = reuse(firstRows);
    const secondRows: MessageRow[] = [{ kind: "groupSeenBy", key: "x" }];
    const second = reuse(secondRows);
    expect(second[0]!.kind).toBe("groupSeenBy");
    expect(second[0]).not.toBe(first[0]);
    expect(second[0]).toBe(secondRows[0]);
  });

  it("reuses non-run rows (no items array to compare) the same way", () => {
    const reuse = createMessageRowReuser();
    const first = reuse([{ kind: "daySeparator", key: "day-1", day: "Today" }]);
    const second = reuse([
      { kind: "daySeparator", key: "day-1", day: "Today" },
    ]);
    expect(second[0]).toBe(first[0]);
  });
});
