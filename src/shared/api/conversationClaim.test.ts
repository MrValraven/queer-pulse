import { describe, expect, it } from "vitest";
import {
  claimStateFromFrame,
  claimStateFromResponse,
  toConversationClaimant,
} from "./conversationClaim";

const rui = {
  handle: "rui",
  displayName: "Rui Marçal",
  pronouns: null,
  avatarUrl: null,
};
const tiago = {
  handle: "tiago",
  displayName: "Tiago Costa",
  pronouns: null,
  avatarUrl: null,
};

describe("toConversationClaimant", () => {
  it("keeps the handle and derives the first name", () => {
    expect(toConversationClaimant(rui)).toEqual({
      handle: "rui",
      name: "Rui Marçal",
      firstName: "Rui",
    });
  });

  it("keeps null as null and absent as undefined", () => {
    expect(toConversationClaimant(null)).toBeNull();
    expect(toConversationClaimant(undefined)).toBeUndefined();
  });
});

describe("claim state", () => {
  it("reads a take-over frame as the new claimant with the colleague it came from", () => {
    expect(
      claimStateFromFrame({
        conversationId: "c1",
        mailboxIdentityId: "identity-cafe",
        change: "taken_over",
        isImplicit: false,
        actor: tiago,
        claimedByUserId: "user-tiago",
        claimedBy: tiago,
        previousClaimant: rui,
        claimedAt: "2026-09-22T10:00:00.000Z",
        changedAt: "2026-09-22T10:00:00.000Z",
      }),
    ).toEqual({
      claimedBy: { handle: "tiago", name: "Tiago Costa", firstName: "Tiago" },
      claimedByUserId: "user-tiago",
      claimedAt: "2026-09-22T10:00:00.000Z",
      claimTakenOverFrom: {
        handle: "rui",
        name: "Rui Marçal",
        firstName: "Rui",
      },
    });
  });

  it("reads a system release as an unclaimed thread", () => {
    expect(
      claimStateFromFrame({
        conversationId: "c1",
        mailboxIdentityId: "identity-cafe",
        change: "released",
        isImplicit: false,
        actor: null,
        claimedByUserId: null,
        claimedBy: null,
        previousClaimant: rui,
        claimedAt: null,
        changedAt: "2026-09-22T10:00:00.000Z",
      }),
    ).toEqual({
      claimedBy: null,
      claimedByUserId: null,
      claimedAt: null,
      claimTakenOverFrom: null,
    });
  });

  it("reads a lost claim response as whoever holds the thread now", () => {
    expect(
      claimStateFromResponse({
        claimedByUserId: "user-rui",
        isNewlyClaimed: false,
        claimedBy: rui,
        claimedAt: "2026-09-22T09:00:00.000Z",
      }).claimedBy?.firstName,
    ).toBe("Rui");
  });

  it("keeps the claimant's user id from a take-over response", () => {
    expect(
      claimStateFromResponse({
        claimedByUserId: "user-tiago",
        isNewlyClaimed: true,
        claimedBy: tiago,
        claimedAt: "2026-09-22T10:00:00.000Z",
        previousClaimant: rui,
      }),
    ).toEqual({
      claimedBy: { handle: "tiago", name: "Tiago Costa", firstName: "Tiago" },
      claimedByUserId: "user-tiago",
      claimedAt: "2026-09-22T10:00:00.000Z",
      claimTakenOverFrom: {
        handle: "rui",
        name: "Rui Marçal",
        firstName: "Rui",
      },
    });
  });

  it("reads a release response as unclaimed with no user id", () => {
    expect(
      claimStateFromResponse({
        claimedByUserId: null,
        isNewlyClaimed: false,
        claimedBy: null,
        claimedAt: null,
      }).claimedByUserId,
    ).toBeNull();
  });
});
