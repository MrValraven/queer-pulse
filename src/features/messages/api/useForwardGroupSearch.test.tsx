import { act, renderHook, waitFor } from "@testing-library/react";
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
import { TestProviders } from "../../../test/TestProviders";
import type { Conversation } from "../data";
import type { ConversationListScope } from "../mailboxes/mailboxScope";
import { useForwardGroupSearch } from "./useForwardGroupSearch";

/**
 * ENG-403: the forward picker's Groups section searches the server by name,
 * one bounded page per term (`GET /conversations?q=&kind=group`).
 * Demo mode (this suite's default, `VITE_DEMO=1`) filters the loaded groups
 * locally; live mode runs against MSW.
 */

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

const PERSONAL_SCOPE: ConversationListScope = {
  identityId: "identity-profile",
  isPersonal: true,
  isReadOnly: false,
  staffedIdentityIds: new Set<string>(),
};

function loadedGroup(id: string, name: string): Conversation {
  return { id, name, isGroup: true, hasLeft: false } as Conversation;
}

const LOADED_GROUPS: Conversation[] = [
  loadedGroup("g-lisbon", "Lisboa Pride crew"),
  loadedGroup("g-sao-joao", "São João picnic"),
];

function groupRow(id: string, title: string, hasLeft = false) {
  return {
    id,
    type: "group",
    kind: "group",
    title,
    otherParticipant: null,
    lastMessage: null,
    unreadCount: 0,
    updatedAt: "2026-09-14T09:00:00Z",
    myLastReadAt: null,
    otherLastReadAt: null,
    otherDeliveredAt: null,
    otherParticipantId: null,
    avatarUrl: null,
    memberCount: 3,
    members: [],
    hasLeft,
  };
}

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useForwardGroupSearch: useForwardGroupSearchLive } =
    await import("./useForwardGroupSearch");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const { I18nProvider } = await import("../../../app/providers/I18nProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <DemoModeProvider>{children}</DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { useForwardGroupSearch: useForwardGroupSearchLive, wrapper };
}

describe("useForwardGroupSearch in demo mode", () => {
  it("lists the loaded groups for an empty query", () => {
    const { result } = renderHook(
      () => useForwardGroupSearch("  ", LOADED_GROUPS, PERSONAL_SCOPE),
      { wrapper: TestProviders },
    );

    expect(result.current.groups).toEqual(LOADED_GROUPS);
    expect(result.current.isSearching).toBe(false);
  });

  it("filters the loaded groups locally, ignoring case and accents", () => {
    const { result } = renderHook(
      () => useForwardGroupSearch("sao JOAO", LOADED_GROUPS, PERSONAL_SCOPE),
      { wrapper: TestProviders },
    );

    expect(result.current.groups.map((group) => group.id)).toEqual([
      "g-sao-joao",
    ]);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.isError).toBe(false);
  });
});

describe("useForwardGroupSearch in live mode", () => {
  it("sends no request while the query is empty", async () => {
    let requestCount = 0;
    server.use(
      http.get(`${API_V1}/conversations`, () => {
        requestCount += 1;
        return HttpResponse.json({
          data: [],
          pageInfo: { nextCursor: null, hasMore: false },
        });
      }),
    );
    const { useForwardGroupSearch: useLive, wrapper } = await loadLive();

    const { result } = renderHook(
      () => useLive("", LOADED_GROUPS, PERSONAL_SCOPE),
      { wrapper },
    );

    expect(result.current.groups).toEqual(LOADED_GROUPS);
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(requestCount).toBe(0);
  });

  it("searches the server by name and appends the groups past the loaded pages", async () => {
    const requestedParams: Record<string, string | null>[] = [];
    server.use(
      http.get(`${API_V1}/conversations`, ({ request }) => {
        const params = new URL(request.url).searchParams;
        requestedParams.push({
          q: params.get("q"),
          kind: params.get("kind"),
          excludeLeft: params.get("excludeLeft"),
          as: params.get("as"),
          limit: params.get("limit"),
          cursor: params.get("cursor"),
        });
        return HttpResponse.json({
          data: [
            // Already loaded: listed once, from the loaded copy.
            groupRow("g-lisbon", "Lisboa Pride crew"),
            // Past the loaded pages: appended after the loaded matches.
            groupRow("g-porto", "Porto Pride walkers"),
            // Left: never a forward target.
            groupRow("g-left", "Pride archive", true),
          ],
          pageInfo: { nextCursor: null, hasMore: false },
        });
      }),
    );
    const { useForwardGroupSearch: useLive, wrapper } = await loadLive();

    const { result } = renderHook(
      () => useLive("pride", LOADED_GROUPS, PERSONAL_SCOPE),
      { wrapper },
    );

    // The loaded match shows before the server answers.
    expect(result.current.groups.map((group) => group.id)).toEqual([
      "g-lisbon",
    ]);
    await waitFor(() =>
      expect(result.current.groups.map((group) => group.id)).toEqual([
        "g-lisbon",
        "g-porto",
      ]),
    );
    expect(result.current.isSearching).toBe(false);
    expect(requestedParams).toEqual([
      {
        q: "pride",
        kind: "group",
        excludeLeft: "true",
        as: PERSONAL_SCOPE.identityId,
        limit: "50",
        cursor: null,
      },
    ]);
  });

  it("keeps the loaded matches and reports the error when the search fails", async () => {
    server.use(
      http.get(`${API_V1}/conversations`, () =>
        HttpResponse.json({ message: "boom" }, { status: 500 }),
      ),
    );
    const { useForwardGroupSearch: useLive, wrapper } = await loadLive();

    const { result } = renderHook(
      () => useLive("lisboa", LOADED_GROUPS, PERSONAL_SCOPE),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.groups.map((group) => group.id)).toEqual([
      "g-lisbon",
    ]);
  });

  it("keeps the last answer on screen while the next term loads, narrowed to rows the typed text still matches", async () => {
    const pendingAnswers: Array<() => void> = [];
    server.use(
      http.get(`${API_V1}/conversations`, async ({ request }) => {
        const term = new URL(request.url).searchParams.get("q");
        if (term !== "pride") {
          await new Promise<void>((resolve) => pendingAnswers.push(resolve));
        }
        return HttpResponse.json({
          data: [groupRow("g-porto", "Porto Pride walkers")],
          pageInfo: { nextCursor: null, hasMore: false },
        });
      }),
    );
    const { useForwardGroupSearch: useLive, wrapper } = await loadLive();

    const { result, rerender } = renderHook(
      ({ query }: { query: string }) =>
        useLive(query, LOADED_GROUPS, PERSONAL_SCOPE),
      { wrapper, initialProps: { query: "pride" } },
    );
    await waitFor(() =>
      expect(result.current.groups.map((group) => group.id)).toContain(
        "g-porto",
      ),
    );

    // A narrower term the row still matches: it stays put through the
    // debounce and the next request.
    rerender({ query: "pride w" });
    expect(result.current.groups.map((group) => group.id)).toEqual(["g-porto"]);
    await waitFor(() => expect(pendingAnswers).toHaveLength(1));
    expect(result.current.isSearching).toBe(true);
    expect(result.current.groups.map((group) => group.id)).toEqual(["g-porto"]);

    // A term the older answer's row fails: it leaves at once.
    rerender({ query: "pridex" });
    expect(result.current.groups).toEqual([]);
    act(() => pendingAnswers.forEach((answer) => answer()));
  });

  it("aborts the request of a term the member typed past", async () => {
    // The shared setup strips `signal` before MSW sees a request (the
    // jsdom/Node AbortSignal realm mismatch, `src/test/setup.ts`), so a
    // handler's `request.signal` never fires. The signal is read one layer
    // up instead, where `client.ts` hands it to `fetch`.
    const superseded: { signal: AbortSignal | null } = { signal: null };
    const strippingFetch = globalThis.fetch;
    globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      if (url.searchParams.get("q") === "lis" && init?.signal) {
        superseded.signal = init.signal;
      }
      return strippingFetch(input, init);
    };
    try {
      server.use(
        http.get(`${API_V1}/conversations`, async ({ request }) => {
          const term = new URL(request.url).searchParams.get("q");
          if (term === "lis") {
            // Held open until the hook gives up on it.
            await new Promise<void>((resolve) =>
              superseded.signal?.addEventListener("abort", () => resolve()),
            );
          }
          return HttpResponse.json({
            data: [],
            pageInfo: { nextCursor: null, hasMore: false },
          });
        }),
      );
      const { useForwardGroupSearch: useLive, wrapper } = await loadLive();

      const { rerender } = renderHook(
        ({ query }: { query: string }) =>
          useLive(query, LOADED_GROUPS, PERSONAL_SCOPE),
        { wrapper, initialProps: { query: "lis" } },
      );
      await waitFor(() => expect(superseded.signal).not.toBeNull());

      rerender({ query: "lisboa" });

      await waitFor(() => expect(superseded.signal?.aborted).toBe(true));
    } finally {
      globalThis.fetch = strippingFetch;
    }
  });
});
