import { describe, expect, it } from "vitest";
import { localDayKey } from "./api/messages.adapters";
import type { Conversation, ChatMessage } from "./data";
import {
  mergeOptimisticGroups,
  type MessageGroup,
} from "./useMessagesController.helpers";

// ENG-263: unit coverage for `mergeOptimisticGroups` (the optimistic-vs-socket
// dedup by `localId` described in the Messages deep scan). See that
// function's own doc in useMessagesController.helpers.ts for the race it
// guards: the socket `message:new` patch (deduped by clientMessageId) can
// land a beat before the send mutation removes the optimistic bubble.

function buildConversation(
  overrides: Partial<Conversation> = {},
): Conversation {
  return {
    id: "conv-default",
    slug: "conv-default",
    initials: "AB",
    tint: "default",
    name: "Alex",
    pronouns: "",
    connectedSince: "",
    time: "",
    preview: "",
    unread: false,
    messages: [],
    ...overrides,
  };
}

describe("mergeOptimisticGroups", () => {
  it("returns the base groups unchanged (same reference) when nothing is queued for this conversation", () => {
    const threadGroups: MessageGroup[] = [
      { day: "Today", dayKey: localDayKey(new Date()), items: [] },
    ];
    const active = buildConversation({ id: "conv-none" });

    const result = mergeOptimisticGroups(active, false, threadGroups, {});

    expect(result).toBe(threadGroups);
  });

  it("drops an optimistic row once its server/socket row has landed in the base history (dedup by localId)", () => {
    const localId = "shared-local-id";
    const active = buildConversation({ id: "conv-dedup" });
    const threadGroups: MessageGroup[] = [
      {
        day: "Today",
        dayKey: localDayKey(new Date()),
        items: [{ from: "me", text: "hi", localId, id: "server-1" }],
      },
    ];
    const sent = {
      "conv-dedup": [
        { from: "me", text: "hi", localId, status: "sent" } as ChatMessage,
      ],
    };

    const result = mergeOptimisticGroups(active, false, threadGroups, sent);

    expect(result).toBe(threadGroups);
    expect(result[0]?.items).toHaveLength(1);
  });

  it("never duplicates a message regardless of whether the optimistic or the server copy is merged first", () => {
    const localId = "race-local-id";
    const active = buildConversation({ id: "conv-race" });
    const todayKey = localDayKey(new Date());
    const sent = {
      "conv-race": [
        {
          from: "me",
          text: "racing",
          localId,
          status: "sending",
        } as ChatMessage,
      ],
    };

    // Before the server row lands: the optimistic bubble renders once.
    const beforeGroups: MessageGroup[] = [
      { day: "Today", dayKey: todayKey, items: [] },
    ];
    const before = mergeOptimisticGroups(active, false, beforeGroups, sent);
    expect(before[0]?.items.map((item) => item.localId)).toEqual([localId]);

    // The server/socket row lands in the base history carrying the SAME
    // localId, so the optimistic copy must never render alongside it.
    const afterGroups: MessageGroup[] = [
      {
        day: "Today",
        dayKey: todayKey,
        items: [{ from: "me", text: "racing", localId, id: "server-1" }],
      },
    ];
    const after = mergeOptimisticGroups(active, false, afterGroups, sent);
    expect(after[0]?.items).toHaveLength(1);
  });

  it("preserves order, appending queued sends after the existing items in today's bucket", () => {
    const active = buildConversation({ id: "conv-order" });
    const todayKey = localDayKey(new Date());
    const existing: ChatMessage = {
      from: "them",
      text: "hey",
      localId: "existing",
    };
    const threadGroups: MessageGroup[] = [
      { day: "Today", dayKey: todayKey, items: [existing] },
    ];
    const sent = {
      "conv-order": [
        { from: "me", text: "first", localId: "l1" } as ChatMessage,
        { from: "me", text: "second", localId: "l2" } as ChatMessage,
      ],
    };

    const result = mergeOptimisticGroups(active, false, threadGroups, sent);

    expect(result[0]?.items.map((item) => item.localId)).toEqual([
      "existing",
      "l1",
      "l2",
    ]);
  });

  it("creates a fresh Today bucket when the base history has no matching dayKey, without mutating the input", () => {
    const active = buildConversation({ id: "conv-newday" });
    const threadGroups: MessageGroup[] = [
      { day: "Yesterday", dayKey: "2020-01-01", items: [] },
    ];
    const sent = {
      "conv-newday": [{ from: "me", text: "hi", localId: "l1" } as ChatMessage],
    };

    const result = mergeOptimisticGroups(active, false, threadGroups, sent);

    expect(result).toHaveLength(2);
    expect(result[1]?.day).toBe("Today");
    expect(result[1]?.dayKey).toBe(localDayKey(new Date()));
    expect(result[1]?.items.map((item) => item.localId)).toEqual(["l1"]);
    // The original array passed in must be untouched.
    expect(threadGroups).toHaveLength(1);
  });

  it("in demo mode, merges against active.messages (ignoring threadGroups) and matches the day==='Today' label, since demo groups carry no dayKey", () => {
    const active = buildConversation({
      id: "conv-demo",
      messages: [{ day: "Today", items: [] }],
    });
    const sent = {
      "conv-demo": [{ from: "me", text: "hi", localId: "l1" } as ChatMessage],
    };
    const liveGroupsIgnored: MessageGroup[] = [
      {
        day: "Today",
        dayKey: "irrelevant",
        items: [
          { from: "them", text: "should not appear", localId: "ignored" },
        ],
      },
    ];

    const result = mergeOptimisticGroups(active, true, liveGroupsIgnored, sent);

    expect(result[0]?.items.map((item) => item.localId)).toEqual(["l1"]);
  });

  it("keeps a failed optimistic row visible, since mergeOptimisticGroups never filters by status", () => {
    const active = buildConversation({ id: "conv-failed" });
    const threadGroups: MessageGroup[] = [
      { day: "Today", dayKey: localDayKey(new Date()), items: [] },
    ];
    const sent = {
      "conv-failed": [
        {
          from: "me",
          text: "oops",
          localId: "l1",
          status: "failed",
          isRetryable: true,
        } as ChatMessage,
      ],
    };

    const result = mergeOptimisticGroups(active, false, threadGroups, sent);

    expect(result[0]?.items).toHaveLength(1);
    expect(result[0]?.items[0]?.status).toBe("failed");
  });

  it("never mutates the base groups or their item arrays", () => {
    const active = buildConversation({ id: "conv-immutable" });
    const originalItems: ChatMessage[] = [{ from: "them", text: "hey" }];
    const threadGroups: MessageGroup[] = [
      { day: "Today", dayKey: localDayKey(new Date()), items: originalItems },
    ];
    const sent = {
      "conv-immutable": [
        { from: "me", text: "hi", localId: "l1" } as ChatMessage,
      ],
    };

    mergeOptimisticGroups(active, false, threadGroups, sent);

    expect(threadGroups[0]?.items).toBe(originalItems);
    expect(originalItems).toHaveLength(1);
  });
});
