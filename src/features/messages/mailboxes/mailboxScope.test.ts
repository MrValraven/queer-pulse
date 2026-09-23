import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { MailboxSummary } from "../../../shared/api/mailboxViewer";
import type { Conversation } from "../data";
import {
  belongsToMailbox,
  isBlockedByIdentity,
  isNotStaffError,
  resolveActiveMailbox,
  scopeCacheKey,
  withMailboxSeat,
  type ConversationListScope,
} from "./mailboxScope";

const staffed = new Set(["identity-cafe", "identity-norte"]);
const personal: ConversationListScope = {
  identityId: "identity-tiago",
  isPersonal: true,
  isReadOnly: false,
  staffedIdentityIds: staffed,
};
const cafe: ConversationListScope = {
  ...personal,
  identityId: "identity-cafe",
  isPersonal: false,
};
const norte: ConversationListScope = {
  ...personal,
  identityId: "identity-norte",
  isPersonal: false,
  isReadOnly: true,
};

const thread = (mailboxIdentityId?: string) =>
  ({ id: `t-${mailboxIdentityId ?? "dm"}`, mailboxIdentityId }) as Conversation;

describe("belongsToMailbox (the demo mirror of GET /conversations?as=)", () => {
  it("files an ordinary DM and a group under the personal mailbox", () => {
    expect(belongsToMailbox(thread(), personal)).toBe(true);
    expect(belongsToMailbox(thread(), cafe)).toBe(false);
  });

  it("files a thread with a business the member writes to under the personal mailbox", () => {
    expect(belongsToMailbox(thread("identity-aurora"), personal)).toBe(true);
  });

  it("files a staffed business thread under that business only", () => {
    expect(belongsToMailbox(thread("identity-cafe"), cafe)).toBe(true);
    expect(belongsToMailbox(thread("identity-cafe"), personal)).toBe(false);
  });
});

describe("withMailboxSeat", () => {
  it("seats the member on a thread of a mailbox they staff", () => {
    expect(
      withMailboxSeat(thread("identity-cafe"), cafe).mailboxSeatIdentityId,
    ).toBe("identity-cafe");
  });

  it("leaves a customer-side business thread unseated", () => {
    expect(
      withMailboxSeat(thread("identity-aurora"), personal)
        .mailboxSeatIdentityId,
    ).toBeUndefined();
  });

  it("marks a read-only persona's thread", () => {
    expect(
      withMailboxSeat(thread("identity-norte"), norte).isMailboxReadOnly,
    ).toBe(true);
  });

  it("returns the same object when nothing changes", () => {
    const directThread = thread();
    expect(withMailboxSeat(directThread, personal)).toBe(directThread);
  });
});

describe("isBlockedByIdentity (I-2: demo mirror of mailbox-seats.ts dropping a blocked identity's threads)", () => {
  const blocked = new Set(["identity-aurora"]);

  it("drops the customer's own view of a blocked business", () => {
    expect(
      isBlockedByIdentity(
        {
          counterpartIdentityId: "identity-aurora",
          mailboxIdentityId: undefined,
        },
        blocked,
      ),
    ).toBe(true);
  });

  it("drops a staffed view of a blocked mailbox", () => {
    expect(
      isBlockedByIdentity(
        {
          counterpartIdentityId: undefined,
          mailboxIdentityId: "identity-aurora",
        },
        blocked,
      ),
    ).toBe(true);
  });

  it("keeps an ordinary thread with neither identity blocked", () => {
    expect(
      isBlockedByIdentity(
        {
          counterpartIdentityId: "identity-cafe",
          mailboxIdentityId: undefined,
        },
        blocked,
      ),
    ).toBe(false);
    expect(
      isBlockedByIdentity(
        { counterpartIdentityId: undefined, mailboxIdentityId: undefined },
        blocked,
      ),
    ).toBe(false);
  });
});

describe("scopeCacheKey", () => {
  it("is the active identity, and nothing while unresolved", () => {
    expect(scopeCacheKey(cafe)).toBe("identity-cafe");
    expect(scopeCacheKey(null)).toBe("unresolved");
  });
});

describe("isNotStaffError", () => {
  it("matches the coded refusal and nothing else", () => {
    expect(
      isNotStaffError(new ApiError(403, "x", { code: "IDENTITY_NOT_STAFF" })),
    ).toBe(true);
    expect(
      isNotStaffError(new ApiError(403, "x", { code: "IDENTITY_REMOVED" })),
    ).toBe(false);
    expect(isNotStaffError(new Error("IDENTITY_NOT_STAFF"))).toBe(false);
  });
});

describe("resolveActiveMailbox", () => {
  const mailboxes = [
    { identityId: "identity-tiago", kind: "profile" },
    { identityId: "identity-cafe", kind: "listing" },
  ] as MailboxSummary[];

  it("defaults to the profile mailbox", () => {
    expect(resolveActiveMailbox(mailboxes, null)).toEqual({
      active: mailboxes[0],
      isRequestedMissing: false,
    });
  });

  it("honours a requested mailbox the member has", () => {
    expect(resolveActiveMailbox(mailboxes, "identity-cafe").active).toBe(
      mailboxes[1],
    );
  });

  it("falls back and says so when the member lost that mailbox", () => {
    expect(resolveActiveMailbox(mailboxes, "identity-gone")).toEqual({
      active: mailboxes[0],
      isRequestedMissing: true,
    });
  });

  it("resolves nothing while the list is loading", () => {
    expect(resolveActiveMailbox(undefined, "identity-cafe")).toEqual({
      active: null,
      isRequestedMissing: false,
    });
  });
});
