import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
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
import { ApiError } from "../../../shared/api/client";
import { API_V1 } from "../../../test/msw/handlers";
import { server } from "../../../test/msw/server";
import { ADMIN_CREATOR_DRAFTS } from "../adminCreatorDrafts.data";
import { demoAdminCreatorDraftDetail } from "../adminCreatorDraftPreviews.data";
import {
  COMMUNITY_DRAFT_PREVIEW_KEYS,
  CREATOR_DRAFT_KINDS,
  EVENT_DRAFT_PREVIEW_KEYS,
} from "./adminCreatorDrafts.api";
import {
  useAdminCreatorDraft,
  useAdminCreatorDrafts,
} from "./useAdminCreatorDrafts";

const mockDemoMode = vi.hoisted(() => ({ current: true }));
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mockDemoMode.current }),
}));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());
beforeEach(() => {
  mockDemoMode.current = true;
});

function makeWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

function freshClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe("admin creator draft hooks", () => {
  it("serves every kind from fixtures in demo and fetches nothing", async () => {
    mockDemoMode.current = true;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { result } = renderHook(() => useAdminCreatorDrafts(null), {
      wrapper: makeWrapper(freshClient()),
    });
    await waitFor(() => expect(result.current.rows).toHaveLength(7));
    expect(new Set(result.current.rows.map((row) => row.kind))).toEqual(
      new Set(CREATOR_DRAFT_KINDS),
    );
    expect(result.current.total).toBe(7);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("filters the demo list by kind, newest save first", async () => {
    mockDemoMode.current = true;
    const client = freshClient();
    const { result } = renderHook(() => useAdminCreatorDrafts("event"), {
      wrapper: makeWrapper(client),
    });
    await waitFor(() =>
      expect(result.current.rows.map((row) => row.kind)).toEqual(["event"]),
    );
    const all = renderHook(() => useAdminCreatorDrafts(null), {
      wrapper: makeWrapper(client),
    });
    await waitFor(() => expect(all.result.current.rows).toHaveLength(7));
    const savedTimes = all.result.current.rows.map((row) =>
      Date.parse(row.lastSavedAt),
    );
    expect([...savedTimes].sort((left, right) => right - left)).toEqual(
      savedTimes,
    );
  });

  it("answers an unknown demo id with a 404", async () => {
    mockDemoMode.current = true;
    const { result } = renderHook(
      () => useAdminCreatorDraft("persona", "nope"),
      { wrapper: makeWrapper(freshClient()) },
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as ApiError).status).toBe(404);
  });

  it("asks live for the page and kind, keyed with demo mode", async () => {
    mockDemoMode.current = false;
    server.use(
      http.get(`${API_V1}/admin/creator-drafts`, ({ request }) => {
        const url = new URL(request.url);
        return HttpResponse.json({
          items: [],
          total: 0,
          page: Number(url.searchParams.get("page")),
          pageSize: 20,
          kind: url.searchParams.get("kind"),
        });
      }),
    );
    const client = freshClient();
    renderHook(() => useAdminCreatorDrafts("listing_edit"), {
      wrapper: makeWrapper(client),
    });
    await waitFor(() =>
      expect(
        client.getQueryData(["admin-creator-drafts", false, "listing_edit"]),
      ).toBeDefined(),
    );
  });

  it("reads a detail fresh on every open and never on window focus", async () => {
    mockDemoMode.current = false;
    let readCount = 0;
    server.use(
      http.get(`${API_V1}/admin/creator-drafts/persona/abc`, () => {
        readCount += 1;
        return HttpResponse.json({ id: "abc", kind: "persona" });
      }),
    );
    const client = freshClient();
    const first = renderHook(() => useAdminCreatorDraft("persona", "abc"), {
      wrapper: makeWrapper(client),
    });
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
    first.unmount();
    const second = renderHook(() => useAdminCreatorDraft("persona", "abc"), {
      wrapper: makeWrapper(client),
    });
    await waitFor(() => expect(second.result.current.isSuccess).toBe(true));
    expect(readCount).toBe(2);
    window.dispatchEvent(new Event("focus"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(readCount).toBe(2);
  });

  it("keeps every demo preview to allow-listed fields", () => {
    for (const row of ADMIN_CREATOR_DRAFTS) {
      const detail = demoAdminCreatorDraftDetail(row.kind, row.id);
      expect(detail).not.toBeNull();
      if (detail?.kind === "event") {
        expect(
          Object.keys(detail.preview).every((key) =>
            [...EVENT_DRAFT_PREVIEW_KEYS, "community", "runByListing"].includes(
              key as never,
            ),
          ),
        ).toBe(true);
        expect(detail.preview).not.toHaveProperty("address");
        expect(detail.preview).not.toHaveProperty("onlineUrl");
      }
      if (detail?.kind === "community") {
        expect(
          Object.keys(detail.preview).every((key) =>
            (COMMUNITY_DRAFT_PREVIEW_KEYS as readonly string[]).includes(key),
          ),
        ).toBe(true);
      }
      if (detail?.kind === "listing" || detail?.kind === "listing_edit") {
        for (const privateKey of [
          "rel",
          "ownerName",
          "ownerBio",
          "consentOuting",
          "badge",
          "evidence",
        ]) {
          expect(detail.preview).not.toHaveProperty(privateKey);
        }
      }
      if (detail?.kind === "persona") {
        expect(detail.preview.visibility).not.toBe("private");
      }
      if (detail?.kind === "studio_episode") {
        expect(
          detail.preview.tracks.find(
            (track) => track.id === detail.episodeTrackId,
          ),
        ).toMatchObject({ isDraft: true });
        expect(
          detail.preview.tracks.filter((track) => track.isDraft === true),
        ).toHaveLength(1);
      }
    }
  });
});
