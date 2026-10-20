import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toReleaseView, type StudioReleaseView } from "./studio.adapters";
import type { StudioReleaseDTO } from "./studio.types";
import { resetDemoSafety } from "./studioDemoSafety";
import { DEMO_LOCKED_EXPLICIT_TRACK_ID } from "./studioDemoSafety.data";
import { studioKeys } from "./studioQueryKeys";
import { ownerTrackSafetyOf } from "./useStudioOwnerTrackSafety";
import { useUpdateStudioTrack } from "./useStudioTrackMutations";

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));

const RELEASE_ID = "release-safety";

function ownerRelease(trackId: string): StudioReleaseView {
  const dto: StudioReleaseDTO = {
    id: RELEASE_ID,
    title: "Release",
    type: "ep",
    coverUrl: null,
    releasedOn: null,
    trackCount: 1,
    totalDurationSeconds: 200,
    artist: {
      id: "p1",
      handle: "artist",
      name: "Artist",
      kind: "musician",
      avatarUrl: null,
    },
    description: null,
    genre: null,
    mood: null,
    scene: null,
    status: "published",
    publishedAt: "2026-10-01T10:00:00.000Z",
    tracks: [
      {
        id: trackId,
        position: 1,
        title: "Song",
        durationSeconds: 200,
        isExplicit: true,
        hasAudio: true,
        contentWarnings: ["violence"],
        artistContentWarnings: [],
        staffContentWarnings: ["violence"],
        isExplicitLocked: true,
      },
    ],
    isOwner: true,
    rightsConfirmedAt: "2026-10-01T10:00:00.000Z",
    takedownReason: null,
    sceneId: null,
    personaCredits: [],
  };
  return toReleaseView(dto);
}

function setup(trackId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(
    studioKeys.release(true, RELEASE_ID),
    ownerRelease(trackId),
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(() => resetDemoSafety());

describe("ownerTrackSafetyOf", () => {
  it("reads the owner row's lists and lock, and defaults without one", () => {
    expect(ownerTrackSafetyOf(ownerRelease("t1"), "t1")).toEqual({
      artistContentWarnings: [],
      staffContentWarnings: ["violence"],
      isExplicitLocked: true,
    });
    expect(ownerTrackSafetyOf(null, "t1")).toEqual({
      artistContentWarnings: [],
      staffContentWarnings: [],
      isExplicitLocked: false,
    });
  });
});

describe("useUpdateStudioTrack, Studio safety (demo)", () => {
  it("stores the artist's warnings on the owner row, keeps the team's list and shows the demo store's union on the row", async () => {
    const { queryClient, wrapper } = setup("t1");
    const hook = renderHook(() => useUpdateStudioTrack(), { wrapper });
    await act(async () => {
      await hook.result.current.mutateAsync({
        trackId: "t1",
        releaseId: RELEASE_ID,
        body: { contentWarnings: ["police"] },
      });
    });
    const release = queryClient.getQueryData<StudioReleaseView>(
      studioKeys.release(true, RELEASE_ID),
    );
    expect(release?.ownerTracks?.[0]?.artistContentWarnings).toEqual([
      "police",
    ]);
    // The demo store holds no staff warning for "t1", so its union is the
    // artist's list alone; the owner row's own team list is kept from before.
    expect(release?.ownerTracks?.[0]?.staffContentWarnings).toEqual([
      "violence",
    ]);
    expect(release?.tracks[0]?.contentWarnings).toEqual(["police"]);
  });

  it("refuses to unmark a track our team marked explicit", async () => {
    const { wrapper } = setup(DEMO_LOCKED_EXPLICIT_TRACK_ID);
    const hook = renderHook(() => useUpdateStudioTrack(), { wrapper });
    let code: unknown = null;
    await act(async () => {
      await hook.result.current
        .mutateAsync({
          trackId: DEMO_LOCKED_EXPLICIT_TRACK_ID,
          releaseId: RELEASE_ID,
          body: { isExplicit: false },
        })
        .catch((error: { data?: { code?: string } }) => {
          code = error.data?.code;
        });
    });
    expect(code).toBe("studio_track_explicit_locked");
  });
});
