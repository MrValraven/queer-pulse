import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Business mailbox frames over the socket. The harness is realtime.test.tsx's
 * (see that file's header for why every test reloads the module and settles
 * after mounting): socket.io-client, auth, demo mode and the cache layer are
 * mocked, so each test calls the handler realtime.ts registered and asserts
 * which cache patch it reached.
 */

const state = vi.hoisted(() => ({ demoMode: false, loggedIn: true }));

const socket = vi.hoisted(() => ({
  on: vi.fn(),
  disconnect: vi.fn(),
}));

// Typed with the real `io` arity so `mock.calls[0][1]` reads the options object.
const ioMock = vi.hoisted(() =>
  vi.fn<(url: string, opts: unknown) => typeof socket>(() => socket),
);

vi.mock("socket.io-client", () => ({ io: ioMock }));

vi.mock("./messageCache", () => ({
  bumpConversationUnread: vi.fn(),
  upsertMessage: vi.fn(),
  patchConversationPreview: vi.fn(),
  patchMessageDelete: vi.fn(),
  patchMessageEdit: vi.fn(),
  patchMessagePinned: vi.fn(),
  patchMessageReactionCounts: vi.fn(),
  reconcileConversationHistory: vi.fn(),
}));

vi.mock("./claimCache", () => ({
  patchConversationClaim: vi.fn(),
  recordClaimFrame: vi.fn(),
}));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({
    demoMode: state.demoMode,
    available: true,
    setDemoMode: () => {},
    toggle: () => {},
  }),
}));

vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => ({ loggedIn: state.loggedIn }),
}));

type RealtimeModule = typeof import("./realtime");

async function loadRealtime(base = "http://api.test"): Promise<RealtimeModule> {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", base);
  return import("./realtime");
}

/**
 * Flush the microtask/macrotask the dynamic `import("socket.io-client")`
 * introduces, inside `act` so the post-connect state update (emit(true)) doesn't
 * warn. After this resolves, the socket is constructed and its `on(...)`
 * handlers are registered (or, in the no-demand cases, it stays unbuilt).
 */
async function settle(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

/** Mount the provider with one consumer holding the connection open, then settle. */
async function mount({
  RealtimeProvider,
  useRealtimeConnection,
}: RealtimeModule) {
  function Consumer() {
    useRealtimeConnection();
    return null;
  }
  const view = render(
    <RealtimeProvider>
      <Consumer />
    </RealtimeProvider>,
  );
  await settle();
  return view;
}

/** The handler realtime.ts registered for `event`. */
function handlerFor(event: string): (payload: unknown) => void {
  const call = socket.on.mock.calls.find((entry) => entry[0] === event);
  if (!call) throw new Error(`no handler for ${event}`);
  return call[1] as (payload: unknown) => void;
}

const businessReply = {
  id: "server-message-1",
  conversationId: "55555555-5555-4555-8555-555555555555",
  body: "Yes, the terrace is step-free.",
  sender: {
    handle: "cafe-lisboa",
    displayName: "Café Lisboa",
    avatarUrl: null,
    identityId: "identity-cafe",
    identityKind: "listing",
    staffFirstName: "Rui",
  },
  createdAt: "2026-09-21T10:00:00.000Z",
  kind: "user",
};

const cafeMailbox = {
  identityId: "identity-cafe",
  kind: "listing",
  displayName: "Café Lisboa",
  handle: "cafe-lisboa",
  avatarUrl: null,
  unreadCount: 0,
  isOwner: true,
  isReadOnly: false,
  shouldShowStaffNames: true,
  shouldAllowMyName: true,
};

const rui = {
  handle: "rui",
  displayName: "Rui Marçal",
  pronouns: null,
  avatarUrl: null,
};

beforeEach(() => {
  state.demoMode = false;
  state.loggedIn = true;
  ioMock.mockReset();
  ioMock.mockReturnValue(socket);
  socket.on.mockClear();
  socket.disconnect.mockClear();
  vi.clearAllMocks();
  vi.resetModules();
});

describe("realtime on a business mailbox", () => {
  it("does not count a colleague's business reply as unread", async () => {
    const realtime = await loadRealtime();
    const { queryClient } = await import("./queryClient");
    const cache = await import("./messageCache");
    queryClient.setQueryData(
      ["conversations-unread-count", "mailboxes", false],
      [cafeMailbox],
    );
    await mount(realtime);
    handlerFor("conversation:message")({
      conversationId: businessReply.conversationId,
      message: businessReply,
    });
    expect(cache.bumpConversationUnread).not.toHaveBeenCalled();
    expect(cache.patchConversationPreview).toHaveBeenCalled();
  });

  it("does not count a colleague's reply on the open-room frame either", async () => {
    const realtime = await loadRealtime();
    const { queryClient } = await import("./queryClient");
    const cache = await import("./messageCache");
    queryClient.setQueryData(
      ["conversations-unread-count", "mailboxes", false],
      [cafeMailbox],
    );
    await mount(realtime);
    handlerFor("message:new")({
      conversationId: businessReply.conversationId,
      message: businessReply,
    });
    expect(cache.upsertMessage).toHaveBeenCalled();
    expect(cache.bumpConversationUnread).not.toHaveBeenCalled();
  });

  it("still counts a business reply for its customer", async () => {
    const realtime = await loadRealtime();
    const cache = await import("./messageCache");
    await mount(realtime);
    handlerFor("conversation:message")({
      conversationId: businessReply.conversationId,
      message: businessReply,
    });
    expect(cache.bumpConversationUnread).toHaveBeenCalledWith(
      expect.anything(),
      businessReply.conversationId,
    );
  });

  it("handles a malformed frame with no sender without throwing", async () => {
    const realtime = await loadRealtime();
    const cache = await import("./messageCache");
    await mount(realtime);
    const senderlessMessage = { id: "server-message-2" };
    expect(() =>
      handlerFor("conversation:message")({
        conversationId: businessReply.conversationId,
        message: senderlessMessage,
      }),
    ).not.toThrow();
    expect(() =>
      handlerFor("message:new")({
        conversationId: businessReply.conversationId,
        message: senderlessMessage,
      }),
    ).not.toThrow();
    expect(cache.bumpConversationUnread).toHaveBeenCalledTimes(1);
  });

  it("ignores a message:new that arrives after its own deletion", async () => {
    const realtime = await loadRealtime();
    const cache = await import("./messageCache");
    await mount(realtime);
    handlerFor("message:deleted")({
      conversationId: businessReply.conversationId,
      messageId: businessReply.id,
    });
    handlerFor("message:new")({
      conversationId: businessReply.conversationId,
      message: businessReply,
    });
    expect(cache.upsertMessage).not.toHaveBeenCalled();
  });

  it("ignores a message:updated that arrives after its own deletion", async () => {
    const realtime = await loadRealtime();
    const cache = await import("./messageCache");
    await mount(realtime);
    handlerFor("message:deleted")({
      conversationId: businessReply.conversationId,
      messageId: businessReply.id,
    });
    handlerFor("message:updated")({
      conversationId: businessReply.conversationId,
      message: businessReply,
    });
    expect(cache.patchMessageEdit).not.toHaveBeenCalled();
  });

  it("ignores a conversation:message that arrives after its own deletion", async () => {
    const realtime = await loadRealtime();
    const cache = await import("./messageCache");
    await mount(realtime);
    handlerFor("message:deleted")({
      conversationId: businessReply.conversationId,
      messageId: businessReply.id,
    });
    handlerFor("conversation:message")({
      conversationId: businessReply.conversationId,
      message: businessReply,
    });
    expect(cache.upsertMessage).not.toHaveBeenCalled();
    expect(cache.patchConversationPreview).not.toHaveBeenCalled();
  });

  it("applies a claim frame to the cached rows and counts it", async () => {
    const realtime = await loadRealtime();
    const claimCache = await import("./claimCache");
    await mount(realtime);
    handlerFor("conversation:claim")({
      conversationId: businessReply.conversationId,
      mailboxIdentityId: "identity-cafe",
      change: "claimed",
      isImplicit: true,
      actor: rui,
      claimedByUserId: "user-rui",
      claimedBy: rui,
      previousClaimant: null,
      claimedAt: "2026-09-22T10:00:00.000Z",
      changedAt: "2026-09-22T10:00:00.000Z",
    });
    expect(claimCache.recordClaimFrame).toHaveBeenCalledWith(
      businessReply.conversationId,
    );
    expect(claimCache.patchConversationClaim).toHaveBeenCalledWith(
      expect.anything(),
      businessReply.conversationId,
      expect.objectContaining({
        claimedBy: { handle: "rui", name: "Rui Marçal", firstName: "Rui" },
      }),
    );
  });

  it("refreshes the mailbox list and the inbox when staffing changes", async () => {
    const realtime = await loadRealtime();
    const { queryClient } = await import("./queryClient");
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await mount(realtime);
    handlerFor("mailbox:staffing")({
      identityId: "identity-cafe",
      isStaff: false,
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["conversations-unread-count", "mailboxes"],
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["conversations"] });
  });
});
