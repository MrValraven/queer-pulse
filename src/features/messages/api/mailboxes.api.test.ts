import { beforeEach, describe, expect, it, vi } from "vitest";

const ruiSummary = {
  handle: "rui",
  displayName: "Rui Marçal",
  pronouns: null,
  avatarUrl: null,
};

vi.mock("../../../shared/api/client", () => ({
  apiGet: vi.fn(() => Promise.resolve([])),
  apiPost: vi.fn(() =>
    Promise.resolve({
      claimedByUserId: "user-1",
      isNewlyClaimed: true,
      claimedBy: ruiSummary,
      claimedAt: "2026-09-22T10:00:00.000Z",
    }),
  ),
  apiPatch: vi.fn(() =>
    Promise.resolve({
      shouldShowStaffNames: false,
      shouldAllowMyName: true,
      isOwner: true,
    }),
  ),
  apiPut: vi.fn(() =>
    Promise.resolve({
      shouldShowStaffNames: true,
      shouldAllowMyName: false,
      isOwner: false,
    }),
  ),
  apiDelete: vi.fn(() =>
    Promise.resolve({
      claimedByUserId: null,
      isNewlyClaimed: false,
      claimedBy: null,
      claimedAt: null,
      isReleased: true,
    }),
  ),
}));

import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../shared/api/client";
import {
  claimConversation,
  getMailboxAttribution,
  getMailboxes,
  releaseConversation,
  setMailboxStaffNames,
  setMyStaffNaming,
  takeOverConversation,
} from "./mailboxes.api";

const CONVERSATION_ID = "33333333-3333-4333-8333-333333333333";
const IDENTITY_ID = "44444444-4444-4444-8444-444444444444";
const RUI_USER_ID = "55555555-5555-4555-8555-555555555555";

beforeEach(() => vi.clearAllMocks());

describe("mailboxes.api", () => {
  it("reads the switcher list from /identities/mailboxes", async () => {
    await getMailboxes();
    expect(apiGet).toHaveBeenCalledWith("/identities/mailboxes");
  });

  it("claims a thread with a bodyless POST and returns the named claimant", async () => {
    const response = await claimConversation(CONVERSATION_ID);
    expect(apiPost).toHaveBeenCalledWith(
      `/conversations/${CONVERSATION_ID}/claim`,
    );
    expect(response.claimedBy?.displayName).toBe("Rui Marçal");
  });

  it("takes a thread over from the claimant the member confirmed", async () => {
    await takeOverConversation(CONVERSATION_ID, RUI_USER_ID);
    expect(apiPost).toHaveBeenCalledWith(
      `/conversations/${CONVERSATION_ID}/claim/take-over`,
      {
        fromUserId: RUI_USER_ID,
      },
    );
  });

  it("releases with a DELETE and reads the 200 body", async () => {
    await expect(releaseConversation(CONVERSATION_ID)).resolves.toMatchObject({
      isReleased: true,
    });
    expect(apiDelete).toHaveBeenCalledWith(
      `/conversations/${CONVERSATION_ID}/claim`,
    );
  });

  it("reads and writes the two attribution switches on their own routes", async () => {
    await getMailboxAttribution(IDENTITY_ID);
    expect(apiGet).toHaveBeenCalledWith(
      `/identities/${IDENTITY_ID}/attribution`,
    );
    await setMailboxStaffNames(IDENTITY_ID, false);
    expect(apiPatch).toHaveBeenCalledWith(
      `/identities/${IDENTITY_ID}/attribution`,
      {
        shouldShowStaffNames: false,
      },
    );
    await setMyStaffNaming(IDENTITY_ID, false);
    expect(apiPut).toHaveBeenCalledWith(
      `/identities/${IDENTITY_ID}/staff-preferences/me`,
      {
        shouldAllowNaming: false,
      },
    );
  });
});
