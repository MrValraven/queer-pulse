import { describe, expect, it } from "vitest";
import {
  MAX_GROUP_MEMBERS,
  MAX_MEMBERS_PER_REQUEST,
  remainingGroupSlots,
} from "./groupLimits";

describe("remainingGroupSlots", () => {
  it("caps at the per-request limit when the group has plenty of room", () => {
    expect(remainingGroupSlots(1)).toBe(MAX_MEMBERS_PER_REQUEST);
    expect(remainingGroupSlots(10)).toBe(MAX_MEMBERS_PER_REQUEST);
  });

  it("shrinks once the group is within one request of the member cap", () => {
    expect(remainingGroupSlots(MAX_GROUP_MEMBERS - 5)).toBe(5);
  });

  it("never goes negative once the group is already at or over the member cap", () => {
    expect(remainingGroupSlots(MAX_GROUP_MEMBERS)).toBe(0);
    expect(remainingGroupSlots(MAX_GROUP_MEMBERS + 3)).toBe(0);
  });

  it("counts the creator as an active member for a brand new group", () => {
    // NewGroupModal calls this with 1 (the creator already occupies a seat).
    expect(remainingGroupSlots(1)).toBe(MAX_MEMBERS_PER_REQUEST);
  });
});
