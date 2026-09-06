import { renderHook, waitFor } from "@testing-library/react";
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../../test/msw/server";
import { API, API_V1 } from "../../../test/msw/handlers";
import type { FeedItem } from "./feed.api";

/**
 * LIVE-mode suite: proves `useFeed` exposes the backend's merged `/feed` page
 * as ONE `items: FeedItem[]` array, in the exact order the server returned —
 * community_post / forum_thread / gathering / new_member interleaved — rather
 * than the old behaviour of partitioning by type (which dropped forum_thread
 * and gathering entirely and lost the merge order). Mirrors the live-mode
 * harness in `useJobs.live.test.tsx`/`useAdminMembers.live.test.tsx`:
 * `vi.resetModules()` + `vi.stubEnv("VITE_API_URL", ...)` before dynamically
 * re-importing every module that (transitively) reads `shared/api/config.ts`,
 * so `apiAvailable`/`demoConfigured` re-freeze against the stubbed env instead
 * of the suite-wide demo default in `vitest.config.ts`.
 *
 * `useSocial` is mocked directly (the repo's established pattern — see
 * `useMemberContact.test.tsx`) rather than wrapped in the real
 * `SocialProvider`: that provider transitively needs `AuthProvider` (which
 * unconditionally fires `/csrf-token` + `/auth/me` in live mode) for no
 * benefit here — this suite isn't exercising the block/mute filter, only
 * order preservation, so an empty blocked/muted list is all `useFeed` needs.
 */
vi.mock("../../../app/providers/useSocial", () => ({
  useSocial: () => ({ blocked: [], muted: [] }),
}));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useFeed } = await import("./useFeed");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  // PRD-107: `useFeed` reads the reader's language (it becomes the magazine
  // source's content language), so the hook now needs an `I18nProvider` above
  // it. Only `language` is read here, which the provider has synchronously;
  // no catalog has to resolve for this suite.
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
  return { useFeed, wrapper };
}

/** A minimal, order-distinguishing feed page: one item of each of three
 *  different types, deliberately NOT grouped by type — a community_post,
 *  then a new_member, then a gathering. */
const MIXED_ORDER_FEED_ITEMS: FeedItem[] = [
  {
    id: "post-1",
    type: "community_post",
    createdAt: "2026-08-04T12:00:00.000Z",
    title: "Pride planning kickoff",
    summary: "Let's get the route locked in this week.",
    link: "/communities/queer-creatives/posts/post-1",
    actor: {
      handle: "marco",
      displayName: "Marco Vieira",
      avatarUrl: null,
    },
  },
  {
    id: "member-1",
    type: "new_member",
    createdAt: "2026-08-04T11:00:00.000Z",
    title: "Alina Costa",
    summary: "Photographer, new to the city.",
    link: "/members/alina-costa",
    actor: {
      handle: "alina-costa",
      displayName: "Alina Costa",
      avatarUrl: null,
    },
  },
  {
    id: "gathering-1",
    type: "gathering",
    createdAt: "2026-08-04T10:00:00.000Z",
    title: "Queer Board Games Night",
    summary: "Casual meetup, all levels welcome.",
    link: "/gatherings/board-games-night",
    actor: null,
  },
];

describe("useFeed (live mode via MSW)", () => {
  it("returns GET /feed's items in the SERVER'S merge order, not grouped by type", async () => {
    server.use(
      http.get(`${API_V1}/feed`, () =>
        HttpResponse.json(MIXED_ORDER_FEED_ITEMS),
      ),
    );

    const { useFeed, wrapper } = await loadLive();
    const { result } = renderHook(() => useFeed("All"), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Order preservation is the whole point: community_post, then new_member,
    // then gathering — exactly the server's sequence, not partitioned into
    // separate type-grouped buckets (the old `posts`/`newMembers` behaviour,
    // which also silently dropped `gathering` and `forum_thread` items).
    expect(result.current.items.map((item) => item.id)).toEqual([
      "post-1",
      "member-1",
      "gathering-1",
    ]);
    expect(result.current.items.map((item) => item.type)).toEqual([
      "community_post",
      "new_member",
      "gathering",
    ]);
  });

  it("sends the reader's language so the magazine source can answer in it (PRD-107)", async () => {
    let requestedUrl = "";
    server.use(
      http.get(`${API_V1}/feed`, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json([]);
      }),
    );

    const { useFeed, wrapper } = await loadLive();
    const { result } = renderHook(() => useFeed("All"), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // The detected chrome language rides along as `?lang=`; the backend
    // narrows it and ignores anything the magazine does not publish in.
    expect(new URL(requestedUrl).searchParams.get("lang")).toBeTruthy();
  });
});
