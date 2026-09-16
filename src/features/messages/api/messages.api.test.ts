import { describe, expect, it, vi, beforeEach } from "vitest";
import type {
  ConversationResponse,
  MessageResponse,
} from "../../../shared/contracts/contracts";

// Isolate `messages.api.ts` from the real transport: it only needs to prove
// it reads the ENG-253 envelope/params correctly and flags an ENG-222 replay
// via response headers, both of which `../../../shared/api/client` already
// has its own coverage for.
const apiGetMock = vi.fn();
const apiPostMock = vi.fn();
const apiPostWithMetaMock = vi.fn();
const apiPatchMock = vi.fn();
const apiDeleteMock = vi.fn();

vi.mock("../../../shared/api/client", () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiPost: (...args: unknown[]) => apiPostMock(...args),
  apiPostWithMeta: (...args: unknown[]) => apiPostWithMetaMock(...args),
  apiPatch: (...args: unknown[]) => apiPatchMock(...args),
  apiDelete: (...args: unknown[]) => apiDeleteMock(...args),
}));

beforeEach(() => {
  apiGetMock.mockReset();
  apiPostMock.mockReset();
  apiPostWithMetaMock.mockReset();
  apiPatchMock.mockReset();
  apiDeleteMock.mockReset();
});

function conversationRow(
  overrides: Partial<ConversationResponse> = {},
): ConversationResponse {
  return {
    id: "c1",
    type: "dm",
    otherParticipant: null,
    lastMessage: null,
    unreadCount: 0,
    updatedAt: "2026-09-14T09:14:00Z",
    myLastReadAt: null,
    otherLastReadAt: null,
    otherDeliveredAt: null,
    otherParticipantId: null,
    kind: "direct",
    title: null,
    avatarUrl: null,
    memberCount: 0,
    members: [],
    ...overrides,
  };
}

function messageResponse(
  overrides: Partial<MessageResponse> = {},
): MessageResponse {
  return {
    id: "m1",
    conversationId: "c1",
    body: "hey",
    sender: { handle: "jordan", displayName: "Jordan Park", avatarUrl: null },
    createdAt: "2026-09-14T09:14:00Z",
    editedAt: null,
    reactions: [],
    deletedAt: null,
    deliveredAt: null,
    clientMessageId: "local-1",
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

describe("getConversationsPage (ENG-253)", () => {
  it("sends cursor/limit as query params and parses the {data,pageInfo} envelope", async () => {
    const rows = [conversationRow({ id: "c1" }), conversationRow({ id: "c2" })];
    apiGetMock.mockResolvedValueOnce({
      data: rows,
      pageInfo: { nextCursor: "cursor-2", hasMore: true },
    });
    const { getConversationsPage } = await import("./messages.api");

    const page = await getConversationsPage({ cursor: "cursor-1", limit: 30 });

    expect(apiGetMock).toHaveBeenCalledWith(
      "/conversations?cursor=cursor-1&limit=30",
      undefined,
      undefined,
      undefined,
    );
    expect(page.data).toEqual(rows);
    expect(page.pageInfo).toEqual({ nextCursor: "cursor-2", hasMore: true });
  });

  it("fetches a second page using the first page's nextCursor", async () => {
    const { getConversationsPage } = await import("./messages.api");
    apiGetMock
      .mockResolvedValueOnce({
        data: [conversationRow({ id: "c1" })],
        pageInfo: { nextCursor: "cursor-2", hasMore: true },
      })
      .mockResolvedValueOnce({
        data: [conversationRow({ id: "c2" })],
        pageInfo: { nextCursor: null, hasMore: false },
      });

    const page1 = await getConversationsPage({ limit: 30 });
    const page2 = await getConversationsPage({
      cursor: page1.pageInfo.nextCursor ?? undefined,
      limit: 30,
    });

    expect(apiGetMock).toHaveBeenNthCalledWith(
      2,
      "/conversations?cursor=cursor-2&limit=30",
      undefined,
      undefined,
      undefined,
    );
    expect(page2.data[0]!.id).toBe("c2");
    expect(page2.pageInfo.hasMore).toBe(false);
  });

  it("normalizes a bare-array response into a single terminal page", async () => {
    apiGetMock.mockResolvedValueOnce([conversationRow({ id: "c1" })]);
    const { getConversationsPage } = await import("./messages.api");

    const page = await getConversationsPage();

    expect(page.data).toHaveLength(1);
    expect(page.pageInfo).toEqual({ nextCursor: null, hasMore: false });
  });
});

describe("getConversations (backward-compatible single-page lookup)", () => {
  it("resolves just the first page's data from the {data,pageInfo} envelope", async () => {
    apiGetMock.mockResolvedValueOnce({
      data: [conversationRow({ id: "c1" })],
      pageInfo: { nextCursor: "cursor-2", hasMore: true },
    });
    const { getConversations } = await import("./messages.api");

    const rows = await getConversations();

    expect(rows).toHaveLength(1);
    expect(rows[0]!.id).toBe("c1");
  });
});

describe("wasMessageReplayed (ENG-222)", () => {
  it("flags a sendMessage result whose response carried Idempotent-Replayed: true", async () => {
    const resolved = messageResponse({ id: "server-1" });
    apiPostWithMetaMock.mockResolvedValueOnce({
      data: resolved,
      headers: new Headers({ "Idempotent-Replayed": "true" }),
    });
    const { sendMessage, wasMessageReplayed } = await import("./messages.api");

    const result = await sendMessage("c1", "hello", undefined, "local-1");

    expect(result).toBe(resolved);
    expect(wasMessageReplayed(result)).toBe(true);
  });

  it("leaves a genuine first-create result unflagged", async () => {
    const resolved = messageResponse({ id: "server-2" });
    apiPostWithMetaMock.mockResolvedValueOnce({
      data: resolved,
      headers: new Headers(),
    });
    const { sendMessage, wasMessageReplayed } = await import("./messages.api");

    const result = await sendMessage("c1", "hello", undefined, "local-2");

    expect(wasMessageReplayed(result)).toBe(false);
  });

  it("does not flag an unrelated MessageResponse object with the same fields", async () => {
    const resolved = messageResponse({ id: "server-3" });
    apiPostWithMetaMock.mockResolvedValueOnce({
      data: resolved,
      headers: new Headers({ "Idempotent-Replayed": "true" }),
    });
    const { sendMessage, wasMessageReplayed } = await import("./messages.api");

    await sendMessage("c1", "hello", undefined, "local-3");

    // A same-shaped object from elsewhere (a socket frame, a history page)
    // is never mistaken for the replayed response: this is identity-tracked.
    expect(wasMessageReplayed(messageResponse({ id: "server-3" }))).toBe(false);
  });

  it("also flags a replayed sendDocumentMessage result", async () => {
    const resolved = messageResponse({ id: "server-doc-1", kind: "document" });
    apiPostWithMetaMock.mockResolvedValueOnce({
      data: resolved,
      headers: new Headers({ "Idempotent-Replayed": "true" }),
    });
    const { sendDocumentMessage, wasMessageReplayed } =
      await import("./messages.api");

    const result = await sendDocumentMessage(
      "c1",
      "a document",
      {
        url: "https://cdn.example/doc.pdf",
        fileName: "doc.pdf",
        byteSize: 100,
        contentType: "application/pdf",
        provider: "s3",
      },
      undefined,
      "local-doc-1",
    );

    expect(wasMessageReplayed(result)).toBe(true);
  });
});
