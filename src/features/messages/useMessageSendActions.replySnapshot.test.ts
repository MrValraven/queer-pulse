// src/features/messages/useMessageSendActions.replySnapshot.test.ts
import { describe, expect, it } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage, Conversation } from "./data";
import { buildReplySnapshot } from "./useMessageSendActions";

const translate: TFunction = (key, values) => {
  if (key === "messages:conversation.you") return "You";
  if (key === "messages:mailbox.attribution.customerLine") {
    return `${values?.name} from ${values?.business}`;
  }
  return key;
};

const nunoThread = {
  id: "thread-cafe-nuno",
  name: "Nuno Alves",
} as Conversation;

function businessReply(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    id: "message-cafe-1",
    from: "me",
    text: "We can seat twelve on the terrace.",
    senderName: "Café Lisboa",
    senderIdentityId: "identity-cafe",
    senderStaffFirstName: "Rui",
    ...overrides,
  };
}

describe("buildReplySnapshot, business mailboxes", () => {
  it("quotes a colleague's reply by the business alone, as the server does", () => {
    const snapshot = buildReplySnapshot(
      businessReply({ isSentByViewer: false }),
      nunoThread,
      translate,
    );
    expect(snapshot.replyTo?.senderName).toBe("Café Lisboa");
  });

  it("quotes the member's own business reply as You", () => {
    const snapshot = buildReplySnapshot(
      businessReply({ isSentByViewer: true }),
      nunoThread,
      translate,
    );
    expect(snapshot.replyTo?.senderName).toBe("You");
  });

  it("quotes the customer by the thread's name", () => {
    const snapshot = buildReplySnapshot(
      { id: "message-nuno-1", from: "them", text: "Around 12 people?" },
      nunoThread,
      translate,
    );
    expect(snapshot.replyTo?.senderName).toBe("Nuno Alves");
  });
});
