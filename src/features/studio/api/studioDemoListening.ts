import { ApiError } from "../../../shared/api/client";
import { hashOfText, seededRandom } from "../studioSeededRandom";
import {
  STUDIO_LISTENING_LIMITS,
  type StudioChapter,
  type StudioStreamAnalysis,
  type StudioSyncedLyricLine,
  type UpdateStudioTrackBody,
} from "./studio.types";
import {
  areChaptersInsideAudio,
  listeningRuleFailureOf,
  normalizeChapters,
  normalizeSyncedLyrics,
  roundToTenth,
} from "./studioListeningRules";
import {
  DEMO_OWNER_RELEASES,
  DEMO_RELEASES,
  DEMO_TRACK_DETAILS,
} from "./studioDemo.data";
import {
  DEMO_LOUD_TRACK_ANALYSIS,
  DEMO_LOUD_TRACK_ID,
} from "./studioDemoListening.data";

/** What a demo PATCH stored for a track; a key that is absent was never
 *  written, so the fixture's value stands. */
export interface DemoListeningFields {
  waveformPeaks?: number[] | null;
  loudnessLufs?: number | null;
  peakDb?: number | null;
  syncedLyrics?: StudioSyncedLyricLine[] | null;
  chapters?: StudioChapter[] | null;
}

// In memory only, like the demo playlist store: a reload starts clean.
const demoListeningStore = new Map<string, DemoListeningFields>();

const FIXTURE_TRACK_IDS: ReadonlySet<string> = new Set(
  [...DEMO_RELEASES, ...DEMO_OWNER_RELEASES].flatMap((release) =>
    release.tracks.map((track) => track.id),
  ),
);

export function resetDemoListeningStore(): void {
  demoListeningStore.clear();
}

/** 200 peaks shaped like music (a swell, a dip, a close), seeded from the
 *  track id so every visit draws the same waveform. */
export function demoWaveformPeaks(trackId: string): number[] {
  const random = seededRandom(hashOfText(trackId));
  const count = STUDIO_LISTENING_LIMITS.waveformPeakCount;
  return Array.from({ length: count }, (_value, index) => {
    const position = index / (count - 1);
    const envelope =
      Math.min(1, position * 8, (1 - position) * 6) *
      (0.75 + 0.25 * Math.sin(position * Math.PI * 3));
    const level = 0.18 + 0.62 * envelope + 0.2 * random();
    return Math.round(
      Math.min(1, Math.max(0, level)) * STUDIO_LISTENING_LIMITS.waveformPeakMax,
    );
  });
}

/** Seeded loudness from -16.0 to -11.1 LUFS and a peak from -2.5 to -0.9
 *  dB; the one loud owner track reads -7.8 and -0.1. */
export function demoLoudness(
  trackId: string,
): Pick<StudioStreamAnalysis, "loudnessLufs" | "peakDb"> {
  if (trackId === DEMO_LOUD_TRACK_ID) return { ...DEMO_LOUD_TRACK_ANALYSIS };
  const hash = hashOfText(`${trackId}:loudness`);
  return {
    loudnessLufs: roundToTenth(-16 + (hash % 50) / 10),
    peakDb: roundToTenth(-2.5 + ((hash >>> 8) % 17) / 10),
  };
}

export function demoStoredListening(trackId: string): DemoListeningFields {
  return demoListeningStore.get(trackId) ?? {};
}

/** The stream's analysis: what a PATCH stored, else the seeded values. */
export function demoStreamAnalysis(trackId: string): StudioStreamAnalysis {
  const stored = demoStoredListening(trackId);
  const seeded = demoLoudness(trackId);
  return {
    waveformPeaks:
      stored.waveformPeaks === undefined
        ? demoWaveformPeaks(trackId)
        : stored.waveformPeaks,
    loudnessLufs:
      stored.loudnessLufs === undefined
        ? seeded.loudnessLufs
        : stored.loudnessLufs,
    peakDb: stored.peakDb === undefined ? seeded.peakDb : stored.peakDb,
  };
}

/** Owner rows' `hasAnalysis`: fixture tracks come measured; a track the demo
 *  member uploads is measured once a PATCH stores all three values. */
export function demoHasAnalysis(trackId: string): boolean {
  const stored = demoStoredListening(trackId);
  const hasStoredAll =
    stored.waveformPeaks != null &&
    stored.loudnessLufs != null &&
    stored.peakDb != null;
  const hasClearedAny =
    stored.waveformPeaks === null ||
    stored.loudnessLufs === null ||
    stored.peakDb === null;
  if (hasClearedAny) return false;
  return hasStoredAll || FIXTURE_TRACK_IDS.has(trackId);
}

function refusal(status: 400 | 422, field: string | null): ApiError {
  return status === 422
    ? new ApiError(422, "Chapters fall outside the audio", {
        statusCode: 422,
        code: "studio_chapters_out_of_range",
      })
    : new ApiError(400, "Validation failed", {
        statusCode: 400,
        message: [`${field ?? "body"} is invalid`],
        error: "Bad Request",
      });
}

/** The demo PATCH: the server's rules, then the store. Throws the server's
 *  errors (400, or 422 studio_chapters_out_of_range). */
export function demoApplyListeningPatch(
  track: { id: string; durationSeconds: number | null; hasAudio: boolean },
  body: UpdateStudioTrackBody,
): DemoListeningFields {
  const failure = listeningRuleFailureOf(body, track);
  if (failure?.kind === "chaptersOutOfRange") throw refusal(422, null);
  if (failure) throw refusal(400, failure.field);
  const next: DemoListeningFields = { ...demoStoredListening(track.id) };
  if (body.waveformPeaks !== undefined) next.waveformPeaks = body.waveformPeaks;
  if (body.loudnessLufs !== undefined)
    next.loudnessLufs =
      body.loudnessLufs === null ? null : roundToTenth(body.loudnessLufs);
  if (body.peakDb !== undefined)
    next.peakDb = body.peakDb === null ? null : roundToTenth(body.peakDb);
  if (body.syncedLyrics !== undefined)
    next.syncedLyrics =
      body.syncedLyrics === null
        ? null
        : normalizeSyncedLyrics(body.syncedLyrics);
  if (body.chapters !== undefined)
    next.chapters =
      body.chapters === null ? null : normalizeChapters(body.chapters);
  demoListeningStore.set(track.id, next);
  return next;
}

/** A new audio confirm: measurements cleared, synced lyrics kept, chapters
 *  kept only when every start is inside the new duration. Returns the
 *  chapters that remain (null when none). */
export function demoConfirmNewAudio(
  trackId: string,
  durationSeconds: number,
): StudioChapter[] | null {
  const stored = demoStoredListening(trackId);
  const chapters =
    stored.chapters !== undefined
      ? stored.chapters
      : (DEMO_TRACK_DETAILS[trackId]?.chapters ?? null);
  const keptChapters =
    chapters && areChaptersInsideAudio(chapters, durationSeconds, true)
      ? chapters
      : null;
  demoListeningStore.set(trackId, {
    ...stored,
    waveformPeaks: null,
    loudnessLufs: null,
    peakDb: null,
    chapters: keptChapters,
  });
  return keptChapters;
}
