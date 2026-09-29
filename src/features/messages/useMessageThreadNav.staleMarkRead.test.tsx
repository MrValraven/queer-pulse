import { act, renderHook, waitFor } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { QueryClient } from "@tanstack/react-query";
import { server } from "../../test/msw/server";
import { API, API_V1 } from "../../test/msw/handlers";
import { queryClient as productionQueryClient } from "../../shared/api/queryClient";
import type {
  ConversationResponse,
  MessageResponse,
} from "../../shared/contracts/contracts";

/**
 * Regression coverage for the bug where a thread's own cached message tail
 * lags what the conversation list row already knows arrived (a dropped
 * socket connection delivers messages into a non-active thread, and the
 * reconnect handler resyncs `["conversations"]` for the list/badge but never
 * fetches into that thread's own closed cache). `openThread` used to read
 * `newestCachedMessage` off that stale tail and POST it as an honest
 * `upToMessageId` read watermark, under-reporting what the reader had
 * actually seen and leaving the server's own unread count untouched while the
 * list row got optimistically (and wrongly) cleared. `isThreadCacheBehindConversation`
 * (`shared/api/messageCache.ts`) is what `openThread` and the desktop
 * auto-mark effect now consult to skip that stale POST.
 */

const THREAD_A = "11111111-1111-1111-1111-111111111111";
const THREAD_B = "22222222-2222-2222-2222-222222222222";
const STALE_MESSAGE_ID = "aaaaaaaa-0000-0000-0000-000000000001";

function conversationRow(
  id: string,
  overrides: Partial<ConversationResponse> = {},
): ConversationResponse {
  return {
    id,
    type: "group",
    kind: "group",
    title: `Thread ${id}`,
    avatarUrl: null,
    otherParticipant: null,
    lastMessage: null,
    unreadCount: 0,
    updatedAt: "2026-09-14T09:00:00Z",
    myLastReadAt: null,
    otherLastReadAt: null,
    otherDeliveredAt: null,
    otherParticipantId: null,
    memberCount: 1,
    members: [],
    memberPreview: [],
    hasDraft: false,
    draftPreview: null,
    myRole: "owner",
    ...overrides,
  };
}

function chatMessage(
  id: string,
  conversationId: string,
  createdAt: string,
): MessageResponse {
  return {
    id,
    conversationId,
    body: "hey there",
    sender: { handle: "friend", displayName: "A Friend", avatarUrl: null },
    createdAt,
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
  };
}

function emptyMessagesPage() {
  return { data: [], pageInfo: { nextCursor: null, hasMore: false } };
}

/** The universal session/chrome endpoints every provider `TestProviders`
 *  fires on any render. Mirrors `useMessagesController.activeDetail.test.tsx`'s
 *  own `registerSessionHandlers`. */
function registerSessionHandlers() {
  server.use(
    http.get(`${API_V1}/auth/me`, () =>
      HttpResponse.json({
        id: "live-member",
        email: "live-member@queerpulse.test",
        status: "active",
        role: "member",
        ageAttestedAt: "2026-01-01T00:00:00.000Z",
        onboardedAt: "2026-01-01T00:00:00.000Z",
        profile: {
          slug: "live-member",
          firstName: "Live",
          lastName: "Member",
          pronouns: "they/them",
          avatarUrl: null,
        },
      }),
    ),
    http.get(`${API_V1}/me/bootstrap`, () =>
      HttpResponse.json({
        profile: {
          slug: "live-member",
          firstName: "Live",
          lastName: "Member",
          vouchCount: 0,
          visibility: "open",
          limited: false,
        },
        saved: { items: [], total: 0, page: 1, pageSize: 0 },
        blocks: { items: [], total: 0, page: 1, pageSize: 0 },
        mutes: { items: [], total: 0, page: 1, pageSize: 0 },
      }),
    ),
    http.get(`${API_V1}/consent/me`, () =>
      HttpResponse.json({
        categories: { necessary: true, analytics: false, monitoring: false },
        policyVersion: "3.3",
      }),
    ),
    http.get(`${API_V1}/platform-status`, () =>
      HttpResponse.json({
        signInOpen: true,
        inviteRequestsOpen: true,
        registrationOpen: true,
        announcement: null,
      }),
    ),
    http.get(`${API_V1}/conversations/unread-count`, () =>
      HttpResponse.json({ count: 0 }),
    ),
    http.get(`${API_V1}/identities/mailboxes`, () =>
      HttpResponse.json([
        {
          identityId: "live-member-identity",
          kind: "profile",
          displayName: "Live Member",
          handle: "live-member",
          avatarUrl: null,
          unreadCount: 0,
          isOwner: true,
          isReadOnly: false,
          shouldShowStaffNames: null,
          shouldAllowMyName: null,
        },
      ]),
    ),
  );
}

/** Mirrors `useMessagesController.activeDetail.test.tsx`'s own `loadLive()`. */
async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { TestProviders } = await import("../../test/TestProviders");
  const { useMessagesController } = await import("./useMessagesController");
  const prodDefaults = productionQueryClient.getDefaultOptions().queries;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { ...prodDefaults, retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  return { useMessagesController, wrapper };
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

describe("openThread: a stale cached thread tail never sends a stale read watermark", () => {
  it("skips the read POST when the cached tail is older than the list row's own updatedAt", async () => {
    registerSessionHandlers();
    const readCalls: { conversationId: string; body: unknown }[] = [];
    let threadBIsUnread = false;
    let threadBUpdatedAt = "2026-09-14T09:00:00Z";

    server.use(
      http.get(`${API_V1}/conversations`, () =>
        HttpResponse.json({
          data: [
            conversationRow(THREAD_A, { title: "Thread A" }),
            conversationRow(THREAD_B, {
              title: "Thread B",
              unreadCount: threadBIsUnread ? 1 : 0,
              updatedAt: threadBUpdatedAt,
            }),
          ],
          pageInfo: { nextCursor: null, hasMore: false },
        }),
      ),
      http.get(`${API_V1}/conversations/${THREAD_A}`, () =>
        HttpResponse.json(conversationRow(THREAD_A, { title: "Thread A" })),
      ),
      http.get(`${API_V1}/conversations/${THREAD_B}`, () =>
        HttpResponse.json(conversationRow(THREAD_B, { title: "Thread B" })),
      ),
      http.get(`${API_V1}/conversations/${THREAD_A}/messages`, () =>
        HttpResponse.json(emptyMessagesPage()),
      ),
      // Thread B's ONLY message fetch this test issues: the cached tail that
      // goes stale the moment the list row above reports newer activity.
      http.get(`${API_V1}/conversations/${THREAD_B}/messages`, () =>
        HttpResponse.json({
          data: [
            chatMessage(STALE_MESSAGE_ID, THREAD_B, "2026-09-14T10:00:00Z"),
          ],
          pageInfo: { nextCursor: null, hasMore: false },
        }),
      ),
      http.post(
        `${API_V1}/conversations/:id/read`,
        async ({ params, request }) => {
          readCalls.push({
            conversationId: String(params.id),
            body: await request.json(),
          });
          return HttpResponse.json({ ok: true });
        },
      ),
    );

    const { useMessagesController, wrapper } = await loadLive();
    const { result } = renderHook(() => useMessagesController(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.active?.id).toBe(THREAD_A);

    // Open B once to seed its thread cache with the (soon-to-be-stale) tail,
    // then leave it. This is "thread B cached earlier in the session".
    act(() => result.current.openThread(THREAD_B));
    await waitFor(() => expect(result.current.active?.id).toBe(THREAD_B));
    await waitFor(() =>
      expect(result.current.messageGroups.flatMap((g) => g.items)).toHaveLength(
        1,
      ),
    );
    act(() => result.current.openThread(THREAD_A));
    await waitFor(() => expect(result.current.active?.id).toBe(THREAD_A));

    // Simulate a socket drop that delivered messages into B while it was
    // closed: the reconnect handler resyncs the LIST (this row now reports
    // newer activity and an unread count) but never touches B's own cached
    // thread page, which still only has the one message fetched above.
    threadBIsUnread = true;
    threadBUpdatedAt = "2026-09-14T12:00:00Z";
    act(() => result.current.refetchInbox());
    await waitFor(() =>
      expect(
        result.current.visibleThreads.find((t) => t.id === THREAD_B)?.unread,
      ).toBe(true),
    );

    // Reopening B must not POST its stale cached tail as the read watermark.
    act(() => result.current.openThread(THREAD_B));
    await waitFor(() => expect(result.current.active?.id).toBe(THREAD_B));

    expect(
      readCalls.filter((call) => call.conversationId === THREAD_B),
    ).toEqual([]);
    // The row must still read unread: nothing cleared it optimistically.
    expect(
      result.current.visibleThreads.find((t) => t.id === THREAD_B)?.unread,
    ).toBe(true);
  });

  it("still sends the read POST when the cached tail already covers the list row's own updatedAt", async () => {
    registerSessionHandlers();
    const readCalls: { conversationId: string; body: unknown }[] = [];

    server.use(
      http.get(`${API_V1}/conversations`, () =>
        HttpResponse.json({
          data: [
            conversationRow(THREAD_A, { title: "Thread A" }),
            conversationRow(THREAD_B, {
              title: "Thread B",
              unreadCount: 1,
              updatedAt: "2026-09-14T10:00:00Z",
            }),
          ],
          pageInfo: { nextCursor: null, hasMore: false },
        }),
      ),
      http.get(`${API_V1}/conversations/${THREAD_A}`, () =>
        HttpResponse.json(conversationRow(THREAD_A, { title: "Thread A" })),
      ),
      http.get(`${API_V1}/conversations/${THREAD_B}`, () =>
        HttpResponse.json(conversationRow(THREAD_B, { title: "Thread B" })),
      ),
      http.get(`${API_V1}/conversations/${THREAD_A}/messages`, () =>
        HttpResponse.json(emptyMessagesPage()),
      ),
      // The cached tail's own newest message matches the row's `updatedAt`
      // exactly, so this is an ordinary, honest open.
      http.get(`${API_V1}/conversations/${THREAD_B}/messages`, () =>
        HttpResponse.json({
          data: [
            chatMessage(STALE_MESSAGE_ID, THREAD_B, "2026-09-14T10:00:00Z"),
          ],
          pageInfo: { nextCursor: null, hasMore: false },
        }),
      ),
      http.post(
        `${API_V1}/conversations/:id/read`,
        async ({ params, request }) => {
          readCalls.push({
            conversationId: String(params.id),
            body: await request.json(),
          });
          return HttpResponse.json({ ok: true });
        },
      ),
    );

    const { useMessagesController, wrapper } = await loadLive();
    const { result } = renderHook(() => useMessagesController(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.openThread(THREAD_B));
    await waitFor(() => expect(result.current.active?.id).toBe(THREAD_B));

    await waitFor(() =>
      expect(
        readCalls.filter((call) => call.conversationId === THREAD_B),
      ).toHaveLength(1),
    );
    expect(readCalls[0]?.body).toMatchObject({
      upToMessageId: STALE_MESSAGE_ID,
    });
  });
});
