import { describe, expect, it } from "vitest";
import { groupIntoRuns } from "./messageRuns";
import type { ChatMessage } from "./data";

const at = (iso: string): ChatMessage => ({ from: "them", text: "x", at: iso });

describe("groupIntoRuns time-gap breaks", () => {
  it("keeps same-sender messages within the gap in one run", () => {
    const runs = groupIntoRuns([
      at("2026-07-24T10:00:00Z"),
      at("2026-07-24T10:05:00Z"),
    ]);
    expect(runs).toHaveLength(1);
    expect(runs[0]!.items).toHaveLength(2);
  });

  it("breaks a run when same-sender messages exceed the gap", () => {
    const runs = groupIntoRuns([
      at("2026-07-24T10:00:00Z"),
      at("2026-07-24T10:40:00Z"),
    ]);
    expect(runs).toHaveLength(2);
  });

  it("still breaks on sender change regardless of time", () => {
    const runs = groupIntoRuns([
      { from: "me", text: "a", at: "2026-07-24T10:00:00Z" },
      { from: "them", text: "b", at: "2026-07-24T10:00:10Z" },
    ]);
    expect(runs).toHaveLength(2);
  });

  it("force-breaks a run immediately before the `breakBefore` message", () => {
    const readMessage: ChatMessage = { from: "them", text: "read" };
    const unreadMessage: ChatMessage = { from: "them", text: "unread" };
    // Same sender, no timestamps → would normally be ONE run; the divider anchor
    // must still start its own run.
    const runs = groupIntoRuns(
      [readMessage, unreadMessage],
      undefined,
      unreadMessage,
    );
    expect(runs).toHaveLength(2);
    expect(runs[1]!.items[0]).toBe(unreadMessage);
  });

  it("ignores `breakBefore` when the message is not present", () => {
    const runs = groupIntoRuns(
      [
        { from: "them", text: "a" },
        { from: "them", text: "b" },
      ],
      undefined,
      { from: "them", text: "z" },
    );
    expect(runs).toHaveLength(1);
  });
});
