import {
  STUDIO_LISTENING_LIMITS as LIMITS,
  type StudioChapter,
  type StudioChapterInput,
  type StudioSyncedLyricLine,
  type UpdateStudioTrackBody,
} from "./studio.types";

// The PATCH /studio/tracks/:id listening rules (contract A.5, as Plan 1
// built them). The demo applies them before it stores anything, and the
// upload editors may show them inline.

export type StudioListeningRuleFailure =
  { kind: "invalid"; field: string } | { kind: "chaptersOutOfRange" };

/** One decimal, as the server stores it; `+ 0` turns -0 into 0 so the demo
 *  never stores a negative zero. */
export function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10 + 0;
}

const isWithin = (value: number, minimum: number, maximum: number) =>
  Number.isFinite(value) && value >= minimum && value <= maximum;

export function isValidWaveformPeaks(peaks: unknown): peaks is number[] {
  return (
    Array.isArray(peaks) &&
    peaks.length === LIMITS.waveformPeakCount &&
    peaks.every(
      (peak) =>
        Number.isInteger(peak) &&
        isWithin(peak as number, 0, LIMITS.waveformPeakMax),
    )
  );
}

export function isValidSyncedLyrics(
  lines: unknown,
): lines is StudioSyncedLyricLine[] {
  if (!Array.isArray(lines)) return false;
  if (lines.length < 1 || lines.length > LIMITS.syncedLyricsMax) return false;
  let previousMs = 0;
  for (const line of lines as unknown[]) {
    if (typeof line !== "object" || line === null) return false;
    const { ms, text } = line as { ms?: unknown; text?: unknown };
    if (typeof ms !== "number" || !Number.isInteger(ms)) return false;
    if (!isWithin(ms, previousMs, LIMITS.syncedLyricMsMax)) return false;
    if (typeof text !== "string") return false;
    if (text.trim().length > LIMITS.syncedLyricTextMax) return false;
    previousMs = ms;
  }
  return true;
}

export function areChaptersWellFormed(
  chapters: unknown,
): chapters is StudioChapterInput[] {
  if (!Array.isArray(chapters)) return false;
  if (chapters.length < 1 || chapters.length > LIMITS.chaptersMax) return false;
  let previousStart = -1;
  for (const chapter of chapters as unknown[]) {
    if (typeof chapter !== "object" || chapter === null) return false;
    const { startSeconds, title, artist } = chapter as {
      startSeconds?: unknown;
      title?: unknown;
      artist?: unknown;
    };
    if (typeof startSeconds !== "number" || !Number.isInteger(startSeconds))
      return false;
    if (
      previousStart === -1 ? startSeconds !== 0 : startSeconds <= previousStart
    )
      return false;
    if (typeof title !== "string") return false;
    const titleLength = title.trim().length;
    if (titleLength < 1 || titleLength > LIMITS.chapterTitleMax) return false;
    if (artist !== undefined && artist !== null) {
      if (typeof artist !== "string") return false;
      if (artist.trim().length > LIMITS.chapterArtistMax) return false;
    }
    previousStart = startSeconds;
  }
  return true;
}

/** Chapters need confirmed audio, and every start sits inside it. */
export function areChaptersInsideAudio(
  chapters: readonly { startSeconds: number }[],
  durationSeconds: number | null,
  hasAudio: boolean,
): boolean {
  if (!hasAudio || durationSeconds === null) return false;
  return chapters.every((chapter) => chapter.startSeconds < durationSeconds);
}

export function normalizeSyncedLyrics(
  lines: StudioSyncedLyricLine[],
): StudioSyncedLyricLine[] {
  return lines.map((line) => ({ ms: line.ms, text: line.text.trim() }));
}

export function normalizeChapters(
  chapters: StudioChapterInput[],
): StudioChapter[] {
  return chapters.map((chapter) => {
    const artist = chapter.artist?.trim() ?? "";
    return {
      startSeconds: chapter.startSeconds,
      title: chapter.title.trim(),
      artist: artist.length > 0 ? artist : null,
    };
  });
}

function measurementFailure(
  body: UpdateStudioTrackBody,
): StudioListeningRuleFailure | null {
  if (body.waveformPeaks != null && !isValidWaveformPeaks(body.waveformPeaks))
    return { kind: "invalid", field: "waveformPeaks" };
  const { loudnessLufs, peakDb } = body;
  if (loudnessLufs === undefined && peakDb === undefined) return null;
  // A pair of numbers or a pair of nulls; anything else is one field alone.
  const isPairOfNulls = loudnessLufs === null && peakDb === null;
  const isPairOfNumbers =
    typeof loudnessLufs === "number" && typeof peakDb === "number";
  if (!isPairOfNulls && !isPairOfNumbers)
    return { kind: "invalid", field: "loudnessLufs" };
  if (!isPairOfNumbers) return null;
  if (
    !isWithin(
      roundToTenth(loudnessLufs),
      LIMITS.loudnessLufsMin,
      LIMITS.loudnessLufsMax,
    )
  )
    return { kind: "invalid", field: "loudnessLufs" };
  if (!isWithin(roundToTenth(peakDb), LIMITS.peakDbMin, LIMITS.peakDbMax))
    return { kind: "invalid", field: "peakDb" };
  return null;
}

/** The first rule a PATCH body breaks, in the server's order, or null. */
export function listeningRuleFailureOf(
  body: UpdateStudioTrackBody,
  track: { durationSeconds: number | null; hasAudio: boolean },
): StudioListeningRuleFailure | null {
  const measurement = measurementFailure(body);
  if (measurement) return measurement;
  if (body.syncedLyrics != null && !isValidSyncedLyrics(body.syncedLyrics))
    return { kind: "invalid", field: "syncedLyrics" };
  if (body.chapters != null) {
    if (!areChaptersWellFormed(body.chapters))
      return { kind: "invalid", field: "chapters" };
    if (
      !areChaptersInsideAudio(
        body.chapters,
        track.durationSeconds,
        track.hasAudio,
      )
    )
      return { kind: "chaptersOutOfRange" };
  }
  return null;
}
