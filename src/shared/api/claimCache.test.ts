import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import type { Conversation } from "../../features/messages/data";
import {
  claimFrameCount,
  patchConversationClaim,
  recordClaimFrame,
  resetClaimFrames,
} from "./claimCache";
import { claimStateFromFrame, type ClaimState } from "./conversationClaim";

/** A cached row with the claimant's user id the claim cache writes. */
type ClaimedRow = Conversation & Pick<ClaimState, "claimedByUserId">;

const rui = { handle: "rui", name: "Rui Marçal", firstName: "Rui" };

beforeEach(() => resetClaimFrames());

describe("claimCache", () => {
  it("patches the thread in every scoped list entry and in its detail entry", () => {
    const queryClient = new QueryClient();
    const row = { id: "c1", claimedBy: null } as Conversation;
    const other = { id: "c2", claimedBy: null } as Conversation;
    queryClient.setQueryData(
      ["conversations", false, "", "identity-cafe"],
      [row, other],
    );
    queryClient.setQueryData(["conversation-detail", "c1", false], row);
    patchConversationClaim(queryClient, "c1", {
      claimedBy: rui,
      claimedByUserId: "user-rui",
      claimedAt: "2026-09-22T10:00:00.000Z",
      claimTakenOverFrom: null,
    });
    const list = queryClient.getQueryData<Conversation[]>([
      "conversations",
      false,
      "",
      "identity-cafe",
    ])!;
    expect(list[0]!.claimedBy).toEqual(rui);
    expect(list[1]).toBe(other);
    expect(
      queryClient.getQueryData<Conversation>([
        "conversation-detail",
        "c1",
        false,
      ])!.claimedBy,
    ).toEqual(rui);
  });

  it("leaves a list without the thread untouched", () => {
    const queryClient = new QueryClient();
    const rows = [{ id: "c2", claimedBy: null } as Conversation];
    queryClient.setQueryData(["conversations", false, ""], rows);
    patchConversationClaim(queryClient, "c1", {
      claimedBy: rui,
      claimedByUserId: "user-rui",
      claimedAt: "2026-09-22T10:00:00.000Z",
      claimTakenOverFrom: null,
    });
    expect(queryClient.getQueryData(["conversations", false, ""])).toBe(rows);
  });

  it("writes a claim frame's claimant user id onto the cached row", () => {
    const queryClient = new QueryClient();
    const row = { id: "c1", claimedBy: null } as Conversation;
    queryClient.setQueryData(["conversations", false, ""], [row]);
    queryClient.setQueryData(["conversation-detail", "c1", false], row);
    const summary = {
      handle: "rui",
      displayName: "Rui Marçal",
      pronouns: null,
      avatarUrl: null,
    };
    patchConversationClaim(
      queryClient,
      "c1",
      claimStateFromFrame({
        conversationId: "c1",
        mailboxIdentityId: "identity-cafe",
        change: "claimed",
        isImplicit: false,
        actor: summary,
        claimedByUserId: "user-rui",
        claimedBy: summary,
        previousClaimant: null,
        claimedAt: "2026-09-22T10:00:00.000Z",
        changedAt: "2026-09-22T10:00:00.000Z",
      }),
    );
    const list = queryClient.getQueryData<ClaimedRow[]>([
      "conversations",
      false,
      "",
    ])!;
    expect(list[0]!.claimedByUserId).toBe("user-rui");
    expect(
      queryClient.getQueryData<ClaimedRow>([
        "conversation-detail",
        "c1",
        false,
      ])!.claimedByUserId,
    ).toBe("user-rui");
  });

  it("counts applied frames per thread", () => {
    expect(claimFrameCount("c1")).toBe(0);
    recordClaimFrame("c1");
    expect(claimFrameCount("c1")).toBe(1);
    expect(claimFrameCount("c2")).toBe(0);
  });
});
