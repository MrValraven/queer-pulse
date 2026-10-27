import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioArtistView } from "../api/studio.adapters";
import type { StudioLoadState } from "../api/studioLoadState";
import type { StudioQueueItem } from "./studioPlayerContext";
import { useStudioNowPlayingArtist } from "./useStudioNowPlayingArtist";

const LOADING_STATE: StudioLoadState = {
  isLoading: true,
  isError: false,
  isRetrying: false,
  isNotFound: false,
  isWithdrawn: false,
  retry: () => {},
};

/** What the mocked artist read answers, per persona id. A missing id reads
 *  as still loading. */
const holder: {
  byId: Map<
    string,
    { artist: StudioArtistView | null; loadState: StudioLoadState }
  >;
  demoMode: boolean;
  accessStatus: "pending" | "granted" | "denied";
} = { byId: new Map(), demoMode: true, accessStatus: "granted" };

vi.mock("../api/useStudioArtist", () => ({
  useStudioArtist: (subprofileId: string | null) =>
    holder.byId.get(subprofileId ?? "") ?? {
      artist: null,
      loadState: LOADING_STATE,
    },
}));
vi.mock("../api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: holder.accessStatus,
    hasAccess: holder.accessStatus === "granted",
    isPending: holder.accessStatus === "pending",
    isReadFailed: false,
    reason: null,
    uploadablePersonas: [],
  }),
}));
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: holder.demoMode }),
}));

/** A queue entry built here: the shared harness imports the full provider
 *  set, which reads the DemoModeProvider this file mocks. */
function queueItem(overrides: Partial<StudioQueueItem>): StudioQueueItem {
  return {
    queueEntryId: "entry-t1",
    trackId: "t1",
    title: "Tide",
    durationSeconds: 200,
    trackHref: "/studio/track?id=t1",
    releaseId: "r1",
    releaseTitle: "Salt water",
    coverUrl: null,
    tint: "coral",
    artistId: "p1",
    artistName: "NIGHTFORM",
    artistHref: "/studio/artist?id=p1",
    isExplicit: false,
    ...overrides,
  };
}

function viewFor(id: string): StudioArtistView {
  return { artist: { id, name: `Artist ${id}` } } as StudioArtistView;
}

const READY_STATE: StudioLoadState = { ...LOADING_STATE, isLoading: false };

beforeEach(() => {
  holder.byId = new Map();
  holder.demoMode = true;
  holder.accessStatus = "granted";
});

describe("useStudioNowPlayingArtist", () => {
  it("reports ready once the playing item's persona has loaded", () => {
    const view = viewFor("a");
    holder.byId.set("a", { artist: view, loadState: READY_STATE });
    const { result } = renderHook(() =>
      useStudioNowPlayingArtist(queueItem({ artistId: "a" })),
    );
    expect(result.current).toEqual({ status: "ready", artist: view });
  });

  it("reports loading for the new artist while the old read resolves late", () => {
    const { result, rerender } = renderHook(
      ({ artistId }) => useStudioNowPlayingArtist(queueItem({ artistId })),
      { initialProps: { artistId: "a" } },
    );
    expect(result.current).toEqual({ status: "loading", artist: null });
    rerender({ artistId: "b" });
    // Artist A's read lands after the track moved on to artist B.
    holder.byId.set("a", { artist: viewFor("a"), loadState: READY_STATE });
    rerender({ artistId: "b" });
    expect(result.current).toEqual({ status: "loading", artist: null });
  });

  it("ignores a cached view whose persona id differs from the item", () => {
    holder.byId.set("y", { artist: viewFor("x"), loadState: READY_STATE });
    const { result } = renderHook(() =>
      useStudioNowPlayingArtist(queueItem({ artistId: "y" })),
    );
    expect(result.current).toEqual({ status: "loading", artist: null });
  });

  it("reports failed on an error or a missing persona", () => {
    holder.byId.set("err", {
      artist: null,
      loadState: { ...READY_STATE, isError: true },
    });
    holder.byId.set("gone", {
      artist: null,
      loadState: { ...READY_STATE, isNotFound: true },
    });
    const errored = renderHook(() =>
      useStudioNowPlayingArtist(queueItem({ artistId: "err" })),
    );
    const missing = renderHook(() =>
      useStudioNowPlayingArtist(queueItem({ artistId: "gone" })),
    );
    expect(errored.result.current).toEqual({ status: "failed", artist: null });
    expect(missing.result.current).toEqual({ status: "failed", artist: null });
  });

  it("reports failed for an item with an empty artist id", () => {
    holder.byId.set("", { artist: viewFor(""), loadState: READY_STATE });
    const { result } = renderHook(() =>
      useStudioNowPlayingArtist(queueItem({ artistId: "" })),
    );
    expect(result.current).toEqual({ status: "failed", artist: null });
  });

  it("reports failed when the member has no Studio access in live mode", () => {
    holder.demoMode = false;
    holder.accessStatus = "denied";
    holder.byId.set("a", { artist: viewFor("a"), loadState: READY_STATE });
    const { result } = renderHook(() =>
      useStudioNowPlayingArtist(queueItem({ artistId: "a" })),
    );
    expect(result.current).toEqual({ status: "failed", artist: null });
  });
});
