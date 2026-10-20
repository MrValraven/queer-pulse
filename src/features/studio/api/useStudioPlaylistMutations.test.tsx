import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { toPlaylistView, type StudioPlaylistView } from "./studio.adapters";
import type { StudioPlaylistDTO } from "./studio.types";
import { studioKeys } from "./studioQueryKeys";
import {
  addedEntryCountOf,
  useAddStudioPlaylistTracks,
  useCreateStudioPlaylist,
  useRemoveStudioPlaylistEntry,
  useReorderStudioPlaylist,
  useUpdateStudioPlaylist,
} from "./useStudioPlaylistMutations";

const mode = vi.hoisted(() => ({ demoMode: false }));
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mode.demoMode }),
}));
const demoStore = vi.hoisted(() => ({
  demoAddPlaylistTracks:
    vi.fn<(playlistId: string, trackIds: string[]) => StudioPlaylistDTO>(),
  demoReorderPlaylist: vi.fn(),
  demoStudioPlaylist: vi.fn<(playlistId: string) => StudioPlaylistDTO>(),
}));
vi.mock("./studioDemoPlaylists", () => demoStore);
const api = vi.hoisted(() => ({
  addStudioPlaylistTracks: vi.fn(),
  createStudioPlaylist: vi.fn(),
  getStudioPlaylist: vi.fn(),
  putStudioPlaylistOrder: vi.fn(),
  removeStudioPlaylistEntry: vi.fn(),
  updateStudioPlaylist: vi.fn(),
}));
vi.mock("./studioPlaylists.api", () => ({
  ...api,
  deleteStudioPlaylist: vi.fn(),
}));

const dto: StudioPlaylistDTO = {
  id: "playlist-1",
  name: "Night bus",
  credit: {
    persona: null,
    member: {
      id: "member-1",
      slug: "tiago",
      displayName: "Tiago Costa",
      avatarUrl: null,
    },
  },
  coverUrls: [],
  trackCount: 0,
  totalDurationSeconds: 0,
  updatedAt: "2026-10-10T10:00:00.000Z",
  isOwner: true,
  visibility: "private",
  description: null,
  creditSubprofileId: null,
  entries: [
    {
      entryId: "a",
      position: 1,
      addedAt: "2026-10-01T00:00:00.000Z",
      isAvailable: false,
      track: null,
    },
    {
      entryId: "b",
      position: 2,
      addedAt: "2026-10-01T00:00:00.000Z",
      isAvailable: false,
      track: null,
    },
  ],
};

function setup(demoMode = false) {
  mode.demoMode = demoMode;
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  queryClient.setQueryData(
    studioKeys.playlist(demoMode, dto.id),
    toPlaylistView(dto),
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}
const cachedView = (queryClient: QueryClient, demoMode = false) =>
  queryClient.getQueryData<StudioPlaylistView>(
    studioKeys.playlist(demoMode, dto.id),
  );
const cachedIds = (queryClient: QueryClient, demoMode = false) =>
  cachedView(queryClient, demoMode)?.entries.map((entry) => entry.entryId);
const orderMismatch = () =>
  new ApiError(409, "studio_playlist_order_mismatch", {
    code: "studio_playlist_order_mismatch",
  });

// The answer to an add of one new track while entry "b" went unavailable:
// the playable count stays at 1, and entry "c" is the one the add created.
const answerWithNewEntry: StudioPlaylistDTO = {
  ...dto,
  trackCount: 1,
  entries: [
    ...dto.entries,
    {
      entryId: "c",
      position: 3,
      addedAt: "2026-10-12T00:00:00.000Z",
      isAvailable: true,
      track: null,
    },
  ],
};

beforeEach(() => {
  api.addStudioPlaylistTracks.mockReset();
  demoStore.demoAddPlaylistTracks.mockReset();
  api.createStudioPlaylist.mockReset();
  api.getStudioPlaylist.mockReset();
  api.putStudioPlaylistOrder.mockReset();
  api.removeStudioPlaylistEntry.mockReset();
  api.updateStudioPlaylist.mockReset();
  demoStore.demoReorderPlaylist.mockReset();
  demoStore.demoStudioPlaylist.mockReset();
});

describe("playlist writes", () => {
  it("moves rows at once and rolls back a refused order", async () => {
    const { queryClient, wrapper } = setup();
    let refuse: (error: unknown) => void = () => {};
    api.putStudioPlaylistOrder.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          refuse = reject;
        }),
    );
    const { result } = renderHook(() => useReorderStudioPlaylist(), {
      wrapper,
    });
    let settled: Promise<unknown> = Promise.resolve();
    act(() => {
      settled = result.current
        .mutateAsync({ playlistId: dto.id, entryIds: ["b", "a"] })
        .catch(() => undefined);
    });
    await vi.waitFor(() => expect(cachedIds(queryClient)).toEqual(["b", "a"]));
    refuse(orderMismatch());
    await act(() => settled);
    expect(cachedIds(queryClient)).toEqual(["a", "b"]);
  });

  it("keeps a row removed while a refused move saved out of the demo list", async () => {
    const { queryClient, wrapper } = setup(true);
    const storedWithoutA = {
      ...dto,
      entries: [{ ...dto.entries[1]!, position: 1 }],
    };
    demoStore.demoStudioPlaylist.mockReturnValue(storedWithoutA);
    // The remove lands after the move took its snapshot: the store drops
    // "a" and the remove patches the cache, then the store refuses the move
    // because its order still names "a".
    demoStore.demoReorderPlaylist.mockImplementation(() => {
      queryClient.setQueryData(
        studioKeys.playlist(true, dto.id),
        toPlaylistView(storedWithoutA),
      );
      throw orderMismatch();
    });
    const { result } = renderHook(
      () => ({
        playlist: useQuery({
          queryKey: studioKeys.playlist(true, dto.id),
          queryFn: () => toPlaylistView(demoStore.demoStudioPlaylist(dto.id)),
          staleTime: Number.POSITIVE_INFINITY,
        }),
        reorder: useReorderStudioPlaylist(),
      }),
      { wrapper },
    );
    await act(() =>
      result.current.reorder
        .mutateAsync({ playlistId: dto.id, entryIds: ["b", "a"] })
        .catch(() => undefined),
    );
    await vi.waitFor(() => expect(cachedIds(queryClient, true)).toEqual(["b"]));
  });

  it("removes an entry from the cached view without a refetch", async () => {
    const { queryClient, wrapper } = setup();
    api.removeStudioPlaylistEntry.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoveStudioPlaylistEntry(), {
      wrapper,
    });
    await act(() =>
      result.current.mutateAsync({ playlistId: dto.id, entryId: "a" }),
    );
    expect(cachedIds(queryClient)).toEqual(["b"]);
    expect(cachedView(queryClient)?.updatedAt).not.toBe(dto.updatedAt);
  });

  it("counts a new entry while another entry became unavailable", async () => {
    const { wrapper } = setup();
    api.addStudioPlaylistTracks.mockResolvedValue(answerWithNewEntry);
    const { result } = renderHook(() => useAddStudioPlaylistTracks(), {
      wrapper,
    });
    const added = await act(() =>
      result.current.mutateAsync({
        playlistId: dto.id,
        trackIds: ["track-c"],
        previousTrackCount: 1,
      }),
    );
    expect(added.addedCount).toBe(1);
  });

  it("counts zero when every asked-for track was already in the playlist", async () => {
    const { wrapper } = setup();
    api.addStudioPlaylistTracks.mockResolvedValue(dto);
    const { result } = renderHook(() => useAddStudioPlaylistTracks(), {
      wrapper,
    });
    const added = await act(() =>
      result.current.mutateAsync({
        playlistId: dto.id,
        trackIds: ["track-a"],
        previousTrackCount: 0,
      }),
    );
    expect(added.addedCount).toBe(0);
  });

  it("counts a demo add against the entries the store held before", async () => {
    const { wrapper } = setup(true);
    demoStore.demoStudioPlaylist.mockReturnValue(dto);
    demoStore.demoAddPlaylistTracks.mockReturnValue(answerWithNewEntry);
    const { result } = renderHook(() => useAddStudioPlaylistTracks(), {
      wrapper,
    });
    const added = await act(() =>
      result.current.mutateAsync({
        playlistId: dto.id,
        trackIds: ["track-c"],
        previousTrackCount: 1,
      }),
    );
    expect(added.addedCount).toBe(1);
  });

  it("falls back to the track count difference with no earlier entry list", () => {
    const answer = toPlaylistView({ ...answerWithNewEntry, trackCount: 3 });
    expect(addedEntryCountOf(null, answer, 1)).toBe(2);
    expect(addedEntryCountOf(null, answer, 5)).toBe(0);
    expect(addedEntryCountOf(new Set(["a", "b"]), answer, 5)).toBe(1);
  });

  it("stores a created playlist under its own key", async () => {
    const { queryClient, wrapper } = setup();
    api.createStudioPlaylist.mockResolvedValue({
      ...dto,
      id: "playlist-2",
      name: "Fresh",
      entries: [],
    });
    const { result } = renderHook(() => useCreateStudioPlaylist(), { wrapper });
    await act(() =>
      result.current.mutateAsync({ name: "Fresh", visibility: "private" }),
    );
    expect(
      queryClient.getQueryData(studioKeys.playlist(false, "playlist-2")),
    ).toMatchObject({ name: "Fresh" });
  });
});

describe("removing an entry another editor already removed", () => {
  it("reads the playlist again and settles as a removal", async () => {
    mode.demoMode = false;
    api.removeStudioPlaylistEntry.mockRejectedValueOnce(
      new ApiError(404, "gone", {
        statusCode: 404,
        code: "studio_playlist_entry_not_found",
      }),
    );
    api.getStudioPlaylist.mockResolvedValueOnce({
      ...dto,
      entries: dto.entries.filter((entry) => entry.entryId !== "a"),
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useRemoveStudioPlaylistEntry(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });
    let settled: StudioPlaylistView | undefined;
    await act(async () => {
      settled = await result.current.mutateAsync({
        playlistId: "playlist-1",
        entryId: "a",
      });
    });
    expect(settled?.entries.map((entry) => entry.entryId)).toEqual(["b"]);
    expect(
      queryClient.getQueryData<StudioPlaylistView>(
        studioKeys.playlist(false, "playlist-1"),
      )?.entries,
    ).toHaveLength(1);
  });

  it("still fails on any other refusal", async () => {
    mode.demoMode = false;
    api.removeStudioPlaylistEntry.mockRejectedValueOnce(
      new ApiError(403, "owner only", {
        statusCode: 403,
        code: "studio_playlist_owner_only",
      }),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useRemoveStudioPlaylistEntry(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });
    await expect(
      result.current.mutateAsync({ playlistId: "playlist-1", entryId: "a" }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe("changing a playlist's credit", () => {
  const editorKeys = [
    studioKeys.playlistEditors(false, dto.id),
    studioKeys.playlistEditorCandidatesAll(false, dto.id),
  ];
  const seedEditorCaches = (queryClient: QueryClient) => {
    for (const queryKey of editorKeys) queryClient.setQueryData(queryKey, []);
  };
  const invalidatedOf = (queryClient: QueryClient) =>
    editorKeys.map(
      (queryKey) => queryClient.getQueryState(queryKey)?.isInvalidated,
    );

  it("reads the editors and the co-owner checklist again after a credit change", async () => {
    const { queryClient, wrapper } = setup();
    seedEditorCaches(queryClient);
    api.updateStudioPlaylist.mockResolvedValue({
      ...dto,
      creditSubprofileId: "persona-1",
    });
    const { result } = renderHook(() => useUpdateStudioPlaylist(), {
      wrapper,
    });
    await act(() =>
      result.current.mutateAsync({
        playlistId: dto.id,
        body: { creditSubprofileId: "persona-1" },
      }),
    );
    expect(invalidatedOf(queryClient)).toEqual([true, true]);
  });

  it("leaves the editor caches alone on a rename", async () => {
    const { queryClient, wrapper } = setup();
    seedEditorCaches(queryClient);
    api.updateStudioPlaylist.mockResolvedValue({ ...dto, name: "Day bus" });
    const { result } = renderHook(() => useUpdateStudioPlaylist(), {
      wrapper,
    });
    await act(() =>
      result.current.mutateAsync({
        playlistId: dto.id,
        body: { name: "Day bus" },
      }),
    );
    expect(invalidatedOf(queryClient)).toEqual([false, false]);
    expect(cachedView(queryClient)?.name).toBe("Day bus");
  });
});
