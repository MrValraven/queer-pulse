import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { StudioAnalysisOutcome } from "./analysis/analyseStudioAudio";
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
  update: vi.fn(() => Promise.resolve({})),
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
  analysis: {
    waveformPeaks: Array.from({ length: 200 }, () => 128),
    loudnessLufs: -7.8,
    peakDb: -0.1,
  },
};
const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);
const mp3 = new File([new Uint8Array(10)], "a.mp3", { type: "audio/mpeg" });

beforeEach(() => {
  mocks.rows = [];
  mocks.analyse.mockReset();
  mocks.update.mockClear();
});

function renderAnalysis() {
  return renderHook(() => useStudioUploadAnalysis("r1", "p1", []), {
    wrapper,
  });
}

function accept(localId: string) {
  mocks.rows = [
    ...mocks.rows,
    { localId, trackId: null, stage: "queued", fileName: "a.mp3" },
  ];
  act(() =>
    mocks.onFilesAccepted?.([
      { localId, file: mp3, contentType: "audio/mpeg" },
    ]),
  );
}

describe("useStudioUploadAnalysis", () => {
  it("measures while uploading and PATCHes all three fields after the confirm", async () => {
    mocks.analyse.mockResolvedValue(MEASURED);
    const { result, rerender } = renderAnalysis();
    accept("u1");
    rerender();
    expect(result.current.analysis.statusOf("u1")).toBe("measuring");
    await waitFor(() =>
      expect(result.current.analysis.statusOf("u1")).toBe("measured"),
    );
    expect(mocks.update).not.toHaveBeenCalled();
    mocks.rows = [
      { localId: "u1", trackId: "t1", stage: "ready", fileName: "a.mp3" },
    ];
    rerender();
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith({
        trackId: "t1",
        releaseId: "r1",
        body: {
          waveformPeaks: expect.any(Array) as number[],
          loudnessLufs: -7.8,
          peakDb: -0.1,
        },
      }),
    );
    rerender();
    expect(mocks.update).toHaveBeenCalledTimes(1);
  });

  it("never PATCHes a removed row's numbers", async () => {
    let finish: (outcome: StudioAnalysisOutcome) => void = () => undefined;
    let signal: AbortSignal | null = null;
    mocks.analyse.mockImplementation((options: { signal: AbortSignal }) => {
      signal = options.signal;
      return new Promise((settle) => {
        finish = settle;
      });
    });
    const { result, rerender } = renderAnalysis();
    accept("u1");
    rerender();
    await waitFor(() => expect(mocks.analyse).toHaveBeenCalled());
    mocks.rows = [];
    rerender();
    await waitFor(() => expect(signal?.aborted).toBe(true));
    await act(() => {
      finish(MEASURED);
      return Promise.resolve();
    });
    expect(result.current.analysis.statusOf("u1")).toBeNull();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("leaves the fields empty when the analysis fails", async () => {
    mocks.analyse.mockResolvedValue({ status: "failed" });
    const { result, rerender } = renderAnalysis();
    accept("u1");
    rerender();
    await waitFor(() =>
      expect(result.current.analysis.statusOf("u1")).toBe("failed"),
    );
    mocks.rows = [
      { localId: "u1", trackId: "t1", stage: "ready", fileName: "a.mp3" },
    ];
    rerender();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(result.current.analysis.fileOf("u1")).toBe(mp3);
  });

  it("keeps a file waiting behind another one queued, then measures it", async () => {
    let finish: (outcome: StudioAnalysisOutcome) => void = () => undefined;
    mocks.analyse.mockImplementationOnce(
      () =>
        new Promise((settle) => {
          finish = settle;
        }),
    );
    const { result, rerender } = renderAnalysis();
    accept("u1");
    accept("u2");
    rerender();
    expect(result.current.analysis.statusOf("u1")).toBe("measuring");
    expect(result.current.analysis.statusOf("u2")).toBe("queued");
    expect(result.current.analysis.hasPendingAnalysis).toBe(true);
    mocks.analyse.mockResolvedValue({ status: "failed" });
    await act(() => {
      finish({ status: "failed" });
      return Promise.resolve();
    });
    await waitFor(() =>
      expect(result.current.analysis.hasPendingAnalysis).toBe(false),
    );
    expect(mocks.analyse).toHaveBeenCalledTimes(2);
  });
});
