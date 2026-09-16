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

function conversationRow(id: string, updatedAt: string) {
  return {
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
  return { useConversations: useConversationsLive, wrapper };
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
    const { result } = renderHook(() => useConversationsLive(), { wrapper });

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
    const { result } = renderHook(() => useConversationsLive(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasNextPage).toBe(false);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    // Only the first-load GET fired; "load more" never issued a second one.
    expect(callCount).toBe(1);
  });
});
