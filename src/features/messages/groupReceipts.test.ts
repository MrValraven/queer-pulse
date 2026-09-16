import { describe, expect, it } from "vitest";
import { computeGroupSeenBy, overlayLiveReadWatermarks } from "./groupReceipts";
import type { ChatMessage, GroupMemberView } from "./data";

function member(
  overrides: Partial<GroupMemberView> & { id: string; name: string },
): GroupMemberView {
  return {
    initials: "AB",
    tint: "plum",
    role: "member",
    ...overrides,
  };
}

const MESSAGE_AT = "2026-09-14T10:00:00.000Z";
function outboundMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return { from: "me", text: "hi", id: "m1", at: MESSAGE_AT, ...overrides };
}

describe("computeGroupSeenBy: excludes the sender", () => {
  it("never counts the signed-in member, even with a fresh read watermark", () => {
    const self = { id: "self1" };
    const members = [
      member({
        id: "self1",
        name: "Me",
        lastReadAt: "2026-09-14T10:05:00.000Z",
      }),
      member({ id: "u2", name: "Bea", lastReadAt: "2026-09-14T10:05:00.000Z" }),
    ];
    const result = computeGroupSeenBy(members, outboundMessage(), self);
    expect(result.map((entry) => entry.id)).toEqual(["u2"]);
  });

  it("also excludes the sender by slug when no id is available (demo)", () => {
    const self = { id: null, slug: "me" };
    const members = [
      member({
        id: "self1",
        name: "Me",
        slug: "me",
        lastReadAt: "2026-09-14T10:05:00.000Z",
      }),
      member({
        id: "u2",
        name: "Bea",
        slug: "bea",
        lastReadAt: "2026-09-14T10:05:00.000Z",
      }),
    ];
    const result = computeGroupSeenBy(members, outboundMessage(), self);
    expect(result.map((entry) => entry.id)).toEqual(["u2"]);
  });
});

describe("computeGroupSeenBy: watermark age", () => {
  it("excludes a member whose read watermark is older than the message", () => {
    const members = [
      member({ id: "u2", name: "Bea", lastReadAt: "2026-09-14T09:00:00.000Z" }), // before
      member({ id: "u3", name: "Cy", lastReadAt: "2026-09-14T10:30:00.000Z" }), // after
    ];
    const result = computeGroupSeenBy(members, outboundMessage(), {
      id: "self1",
    });
    expect(result.map((entry) => entry.id)).toEqual(["u3"]);
  });

  it("counts a watermark exactly AT the message's timestamp (at-or-after)", () => {
    const members = [member({ id: "u2", name: "Bea", lastReadAt: MESSAGE_AT })];
    const result = computeGroupSeenBy(members, outboundMessage(), {
      id: "self1",
    });
    expect(result.map((entry) => entry.id)).toEqual(["u2"]);
  });
});

describe("computeGroupSeenBy: only a read watermark counts as 'seen'", () => {
  it("excludes a member whose only watermark is delivered, with no read watermark set", () => {
    // `computeGroupSeenBy` filters on `member.lastReadAt` alone. A member's
    // `deliveredAt` (present on GroupMemberView) never substitutes for it, so
    // "delivered" can never masquerade as "seen".
    const members = [
      member({
        id: "u4",
        name: "Dee",
        lastReadAt: undefined,
        deliveredAt: "2026-09-14T10:30:00.000Z",
      }),
    ];
    const result = computeGroupSeenBy(members, outboundMessage(), {
      id: "self1",
    });
    expect(result).toHaveLength(0);
  });
});

describe("computeGroupSeenBy: a member who left is never counted", () => {
  it("ignores a live watermark for an id absent from the (active-only) roster", () => {
    // The roster handed in is already the group's ACTIVE members (a departed
    // member is dropped from it upstream). `overlayLiveReadWatermarks` only
    // ever overlays watermarks onto members it's given, so a stale live frame
    // still naming a member who has since left can never resurrect them here.
    const members = [
      member({ id: "u2", name: "Bea", lastReadAt: "2026-09-14T10:30:00.000Z" }),
    ];
    const overlaid = overlayLiveReadWatermarks(members, {
      "left-member-id": "2026-09-14T10:30:00.000Z",
    });
    const result = computeGroupSeenBy(overlaid, outboundMessage(), {
      id: "self1",
    });
    expect(result.map((entry) => entry.id)).toEqual(["u2"]);
    expect(result.some((entry) => entry.id === "left-member-id")).toBe(false);
  });
});

describe("computeGroupSeenBy: in-flight sends are never 'seen'", () => {
  it("returns nothing for an optimistic message with no server ack yet", () => {
    const members = [
      member({ id: "u2", name: "Bea", lastReadAt: "2026-09-14T12:00:00.000Z" }),
    ];
    const optimistic = outboundMessage({
      id: undefined,
      localId: "local-1",
      at: undefined,
    });
    const result = computeGroupSeenBy(members, optimistic, { id: "self1" });
    expect(result).toHaveLength(0);
  });
});
