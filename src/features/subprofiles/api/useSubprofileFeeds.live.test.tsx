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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/msw/server";
import { API, API_V1 } from "../../../test/msw/handlers";
import type { SubprofileDTO } from "./subprofiles.api";
import type { SubprofileFeedDTO } from "./subprofileFeeds.api";

/**
 * Podcast feed import, LIVE mode through MSW: the requests the hooks send, the
 * persona a publish hands back being adopted into the owner-editor cache, and
 * the typed refusals the server answers with.
 */

const PERSONA_ID = "sp-late-bloomers";
const FEEDS = `${API_V1}/subprofiles/${PERSONA_ID}/feeds`;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

const FEED: SubprofileFeedDTO = {
  id: "feed-1",
  subprofileId: PERSONA_ID,
  feedUrl: "https://feeds.example.com/rss",
  section: "episodes",
  title: "Late Bloomers",
  author: "Inês & Kai",
  imageUrl: null,
  autoPublish: false,
  status: "active",
  lastSyncedAt: "2026-09-28T07:00:00.000Z",
  lastError: null,
  pendingCount: 2,
  publishedCount: 0,
  createdAt: "2026-09-01T09:00:00.000Z",
};

const PERSONA: SubprofileDTO = {
  id: PERSONA_ID,
  kind: "podcaster",
  slug: "late-bloomers",
  handle: "late-bloomers",
  displayName: "Late Bloomers",
  avatarUrl: null,
  tagline: null,
  bio: null,
  coverUrl: null,
  accent: null,
  availability: null,
  ctaLabel: null,
  ctaUrl: null,
  socialLinks: [],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  items: [
    {
      id: "itm-1",
      section: "episodes",
      title: "The second coming out",
      createdAt: "2026-09-30T10:00:00.000Z",
      subtitle: "S2 · E10",
      url: "https://latebloomers.example/episodes/1",
      date: "2026-09",
      meta: "48 min",
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
  endorsementCount: 0,
  followerCount: 0,
  affiliations: [],
  editVersion: 6,
};

async function renderFeedHooks() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const feeds = await import("./useSubprofileFeeds");
  const mutations = await import("./useSubprofileFeedMutations");
  const errors = await import("./feedImportErrors");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  return { feeds, mutations, errors, client, wrapper };
}

describe("podcast feed import (live mode via MSW)", () => {
  it("lists a persona's feeds", async () => {
    server.use(http.get(FEEDS, () => HttpResponse.json([FEED])));
    const { feeds, wrapper } = await renderFeedHooks();
    const { result } = renderHook(() => feeds.useSubprofileFeeds(PERSONA_ID), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).toEqual([FEED]));
  });

  it("reads one feed's entries by status", async () => {
    let askedFor: string | null = null;
    server.use(
      http.get(`${FEEDS}/feed-1/entries`, ({ request }) => {
        askedFor = new URL(request.url).searchParams.get("status");
        return HttpResponse.json([]);
      }),
    );
    const { feeds, wrapper } = await renderFeedHooks();
    const { result } = renderHook(
      () => feeds.useFeedEntries(PERSONA_ID, "feed-1", "dismissed"),
      { wrapper },
    );
    await waitFor(() => expect(result.current.data).toEqual([]));
    expect(askedFor).toBe("dismissed");
  });

  it("connects with auto-publish off unless asked, sending the backfill choice", async () => {
    const sent: unknown[] = [];
    server.use(
      http.post(FEEDS, async ({ request }) => {
        sent.push(await request.json());
        return HttpResponse.json(FEED, { status: 201 });
      }),
    );
    const { mutations, wrapper } = await renderFeedHooks();
    const { result } = renderHook(
      () => mutations.useSubprofileFeedMutations(),
      {
        wrapper,
      },
    );
    await act(async () => {
      await result.current.connect.mutateAsync({
        subprofileId: PERSONA_ID,
        input: {
          url: FEED.feedUrl,
          section: "episodes",
          backfill: "none",
        },
      });
    });
    expect(sent).toEqual([
      {
        url: FEED.feedUrl,
        section: "episodes",
        autoPublish: false,
        backfill: "none",
      },
    ]);
  });

  it("previews without a persona id unless given one", async () => {
    const sent: unknown[] = [];
    server.use(
      http.post(`${API_V1}/subprofiles/feeds/preview`, async ({ request }) => {
        sent.push(await request.json());
        return HttpResponse.json({
          feedUrl: FEED.feedUrl,
          title: "Late Bloomers",
          author: null,
          description: null,
          episodeCount: 12,
          latest: [],
          alreadyConnected: false,
        });
      }),
    );
    const { mutations, wrapper } = await renderFeedHooks();
    const { result } = renderHook(
      () => mutations.useSubprofileFeedMutations(),
      {
        wrapper,
      },
    );
    await act(async () => {
      await result.current.preview.mutateAsync({
        url: FEED.feedUrl,
        subprofileId: PERSONA_ID,
      });
    });
    expect(sent).toEqual([{ url: FEED.feedUrl, subprofileId: PERSONA_ID }]);
  });

  it("publishes with the editor's version and adopts the returned persona into the owner cache", async () => {
    const sent: unknown[] = [];
    server.use(
      http.post(`${FEEDS}/feed-1/entries/publish`, async ({ request }) => {
        sent.push(await request.json());
        return HttpResponse.json({
          published: 2,
          skipped: 0,
          subprofile: PERSONA,
        });
      }),
    );
    const { mutations, client, wrapper } = await renderFeedHooks();
    const { result } = renderHook(
      () => mutations.useSubprofileFeedMutations(),
      {
        wrapper,
      },
    );
    await act(async () => {
      await result.current.publish.mutateAsync({
        subprofileId: PERSONA_ID,
        feedId: "feed-1",
        entryIds: ["e1", "e2"],
        expectedEditVersion: 5,
      });
    });
    expect(sent).toEqual([{ entryIds: ["e1", "e2"], expectedEditVersion: 5 }]);
    // The owner-editor query now holds the persona the publish answered with.
    const cached = client.getQueryData<{
      editVersion: number;
      sections: { section: string; items: { title: string }[] }[];
    }>(["subprofile", false, PERSONA_ID]);
    expect(cached?.editVersion).toBe(6);
    expect(
      cached?.sections
        .find((section) => section.section === "episodes")
        ?.items.map((item) => item.title),
    ).toEqual(["The second coming out"]);
  });

  it("sends no version when the editor has none", async () => {
    const sent: unknown[] = [];
    server.use(
      http.post(`${FEEDS}/feed-1/entries/publish`, async ({ request }) => {
        sent.push(await request.json());
        return HttpResponse.json({
          published: 1,
          skipped: 0,
          subprofile: PERSONA,
        });
      }),
    );
    const { mutations, wrapper } = await renderFeedHooks();
    const { result } = renderHook(
      () => mutations.useSubprofileFeedMutations(),
      {
        wrapper,
      },
    );
    await act(async () => {
      await result.current.publish.mutateAsync({
        subprofileId: PERSONA_ID,
        feedId: "feed-1",
        entryIds: ["e1"],
      });
    });
    expect(sent).toEqual([{ entryIds: ["e1"] }]);
  });

  it("disconnects with a DELETE and drops that feed's entries from the cache", async () => {
    let deleted = false;
    server.use(
      http.delete(`${FEEDS}/feed-1`, () => {
        deleted = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { feeds, mutations, client, wrapper } = await renderFeedHooks();
    client.setQueryData(
      feeds.feedQueryKeys.entries(false, PERSONA_ID, "feed-1", "pending"),
      [],
    );
    const { result } = renderHook(
      () => mutations.useSubprofileFeedMutations(),
      {
        wrapper,
      },
    );
    await act(async () => {
      await result.current.disconnect.mutateAsync({
        subprofileId: PERSONA_ID,
        feedId: "feed-1",
      });
    });
    expect(deleted).toBe(true);
    expect(
      client.getQueryData(
        feeds.feedQueryKeys.entries(false, PERSONA_ID, "feed-1", "pending"),
      ),
    ).toBeUndefined();
  });
});

describe("podcast feed import refusals (live mode via MSW)", () => {
  it.each([
    [409, { code: "FEED_ALREADY_CONNECTED" }, "alreadyConnected"],
    [422, { code: "FEED_LIMIT" }, "limit"],
    [422, { code: "not_a_feed" }, "not_a_feed"],
    [422, { code: "unreachable" }, "unreachable"],
  ])(
    "connect refused with %s %j reads as feedImport.error.%s",
    async (status, body, messageName) => {
      server.use(http.post(FEEDS, () => HttpResponse.json(body, { status })));
      const { mutations, errors, wrapper } = await renderFeedHooks();
      const { result } = renderHook(
        () => mutations.useSubprofileFeedMutations(),
        { wrapper },
      );
      let caught: unknown;
      await act(async () => {
        try {
          await result.current.connect.mutateAsync({
            subprofileId: PERSONA_ID,
            input: { url: FEED.feedUrl, section: "episodes", backfill: "all" },
          });
        } catch (error) {
          caught = error;
        }
      });
      expect(errors.feedErrorMessageKey(caught)).toBe(
        `subprofiles:feedImport.error.${messageName}`,
      );
    },
  );

  it("reads a publish into a full section, a conflict and a too-soon check", async () => {
    server.use(
      http.post(`${FEEDS}/feed-1/entries/publish`, () =>
        HttpResponse.json({ code: "SECTION_FULL" }, { status: 422 }),
      ),
      http.post(`${FEEDS}/feed-2/entries/publish`, () =>
        HttpResponse.json(
          { code: "PERSONA_EDIT_CONFLICT", currentEditVersion: 9 },
          { status: 409 },
        ),
      ),
      http.post(`${FEEDS}/feed-1/sync`, () =>
        HttpResponse.json(
          {
            code: "SYNC_TOO_SOON",
            message: "Checked a moment ago",
            retryAfterSeconds: 120,
          },
          { status: 429 },
        ),
      ),
      http.post(`${FEEDS}/feed-2/sync`, () =>
        HttpResponse.json({ message: "Too Many Requests" }, { status: 429 }),
      ),
    );
    const { mutations, errors, wrapper } = await renderFeedHooks();
    const { result } = renderHook(
      () => mutations.useSubprofileFeedMutations(),
      {
        wrapper,
      },
    );
    const fail = async (run: () => Promise<unknown>) => {
      let caught: unknown;
      await act(async () => {
        try {
          await run();
        } catch (error) {
          caught = error;
        }
      });
      return errors.feedErrorMessageKey(caught);
    };

    expect(
      await fail(() =>
        result.current.publish.mutateAsync({
          subprofileId: PERSONA_ID,
          feedId: "feed-1",
          entryIds: ["e1"],
        }),
      ),
    ).toBe("subprofiles:feedImport.error.sectionFull");
    expect(
      await fail(() =>
        result.current.publish.mutateAsync({
          subprofileId: PERSONA_ID,
          feedId: "feed-2",
          entryIds: ["e1"],
          expectedEditVersion: 3,
        }),
      ),
    ).toBe("subprofiles:feedImport.error.editConflict");
    expect(
      await fail(() =>
        result.current.sync.mutateAsync({
          subprofileId: PERSONA_ID,
          feedId: "feed-1",
        }),
      ),
    ).toBe("subprofiles:feedImport.error.tooSoon");
    expect(
      await fail(() =>
        result.current.sync.mutateAsync({
          subprofileId: PERSONA_ID,
          feedId: "feed-2",
        }),
      ),
    ).toBe("subprofiles:feedImport.error.rateLimited");
  });
});
