import { QueryClient, QueryObserver, skipToken } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { studioKeys } from "./studioQueryKeys";
import {
  fetchStudioStream,
  forgetStreamAnalysis,
  rememberStreamAnalysis,
  streamAnalysisOf,
} from "./studioStream";

const { getStudioPreviewStream, getStudioStream } = vi.hoisted(() => ({
  getStudioPreviewStream: vi.fn(),
  getStudioStream: vi.fn(),
}));
vi.mock("./studioArtistTools.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./studioArtistTools.api")>()),
  getStudioPreviewStream,
}));
vi.mock("./studio.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./studio.api")>()),
  getStudioStream,
}));

describe("fetchStudioStream in demo", () => {
  it("answers an empty URL with the track's seeded analysis", async () => {
    const stream = await fetchStudioStream(true, "demo-track-home-2-01");
    expect(stream.url).toBe("");
    expect(stream.waveformPeaks).toHaveLength(200);
    expect(typeof stream.loudnessLufs).toBe("number");
    expect(typeof stream.peakDb).toBe("number");
    expect(Date.parse(stream.expiresAt)).toBeGreaterThan(Date.now());
  });

  it("ignores a preview token", async () => {
    getStudioPreviewStream.mockClear();
    const stream = await fetchStudioStream(
      true,
      "demo-track-home-2-01",
      "a".repeat(64),
    );
    expect(stream.url).toBe("");
    expect(getStudioPreviewStream).not.toHaveBeenCalled();
  });
});

describe("fetchStudioStream through a preview link", () => {
  it("reads the preview route and fills missing analysis with null", async () => {
    getStudioPreviewStream.mockReset();
    getStudioStream.mockReset();
    getStudioPreviewStream.mockResolvedValueOnce({
      url: "https://bucket.example/preview",
      expiresAt: "2026-10-13T10:00:00.000Z",
    });
    const token = "b".repeat(64);
    const stream = await fetchStudioStream(false, "t1", token);
    expect(getStudioPreviewStream).toHaveBeenCalledWith(token, "t1");
    expect(getStudioStream).not.toHaveBeenCalled();
    expect(stream).toEqual({
      url: "https://bucket.example/preview",
      expiresAt: "2026-10-13T10:00:00.000Z",
      waveformPeaks: null,
      loudnessLufs: null,
      peakDb: null,
    });
  });

  it("keeps the analysis the preview route sends", async () => {
    getStudioPreviewStream.mockReset();
    getStudioPreviewStream.mockResolvedValueOnce({
      url: "https://bucket.example/preview",
      expiresAt: "2026-10-13T10:00:00.000Z",
      waveformPeaks: [3, 4],
      loudnessLufs: -8.2,
      peakDb: -0.4,
    });
    const stream = await fetchStudioStream(false, "t1", "c".repeat(64));
    expect(stream).toMatchObject({
      waveformPeaks: [3, 4],
      loudnessLufs: -8.2,
      peakDb: -0.4,
    });
  });

  it("reads the track route when no token is given", async () => {
    getStudioPreviewStream.mockReset();
    getStudioStream.mockReset();
    getStudioStream.mockResolvedValueOnce({
      url: "https://bucket.example/track",
      expiresAt: "2026-10-13T10:00:00.000Z",
      waveformPeaks: null,
      loudnessLufs: null,
      peakDb: null,
    });
    const stream = await fetchStudioStream(false, "t1");
    expect(getStudioStream).toHaveBeenCalledWith("t1");
    expect(getStudioPreviewStream).not.toHaveBeenCalled();
    expect(stream.url).toBe("https://bucket.example/track");
  });

  it("reads an older track route without analysis as null fields", async () => {
    getStudioStream.mockReset();
    getStudioStream.mockResolvedValueOnce({
      url: "https://bucket.example/track",
      expiresAt: "2026-10-13T10:00:00.000Z",
    });
    const stream = await fetchStudioStream(false, "t1");
    expect(stream).toEqual({
      url: "https://bucket.example/track",
      expiresAt: "2026-10-13T10:00:00.000Z",
      waveformPeaks: null,
      loudnessLufs: null,
      peakDb: null,
    });
  });
});

describe("stream analysis cache", () => {
  it("keeps the analysis and leaves the signed URL out", () => {
    const queryClient = new QueryClient();
    const analysis = streamAnalysisOf({
      url: "https://bucket.example/signed?token=secret",
      expiresAt: "2026-10-13T10:00:00.000Z",
      waveformPeaks: [1, 2],
      loudnessLufs: -9,
      peakDb: -1,
    });
    rememberStreamAnalysis(queryClient, false, "t1", analysis);
    const cached = queryClient.getQueryData(
      studioKeys.streamAnalysis(false, "t1"),
    );
    expect(cached).toEqual({
      waveformPeaks: [1, 2],
      loudnessLufs: -9,
      peakDb: -1,
    });
    expect(JSON.stringify(cached)).not.toContain("secret");
    forgetStreamAnalysis(queryClient, false, "t1");
    expect(
      queryClient.getQueryData(studioKeys.streamAnalysis(false, "t1")),
    ).toEqual({ waveformPeaks: null, loudnessLufs: null, peakDb: null });
  });

  it("tells a player already watching the key that the analysis emptied", () => {
    const queryClient = new QueryClient();
    rememberStreamAnalysis(queryClient, false, "t1", {
      waveformPeaks: [7],
      loudnessLufs: -8,
      peakDb: -1,
    });
    const observer = new QueryObserver(queryClient, {
      queryKey: studioKeys.streamAnalysis(false, "t1"),
      queryFn: skipToken,
    });
    const seen: unknown[] = [];
    const unsubscribe = observer.subscribe((result) => seen.push(result.data));
    forgetStreamAnalysis(queryClient, false, "t1");
    expect(seen.at(-1)).toEqual({
      waveformPeaks: null,
      loudnessLufs: null,
      peakDb: null,
    });
    rememberStreamAnalysis(queryClient, false, "t1", {
      waveformPeaks: [3],
      loudnessLufs: -9,
      peakDb: -2,
    });
    expect(observer.getCurrentResult().data).toEqual({
      waveformPeaks: [3],
      loudnessLufs: -9,
      peakDb: -2,
    });
    unsubscribe();
  });

  it("reads a stream that predates analysis as empty", () => {
    expect(streamAnalysisOf({ url: "", expiresAt: "" } as never)).toEqual({
      waveformPeaks: null,
      loudnessLufs: null,
      peakDb: null,
    });
  });
});
