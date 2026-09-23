// src/features/messages/demoBusinessAuthorship.test.ts
import { describe, expect, it } from "vitest";
import {
  atelierPulsoSaraConversation,
  cafeLisboaNunoConversation,
} from "./demoBusinessThreads.data";
import type { ChatMessage } from "./data";

/** The last seeded bubble of a demo thread, which in both threads below is
 *  the reply sent as the business. */
function lastMessageOf(conversation: {
  messages: { items: ChatMessage[] }[];
}): ChatMessage {
  const items = conversation.messages.at(-1)?.items ?? [];
  const message = items.at(-1);
  if (!message) throw new Error("the demo thread seeded no message");
  return message;
}

describe("demo message flags on a business thread", () => {
  it("leaves a colleague's reply undeletable and reportable", () => {
    const reply = lastMessageOf(cafeLisboaNunoConversation);
    expect(reply.isSentByViewer).toBe(false);
    expect(reply.canDelete).toBe(false);
    expect(reply.canEdit).toBe(false);
    expect(reply.canReport).toBe(true);
  });

  it("keeps the member's own reply deletable and unreportable", () => {
    const reply = lastMessageOf(atelierPulsoSaraConversation);
    expect(reply.isSentByViewer).toBe(true);
    expect(reply.canDelete).toBe(true);
    expect(reply.canReport).toBe(false);
  });
});
