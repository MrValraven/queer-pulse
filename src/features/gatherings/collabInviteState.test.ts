import { describe, expect, it } from "vitest";
import type { EventCommunityInviteDetailDTO } from "./api/eventCommunities.api";
import { DEMO_COLLAB_INVITE } from "./collabInvite.data";
import { collabInviteResolvedKind } from "./collabInviteState";

function inviteWith(
  overrides: Partial<EventCommunityInviteDetailDTO>,
  eventOverrides: Partial<EventCommunityInviteDetailDTO["event"]> = {},
): EventCommunityInviteDetailDTO {
  return {
    ...DEMO_COLLAB_INVITE,
    ...overrides,
    event: { ...DEMO_COLLAB_INVITE.event, ...eventOverrides },
  };
}

describe("collabInviteResolvedKind", () => {
  it("leaves a pending invite on an upcoming gathering open", () => {
    expect(collabInviteResolvedKind(inviteWith({}))).toBeNull();
  });

  it("reads a cancelled gathering first, whatever the answer", () => {
    expect(
      collabInviteResolvedKind(
        inviteWith({ status: "accepted" }, { isCancelled: true, isPast: true }),
      ),
    ).toBe("cancelled");
  });

  it("reads a past gathering before the answer", () => {
    expect(
      collabInviteResolvedKind(
        inviteWith({ status: "declined" }, { isPast: true }),
      ),
    ).toBe("past");
  });

  it("reads each answer", () => {
    expect(collabInviteResolvedKind(inviteWith({ status: "accepted" }))).toBe(
      "accepted",
    );
    expect(collabInviteResolvedKind(inviteWith({ status: "declined" }))).toBe(
      "declined",
    );
  });
});
