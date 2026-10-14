import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SavedContext,
  type SavedContextValue,
  type SavedItem,
  type SavedRememberOptions,
  type SavedToggleOptions,
} from "../../../app/providers/useSaved";
import { useStudioLike, type StudioLikeSubject } from "../useStudioLike";
import type {
  StudioLikedTrackEntryDTO,
  StudioLikedTracksPageDTO,
  StudioPlaylistTrackDTO,
} from "./studio.types";
import { demoPublishedTracks } from "./studioDemoPlaylists";
import {
  likedEntryToSavedItem,
  toLikedTracksPageView,
} from "./studioLiked.adapters";
import { studioKeys } from "./studioQueryKeys";
import { useStudioLikedTracks } from "./useStudioLikedTracks";

const getStudioLikedTracks = vi.hoisted(() =>
  vi.fn<(cursor: string | null) => Promise<StudioLikedTracksPageDTO>>(),
);

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("./useStudioAccess", () => ({
  useStudioAccess: () => ({ hasAccess: true }),
}));
vi.mock("./studioLiked.api", () => ({
  getStudioLikedTracks: (cursor: string | null) => getStudioLikedTracks(cursor),
}));
vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));
vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

/** Two published demo tracks with audio and a length. */
function twoPlayableTracks(): [StudioPlaylistTrackDTO, StudioPlaylistTrackDTO] {
  const [firstTrack, secondTrack] = [...demoPublishedTracks().values()].filter(
    (track) => track.hasAudio && (track.durationSeconds ?? 0) > 0,
  );
  if (!firstTrack || !secondTrack) {
    throw new Error("the demo has two playable tracks with a length");
  }
  return [firstTrack, secondTrack];
}

const [firstTrack, secondTrack] = twoPlayableTracks();
const firstSeconds = firstTrack.durationSeconds ?? 0;
const secondSeconds = secondTrack.durationSeconds ?? 0;

const availableEntry = (
  track: StudioPlaylistTrackDTO,
  position: number,
): StudioLikedTrackEntryDTO => ({
  entryId: `saved-${position}`,
  position,
  addedAt: "2026-10-01T12:00:00.000Z",
  isAvailable: true,
  track,
  trackId: track.id,
  savedTitle: `${track.title} as saved`,
});

const goneEntry: StudioLikedTrackEntryDTO = {
  entryId: "saved-3",
  position: 3,
  addedAt: "2026-10-01T12:00:00.000Z",
  isAvailable: false,
  track: null,
  trackId: "track-gone",
  savedTitle: "Old tape",
};

const likedPage: StudioLikedTracksPageDTO = {
  items: [
    availableEntry(firstTrack, 1),
    availableEntry(secondTrack, 2),
    goneEntry,
  ],
  pageInfo: { nextCursor: null, hasMore: false },
  trackCount: 2,
  totalDurationSeconds: firstSeconds + secondSeconds,
};

const pageSavedItems = toLikedTracksPageView(likedPage).entries.map(
  likedEntryToSavedItem,
);

/** What the stub Saved store holds; a test changes it, then rerenders. */
let savedItems: SavedItem[] = [];
const remember =
  vi.fn<(items: SavedItem[], options?: SavedRememberOptions) => void>();
/** The stub store's scope token, handed back with every page it reads. */
const SAVE_SCOPE = 7;
const toggleSave = vi.fn<
  (item: SavedItem, options?: SavedToggleOptions) => boolean
>(() => true);

function savedValue(): SavedContextValue {
  const savedIds = new Set(savedItems.map((savedItem) => savedItem.id));
  return {
    items: savedItems,
    isSaved: (id) => savedIds.has(id),
    toggleSave,
    save: vi.fn(),
    unsave: vi.fn(),
    byKind: (kind) => savedItems.filter((savedItem) => savedItem.kind === kind),
    remember,
    readSaveScope: () => SAVE_SCOPE,
  };
}

function setup() {
  // The app's own default: a read stays fresh for 30s, so only an
  // invalidation reads Liked songs again inside a test.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SavedContext.Provider value={savedValue()}>
        {children}
      </SavedContext.Provider>
    </QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  savedItems = pageSavedItems;
  getStudioLikedTracks.mockReset();
  getStudioLikedTracks.mockResolvedValue(likedPage);
  remember.mockClear();
  toggleSave.mockClear();
});

describe("useStudioLikedTracks (live)", () => {
  it("puts every loaded like into the Saved store under its saved title", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useStudioLikedTracks(), { wrapper });

    await waitFor(() => expect(result.current.entries).toHaveLength(3));
    expect(getStudioLikedTracks).toHaveBeenCalledWith(null);
    expect(remember).toHaveBeenCalledTimes(1);
    expect(remember).toHaveBeenCalledWith(pageSavedItems, {
      scopeAtRead: SAVE_SCOPE,
    });
    expect(
      remember.mock.calls[0]?.[0].map((savedItem) => [
        savedItem.id,
        savedItem.title,
      ]),
    ).toEqual([
      [`studio_track:${firstTrack.id}`, `${firstTrack.title} as saved`],
      [`studio_track:${secondTrack.id}`, `${secondTrack.title} as saved`],
      ["studio_track:track-gone", "Old tape"],
    ]);
  });

  it("drops a row unliked here and takes only available rows off the counts", async () => {
    const { wrapper } = setup();
    const { result, rerender } = renderHook(() => useStudioLikedTracks(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.entries).toHaveLength(3));
    expect(result.current.trackCount).toBe(2);
    expect(result.current.totalDurationSeconds).toBe(
      firstSeconds + secondSeconds,
    );

    // Unlike the first track and the unavailable one, then read the store.
    savedItems = pageSavedItems.filter(
      (savedItem) =>
        savedItem.id !== `studio_track:${firstTrack.id}` &&
        savedItem.id !== "studio_track:track-gone",
    );
    rerender();

    expect(result.current.entries.map((entry) => entry.trackId)).toEqual([
      secondTrack.id,
    ]);
    expect(result.current.entries[0]?.position).toBe(1);
    expect(result.current.trackCount).toBe(1);
    expect(result.current.totalDurationSeconds).toBe(secondSeconds);
    expect(result.current.playableTracks.map((track) => track.id)).toEqual([
      secondTrack.id,
    ]);
    expect(getStudioLikedTracks).toHaveBeenCalledTimes(1);
  });

  it("waits while isEnabled is false and reads once it turns true", async () => {
    const { wrapper } = setup();
    const { result, rerender } = renderHook(
      ({ isEnabled }: { isEnabled: boolean }) =>
        useStudioLikedTracks({ isEnabled }),
      { wrapper, initialProps: { isEnabled: false } },
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(getStudioLikedTracks).not.toHaveBeenCalled();
    expect(result.current.entries).toEqual([]);

    rerender({ isEnabled: true });

    await waitFor(() => expect(result.current.entries).toHaveLength(3));
    expect(getStudioLikedTracks).toHaveBeenCalledTimes(1);
  });

  it("reads Liked songs again once a new like reaches the server", async () => {
    const { queryClient, wrapper } = setup();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const subject: StudioLikeSubject = {
      trackId: "t-new",
      title: "Tide",
      href: "/studio/track?id=t-new",
      artistName: "NIGHTFORM",
    };
    const { result } = renderHook(
      () => ({
        liked: useStudioLikedTracks(),
        like: useStudioLike(subject),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.liked.entries).toHaveLength(3));

    act(() => {
      result.current.like.toggle();
    });

    expect(toggleSave).toHaveBeenCalledTimes(1);
    const [likedItem, options] = toggleSave.mock.calls[0] ?? [];
    expect(likedItem).toEqual({
      id: "studio_track:t-new",
      kind: "studio_track",
      title: "Tide",
      href: "/studio/track?id=t-new",
      meta: "NIGHTFORM",
    });
    // Nothing reads again until the server holds the like.
    expect(invalidateQueries).not.toHaveBeenCalled();
    expect(getStudioLikedTracks).toHaveBeenCalledTimes(1);

    act(() => {
      options?.onSynced?.();
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: studioKeys.likedTracks(false),
    });
    await waitFor(() => expect(getStudioLikedTracks).toHaveBeenCalledTimes(2));
  });
});
