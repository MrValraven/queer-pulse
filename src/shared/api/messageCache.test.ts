import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { MessageResponse } from "../contracts/contracts";
import type { Conversation } from "../../features/messages/data";
import {
  isThreadCacheBehindConversation,
  patchConversationPreview,
  patchConversationPinned,
  patchConversationRead,
} from "./messageCache";

// ENG-253: `useConversations` pages the inbox by APPENDING later pages onto
// the SAME flat `["conversations", ...]` cache entry (see its own doc for
// why not `useInfiniteQuery`). These patches must keep working against that
// exact flat-array shape once it holds rows from more than one fetched page,
// or a live send/read/pin action would corrupt or silently miss a row that
// only "load more" put there.

function conversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: "c1",
    initials: "JP",
    tint: "plum",
    name: "Jordan Park",
    pronouns: "",
    connectedSince: "",
    time: "9:00 AM",
    updatedAt: "2026-09-14T09:00:00Z",
    preview: "hey",
    unread: false,
    messages: [],
    ...overrides,
  };
}

function message(overrides: Partial<MessageResponse> = {}): MessageResponse {
  return {
    id: "m1",
    conversationId: "c1",
    body: "new message",
    sender: { handle: "jordan", displayName: "Jordan Park", avatarUrl: null },
    createdAt: "2026-09-14T10:00:00Z",
    editedAt: null,
    reactions: [],
    deletedAt: null,
    deliveredAt: null,
    clientMessageId: null,
    forwarded: false,
    pinnedAt: null,
    starred: false,
    canPin: false,
    canEdit: false,
    canDelete: false,
    canReport: false,
    replyTo: null,
    kind: "user",
    attachment: null,
    systemEvent: null,
    ...overrides,
  };
}

function seedConversationsCache(
  queryClient: QueryClient,
  rows: Conversation[],
): void {
  // Mirrors the shape `useConversations`'s queryFn/`fetchNextPage` actually
  // write: a flat array under the `["conversations", demoMode, deletedToken]`
  // key, matched by the `["conversations"]` PREFIX filter every patch below
  // uses.
  queryClient.setQueryData(["conversations", false, ""], rows);
}

describe("patchConversationPreview against a multi-page-appended flat cache", () => {
  it("moves the patched row to the front without dropping a row a later page added", () => {
    const queryClient = new QueryClient();
    // Simulates page 1 (c1, c2) with c3 appended by a later `fetchNextPage`.
    seedConversationsCache(queryClient, [
      conversation({ id: "c1", preview: "old c1" }),
      conversation({ id: "c2", preview: "old c2" }),
      conversation({ id: "c3", preview: "old c3" }),
    ]);

    patchConversationPreview(
      queryClient,
      "c3",
      message({ conversationId: "c3", body: "new for c3" }),
    );

    const patched = queryClient.getQueryData<Conversation[]>([
      "conversations",
      false,
      "",
    ]);
    expect(patched?.map((c) => c.id)).toEqual(["c3", "c1", "c2"]);
    expect(patched?.[0]?.preview).toBe("new for c3");
    // The other two rows (one from page 1, unrelated) pass through untouched.
    expect(patched?.[1]?.preview).toBe("old c1");
    expect(patched?.[2]?.preview).toBe("old c2");
  });

  it("is a no-op when the conversation is not in the cached list yet", () => {
    const queryClient = new QueryClient();
    seedConversationsCache(queryClient, [conversation({ id: "c1" })]);

    patchConversationPreview(
      queryClient,
      "not-cached",
      message({ conversationId: "not-cached" }),
    );

    const patched = queryClient.getQueryData<Conversation[]>([
      "conversations",
      false,
      "",
    ]);
    expect(patched?.map((c) => c.id)).toEqual(["c1"]);
  });
});

describe("patchConversationPinned / patchConversationRead against the flat cache", () => {
  it("patches only the targeted row, leaving a page-two row untouched", () => {
    const queryClient = new QueryClient();
    seedConversationsCache(queryClient, [
      conversation({ id: "c1" }),
      conversation({ id: "c2" }),
    ]);

    patchConversationPinned(queryClient, "c2", "2026-09-14T11:00:00Z");

    const patched = queryClient.getQueryData<Conversation[]>([
      "conversations",
      false,
      "",
    ]);
    expect(patched?.find((c) => c.id === "c1")?.pinnedAt).toBeUndefined();
    expect(patched?.find((c) => c.id === "c2")?.pinnedAt).toBe(
      "2026-09-14T11:00:00Z",
    );
  });

  it("clears unread and advances myLastReadAt without touching row order, when the watermark covers the row's newest message", () => {
    const queryClient = new QueryClient();
    seedConversationsCache(queryClient, [
      conversation({
        id: "c1",
        unread: true,
        unreadCount: 3,
        markedUnreadAt: "2026-09-13T00:00:00Z",
        updatedAt: "2026-09-14T09:00:00Z",
      }),
      conversation({ id: "c2" }),
    ]);

    const isFullyCovered = patchConversationRead(
      queryClient,
      "c1",
      "2026-09-14T12:00:00Z",
    );

    expect(isFullyCovered).toBe(true);
    const patched = queryClient.getQueryData<Conversation[]>([
      "conversations",
      false,
      "",
    ]);
    expect(patched?.map((c) => c.id)).toEqual(["c1", "c2"]);
    const row = patched?.find((c) => c.id === "c1");
    expect(row?.unread).toBe(false);
    expect(row?.unreadCount).toBe(0);
    expect(row?.markedUnreadAt).toBeUndefined();
    expect(row?.myLastReadAt).toBe("2026-09-14T12:00:00Z");
  });

  it("leaves unread state alone, but still advances myLastReadAt and clears markedUnreadAt, when the watermark is behind the row's newest message", () => {
    const queryClient = new QueryClient();
    seedConversationsCache(queryClient, [
      conversation({
        id: "c1",
        unread: true,
        unreadCount: 2,
        markedUnreadAt: "2026-09-13T00:00:00Z",
        // The row already knows about a message newer than the watermark
        // this read POST carried: a reconnect resynced the list while this
        // thread's own cached tail stayed behind (see
        // `isThreadCacheBehindConversation`'s own doc for the full scenario).
        updatedAt: "2026-09-14T12:00:00Z",
      }),
    ]);

    const isFullyCovered = patchConversationRead(
      queryClient,
      "c1",
      "2026-09-14T10:00:00Z",
    );

    expect(isFullyCovered).toBe(false);
    const row = queryClient
      .getQueryData<Conversation[]>(["conversations", false, ""])
      ?.find((c) => c.id === "c1");
    // Deliberately still flagged unread: clearing it here would show a clean
    // inbox for a thread the server still counts unread.
    expect(row?.unread).toBe(true);
    expect(row?.unreadCount).toBe(2);
    // The server clears `marked_unread_at` on every successful read POST
    // regardless of how far the watermark reaches, so this mirrors that.
    expect(row?.markedUnreadAt).toBeUndefined();
    expect(row?.myLastReadAt).toBe("2026-09-14T10:00:00Z");
  });

  it("is a no-op that reports full coverage when the row isn't cached", () => {
    const queryClient = new QueryClient();
    seedConversationsCache(queryClient, [conversation({ id: "c2" })]);

    const isFullyCovered = patchConversationRead(
      queryClient,
      "not-cached",
      "2026-09-14T12:00:00Z",
    );

    expect(isFullyCovered).toBe(true);
  });
});

describe("isThreadCacheBehindConversation", () => {
  function seedThreadCache(
    queryClient: QueryClient,
    conversationId: string,
    messages: MessageResponse[],
  ): void {
    queryClient.setQueryData(["messages", conversationId, false], {
      pages: [{ items: messages, nextCursor: null }],
      pageParams: [undefined],
    });
  }

  it("is true when the cached tail's newest message is older than the row's updatedAt", () => {
    const queryClient = new QueryClient();
    seedThreadCache(queryClient, "c1", [
      message({ id: "m1", createdAt: "2026-09-14T10:00:00Z" }),
    ]);

    expect(
      isThreadCacheBehindConversation(
        queryClient,
        "c1",
        "2026-09-14T12:00:00Z",
      ),
    ).toBe(true);
  });

  it("is false when the cached tail already covers the row's updatedAt", () => {
    const queryClient = new QueryClient();
    seedThreadCache(queryClient, "c1", [
      message({ id: "m1", createdAt: "2026-09-14T12:00:00Z" }),
    ]);

    expect(
      isThreadCacheBehindConversation(
        queryClient,
        "c1",
        "2026-09-14T12:00:00Z",
      ),
    ).toBe(false);
  });

  it("is false when nothing is cached yet for the thread", () => {
    const queryClient = new QueryClient();

    expect(
      isThreadCacheBehindConversation(
        queryClient,
        "c1",
        "2026-09-14T12:00:00Z",
      ),
    ).toBe(false);
  });

  it("is false when the row carries no updatedAt to compare against", () => {
    const queryClient = new QueryClient();
    seedThreadCache(queryClient, "c1", [
      message({ id: "m1", createdAt: "2026-09-14T10:00:00Z" }),
    ]);

    expect(isThreadCacheBehindConversation(queryClient, "c1", undefined)).toBe(
      false,
    );
  });
});

describe("patchConversationPreview, business mailbox fields", () => {
  const cafeSender = {
    handle: "cafe-lisboa",
    displayName: "Café Lisboa",
    avatarUrl: null,
    identityId: "identity-cafe",
    identityKind: "listing" as const,
  };

  function readRow(queryClient: QueryClient): Conversation | undefined {
    return queryClient.getQueryData<Conversation[]>([
      "conversations",
      false,
      "",
    ])?.[0];
  }

  it("clears the staff viewer's own reply fields when the customer writes next", () => {
    const queryClient = new QueryClient();
    seedConversationsCache(queryClient, [conversation({ id: "c1" })]);

    patchConversationPreview(
      queryClient,
      "c1",
      message({
        id: "m-own",
        sender: { ...cafeSender, staffFirstName: "Tiago" },
        isSentByViewer: true,
      }),
    );
    expect(readRow(queryClient)?.lastMessageIsSentByViewer).toBe(true);

    patchConversationPreview(
      queryClient,
      "c1",
      message({
        id: "m-customer",
        sender: {
          handle: "fatima",
          displayName: "Fátima Mendes",
          avatarUrl: null,
        },
      }),
    );
    const row = readRow(queryClient);
    expect(row?.lastMessageSenderIdentityId).toBeUndefined();
    expect(row?.lastMessageStaffFirstName).toBeUndefined();
    expect(row?.lastMessageIsSentByViewer).toBeUndefined();
  });

  it("names the colleague whose reply follows a customer message", () => {
    const queryClient = new QueryClient();
    seedConversationsCache(queryClient, [conversation({ id: "c1" })]);

    patchConversationPreview(
      queryClient,
      "c1",
      message({
        id: "m-customer",
        sender: {
          handle: "fatima",
          displayName: "Fátima Mendes",
          avatarUrl: null,
        },
      }),
    );
    patchConversationPreview(
      queryClient,
      "c1",
      message({
        id: "m-colleague",
        sender: { ...cafeSender, staffFirstName: "Rui" },
        isSentByViewer: false,
      }),
    );
    const row = readRow(queryClient);
    expect(row?.lastMessageSenderIdentityId).toBe("identity-cafe");
    expect(row?.lastMessageStaffFirstName).toBe("Rui");
    expect(row?.lastMessageIsSentByViewer).toBe(false);
  });
});
