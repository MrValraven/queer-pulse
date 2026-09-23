import { describe, expect, it } from "vitest";
import type { MessageResponse } from "../../../shared/contracts/contracts";
import type { MessageViewer } from "../../../shared/api/mailboxViewer";
import {
  conversationToView,
  groupMessages,
  messageToChat,
} from "./messages.adapters";
import type { ConversationResponse } from "./messages.api";

const staffViewer: MessageViewer = {
  myHandle: "tiago",
  staffedIdentityIds: new Set(["identity-cafe"]),
};
const customerViewer: MessageViewer = {
  myHandle: "fatima",
  staffedIdentityIds: new Set(),
};
const translate = ((key: string) => key) as never;

function message(
  sender: MessageResponse["sender"],
  id = "m1",
): MessageResponse {
  return {
    id,
    conversationId: "c1",
    body: "We do have a step-free entrance.",
    sender,
    createdAt: "2026-09-21T10:00:00.000Z",
    editedAt: null,
    reactions: [],
    deletedAt: null,
    deliveredAt: null,
    clientMessageId: null,
    forwarded: false,
    pinnedAt: null,
    starred: false,
    canPin: true,
    canEdit: false,
    canDelete: false,
    canReport: false,
    replyTo: null,
    kind: "user",
    systemEvent: null,
    attachment: null,
  };
}

const ruiAsCafe = {
  handle: "cafe-lisboa",
  displayName: "Café Lisboa",
  avatarUrl: null,
  identityId: "identity-cafe",
  identityKind: "listing" as const,
  staffFirstName: "Rui",
};

describe("messageToChat, business mailboxes", () => {
  it("puts a colleague's reply as the business on the staff member's side", () => {
    const bubble = messageToChat(
      { ...message(ruiAsCafe), isSentByViewer: false },
      staffViewer,
    );
    expect(bubble.from).toBe("me");
    expect(bubble.senderIdentityId).toBe("identity-cafe");
    expect(bubble.senderIdentityKind).toBe("listing");
    expect(bubble.senderStaffFirstName).toBe("Rui");
    expect(bubble.isSentByViewer).toBe(false);
  });

  it("carries the server's word that the viewer typed a business reply", () => {
    expect(
      messageToChat(
        { ...message(ruiAsCafe), isSentByViewer: true },
        staffViewer,
      ).isSentByViewer,
    ).toBe(true);
  });

  it("keeps the moved note's business name on the event", () => {
    const note = {
      ...message(
        {
          handle: "",
          displayName: "Former member",
          avatarUrl: null,
          isFormerMember: true,
        },
        "m-note",
      ),
      kind: "system",
      systemEvent: {
        type: "moved_to_business_mailbox",
        actorName: "Café Lisboa",
        targetName: null,
        actorHandle: null,
        targetHandle: null,
        value: "identity-cafe",
        actorIsMe: false,
        targetIsMe: false,
        mailboxName: "Café Lisboa",
        isFormerMailbox: false,
      },
    } as MessageResponse;
    expect(messageToChat(note, customerViewer).systemEvent?.mailboxName).toBe(
      "Café Lisboa",
    );
  });

  it("drops the name of a business that no longer exists", () => {
    const note = {
      ...message(
        {
          handle: "",
          displayName: "Former member",
          avatarUrl: null,
          isFormerMember: true,
        },
        "m-note-2",
      ),
      kind: "system",
      systemEvent: {
        type: "moved_to_business_mailbox",
        actorName: "Former business",
        targetName: null,
        actorHandle: null,
        targetHandle: null,
        value: "identity-gone",
        actorIsMe: false,
        targetIsMe: false,
        mailboxName: "Former business",
        isFormerMailbox: true,
      },
    } as MessageResponse;
    expect(
      messageToChat(note, customerViewer).systemEvent?.mailboxName,
    ).toBeUndefined();
  });

  it("shows the customer the business with its attribution on the other side", () => {
    const bubble = messageToChat(message(ruiAsCafe), customerViewer);
    expect(bubble.from).toBe("them");
    expect(bubble.senderName).toBe("Café Lisboa");
    expect(bubble.senderStaffFirstName).toBe("Rui");
  });

  it("marks a message from a deleted business with the former-business flag", () => {
    const bubble = messageToChat(
      message({
        handle: "",
        displayName: "Former business",
        avatarUrl: null,
        isFormerIdentity: true,
      }),
      customerViewer,
    );
    expect(bubble.isSenderFormerBusiness).toBe(true);
    expect(bubble.isSenderFormerMember).toBeUndefined();
  });

  it("keeps a personal message's handle rule", () => {
    expect(
      messageToChat(
        message({
          handle: "tiago",
          displayName: "Tiago Costa",
          avatarUrl: null,
        }),
        staffViewer,
      ).from,
    ).toBe("me");
  });

  it("rebuilds a cached bubble when the viewer's staffed identities change", () => {
    const dto = message(ruiAsCafe, "m2");
    const [before] = groupMessages([dto], customerViewer)[0]!.items;
    const [after] = groupMessages([dto], staffViewer)[0]!.items;
    expect(before!.from).toBe("them");
    expect(after!.from).toBe("me");
  });
});

describe("conversationToView, business mailboxes", () => {
  const base = {
    id: "44444444-4444-4444-8444-444444444444",
    kind: "direct",
    type: "dm",
    unreadCount: 0,
    updatedAt: "2026-09-21T10:00:00.000Z",
    members: [],
    memberPreview: [],
    memberCount: 0,
    lastMessage: message(ruiAsCafe),
  };

  it("maps the staff view's claim and mailbox", () => {
    const row = conversationToView(
      {
        ...base,
        otherParticipant: {
          handle: "fatima",
          displayName: "Fátima Mendes",
          avatarUrl: null,
        },
        mailboxIdentityId: "identity-cafe",
        claimedBy: {
          handle: "rui",
          displayName: "Rui Marçal",
          avatarUrl: null,
        },
        claimedAt: "2026-09-21T09:00:00.000Z",
        claimTakenOverFrom: {
          handle: "ana",
          displayName: "Ana Lopes",
          avatarUrl: null,
        },
        claimReleasedBy: null,
        claimReleasedAt: null,
      } as unknown as ConversationResponse,
      translate,
    );
    expect(row.mailboxIdentityId).toBe("identity-cafe");
    expect(row.claimedBy).toEqual({
      handle: "rui",
      name: "Rui Marçal",
      firstName: "Rui",
    });
    expect(row.claimTakenOverFrom).toEqual({
      handle: "ana",
      name: "Ana Lopes",
      firstName: "Ana",
    });
    expect(row.lastMessageSenderIdentityId).toBe("identity-cafe");
    expect(row.lastMessageStaffFirstName).toBe("Rui");
    expect(row.counterpartIdentityKind).toBeUndefined();
  });

  it("maps the customer view's business counterpart", () => {
    const row = conversationToView(
      {
        ...base,
        otherParticipant: ruiAsCafe,
        mailboxIdentityId: "identity-cafe",
        claimedBy: null,
      } as unknown as ConversationResponse,
      translate,
    );
    expect(row.counterpartIdentityId).toBe("identity-cafe");
    expect(row.counterpartIdentityKind).toBe("listing");
    expect(row.name).toBe("Café Lisboa");
    expect(row.claimedBy).toBeNull();
  });

  it("names a deleted business with the localized placeholder", () => {
    const row = conversationToView(
      {
        ...base,
        otherParticipant: {
          handle: "",
          displayName: "Former business",
          avatarUrl: null,
          isFormerIdentity: true,
        },
      } as unknown as ConversationResponse,
      translate,
    );
    expect(row.isCounterpartFormerBusiness).toBe(true);
    expect(row.name).toBe("messages:mailbox.formerBusiness");
  });
});
