import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  toReleaseView,
  type StudioReleaseView,
  type StudioTrackView,
} from "./studio.adapters";
import type { StudioTrackDTO, StudioTrackSummaryDTO } from "./studio.types";
import { studioKeys } from "./studioQueryKeys";
import { rememberStreamAnalysis } from "./studioStream";
import {
  useConfirmStudioTrackAudio,
  useDeleteStudioTrack,
  useUpdateStudioTrack,
} from "./useStudioTrackMutations";

const demoState = vi.hoisted(() => ({ isDemo: false }));
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: demoState.isDemo }),
}));

const artist = {
  id: "p1",
  handle: "",
  name: "Mariana Sol",
  kind: "musician" as const,
  avatarUrl: null,
};
const card = {
  id: "r1",
  title: "Cartas",
  type: "ep" as const,
  coverUrl: null,
  releasedOn: null,
  trackCount: 1,
  totalDurationSeconds: 200,
  artist,
  publishedAt: null,
  genre: null,
  genres: [],
  mood: null,
  scene: null,
};
const trackDto: StudioTrackDTO = {
  id: "t1",
  position: 1,
  title: "Tide",
  durationSeconds: 200,
  isExplicit: false,
  hasAudio: true,
  releaseId: "r1",
  credits: [],
  lyrics: null,
  syncedLyrics: null,
  chapters: [{ startSeconds: 0, title: "Intro", artist: null }],
  release: card,
  personaCredits: [],
};
const updateStudioTrack = vi.fn(() => Promise.resolve(trackDto));
const confirmStudioTrackAudio = vi.fn(() => Promise.resolve(trackDto));
vi.mock("./studio.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./studio.api")>()),
  updateStudioTrack: () => updateStudioTrack(),
  confirmStudioTrackAudio: () => confirmStudioTrackAudio(),
}));

function setup(
  isDemo = false,
  ownerFields: Partial<StudioTrackSummaryDTO> = { hasAnalysis: false },
) {
  demoState.isDemo = isDemo;
  const queryClient = new QueryClient();
  queryClient.setQueryData(
    studioKeys.release(isDemo, "r1"),
    toReleaseView({
      ...card,
      description: null,
      status: "draft",
      isOwner: true,
      rightsConfirmedAt: null,
      takedownReason: null,
      sceneId: null,
      personaCredits: [],
      tracks: [
        {
          id: "t1",
          position: 1,
          title: "Tide",
          durationSeconds: 200,
          isExplicit: false,
          hasAudio: true,
          ...ownerFields,
        },
      ],
    }),
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

const ownerRow = (queryClient: QueryClient, isDemo = false) =>
  queryClient.getQueryData<StudioReleaseView>(studioKeys.release(isDemo, "r1"))
    ?.ownerTracks?.[0];

function setReleaseState(
  queryClient: QueryClient,
  status: StudioReleaseView["status"],
  hasSecondPlayableTrack: boolean,
) {
  queryClient.setQueryData<StudioReleaseView>(
    studioKeys.release(true, "r1"),
    (release) => {
      if (!release) return release;
      const secondTrack = {
        ...release.tracks[0]!,
        id: "t2",
        position: 2,
        hasAudio: hasSecondPlayableTrack,
      };
      return { ...release, status, tracks: [...release.tracks, secondTrack] };
    },
  );
}

describe("demo track delete keeps one playable track on a live release", () => {
  it.each(["published", "scheduled"] as const)(
    "refuses the last playable track of a %s release",
    async (status) => {
      const { queryClient, wrapper } = setup(true);
      setReleaseState(queryClient, status, false);
      const { result } = renderHook(() => useDeleteStudioTrack(), { wrapper });
      await expect(
        act(() =>
          result.current.mutateAsync({ trackId: "t1", releaseId: "r1" }),
        ),
      ).rejects.toMatchObject({
        status: 409,
        code: "studio_release_needs_playable_track",
      });
      expect(
        queryClient.getQueryData<StudioReleaseView>(
          studioKeys.release(true, "r1"),
        )?.tracks,
      ).toHaveLength(2);
    },
  );

  it("removes a playable track while another playable track remains", async () => {
    const { queryClient, wrapper } = setup(true);
    setReleaseState(queryClient, "published", true);
    const { result } = renderHook(() => useDeleteStudioTrack(), { wrapper });
    await act(() =>
      result.current.mutateAsync({ trackId: "t1", releaseId: "r1" }),
    );
    expect(
      queryClient
        .getQueryData<StudioReleaseView>(studioKeys.release(true, "r1"))
        ?.tracks.map((track) => track.id),
    ).toEqual(["t2"]);
  });

  it("removes the last playable track of a draft", async () => {
    const { queryClient, wrapper } = setup(true);
    setReleaseState(queryClient, "draft", false);
    const { result } = renderHook(() => useDeleteStudioTrack(), { wrapper });
    await act(() =>
      result.current.mutateAsync({ trackId: "t1", releaseId: "r1" }),
    );
    expect(
      queryClient.getQueryData<StudioReleaseView>(
        studioKeys.release(true, "r1"),
      )?.tracks,
    ).toHaveLength(1);
  });
});

describe("track writes and the listening caches", () => {
  it("marks the owner row measured and caches the new analysis", async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(() => useUpdateStudioTrack(), { wrapper });
    const peaks = Array.from({ length: 200 }, () => 9);
    await act(() =>
      result.current.mutateAsync({
        trackId: "t1",
        releaseId: "r1",
        body: { waveformPeaks: peaks, loudnessLufs: -7.8, peakDb: -0.1 },
      }),
    );
    expect(ownerRow(queryClient)).toMatchObject({
      hasAnalysis: true,
      loudnessLufs: -7.8,
      peakDb: -0.1,
    });
    expect(
      queryClient.getQueryData(studioKeys.streamAnalysis(false, "t1")),
    ).toEqual({ waveformPeaks: peaks, loudnessLufs: -7.8, peakDb: -0.1 });
  });

  it("keeps a newer title and lyrics when a measurement-only PATCH resolves after a details save", async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData<StudioReleaseView>(
      studioKeys.release(false, "r1"),
      (release) =>
        release && {
          ...release,
          status: "published",
          hasUnnotedChanges: false,
        },
    );
    let resolveMeasurement: (dto: StudioTrackDTO) => void = () => undefined;
    updateStudioTrack.mockClear();
    updateStudioTrack
      .mockImplementationOnce(
        () =>
          new Promise<StudioTrackDTO>((resolve) => {
            resolveMeasurement = resolve;
          }),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ...trackDto,
          title: "Tide (edit)",
          lyrics: "new words",
        }),
      );
    const { result: measure } = renderHook(() => useUpdateStudioTrack(), {
      wrapper,
    });
    const { result: details } = renderHook(() => useUpdateStudioTrack(), {
      wrapper,
    });
    const measurement = measure.current.mutateAsync({
      trackId: "t1",
      releaseId: "r1",
      body: { waveformPeaks: [9], loudnessLufs: -7.8, peakDb: -0.1 },
    });
    await vi.waitFor(() => expect(updateStudioTrack).toHaveBeenCalledTimes(1));
    await act(() =>
      details.current.mutateAsync({
        trackId: "t1",
        releaseId: "r1",
        body: { title: "Tide (edit)", lyrics: "new words" },
      }),
    );
    // The analysis response was read before the details save committed.
    resolveMeasurement(trackDto);
    await act(() => measurement);
    const detail = queryClient.getQueryData<StudioTrackView>(
      studioKeys.track(false, "t1"),
    );
    expect(detail?.title).toBe("Tide (edit)");
    expect(detail?.lyricStanzas).toEqual([["new words"]]);
    expect(ownerRow(queryClient)).toMatchObject({
      title: "Tide (edit)",
      hasAnalysis: true,
      loudnessLufs: -7.8,
      peakDb: -0.1,
    });
    expect(
      queryClient.getQueryData<StudioReleaseView>(
        studioKeys.release(false, "r1"),
      )?.hasUnnotedChanges,
    ).toBe(false);
  });

  it("takes the saved chapters onto the owner row when the PATCH sends them", async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(() => useUpdateStudioTrack(), { wrapper });
    await act(() =>
      result.current.mutateAsync({
        trackId: "t1",
        releaseId: "r1",
        body: { chapters: [{ startSeconds: 0, title: "Intro" }] },
      }),
    );
    expect(ownerRow(queryClient)).toMatchObject({
      chapters: [{ title: "Intro" }],
    });
  });

  it("keeps the owner fields through a write that only renames", async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData<StudioReleaseView>(
      studioKeys.release(false, "r1"),
      (release) =>
        release?.ownerTracks
          ? {
              ...release,
              ownerTracks: release.ownerTracks.map((row) => ({
                ...row,
                hasAnalysis: true,
                loudnessLufs: -9.5,
                peakDb: -1.2,
              })),
            }
          : release,
    );
    const { result } = renderHook(() => useUpdateStudioTrack(), { wrapper });
    await act(() =>
      result.current.mutateAsync({
        trackId: "t1",
        releaseId: "r1",
        body: { title: "Tide (edit)" },
      }),
    );
    expect(ownerRow(queryClient)).toMatchObject({
      hasAnalysis: true,
      loudnessLufs: -9.5,
      peakDb: -1.2,
    });
  });

  it("keeps the stored lyrics and chapters through a demo rename with no cached detail", async () => {
    const { queryClient, wrapper } = setup(true, {
      hasAnalysis: false,
      syncedLyrics: [{ ms: 500, text: "hello" }],
      chapters: [{ startSeconds: 0, title: "Intro", artist: null }],
    });
    const { result } = renderHook(() => useUpdateStudioTrack(), { wrapper });
    await act(() =>
      result.current.mutateAsync({
        trackId: "t1",
        releaseId: "r1",
        body: { title: "Tide (edit)" },
      }),
    );
    expect(ownerRow(queryClient, true)).toMatchObject({
      title: "Tide (edit)",
      syncedLyrics: [{ ms: 500, text: "hello" }],
      chapters: [{ title: "Intro" }],
    });
    const detail = queryClient.getQueryData<StudioTrackView>(
      studioKeys.track(true, "t1"),
    );
    expect(detail?.syncedLyrics).toEqual([{ ms: 500, text: "hello" }]);
    expect(detail?.chapters?.[0]?.title).toBe("Intro");
  });

  it("empties the analysis and resets the owner row on a new audio confirm", async () => {
    const { queryClient, wrapper } = setup(false, {
      hasAnalysis: true,
      loudnessLufs: -9.5,
      peakDb: -1.2,
    });
    expect(ownerRow(queryClient)).toMatchObject({
      hasAnalysis: true,
      loudnessLufs: -9.5,
    });
    rememberStreamAnalysis(queryClient, false, "t1", {
      waveformPeaks: [1],
      loudnessLufs: -10,
      peakDb: -2,
    });
    const { result } = renderHook(() => useConfirmStudioTrackAudio(), {
      wrapper,
    });
    await act(() =>
      result.current.mutateAsync({ trackId: "t1", releaseId: "r1", key: "k" }),
    );
    expect(
      queryClient.getQueryData(studioKeys.streamAnalysis(false, "t1")),
    ).toEqual({ waveformPeaks: null, loudnessLufs: null, peakDb: null });
    expect(ownerRow(queryClient)).toMatchObject({
      hasAnalysis: false,
      loudnessLufs: null,
      peakDb: null,
    });
  });
});

describe("price on a track PATCH", () => {
  it("patches the owner row's price and invalidates the offers", async () => {
    const { queryClient, wrapper } = setup(true);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    expect(ownerRow(queryClient, true)?.price).toBeNull();
    const { result } = renderHook(() => useUpdateStudioTrack(), { wrapper });
    await act(() =>
      result.current.mutateAsync({
        trackId: "t1",
        releaseId: "r1",
        body: { price: { mode: "fixed", amountCents: 150 } },
      }),
    );
    expect(ownerRow(queryClient, true)?.price).toEqual({
      mode: "fixed",
      amountCents: 150,
    });
    const keys = invalidate.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(studioKeys.offersAll(true));
    expect(keys).toContainEqual(["studio", "paymentMethods", true]);
  });

  it("takes the owner row off sale on null and leaves the offers alone without a price", async () => {
    const { queryClient, wrapper } = setup(true);
    const { result } = renderHook(() => useUpdateStudioTrack(), { wrapper });
    await act(() =>
      result.current.mutateAsync({
        trackId: "t1",
        releaseId: "r1",
        body: { price: { mode: "fixed", amountCents: 150 } },
      }),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await act(() =>
      result.current.mutateAsync({
        trackId: "t1",
        releaseId: "r1",
        body: { price: null },
      }),
    );
    expect(ownerRow(queryClient, true)?.price).toBeNull();
    invalidate.mockClear();
    await act(() =>
      result.current.mutateAsync({
        trackId: "t1",
        releaseId: "r1",
        body: { title: "Tide" },
      }),
    );
    const keys = invalidate.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).not.toContainEqual(studioKeys.offersAll(true));
    expect(keys).not.toContainEqual(["studio", "paymentMethods", true]);
  });
});
