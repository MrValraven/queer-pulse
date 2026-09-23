import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
  isFromViewerSide,
  mailboxesQueryKey,
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
