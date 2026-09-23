import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChatMessage, Conversation } from "./data";
import { loadOutbox, saveOutbox, setMessageOutboxScope } from "./outbox";
import { useMessageSendActions } from "./useMessageSendActions";

// Task 7 (business mailboxes): a message written in a business mailbox must
// send as that business on every path, including a retry and a replay after
// the member switched to another mailbox. The identity comes from the
// message itself once it has been composed, and the thread object is only
// read at compose time.

const cafeThread = {
  id: "66666666-6666-4666-8666-666666666666",
  name: "Fátima Mendes",
  initials: "FM",
  tint: "coral",
  pronouns: "",
  connectedSince: "",
  time: "",
  preview: "",
  unread: false,
  messages: [],
  mailboxIdentityId: "identity-cafe",
  mailboxSeatIdentityId: "identity-cafe",
} as Conversation;

function renderSendActions(active: Conversation | null) {
  const deliver = vi.fn();
  const appendOptimistic = vi.fn();
  const hook = renderHook(
    ({ current }: { current: Conversation | null }) =>
      useMessageSendActions({
        active: current,
        activeBlocked: false,
        replyDraft: null,
        setReplyDraft: () => {},
        t: (key: string) => key,
        appendOptimistic,
        setStatus: () => {},
        deliver,
      }),
    { initialProps: { current: active } },
  );
  return { ...hook, deliver, appendOptimistic };
}

describe("the composing identity", () => {
  it("is stamped on the optimistic message and sent explicitly", () => {
    const { result, deliver, appendOptimistic } = renderSendActions(cafeThread);
    act(() => result.current.send("We open at nine."));
    expect(appendOptimistic.mock.calls[0]![1]).toMatchObject({
      sendAsIdentityId: "identity-cafe",
    });
    expect(deliver.mock.calls[0]!.at(-1)).toBe("identity-cafe");
  });

  it("is sent from the message on retry, whatever the thread object says now", () => {
    const { result, rerender, deliver } = renderSendActions(cafeThread);
    // The member switched to their personal mailbox and came back: the thread
    // object the page holds no longer carries a seat.
    rerender({ current: { ...cafeThread, mailboxSeatIdentityId: undefined } });
    const failed: ChatMessage = {
      from: "me",
      text: "We open at nine.",
      localId: "local-1",
      status: "failed",
      sendAsIdentityId: "identity-cafe",
    };
    act(() => result.current.retrySend(failed));
    expect(deliver.mock.calls[0]!.at(-1)).toBe("identity-cafe");
  });

  it("keeps a pre-feature outbox entry personal", () => {
    const { result, deliver } = renderSendActions(cafeThread);
    act(() =>
      result.current.retrySend({
        from: "me",
        text: "hi",
        localId: "local-2",
        status: "failed",
      }),
    );
    expect(deliver.mock.calls[0]!.at(-1)).toBeUndefined();
  });

  it("survives a reload through the persisted outbox", () => {
    setMessageOutboxScope("outbox-identity-test");
    saveOutbox({
      [cafeThread.id]: [
        {
          from: "me",
          text: "hi",
          localId: "local-3",
          status: "sending",
          sendAsIdentityId: "identity-cafe",
        },
      ],
    });
    expect(
      loadOutbox("outbox-identity-test")[cafeThread.id]![0]!.sendAsIdentityId,
    ).toBe("identity-cafe");
    setMessageOutboxScope(null);
  });
});
