import { describe, expect, it } from "vitest";
import { buildTimeline, groupIntoRuns } from "./messageRuns";
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

describe("groupIntoRuns group sender attribution (DES-215)", () => {
  const fromMember = (
    senderHandle: string | undefined,
    senderName: string | undefined,
    text: string,
  ): ChatMessage => ({ from: "them", text, senderHandle, senderName });

  it("splits two different members back to back into two runs", () => {
    const anikaMessage = fromMember("anika", "Anika Kovač", "first");
    const jordanMessage = fromMember("jordan", "Jordan Park", "second");
    const runs = groupIntoRuns([anikaMessage, jordanMessage]);
    expect(runs).toHaveLength(2);
    expect(runs[0]!.items).toEqual([anikaMessage]);
    expect(runs[1]!.items).toEqual([jordanMessage]);
  });

  it("keeps the same member twice in one run", () => {
    const runs = groupIntoRuns([
      fromMember("anika", "Anika Kovač", "first"),
      fromMember("anika", "Anika Kovač", "second"),
    ]);
    expect(runs).toHaveLength(1);
    expect(runs[0]!.items).toHaveLength(2);
  });

  it("leaves a DM without handles or names grouped exactly as before", () => {
    const runs = groupIntoRuns([
      { from: "them", text: "a" },
      { from: "them", text: "b" },
      { from: "me", text: "c" },
      { from: "me", text: "d" },
      { from: "them", text: "e" },
    ]);
    expect(runs.map((run) => run.items.length)).toEqual([2, 2, 1]);
  });

  it("falls back to the sender name when a group message has no handle", () => {
    const runs = groupIntoRuns([
      fromMember(undefined, "Anika Kovač", "first"),
      fromMember(undefined, "Anika Kovač", "second"),
      fromMember(undefined, "Jordan Park", "third"),
    ]);
    expect(runs.map((run) => run.items.length)).toEqual([2, 1]);
  });

  it("carries the member split through buildTimeline", () => {
    const blocks = buildTimeline([
      fromMember("anika", "Anika Kovač", "first"),
      fromMember("jordan", "Jordan Park", "second"),
    ]);
    expect(blocks.map((block) => block.kind)).toEqual(["run", "run"]);
  });
});
