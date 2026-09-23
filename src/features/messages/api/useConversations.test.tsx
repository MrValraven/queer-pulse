import { renderHook, waitFor, act } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../../test/msw/server";
import { API, API_V1 } from "../../../test/msw/handlers";
import type { ConversationListScope } from "../mailboxes/mailboxScope";

// ENG-253: proves `useConversations` actually reaches page two (the bug
// ENG-253 fixes: the old endpoint silently truncated the whole inbox at a
// fixed count) WITHOUT switching the `["conversations"]` cache entry to
// `useInfiniteQuery`'s `InfiniteData<Page>` shape, which would break at
// least seven other flat-array `setQueriesData<Conversation[]>` call sites
// this build does not own (see this build's report). Live mode via MSW,
// mirroring `useVerification.test.tsx`'s pattern.

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

/** Narrows a possibly-`undefined` query result down to `T`, failing the test
 *  loudly (rather than silently reading past it with `!`/`any`) the moment a
 *  genuine `undefined` shows up. */
function expectDefined<T>(value: T | undefined): T {
  expect(value).toBeDefined();
  if (value === undefined) {
    throw new Error("Expected value to be defined");
  }
  return value;
}

const STAFFED_IDENTITY_IDS: ReadonlySet<string> = new Set(["identity-cafe"]);

const PERSONAL_SCOPE: ConversationListScope = {
  identityId: "identity-profile",
  isPersonal: true,
  isReadOnly: false,
  staffedIdentityIds: STAFFED_IDENTITY_IDS,
};

const CAFE_SCOPE: ConversationListScope = {
  ...PERSONAL_SCOPE,
  identityId: "identity-cafe",
  isPersonal: false,
};

function conversationRow(
  id: string,
  updatedAt: string,
  mailboxIdentityId?: string,
) {
  return {
    ...(mailboxIdentityId ? { mailboxIdentityId } : {}),
    id,
    type: "dm",
    otherParticipant: {
      handle: `member-${id}`,
      displayName: `Member ${id}`,
      avatarUrl: null,
    },
    lastMessage: null,
    unreadCount: 0,
    updatedAt,
    myLastReadAt: null,
    otherLastReadAt: null,
    otherDeliveredAt: null,
    otherParticipantId: `u-${id}`,
    kind: "direct",
    title: null,
    avatarUrl: null,
    memberCount: 0,
    members: [],
  };
}

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useConversations: useConversationsLive } =
    await import("./useConversations");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const { I18nProvider } = await import("../../../app/providers/I18nProvider");
  const { DeletedConversationsProvider } =
    await import("../../../app/providers/DeletedConversationsProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <DemoModeProvider>
          <DeletedConversationsProvider>
            {children}
          </DeletedConversationsProvider>
        </DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { useConversations: useConversationsLive, wrapper, client };
}

describe("useConversations (ENG-253 paging, live mode via MSW)", () => {
  it("loads page one, then fetchNextPage reaches a genuinely different page two", async () => {
    const requestedCursors: (string | null)[] = [];
    server.use(
      http.get(`${API_V1}/conversations`, ({ request }) => {
        const cursor = new URL(request.url).searchParams.get("cursor");
        requestedCursors.push(cursor);
        if (!cursor) {
          return HttpResponse.json({
            data: [conversationRow("c1", "2026-09-14T09:00:00Z")],
            pageInfo: { nextCursor: "cursor-2", hasMore: true },
          });
        }
        expect(cursor).toBe("cursor-2");
        return HttpResponse.json({
          data: [conversationRow("c2", "2026-09-13T09:00:00Z")],
          pageInfo: { nextCursor: null, hasMore: false },
        });
      }),
    );

    const { useConversations: useConversationsLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useConversationsLive(CAFE_SCOPE), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(expectDefined(result.current.data).map((c) => c.id)).toEqual(["c1"]);
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() =>
      expect(expectDefined(result.current.data).map((c) => c.id)).toEqual([
        "c1",
        "c2",
      ]),
    );
    expect(result.current.hasNextPage).toBe(false);
    expect(requestedCursors).toEqual([null, "cursor-2"]);
  });

  it("fetchNextPage is a no-op once the server reports no more pages", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API_V1}/conversations`, () => {
        callCount += 1;
        return HttpResponse.json({
          data: [conversationRow("c1", "2026-09-14T09:00:00Z")],
          pageInfo: { nextCursor: null, hasMore: false },
        });
      }),
    );

    const { useConversations: useConversationsLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useConversationsLive(CAFE_SCOPE), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasNextPage).toBe(false);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    // Only the first-load GET fired; "load more" never issued a second one.
    expect(callCount).toBe(1);
  });
});

describe("useConversations (mailbox scope, live mode via MSW)", () => {
  it("sends the scope's identity as `as` on the first page and on fetchNextPage", async () => {
    const requestedParams: Record<string, string | null>[] = [];
    server.use(
      http.get(`${API_V1}/conversations`, ({ request }) => {
        const params = new URL(request.url).searchParams;
        requestedParams.push({
          as: params.get("as"),
          cursor: params.get("cursor"),
          limit: params.get("limit"),
        });
        return HttpResponse.json(
          params.get("cursor")
            ? {
                data: [conversationRow("c2", "2026-09-13T09:00:00Z")],
                pageInfo: { nextCursor: null, hasMore: false },
              }
            : {
                data: [conversationRow("c1", "2026-09-14T09:00:00Z")],
                pageInfo: { nextCursor: "cursor-2", hasMore: true },
              },
        );
      }),
    );

    const { useConversations: useConversationsLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useConversationsLive(CAFE_SCOPE), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(requestedParams).toEqual([
      { as: "identity-cafe", cursor: null, limit: "30" },
      { as: "identity-cafe", cursor: "cursor-2", limit: "30" },
    ]);
  });

  it("sends the profile identity as `as` for the personal mailbox", async () => {
    const requestedAs: (string | null)[] = [];
    server.use(
      http.get(`${API_V1}/conversations`, ({ request }) => {
        requestedAs.push(new URL(request.url).searchParams.get("as"));
        return HttpResponse.json({
          data: [],
          pageInfo: { nextCursor: null, hasMore: false },
        });
      }),
    );

    const { useConversations: useConversationsLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useConversationsLive(PERSONAL_SCOPE), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(requestedAs).toEqual(["identity-profile"]);
  });

  it("makes no request while the scope is unresolved", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API_V1}/conversations`, () => {
        callCount += 1;
        return HttpResponse.json({
          data: [],
          pageInfo: { nextCursor: null, hasMore: false },
        });
      }),
    );

    const { useConversations: useConversationsLive, wrapper } =
      await loadLive();
    const { result } = renderHook(() => useConversationsLive(null), {
      wrapper,
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(result.current.fetchStatus).toBe("idle");
    expect(callCount).toBe(0);
  });

  it("keys the cache entry by the scope's identity", async () => {
    server.use(
      http.get(`${API_V1}/conversations`, () =>
        HttpResponse.json({
          data: [],
          pageInfo: { nextCursor: null, hasMore: false },
        }),
      ),
    );

    const {
      useConversations: useConversationsLive,
      wrapper,
      client,
    } = await loadLive();
    const { result } = renderHook(() => useConversationsLive(CAFE_SCOPE), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const keys = client
      .getQueryCache()
      .findAll({ queryKey: ["conversations"] })
      .map((query) => query.queryKey);
    expect(keys).toEqual([["conversations", false, "", "identity-cafe"]]);
  });

  it("seats rows in a business scope and leaves them unseated in the personal scope", async () => {
    server.use(
      http.get(`${API_V1}/conversations`, ({ request }) => {
        const as = new URL(request.url).searchParams.get("as");
        return HttpResponse.json({
          data:
            as === "identity-cafe"
              ? [
                  conversationRow(
                    "cafe-thread",
                    "2026-09-14T09:00:00Z",
                    "identity-cafe",
                  ),
                ]
              : [
                  conversationRow(
                    "aurora-thread",
                    "2026-09-14T09:00:00Z",
                    "identity-aurora",
                  ),
                ],
          pageInfo: { nextCursor: null, hasMore: false },
        });
      }),
    );

    const { useConversations: useConversationsLive, wrapper } =
      await loadLive();
    const { result: cafeResult } = renderHook(
      () => useConversationsLive(CAFE_SCOPE),
      { wrapper },
    );
    const { result: personalResult } = renderHook(
      () => useConversationsLive(PERSONAL_SCOPE),
      { wrapper },
    );
    await waitFor(() => expect(cafeResult.current.isLoading).toBe(false));
    await waitFor(() => expect(personalResult.current.isLoading).toBe(false));

    const [cafeRow] = expectDefined(cafeResult.current.data);
    const [personalRow] = expectDefined(personalResult.current.data);
    expect(cafeRow?.mailboxSeatIdentityId).toBe("identity-cafe");
    expect(personalRow?.mailboxIdentityId).toBe("identity-aurora");
    expect(personalRow?.mailboxSeatIdentityId).toBeUndefined();
  });
});
