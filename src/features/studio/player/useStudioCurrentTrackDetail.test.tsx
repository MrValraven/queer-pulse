import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { DEMO_MIX_TRACK_ID } from "../api/studioDemoListening.data";
import { DEMO_DEFAULT_TRACK_ID } from "../api/studioDemoMe.data";
import {
  EMPTY_STREAM_ANALYSIS,
  rememberStreamAnalysis,
} from "../api/studioStream";
import { studioKeys } from "../api/studioQueryKeys";
import {
  studioClockIndexes,
  useStudioCurrentTrackDetail,
} from "./useStudioCurrentTrackDetail";

const demoTrackFetches = vi.hoisted(() => ({ count: 0 }));
vi.mock("../api/studioDemoApi", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../api/studioDemoApi")>();
  return {
    ...original,
    demoStudioTrack: (...args: Parameters<typeof original.demoStudioTrack>) => {
      demoTrackFetches.count += 1;
      return original.demoStudioTrack(...args);
    },
  };
});
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));
vi.mock("../api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    hasAccess: true,
    isPending: false,
    status: "granted",
    uploadablePersonas: [],
  }),
}));

function setup(trackId: string | null) {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(
    ({ id }: { id: string | null }) => useStudioCurrentTrackDetail(id),
    { wrapper, initialProps: { id: trackId } },
  );
  return { hook, queryClient };
}

describe("useStudioCurrentTrackDetail", () => {
  it("reads the synced lyrics of the track that plays", async () => {
    const { hook } = setup(DEMO_DEFAULT_TRACK_ID);
    await waitFor(() =>
      expect(hook.result.current.syncedLyrics).not.toBeNull(),
    );
    expect(hook.result.current.lyricStartsSeconds[0]).toBe(12);
    expect(hook.result.current.chapters).toBeNull();
  });

  it("reads a mix's chapters", async () => {
    const { hook } = setup(DEMO_MIX_TRACK_ID);
    await waitFor(() => expect(hook.result.current.chapters).toHaveLength(8));
    expect(hook.result.current.chapterStartsSeconds.slice(0, 2)).toEqual([
      0, 372,
    ]);
  });

  it("shows the waveform the player last read for this track", () => {
    const { hook, queryClient } = setup(DEMO_MIX_TRACK_ID);
    expect(hook.result.current.waveform).toBeNull();
    act(() =>
      rememberStreamAnalysis(queryClient, true, DEMO_MIX_TRACK_ID, {
        waveformPeaks: [0, 255],
        loudnessLufs: -14,
        peakDb: -2,
      }),
    );
    expect(hook.result.current.waveform).toEqual([0, 1]);
  });

  it("reads an emptied analysis as no waveform until a new one arrives", () => {
    const { hook, queryClient } = setup(DEMO_MIX_TRACK_ID);
    act(() =>
      rememberStreamAnalysis(queryClient, true, DEMO_MIX_TRACK_ID, {
        waveformPeaks: [0, 255],
        loudnessLufs: -14,
        peakDb: -2,
      }),
    );
    act(() =>
      rememberStreamAnalysis(queryClient, true, DEMO_MIX_TRACK_ID, {
        ...EMPTY_STREAM_ANALYSIS,
      }),
    );
    expect(hook.result.current.waveform).toBeNull();
    act(() =>
      rememberStreamAnalysis(queryClient, true, DEMO_MIX_TRACK_ID, {
        waveformPeaks: [255],
        loudnessLufs: -9,
        peakDb: -1,
      }),
    );
    expect(hook.result.current.waveform).toEqual([1]);
  });

  it("skips the detail read for a preview item and still shows its waveform", async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    demoTrackFetches.count = 0;
    const hook = renderHook(
      () => useStudioCurrentTrackDetail(DEMO_MIX_TRACK_ID, false),
      { wrapper },
    );
    expect(
      queryClient.getQueryState(studioKeys.track(true, DEMO_MIX_TRACK_ID))
        ?.fetchStatus,
    ).toBe("idle");
    act(() =>
      rememberStreamAnalysis(queryClient, true, DEMO_MIX_TRACK_ID, {
        waveformPeaks: [0, 255],
        loudnessLufs: -14,
        peakDb: -2,
      }),
    );
    expect(hook.result.current.waveform).toEqual([0, 1]);
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
    expect(demoTrackFetches.count).toBe(0);
    expect(hook.result.current.chapters).toBeNull();
  });

  it("has nothing while nothing plays", () => {
    const { hook } = setup(null);
    expect(hook.result.current).toMatchObject({
      chapters: null,
      syncedLyrics: null,
      waveform: null,
    });
  });
});

describe("studioClockIndexes", () => {
  it("finds the current chapter and line", () => {
    expect(
      studioClockIndexes(400, {
        chapterStartsSeconds: [0, 372, 845],
        lyricStartsSeconds: [],
      }),
    ).toEqual({ currentChapterIndex: 1, currentLyricIndex: null });
    expect(
      studioClockIndexes(13, {
        chapterStartsSeconds: [],
        lyricStartsSeconds: [12, 19.5],
      }),
    ).toEqual({ currentChapterIndex: null, currentLyricIndex: 0 });
  });
});
