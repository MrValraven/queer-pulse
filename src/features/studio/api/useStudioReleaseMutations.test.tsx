import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioArtistView, StudioReleaseView } from "./studio.adapters";
import { demoCreateRelease, demoPublish } from "./studioDemoMutations";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import { studioKeys } from "./studioQueryKeys";
import {
  useCreateStudioRelease,
  useDeleteStudioRelease,
  useUnpublishStudioRelease,
} from "./useStudioReleaseMutations";

const demoState = { demoMode: true };
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => demoState,
}));
const deleteStudioRelease = vi.fn();
vi.mock("./studio.api", () => ({
  createStudioRelease: vi.fn(),
  deleteStudioRelease: (...args: unknown[]) =>
    deleteStudioRelease(...args) as unknown,
  publishStudioRelease: vi.fn(),
  putStudioTrackOrder: vi.fn(),
  unpublishStudioRelease: vi.fn(),
  updateStudioRelease: vi.fn(),
}));

function artistViewOf(published: StudioReleaseView[]): StudioArtistView {
  return {
    artist: { id: DEMO_ARTIST_MARIANA.id } as StudioArtistView["artist"],
    coverUrl: null,
    heroLayout: "classic",
    allReleases: published,
    releases: published,
    singles: [],
    ownerReleases: [],
    isOwner: true,
    followerCount: 0,
    isFollowing: false,
    playlists: [],
    supportLinks: [],
    upcoming: [],
  };
}

function setup() {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  demoState.demoMode = true;
  deleteStudioRelease.mockReset();
});

describe("release mutations keep the lists in step", () => {
  it("shows a demo-created draft in ownerReleases", async () => {
    const { queryClient, wrapper } = setup();
    const artistKey = studioKeys.artist(true, DEMO_ARTIST_MARIANA.id);
    queryClient.setQueryData(artistKey, artistViewOf([]));
    const { result } = renderHook(() => useCreateStudioRelease(), { wrapper });
    await act(() =>
      result.current.mutateAsync({
        subprofileId: DEMO_ARTIST_MARIANA.id,
        type: "ep",
        title: "Cartas",
      }),
    );
    const owner =
      queryClient.getQueryData<StudioArtistView>(artistKey)?.ownerReleases;
    expect(owner?.map((card) => `${card.title}:${card.status}`)).toEqual([
      "Cartas:draft",
    ]);
  });

  it("moves an unpublished demo card out of releases into ownerReleases as draft", async () => {
    const { queryClient, wrapper } = setup();
    const live = demoPublish(
      demoCreateRelease({
        subprofileId: DEMO_ARTIST_MARIANA.id,
        type: "ep",
        title: "Cartas",
      }),
    );
    const artistKey = studioKeys.artist(true, DEMO_ARTIST_MARIANA.id);
    queryClient.setQueryData(artistKey, artistViewOf([live]));
    queryClient.setQueryData(studioKeys.release(true, live.id), live);
    queryClient.setQueryData(studioKeys.releases(true), {
      pages: [{ items: [live], nextCursor: null }],
      pageParams: [null],
    });
    const { result } = renderHook(() => useUnpublishStudioRelease(), {
      wrapper,
    });
    await act(() => result.current.mutateAsync({ releaseId: live.id }));
    const view = queryClient.getQueryData<StudioArtistView>(artistKey);
    expect(view?.releases).toEqual([]);
    expect(view?.ownerReleases?.map((card) => card.status)).toEqual(["draft"]);
    const home = queryClient.getQueryData<{ pages: { items: unknown[] }[] }>(
      studioKeys.releases(true),
    );
    expect(home?.pages[0]?.items).toEqual([]);
  });

  it("removes a deleted demo draft from the owner list", async () => {
    const { queryClient, wrapper } = setup();
    const draft = demoCreateRelease({
      subprofileId: DEMO_ARTIST_MARIANA.id,
      type: "ep",
      title: "Cartas",
    });
    const artistKey = studioKeys.artist(true, DEMO_ARTIST_MARIANA.id);
    queryClient.setQueryData(artistKey, artistViewOf([]));
    queryClient.setQueryData(studioKeys.release(true, draft.id), draft);
    const { result: create } = renderHook(() => useCreateStudioRelease(), {
      wrapper,
    });
    await act(() =>
      create.current.mutateAsync({
        subprofileId: DEMO_ARTIST_MARIANA.id,
        type: "ep",
        title: "Other",
      }),
    );
    const { result } = renderHook(() => useDeleteStudioRelease(), { wrapper });
    const createdId =
      queryClient.getQueryData<StudioArtistView>(artistKey)!.ownerReleases![0]!
        .id;
    await act(() => result.current.mutateAsync({ releaseId: createdId }));
    expect(
      queryClient.getQueryData<StudioArtistView>(artistKey)?.ownerReleases,
    ).toEqual([]);
  });

  it("invalidates the artist and home keys after a live delete", async () => {
    demoState.demoMode = false;
    deleteStudioRelease.mockResolvedValue(undefined);
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeleteStudioRelease(), { wrapper });
    await act(() => result.current.mutateAsync({ releaseId: "r1" }));
    await waitFor(() => expect(invalidate).toHaveBeenCalled());
    const keys = invalidate.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(["studio", "artist"]);
    expect(keys).toContainEqual(["studio", "releases"]);
  });

  it("invalidates the playlist, search and stats keys after a live delete", async () => {
    demoState.demoMode = false;
    deleteStudioRelease.mockResolvedValue(undefined);
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeleteStudioRelease(), { wrapper });
    await act(() => result.current.mutateAsync({ releaseId: "r1" }));
    await waitFor(() => expect(invalidate).toHaveBeenCalled());
    const keys = invalidate.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(["studio", "playlist"]);
    expect(keys).toContainEqual(studioKeys.myPlaylists(false));
    expect(keys).toContainEqual(["studio", "memberPlaylists"]);
    expect(keys).toContainEqual(["studio", "trackPlaylists"]);
    expect(keys).toContainEqual(["studio", "search"]);
    expect(keys).toContainEqual(["studio", "stats"]);
  });

  it("invalidates the press kit after a live delete", async () => {
    demoState.demoMode = false;
    deleteStudioRelease.mockResolvedValue(undefined);
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeleteStudioRelease(), { wrapper });
    await act(() => result.current.mutateAsync({ releaseId: "r1" }));
    await waitFor(() => expect(invalidate).toHaveBeenCalled());
    const keys = invalidate.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(["studio", "studioPressKit"]);
  });

  it("leaves the demo playlist and stats caches alone after a demo delete", async () => {
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeleteStudioRelease(), { wrapper });
    await act(() => result.current.mutateAsync({ releaseId: "r1" }));
    expect(invalidate).not.toHaveBeenCalled();
  });
});
