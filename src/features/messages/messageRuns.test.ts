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

describe("groupIntoRuns business mailbox senders", () => {
  it("breaks a run when a different staff member replies as the business", () => {
    const asRui = {
      from: "me" as const,
      text: "a",
      senderIdentityId: "identity-cafe",
      senderStaffFirstName: "Rui",
    };
    const asTiago = { ...asRui, text: "b", senderStaffFirstName: "Tiago" };
    expect(groupIntoRuns([asRui, asTiago])).toHaveLength(2);
  });

  it("keeps a staff member's consecutive replies in one run", () => {
    const first = {
      from: "me" as const,
      text: "a",
      senderIdentityId: "identity-cafe",
      senderStaffFirstName: "Rui",
    };
    expect(groupIntoRuns([first, { ...first, text: "b" }])).toHaveLength(1);
  });

  it("breaks a run between the member's reply and a colleague's with the same first name", () => {
    const mine = {
      from: "me" as const,
      text: "a",
      senderIdentityId: "identity-cafe",
      senderStaffFirstName: "Ana",
      isSentByViewer: true,
    };
    const colleague = { ...mine, text: "b", isSentByViewer: false };
    expect(groupIntoRuns([mine, colleague])).toHaveLength(2);
  });

  it("keeps a confirmed own business reply and the next pending one in one run", () => {
    const confirmed = {
      from: "me" as const,
      text: "a",
      senderIdentityId: "identity-cafe",
      senderStaffFirstName: "Tiago",
      isSentByViewer: true,
    };
    const pending = {
      from: "me" as const,
      text: "b",
      sendAsIdentityId: "identity-cafe",
      localId: "local-1",
      status: "sending" as const,
    };
    expect(groupIntoRuns([confirmed, pending])).toHaveLength(1);
  });

  it("keeps a demo reply the simulation walked to seen in the member's run", () => {
    const seeded = {
      from: "me" as const,
      text: "a",
      senderIdentityId: "identity-atelier",
      isSentByViewer: true,
    };
    const walked = {
      from: "me" as const,
      text: "b",
      sendAsIdentityId: "identity-atelier",
      localId: "local-2",
      status: "seen" as const,
    };
    expect(groupIntoRuns([seeded, walked])).toHaveLength(1);
  });

  it("splits a pending business reply from a colleague's confirmed one", () => {
    const colleague = {
      from: "me" as const,
      text: "a",
      senderIdentityId: "identity-cafe",
      senderStaffFirstName: "Rui",
      isSentByViewer: false,
    };
    const pending = {
      from: "me" as const,
      text: "b",
      sendAsIdentityId: "identity-cafe",
      status: "sending" as const,
    };
    expect(groupIntoRuns([colleague, pending])).toHaveLength(2);
  });

  it("collapses unnamed staff into one run for a customer", () => {
    const fromBusiness = {
      from: "them" as const,
      text: "a",
      senderName: "Café Lisboa",
      senderHandle: "cafe-lisboa",
      senderIdentityId: "identity-cafe",
    };
    expect(
      groupIntoRuns([fromBusiness, { ...fromBusiness, text: "b" }]),
    ).toHaveLength(1);
  });

  it("breaks a received run when the business's staff name changes", () => {
    const fromRui = {
      from: "them" as const,
      text: "a",
      senderName: "Café Lisboa",
      senderIdentityId: "identity-cafe",
      senderStaffFirstName: "Rui",
    };
    const fromTiago = { ...fromRui, text: "b", senderStaffFirstName: "Tiago" };
    expect(groupIntoRuns([fromRui, fromTiago])).toHaveLength(2);
  });
});
