import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * The signed-in member the auth mock below reports. The session-bootstrap cache
 * key carries it (see `sessionBootstrapQueryKey`), so the pre-seeded entry has
 * to be written under the same id the provider will read with.
 */
const MEMBER_ID = "member-tiago";
/** A second member who signs in on the same device. */
const OTHER_MEMBER_ID = "member-rui";
/** Who `loadLiveSaved`'s auth mock reports; a test switches it, then
 *  rerenders. */
const signedInMember = { id: MEMBER_ID };

const savedPage = {
  items: [
    {
      id: "article:one",
      kind: "article",
      title: "One",
      savedAt: "2026-01-01T00:00:00Z",
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
};

async function loadLiveSaved(client: QueryClient) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://localhost:3000");
  vi.stubEnv("VITE_DEMO", "");

  const getSaved = vi.fn();
  const putSaved = vi.fn(() => Promise.resolve());
  const deleteSaved = vi.fn(() => Promise.resolve());
  vi.doMock("../../features/members/api/saved.api", async () => ({
    ...(await vi.importActual("../../features/members/api/saved.api")),
    getSaved,
    putSaved,
    deleteSaved,
  }));
  vi.doMock("./authContext", () => ({
    useAuth: () => ({
      loggedIn: true,
      user: { id: signedInMember.id, profile: { slug: "tiago-costa" } },
    }),
  }));

  const { SavedProvider } = await import("./SavedProvider");
  const { useSaved } = await import("./useSaved");
  const { DemoModeProvider } = await import("./DemoModeProvider");
  const { I18nProvider } = await import("./I18nProvider");
  const { ToastProvider } =
    await import("../../shared/components/feedback/ToastProvider");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <ToastProvider>
          <DemoModeProvider>
            <SavedProvider>{children}</SavedProvider>
          </DemoModeProvider>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { useSaved, wrapper, getSaved, putSaved, deleteSaved };
}

/** A client whose bootstrap cache already holds `savedPage`, for both
 *  members. */
function seededClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  for (const memberId of [MEMBER_ID, OTHER_MEMBER_ID]) {
    client.setQueryData(["bootstrap", false, memberId], {
      profile: { slug: "tiago-costa", limited: false },
      saved: savedPage,
      blocks: { items: [], total: 0, page: 1, pageSize: 20 },
      mutes: { items: [], total: 0, page: 1, pageSize: 20 },
    });
  }
  return client;
}

/**
 * Variant of `loadLiveSaved` for the fallback path: no bootstrap data is
 * pre-seeded, and `getBootstrap` itself is mocked to reject, so
 * `useSessionBootstrap`'s query runs for real and settles with `isError: true`
 * and no data, simulating a 404 (frontend ahead of backend), a 500, or a
 * member with no profile row.
 */
async function loadLiveSavedBootstrapError(client: QueryClient) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://localhost:3000");
  vi.stubEnv("VITE_DEMO", "");

  const getSaved = vi.fn().mockResolvedValue(savedPage);
  vi.doMock("../../features/members/api/saved.api", async () => ({
    ...(await vi.importActual("../../features/members/api/saved.api")),
    getSaved,
  }));
  vi.doMock("../../shared/api/bootstrap.api", async () => ({
    ...(await vi.importActual("../../shared/api/bootstrap.api")),
    getBootstrap: vi.fn().mockRejectedValue(new Error("bootstrap unavailable")),
  }));
  vi.doMock("./authContext", () => ({
    useAuth: () => ({
      loggedIn: true,
      user: { id: MEMBER_ID, profile: { slug: "tiago-costa" } },
    }),
  }));

  const { SavedProvider } = await import("./SavedProvider");
  const { useSaved } = await import("./useSaved");
  const { DemoModeProvider } = await import("./DemoModeProvider");
  const { I18nProvider } = await import("./I18nProvider");
  const { ToastProvider } =
    await import("../../shared/components/feedback/ToastProvider");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <ToastProvider>
          <DemoModeProvider>
            <SavedProvider>{children}</SavedProvider>
          </DemoModeProvider>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { useSaved, wrapper, getSaved };
}

beforeEach(() => {
  window.localStorage.clear();
  signedInMember.id = MEMBER_ID;
});

describe("SavedProvider (live mode)", () => {
  it("hydrates from the bootstrap payload without calling getSaved", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    client.setQueryData(["bootstrap", false, MEMBER_ID], {
      profile: { slug: "tiago-costa", limited: false },
      saved: savedPage,
      blocks: { items: [], total: 0, page: 1, pageSize: 20 },
      mutes: { items: [], total: 0, page: 1, pageSize: 20 },
    });

    const { useSaved, wrapper, getSaved } = await loadLiveSaved(client);
    const { result } = renderHook(() => useSaved(), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.isSaved("article:one")).toBe(true);
    expect(getSaved).not.toHaveBeenCalled();
  });

  it("falls back to getSaved when the bootstrap query settles in error", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    // No bootstrap data seeded: the real (mocked-to-reject) getBootstrap
    // runs, so the query settles with isError: true and no data, which is what
    // must trigger the fallback. Without it, `items` would stay empty forever
    // and this assertion would time out.

    const { useSaved, wrapper, getSaved } =
      await loadLiveSavedBootstrapError(client);
    const { result } = renderHook(() => useSaved(), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.isSaved("article:one")).toBe(true);
    expect(getSaved).toHaveBeenCalledTimes(1);
  });
});

describe("SavedProvider remember (live mode)", () => {
  it("appends absent ids, keeps the existing copy and sends no request", async () => {
    const { useSaved, wrapper, getSaved, putSaved, deleteSaved } =
      await loadLiveSaved(seededClient());
    const { result } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() =>
      result.current.remember([
        { id: "article:one", kind: "article", title: "Renamed elsewhere" },
        {
          id: "studio_track:track-1",
          kind: "studio_track",
          title: "Carta para a santa",
          href: "/studio/track?id=track-1",
        },
        {
          id: "studio_track:track-1",
          kind: "studio_track",
          title: "Carta para a santa",
        },
      ]),
    );

    expect(result.current.items.map((item) => item.id)).toEqual([
      "article:one",
      "studio_track:track-1",
    ]);
    expect(result.current.items[0]?.title).toBe("One");
    expect(result.current.isSaved("studio_track:track-1")).toBe(true);
    expect(putSaved).not.toHaveBeenCalled();
    expect(deleteSaved).not.toHaveBeenCalled();
    expect(getSaved).not.toHaveBeenCalled();
  });

  it("keeps the store as it is when every id is already there", async () => {
    const { useSaved, wrapper } = await loadLiveSaved(seededClient());
    const { result } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    const before = result.current.items;

    act(() =>
      result.current.remember([
        { id: "article:one", kind: "article", title: "One" },
      ]),
    );

    expect(result.current.items).toBe(before);
  });
});

const likedTrack = {
  id: "studio_track:track-1",
  kind: "studio_track" as const,
  title: "Carta para a santa",
  href: "/studio/track?id=track-1",
};
const otherLikedTrack = {
  id: "studio_track:track-2",
  kind: "studio_track" as const,
  title: "Maré",
  href: "/studio/track?id=track-2",
};

const secondArticle = {
  id: "article:two",
  kind: "article",
  title: "Two",
  savedAt: "2026-01-02T00:00:00Z",
};

/** Hands the provider a new bootstrap payload, as a refetch would. */
function hydrateAgain(client: QueryClient, items: typeof savedPage.items) {
  act(() => {
    client.setQueryData(["bootstrap", false, MEMBER_ID], {
      profile: { slug: "tiago-costa", limited: false },
      saved: { ...savedPage, items, total: items.length },
      blocks: { items: [], total: 0, page: 1, pageSize: 20 },
      mutes: { items: [], total: 0, page: 1, pageSize: 20 },
    });
  });
}

describe("SavedProvider hydration after remember (live mode)", () => {
  it("keeps remembered ids when the server's page lands late", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { useSaved, wrapper, getSaved } =
      await loadLiveSavedBootstrapError(client);
    let resolveSaved: (page: typeof savedPage) => void = () => undefined;
    getSaved.mockReturnValue(
      new Promise<typeof savedPage>((resolve) => {
        resolveSaved = resolve;
      }),
    );
    const { result } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(getSaved).toHaveBeenCalledTimes(1));

    // The Liked songs query answers first.
    act(() => result.current.remember([likedTrack]));
    await act(async () => {
      resolveSaved(savedPage);
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(result.current.items.map((item) => item.id)).toEqual([
        "article:one",
        "studio_track:track-1",
      ]),
    );
  });

  it("lists the server's items first and the remembered ones after", async () => {
    const client = seededClient();
    const { useSaved, wrapper } = await loadLiveSaved(client);
    const { result } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => result.current.remember([likedTrack]));
    hydrateAgain(client, [
      {
        id: "article:two",
        kind: "article",
        title: "Two",
        savedAt: "2026-01-02T00:00:00Z",
      },
      ...savedPage.items,
    ]);

    await waitFor(() =>
      expect(result.current.items.map((item) => item.id)).toEqual([
        "article:two",
        "article:one",
        "studio_track:track-1",
      ]),
    );
  });

  it("lets an unsave forget a remembered id, so hydration leaves it out", async () => {
    const client = seededClient();
    const { useSaved, wrapper, deleteSaved } = await loadLiveSaved(client);
    const { result } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => result.current.remember([likedTrack, otherLikedTrack]));
    act(() => result.current.unsave(likedTrack.id));
    act(() => {
      result.current.toggleSave(otherLikedTrack);
    });
    await waitFor(() => expect(deleteSaved).toHaveBeenCalledTimes(2));
    // A payload unlike the bootstrap one, so hydration really runs again.
    hydrateAgain(client, [secondArticle, ...savedPage.items]);

    await waitFor(() =>
      expect(result.current.items.map((item) => item.id)).toEqual([
        "article:two",
        "article:one",
      ]),
    );
  });
});

describe("SavedProvider remember after an unsave (live mode)", () => {
  it("skips an id unliked this session when a stale read lists it", async () => {
    const { useSaved, wrapper, deleteSaved } =
      await loadLiveSaved(seededClient());
    const { result } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => result.current.remember([likedTrack]));
    act(() => {
      result.current.toggleSave(likedTrack);
    });
    await waitFor(() => expect(deleteSaved).toHaveBeenCalledTimes(1));
    // A Liked songs read that left before the DELETE landed still lists it.
    act(() => result.current.remember([likedTrack, otherLikedTrack]));

    expect(result.current.isSaved(likedTrack.id)).toBe(false);
    expect(result.current.isSaved(otherLikedTrack.id)).toBe(true);
  });

  it("lets a like again clear the tombstone", async () => {
    const client = seededClient();
    const { useSaved, wrapper, putSaved } = await loadLiveSaved(client);
    const { result } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => result.current.remember([likedTrack]));
    // Unlike, then like again.
    act(() => {
      result.current.toggleSave(likedTrack);
    });
    act(() => {
      result.current.toggleSave(likedTrack);
    });
    await waitFor(() => expect(putSaved).toHaveBeenCalledTimes(1));
    // The server's first page leaves the like out, so only remember can
    // bring it back now.
    hydrateAgain(client, [secondArticle, ...savedPage.items]);
    await waitFor(() =>
      expect(result.current.isSaved(likedTrack.id)).toBe(false),
    );

    act(() => result.current.remember([likedTrack]));

    expect(result.current.isSaved(likedTrack.id)).toBe(true);
  });

  it("clears the tombstone again when the DELETE fails", async () => {
    const client = seededClient();
    const { useSaved, wrapper, deleteSaved } = await loadLiveSaved(client);
    deleteSaved.mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => result.current.unsave("article:one"));
    await waitFor(() =>
      expect(result.current.isSaved("article:one")).toBe(true),
    );
    // The server's page now lacks it, then a Liked-songs-style read lists it.
    hydrateAgain(client, [secondArticle]);
    await waitFor(() =>
      expect(result.current.isSaved("article:one")).toBe(false),
    );

    act(() =>
      result.current.remember([
        { id: "article:one", kind: "article", title: "One" },
      ]),
    );

    expect(result.current.isSaved("article:one")).toBe(true);
  });
});

describe("SavedProvider scope (live mode)", () => {
  it("drops a batch read before another member signed in", async () => {
    const { useSaved, wrapper } = await loadLiveSaved(seededClient());
    const { result, rerender } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    const scopeAtRead = result.current.readSaveScope();

    signedInMember.id = OTHER_MEMBER_ID;
    rerender();
    await waitFor(() =>
      expect(result.current.readSaveScope()).not.toBe(scopeAtRead),
    );
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    act(() => result.current.remember([likedTrack], { scopeAtRead }));

    expect(result.current.isSaved(likedTrack.id)).toBe(false);
  });

  it("starts a new member with no tombstones", async () => {
    const { useSaved, wrapper, deleteSaved } =
      await loadLiveSaved(seededClient());
    const { result, rerender } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    act(() => result.current.remember([likedTrack]));
    act(() => result.current.unsave(likedTrack.id));
    await waitFor(() => expect(deleteSaved).toHaveBeenCalledTimes(1));

    signedInMember.id = OTHER_MEMBER_ID;
    rerender();
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    act(() =>
      result.current.remember([likedTrack], {
        scopeAtRead: result.current.readSaveScope(),
      }),
    );

    expect(result.current.isSaved(likedTrack.id)).toBe(true);
  });

  it("leaves the next member's store alone when an earlier DELETE fails", async () => {
    const { useSaved, wrapper, deleteSaved } =
      await loadLiveSaved(seededClient());
    let rejectDelete: (error: Error) => void = () => undefined;
    deleteSaved.mockReturnValueOnce(
      new Promise<void>((_resolve, reject) => {
        rejectDelete = reject;
      }),
    );
    const { result, rerender } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    act(() => result.current.remember([likedTrack]));
    act(() => result.current.unsave(likedTrack.id));

    signedInMember.id = OTHER_MEMBER_ID;
    rerender();
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    await act(async () => {
      rejectDelete(new Error("offline"));
      await Promise.resolve();
    });

    expect(result.current.items.map((item) => item.id)).toEqual([
      "article:one",
    ]);
  });
});

describe("SavedProvider failed toggles (live mode)", () => {
  it("keeps a like rememberable after a failed unlike and a failed like again", async () => {
    const { useSaved, wrapper, putSaved, deleteSaved } =
      await loadLiveSaved(seededClient());
    deleteSaved.mockRejectedValueOnce(new Error("offline"));
    putSaved.mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    act(() => result.current.remember([likedTrack]));

    act(() => {
      result.current.toggleSave(likedTrack);
    });
    act(() => {
      result.current.toggleSave(likedTrack);
    });
    // The failed like rolls out last, after the failed unlike.
    await waitFor(() =>
      expect(result.current.isSaved(likedTrack.id)).toBe(false),
    );
    expect(deleteSaved).toHaveBeenCalledTimes(1);
    expect(putSaved).toHaveBeenCalledTimes(1);

    act(() => result.current.remember([likedTrack]));

    expect(result.current.isSaved(likedTrack.id)).toBe(true);
  });
});

describe("SavedProvider toggleSave onSynced (live mode)", () => {
  it("runs once the PUT resolves", async () => {
    const { useSaved, wrapper, putSaved } = await loadLiveSaved(seededClient());
    const { result } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    const onSynced = vi.fn();

    act(() => {
      result.current.toggleSave(likedTrack, { onSynced });
    });

    expect(putSaved).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(onSynced).toHaveBeenCalledTimes(1));
    expect(result.current.isSaved(likedTrack.id)).toBe(true);
  });

  it("skips onSynced and rolls back when the PUT fails", async () => {
    const { useSaved, wrapper, putSaved } = await loadLiveSaved(seededClient());
    putSaved.mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useSaved(), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    const onSynced = vi.fn();

    act(() => {
      result.current.toggleSave(likedTrack, { onSynced });
    });

    await waitFor(() =>
      expect(result.current.isSaved(likedTrack.id)).toBe(false),
    );
    expect(onSynced).not.toHaveBeenCalled();
  });
});
