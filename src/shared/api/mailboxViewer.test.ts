import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
  isFromViewerSide,
  isViewerHandle,
  mailboxesQueryKey,
  readOwnMemberKeys,
  readStaffedIdentityIds,
  staffedIdentityIdsOf,
  type MailboxSummary,
  type MessageViewer,
} from "./mailboxViewer";

const profileMailbox: MailboxSummary = {
  identityId: "identity-tiago",
  kind: "profile",
  displayName: "Tiago Costa",
  handle: "tiago",
  avatarUrl: null,
  unreadCount: 1,
  isOwner: true,
  isReadOnly: false,
  shouldShowStaffNames: null,
  shouldAllowMyName: null,
};
const cafeMailbox: MailboxSummary = {
  identityId: "identity-cafe",
  kind: "listing",
  displayName: "Café Lisboa",
  handle: "cafe-lisboa",
  avatarUrl: null,
  unreadCount: 2,
  isOwner: true,
  isReadOnly: false,
  shouldShowStaffNames: true,
  shouldAllowMyName: true,
};
const viewer: MessageViewer = {
  myHandle: "tiago",
  staffedIdentityIds: staffedIdentityIdsOf([profileMailbox, cafeMailbox]),
};

describe("isFromViewerSide", () => {
  it("counts the viewer's own personal message", () => {
    expect(isFromViewerSide({ handle: "tiago" }, viewer)).toBe(true);
  });

  it("counts a colleague's reply sent as a business the viewer staffs", () => {
    expect(
      isFromViewerSide(
        { handle: "cafe-lisboa", identityId: "identity-cafe" },
        viewer,
      ),
    ).toBe(true);
  });

  it("keeps a business the viewer only writes to on the other side", () => {
    expect(
      isFromViewerSide(
        { handle: "livraria-aurora", identityId: "identity-aurora" },
        viewer,
      ),
    ).toBe(false);
  });

  it("keeps another member on the other side", () => {
    expect(isFromViewerSide({ handle: "fatima" }, viewer)).toBe(false);
  });

  it("reads nothing as the viewer's before the session knows who they are", () => {
    expect(
      isFromViewerSide(
        { handle: "" },
        { myHandle: null, staffedIdentityIds: new Set() },
      ),
    ).toBe(false);
  });
});

describe("staffedIdentityIdsOf", () => {
  it("leaves the member's own profile identity out", () => {
    expect([...viewer.staffedIdentityIds]).toEqual(["identity-cafe"]);
  });
});

describe("readStaffedIdentityIds", () => {
  it("reads the mailboxes cache and ignores the badge count sharing its prefix", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["conversations-unread-count", false, ""], 4);
    queryClient.setQueryData(mailboxesQueryKey(false), [
      profileMailbox,
      cafeMailbox,
    ]);
    expect([...readStaffedIdentityIds(queryClient)]).toEqual(["identity-cafe"]);
  });

  it("is empty before the mailboxes have loaded", () => {
    expect(readStaffedIdentityIds(new QueryClient()).size).toBe(0);
  });
});

describe("matched Go together chat member keys (PRD-423)", () => {
  const memberKey = "m-9a4e1c7b2d58f0a36e2b1c84";
  const viewer: MessageViewer = {
    myHandle: "tiago",
    staffedIdentityIds: new Set(),
    ownMemberKeys: new Set([memberKey]),
  };

  it("reads a sender carrying one of the viewer's own keys as the viewer", () => {
    expect(isFromViewerSide({ handle: memberKey }, viewer)).toBe(true);
    expect(isViewerHandle(memberKey, viewer)).toBe(true);
    expect(isViewerHandle("tiago", viewer)).toBe(true);
    expect(isViewerHandle("m-0e6d2b8f4a71c39e5b0d8a63", viewer)).toBe(false);
    expect(isViewerHandle(undefined, viewer)).toBe(false);
  });

  it("keeps the old handle test for a viewer with no keys", () => {
    const plainViewer: MessageViewer = {
      myHandle: "tiago",
      staffedIdentityIds: new Set(),
    };
    expect(isFromViewerSide({ handle: memberKey }, plainViewer)).toBe(false);
    expect(isFromViewerSide({ handle: "tiago" }, plainViewer)).toBe(true);
  });

  it("collects the viewer's keys from cached inbox rows and conversation reads", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      ["conversations", false, "", "personal"],
      [{ id: "chat-1", viewerMemberKey: memberKey }, { id: "dm-1" }],
    );
    queryClient.setQueryData(["conversation-detail", "chat-2", false], {
      id: "chat-2",
      viewerMemberKey: "m-0e6d2b8f4a71c39e5b0d8a63",
    });

    expect(readOwnMemberKeys(queryClient)).toEqual([
      "m-0e6d2b8f4a71c39e5b0d8a63",
      memberKey,
    ]);
  });
});
