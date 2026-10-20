import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { DEMO_RELEASES, DEMO_OWNER_RELEASES } from "./studioDemo.data";
import {
  DEMO_LOUD_TRACK_ID,
  DEMO_MIX_TRACK_ID,
} from "./studioDemoListening.data";
import {
  demoApplyListeningPatch,
  demoConfirmNewAudio,
  demoGaplessAfterTrackId,
  demoHasAnalysis,
  demoStoredListening,
  demoStreamAnalysis,
  demoWaveformPeaks,
  resetDemoListeningStore,
} from "./studioDemoListening";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";

beforeEach(() => resetDemoListeningStore());

const fixtureTracks = [...DEMO_RELEASES, ...DEMO_OWNER_RELEASES].flatMap(
  (release) => release.tracks.map((track) => ({ track, release })),
);

describe("demo stream analysis", () => {
  it("seeds 200 integer peaks per track id, the same every time", () => {
    const peaks = demoWaveformPeaks("demo-track-home-2-01");
    expect(peaks).toHaveLength(200);
    expect(
      peaks.every((peak) => Number.isInteger(peak) && peak >= 0 && peak <= 255),
    ).toBe(true);
    expect(demoWaveformPeaks("demo-track-home-2-01")).toEqual(peaks);
    expect(demoWaveformPeaks("demo-track-home-1-01")).not.toEqual(peaks);
  });

  it("gives every fixture track loudness, and exactly one owner track is loud", () => {
    const loud = fixtureTracks.filter(({ track }) => {
      const analysis = demoStreamAnalysis(track.id);
      expect(analysis.loudnessLufs).not.toBeNull();
      expect(analysis.peakDb).not.toBeNull();
      return (
        (analysis.loudnessLufs ?? -99) > -9 || (analysis.peakDb ?? -99) > -0.3
      );
    });
    expect(loud.map(({ track }) => track.id)).toEqual([DEMO_LOUD_TRACK_ID]);
    expect(loud[0]?.release.artist.id).toBe(DEMO_ARTIST_MARIANA.id);
    expect(demoStreamAnalysis(DEMO_LOUD_TRACK_ID)).toMatchObject({
      loudnessLufs: -7.8,
      peakDb: -0.1,
    });
  });
});

describe("demo listening PATCH", () => {
  const audio = {
    id: DEMO_MIX_TRACK_ID,
    durationSeconds: 3852,
    hasAudio: true,
  };

  it("stores rounded measurements and the stream reads them back", () => {
    const peaks = Array.from({ length: 200 }, () => 7);
    demoApplyListeningPatch(audio, {
      waveformPeaks: peaks,
      loudnessLufs: -12.34,
      peakDb: -1.06,
    });
    expect(demoStreamAnalysis(audio.id)).toEqual({
      waveformPeaks: peaks,
      loudnessLufs: -12.3,
      peakDb: -1.1,
    });
    expect(demoHasAnalysis(audio.id)).toBe(true);
  });

  it("answers 422 studio_chapters_out_of_range for a start past the end", () => {
    const attempt = () =>
      demoApplyListeningPatch(audio, {
        chapters: [
          { startSeconds: 0, title: "A" },
          { startSeconds: 3852, title: "B" },
        ],
      });
    expect(attempt).toThrow(ApiError);
    try {
      attempt();
    } catch (error) {
      expect((error as ApiError).status).toBe(422);
      expect((error as ApiError).data).toMatchObject({
        code: "studio_chapters_out_of_range",
      });
    }
  });

  it("answers 400 for a lone loudness value", () => {
    try {
      demoApplyListeningPatch(audio, { loudnessLufs: -9 });
      expect.unreachable();
    } catch (error) {
      expect((error as ApiError).status).toBe(400);
    }
  });

  it("clears measurements on new audio, keeps lyrics and the chapters that still fit", () => {
    demoApplyListeningPatch(audio, {
      loudnessLufs: -10,
      peakDb: -1,
      syncedLyrics: [{ ms: 0, text: "a" }],
      chapters: [
        { startSeconds: 0, title: "A" },
        { startSeconds: 100, title: "B" },
      ],
    });
    const keptShort = demoConfirmNewAudio(audio.id, 50);
    expect(keptShort).toBeNull();
    expect(demoStoredListening(audio.id)).toMatchObject({
      waveformPeaks: null,
      loudnessLufs: null,
      peakDb: null,
      syncedLyrics: [{ ms: 0, text: "a" }],
      chapters: null,
    });
    expect(demoHasAnalysis(audio.id)).toBe(false);
  });
});

describe("demo gapless link", () => {
  it("seeds Devoção alone as a release that plays without gaps", () => {
    const gapless = [...DEMO_RELEASES, ...DEMO_OWNER_RELEASES].filter(
      (release) => release.isGapless,
    );
    expect(gapless.map((release) => release.title)).toEqual(["Devoção"]);
  });

  it("names the nearest earlier track on Devoção, none for its first", () => {
    expect(demoGaplessAfterTrackId("demo-track-mariana-3-01")).toBeNull();
    expect(demoGaplessAfterTrackId("demo-track-mariana-3-02")).toBe(
      "demo-track-mariana-3-01",
    );
  });

  it("skips the withheld second track of Devoção, as the server does", () => {
    // Track 2 is held offline by claims, so a listener's queue runs 1 then 3.
    expect(demoGaplessAfterTrackId("demo-track-mariana-3-03")).toBe(
      "demo-track-mariana-3-01",
    );
  });

  it("answers null for a release with gaps and for an unknown track", () => {
    expect(demoGaplessAfterTrackId("demo-track-mariana-2-02")).toBeNull();
    expect(demoGaplessAfterTrackId("demo-track-unknown-01")).toBeNull();
  });
});
