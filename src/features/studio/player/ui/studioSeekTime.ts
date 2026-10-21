import type { StudioChapterView } from "../../api/studio.adapters";
import type { StudioBufferedRange } from "../studioPlayerContext";
import { activeIndexAt } from "../studioTimeline";
import type { StudioRangeFractionSpan } from "./range/studioRange.types";

/** Shown in both time labels while the track's length is not known. */
export const UNKNOWN_TIME_LABEL = "--:--";

/** The chapter playing at `seconds`, or null for a track without chapters. */
export function chapterAt(
  chapters: readonly StudioChapterView[] | null,
  seconds: number,
): StudioChapterView | null {
  if (!chapters || chapters.length === 0) return null;
  const index = activeIndexAt(
    chapters.map((chapter) => chapter.startSeconds),
    seconds,
  );
  return index === null ? null : (chapters[index] ?? null);
}

function clampFraction(fraction: number): number {
  return Math.min(1, Math.max(0, fraction));
}

/** Loaded spans in seconds as fractions of the track, empty spans dropped. */
export function toFractionSpans(
  ranges: readonly StudioBufferedRange[],
  duration: number,
): StudioRangeFractionSpan[] {
  if (!(duration > 0)) return [];
  return ranges
    .map((range) => ({
      startFraction: clampFraction(range.startSeconds / duration),
      endFraction: clampFraction(range.endSeconds / duration),
    }))
    .filter((span) => span.endFraction > span.startFraction);
}

/** Characters each time label reserves, so the bar keeps its width as the
 *  time ticks. Four fit "0:00"; longer labels reserve their own length. */
export function reservedTimeChars(longestLabel: string): number {
  return Math.max(4, longestLabel.length);
}
