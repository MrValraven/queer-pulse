import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { server } from "../../../test/msw/server";
import { API_V1 } from "../../../test/msw/handlers";
import {
  CAFE_IDENTITY_ID,
  PROFILE_IDENTITY_ID,
  loadLiveWrapper,
  registerLiveSessionHandlers,
} from "./liveMailboxTestHarness";

// Live mode via MSW: message search and the starred list read the active
// mailbox only, sending it as `as` and keying their caches by it.

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

/** Entries that reached the network (the disabled entries of the
 *  unresolved scope and the demo branch never do). */
function hasFetched(query: { state: { dataUpdatedAt: number } }): boolean {
  return query.state.dataUpdatedAt > 0;
}

function recordSearchRequests(requestedAs: (string | null)[]) {
  server.use(
    http.get(`${API_V1}/messages/search`, ({ request }) => {
      requestedAs.push(new URL(request.url).searchParams.get("as"));
      return HttpResponse.json({ hits: [], conversations: [] });
    }),
  );
}

function recordStarredRequests(requestedAs: (string | null)[]) {
  server.use(
    http.get(`${API_V1}/messages/starred`, ({ request }) => {
      requestedAs.push(new URL(request.url).searchParams.get("as"));
      return HttpResponse.json({
        items: [],
        conversations: [],
        nextCursor: null,
        hasMore: false,
      });
    }),
  );
}

describe("message search is mailbox scoped (live mode)", () => {
  it("sends the active mailbox as `as` and keys the cache by it", async () => {
    registerLiveSessionHandlers();
    const requestedAs: (string | null)[] = [];
    recordSearchRequests(requestedAs);
    const { wrapper, client } = await loadLiveWrapper(
      `/messages?as=${CAFE_IDENTITY_ID}`,
    );
    const { useMessageSearch } = await import("../api/useMessageSearch");
    const { result } = renderHook(() => useMessageSearch("terrace", "You"), {
      wrapper,
    });

    await waitFor(() => expect(requestedAs).toEqual([CAFE_IDENTITY_ID]));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const keys = client
      .getQueryCache()
      .findAll({ queryKey: ["messageSearch"], predicate: hasFetched })
      .map((query) => query.queryKey);
    expect(keys).toEqual([
      ["messageSearch", "terrace", false, null, CAFE_IDENTITY_ID],
    ]);
  });

  it("sends the profile identity for the personal mailbox", async () => {
    registerLiveSessionHandlers();
    const requestedAs: (string | null)[] = [];
    recordSearchRequests(requestedAs);
    const { wrapper } = await loadLiveWrapper("/messages");
    const { useMessageSearch } = await import("../api/useMessageSearch");
    renderHook(() => useMessageSearch("terrace", "You"), { wrapper });

    await waitFor(() => expect(requestedAs).toEqual([PROFILE_IDENTITY_ID]));
  });
});

describe("the starred list is mailbox scoped (live mode)", () => {
  it("sends the active mailbox as `as` and keys the cache by it", async () => {
    registerLiveSessionHandlers();
    const requestedAs: (string | null)[] = [];
    recordStarredRequests(requestedAs);
    const { wrapper, client } = await loadLiveWrapper(
      `/messages?as=${CAFE_IDENTITY_ID}`,
    );
    const { useStarredMessages } = await import("../api/useMessagePinStar");
    const { result } = renderHook(() => useStarredMessages(true), {
      wrapper,
    });

    await waitFor(() => expect(requestedAs).toEqual([CAFE_IDENTITY_ID]));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const keys = client
      .getQueryCache()
      .findAll({ queryKey: ["starred-messages", false], predicate: hasFetched })
      .map((query) => query.queryKey);
    expect(keys).toEqual([
      ["starred-messages", false, "", "all", CAFE_IDENTITY_ID],
    ]);
  });
});
