import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { StudioReleaseView } from "../api/studio.adapters";
import type { StudioAnalysisOutcome } from "./analysis/analyseStudioAudio";
import { StudioRangeUnsupportedError } from "./analysis/studioByteSource";
import { useStudioAnalysisBackfill } from "./useStudioAnalysisBackfill";
import { useStudioUploadAnalysis } from "./useStudioUploadAnalysis";

const mocks = vi.hoisted(() => ({
  rows: [] as {
    localId: string;
    trackId: string | null;
    stage: string;
    fileName: string | null;
  }[],
  onFilesAccepted: null as
    | null
    | ((added: { localId: string; file: File; contentType: string }[]) => void),
  analyse:
    vi.fn<
      (options: { signal: AbortSignal }) => Promise<StudioAnalysisOutcome>
    >(),
  fetchStream: vi.fn((_demoMode: boolean, _trackId: string) =>
    Promise.resolve({ url: "https://audio.example/track" }),
  ),
  rangeSource: vi.fn(),
  update: vi.fn(() => Promise.resolve({})),
}));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("../useStudioTrackUploads", () => ({
  useStudioTrackUploads: (
    _releaseId: string | null,
    _subprofileId: string,
    _tracks: unknown[],
    options?: { onFilesAccepted?: typeof mocks.onFilesAccepted },
  ) => {
    mocks.onFilesAccepted = options?.onFilesAccepted ?? null;
    return { rows: mocks.rows, hasPendingUploads: false };
  },
}));
vi.mock("../api/studioStream", () => ({
  fetchStudioStream: (demoMode: boolean, trackId: string) =>
    mocks.fetchStream(demoMode, trackId),
}));
vi.mock("./analysis/studioByteSource", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./analysis/studioByteSource")>()),
  rangeByteSource: () => mocks.rangeSource() as unknown,
}));
vi.mock("./analysis/studioAudioSniff", () => ({
  sniffAudioKind: () => Promise.resolve("mp3"),
}));
vi.mock("./analysis/analyseStudioAudio", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./analysis/analyseStudioAudio")>()),
  analyseStudioAudio: (options: { signal: AbortSignal }) =>
    mocks.analyse(options),
}));
vi.mock("../api/useStudioTrackMutations", () => ({
  useUpdateStudioTrack: () => ({ mutateAsync: mocks.update }),
}));

const MEASURED: StudioAnalysisOutcome = {
  status: "measured",
  analysis: { waveformPeaks: [128], loudnessLufs: -14, peakDb: -1 },
};
const SOURCE = { size: 10, read: () => Promise.resolve(new ArrayBuffer(10)) };
const mp3 = new File([new Uint8Array(10)], "a.mp3", { type: "audio/mpeg" });

/** An owner release with two stored tracks that lack measurements. */
const RELEASE = {
  id: "r1",
  status: "published",
  ownerTracks: ["t1", "t2"].map((id) => ({
    id,
    hasAudio: true,
    hasAnalysis: false,
    durationSeconds: 180,
  })),
} as unknown as StudioReleaseView;

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const fetchedTrackIds = () =>
  mocks.fetchStream.mock.calls.map(([, trackId]) => trackId);

beforeEach(() => {
  mocks.rows = [];
  mocks.analyse.mockReset();
  mocks.fetchStream.mockClear();
  mocks.rangeSource.mockReset();
  mocks.update.mockReset();
  mocks.update.mockImplementation(() => Promise.resolve({}));
});

describe("useStudioAnalysisBackfill", () => {
  it("stops for the session when the server ignores byte ranges", async () => {
    mocks.rangeSource.mockRejectedValue(new StudioRangeUnsupportedError());
    const { result } = renderHook(
      () =>
        useStudioAnalysisBackfill({
          release: RELEASE,
          isEnabled: true,
          skipTrackIds: new Set(),
        }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.pendingCount).toBe(0));
    expect(fetchedTrackIds()).toEqual(["t1"]);
  });

  it("stops for the session when the PATCH is refused", async () => {
    mocks.rangeSource.mockResolvedValue(SOURCE);
    mocks.analyse.mockResolvedValue(MEASURED);
    mocks.update.mockRejectedValue(new ApiError(403, "Forbidden"));
    const { result } = renderHook(
      () =>
        useStudioAnalysisBackfill({
          release: RELEASE,
          isEnabled: true,
          skipTrackIds: new Set(),
        }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.pendingCount).toBe(0));
    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(fetchedTrackIds()).toEqual(["t1"]);
  });

  it("stays idle while an upload's analysis is pending", async () => {
    let finish: (outcome: StudioAnalysisOutcome) => void = () => undefined;
    mocks.analyse.mockImplementationOnce(
      () =>
        new Promise((settle) => {
          finish = settle;
        }),
    );
    mocks.rangeSource.mockResolvedValue(SOURCE);
    const startProps: { release: StudioReleaseView | null } = {
      release: null,
    };
    // The editor's wiring (StudioUploadMainCol): the backfill waits for the
    // uploads and for this session's measuring.
    const { result, rerender } = renderHook(
      ({ release }: { release: StudioReleaseView | null }) => {
        const { uploads, analysis } = useStudioUploadAnalysis("r1", "p1", []);
        const backfill = useStudioAnalysisBackfill({
          release,
          isEnabled: !uploads.hasPendingUploads && !analysis.hasPendingAnalysis,
          skipTrackIds: analysis.measuredTrackIds,
        });
        return { analysis, backfill };
      },
      { wrapper, initialProps: startProps },
    );
    mocks.rows = [
      { localId: "u1", trackId: null, stage: "queued", fileName: "a.mp3" },
    ];
    act(() =>
      mocks.onFilesAccepted?.([
        { localId: "u1", file: mp3, contentType: "audio/mpeg" },
      ]),
    );
    rerender({ release: RELEASE });
    expect(result.current.analysis.hasPendingAnalysis).toBe(true);
    expect(result.current.backfill.pendingCount).toBe(0);
    expect(mocks.fetchStream).not.toHaveBeenCalled();
    mocks.analyse.mockResolvedValue(MEASURED);
    await act(() => {
      finish({ status: "failed" });
      return Promise.resolve();
    });
    await waitFor(() => expect(fetchedTrackIds()).toContain("t1"));
  });
});
